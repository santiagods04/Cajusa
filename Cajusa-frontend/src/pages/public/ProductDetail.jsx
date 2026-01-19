import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState, useContext } from "react";
import AppContext from "../../context/AppContext";
import { openWhatsApp } from "../../utils/whatsapp";

export default function ProductDetail() {
  const { id } = useParams();
  const { getProductByIdRaw, getProductsRaw } = useContext(AppContext);

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Selección (NO va dentro de product)
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  // Slider
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Relacionados (opcional)
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!id || typeof getProductByIdRaw !== "function") return;

    setIsLoading(true);
    setError("");

    getProductByIdRaw(id)
      .then((data) => {
        if (!data) throw new Error("Producto no encontrado");

        const mapped = {
          ...data,
          id: data._id ?? data.id,
          variants: Array.isArray(data.variants)
            ? data.variants.map((v) => ({
                ...v,
                available:
                  typeof v.available === "boolean"
                    ? v.available
                    : Number(v.quantity || 0) > 0,
              }))
            : [],
        };

        setProduct(mapped);

        // ✅ importantísimo: al cambiar de producto, resetea selección
        setSize("");
        setColor("");
        setActiveIndex(0);
      })
      .catch((e) => {
        setError(e?.message || "Producto no encontrado");
        setProduct(null);
      })
      .finally(() => setIsLoading(false));
  }, [id, getProductByIdRaw]);

  // Normaliza imágenes: soporta strings o {url}/{src}
  const images = useMemo(() => {
    const raw = product?.images;

    if (Array.isArray(raw) && raw.length) {
      return raw
        .map((it) => {
          if (typeof it === "string") return it;
          return it?.url || it?.src || "";
        })
        .filter(Boolean);
    }

    const single = product?.image || product?.img || product?.photo || "";
    return single ? [single] : [];
  }, [product]);

  // Corrige index si cambian imágenes
  useEffect(() => {
    if (!images.length) return;
    setActiveIndex((prev) => Math.min(prev, images.length - 1));
  }, [images.length]);

  const activeImg = images[activeIndex] || "";
  const hasManyImages = images.length > 1;

  const goPrev = () => {
    if (!images.length) return;
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  };

  const goNext = () => {
    if (!images.length) return;
    setActiveIndex((i) => (i + 1) % images.length);
  };

  // ESC para cerrar modal
  useEffect(() => {
    if (!isZoomOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsZoomOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isZoomOpen, images.length]);

  // Variantes (tallas/colores) - si quieres solo disponibles, filtra por v.available
  const sizes = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.size))].filter(Boolean);
  }, [product]);

  const colors = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.color))].filter(Boolean);
  }, [product]);

  // WhatsApp
  const needsVariant =
    Array.isArray(product?.variants) && product.variants.length > 0;

  // ✅ AQUÍ estaba el bug: estabas mirando product.size/product.color
  const canBuy = !needsVariant || (size && color);

  const lineLabel =
    String(product?.line || "").toLowerCase() === "antifluido"
      ? "Antifluido"
      : "Lino";
  
  const priceLabel =
  typeof product?.price === "number"
    ? `$${product.price.toLocaleString("es-CO")}`
    : product?.price
      ? `$${Number(product.price).toLocaleString("es-CO")}`
      : "--";

  const SPARK = "\u2728";
  const OK = "\u2705";

  const waText =
    `Hola! ${SPARK} Me interesa este producto:\n\n` +
    `• Producto: ${product?.name}\n` +
    `• Precio: ${priceLabel}\n` +
    `• Línea: ${lineLabel}\n` +
    `• Categoría: ${product?.category}\n` +
    `• Talla: ${size || "--"}\n` +
    `• Color: ${color || "--"}\n\n` +
    `¿Me confirmas disponibilidad y tiempo de entrega? Gracias ${OK}`;

  function handleWhatsApp() {
    if (!canBuy) {
      alert("Selecciona talla y color para enviar el mensaje por WhatsApp.");
      return;
    }
    openWhatsApp(waText);
  }

  // Relacionados (100% back) usando getProductsRaw si existe en contexto
  useEffect(() => {
    setRelated([]);

    if (!product) return;
    if (typeof getProductsRaw !== "function") return;

    // trae por misma linea/categoría para no traer TODO
    const params = {
      page: 1,
      limit: 20,
      sort: "-createdAt",
    };
    if (product.line) params.line = product.line;
    if (product.category) params.category = product.category;

    getProductsRaw(params)
      .then((list) => {
        const pid = String(product.id || product._id || id);

        const filtered = (Array.isArray(list) ? list : [])
          .filter((p) => String(p.id || p._id) !== pid)
          .slice(0, 8);

        setRelated(filtered);
      })
      .catch(() => setRelated([]));
  }, [product, id, getProductsRaw]);

  if (error) return <div className="state container">Error: {error}</div>;
  if (isLoading || !product)
    return <div className="state container">Cargando...</div>;

  return (
    <div className="container">
      <Link className="link product__back" to="/catalog">
        ← Volver al catálogo
      </Link>

      <div className="product__top">
        {/* IZQUIERDA: Galería */}
        <section className="product__media">
          <div className="product__thumbs" aria-label="Miniaturas del producto">
            {images.length ? (
              images.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  className={`product__thumbBtn ${
                    idx === activeIndex ? "product__thumbBtn--active" : ""
                  }`}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Ver imagen ${idx + 1}`}
                >
                  <img
                    className="product__thumbImg"
                    src={src}
                    alt={`${product.name} miniatura ${idx + 1}`}
                    loading="lazy"
                  />
                </button>
              ))
            ) : (
              <div className="product__noThumbs">Sin imágenes</div>
            )}
          </div>

          <div className="product__main product__mainFrame">
            <button
              type="button"
              className="product__mainBtn"
              onClick={() => images.length && setIsZoomOpen(true)}
              aria-label="Abrir imagen en grande"
              disabled={!images.length}
            >
              {images.length ? (
                <img
                  className="product__mainImg"
                  src={activeImg}
                  alt={product.name}
                />
              ) : (
                <div className="product__noMain">Sin imágenes</div>
              )}
            </button>

            {hasManyImages && (
              <>
                <button
                  type="button"
                  className="product__navBtn product__navBtn--left"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  aria-label="Imagen anterior"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="product__navBtn product__navBtn--right"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  aria-label="Imagen siguiente"
                >
                  ›
                </button>

                <div
                  className="product__counter"
                  aria-label="Contador de imágenes"
                >
                  {activeIndex + 1}/{images.length}
                </div>
              </>
            )}
          </div>
        </section>

        {/* DERECHA: Compra */}
        <section className="product__info">
          <h1 className="page__title">{product.name}</h1>

          {product.price != null && (
            <p className="product__price">
              ${Number(product.price).toLocaleString("es-CO")}
            </p>
          )}

          <div className="product__controls">
            <label className="product__field">
              <span>Talla</span>
              <select
                className="product__select"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                disabled={!sizes.length}
              >
                <option value="">Selecciona</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="product__field">
              <span>Color</span>
              <select
                className="product__select"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={!colors.length}
              >
                <option value="">Selecciona</option>
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <div className="product__cta">
              <button className="btn btn--active" type="button" onClick={handleWhatsApp}>
                Comprar por WhatsApp
              </button>

              <p className="product__selected">
                Seleccionado: <strong>{size || "--"}</strong> /{" "}
                <strong>{color || "--"}</strong>
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Descripción */}
      <section className="product__desc">
        <h2 className="section__title">Descripción</h2>
        <p className="page__subtitle">{product.description}</p>
      </section>

      {/* Productos relacionados */}
      <section className="product__related">
        <h2 className="section__title">Productos relacionados</h2>

        {related.length ? (
          <div className="product__relatedGrid">
            {related.map((p) => {
              const rid = p.id || p._id;
              const to = `/product/${rid}`;

              const rImg =
                (Array.isArray(p.images) &&
                  (typeof p.images[0] === "string"
                    ? p.images[0]
                    : p.images[0]?.url)) ||
                p.image ||
                p.img ||
                "";

              return (
                <Link key={rid} className="product__relatedCard" to={to}>
                  <div className="product__relatedImgWrap">
                    {rImg ? (
                      <img
                        className="product__relatedImg"
                        src={rImg}
                        alt={p.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="product__relatedNoImg">Sin imagen</div>
                    )}
                  </div>
                  <div className="product__relatedBody">
                    <div className="product__relatedName">{p.name}</div>
                    {p.price != null && (
                      <div className="product__relatedPrice">
                        ${Number(p.price).toLocaleString("es-CO")}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="product__relatedEmpty">
            Aún no hay relacionados para mostrar.
          </p>
        )}
      </section>

      {/* Modal zoom */}
      {isZoomOpen && (
        <div
          className="product__modalOverlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsZoomOpen(false)}
        >
          <div className="product__modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="product__modalClose"
              onClick={() => setIsZoomOpen(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>

            <button
              type="button"
              className="product__modalNav product__modalNav--left"
              onClick={goPrev}
              aria-label="Anterior"
              disabled={!hasManyImages}
            >
              ‹
            </button>

            <div className="product__modalFrame">
              <img
                className="product__modalImg"
                src={activeImg}
                alt={`${product.name} en grande`}
              />
            </div>

            <button
              type="button"
              className="product__modalNav product__modalNav--right"
              onClick={goNext}
              aria-label="Siguiente"
              disabled={!hasManyImages}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

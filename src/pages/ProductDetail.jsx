import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getProductById, getProducts } from "../services/productsService";
import { openWhatsApp } from "../utils/whatsapp";

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState("");

  // Slider
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Relacionados (opcional)
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setError("");
    setProduct(null);
    setSize("");
    setColor("");
    setActiveIndex(0);
    setIsZoomOpen(false);

    getProductById(id)
      .then(setProduct)
      .catch((e) => setError(e?.message || "Error cargando producto"));
  }, [id]);

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

    // fallbacks por si tu backend usa otro campo
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

  // Variantes (tallas/colores)
  const sizes = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.size))].filter(Boolean);
  }, [product]);

  const colors = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.color))].filter(Boolean);
  }, [product]);

  // WhatsApp
  const needsVariant = Array.isArray(product?.variants) && product.variants.length > 0;
  const canBuy = !needsVariant || (size && color);
  const lineLabel = product?.line === "antifluido" ? "Antifluido" : "Lino";

  const SPARK = "\u2728";
  const OK = "\u2705";

  const waText =
    `Hola! ${SPARK} Me interesa este producto:\n\n` +
    `• Producto: ${product?.name}\n` +
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

  // Relacionados: intenta traer lista completa y filtra por categoria/linea
  useEffect(() => {
    setRelated([]);

    if (!product) return;
    if (typeof getProducts !== "function") return; // por si no existe aún

    getProducts()
      .then((list) => {
        const pid = String(product.id || product._id || id);

        const filtered = (Array.isArray(list) ? list : [])
          .filter((p) => String(p.id || p._id) !== pid)
          .filter((p) => p.category === product.category || p.line === product.line)
          .slice(0, 8);

        setRelated(filtered);
      })
      .catch(() => setRelated([]));
  }, [product, id]);

  if (error) return <div className="state container">Error: {error}</div>;
  if (!product) return <div className="state container">Cargando...</div>;

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
                  className={`product__thumbBtn ${idx === activeIndex ? "product__thumbBtn--active" : ""}`}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Ver imagen ${idx + 1}`}
                >
                  <img className="product__thumbImg" src={src} alt={`${product.name} miniatura ${idx + 1}`} loading="lazy" />
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
                <img className="product__mainImg" src={activeImg} alt={product.name} />
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

                <div className="product__counter" aria-label="Contador de imágenes">
                  {activeIndex + 1}/{images.length}
                </div>
              </>
            )}
          </div>
        </section>

        {/* DERECHA: Compra */}
        <section className="product__info">
          <h1 className="page__title">{product.name}</h1>

          {/* Precio (si existe) */}
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
              <button
                className="btn btn--active"
                type="button"
                onClick={handleWhatsApp}
              >
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

              // Ajusta si tu ruta es distinta:
              const to = `/producto/${rid}`;

              const rImg =
                (Array.isArray(p.images) && (typeof p.images[0] === "string" ? p.images[0] : p.images[0]?.url)) ||
                p.image ||
                p.img ||
                "";

              return (
                <Link key={rid} className="product__relatedCard" to={to}>
                  <div className="product__relatedImgWrap">
                    {rImg ? (
                      <img className="product__relatedImg" src={rImg} alt={p.name} loading="lazy" />
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
          <p className="product__relatedEmpty">Aún no hay relacionados para mostrar.</p>
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
              <img className="product__modalImg" src={activeImg} alt={`${product.name} en grande`} />
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

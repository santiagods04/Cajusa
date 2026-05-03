import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState, useContext } from "react";
import AppContext from "../../context/AppContext";
import { openWhatsApp } from "../../utils/whatsapp";

export default function ProductDetail() {
  const { id } = useParams();
  const { getProductByIdRaw, getProductsRaw, openImagePopup } = useContext(AppContext);

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [size, setSize] = useState("");
  const [color, setColor] = useState("");


  const [activeIndex, setActiveIndex] = useState(0);

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

  // useEffect(() => {
  //   if (!isZoomOpen) return;

  //   const onKeyDown = (e) => {
  //     if (e.key === "Escape") setIsZoomOpen(false);
  //     if (e.key === "ArrowLeft") goPrev();
  //     if (e.key === "ArrowRight") goNext();
  //   };

  //   window.addEventListener("keydown", onKeyDown);
  //   return () => window.removeEventListener("keydown", onKeyDown);
  // }, [isZoomOpen, images.length]);
  const handleOpenZoom = () => {
    if (!images?.length || !openImagePopup) return;

    openImagePopup({
      title: product?.name || "Imagen del producto",
      images,
      startIndex: activeIndex,
      alt: `${product?.name || "Producto"} en grande`,
    });
  };

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

  useEffect(() => {
    setRelated([]);

    if (!product) return;
    if (typeof getProductsRaw !== "function") return;

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
      <Link className="link mb-2.5 inline-block" to="/catalog">
        ← Volver al catálogo
      </Link>

      <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-start gap-7 max-[900px]:grid-cols-1">
        {/* IZQUIERDA: Galería */}
        <section className="grid grid-cols-[74px_minmax(0,1fr)] gap-3.5 max-[900px]:grid-cols-[64px_1fr]">
          <div className="flex max-h-[520px] flex-col gap-2.5 overflow-auto pr-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Miniaturas del producto">
            {images.length ? (
              images.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  className={`cursor-pointer rounded-xl border border-[rgba(42,36,30,0.14)] bg-white/[0.35] p-1.5 [transition:transform_0.12s_ease] hover:-translate-y-px ${idx === activeIndex ? "outline outline-2 outline-[rgba(42,36,30,0.35)]" : ""
                    }`}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Ver imagen ${idx + 1}`}
                >
                  <img
                    className="block aspect-square w-full rounded-[10px] bg-white/[0.35] object-contain object-center"
                    src={src}
                    alt={`${product.name} miniatura ${idx + 1}`}
                    loading="lazy"
                  />
                </button>
              ))
            ) : (
              <div className="p-2 text-sm opacity-70">Sin imágenes</div>
            )}
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] border border-[rgba(42,36,30,0.12)] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),rgba(42,36,30,0.08))] shadow-[var(--shadow)]">
            <button
              type="button"
              className="h-full w-full cursor-zoom-in border-0 bg-transparent p-0 disabled:cursor-not-allowed"
              onClick={handleOpenZoom}
              aria-label="Abrir imagen en grande"
              disabled={!images.length}
            >
              {images.length ? (
                <img
                  className="block h-full w-full bg-transparent object-contain object-center"
                  src={activeImg}
                  alt={product.name}
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-sm opacity-70">Sin imágenes</div>
              )}
            </button>

            {hasManyImages && (
              <>
                <button
                  type="button"
                  className="absolute left-2.5 top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-[rgba(42,36,30,0.14)] bg-white/80 text-[26px] leading-none"
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
                  className="absolute right-2.5 top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-[rgba(42,36,30,0.14)] bg-white/80 text-[26px] leading-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  aria-label="Imagen siguiente"
                >
                  ›
                </button>

                <div
                  className="absolute bottom-2.5 left-2.5 rounded-full border border-[rgba(42,36,30,0.14)] bg-white/80 px-2.5 py-1.5 text-xs"
                  aria-label="Contador de imágenes"
                >
                  {activeIndex + 1}/{images.length}
                </div>
              </>
            )}
          </div>
        </section>

        {/* DERECHA: Compra */}
        <section>
          <h1 className="page__title mt-0">{product.name}</h1>

          {product.price != null && (
            <p className="mb-1.5 mt-2.5 text-xl font-bold">
              ${Number(product.price).toLocaleString("es-CO")}
            </p>
          )}

          <div className="mt-3.5 flex flex-wrap gap-3.5">
            <label className="grid gap-1.5">
              <span>Talla</span>
              <select
                className="rounded-[10px] border border-[rgba(42,36,30,0.14)] bg-transparent px-2.5 py-2"
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

            <label className="grid gap-1.5">
              <span>Color</span>
              <select
                className="rounded-[10px] border border-[rgba(42,36,30,0.14)] bg-transparent px-2.5 py-2"
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

            <div className="mt-4 w-full">
              <button className="btn btn--active" type="button" onClick={handleWhatsApp}>
                Comprar por WhatsApp
              </button>

              <p className="mt-3">
                Seleccionado: <strong>{size || "--"}</strong> /{" "}
                <strong>{color || "--"}</strong>
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Descripción */}
      <section className="mt-[26px]">
        <h2 className="[font-size:1.5em] font-bold [margin-block-end:0.83em] [margin-block-start:0.83em]">Descripción</h2>
        <p className="page__subtitle">{product.description}</p>
      </section>

      {/* Productos relacionados */}
      <section className="mt-[26px]">
        <h2 className="[font-size:1.5em] font-bold [margin-block-end:0.83em] [margin-block-start:0.83em]">Productos relacionados</h2>

        {related.length ? (
          <div className="mt-3 grid grid-cols-4 gap-3.5 max-[900px]:grid-cols-2">
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
                <Link key={rid} className="overflow-hidden rounded-2xl border border-[rgba(42,36,30,0.14)] bg-white/[0.35] text-inherit no-underline shadow-[var(--shadow)]" to={to}>
                  <div className="aspect-[4/5] bg-white/[0.35]">
                    {rImg ? (
                      <img
                        className="block h-full w-full object-cover"
                        src={rImg}
                        alt={p.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-[13px] opacity-70">Sin imagen</div>
                    )}
                  </div>
                  <div className="grid gap-1.5 p-2.5">
                    <div className="font-semibold">{p.name}</div>
                    {p.price != null && (
                      <div className="text-sm opacity-85">
                        ${Number(p.price).toLocaleString("es-CO")}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-2.5 opacity-70">
            Aún no hay relacionados para mostrar.
          </p>
        )}
      </section>
    </div>
  );
}

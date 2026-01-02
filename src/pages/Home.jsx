import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { getProducts } from "../services/productsService";

function formatCOP(value) {
  if (typeof value !== "number") return null;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    getProducts()
      .then(setProducts)
      .catch((e) => setError(e?.message || "Error cargando productos"));
  }, []);

  const featured = useMemo(() => products.slice(0, 6), [products]);
  const heroProduct = featured[0];

  const getBadgeText = (line) => {
    if (line === "antifluido") return "Antifluido";
    if (line === "lino") return "Lino";
    return null;
  };

  const railRef = useRef(null);

  const loopedFeatured = useMemo(() => {
    if (!featured.length) return [];
    return [...featured, ...featured, ...featured];
  }, [featured]);

  const BUFFER = 24; // pequeño. Si lo pones gigante, no “engancha” el loop.
  const getSegment = (el) => el.scrollWidth / 3;

  const normalize = (el) => {
    const segment = getSegment(el);
    const max = el.scrollWidth - el.clientWidth;

    // límites alcanzables (clamp) para que SIEMPRE pueda disparar
    const leftLimit = Math.max(0, segment - BUFFER);
    const rightLimit = Math.min(max, segment * 2 + BUFFER);

    if (el.scrollLeft <= leftLimit) {
      el.style.scrollBehavior = "auto";
      el.scrollLeft += segment;
      el.style.scrollBehavior = "";
    }

    if (el.scrollLeft >= rightLimit) {
      el.style.scrollBehavior = "auto";
      el.scrollLeft -= segment;
      el.style.scrollBehavior = "";
    }
  };

  useEffect(() => {
    const el = railRef.current;
    if (!el || !featured.length) return;

    requestAnimationFrame(() => {
      el.style.scrollBehavior = "auto";
      el.scrollLeft = getSegment(el); // arranca en la copia del medio
      el.style.scrollBehavior = "";
    });
  }, [featured.length]);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    const onScroll = () => normalize(el);
    el.addEventListener("scroll", onScroll, { passive: true });

    // Quita scroll horizontal manual (trackpad/rueda), deja el vertical normal
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
    };
  }, [featured.length]);

  const scrollRail = (dir) => {
    const el = railRef.current;
    if (!el) return;

    const step = Math.round(el.clientWidth * 0.85);
    el.scrollBy({ left: dir * step, behavior: "smooth" });

    // por si queda justo en el borde y no alcanza a “normalizar”
    window.setTimeout(() => normalize(el), 350);
  };

  return (
    <div className="container">
      {/* HERO */}
      <section className="home__hero">
        <div className="home__hero-left">
          <h1 className="home__title">Cajusa</h1>

          <p className="home__subtitle">
            Uniformes antifluido (Lafayette) y prendas en lino artesanal. Compra por WhatsApp.
          </p>

          <div className="home__actions">
            <Link to="/catalogo" className="link">
              <button className="btn btn-primary" type="button">
                Ver Catálogo
              </button>
            </Link>

            <Link to="/catalogo?line=antifluido" className="link">
              <button className="btn btn-ghost" type="button">
                Antifluido
              </button>
            </Link>

            <Link to="/catalogo?line=lino" className="link">
              <button className="btn btn-ghost" type="button">
                Lino artesanal
              </button>
            </Link>
          </div>

          <div className="home__trust">
            <span className="home__pill">Hecho a medida</span>
            <span className="home__pill">Calidad Lafayette</span>
            <span className="home__pill">Atención por WhatsApp</span>
          </div>
        </div>

        <div className="home__hero-right">
          {heroProduct ? (
            <Link className="home__highlight link" to={`/producto/${heroProduct.id}`}>
              <div className="home__highlight-media">
                {Array.isArray(heroProduct.images) && heroProduct.images[0] ? (
                  <img
                    className="home__highlight-img"
                    src={heroProduct.images[0]}
                    alt={heroProduct.name || "Producto destacado"}
                    loading="lazy"
                  />
                ) : (
                  <div className="home__highlight-placeholder">
                    {(heroProduct.name || "C").slice(0, 1).toUpperCase()}
                  </div>
                )}

                <span className="home__highlight-badge">Destacado</span>

                {getBadgeText(heroProduct.line) ? (
                  <span className={`home__line-badge home__line-badge--${heroProduct.line}`}>
                    {getBadgeText(heroProduct.line)}
                  </span>
                ) : null}
              </div>

              <div className="home__highlight-body">
                <div className="home__highlight-name">{heroProduct.name}</div>
                <div className="home__highlight-row">
                  <span className="home__highlight-price">
                    {formatCOP(heroProduct.price) || "Precio por WhatsApp"}
                  </span>
                  <span className="home__highlight-cta">Ver →</span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="home__highlight home__highlight--empty">
              <p className="state">Cargando destacados…</p>
            </div>
          )}
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="home__featured">
        <div className="home__featured-head">
          <h2 className="home__featured-title">Destacados</h2>
          <span className="home__featured-count">
            {featured.length ? `${featured.length} productos` : ""}
          </span>
        </div>

        {error ? (
          <div className="state">Error: {error}</div>
        ) : featured.length === 0 ? (
          <div className="state">Cargando productos…</div>
        ) : (
          <div className="home__carousel">
            <button
              className="home__arrow home__arrow--left"
              type="button"
              aria-label="Ver anteriores"
              onClick={() => scrollRail(-1)}
            >
              ‹
            </button>

            <div className="home__rail" ref={railRef}>
              {loopedFeatured.map((p, idx) => {
                const img = Array.isArray(p.images) ? p.images[0] : null;
                const price = formatCOP(p.price);
                const badgeText = getBadgeText(p.line);

                return (
                  <Link key={`${p.id}-${idx}`} className="home__mini-card link" to={`/producto/${p.id}`}>
                    <div className={`home__mini-media ${img ? "" : "home__mini-media--placeholder"}`}>
                      {img ? (
                        <img className="home__mini-img" src={img} alt={p.name || "Producto"} loading="lazy" />
                      ) : (
                        <div className="home__mini-placeholder">
                          {(p.name || "C").slice(0, 1).toUpperCase()}
                        </div>
                      )}

                      {badgeText ? (
                        <span className={`home__mini-badge home__mini-badge--${p.line}`}>
                          <span className="home__mini-dot" />
                          {badgeText}
                        </span>
                      ) : null}
                    </div>

                    <div className="home__mini-body">
                      <div className="home__mini-title">{p.name}</div>
                      <div className="home__mini-price">{price || "Precio por WhatsApp"}</div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <button
              className="home__arrow home__arrow--right"
              type="button"
              aria-label="Ver siguientes"
              onClick={() => scrollRail(1)}
            >
              ›
            </button>
          </div>
        )}
      </section>

    </div>
  );
}

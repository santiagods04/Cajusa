import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { getProducts } from "../../services/productsService";

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
  const carouselRef = useRef(null);
  const rafRef = useRef(0);
  const pausedRef = useRef(false);

  const loopedFeatured = useMemo(() => {
    if (!featured.length) return [];
    return [...featured, ...featured, ...featured];
  }, [featured]);

  const heroGallery = useMemo(() => {
    const list = products
      .map((p) => ({
        id: p.id,
        name: p.name,
        img: Array.isArray(p.images) ? p.images[0] : null,
      }))
      .filter((x) => x.img);

    return list.slice(0, 10);
  }, [products]);

  const heroLoop = useMemo(() => {
    if (!heroGallery.length) return [];
    return [...heroGallery, ...heroGallery];
  }, [heroGallery]);

  const heroTrackRef = useRef(null);
  const perSlideSec = 5;
  const heroDuration = `${heroGallery.length * perSlideSec}s`;

  useLayoutEffect(() => {
    const el = heroTrackRef.current;
    if (!el || heroGallery.length === 0) return;

    const applyShift = () => {
      const half = el.scrollWidth / 2;
      el.style.setProperty("--heroShift", `-${half}px`);
    };

    requestAnimationFrame(applyShift);

    const ro = new ResizeObserver(() => requestAnimationFrame(applyShift));
    ro.observe(el);

    return () => ro.disconnect();
  }, [heroGallery.length]);

  const BUFFER = 24;
  const getSegment = (el) => el.scrollWidth / 3;

  const normalize = (el) => {
    const segment = getSegment(el);
    const max = el.scrollWidth - el.clientWidth;

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
      el.scrollLeft = getSegment(el);
      el.style.scrollBehavior = "";
    });
  }, [featured.length]);

  useEffect(() => {
    const el = railRef.current;
    const hoverEl = carouselRef.current;
    if (!el || !hoverEl || !featured.length) return;

    const SPEED = 22;
    let last = 0;

    const tick = (t) => {
      if (!last) last = t;
      const dt = t - last;
      last = t;

      if (!pausedRef.current) {
        el.scrollLeft += (dt / 1000) * SPEED;
      }

      normalize(el);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const pause = () => { pausedRef.current = true; };
    const resume = () => { pausedRef.current = false; };

    hoverEl.addEventListener("mouseenter", pause);
    hoverEl.addEventListener("mouseleave", resume);

    hoverEl.addEventListener("focusin", pause);
    hoverEl.addEventListener("focusout", resume);

    return () => {
      cancelAnimationFrame(rafRef.current);
      hoverEl.removeEventListener("mouseenter", pause);
      hoverEl.removeEventListener("mouseleave", resume);
      hoverEl.removeEventListener("focusin", pause);
      hoverEl.removeEventListener("focusout", resume);
    };
  }, [featured.length]);

  const scrollRail = (dir) => {
    const el = railRef.current;
    if (!el) return;

    const card = el.querySelector(".home__mini-card");
    const gap = 14;
    const step = card
      ? Math.round(card.getBoundingClientRect().width + gap * 0.85)
      : Math.round(el.clientWidth * 0.55);

    el.scrollBy({ left: dir * step, behavior: "smooth" });

    setTimeout(() => normalize(el), 350);
  };


  return (
    <div className="container">
      {/* HERO */}
      <section className="home__hero">
        {/* Fondo difuminado (solo si hay imagen) */}
        {heroProduct?.images?.[0] ? (
          <div
            className="home__hero-bg"
            style={{ backgroundImage: `url(${heroProduct.images[0]})` }}
            aria-hidden="true"
          />
        ) : null}

        <div className="home__hero-left">
          <span className="home__eyebrow">Confección profesional y artesanal</span>

          <h1 className="home__title">Cajusa</h1>

          <p className="home__subtitle">
            Uniformes antifluido (Lafayette) y prendas en lino artesanal. Compra por WhatsApp.
          </p>

          <ul className="home__bullets">
            <li className="home__bullet">Guía de talla</li>
            <li className="home__bullet">Calidad Textil</li>
            <li className="home__bullet">Atención por WhatsApp</li>
          </ul>

          <div className="home__actions">
            <Link to="/catalogo" className="link">
              <button className="btn btn-primary" type="button">Ver Catálogo</button>
            </Link>

            <Link to="/catalogo?line=antifluido" className="link">
              <button className="btn btn-ghost" type="button">Antifluido</button>
            </Link>

            <Link to="/catalogo?line=lino" className="link">
              <button className="btn btn-ghost" type="button">Lino artesanal</button>
            </Link>
          </div>
        </div>

        <div className="home__hero-right">
          <div className="home__hero-gallery">
            <div className="home__hero-track" ref={heroTrackRef} style={{ "--heroDuration": heroDuration }}>
              {heroLoop.map((item, idx) => (
                <div className="home__hero-slide" key={`${item.id}-${idx}`}>
                  <div className="home__hero-frame">
                    <img
                      className="home__hero-img"
                      src={item.img}
                      alt={item.name || "Prenda Cajusa"}
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          <div className="home__carousel" ref={carouselRef}>
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

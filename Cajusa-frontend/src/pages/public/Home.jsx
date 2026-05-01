import { Link } from "react-router-dom";
import {
  useEffect,
  useMemo,
  useRef,
  useLayoutEffect,
  useContext,
} from "react";
import AppContext from "../../context/AppContext";

function formatCOP(value) {
  if (typeof value !== "number") return null;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const {
    products: ctxProducts,
    productsLoading,
    productsError,
    onProductsReload,
  } = useContext(AppContext) || {};

  const products = Array.isArray(ctxProducts) ? ctxProducts : [];
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (didFetchRef.current) return;

    if (products.length > 0) {
      didFetchRef.current = true;
      return;
    }

    if (typeof onProductsReload !== "function") return;

    didFetchRef.current = true;
    onProductsReload({ page: 1, limit: 200, sort: "-createdAt" }).catch(() => { });
  }, [products.length, onProductsReload]);

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
  const isHoveringRef = useRef(false);

  const baseCount = featured.length;
  const FEATURED_REPEAT = useMemo(() => {
    if (baseCount <= 4) return 7;
    if (baseCount <= 8) return 5;
    return 3;
  }, [baseCount]);
  
  const FEATURED_MID = Math.floor(FEATURED_REPEAT / 2);

  const loopedFeatured = useMemo(() => {
    if (!featured.length) return [];
    const out = [];
    for (let i = 0; i < FEATURED_REPEAT; i += 1) out.push(...featured);
    return out;
  }, [featured]);

  const heroGallery = useMemo(() => {
    const list = (Array.isArray(products) ? products : [])
      .map((p) => ({
        id: p._id || p.id,
        name: p.name,
        img: Array.isArray(p.images) ? p.images[0] : null,
      }))
      .filter((x) => x.img);

    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

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
  const getSegment = (el) => el.scrollWidth / FEATURED_REPEAT;

  const normalize = (el) => {
    const segment = getSegment(el);
    const max = el.scrollWidth - el.clientWidth;

    if (max <= 0 || segment <= 0) return;

    const leftLimit = Math.max(0, segment * FEATURED_MID - BUFFER);
    const rightLimit = Math.min(max, segment * (FEATURED_MID + 1) + BUFFER);

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

  const railInitRef = useRef(false);

  useLayoutEffect(() => {
    const el = railRef.current;
    if (!el || !featured.length) return;

    const center = () => {
      el.style.scrollBehavior = "auto";
      el.scrollLeft = getSegment(el) * FEATURED_MID;
      el.style.scrollBehavior = "";
      normalize(el);
    };

    requestAnimationFrame(center);

    if (railInitRef.current) return;
    railInitRef.current = true;

    const ro = new ResizeObserver(() => requestAnimationFrame(center));
    ro.observe(el);

    const t = setTimeout(() => ro.disconnect(), 1200);

    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
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

    const pause = () => {
      pausedRef.current = true;
      isHoveringRef.current = true;
    };
    const resume = () => {
      pausedRef.current = false;
      isHoveringRef.current = false;
    };

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

    pausedRef.current = true;

    const card = el.querySelector(".home__mini-card");
    const gap = 14;
    const step = card
      ? Math.round(card.getBoundingClientRect().width + gap * 0.85)
      : Math.round(el.clientWidth * 0.55);

    el.scrollBy({ left: dir * step, behavior: "smooth" });

    setTimeout(() => {
      normalize(el);
      pausedRef.current = isHoveringRef.current;
    }, 450);
  };

  return (
    <div className="container">
      {/* HERO */}
      <section className="relative grid grid-cols-[1.15fr_0.85fr] items-center gap-7 overflow-hidden rounded-[24px] border border-[rgba(42,36,30,0.12)] bg-white/[0.62] p-7 shadow-[var(--shadow)] max-[980px]:grid-cols-1 max-[980px]:p-[18px]">
        {heroProduct?.images?.[0] ? (
          <div
            className="pointer-events-none absolute -inset-[60px] scale-[1.08] bg-cover bg-center opacity-[0.22] blur-[26px] saturate-[1.1]"
            style={{ backgroundImage: `url(${heroProduct.images[0]})` }}
            aria-hidden="true"
          />
        ) : null}

        <div className="relative z-[1]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(42,36,30,0.12)] bg-white/75 px-2.5 py-1.5 text-[12px] font-extrabold tracking-[0.4px] text-[rgba(42,36,30,0.85)]">Confección profesional y artesanal</span>

          <h1 className="m-0 mt-2.5 [font-family:var(--font-title)] text-[46px] leading-[1.02] tracking-[0.6px] text-[var(--text)] max-[980px]:text-[38px]">Cajusa</h1>

          <p className="m-0 mt-2.5 max-w-[60ch] text-[var(--muted)]">
            Uniformes antifluido (Lafayette) y prendas en lino artesanal. Compra por WhatsApp.
          </p>

          <ul className="m-0 mt-3.5 grid max-w-[60ch] list-none gap-2 p-0">
            <li className="flex items-center gap-2.5 font-semibold text-[rgba(42,36,30,0.80)] before:block before:h-2.5 before:w-2.5 before:shrink-0 before:rounded-full before:bg-[var(--accent)] before:shadow-[0_0_0_3px_rgba(255,255,255,0.65)] before:content-['']">Guía de talla</li>
            <li className="flex items-center gap-2.5 font-semibold text-[rgba(42,36,30,0.80)] before:block before:h-2.5 before:w-2.5 before:shrink-0 before:rounded-full before:bg-[var(--accent)] before:shadow-[0_0_0_3px_rgba(255,255,255,0.65)] before:content-['']">Calidad Textil</li>
            <li className="flex items-center gap-2.5 font-semibold text-[rgba(42,36,30,0.80)] before:block before:h-2.5 before:w-2.5 before:shrink-0 before:rounded-full before:bg-[var(--accent)] before:shadow-[0_0_0_3px_rgba(255,255,255,0.65)] before:content-['']">Atención por WhatsApp</li>
          </ul>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/catalog" className="link">
              <button className="btn btn-primary" type="button">Ver Catálogo</button>
            </Link>
          </div>
        </div>

        <div className="relative z-[1] grid justify-items-end max-[980px]:w-[min(520px,100%)] max-[980px]:justify-self-start">
          <div className="group aspect-[4/5] w-[min(420px,100%)] overflow-hidden rounded-[18px] border border-[rgba(42,36,30,0.12)] bg-white/[0.65] shadow-[var(--shadow)]">
            <div
              className="flex h-full flex-nowrap will-change-transform [animation:heroMarquee_var(--heroDuration,18s)_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
              ref={heroTrackRef}
              style={{ "--heroDuration": heroDuration }}
            >
              {heroLoop.map((item, idx) => (
                <div className="box-border h-full flex-[0_0_100%] p-2.5" key={`${item.id}-${idx}`}>
                  <div className="h-full w-full overflow-hidden rounded-[14px] bg-white/[0.35]">
                    <img
                      className="block h-full w-full object-cover object-[center_18%]"
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
      <section className="mt-[22px]">
        <div className="mb-2.5 flex items-baseline justify-between gap-2.5">
          <h2 className="m-0 text-xl">Destacados</h2>
          <span className="text-[13px] text-[var(--muted)]">
            {featured.length ? `${featured.length} productos` : ""}
          </span>
        </div>

        {productsError ? (
          <div className="p-4">Error: {productsError}</div>
        ) : productsLoading && featured.length === 0 ? (
          <div className="p-4">Cargando productos…</div>
        ) : featured.length === 0 ? (
          <div className="p-4">Aún no hay productos.</div>
        ) : (
          <div className="relative" ref={carouselRef}>
            <button
              className="absolute left-1.5 top-[42%] z-[5] h-10 w-10 -translate-y-1/2 cursor-pointer rounded-full border border-[rgba(42,36,30,0.14)] bg-white/85 text-[26px] leading-none shadow-[0_12px_24px_rgba(42,36,30,0.16)] hover:bg-white"
              type="button"
              aria-label="Ver anteriores"
              onClick={() => scrollRail(-1)}
            >
              ‹
            </button>

            <div className="home__rail flex gap-3.5 overflow-hidden overflow-y-hidden px-11 pb-2.5 pt-1.5 scroll-smooth [scroll-snap-type:none] [scrollbar-width:none] [-ms-overflow-style:none] [overscroll-behavior-x:contain] [&::-webkit-scrollbar]:hidden" ref={railRef}>
              {loopedFeatured.map((p, idx) => {
                const img = Array.isArray(p.images) ? p.images[0] : null;
                const price = formatCOP(p.price);
                const badgeText = getBadgeText(p.line);

                return (
                  <Link
                    key={`${p._id || p.id}-${idx}`}
                    className="home__mini-card link flex-[0_0_240px] snap-start overflow-hidden rounded-[18px] border border-[rgba(42,36,30,0.12)] bg-white/[0.65] shadow-[var(--shadow)] [transition:transform_0.08s_ease,box-shadow_0.2s_ease] hover:-translate-y-px hover:shadow-[0_18px_44px_rgba(42,36,30,0.12)]"
                    to={`/product/${p._id || p.id}`}
                  >
                    <div className={`relative aspect-[4/5] w-full overflow-hidden ${img ? "" : "home__mini-media--placeholder"}`}>
                      {img ? (
                        <img
                          className="block h-full w-full object-cover object-[center_18%]"
                          src={img}
                          alt={p.name || "Producto"}
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-full place-items-center [font-family:var(--font-title)] text-[48px] text-[rgba(42,36,30,0.40)]">
                          {(p.name || "C").slice(0, 1).toUpperCase()}
                        </div>
                      )}

                      {badgeText ? (
                        <span className={`home__mini-badge--${p.line} absolute left-3 top-3 z-[3] inline-flex items-center gap-2 rounded-full border border-[rgba(42,36,30,0.16)] bg-white px-2.5 py-1.5 text-[12px] font-extrabold text-[rgba(42,36,30,0.95)] shadow-[0_10px_22px_rgba(42,36,30,0.18)]`}>
                          <span className="home__mini-dot h-2 w-2 rounded-full bg-[var(--accent)] outline outline-2 outline-[rgba(42,36,30,0.10)]" />
                          {badgeText}
                        </span>
                      ) : null}
                    </div>

                    <div className="px-3.5 pb-3.5 pt-3">
                      <div className="overflow-hidden text-[14px] font-extrabold text-[var(--text)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{p.name}</div>
                      <div className="mt-2 font-black text-[var(--text)]">{price || "Precio por WhatsApp"}</div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <button
              className="absolute right-1.5 top-[42%] z-[5] h-10 w-10 -translate-y-1/2 cursor-pointer rounded-full border border-[rgba(42,36,30,0.14)] bg-white/85 text-[26px] leading-none shadow-[0_12px_24px_rgba(42,36,30,0.16)] hover:bg-white"
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

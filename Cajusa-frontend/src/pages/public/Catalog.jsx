import { Link, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import AppContext from "../../context/AppContext";

const formatCOP = (value) => {
  if (typeof value !== "number") return null;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
};

const normalize = (v) => String(v || "").toLowerCase().trim();

const uniqSorted = (arr) => {
  const sortAlpha = (a, b) => String(a).localeCompare(String(b), "es");
  return Array.from(new Set(arr.filter(Boolean))).sort(sortAlpha);
};

export default function Catalog() {
  const { products: ctxProducts, productsLoading, productsError, onProductsReload, getProductsRaw } =
    useContext(AppContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const line = searchParams.get("line") || "all";

  const products = Array.isArray(ctxProducts) ? ctxProducts : [];

  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");

  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedSubcategories, setSelectedSubcategories] = useState(new Set());
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const [baseProducts, setBaseProducts] = useState([]);

  const toggleInSet = (setter, value) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const toggleSingle = (setter, value) => {
    setter((prev) => (prev === value ? "" : value));
  };

  const clearSidebarFilters = () => {
    setSelectedCategories(new Set());
    setSelectedSubcategories(new Set());
    setSelectedSize("");
    setSelectedColor("");
  };

  const clearSearch = () => {
    setQuery("");
    setQueryDraft("");
  };

  useEffect(() => {
    clearSidebarFilters();
  }, [line]); 

  useEffect(() => {
    if (typeof getProductsRaw !== "function") return;

    const params = { page: 1, limit: 200, sort: "-createdAt" };
    if (line !== "all") params.line = line;

    getProductsRaw(params)
      .then((data) => setBaseProducts(Array.isArray(data) ? data : []))
      .catch(() => setBaseProducts([]));
  }, [line, getProductsRaw]);

  const facets = useMemo(() => {
    const categories = [];
    const subcategories = [];
    const sizes = [];
    const colors = [];

    baseProducts.forEach((p) => {
      if (p?.category) categories.push(p.category);
      if (p?.subcategory) subcategories.push(p.subcategory);
      const isAvailable = (v) => Number(v?.quantity || 0) > 0;

      (p?.variants || []).forEach((v) => {
        if (!isAvailable(v)) return;

        if (v?.size) sizes.push(v.size);
        if (v?.color) colors.push(v.color);
      });
    });

    return {
      categories: uniqSorted(categories),
      subcategories: uniqSorted(subcategories),
      sizes: uniqSorted(sizes),
      colors: uniqSorted(colors),
    };
  }, [baseProducts]);

  const requestParams = useMemo(() => {
    const params = { page: 1, limit: 200, sort: "-createdAt" };

    if (line !== "all") params.line = line;

    const q = String(query || "").trim();
    if (q) params.q = q;

    const cats = Array.from(selectedCategories);
    if (cats.length) params.category = cats.join(",");

    const subs = Array.from(selectedSubcategories);
    if (subs.length) params.subcategory = subs.join(",");

    if (selectedSize) {
      params.size = selectedSize;
      params.available = "true";
    }

    if (selectedColor) {
      params.color = selectedColor;
      params.available = "true";
    }

    return params;
  }, [line, query, selectedCategories, selectedSubcategories, selectedSize, selectedColor]);

  useEffect(() => {
    if (typeof onProductsReload !== "function") return;
    onProductsReload(requestParams).catch(() => { });
  }, [onProductsReload, requestParams]);

  const btnClass = (value) =>
    `btn btn--ghost rounded-full ${line === value ? "btn--active" : ""}`;

  const onSubmitSearch = (e) => {
    e.preventDefault();
    setQuery(queryDraft);
  };

  const anySidebarFilter =
    selectedCategories.size ||
    selectedSubcategories.size ||
    Boolean(selectedSize) ||
    Boolean(selectedColor);

  return (
    <div className="container">
      <div className="mb-4">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="page__title">Catálogo</h1>
          <p className="m-0 text-[var(--muted)]">
            {products.length} producto{products.length === 1 ? "" : "s"}
          </p>
        </div>

        <form className="mt-2.5 flex flex-wrap gap-2.5" onSubmit={onSubmitSearch}>
          <input
            className="min-w-60 flex-1 rounded-xl border border-[rgba(42,36,30,0.14)] bg-white/75 px-3 py-2.5 text-[var(--text)] outline-none focus:border-[rgba(177,74,47,0.28)] focus:shadow-[0_0_0_3px_rgba(177,74,47,0.12)]"
            value={queryDraft}
            onChange={(e) => setQueryDraft(e.target.value)}
            placeholder="Buscar por nombre, categoría…"
            type="search"
          />
          <button className="btn rounded-xl bg-[rgba(177,74,47,0.10)]" type="submit">
            Buscar
          </button>

          {(query || queryDraft) && (
            <button
              className="btn btn--ghost rounded-xl"
              type="button"
              onClick={clearSearch}
            >
              Limpiar
            </button>
          )}
        </form>
      </div>

      <div className="grid grid-cols-[280px_1fr] items-start gap-4 max-[820px]:grid-cols-1">
        {/* Sidebar */}
        <aside>
          <div className="rounded-[14px] border border-[rgba(42,36,30,0.14)] bg-white/[0.55] p-3.5 shadow-[var(--shadow)]">
            <div className="mb-2.5 flex items-center justify-between gap-2.5">
              <h2 className="m-0 [font-family:var(--font-title)] text-lg">Filtros</h2>
              {anySidebarFilter ? (
                <button
                  className="btn btn--ghost rounded-xl px-2.5 py-2"
                  type="button"
                  onClick={clearSidebarFilters}
                >
                  Limpiar filtros
                </button>
              ) : null}
            </div>

            {/* Línea */}
            <div className="mt-3 border-t border-[rgba(42,36,30,0.10)] pt-3">
              <div className="mb-2.5 font-extrabold">Línea</div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  className={btnClass("all")}
                  type="button"
                  onClick={() => setSearchParams({})}
                >
                  Todo
                </button>
                <button
                  className={btnClass("antifluido")}
                  type="button"
                  onClick={() => setSearchParams({ line: "antifluido" })}
                >
                  Antifluido
                </button>
                <button
                  className={btnClass("lino")}
                  type="button"
                  onClick={() => setSearchParams({ line: "lino" })}
                >
                  Lino
                </button>
              </div>
            </div>

            {/* Categoría (siempre visible) */}
            <div className="mt-3 border-t border-[rgba(42,36,30,0.10)] pt-3">
              <div className="mb-2.5 font-extrabold">Categoría</div>
              {facets.categories.length ? (
                <div className="grid gap-2">
                  {facets.categories.map((c) => (
                    <label key={c} className="flex items-center gap-2.5 text-[var(--text)]">
                      <input
                        className="h-4 w-4 accent-[var(--accent)]"
                        type="checkbox"
                        checked={selectedCategories.has(c)}
                        onChange={() => toggleInSet(setSelectedCategories, c)}
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div>Sin opciones</div>
              )}
            </div>

            {/* Subcategoría (siempre visible) */}
            <div className="mt-3 border-t border-[rgba(42,36,30,0.10)] pt-3">
              <div className="mb-2.5 font-extrabold">Subcategoría</div>
              {facets.subcategories.length ? (
                <div className="grid gap-2">
                  {facets.subcategories.map((s) => (
                    <label key={s} className="flex items-center gap-2.5 text-[var(--text)]">
                      <input
                        className="h-4 w-4 accent-[var(--accent)]"
                        type="checkbox"
                        checked={selectedSubcategories.has(s)}
                        onChange={() => toggleInSet(setSelectedSubcategories, s)}
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div>Sin opciones</div>
              )}
            </div>

            {/* Talla (siempre visible, single) */}
            <div className="mt-3 border-t border-[rgba(42,36,30,0.10)] pt-3">
              <div className="mb-2.5 font-extrabold">Talla</div>
              {facets.sizes.length ? (
                <div className="flex flex-wrap gap-2.5">
                  {facets.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`btn btn--ghost rounded-full ${selectedSize === s ? "btn--active" : ""
                        }`}
                      onClick={() => toggleSingle(setSelectedSize, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <div>Sin opciones</div>
              )}
            </div>

            {/* Color (siempre visible, single) */}
            <div className="mt-3 border-t border-[rgba(42,36,30,0.10)] pt-3">
              <div className="mb-2.5 font-extrabold">Color</div>
              {facets.colors.length ? (
                <div className="flex flex-wrap gap-2.5">
                  {facets.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`btn btn--ghost rounded-full ${selectedColor === c ? "btn--active" : ""
                        }`}
                      onClick={() => toggleSingle(setSelectedColor, c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : (
                <div>Sin opciones</div>
              )}
            </div>
          </div>
        </aside>

        {/* Content */}
        <section>
          {productsError ? (
            <div className="state">Error: {productsError}</div>
          ) : productsLoading ? (
            <div className="state">Cargando…</div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="rounded-[14px] border border-[rgba(42,36,30,0.14)] bg-white/[0.55] p-4">
                  <h3 className="m-0 mb-1.5 [font-family:var(--font-title)]">No encontramos resultados</h3>
                  <p className="m-0 text-[var(--muted)]">
                    Prueba con otra búsqueda o limpia filtros.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3.5 max-[1100px]:grid-cols-2 max-[820px]:grid-cols-1">
                  {products.map((p) => {
                    const id = p?._id || p?.id;
                    const img = Array.isArray(p?.images) ? p.images[0] : null;
                    const price = formatCOP(p?.price);

                    const lineKey = normalize(p?.line);
                    const badgeText =
                      lineKey === "antifluido"
                        ? "Antifluido"
                        : lineKey === "lino"
                          ? "Lino"
                          : null;

                    return (
                      <Link
                        key={id}
                        className="overflow-hidden rounded-2xl border border-[rgba(42,36,30,0.14)] bg-white/[0.65] shadow-[var(--shadow)] [transition:transform_0.08s_ease,box-shadow_0.2s_ease] hover:-translate-y-px hover:shadow-[0_18px_44px_rgba(42,36,30,0.12)]"
                        to={id ? `/product/${id}` : "/catalog"}
                      >
                        <div
                          className={`relative isolate aspect-[4/5] w-full overflow-hidden rounded-t-[14px] max-[820px]:h-[180px] ${img ? "" : "[background:radial-gradient(500px_240px_at_20%_20%,rgba(177,74,47,0.14),transparent_55%),radial-gradient(500px_240px_at_80%_10%,rgba(47,111,94,0.12),transparent_60%),rgba(255,255,255,0.55)]"
                            }`}
                        >
                          {img ? (
                            <img
                              className="block h-full w-full object-cover object-[center_20%]"
                              src={img}
                              alt={p?.name || "Producto"}
                              loading="lazy"
                            />
                          ) : (
                            <div className="grid h-full place-items-center [font-family:var(--font-title)] text-[40px] text-[rgba(42,36,30,0.40)]">
                              {(p?.name || "C").slice(0, 1).toUpperCase()}
                            </div>
                          )}

                          {badgeText ? (
                            <span className={`absolute left-3.5 top-3.5 z-[3] rounded-full border px-2.5 py-1.5 text-[12px] font-extrabold tracking-[0.2px] text-[rgba(42,36,30,0.95)] opacity-100 shadow-[0_10px_22px_rgba(42,36,30,0.22),inset_0_1px_0_rgba(255,255,255,0.75)] [backdrop-filter:none] [mix-blend-mode:normal] before:mr-2 before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[var(--accent)] before:outline before:outline-2 before:outline-[rgba(42,36,30,0.12)] before:content-[''] ${lineKey === "antifluido"
                                ? "border-[rgba(47,111,94,0.45)] bg-[#E3E6DD] before:bg-[rgba(47,111,94,1)]"
                                : lineKey === "lino"
                                  ? "border-[rgba(177,74,47,0.45)] bg-[#F2E1D7] before:bg-[rgba(177,74,47,1)]"
                                  : "border-[rgba(42,36,30,0.22)] bg-[#fbf6ee]"
                              }`}>
                              {badgeText}
                            </span>
                          ) : null}
                        </div>

                        <div className="px-3 pb-3.5 pt-3">
                          <h3 className="m-0 mb-1.5 text-base leading-[1.2]">{p?.name}</h3>
                          <p className="m-0 mb-3 text-[13px] text-[var(--muted)]">{p?.category}</p>

                          <div className="flex items-center justify-between gap-2.5">
                            <span
                              className={`${price ? "font-black" : "font-bold text-[var(--muted)]"
                                }`}
                            >
                              {price || "Precio por WhatsApp"}
                            </span>
                            <span className="font-extrabold text-[rgba(42,36,30,0.70)]">Ver →</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

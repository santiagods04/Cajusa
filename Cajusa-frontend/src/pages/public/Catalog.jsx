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
    `btn btn--ghost catalog__chip ${line === value ? "btn--active" : ""}`;

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
      <div className="catalog__top">
        <div className="catalog__top-head">
          <h1 className="page__title">Catálogo</h1>
          <p className="catalog__meta">
            {products.length} producto{products.length === 1 ? "" : "s"}
          </p>
        </div>

        <form className="catalog__search" onSubmit={onSubmitSearch}>
          <input
            className="catalog__search-input"
            value={queryDraft}
            onChange={(e) => setQueryDraft(e.target.value)}
            placeholder="Buscar por nombre, categoría…"
            type="search"
          />
          <button className="btn catalog__search-btn" type="submit">
            Buscar
          </button>

          {(query || queryDraft) && (
            <button
              className="btn btn--ghost catalog__search-clear"
              type="button"
              onClick={clearSearch}
            >
              Limpiar
            </button>
          )}
        </form>
      </div>

      <div className="catalog__layout">
        {/* Sidebar */}
        <aside className="catalog__sidebar">
          <div className="catalog__panel">
            <div className="catalog__panel-head">
              <h2 className="catalog__panel-title">Filtros</h2>
              {anySidebarFilter ? (
                <button
                  className="btn btn--ghost catalog__clear"
                  type="button"
                  onClick={clearSidebarFilters}
                >
                  Limpiar filtros
                </button>
              ) : null}
            </div>

            {/* Línea */}
            <div className="catalog__section">
              <div className="catalog__section-title">Línea</div>
              <div className="catalog__chips-row">
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
            <div className="catalog__section">
              <div className="catalog__section-title">Categoría</div>
              {facets.categories.length ? (
                <div className="catalog__checks">
                  {facets.categories.map((c) => (
                    <label key={c} className="catalog__check">
                      <input
                        type="checkbox"
                        checked={selectedCategories.has(c)}
                        onChange={() => toggleInSet(setSelectedCategories, c)}
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="catalog__hint">Sin opciones</div>
              )}
            </div>

            {/* Subcategoría (siempre visible) */}
            <div className="catalog__section">
              <div className="catalog__section-title">Subcategoría</div>
              {facets.subcategories.length ? (
                <div className="catalog__checks">
                  {facets.subcategories.map((s) => (
                    <label key={s} className="catalog__check">
                      <input
                        type="checkbox"
                        checked={selectedSubcategories.has(s)}
                        onChange={() => toggleInSet(setSelectedSubcategories, s)}
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="catalog__hint">Sin opciones</div>
              )}
            </div>

            {/* Talla (siempre visible, single) */}
            <div className="catalog__section">
              <div className="catalog__section-title">Talla</div>
              {facets.sizes.length ? (
                <div className="catalog__chips-wrap">
                  {facets.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`btn btn--ghost catalog__chip ${selectedSize === s ? "btn--active" : ""
                        }`}
                      onClick={() => toggleSingle(setSelectedSize, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="catalog__hint">Sin opciones</div>
              )}
            </div>

            {/* Color (siempre visible, single) */}
            <div className="catalog__section">
              <div className="catalog__section-title">Color</div>
              {facets.colors.length ? (
                <div className="catalog__chips-wrap">
                  {facets.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`btn btn--ghost catalog__chip ${selectedColor === c ? "btn--active" : ""
                        }`}
                      onClick={() => toggleSingle(setSelectedColor, c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="catalog__hint">Sin opciones</div>
              )}
            </div>
          </div>
        </aside>

        {/* Content */}
        <section className="catalog__content">
          {productsError ? (
            <div className="state">Error: {productsError}</div>
          ) : productsLoading ? (
            <div className="state">Cargando…</div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="catalog__empty">
                  <h3 className="catalog__empty-title">No encontramos resultados</h3>
                  <p className="catalog__empty-text">
                    Prueba con otra búsqueda o limpia filtros.
                  </p>
                </div>
              ) : (
                <div className="catalog__grid">
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
                        className="catalog__card"
                        to={id ? `/product/${id}` : "/catalog"}
                      >
                        <div
                          className={`catalog__media ${img ? "" : "catalog__media--placeholder"
                            }`}
                        >
                          {img ? (
                            <img
                              className="catalog__img"
                              src={img}
                              alt={p?.name || "Producto"}
                              loading="lazy"
                            />
                          ) : (
                            <div className="catalog__placeholder">
                              {(p?.name || "C").slice(0, 1).toUpperCase()}
                            </div>
                          )}

                          {badgeText ? (
                            <span className={`catalog__badge catalog__badge--${lineKey}`}>
                              {badgeText}
                            </span>
                          ) : null}
                        </div>

                        <div className="catalog__card-body">
                          <h3 className="catalog__card-title">{p?.name}</h3>
                          <p className="catalog__card-sub">{p?.category}</p>

                          <div className="catalog__card-row">
                            <span
                              className={`catalog__price ${price ? "" : "catalog__price--na"
                                }`}
                            >
                              {price || "Precio por WhatsApp"}
                            </span>
                            <span className="catalog__cta">Ver →</span>
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

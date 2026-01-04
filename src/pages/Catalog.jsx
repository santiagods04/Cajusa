import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../services/productsService";

const formatCOP = (value) => {
  if (typeof value !== "number") return null;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
};

const normalize = (v) => String(v || "").toLowerCase().trim();

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const line = searchParams.get("line") || "all";

  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

 
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");

  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedSizes, setSelectedSizes] = useState(new Set());
  const [selectedColors, setSelectedColors] = useState(new Set());

  useEffect(() => {
    setError("");
    getProducts()
      .then(setProducts)
      .catch((e) => setError(e?.message || "Error cargando productos"));
  }, []);

  const facets = useMemo(() => {
    const categories = new Set();
    const subcategories = new Set();
    const sizes = new Set();
    const colors = new Set();

    products.forEach((p) => {
      if (p?.category) categories.add(p.category);
      if (p?.subcategory) subcategories.add(p.subcategory);

      (p?.variants || []).forEach((v) => {
        if (v?.size) sizes.add(v.size);
        if (v?.color) colors.add(v.color);
      });
    });

    const sortAlpha = (a, b) => String(a).localeCompare(String(b), "es");

    return {
      categories: Array.from(categories).sort(sortAlpha),
      subcategories: Array.from(subcategories).sort(sortAlpha),
      sizes: Array.from(sizes).sort(sortAlpha),
      colors: Array.from(colors).sort(sortAlpha),
    };
  }, [products]);

  const toggleInSet = (setter, value) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = products;

    if (line !== "all") list = list.filter((p) => p?.line === line);

    const q = normalize(query);
    if (q) {
      list = list.filter((p) => {
        const hay = `${p?.name || ""} ${p?.category || ""} ${p?.line || ""}`;
        return normalize(hay).includes(q);
      });
    }

    if (selectedCategories.size) {
      list = list.filter((p) => selectedCategories.has(p?.category));
    }

    if (selectedSizes.size) {
      list = list.filter((p) =>
        (p?.variants || []).some((v) => v.available && selectedSizes.has(v.size))
      );
    }

    if (selectedColors.size) {
      list = list.filter((p) =>
        (p?.variants || []).some((v) => v.available && selectedColors.has(v.color))
      );
    }

    return list;
  }, [products, line, query, selectedCategories, selectedSizes, selectedColors]);

  const btnClass = (value) =>
    `btn btn--ghost catalog__chip ${line === value ? "btn--active" : ""}`;

  const onSubmitSearch = (e) => {
    e.preventDefault();
    setQuery(queryDraft);
  };

  const clearSidebarFilters = () => {
    setSelectedCategories(new Set());
    setSelectedSizes(new Set());
    setSelectedColors(new Set());
  };

  const clearSearch = () => {
    setQuery("");
    setQueryDraft("");
  };

  return (
    <div className="container">
      <div className="catalog__top">
        <div className="catalog__top-head">
          <h1 className="page__title">Catálogo</h1>
          <p className="catalog__meta">
            {filtered.length} producto{filtered.length === 1 ? "" : "s"}
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
              {(selectedCategories.size || selectedSizes.size || selectedColors.size) ? (
                <button
                  className="btn btn--ghost catalog__clear"
                  type="button"
                  onClick={clearSidebarFilters}
                >
                  Limpiar filtros
                </button>
              ) : null}
            </div>

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

            {facets.categories.length > 0 && (
              <div className="catalog__section">
                <div className="catalog__section-title">Categoría</div>
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
              </div>
            )}

            {facets.sizes.length > 0 && (
              <div className="catalog__section">
                <div className="catalog__section-title">Talla</div>
                <div className="catalog__chips-wrap">
                  {facets.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`btn btn--ghost catalog__chip ${selectedSizes.has(s) ? "btn--active" : ""
                        }`}
                      onClick={() => toggleInSet(setSelectedSizes, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {facets.colors.length > 0 && (
              <div className="catalog__section">
                <div className="catalog__section-title">Color</div>
                <div className="catalog__chips-wrap">
                  {facets.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`btn btn--ghost catalog__chip ${selectedColors.has(c) ? "btn--active" : ""
                        }`}
                      onClick={() => toggleInSet(setSelectedColors, c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Content */}
        <section className="catalog__content">
          {error ? (
            <div className="state">Error: {error}</div>
          ) : (
            <>
              {filtered.length === 0 ? (
                <div className="catalog__empty">
                  <h3 className="catalog__empty-title">No encontramos resultados</h3>
                  <p className="catalog__empty-text">
                    Prueba con otra búsqueda o limpia filtros.
                  </p>
                </div>
              ) : (
                <div className="catalog__grid">
                  {filtered.map((p) => {
                    const img =
                      Array.isArray(p?.images) ? p.images[0] : null;
                    const price = formatCOP(p?.price);

                    const badgeText =
                      p?.line === "antifluido"
                        ? "Antifluido"
                        : p?.line === "lino"
                          ? "Lino"
                          : null;

                    return (
                      <Link key={p.id} className="catalog__card" to={`/producto/${p.id}`}>
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
                            <span
                              className={`catalog__badge catalog__badge--${p.line}`}
                            >
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

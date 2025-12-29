import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../services/productsService";

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const line = searchParams.get("line") || "all";

  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    getProducts()
      .then(setProducts)
      .catch((e) => setError(e?.message || "Error cargando productos"));
  }, []);

  const filtered = useMemo(() => {
    if (line === "all") return products;
    return products.filter((p) => p.line === line);
  }, [products, line]);

  const btnClass = (value) => `btn btn--ghost ${line === value ? "btn--active" : ""}`;

  return (
    <div className="container">
      <h1 className="page__title">Catálogo</h1>

      <div className="catalog__filters">
        <button className={btnClass("all")} type="button" onClick={() => setSearchParams({})}>
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

      {error ? (
        <div className="state">Error: {error}</div>
      ) : (
        <ul className="list">
          {filtered.map((p) => (
            <li className="list__item" key={p.id}>
              <Link className="link" to={`/producto/${p.id}`}>
                {p.name}
              </Link>{" "}
              — {p.category}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

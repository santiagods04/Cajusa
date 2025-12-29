import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProducts } from "../services/productsService";

function formatCOP(value) {
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

  const featured = products.slice(0, 6);

  return (
    <div className="container">
      <h1 className="page__title">Cajusa</h1>
      <p className="page__subtitle">
        Uniformes antifluido (Lafayette) y prendas en lino artesanal. Compra por WhatsApp.
      </p>

      <div className="home__actions">
        <Link to="/catalogo?line=antifluido">
          <button className="btn btn--ghost" type="button">
            Ver Uniformes Antifluido
          </button>
        </Link>

        <Link to="/catalogo?line=lino">
          <button className="btn btn--ghost" type="button">
            Ver Lino Artesanal
          </button>
        </Link>
      </div>

      <section className="home__featured">
        <h2 className="home__featured-title">Destacados</h2>

        {error ? (
          <div className="state">Error: {error}</div>
        ) : (
          <ul className="list">
            {featured.map((p) => (
              <li className="list__item" key={p.id}>
                <Link className="link" to={`/producto/${p.id}`}>
                  {p.name}
                </Link>{" "}
                — {formatCOP(p.price)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { getProducts } from "./services/productsService";

function formatCOP(value) {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${Math.round(value)}`;
  }
}

function App() {
  const [products, setProducts] = useState([]);
  const [lineFilter, setLineFilter] = useState("all"); // all | antifluido | lino
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setError("");

    getProducts()
      .then((data) => setProducts(data))
      .catch((err) => setError(err?.message || "Error cargando productos"))
      .finally(() => setIsLoading(false));
  }, []);

  const visibleProducts = useMemo(() => {
    if (lineFilter === "all") return products;
    return products.filter((p) => p.line === lineFilter);
  }, [products, lineFilter]);

  if (isLoading) return <div style={{ padding: 16 }}>Cargando productos…</div>;
  if (error) return <div style={{ padding: 16 }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <header style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Cajusa (MVP)</h1>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setLineFilter("all")}>
            Todo
          </button>
          <button type="button" onClick={() => setLineFilter("antifluido")}>
            Antifluido
          </button>
          <button type="button" onClick={() => setLineFilter("lino")}>
            Lino
          </button>
        </div>
      </header>

      <p style={{ marginTop: 8 }}>
        Productos: <strong>{visibleProducts.length}</strong>
      </p>

      <ul style={{ paddingLeft: 16 }}>
        {visibleProducts.map((p) => (
          <li key={p.id} style={{ marginBottom: 8 }}>
            <strong>{p.name}</strong> — {p.category} —{" "}
            {p.line === "antifluido" ? "Antifluido" : "Lino"} —{" "}
            {formatCOP(p.price)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

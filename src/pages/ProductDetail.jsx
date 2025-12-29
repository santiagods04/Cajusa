import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getProductById } from "../services/productsService";

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setProduct(null);

    getProductById(id)
      .then(setProduct)
      .catch((e) => setError(e?.message || "Error cargando producto"));
  }, [id]);

  const sizes = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.size))];
  }, [product]);

  const colors = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.color))];
  }, [product]);

  if (error) return <div className="state container">Error: {error}</div>;
  if (!product) return <div className="state container">Cargando…</div>;

  return (
    <div className="container">
      <Link className="link product__back" to="/catalogo">
        ← Volver al catálogo
      </Link>

      <h1 className="page__title">{product.name}</h1>
      <p className="page__subtitle">{product.description}</p>

      <div className="product__controls">
        <label className="product__field">
          <span>Talla</span>
          <select
            className="product__select"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            <option value="">Selecciona</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="product__field">
          <span>Color</span>
          <select
            className="product__select"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          >
            <option value="">Selecciona</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p style={{ marginTop: 12 }}>
        Seleccionado: <strong>{size || "—"}</strong> / <strong>{color || "—"}</strong>
      </p>
    </div>
  );
}

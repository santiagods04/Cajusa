import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useContext } from "react";
import { login } from "../../utils/auth";
import AppContext from "../../context/AppContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/catalog";
  const { handleAuthSuccess } = useContext(AppContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const[isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isValid = form.email && form.password;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login({
        email: form.email,
        password: form.password,
      });

      console.log("[LOGIN OK] user:", user);

      handleAuthSuccess(user);

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth">
      <div className="container auth__inner">
        <div className="auth__card">
          <h1 className="auth__title">Iniciar sesión</h1>
          <p className="auth__subtitle">
            Accede para gestionar pedidos, favoritos y tu cuenta.
          </p>

          <form className="auth__form" onSubmit={handleSubmit}>
            <label className="auth__field">
              <span className="auth__label">Correo</span>
              <input
                className="auth__input"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="auth__field">
              <span className="auth__label">Contraseña</span>
              <input
                className="auth__input"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                minLength={8}
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            {error && <p className="auth__error">{error}</p>}

            <button className="btn btn--active auth__btn" type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Iniciando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="auth__hint">
            ¿No tienes cuenta?{" "}
            <Link className="auth__link" to="/register">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

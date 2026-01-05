import { Link } from "react-router-dom";

export default function Login() {
  function handleSubmit(e) {
    e.preventDefault();
    // TODO (backend): llamar endpoint /login y guardar token/sesión
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
                required
              />
            </label>

            <button className="btn btn--active auth__btn" type="submit">
              Iniciar sesión
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

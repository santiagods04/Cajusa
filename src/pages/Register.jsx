import { Link } from "react-router-dom";

export default function Register() {
  function handleSubmit(e) {
    e.preventDefault();
    // TODO (backend): validar que password === confirmPassword, llamar /register
  }

  return (
    <main className="auth">
      <div className="container auth__inner">
        <div className="auth__card">
          <h1 className="auth__title">Registro</h1>
          <p className="auth__subtitle">
            Crea tu cuenta para comprar más rápido y guardar tus favoritos.
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
                autoComplete="new-password"
                placeholder="mínimo 8 caracteres"
                minLength={8}
                required
              />
            </label>

            <label className="auth__field">
              <span className="auth__label">Confirmar contraseña</span>
              <input
                className="auth__input"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="repite la contraseña"
                minLength={8}
                required
              />
            </label>

            <button className="btn btn--active auth__btn" type="submit">
              Crear cuenta
            </button>
          </form>

          <p className="auth__hint">
            ¿Ya tienes cuenta?{" "}
            <Link className="auth__link" to="/login">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

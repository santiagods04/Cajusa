import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { register } from "../../utils/auth";

export default function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "+57",
    phoneNumber: "",
  });

  const isValid =
    form.firstName &&
    form.lastName &&
    form.nickname &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    form.countryCode &&
    form.phoneNumber;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const { email, password, confirmPassword } = form;

    const firstNameClean = String(form.firstName || "").trim().replace(/\s+/g, " ");
    const lastNameClean = String(form.lastName || "").trim().replace(/\s+/g, " ");
    const name = `${firstNameClean} ${lastNameClean}`.trim();

    if (!firstNameClean || !lastNameClean) {
      setError("Nombre y apellido son obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const rawCode = String(form.countryCode || "").trim();
    const code = rawCode.startsWith("+") ? rawCode : `+${rawCode}`;
    const number = String(form.phoneNumber || "").replace(/\D/g, ""); // solo dígitos

    if (!/^\+\d{1,4}$/.test(code)) {
      setError("Indicativo inválido (ej: +57)");
      return;
    }

    if (number.length < 7 || number.length > 15) {
      setError("Número inválido");
      return;
    }

    const phone = `${code}${number}`;

    setIsSubmitting(true);
    try {
      const user = await register({ name, email, password, phone });
      console.log("[REGISTER OK] user:", user);

      navigate("/login");
    } catch (err) {
      setError(err.message || "No se pudo registrar");
    } finally {
      setIsSubmitting(false);
    }
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
              <span className="auth__label">Nombre completo</span>

              <div className="auth__row">
                <input
                  className="auth__input"
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  placeholder="Nombres"
                  value={form.firstName}
                  onChange={handleChange}
                  minLength={2}
                  required
                />

                <input
                  className="auth__input"
                  type="text"
                  name="lastName"
                  autoComplete="family-name"
                  placeholder="Apellidos"
                  value={form.lastName}
                  onChange={handleChange}
                  minLength={2}
                  required
                />
              </div>
            </label>

            <label className="auth__field">
              <span className="auth__label">Nombre de usuario</span>
              <input
                className="auth__input"
                type="text"
                name="nickname"
                autoComplete="nickname"
                placeholder="userNickname123"
                minLength={5}
                value={form.nickname}
                onChange={handleChange}
                required
              />
            </label>

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
              <span className="auth__label">Teléfono</span>

              <div className="auth__row">
                <input
                  className="auth__input auth__input--code"
                  type="text"
                  name="countryCode"
                  placeholder="+57"
                  value={form.countryCode}
                  onChange={handleChange}
                  required
                />

                <input
                  className="auth__input"
                  type="tel"
                  name="phoneNumber"
                  placeholder="3001234567"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
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
                value={form.password}
                onChange={handleChange}
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
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>
            {error && <p className="auth__error">{error}</p>}

            <button className="btn btn--active auth__btn" type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear cuenta"}
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

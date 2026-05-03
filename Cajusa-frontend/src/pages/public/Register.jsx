import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import AppContext from "../../context/AppContext";

export default function Register() {

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    form.phoneNumber
  ;

  const {handleRegistration} = useContext(AppContext);
  
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const { email, password, confirmPassword, nickname } = form;

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
    const number = String(form.phoneNumber || "").replace(/\D/g, "");

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
      await handleRegistration({ name, nickname, email, password, confirmPassword, phone });
    } catch (err) {
      setError(err.message || "No se pudo registrar");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="py-[26px] pb-[46px]">
      <div className="container grid place-items-center">
        <div className="w-[min(520px,100%)] rounded-[18px] border border-[rgba(42,36,30,0.14)] bg-white/[0.35] p-[22px] shadow-[var(--shadow)]">
          <h1 className="m-0 text-[22px] tracking-[0.01em]">Registro</h1>
          <p className="mb-4 mt-2 leading-normal opacity-80">
            Crea tu cuenta para comprar más rápido y guardar tus favoritos.
          </p>

          <form className="grid gap-3" onSubmit={handleSubmit}>
            <label className="grid gap-1.5">
              <span className="text-[13px] opacity-85">Nombre completo</span>

              <div className="flex gap-2.5 max-[480px]:flex-col">
                <input
                  className="min-w-0 flex-1 rounded-xl border border-[rgba(42,36,30,0.14)] bg-white/25 px-3 py-2.5 outline-none focus:shadow-[0_0_0_3px_rgba(42,36,30,0.12)]"
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
                  className="min-w-0 flex-1 rounded-xl border border-[rgba(42,36,30,0.14)] bg-white/25 px-3 py-2.5 outline-none focus:shadow-[0_0_0_3px_rgba(42,36,30,0.12)]"
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

            <label className="grid gap-1.5">
              <span className="text-[13px] opacity-85">Nombre de usuario</span>
              <input
                className="rounded-xl border border-[rgba(42,36,30,0.14)] bg-white/25 px-3 py-2.5 outline-none focus:shadow-[0_0_0_3px_rgba(42,36,30,0.12)]"
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

            <label className="grid gap-1.5">
              <span className="text-[13px] opacity-85">Correo</span>
              <input
                className="rounded-xl border border-[rgba(42,36,30,0.14)] bg-white/25 px-3 py-2.5 outline-none focus:shadow-[0_0_0_3px_rgba(42,36,30,0.12)]"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[13px] opacity-85">Teléfono</span>

              <div className="flex gap-2.5 max-[480px]:flex-col">
                <input
                  className="w-full max-w-[90px] rounded-xl border border-[rgba(42,36,30,0.14)] bg-white/25 px-3 py-2.5 outline-none focus:shadow-[0_0_0_3px_rgba(42,36,30,0.12)] max-[480px]:max-w-none"
                  type="text"
                  name="countryCode"
                  placeholder="+57"
                  value={form.countryCode}
                  onChange={handleChange}
                  required
                />

                <input
                  className="min-w-0 flex-1 rounded-xl border border-[rgba(42,36,30,0.14)] bg-white/25 px-3 py-2.5 outline-none focus:shadow-[0_0_0_3px_rgba(42,36,30,0.12)]"
                  type="tel"
                  name="phoneNumber"
                  placeholder="3001234567"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <label className="grid gap-1.5">
              <span className="text-[13px] opacity-85">Contraseña</span>
              <input
                className="rounded-xl border border-[rgba(42,36,30,0.14)] bg-white/25 px-3 py-2.5 outline-none focus:shadow-[0_0_0_3px_rgba(42,36,30,0.12)]"
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

            <label className="grid gap-1.5">
              <span className="text-[13px] opacity-85">Confirmar contraseña</span>
              <input
                className="rounded-xl border border-[rgba(42,36,30,0.14)] bg-white/25 px-3 py-2.5 outline-none focus:shadow-[0_0_0_3px_rgba(42,36,30,0.12)]"
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
            {error && <p className="m-0 mt-2.5 text-sm text-[#d33]">{error}</p>}

            <button className="btn btn--active mt-1.5 w-full" type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear cuenta"}
            </button>
          </form>

          <p className="m-0 mt-3.5 opacity-85">
            ¿Ya tienes cuenta?{" "}
            <Link className="text-inherit underline underline-offset-4" to="/login">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

import { Link, useLocation } from "react-router-dom";
import { useState, useContext } from "react";
import AppContext from "../../context/AppContext";

export default function Login() {
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const { handleLogin } = useContext(AppContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isValid = form.email && form.password;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }


  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    handleLogin({ email: form.email, password: form.password, from })
      .catch((err) => {
        setError(err.message || "No se pudo iniciar sesión");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <main className="py-[26px] pb-[46px]">
      <div className="container grid place-items-center">
        <div className="w-[min(520px,100%)] rounded-[18px] border border-[rgba(42,36,30,0.14)] bg-white/[0.35] p-[22px] shadow-[var(--shadow)]">
          <h1 className="m-0 text-[22px] tracking-[0.01em]">Iniciar sesión</h1>
          <p className="mb-4 mt-2 leading-normal opacity-80">
            Accede para gestionar pedidos, favoritos y tu cuenta.
          </p>

          <form className="grid gap-3" onSubmit={handleSubmit}>
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
              <span className="text-[13px] opacity-85">Contraseña</span>
              <input
                className="rounded-xl border border-[rgba(42,36,30,0.14)] bg-white/25 px-3 py-2.5 outline-none focus:shadow-[0_0_0_3px_rgba(42,36,30,0.12)]"
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

            {error && <p className="m-0 mt-2.5 text-sm text-[#d33]">{error}</p>}

            <button className="btn btn--active mt-1.5 w-full" type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Iniciando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="m-0 mt-3.5 opacity-85">
            ¿No tienes cuenta?{" "}
            <Link className="text-inherit underline underline-offset-4" to="/register">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

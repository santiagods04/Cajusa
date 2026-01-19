import { useContext, useEffect, useMemo, useState } from "react";
import AppContext from "../../../context/AppContext";

const PHONE_RE = /^\+[1-9]\d{7,14}$/; // + y 8-15 digitos (E.164)
const PASS_SAFE_RE = /^(?=.*[A-Z])(?=.*\d).{8,}$/; // 8+ con 1 mayuscula y 1 numero

function getErrMessage(err, fallback = "Ocurrió un error") {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  if (err.error) return err.error;
  return fallback;
}

export default function MyAccount() {
  const {
    currentUser,
    onUpdatePersonalData,
    onUpdateEmail,
    onUpdatePassword,
  } = useContext(AppContext);

  const isAdmin = currentUser?.role === "admin";

  const addresses = useMemo(() => {
    if (!currentUser) return [];
    return Array.isArray(currentUser.addresses) ? currentUser.addresses : [];
  }, [currentUser]);

  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);

  // -------------------------
  // Form states (controlados)
  // -------------------------
  const [personal, setPersonal] = useState({ name: "", nickname: "", phone: "" });
  const [sessionEmail, setSessionEmail] = useState({ email: "" });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // -------------------------
  // UI state (loading + msgs)
  // -------------------------
  const [personalLoading, setPersonalLoading] = useState(false);
  const [personalError, setPersonalError] = useState("");
  const [personalOk, setPersonalOk] = useState("");

  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailOk, setEmailOk] = useState("");

  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passOk, setPassOk] = useState("");

  // Prefill desde currentUser (para que no se quede en blanco)
  useEffect(() => {
    if (!currentUser) return;

    setPersonal({
      name: currentUser.name || "",
      nickname: currentUser.nickname || "",
      phone: currentUser.phone || "",
    });

    setSessionEmail({
      email: currentUser.email || "",
    });
  }, [currentUser]);

  // -------------------------
  // Handlers submit
  // -------------------------
  const handleSubmitPersonal = (e) => {
    e.preventDefault();
    setPersonalError("");
    setPersonalOk("");

    const name = String(personal.name || "").trim();
    const nickname = String(personal.nickname || "").trim();
    const phone = String(personal.phone || "").trim();

    if (!name || !nickname || !phone) {
      setPersonalError("Completa todos los campos.");
      return;
    }
    if (name.length < 2 || name.length > 80) {
      setPersonalError("Nombre inválido (2 a 80 caracteres).");
      return;
    }
    if (nickname.length < 2 || nickname.length > 40) {
      setPersonalError("Nickname inválido (2 a 40 caracteres).");
      return;
    }
    if (!PHONE_RE.test(phone)) {
      setPersonalError("Teléfono inválido. Ej: +573001234567");
      return;
    }
    if (typeof onUpdatePersonalData !== "function") {
      setPersonalError("No existe onUpdatePersonalData en el contexto.");
      return;
    }

    setPersonalLoading(true);
    onUpdatePersonalData({ name, nickname, phone })
      .then(() => setPersonalOk("Datos personales actualizados."))
      .catch((err) => setPersonalError(getErrMessage(err, "No se pudieron actualizar los datos personales.")))
      .finally(() => setPersonalLoading(false));
  };

  const handleSubmitEmail = (e) => {
    e.preventDefault();
    setEmailError("");
    setEmailOk("");

    const email = String(sessionEmail.email || "").trim();
    if (!email) {
      setEmailError("El correo no puede ir vacío.");
      return;
    }
    if (typeof onUpdateEmail !== "function") {
      setEmailError("No existe onUpdateEmail en el contexto.");
      return;
    }

    setEmailLoading(true);
    onUpdateEmail({ email })
      .then(() => setEmailOk("Correo actualizado."))
      .catch((err) => setEmailError(getErrMessage(err, "No se pudo actualizar el correo.")))
      .finally(() => setEmailLoading(false));
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    setPassError("");
    setPassOk("");

    const currentPassword = passwords.currentPassword || "";
    const newPassword = passwords.newPassword || "";
    const confirmNewPassword = passwords.confirmNewPassword || "";

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPassError("Completa los 3 campos de contraseña.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPassError("La confirmación no coincide.");
      return;
    }
    if (newPassword === currentPassword) {
      setPassError("La nueva contraseña debe ser diferente a la actual.");
      return;
    }
    if (!PASS_SAFE_RE.test(newPassword)) {
      setPassError(
        "Contraseña insegura, debe incluir al menos 8 caracteres con 1 mayúscula y 1 número"
      );
      return;
    }
    if (typeof onUpdatePassword !== "function") {
      setPassError("No existe onUpdatePassword en el contexto.");
      return;
    }

    setPassLoading(true);
    onUpdatePassword({ currentPassword, newPassword, confirmNewPassword })
      .then(() => {
        setPassOk("Contraseña actualizada.");
        setPasswords({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      })
      .catch((err) => setPassError(getErrMessage(err, "No se pudo actualizar la contraseña.")))
      .finally(() => setPassLoading(false));
  };

  // -------------------------
  // Direcciones (NO TOCADO)
  // -------------------------
  function renderAddressesSection() {
    return (
      <section className="my-account__section" aria-labelledby="my-account-address">
        <h2 className="my-account__section-title" id="my-account-address">
          Direcciones de domicilio
        </h2>

        {!addresses.length && !isAddressFormOpen ? (
          <>
            <p className="my-account__hint">Sin direcciones guardadas.</p>

            <div className="my-account__actions">
              <button
                type="button"
                className="my-account__button"
                onClick={() => setIsAddressFormOpen(true)}
              >
                Agregar dirección
              </button>

              <p className="my-account__hint">
                (Después definimos si será 1 dirección o múltiples.)
              </p>
            </div>
          </>
        ) : (
          <form className="my-account__form" autoComplete="on">
            <div className="my-account__grid">
              <div className="my-account__field">
                <label className="my-account__label" htmlFor="my-account-department">
                  Departamento
                </label>
                <input
                  className="my-account__input"
                  id="my-account-department"
                  name="department"
                  type="text"
                  placeholder="Ej: Cundinamarca"
                />
              </div>

              <div className="my-account__field">
                <label className="my-account__label" htmlFor="my-account-city">
                  Ciudad / Municipio
                </label>
                <input
                  className="my-account__input"
                  id="my-account-city"
                  name="city"
                  type="text"
                  placeholder="Ej: Bogotá / Villeta"
                />
              </div>

              <div className="my-account__field">
                <label className="my-account__label" htmlFor="my-account-neighborhood">
                  Barrio
                </label>
                <input
                  className="my-account__input"
                  id="my-account-neighborhood"
                  name="neighborhood"
                  type="text"
                  placeholder="Ej: Centro"
                />
              </div>

              <div className="my-account__field">
                <label className="my-account__label" htmlFor="my-account-zip">
                  Código postal (opcional)
                </label>
                <input
                  className="my-account__input"
                  id="my-account-zip"
                  name="zip"
                  type="text"
                  placeholder="Ej: 110111"
                  inputMode="numeric"
                />
              </div>

              <div className="my-account__field my-account__field--full">
                <label className="my-account__label" htmlFor="my-account-address1">
                  Dirección
                </label>
                <input
                  className="my-account__input"
                  id="my-account-address1"
                  name="addressLine1"
                  type="text"
                  placeholder="Ej: Cra 5 # 6 - 24"
                  autoComplete="street-address"
                />
              </div>

              <div className="my-account__field my-account__field--full">
                <label className="my-account__label" htmlFor="my-account-address2">
                  Complemento (opcional)
                </label>
                <input
                  className="my-account__input"
                  id="my-account-address2"
                  name="addressLine2"
                  type="text"
                  placeholder="Apto, torre, interior, piso..."
                />
              </div>

              <div className="my-account__field my-account__field--full">
                <label className="my-account__label" htmlFor="my-account-notes">
                  Indicaciones para el mensajero (opcional)
                </label>
                <textarea
                  className="my-account__textarea"
                  id="my-account-notes"
                  name="deliveryNotes"
                  placeholder="Ej: Portería, timbre, referencias..."
                  rows={3}
                />
              </div>
            </div>

            <div className="my-account__actions">
              <button type="button" className="my-account__button">
                Guardar dirección
              </button>

              {!addresses.length && (
                <button
                  type="button"
                  className="my-account__button"
                  onClick={() => setIsAddressFormOpen(false)}
                >
                  Cancelar
                </button>
              )}

              <p className="my-account__hint">
                (Después definimos si será 1 dirección o múltiples.)
              </p>
            </div>
          </form>
        )}
      </section>
    );
  }

  return (
    <section className="my-account">
      <div className="container my-account__container">
        <header className="my-account__header">
          <h1 className="my-account__title">Mi cuenta</h1>
          <p className="my-account__subtitle">
            Actualiza tus datos, credenciales y direcciones.
          </p>
        </header>

        <div className="my-account__stack">
          {/* 1) Datos personales */}
          <section className="my-account__section" aria-labelledby="my-account-profile">
            <h2 className="my-account__section-title" id="my-account-profile">
              Datos personales
            </h2>

            <form className="my-account__form" autoComplete="on" onSubmit={handleSubmitPersonal}>
              <div className="my-account__grid">
                <div className="my-account__field">
                  <label className="my-account__label" htmlFor="my-account-fullname">
                    Nombre completo
                  </label>
                  <input
                    className="my-account__input"
                    id="my-account-fullname"
                    name="name"
                    type="text"
                    placeholder="Tu nombre completo"
                    value={personal.name}
                    onChange={(e) => setPersonal((p) => ({ ...p, name: e.target.value }))}
                    disabled={personalLoading}
                  />
                </div>

                <div className="my-account__field">
                  <label className="my-account__label" htmlFor="my-account-nickname">
                    Nickname
                  </label>
                  <input
                    className="my-account__input"
                    id="my-account-nickname"
                    name="nickname"
                    type="text"
                    placeholder="Tu nickname (máx 20)"
                    value={personal.nickname}
                    onChange={(e) => setPersonal((p) => ({ ...p, nickname: e.target.value }))}
                    disabled={personalLoading}
                  />
                </div>

                <div className="my-account__field my-account__field--span">
                  <label className="my-account__label" htmlFor="my-account-phone">
                    Teléfono
                  </label>
                  <input
                    className="my-account__input"
                    id="my-account-phone"
                    name="phone"
                    type="tel"
                    placeholder="Ej: +573001234567"
                    value={personal.phone}
                    onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value }))}
                    autoComplete="tel"
                    inputMode="tel"
                    disabled={personalLoading}
                  />
                </div>
              </div>

              {personalError && <p className="my-account__hint" style={{ color: "crimson" }}>{personalError}</p>}
              {personalOk && <p className="my-account__hint" style={{ color: "green" }}>{personalOk}</p>}

              <div className="my-account__actions">
                <button type="submit" className="my-account__button" disabled={personalLoading}>
                  {personalLoading ? "Guardando..." : "Guardar datos personales"}
                </button>
              </div>
            </form>
          </section>

          {/* 2) Datos de sesión */}
          <section className="my-account__section" aria-labelledby="my-account-session">
            <h2 className="my-account__section-title" id="my-account-session">
              Datos de sesión
            </h2>

            {/* Form 2.1: Actualizar correo */}
            <form
              className="my-account__form my-account__subform"
              autoComplete="on"
              onSubmit={handleSubmitEmail}
            >
              <h3 className="my-account__subform-title">Actualizar correo</h3>

              <div className="my-account__grid">
                <div className="my-account__field my-account__field--full">
                  <label className="my-account__label" htmlFor="my-account-email">
                    Correo actual
                  </label>
                  <input
                    className="my-account__input"
                    id="my-account-email"
                    name="email"
                    type="email"
                    placeholder="tucorreo@correo.com"
                    value={sessionEmail.email}
                    onChange={(e) => setSessionEmail({ email: e.target.value })}
                    autoComplete="email"
                    inputMode="email"
                    disabled={emailLoading}
                  />
                </div>
              </div>

              {emailError && <p className="my-account__hint" style={{ color: "crimson" }}>{emailError}</p>}
              {emailOk && <p className="my-account__hint" style={{ color: "green" }}>{emailOk}</p>}

              <div className="my-account__actions">
                <button type="submit" className="my-account__button" disabled={emailLoading}>
                  {emailLoading ? "Actualizando..." : "Actualizar correo"}
                </button>
              </div>
            </form>

            {/* Form 2.2: Actualizar contraseña */}
            <form
              className="my-account__form my-account__subform"
              autoComplete="on"
              onSubmit={handleSubmitPassword}
            >
              <h3 className="my-account__subform-title">Actualizar contraseña</h3>

              <div className="my-account__grid">
                <div className="my-account__field my-account__field--full">
                  <label className="my-account__label" htmlFor="my-account-current-password">
                    Contraseña actual
                  </label>
                  <input
                    className="my-account__input"
                    id="my-account-current-password"
                    name="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
                    }
                    disabled={passLoading}
                  />
                </div>

                <div className="my-account__field">
                  <label className="my-account__label" htmlFor="my-account-new-password">
                    Nueva contraseña
                  </label>
                  <input
                    className="my-account__input"
                    id="my-account-new-password"
                    name="newPassword"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords((p) => ({ ...p, newPassword: e.target.value }))
                    }
                    disabled={passLoading}
                  />
                </div>

                <div className="my-account__field">
                  <label className="my-account__label" htmlFor="my-account-confirm-password">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    className="my-account__input"
                    id="my-account-confirm-password"
                    name="confirmNewPassword"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={passwords.confirmNewPassword}
                    onChange={(e) =>
                      setPasswords((p) => ({ ...p, confirmNewPassword: e.target.value }))
                    }
                    disabled={passLoading}
                  />
                </div>
              </div>

              {passError && <p className="my-account__hint" style={{ color: "crimson" }}>{passError}</p>}
              {passOk && <p className="my-account__hint" style={{ color: "green" }}>{passOk}</p>}

              <div className="my-account__actions">
                <button type="submit" className="my-account__button" disabled={passLoading}>
                  {passLoading ? "Actualizando..." : "Actualizar contraseña"}
                </button>
              </div>
            </form>
          </section>

          {/* 3) Direcciones */}
          {!isAdmin && renderAddressesSection()}
        </div>
      </div>
    </section>
  );
}

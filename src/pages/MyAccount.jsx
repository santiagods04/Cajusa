import { useContext, useMemo, useState } from "react";
import AppContext from "../context/AppContext";

export default function MyAccount() {
    const { currentUser } = useContext(AppContext);

    const fullName = currentUser?.name || "";
    const nickname = currentUser?.nickname || "";
    const phone = currentUser?.phone || "";
    const email = currentUser?.email || "";

    const addresses = useMemo(() => {
        if (!currentUser) return [];
        return Array.isArray(currentUser.addresses) ? currentUser.addresses : [];
    }, [currentUser]);

    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);

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

                        <form className="my-account__form" autoComplete="on">
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
                                        defaultValue={fullName}
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
                                        defaultValue={nickname}
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
                                        placeholder="Ej: 3001234567"
                                        defaultValue={phone}
                                        autoComplete="tel"
                                        inputMode="tel"
                                    />
                                </div>
                            </div>

                            <div className="my-account__actions">
                                <button type="button" className="my-account__button">
                                    Guardar datos personales
                                </button>
                                <p className="my-account__hint">
                                    (Por ahora solo interfaz, sin guardar aún.)
                                </p>
                            </div>
                        </form>
                    </section>

                    {/* 2) Datos de sesión */}
                    <section className="my-account__section" aria-labelledby="my-account-session">
                        <h2 className="my-account__section-title" id="my-account-session">
                            Datos de sesión
                        </h2>

                        {/* Form 2.1: Actualizar correo */}
                        <form className="my-account__form my-account__subform" autoComplete="on">
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
                                        defaultValue={email}
                                        autoComplete="email"
                                        inputMode="email"
                                    />
                                </div>
                            </div>

                            <div className="my-account__actions">
                                <button type="button" className="my-account__button">
                                    Actualizar correo
                                </button>
                                <p className="my-account__hint">(Luego validamos confirmación y seguridad.)</p>
                            </div>
                        </form>

                        {/* Form 2.2: Actualizar contraseña */}
                        <form className="my-account__form my-account__subform" autoComplete="on">
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
                                    />
                                </div>

                                <div className="my-account__field">
                                    <label className="my-account__label" htmlFor="my-account-confirm-password">
                                        Confirmar nueva contraseña
                                    </label>
                                    <input
                                        className="my-account__input"
                                        id="my-account-confirm-password"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <div className="my-account__actions">
                                <button type="button" className="my-account__button">
                                    Actualizar contraseña
                                </button>
                                <p className="my-account__hint">(Luego ponemos reglas: mínimo 8, match, etc.)</p>
                            </div>
                        </form>
                    </section>

                    {/* 3) Direcciones */}
                    <section className="my-account__section" aria-labelledby="my-account-address">
                        <h2 className="my-account__section-title" id="my-account-address">
                            Direcciones de domicilio
                        </h2>

                        {/*  */}
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
                                    {/* --- AQUÍ PEGAS TU FORM ACTUAL TAL CUAL --- */}
                                    {/* Departamento, ciudad, barrio, zip, address1, address2, notes... */}
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
                </div>
            </div>
        </section>
    );
}

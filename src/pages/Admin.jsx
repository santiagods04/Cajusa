// src/pages/Admin.jsx
import "../blocks/admin.css";

export default function Admin() {
  return (
    <section className="admin">
      <div className="container admin__inner">
        <header className="admin__header">
          <div className="admin__heading">
            <h1 className="admin__title">Administración</h1>
            <p className="admin__subtitle">
              Gestiona productos (crear, editar, activar/desactivar y eliminar).
            </p>
          </div>

          <div className="admin__headerActions">
            <button type="button" className="admin__btn admin__btn--primary">
              Nuevo producto
            </button>
          </div>
        </header>

        <div className="admin__grid">
          {/* LISTA */}
          <section className="admin__card">
            <div className="admin__cardHeader">
              <h2 className="admin__cardTitle">Productos</h2>

              <div className="admin__tools">
                <input
                  className="admin__input admin__input--search"
                  type="text"
                  placeholder="Buscar por nombre o categoría…"
                />
                <span className="admin__count">0</span>
              </div>
            </div>

            <div className="admin__table">
              <div className="admin__row admin__row--head">
                <span className="admin__th admin__th--name">Nombre</span>
                <span className="admin__th">Categoría</span>
                <span className="admin__th admin__th--right">Precio</span>
                <span className="admin__th">Estado</span>
                <span className="admin__th admin__th--right">Acciones</span>
              </div>

              {/* Placeholder (luego lo reemplazamos por map(products)) */}
              <div className="admin__row admin__row--empty">
                <p className="admin__emptyTitle">Aún no hay productos cargados</p>
                <p className="admin__emptyText">
                  Crea tu primer producto con el formulario de la derecha.
                </p>
              </div>
            </div>
          </section>

          {/* FORM */}
          <section className="admin__card">
            <div className="admin__cardHeader">
              <h2 className="admin__cardTitle">Crear / editar producto</h2>
              <p className="admin__cardHint">Este formulario lo conectamos al CRUD después.</p>
            </div>

            <form className="admin__form">
              <label className="admin__field">
                <span className="admin__label">Nombre</span>
                <input className="admin__input" type="text" placeholder="Ej: Filipina antifluido premium" />
              </label>

              <label className="admin__field">
                <span className="admin__label">Categoría</span>
                <input className="admin__input" type="text" placeholder="Ej: Dental" />
              </label>

              <label className="admin__field">
                <span className="admin__label">Precio</span>
                <input className="admin__input" type="number" min="0" placeholder="125000" />
              </label>

              <label className="admin__field admin__field--full">
                <span className="admin__label">Imagen (URL)</span>
                <input className="admin__input" type="url" placeholder="https://..." />
              </label>

              <label className="admin__check admin__field--full">
                <input className="admin__checkbox" type="checkbox" defaultChecked />
                <span className="admin__checkText">Producto activo (visible en catálogo)</span>
              </label>

              <div className="admin__formActions admin__field--full">
                <button type="submit" className="admin__btn admin__btn--primary">
                  Guardar
                </button>
                <button type="button" className="admin__btn admin__btn--ghost">
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </section>
  );
}

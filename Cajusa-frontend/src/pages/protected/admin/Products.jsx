import { useContext, useMemo, useEffect } from 'react';
import AppContext from "../../../context/AppContext";

function formatCop(value) {
    const num = Number(value);
    if (Number.isNaN(num)) return '—';

    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(num);
}

export default function Products() {
    const {
        products,
        productsLoading,
        productsError,
        onProductsReload,
        openCreateProductPopup,
        openEditProductPopup,
        onProductDelete,
    } = useContext(AppContext);

    useEffect(() => {
        if (!Array.isArray(products) || products.length === 0) {
            onProductsReload?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const rows = useMemo(() => (Array.isArray(products) ? products : []), [products]);

    const handleCreate = () => {
        openCreateProductPopup?.();
    };

    const handleEdit = (product) => {
        openEditProductPopup?.(product);
    };

    const handleDelete = (productId, productName) => {
        const ok = window.confirm(`¿Seguro que quieres borrar "${productName}"?`);
        if (!ok) return;

        if (onProductDelete) onProductDelete(productId);
    };

    return (
        <section className="products">
            <div className="products__container">
                <header className="products__header">
                    <div className="products__heading">
                        <h1 className="products__title">Productos</h1>
                        <p className="products__subtitle">Crea, edita y elimina productos del catálogo.</p>
                    </div>

                    <button
                        type="button"
                        className="products__btn products__btn_type_create"
                        onClick={handleCreate}
                    >
                        Crear producto
                    </button>
                </header>

                {productsError && <div className="products__alert">{productsError}</div>}

                <div className="products__content">
                    {productsLoading ? (
                        <div className="products__empty">
                            <p className="products__empty-text">Cargando productos…</p>
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="products__empty">
                            <p className="products__empty-text">No hay productos</p>
                        </div>
                    ) : (
                        <div className="products__table-wrap">
                            <table className="products__table">
                                <thead className="products__thead">
                                    <tr className="products__tr">
                                        <th className="products__th">Código</th>
                                        <th className="products__th">Nombre</th>
                                        <th className="products__th">Categoría</th>
                                        <th className="products__th">Línea</th>
                                        <th className="products__th products__th_align_right">Precio</th>
                                        <th className="products__th products__th_align_center">Variantes</th>
                                        <th className="products__th products__th_align_right">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody className="products__tbody">
                                    {rows.map((p) => {
                                        const variantsCount = Array.isArray(p.variants) ? p.variants.length : 0;

                                        return (
                                            <tr key={p._id} className="products__tr products__tr_body">
                                                <td className="products__td">
                                                    <span className="products__code">{p.code || '—'}</span>
                                                </td>

                                                <td className="products__td">
                                                    <div className="products__name-wrap">
                                                        <span className="products__name">{p.name}</span>
                                                        {p.subcategory && (
                                                            <span className="products__meta">{p.subcategory}</span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="products__td">
                                                    <span className="products__category">{p.category || '—'}</span>
                                                </td>

                                                <td className="products__td">
                                                    <span className="products__line">{p.line || '—'}</span>
                                                </td>

                                                <td className="products__td products__td_align_right">
                                                    <span className="products__price">{formatCop(p.price)}</span>
                                                </td>

                                                <td className="products__td products__td_align_center">
                                                    <span className="products__badge">{variantsCount}</span>
                                                </td>

                                                <td className="products__td products__td_align_right">
                                                    <div className="products__actions">
                                                        <button
                                                            type="button"
                                                            className="products__icon-btn products__icon-btn_type_edit"
                                                            onClick={() => handleEdit(p._id)}
                                                            aria-label="Actualizar producto"
                                                            title="Actualizar"
                                                        >
                                                            <svg className="products__icon" viewBox="0 0 24 24" aria-hidden="true">
                                                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.83H5v-.92l9.06-9.06.92.92L5.92 20.08zM20.71 7.04a1.003 1.003 0 0 0 0-1.42L18.37 3.29a1.003 1.003 0 0 0-1.42 0l-1.53 1.53 3.75 3.75 1.54-1.53z" />
                                                            </svg>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="products__icon-btn products__icon-btn_type_delete"
                                                            onClick={() => handleDelete(p._id, p.name)}
                                                            aria-label="Borrar producto"
                                                            title="Borrar"
                                                        >
                                                            <svg className="products__icon" viewBox="0 0 24 24" aria-hidden="true">
                                                                <path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2zM9 9h2v10H9V9zm4 0h2v10h-2V9z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <footer className="products__footer">
                                <button
                                    type="button"
                                    className="products__btn products__btn_type_secondary"
                                    onClick={() => onProductsReload && onProductsReload()}
                                >
                                    Recargar
                                </button>

                                <span className="products__count">{rows.length} producto(s)</span>
                            </footer>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

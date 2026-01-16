// src/forms/ProductForm/ProductForm.jsx
import { useEffect, useState } from 'react';

const DEFAULT_VALUES = {
    code: '',
    name: '',
    price: '',
    category: '',
    subcategory: '',
    line: '',
    description: '',
};

function ProductForm({
    initialValues = DEFAULT_VALUES,
    submitText = "Guardar",
    onSubmit,
    isSubmitting = false,
    submitError = "",
}) {
    const [values, setValues] = useState(DEFAULT_VALUES);

    useEffect(() => {
        setValues({ ...DEFAULT_VALUES, ...(initialValues || {}) });
    }, [initialValues]);

    function handleChange(e) {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();

        const payload = {
            ...values,
            price: Number(values.price),
        };

        onSubmit?.(payload);
    }

    return (
        <form className="popup__form" onSubmit={handleSubmit} noValidate>
            <div className="popup__grid">
                <div className="popup__field">
                    <label className="popup__label" htmlFor="code">Código</label>
                    <input
                        className="popup__input"
                        id="code"
                        name="code"
                        value={values.code}
                        onChange={handleChange}
                        placeholder="CAJ-001"
                    />
                </div>

                <div className="popup__field">
                    <label className="popup__label" htmlFor="name">Nombre</label>
                    <input
                        className="popup__input"
                        id="name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        placeholder="Nombre del producto"
                        required
                    />
                </div>

                <div className="popup__field">
                    <label className="popup__label" htmlFor="price">Precio</label>
                    <input
                        className="popup__input"
                        id="price"
                        name="price"
                        value={values.price}
                        onChange={handleChange}
                        placeholder="120000"
                        inputMode="numeric"
                        required
                    />
                </div>

                <div className="popup__field">
                    <label className="popup__label" htmlFor="line">Línea</label>
                    <input
                        className="popup__input"
                        id="line"
                        name="line"
                        value={values.line}
                        onChange={handleChange}
                        placeholder="Antifluido/Lino"
                    />
                </div>

                <div className="popup__field">
                    <label className="popup__label" htmlFor="category">Categoría</label>
                    <input
                        className="popup__input"
                        id="category"
                        name="category"
                        value={values.category}
                        onChange={handleChange}
                        placeholder="Antifluido"
                    />
                </div>

                <div className="popup__field">
                    <label className="popup__label" htmlFor="subcategory">Subcategoría</label>
                    <input
                        className="popup__input"
                        id="subcategory"
                        name="subcategory"
                        value={values.subcategory}
                        onChange={handleChange}
                        placeholder="Uniformes"
                    />
                </div>


                <div className="popup__field popup__field_span_2">
                    <label className="popup__label" htmlFor="description">Descripción</label>
                    <textarea
                        className="popup__textarea"
                        id="description"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        placeholder="Describe el producto..."
                        rows={4}
                    />
                </div>
            </div>

            <div className="popup__actions">
                <button className="popup__submit" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando…' : submitText}
                </button>
                {submitError && <p className="popup__error">{submitError}</p>}
            </div>
        </form>
    );
}

export default ProductForm;
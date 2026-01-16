// src/forms/ProductForm/ProductForm.jsx
import { useEffect, useState, useContext, useRef } from 'react';
import AppContext from '../../../context/AppContext';

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

    const { openImageOverlay } = useContext(AppContext);
    const [values, setValues] = useState(DEFAULT_VALUES);
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);

    useEffect(() => {
        setValues({ ...DEFAULT_VALUES, ...(initialValues || {}) });

        const imgs = Array.isArray(initialValues?.images)
            ? initialValues.images.filter((img) => typeof img === 'string')
            : [];
        setExistingImages(imgs);


        setNewImages(function clearPrev(prev) {
            prev.forEach(function (item) {
                URL.revokeObjectURL(item.url);
            });
            return [];
        });
    }, [initialValues]);

    const newImagesRef = useRef([]);

    useEffect(() => {
        newImagesRef.current = newImages;
    }, [newImages]);

    useEffect(() => {
        return function cleanupOnUnmount() {
            newImagesRef.current.forEach((item) => {
                URL.revokeObjectURL(item.url);
            });
        };
    }, []);


    function handleChange(e) {
        const name = e.target.name;
        const value = e.target.value;

        setValues(function (prev) {
            return { ...prev, [name]: value };
        });
    }

    function handleFilesChange(e) {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const mapped = files.map(function (file) {
            return {
                file,
                url: URL.createObjectURL(file),
            };
        });

        setNewImages(function (prev) {
            return prev.concat(mapped);
        });
        e.target.value = "";
    }

    function removeExistingImage(url) {
        setExistingImages(function (prev) {
            return prev.filter(function (u) {
                return u !== url;
            });
        });
    }

    function removeNewImage(url) {
        setNewImages(function (prev) {
            const found = prev.find(function (i) {
                return i.url === url;
            });
            if (found) URL.revokeObjectURL(found.url);

            return prev.filter(function (i) {
                return i.url !== url;
            });
        });
    }

    function previewImage(url) {

        if (openImageOverlay) openImageOverlay(url);
    }

    function handleSubmit(e) {
        e.preventDefault();

        const payload = {
            ...values,
            price: Number(values.price),
            images: existingImages
        };

        const files = newImages.map(function (i) {
            return i.file;
        });

        onSubmit?.(payload, files);
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
                {/* --- IMÁGENES: selector --- */}
                <div className="popup__field">
                    <label className="popup__label" htmlFor="product-images">
                        Imágenes del producto
                    </label>

                    <input
                        id="product-images"
                        className="popup__file"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFilesChange}
                    />

                    <p className="popup__hint">JPG, PNG, WEBP… Puedes seleccionar varias.</p>

                    {/* --- previews existentes + nuevas --- */}
                    {(existingImages.length > 0 || newImages.length > 0) && (
                        <div className="popup__thumbs">
                            {existingImages.map(function (url) {
                                return (
                                    <div className="popup__thumb" key={url}>
                                        <button
                                            type="button"
                                            className="popup__thumb-btn"
                                            onClick={function () {
                                                previewImage(url);
                                            }}
                                        >
                                            <img className="popup__thumb-img" src={url} alt="Imagen del producto" />
                                        </button>

                                        <button
                                            type="button"
                                            className="popup__thumb-remove"
                                            aria-label="Quitar imagen"
                                            onClick={function () {
                                                removeExistingImage(url);
                                            }}
                                        />
                                    </div>
                                );
                            })}

                            {newImages.map(function (item) {
                                return (
                                    <div className="popup__thumb" key={item.url}>
                                        <button
                                            type="button"
                                            className="popup__thumb-btn"
                                            onClick={function () {
                                                previewImage(item.url);
                                            }}
                                        >
                                            <img className="popup__thumb-img" src={item.url} alt="Nueva imagen" />
                                        </button>

                                        <button
                                            type="button"
                                            className="popup__thumb-remove"
                                            aria-label="Quitar imagen"
                                            onClick={function () {
                                                removeNewImage(item.url);
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
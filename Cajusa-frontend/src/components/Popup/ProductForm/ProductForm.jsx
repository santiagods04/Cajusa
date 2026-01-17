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
    images: [],
    newImages: [],
    variants: [],
    tags: [],
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
    // const [existingImages, setExistingImages] = useState([]);
    // const [newImages, setNewImages] = useState([]);
    const [isVariantFormOpen, setIsVariantFormOpen] = useState(false);
    const [variantDraft, setVariantDraft] = useState({ size: "", color: "", quantity: 1 });
    const [variantError, setVariantError] = useState("");
    const [isTagFormOpen, setIsTagFormOpen] = useState(false);
    const [tagDraft, setTagDraft] = useState("");
    const [tagError, setTagError] = useState("");

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
            return { file, url: URL.createObjectURL(file) };
        });

        setValues(function (prev) {
            return {
                ...prev,
                newImages: (prev.newImages || []).concat(mapped),
            };
        });

        e.target.value = "";
    }

    function removeExistingImage(url) {
        setValues(function (prev) {
            return {
                ...prev,
                images: (prev.images || []).filter((u) => u !== url),
            };
        });
    }


    function removeNewImage(url) {
        setValues(function (prev) {
            return {
                ...prev,
                newImages: (prev.newImages || []).filter((i) => i.url !== url),
            };
        });
    }

    function previewImage(url) {

        if (openImageOverlay) openImageOverlay(url);
    }

    function normalizeVariants(input) {
        if (!Array.isArray(input)) return [];

        return input
            .filter((v) => v && typeof v === "object")
            .map((v) => {
                const qty =
                    typeof v.quantity === "number"
                        ? v.quantity
                        : (v.available ? 1 : 0);

                return {
                    _id: v._id,
                    size: String(v.size || "").trim(),
                    color: String(v.color || "").trim(),
                    quantity: Number.isFinite(qty) ? qty : 1,
                };
            })
            .filter((v) => v.size && v.color);
    }

    function openVariantForm() {
        setVariantDraft({ size: "", color: "", quantity: 1 });
        setVariantError("");
        setIsVariantFormOpen(true);
    }

    function closeVariantForm() {
        setVariantError("");
        setIsVariantFormOpen(false);
    }

    function handleVariantDraftChange(e) {
        const { name, value } = e.target;

        setVariantDraft((prev) => {
            if (name === "quantity") return { ...prev, quantity: Number(value) };
            return { ...prev, [name]: value };
        });
    }

    function saveVariant() {
        const size = String(variantDraft.size || "").trim();
        const color = String(variantDraft.color || "").trim();
        const quantity = Number(variantDraft.quantity);

        if (!size || !color) {
            setVariantError("Debes ingresar talla y color.");
            return;
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
            setVariantError("La cantidad debe ser mayor a 0.");
            return;
        }

        setVariantError("");

        setValues(function (prev) {
            const prevVariants = Array.isArray(prev.variants) ? prev.variants : [];

            const idx = prevVariants.findIndex(
                (v) =>
                    String(v.size).toLowerCase() === size.toLowerCase()
                    && String(v.color).toLowerCase() === color.toLowerCase()
            );

            let nextVariants;
            if (idx !== -1) {
                nextVariants = [...prevVariants];
                nextVariants[idx] = { ...nextVariants[idx], size, color, quantity };
            } else {
                nextVariants = prevVariants.concat({ size, color, quantity });
            }

            return { ...prev, variants: nextVariants };
        });

        setIsVariantFormOpen(false);
        setVariantDraft({ size: "", color: "", quantity: 1 });
    }

    function removeVariant(index) {
        setValues(function (prev) {
            const prevVariants = Array.isArray(prev.variants) ? prev.variants : [];
            return {
                ...prev,
                variants: prevVariants.filter((_, i) => i !== index),
            };
        });
    }

    function openTagForm() {
        setIsTagFormOpen(true);
        setTagError("");
    }

    function closeTagForm() {
        setIsTagFormOpen(false);
        setTagDraft("");
        setTagError("");
    }

    function handleTagDraftChange(e) {
        setTagDraft(e.target.value);
    }

    const MAX_TAGS = 10;

    function normalizeTag(raw) {
        return String(raw || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");
    }

    function normalizeTags(arr) {
        if (!Array.isArray(arr)) return [];
        const out = [];
        arr.forEach((t) => {
            const nt = normalizeTag(t);
            if (!nt) return;
            if (!out.includes(nt)) out.push(nt);
        });
        return out;
    }

    function addTag(raw) {
        const rawValue = raw && raw.target ? undefined : raw;
        const text = normalizeTag(raw ?? tagDraft);

        if (!text) {
            setTagError("Escribe un tag primero.");
            return;
        }

        setValues((prev) => {
            const current = Array.isArray(prev.tags) ? prev.tags : [];

            if (current.length >= MAX_TAGS) {
                setTagError(`Máximo ${MAX_TAGS} tags.`);
                return prev;
            }

            if (current.includes(text)) {
                setTagError("Ese tag ya existe.");
                return prev;
            }

            setTagError("");
            return { ...prev, tags: current.concat(text) };
        });

        closeTagForm();
    }

    function removeTag(index) {
        setValues((prev) => {
            const current = Array.isArray(prev.tags) ? prev.tags : [];
            return { ...prev, tags: current.filter((_, i) => i !== index) };
        });
    }

    function handleTagKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        }
    }

    function handleTagPaste(e) {
        const pasted = e.clipboardData.getData("text");
        if (!pasted || !pasted.includes(",")) return;

        e.preventDefault();
        pasted.split(",").forEach((t) => addTag(t));
    }


    useEffect(() => {
        const nextTags = normalizeTags(initialValues?.tags);
        const imgs = Array.isArray(initialValues?.images)
            ? initialValues.images.filter((img) => typeof img === "string")
            : [];

        setValues({
            ...DEFAULT_VALUES,
            ...(initialValues || {}),
            images: imgs,
            newImages: [],
            variants: normalizeVariants(initialValues?.variants),
            tags: nextTags
        });

        setVariantDraft({ size: "", color: "", quantity: 1 });
        setIsVariantFormOpen(false);
        setVariantError("");
        setIsTagFormOpen(false);
        setTagDraft('');
        setTagError('');
    }, [initialValues]);

    const newImagesRef = useRef([]);

    useEffect(() => {
        newImagesRef.current = values.newImages;
    }, [values.newImages]);

    useEffect(() => {
        return function cleanupOnUnmount() {
            newImagesRef.current.forEach((item) => {
                URL.revokeObjectURL(item.url);
            });
        };
    }, []);

    function fileToBase64(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () { resolve(reader.result); };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function buildPayload(values) {
        const newImagesBase64 = await Promise.all(
            (values.newImages || []).map(function (img) {
                return fileToBase64(img.file);
            })
        );

        return {
            code: values.code,
            line: values.line,
            category: values.category,
            subcategory: values.subcategory,
            name: values.name,
            price: Number(values.price),
            description: values.description,
            images: (values.images || []).concat(newImagesBase64),
            variants: values.variants.map(function (v) {
                return {
                    size: v.size,
                    color: v.color,
                    quantity: Number(v.quantity),
                };
            }),
            tags: values.tags,
        };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const payload = await buildPayload(values);
        createProduct(payload);
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
                        required
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
                        required
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
                        required
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
                        required
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
                        required
                    />
                </div>

                <div className="popup__field">
                    <label className="popup__label">
                        Imágenes del producto
                    </label>

                    <div className="popup__file-row">
                        <input
                            id="product-images"
                            className="popup__file-input"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFilesChange}
                            required
                        />

                        <label className="popup__btn" htmlFor="product-images">
                            Elegir archivos
                        </label>

                        <span className="popup__file-text">
                            {values.newImages?.length
                                ? `${values.newImages.length} archivo(s) seleccionado(s)`
                                : "Ningún archivo seleccionado"}
                        </span>
                    </div>

                    <p className="popup__hint">JPG, PNG, WEBP… Puedes seleccionar varias.</p>

                    {(values.images.length > 0 || values.newImages.length > 0) && (
                        <div className="popup__thumbs">
                            {/* tu render de thumbs EXISTING */}
                            {values.images.map(function (url) {
                                return (
                                    <div className="popup__thumb" key={url}>
                                        <button
                                            type="button"
                                            className="popup__thumb-btn"
                                            onClick={function () { previewImage(url); }}
                                        >
                                            <img className="popup__thumb-img" src={url} alt="Imagen del producto" />
                                        </button>

                                        <button
                                            type="button"
                                            className="popup__thumb-remove"
                                            aria-label="Quitar imagen"
                                            onClick={function () { removeExistingImage(url); }}
                                        />
                                    </div>
                                );
                            })}

                            {/* tu render de thumbs NEW */}
                            {values.newImages.map(function (item) {
                                return (
                                    <div className="popup__thumb" key={item.url}>
                                        <button
                                            type="button"
                                            className="popup__thumb-btn"
                                            onClick={function () { previewImage(item.url); }}
                                        >
                                            <img className="popup__thumb-img" src={item.url} alt="Nueva imagen" />
                                        </button>

                                        <button
                                            type="button"
                                            className="popup__thumb-remove"
                                            aria-label="Quitar imagen"
                                            onClick={function () { removeNewImage(item.url); }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="popup__field">
                    <label className="popup__label">Variantes</label>

                    {values.variants.length > 0 && (
                        <div className="popup__variants">
                            {values.variants.map((v, index) => (
                                <div className="popup__variant" key={`${v.size}-${v.color}-${index}`}>
                                    <span className="popup__variant-text">
                                        {v.size} · {v.color} · {v.quantity}
                                    </span>

                                    <button
                                        type="button"
                                        className="popup__variant-remove"
                                        aria-label="Eliminar variante"
                                        onClick={() => removeVariant(index)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {!isVariantFormOpen && (
                        <button
                            type="button"
                            className="popup__btn"
                            onClick={openVariantForm}
                        >
                            Agregar variante
                        </button>
                    )}

                    {isVariantFormOpen && (
                        <div className="popup__variant-form">
                            <input
                                className="popup__input"
                                name="size"
                                placeholder="Talla (S, M, L...)"
                                value={variantDraft.size}
                                onChange={handleVariantDraftChange}
                                required
                            />

                            <input
                                className="popup__input"
                                name="color"
                                placeholder="Color"
                                value={variantDraft.color}
                                onChange={handleVariantDraftChange}
                                required
                            />

                            <input
                                className="popup__input"
                                name="quantity"
                                type="number"
                                min="1"
                                placeholder="Cantidad"
                                value={variantDraft.quantity}
                                onChange={handleVariantDraftChange}
                                required
                            />

                            <div className="popup__variant-actions">
                                <button type="button" className="popup__btn" onClick={saveVariant}>
                                    Guardar variante
                                </button>
                                <button type="button" className="popup__btn" onClick={closeVariantForm}>
                                    Cancelar
                                </button>
                            </div>

                            {variantError && <p className="popup__error">{variantError}</p>}
                        </div>
                    )}
                </div>

                <div className="popup__field">
                    {isTagFormOpen ? (
                        <label className="popup__label" htmlFor="product-tags">Tags</label>
                    ) : (
                        <span className="popup__label">Tags</span>
                    )}

                    {values.tags?.length > 0 && (
                        <div className="popup__chips">
                            {values.tags.map((tag, index) => (
                                <div className="popup__chip" key={`${tag}-${index}`}>
                                    <span className="popup__chip-text">{tag}</span>

                                    <button
                                        type="button"
                                        className="popup__chip-remove"
                                        aria-label="Quitar tag"
                                        onClick={() => removeTag(index)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {!isTagFormOpen && (
                        <button
                            type="button"
                            className="popup__btn popup__tag-add"
                            onClick={openTagForm}
                        >
                            Agregar Tag
                        </button>
                    )}

                    {isTagFormOpen && (
                        <div className="popup__tag-form">
                            <input
                                id="product-tags"
                                className="popup__input"
                                type="text"
                                placeholder="Ej: antifluido"
                                value={tagDraft}
                                onChange={handleTagDraftChange}
                                onKeyDown={handleTagKeyDown}
                                onPaste={handleTagPaste}
                                autoFocus
                                required
                            />

                            <div className="popup__tag-actions">
                                <button type="button" className="popup__btn" onClick={() => addTag()}>
                                    Guardar Tag
                                </button>

                                <button type="button" className="popup__btn" onClick={closeTagForm}>
                                    Cancelar
                                </button>
                            </div>

                            {tagError && <p className="popup__error">{tagError}</p>}
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
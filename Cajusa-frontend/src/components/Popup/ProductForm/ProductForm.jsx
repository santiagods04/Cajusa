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
    const isEdit = Boolean(initialValues?._id);
    const FIELDS = [
        "code",
        "name",
        "line",
        "category",
        "subcategory",
        "price",
        "description",
        "images",
        "variants",
        "tags",
    ];

    const EMPTY_ERRORS = Object.fromEntries(FIELDS.map((k) => [k, ""]));
    const EMPTY_TOUCHED = Object.fromEntries(FIELDS.map((k) => [k, false]));

    const { openImageOverlay } = useContext(AppContext);
    const [values, setValues] = useState(DEFAULT_VALUES);
    const [errors, setErrors] = useState(EMPTY_ERRORS);
    const [touched, setTouched] = useState(EMPTY_TOUCHED);
    const [isVariantFormOpen, setIsVariantFormOpen] = useState(false);
    const [variantDraft, setVariantDraft] = useState({ size: "", color: "", quantity: 1 });
    const [isTagFormOpen, setIsTagFormOpen] = useState(false);
    const [tagDraft, setTagDraft] = useState("");

    function setFieldError(field, message) {
        setTouched((prev) => ({ ...prev, [field]: true }));
        setErrors((prev) => ({ ...prev, [field]: message }));
    }


    const MAX_FILES = 6;
    const MAX_SIZE = 1.5 * 1024 * 1024; // 1.5MB

    function validateField(field, value, allValues) {
        const v = typeof value === "string" ? value.trim() : value;

        switch (field) {
            case "code": {
                if (!v) return "El código es obligatorio.";
                if (v.length < 3) return "El código debe tener mínimo 3 caracteres.";
                if (v.length > 60) return "El código no puede superar 60 caracteres.";
                return "";
            }

            case "name": {
                if (!v) return "El nombre es obligatorio.";
                if (v.length < 2) return "El nombre debe tener mínimo 2 caracteres.";
                if (v.length > 120) return "El nombre no puede superar 120 caracteres.";
                return "";
            }

            case "line":
            case "category": {
                if (!v) return "Este campo es obligatorio.";
                if (v.length < 2) return "Debe tener mínimo 2 caracteres.";
                if (v.length > 60) return "No puede superar 60 caracteres.";
                return "";
            }

            case "subcategory": {
                if (!v) return "La subcategoría es obligatoria.";
                if (v.length > 60) return "No puede superar 60 caracteres.";
                return "";
            }

            case "price": {
                const n = Number(value);
                if (value === "" || value === null || value === undefined) return "El precio es obligatorio.";
                if (Number.isNaN(n)) return "El precio debe ser un número.";
                if (n < 0) return "El precio no puede ser negativo.";
                return "";
            }

            case "description": {
                if (!v) return "Este campo Descripción es obligatorio.";
                if (v && v.length > 600) return "La descripción no puede superar 600 caracteres.";
                return "";
            }

            case "images": {
                const existingCount = Array.isArray(allValues.images) ? allValues.images.length : 0;
                const newImgs = Array.isArray(allValues.newImages) ? allValues.newImages : [];
                const newCount = newImgs.length;
                const total = existingCount + newCount;

                if (total <= 0) return "Debes subir al menos 1 imagen.";
                if (total > MAX_FILES) return `Máximo ${MAX_FILES} imágenes por producto.`;

                const newFiles = newImgs.map((x) => x && x.file).filter(Boolean);

                const invalidType = newFiles.find((f) => !String(f.type || "").startsWith("image/"));
                if (invalidType) return `El archivo "${invalidType.name}" no es una imagen válida.`;

                const tooBig = newFiles.find((f) => f.size > MAX_SIZE);
                if (tooBig) {
                    const mb = (tooBig.size / 1024 / 1024).toFixed(2);
                    return `Cada imagen debe pesar máximo 1.5MB. "${tooBig.name}" pesa ${mb}MB.`;
                }

                return "";
            }

            case "variants": {
                const list = Array.isArray(allValues.variants) ? allValues.variants : [];

                if (list.length === 0) return "Agrega al menos 1 variante.";

                // opcional pero recomendado: blindaje por si llegan duplicadas desde initialValues
                const seen = new Set();
                for (const v of list) {
                    const key = `${String(v.size || "").trim().toLowerCase()}__${String(v.color || "").trim().toLowerCase()}`;
                    if (seen.has(key)) return "Tienes variantes duplicadas (talla + color).";
                    seen.add(key);
                }

                return "";
            }


            case "tags": {
                const raw = Array.isArray(allValues.tags) ? allValues.tags : [];

                const clean = raw
                    .map((t) => String(t || "").trim().toLowerCase())
                    .filter(Boolean);

                if (clean.length === 0) return "Agrega al menos 1 tag.";
                if (clean.length > MAX_TAGS) return `Máximo ${MAX_TAGS} tags.`;

                const seen = new Set();
                for (const key of clean) {
                    if (seen.has(key)) return "Tienes tags duplicados.";
                    seen.add(key);
                }

                return "";
            }

            default:
                return "";
        }
    }

    function commit(updater, fieldsToValidate, forcedErrors) {
        setValues((prev) => {
            const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };

            // touched
            setTouched((t) => {
                const nt = { ...t };
                fieldsToValidate.forEach((f) => { nt[f] = true; });
                return nt;
            });

            // errors
            setErrors((e) => {
                const ne = { ...e };

                fieldsToValidate.forEach((f) => {
                    // si hay forcedErrors para ese campo, gana
                    if (forcedErrors && Object.prototype.hasOwnProperty.call(forcedErrors, f)) {
                        ne[f] = forcedErrors[f];
                        return;
                    }
                    ne[f] = validateField(f, next[f], next);
                });

                return ne;
            });

            return next;
        });
    }

    function handleBlur(e) {
        const { name } = e.target;
        if (!name) return;
        commit((prev) => prev, [name]);
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setValues((prev) => {
            const next = { ...prev, [name]: value };

            if (touched[name]) {
                setFieldError(name, validateField(name, value, next));
            }

            return next;
        });
    }

    function validateAll(allValues) {
        const nextErrors = { ...EMPTY_ERRORS };

        FIELDS.forEach((field) => {
            const value = allValues[field];
            nextErrors[field] = validateField(field, value, allValues);
        });

        setErrors(nextErrors);

        const hasErrors = Object.values(nextErrors).some(Boolean);
        if (hasErrors) {
            setTouched(Object.fromEntries(FIELDS.map((k) => [k, true])));
        }

        return !hasErrors;
    }


    function handleFilesChange(e) {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const mapped = files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));

        const nextValues = {
            ...values,
            newImages: (values.newImages || []).concat(mapped),
        };

        const msg = validateField("images", null, nextValues);

        if (msg) {
            mapped.forEach((m) => URL.revokeObjectURL(m.url));
            commit((prev) => prev, ["images"], { images: msg });
            e.target.value = "";
            return;
        }

        commit(
            (prev) => ({
                ...prev,
                newImages: (prev.newImages || []).concat(mapped),
            }),
            ["images"]
        );

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
        setIsVariantFormOpen(true);
        commit((prev) => prev, ["variants"], { variants: "" });
    }

    function closeVariantForm() {
        setIsVariantFormOpen(false);
        setVariantDraft({ size: "", color: "", quantity: 1 });
        commit((prev) => prev, ["variants"], { variants: "" });
    }

    function handleVariantDraftChange(e) {
        const { name, value } = e.target;
        setVariantDraft((prev) => {
            if (name === "quantity") return { ...prev, quantity: Number(value) };
            return { ...prev, [name]: value };
        });
        setErrors((prev) => ({ ...prev, variants: "" }));
    }

    function saveVariant() {
        const size = String(variantDraft.size || "").trim();
        const color = String(variantDraft.color || "").trim();
        const quantity = Number(variantDraft.quantity);

        let msg = "";
        if (!size || !color) msg = "Debes ingresar talla y color.";
        else if (!Number.isFinite(quantity) || quantity <= 0) msg = "La cantidad debe ser mayor a 0.";

        if (msg) {
            commit((prev) => prev, ["variants"], { variants: msg });
            return;
        }

        const exists = (values.variants || []).some((v) =>
            String(v.size || "").trim().toLowerCase() === size.toLowerCase() &&
            String(v.color || "").trim().toLowerCase() === color.toLowerCase()
        );

        if (exists) {
            commit((prev) => prev, ["variants"], { variants: `Variante duplicada: ${size} - ${color}.` });
            return;
        }

        commit((prev) => {
            const prevVariants = Array.isArray(prev.variants) ? prev.variants : [];
            const nextVariants = prevVariants.concat({ size, color, quantity });
            return { ...prev, variants: nextVariants };
        }, ["variants"]);

        closeVariantForm();
    }

    function removeVariant(index) {
        commit((prev) => {
            const prevVariants = Array.isArray(prev.variants) ? prev.variants : [];
            const nextVariants = prevVariants.filter((_, i) => i !== index);
            return { ...prev, variants: nextVariants };
        }, ["variants"]);
    }

    function openTagForm() {
        setIsTagFormOpen(true);
        setTagDraft("");
        commit((prev) => prev, ["tags"], { tags: "" });
    }

    function closeTagForm() {
        setIsTagFormOpen(false);
        setTagDraft("");
    }

    function handleTagDraftChange(e) {
        setTagDraft(e.target.value);
        if (touched.tags && (errors.tags || "").trim()) {
            commit((prev) => prev, ["tags"], { tags: "" });
        }
    }

    const MAX_TAGS = 15;

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
        const text = normalizeTag(rawValue ?? tagDraft);

        // 1) vacío
        if (!text) {
            commit((prev) => prev, ["tags"], { tags: "Escribe un tag primero." });
            return;
        }

        const current = Array.isArray(values.tags) ? values.tags : [];

        // 2) límite
        if (current.length >= MAX_TAGS) {
            commit((prev) => prev, ["tags"], { tags: `Máximo ${MAX_TAGS} tags.` });
            return;
        }

        // 3) duplicado (comparación normalizada)
        const exists = current.some((t) => normalizeTag(t) === text);
        if (exists) {
            commit((prev) => prev, ["tags"], { tags: "Ese tag ya existe." });
            return;
        }

        // 4) ok: guardas y validas con commit
        commit(
            (prev) => {
                const prevTags = Array.isArray(prev.tags) ? prev.tags : [];
                return { ...prev, tags: prevTags.concat(text) };
            },
            ["tags"]
        );

        closeTagForm();
    }

    function removeTag(index) {
        commit(
            (prev) => {
                const current = Array.isArray(prev.tags) ? prev.tags : [];
                const next = current.filter((_, i) => i !== index);
                return { ...prev, tags: next };
            },
            ["tags"]
        );
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

        const items = pasted
            .split(",")
            .map((t) => normalizeTag(t))
            .filter(Boolean);

        if (!items.length) {
            commit((prev) => prev, ["tags"], { tags: "No se detectaron tags válidos." });
            return;
        }

        commit(
            (prev) => {
                const current = Array.isArray(prev.tags) ? prev.tags : [];
                const set = new Set(current.map((t) => normalizeTag(t)));
                const next = [...current];

                for (const t of items) {
                    if (next.length >= MAX_TAGS) break;
                    if (set.has(t)) continue;
                    set.add(t);
                    next.push(t);
                }

                return { ...prev, tags: next };
            },
            ["tags"]
        );
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
        setIsTagFormOpen(false);
        setTagDraft('');
        setErrors(EMPTY_ERRORS);
        setTouched(EMPTY_TOUCHED);
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

        const ok = validateAll(values);
        if (!ok) return;

        const payload = await buildPayload(values);
        onSubmit(payload);
    }

    return (
        <form className="popup__form" onSubmit={handleSubmit} noValidate>
            <div className="popup__grid">
                <div className="popup__field">
                    <label className="popup__label" htmlFor="code">Código</label>
                    <input
                        className={`popup__input ${isEdit ? ".popup__input--readonly" : ""}`}
                        id="code"
                        name="code"
                        value={values.code}
                        onChange={isEdit ? undefined : handleChange}
                        onBlur={handleBlur}
                        readOnly={isEdit}
                        placeholder="un-001/ln-001"
                        required
                    />
                    {touched.code && errors.code && <p className="popup__error">{errors.code}</p>}
                </div>

                <div className="popup__field">
                    <label className="popup__label" htmlFor="name">Nombre</label>
                    <input
                        className="popup__input"
                        id="name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Nombre del producto"
                        required
                    />
                    {touched.name && errors.name && <p className="popup__error">{errors.name}</p>}
                </div>

                <div className="popup__field">
                    <label className="popup__label" htmlFor="price">Precio en COP</label>
                    <input
                        className="popup__input"
                        id="price"
                        name="price"
                        value={values.price}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="120000"
                        inputMode="numeric"
                        required
                    />
                    {touched.price && errors.price && <p className="popup__error">{errors.price}</p>}
                </div>

                <div className="popup__field">
                    <label className="popup__label" htmlFor="line">Línea</label>
                    <input
                        className="popup__input"
                        id="line"
                        name="line"
                        value={values.line}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Antifluido/Lino"
                        required
                    />
                    {touched.line && errors.line && <p className="popup__error">{errors.line}</p>}
                </div>

                <div className="popup__field">
                    <label className="popup__label" htmlFor="category">Categoría</label>
                    <input
                        className="popup__input"
                        id="category"
                        name="category"
                        value={values.category}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Uniforme/Blusa/Camisa..."
                        required
                    />
                    {touched.category && errors.category && <p className="popup__error">{errors.category}</p>}
                </div>

                <div className="popup__field">
                    <label className="popup__label" htmlFor="subcategory">Subcategoría</label>
                    <input
                        className="popup__input"
                        id="subcategory"
                        name="subcategory"
                        value={values.subcategory}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Salud/Veterinaria/Casual..."
                        required
                    />
                    {touched.subcategory && errors.subcategory && <p className="popup__error">{errors.subcategory}</p>}
                </div>

                <div className="popup__field popup__field_span_2">
                    <label className="popup__label" htmlFor="description">Descripción</label>
                    <textarea
                        className="popup__textarea"
                        id="description"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Describe el producto..."
                        rows={4}
                        required
                    />
                    {touched.description && errors.description && <p className="popup__error">{errors.description}</p>}
                </div>

                <div className="popup__field">
                    <label className="popup__label">
                        Imágenes del producto
                    </label>

                    <div className="popup__file-row">
                        <input
                            id="product-images"
                            name="images"
                            className="popup__file-input"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFilesChange}
                            onBlur={handleBlur}
                            aria-describedby="image-help"
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
                    {touched.images && errors.images && <p className="popup__error">{errors.images}</p>}
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
                        </div>
                    )}
                    {touched.variants && (errors.variants || "").trim() && <p className="popup__error">{errors.variants}</p>}
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
                                name="tags"
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
                        </div>
                    )}
                    {touched.tags && (errors.tags || "").trim() && <p className="popup__error">{errors.tags}</p>}
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
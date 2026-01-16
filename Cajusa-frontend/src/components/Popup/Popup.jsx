// src/components/Popup/Popup.jsx
import { useEffect, useContext } from 'react';
import AppContext from '../../context/AppContext';
import ProductForm from '../Popup/ProductForm/ProductForm';

function Popup() {

    const {
        activePopup,
        popupProps,
        closePopup,
        handleProductSubmit,
        productSubmitLoading,
        productSubmitError,
    } = useContext(AppContext);

    const isOpen = activePopup !== null;

    useEffect(() => {
        if (!isOpen) return;

        function handleEsc(e) {
            if (e.key === "Escape") closePopup?.();
        }

        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, closePopup]);

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) closePopup?.();
    }

    if (!isOpen) return null;

    // Para este caso:
    const isProductForm = activePopup === "product-form";
    const mode = popupProps?.mode || "create";
    const product = popupProps?.product || null;

    const title = mode === "create" ? "Crear producto" : "Actualizar producto";
    const submitText = mode === "create" ? "Crear" : "Actualizar";

    return (
        <div className={`popup popup_opened`} onMouseDown={handleOverlayClick}>
            <div className="popup__container popup__container_type_form">
                <button
                    type="button"
                    className="popup__close"
                    onClick={closePopup}
                    aria-label="Cerrar"
                />

                <h2 className="popup__title">{title}</h2>

                <div className="popup__content">
                    {isProductForm && (
                        <ProductForm
                            initialValues={mode === "edit" ? product : undefined}
                            submitText={submitText}
                            onSubmit={handleProductSubmit}
                            isSubmitting={productSubmitLoading}
                            submitError={productSubmitError}
                        />
                    )}
                </div>
            </div>
        </div>
    );

}

export default Popup;

import { useEffect, useContext } from 'react';
import AppContext from '../../context/AppContext';
import ProductForm from '../Popup/ProductForm/ProductForm';
import InfoToolTip from "./InfoToolTip/InfoToolTip";

function Popup() {

    const {
        activePopup,
        activeOverlay,
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
            if (e.key !== 'Escape') return;
            if (activeOverlay) return;

            closePopup?.();
        }

        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, closePopup, activeOverlay]);

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) closePopup?.();
    }

    if (!isOpen) return null;

    const isProductForm = activePopup === "product-form";
    const isInfoToolTip = activePopup === "info-tooltip";

    const mode = popupProps?.mode || "create";
    const product = popupProps?.product || null;

    const formTitle = mode === "create" ? "Crear producto" : "Actualizar producto";
    const formSubmitText = mode === "create" ? "Crear" : "Actualizar";

    const infoTitle = popupProps?.title || "En construcción";
    const infoMessage = popupProps?.message || "En construcción, visítame en una próxima ocasión";

    const title = isInfoToolTip ? infoTitle : formTitle;
    const containerTypeClass = isInfoToolTip
        ? "popup__container_type_tooltip"
        : "popup__container_type_form"
        ;

    return (
        <div className={`popup popup_opened`} onMouseDown={handleOverlayClick}>
            <div className={`popup__container ${containerTypeClass}`}>
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
                            key={`${mode}-${product?._id || "new"}`}
                            initialValues={mode === "edit" ? product : undefined}
                            submitText={formSubmitText}
                            onSubmit={handleProductSubmit}
                            isSubmitting={productSubmitLoading}
                            submitError={productSubmitError}
                        />
                    )}

                    {isInfoToolTip && (
                        <InfoToolTip
                            title={infoTitle}
                            message={infoMessage}
                            onOk={popupProps?.onOk}
                            onClose={closePopup}
                        />
                    )}
                </div>
            </div>
        </div>
    );

}

export default Popup;

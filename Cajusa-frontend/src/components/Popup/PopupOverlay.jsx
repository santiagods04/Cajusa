import { useEffect } from "react";

export default function PopupBase({ isOpen, type = "form", title, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return;

    function handleEsc(e) {
      if (e.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose?.();
  }

  if (!isOpen) return null;

  return (
    <div className="popup popup_opened" onMouseDown={handleOverlayClick}>
      <div className={`popup__container popup__container_type_${type}`}>
        <button type="button" className="popup__close" onClick={onClose} aria-label="Cerrar" />
        {title && <h2 className="popup__title">{title}</h2>}
        <div className="popup__content">{children}</div>
      </div>
    </div>
  );
}

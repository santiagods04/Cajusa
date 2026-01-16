import { useContext, useEffect } from 'react';
import AppContext from '../../context/AppContext';
import ImageOverlay from './ImageOverlay/ImageOverlay';

function PopupOverlay() {
  const { activeOverlay, overlayProps, closeOverlay } = useContext(AppContext);

  const isOpen = activeOverlay === 'image';

  useEffect(() => {
    if (!isOpen) return;

    function handleEsc(e) {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      closeOverlay?.();
    }

    document.addEventListener('keydown', handleEsc, true);
    return () => document.removeEventListener('keydown', handleEsc, true);
  }, [isOpen, closeOverlay]);

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) closeOverlay?.();
  }

  if (!isOpen) return null;

  return (
    <div className="popup popup_opened popup_overlay" onMouseDown={handleOverlayClick}>
      <div className="popup__container popup__container_type_image">
        <button
          type="button"
          className="popup__close"
          onClick={closeOverlay}
          aria-label="Cerrar"
        />
        <div className="popup__content">
          <ImageOverlay imageUrl={overlayProps?.imageUrl} />
        </div>
      </div>
    </div>
  );
}

export default PopupOverlay;

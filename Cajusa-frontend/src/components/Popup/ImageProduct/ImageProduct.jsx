import { useEffect, useMemo, useState } from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function ImageProduct({ images = [], startIndex = 0, alt = "" }) {
  const safeImages = useMemo(() => {
    if (!Array.isArray(images)) return [];
    return images.filter(Boolean);
  }, [images]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!safeImages.length) {
      setIndex(0);
      return;
    }
    setIndex(clamp(startIndex, 0, safeImages.length - 1));
  }, [startIndex, safeImages.length]);

  const hasManyImages = safeImages.length > 1;
  const activeImg = safeImages[index];

  const goPrev = () => {
    if (!hasManyImages) return;
    setIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  };

  const goNext = () => {
    if (!hasManyImages) return;
    setIndex((i) => (i + 1) % safeImages.length);
  };

  if (!safeImages.length) {
    return <p className="popup__text">Sin imágenes para mostrar.</p>;
  }

  return (
    <div className="popup__imageFrame">
      <button
        type="button"
        className="popup__imageNav popup__imageNav--left"
        onClick={goPrev}
        aria-label="Anterior"
        disabled={!hasManyImages}
      >
        ‹
      </button>

      <img className="popup__image" src={activeImg} alt={alt} />

      <button
        type="button"
        className="popup__imageNav popup__imageNav--right"
        onClick={goNext}
        aria-label="Siguiente"
        disabled={!hasManyImages}
      >
        ›
      </button>

      {hasManyImages && (
        <div className="popup__counter">
          {index + 1}/{safeImages.length}
        </div>
      )}
    </div>
  );
}

function ImagePopup({ src, alt }) {
  return (
    <div className="popup__image-wrap">
      <img className="popup__image" src={src} alt={alt || "Imagen"} />
      {alt && <p className="popup__caption">{alt}</p>}
    </div>
  );
}

export default ImagePopup;

function ImageOverlay({ imageUrl, alt }) {
  return (
    <div className="popup__image-wrap">
      <img
        className="popup__image"
        src={imageUrl}
        alt={alt || "Imagen"}
        loading="lazy"
      />
      {alt && <p className="popup__caption">{alt}</p>}
    </div>
  );
}

export default ImageOverlay;

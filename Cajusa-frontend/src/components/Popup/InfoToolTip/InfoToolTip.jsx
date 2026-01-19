export default function InfoToolTip({
  title,
  message,
  onOk,
  onClose,
}) {
  const handleOk = () => {
    if (typeof onOk === "function") onOk();
    if (typeof onClose === "function") onClose();
  };

  return (
    <div className="popup__infotooltip" role="dialog" aria-labelledby="popup-infotooltip-title">
      <h3 className="popup__infotooltip-title" id="popup-infotooltip-title">
        {title}
      </h3>

      <p className="popup__infotooltip-text">{message}</p>

      <div className="popup__infotooltip-actions">
        <button
          type="button"
          className="popup__infotooltip-button"
          onClick={handleOk}
        >
          Ok
        </button>
      </div>
    </div>
  );
}
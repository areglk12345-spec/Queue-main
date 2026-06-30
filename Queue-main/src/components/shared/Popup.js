"use client";

export default function Popup({ isOpen, onClose, onConfirm, title, description, cancelText = "ย้อนกลับ", confirmText = "ยืนยัน" }) {
  if (!isOpen) return null;

  return (
    <div className={`popup-overlay ${isOpen ? "show" : ""}`} onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <div className="popup-icon">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div className="popup-title">{title}</div>
        <div className="popup-desc">{description}</div>
        <div className="popup-buttons">
          <button className="popup-btn popup-btn-cancel" onClick={onClose}>{cancelText}</button>
          <button className="popup-btn popup-btn-confirm" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

// Modal.jsx
import React, { useEffect, useState } from "react";
import "../styles/Modal.css";

export default function Modal({
  isOpen,
  title,
  message,
  onClose,
  type = "info", // info, success, error, loading
  isLoading = false,
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) setShow(true);
    else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  let modalClass = `modal-container modal-${type}`;
  if (isOpen) modalClass += " fade-in";
  else modalClass += " fade-out";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={modalClass}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>
            {type === "success" ? "Berhasil!" : title}
          </h3>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Tutup modal"
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          {isLoading && (
            <div className="loading-section">
              <div className="spinner"></div>
              <span>Menyimpan data...</span>
            </div>
          )}

          {!isLoading && type === "success" && (
            <div className="success-content animated-success">
              <div className="success-checkmark">
                <div className="check-icon">
                  <span className="icon-line line-tip"></span>
                  <span className="icon-line line-long"></span>
                  <div className="icon-circle"></div>
                  <div className="icon-fix"></div>
                </div>
              </div>
              <h3>Terima kasih!</h3>
              <p>{message || "KPI Anda telah berhasil disimpan."}</p>
            </div>
          )}

          {!isLoading && type === "error" && (
            <p className="error-message">{message}</p>
          )}

          {!isLoading && type === "info" && <p>{message}</p>}
        </div>

        {!isLoading && (
          <div className="modal-footer">
            <button className="modal-ok-btn" onClick={onClose}>
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

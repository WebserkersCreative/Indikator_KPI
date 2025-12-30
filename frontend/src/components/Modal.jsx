import React, { useEffect, useState } from "react";
import "../styles/Modal.css";

export default function Modal({
  isOpen,
  title,
  message,
  onClose,
  type = "info",
  isLoading = false,
  onConfirm,
}) {
  const [visible, setVisible] = useState(false);

  // Fade animation control
  useEffect(() => {
    if (isOpen) setVisible(true);
    else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !visible) return null;

  const modalClass = `modal-container modal-${type} ${
    isOpen ? "fade-in" : "fade-out"
  }`;

  const defaultTitle =
    type === "loading"
      ? "Memproses..."
      : type === "success"
      ? "Berhasil!"
      : type === "error"
      ? "Terjadi Kesalahan"
      : type === "finish"
      ? "Selesai"
      : "Informasi";

  return (
    <div
      className="modal-backdrop"
      onClick={type === "loading" ? undefined : onClose}
    >
      <div
        className={modalClass}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <div className="modal-header">
          <h3>{title || defaultTitle}</h3>

          {type !== "loading" && (
            <button className="modal-close-btn" onClick={onClose}>
              &times;
            </button>
          )}
        </div>

        {/* ================= BODY ================= */}
        <div className="modal-body">
          {/* LOADING */}
          {type === "loading" && isLoading && (
            <div className="loading-section">
              <div className="spinner"></div>
              <span>{message || "Mohon tunggu sebentar..."}</span>
            </div>
          )}

          {/* SUCCESS */}
          {type === "success" && !isLoading && (
            <div className="success-content animated-success">
              <div className="success-checkmark">
                <div className="check-icon">
                  <span className="icon-line line-tip"></span>
                  <span className="icon-line line-long"></span>
                </div>
              </div>
              <h3>{title || "Berhasil"}</h3>
              <p>{message || "Data berhasil diproses."}</p>
            </div>
          )}

          {/* ERROR */}
          {type === "error" && !isLoading && (
            <p className="error-message">{message || "Terjadi kesalahan."}</p>
          )}

          {/* INFO */}
          {type === "info" && !isLoading && message && <p>{message}</p>}

          {/* FINISH */}
          {type === "finish" && !isLoading && <p>{message || "Selesai."}</p>}
        </div>

        {/* ================= FOOTER ================= */}
        {!onConfirm && type !== "loading" && (
          <div className="modal-footer">
            <button className="modal-ok-btn" onClick={onClose}>
              {type === "finish" ? "Selesai" : "OK"}
            </button>
          </div>
        )}

        {onConfirm && (
          <div className="modal-footer">
            <button
              className="modal-ok-btn"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Ya
            </button>
            <button className="modal-ok-btn" onClick={onClose}>
              Batal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from "react";
import "./Modal.css";

/* =========================================================
   MODAL
   A centred popup. Closes on the X button, on Esc, or when
   the dark backdrop is clicked.
   ========================================================= */

function Modal({ title, onClose, children, footer, width = 460 }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") closeRef.current();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="sv-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="sv-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: width }}
      >
        <div className="sv-modal-head">
          <h3>{title}</h3>
          <button
            type="button"
            className="sv-modal-x"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="sv-modal-body">{children}</div>

        {footer ? <div className="sv-modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

export default Modal;

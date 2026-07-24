import React from "react";
import { CheckIcon, XIcon } from "../../layout/icons";

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.variant}`}>
          <span className="toast__icon"><CheckIcon width={15} height={15} /></span>
          <span className="toast__message">{t.message}</span>
          <button
            type="button"
            className="toast__close"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
          >
            <XIcon width={13} height={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

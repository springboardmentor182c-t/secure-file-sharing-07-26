import React from "react";
import { AlertTriangle } from "lucide-react";

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-red-600 hover:bg-red-700",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-xl bg-[#1B1C28] border border-[#34364A] shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#34364A] p-6">
          <div className="rounded-full bg-red-500/20 p-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>

          <h2 className="text-xl font-semibold text-white">
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-gray-300">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[#34364A] p-5">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-600 px-5 py-2 text-gray-300 transition hover:bg-gray-700"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`rounded-lg px-5 py-2 font-medium text-white transition ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ConfirmModal;
import React, { useState } from "react";
import { Modal } from "./Modal";
import { PrimaryButton, SecondaryButton } from "../Buttons";
import { revokeSession } from "../../features/authentication/services/authService";

export function RevokeSessionModal({ open, session, onClose, onRevoked }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await revokeSession(session.id);
      onRevoked(session.id);
      onClose();
    } catch (err) {
      setError(err.message || "Couldn't revoke this session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} title="Sign out this device?" onClose={onClose}>
      <p className="text-[#C5C3C4]/70 text-sm mb-5">
        {session?.user_agent || "This device"} will be signed out immediately.
      </p>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <div className="flex gap-3">
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton onClick={handleConfirm} loading={loading} loadingText="Signing out...">
          Sign out
        </PrimaryButton>
      </div>
    </Modal>
  );
}

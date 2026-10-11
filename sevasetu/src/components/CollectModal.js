import React, { useState } from "react";
import Modal from "./Modal";
import { completeDonation } from "../utils/storage";

/* =========================================================
   COLLECT MODAL
   The NGO types the 6-digit OTP the donor sees on their
   "My donations" page. That proves the item really changed
   hands before the donation is marked as delivered.
   ========================================================= */

function CollectModal({ donation, onClose, onDone }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP shown on the donor's dashboard.");
      return;
    }

    setSaving(true);
    const result = await completeDonation(donation.id, otp);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onDone();
  };

  return (
    <Modal title="Confirm collection" onClose={onClose} width={420}>
      <form onSubmit={submit}>
        <p style={{ marginTop: 0 }}>
          Collecting <strong>{donation.itemName}</strong> from{" "}
          <strong>{donation.donorName}</strong>? Ask them for the OTP on their
          My Donations page.
        </p>

        {error ? <div className="sv-alert sv-alert-error">{error}</div> : null}

        <div className="sv-field">
          <label htmlFor="collect-otp">Donor's 6-digit OTP</label>
          <input
            id="collect-otp"
            type="text"
            inputMode="numeric"
            autoFocus
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(event) => {
              setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            placeholder="••••••"
            style={{ letterSpacing: "0.4em", fontSize: "1.2rem" }}
          />
        </div>

        <div className="sv-modal-foot" style={{ padding: "18px 0 0", border: 0 }}>
          <button
            type="button"
            className="sv-btn sv-btn-ghost"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="sv-btn sv-btn-teal" disabled={saving}>
            {saving ? "Verifying..." : "Verify & mark collected"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CollectModal;

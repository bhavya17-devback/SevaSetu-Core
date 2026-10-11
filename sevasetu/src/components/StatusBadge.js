import React from "react";

/* =========================================================
   STATUS BADGE
   One consistent label for a donation status everywhere.
   ========================================================= */

const LABELS = {
  pending: { text: "Available", className: "sv-badge-pending" },
  claimed: { text: "Claimed", className: "sv-badge-claimed" },
  completed: { text: "Delivered", className: "sv-badge-completed" },
  cancelled: { text: "Cancelled", className: "sv-badge-cancelled" },
  expired: { text: "Expired", className: "sv-badge-expired" },
};

function StatusBadge({ status }) {
  const meta = LABELS[status] || LABELS.pending;

  return <span className={`sv-badge ${meta.className}`}>{meta.text}</span>;
}

export default StatusBadge;

import React, { useState } from "react";
import "./CoverImage.css";
import { getCategory } from "../utils/categories";

/* =========================================================
   COVER IMAGE
   ---------------------------------------------------------
   Shows the category photograph and falls back to a tinted
   icon tile if the picture cannot be loaded (offline demo,
   blocked network, and so on).
   ========================================================= */

function CoverImage({ category, height = 170, className = "" }) {
  const meta = getCategory(category);
  const [failed, setFailed] = useState(false);

  if (failed || !meta.image) {
    return (
      <div
        className={`sv-cover sv-cover-fallback ${className}`}
        style={{
          height,
          background: `linear-gradient(135deg, ${meta.tint}22, ${meta.tint}44)`,
        }}
      >
        <span style={{ fontSize: height / 3.6 }}>{meta.icon}</span>
      </div>
    );
  }

  return (
    <div className={`sv-cover ${className}`} style={{ height }}>
      <img
        src={meta.image}
        alt={meta.label}
        loading="lazy"
        onError={() => setFailed(true)}
      />
      <span className="sv-cover-tag">
        {meta.icon} {meta.label}
      </span>
    </div>
  );
}

export default CoverImage;

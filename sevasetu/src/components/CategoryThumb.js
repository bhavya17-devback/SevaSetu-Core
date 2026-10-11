import React, { useState } from "react";
import { getCategory } from "../utils/categories";

/* Small round category picture for table rows. */
function CategoryThumb({ category, size = 44 }) {
  const meta = getCategory(category);
  const [failed, setFailed] = useState(false);

  if (failed || !meta.image) {
    return (
      <span
        className="sv-thumb sv-thumb-fallback"
        style={{ width: size, height: size, background: `${meta.tint}22` }}
      >
        {meta.icon}
      </span>
    );
  }

  return (
    <img
      className="sv-thumb"
      src={meta.image}
      alt={meta.label}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default CategoryThumb;

import React from "react";
import { Link } from "react-router-dom";
import "./Logo.css";

/* =========================================================
   SEVASETU LOGO
   ---------------------------------------------------------
   The mark is a bridge ("setu") whose arch carries a heart,
   with a node on each bank: the donor on one side and the
   NGO on the other. Giving is the thing that connects them.
   ========================================================= */

export function LogoMark({ size = 40, className = "" }) {
  return (
    <img
      width={size}
      height={size}
      src="/sevasetu-logo.svg"
      alt="SevaSetu logo"
      className={`seva-logo-mark ${className}`}
    />
  );
}

/* Full lockup: mark + wordmark. */
function Logo({
  size = 42,
  tagline = "",
  to = "/",
  light = false,
  linked = true,
}) {
  const content = (
    <>
      <LogoMark size={size} />

      <span className="seva-logo-text">
        <strong>
          Seva<span>Setu</span>
        </strong>
        {tagline ? <small>{tagline}</small> : null}
      </span>
    </>
  );

  if (!linked) {
    return (
      <span className={`seva-logo ${light ? "light" : ""}`}>{content}</span>
    );
  }

  return (
    <Link to={to} className={`seva-logo ${light ? "light" : ""}`}>
      {content}
    </Link>
  );
}

export default Logo;

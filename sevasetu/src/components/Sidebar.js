import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   SHARED DASHBOARD SIDEBAR
   Used by the donor, NGO and admin panels.
   ========================================================= */

function Sidebar({ items, user, accent = "saffron", sectionLabel = "Menu" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const initials = String(user?.name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <aside className="sv-sidebar">
      <div className="sv-sidebar-head">
        <Logo size={38} tagline="" />
      </div>

      <nav className="sv-nav">
        <span className="sv-nav-label">{sectionLabel}</span>

        {items.map((item) => (
          <button
            key={item.path}
            type="button"
            className={`sv-nav-item ${
              location.pathname === item.path ? "active" : ""
            } ${accent === "teal" ? "teal" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sv-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sv-sidebar-foot">
        {user ? (
          <div className="sv-user-chip">
            <div className={`sv-avatar ${accent === "teal" ? "teal" : ""}`}>
              {initials}
            </div>

            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
        ) : null}

        <button type="button" className="sv-nav-item" onClick={handleLogout}>
          <span className="sv-nav-icon">⇦</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

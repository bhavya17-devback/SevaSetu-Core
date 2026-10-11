import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import { useAdminUser } from "../../hooks/useSeva";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";

const ADMIN_MENU = [
  { path: "/admin/dashboard", label: "Overview", icon: "◧" },
  { path: "/admin/users", label: "Users", icon: "👥" },
  { path: "/admin/donations", label: "Donations", icon: "🎁" },
  { path: "/admin/categories", label: "Categories", icon: "🏷" },
  { path: "/admin/reports", label: "Reports", icon: "⚑" },
];

/* =========================================================
   ADMIN SHELL
   Sidebar, header and the access guard for every admin page.
   ========================================================= */

function AdminShell({ title, subtitle, actions, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const admin = useAdminUser();

  if (!admin) return null;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="sv-shell admin-shell">
      <aside className="sv-sidebar admin-sidebar">
        <div className="sv-sidebar-head">
          <Logo size={38} tagline="" linked={false} light />
        </div>

        <nav className="sv-nav">
          <span className="sv-nav-label">Administration</span>

          {ADMIN_MENU.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`sv-nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="sv-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sv-sidebar-foot">
          <div className="sv-user-chip">
            <div className="sv-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <small>Platform team</small>
            </div>
          </div>

          <button type="button" className="sv-nav-item" onClick={handleLogout}>
            <span className="sv-nav-icon">⇦</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="sv-main">
        <div className="sv-topbar">
          <div>
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>

          {actions}
        </div>

        {children}
      </main>
    </div>
  );
}

export default AdminShell;

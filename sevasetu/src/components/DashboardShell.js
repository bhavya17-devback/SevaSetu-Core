import React from "react";
import Sidebar from "./Sidebar";

/* =========================================================
   DASHBOARD SHELL
   The sidebar + header frame shared by the donor and the
   NGO screens, so every page inside the app looks the same.
   ========================================================= */

function DashboardShell({
  user,
  menu,
  accent = "saffron",
  sectionLabel = "Menu",
  title,
  subtitle,
  actions,
  children,
}) {
  return (
    <div className="sv-shell">
      <Sidebar
        items={menu}
        user={user}
        accent={accent}
        sectionLabel={sectionLabel}
      />

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

export default DashboardShell;

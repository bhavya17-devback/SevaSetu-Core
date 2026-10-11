import React from "react";
import { useNavigate } from "react-router-dom";
import AdminShell from "./AdminShell";
import StatusBadge from "../../components/StatusBadge";
import { useFetch } from "../../hooks/useSeva";
import {
  computeAdminStats,
  fetchAllDonationsAdmin,
  fetchAllUsers,
  formatDate,
} from "../../utils/storage";
import { getCategory } from "../../utils/categories";
import { useCategories } from "../../context/CategoriesContext";
import "./Admin.css";

/* =========================================================
   ADMIN DASHBOARD
   A live overview of everything happening on the platform.
   ========================================================= */

function AdminDashboard() {
  useCategories(); // re-render when the admin changes categories
  const navigate = useNavigate();

  const { data: fetchedDonations } = useFetch(fetchAllDonationsAdmin, []);
  const { data: fetchedUsers } = useFetch(fetchAllUsers, []);

  const donations = fetchedDonations || [];
  const users = fetchedUsers || [];
  const stats = computeAdminStats(users, donations);

  const completionRate = stats.totalDonations
    ? Math.round((stats.completed / stats.totalDonations) * 100)
    : 0;

  /* Category breakdown for the simple bar chart. */
  const byCategory = donations.reduce((accumulator, donation) => {
    accumulator[donation.category] = (accumulator[donation.category] || 0) + 1;
    return accumulator;
  }, {});

  const categoryRows = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxCategory = categoryRows.length ? categoryRows[0][1] : 1;

  const recentUsers = [...users]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 5);

  const recentDonations = donations.slice(0, 6);

  return (
    <AdminShell title="Platform overview" subtitle="Live activity across SevaSetu">
      <div className="sv-stats">
        <div
          className="sv-stat"
          style={{ "--accent": "#f97316", "--accent-soft": "#fff7ed" }}
        >
          <div className="sv-stat-icon">🤝</div>
          <div className="sv-stat-value">{stats.donors}</div>
          <div className="sv-stat-label">Registered donors</div>
        </div>

        <div
          className="sv-stat"
          style={{ "--accent": "#0d9488", "--accent-soft": "#f0fdfa" }}
        >
          <div className="sv-stat-icon">🏢</div>
          <div className="sv-stat-value">{stats.ngos}</div>
          <div className="sv-stat-label">Registered NGOs</div>
        </div>

        <div
          className="sv-stat"
          style={{ "--accent": "#2563eb", "--accent-soft": "#eff6ff" }}
        >
          <div className="sv-stat-icon">🎁</div>
          <div className="sv-stat-value">{stats.totalDonations}</div>
          <div className="sv-stat-label">Total donations</div>
        </div>

        <div
          className="sv-stat"
          style={{ "--accent": "#16a34a", "--accent-soft": "#f0fdf4" }}
        >
          <div className="sv-stat-icon">📈</div>
          <div className="sv-stat-value">{completionRate}%</div>
          <div className="sv-stat-label">Completion rate</div>
        </div>
      </div>

      <div className="admin-columns">
        {/* ================= PIPELINE ================= */}

        <section className="admin-panel">
          <header>
            <h2>Donation pipeline</h2>
            <span>{stats.cities} cities covered</span>
          </header>

          <div className="admin-pipeline">
            <div className="pipeline-item">
              <strong>{stats.pending}</strong>
              <span>Available</span>
              <div className="pipeline-bar">
                <i
                  style={{
                    width: `${
                      stats.totalDonations
                        ? (stats.pending / stats.totalDonations) * 100
                        : 0
                    }%`,
                    background: "#f97316",
                  }}
                />
              </div>
            </div>

            <div className="pipeline-item">
              <strong>{stats.claimed}</strong>
              <span>Claimed</span>
              <div className="pipeline-bar">
                <i
                  style={{
                    width: `${
                      stats.totalDonations
                        ? (stats.claimed / stats.totalDonations) * 100
                        : 0
                    }%`,
                    background: "#2563eb",
                  }}
                />
              </div>
            </div>

            <div className="pipeline-item">
              <strong>{stats.completed}</strong>
              <span>Delivered</span>
              <div className="pipeline-bar">
                <i
                  style={{
                    width: `${
                      stats.totalDonations
                        ? (stats.completed / stats.totalDonations) * 100
                        : 0
                    }%`,
                    background: "#16a34a",
                  }}
                />
              </div>
            </div>
          </div>

          <h3 className="admin-subhead">Most donated categories</h3>

          {categoryRows.length === 0 ? (
            <p className="admin-muted">No donations recorded yet.</p>
          ) : (
            <div className="admin-catbars">
              {categoryRows.map(([id, count]) => {
                const meta = getCategory(id);

                return (
                  <div key={id} className="admin-catbar">
                    <span className="admin-catbar-label">
                      {meta.icon} {meta.label}
                    </span>

                    <div className="admin-catbar-track">
                      <i
                        style={{
                          width: `${(count / maxCategory) * 100}%`,
                          background: meta.tint,
                        }}
                      />
                    </div>

                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ================= NEW USERS ================= */}

        <section className="admin-panel">
          <header>
            <h2>Newest accounts</h2>
            <button
              type="button"
              className="sv-btn sv-btn-ghost sv-btn-sm"
              onClick={() => navigate("/admin/users")}
            >
              Manage
            </button>
          </header>

          {recentUsers.length === 0 ? (
            <p className="admin-muted">Nobody has registered yet.</p>
          ) : (
            <ul className="admin-userlist">
              {recentUsers.map((user) => (
                <li key={user.id}>
                  <div
                    className={`sv-avatar ${user.role === "ngo" ? "teal" : ""}`}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="admin-userlist-info">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>

                  <span className={`admin-role ${user.role}`}>{user.role}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ================= RECENT DONATIONS ================= */}

      <section className="admin-panel" style={{ marginTop: 24 }}>
        <header>
          <h2>Latest donations</h2>
          <button
            type="button"
            className="sv-btn sv-btn-ghost sv-btn-sm"
            onClick={() => navigate("/admin/donations")}
          >
            View all
          </button>
        </header>

        {recentDonations.length === 0 ? (
          <p className="admin-muted">No donations have been listed yet.</p>
        ) : (
          <div className="sv-table-wrap" style={{ border: "none", boxShadow: "none" }}>
            <table className="sv-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Donor</th>
                  <th>City</th>
                  <th>Claimed by</th>
                  <th>Status</th>
                  <th>Listed</th>
                </tr>
              </thead>

              <tbody>
                {recentDonations.map((donation) => (
                  <tr key={donation.id}>
                    <td>
                      <strong>{donation.itemName}</strong>
                      <br />
                      <small className="admin-muted">
                        {getCategory(donation.category).label}
                      </small>
                    </td>
                    <td>{donation.donorName}</td>
                    <td>{donation.city}</td>
                    <td>{donation.claimedByNgoName || "—"}</td>
                    <td>
                      <StatusBadge status={donation.status} />
                    </td>
                    <td>{formatDate(donation.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}

export default AdminDashboard;

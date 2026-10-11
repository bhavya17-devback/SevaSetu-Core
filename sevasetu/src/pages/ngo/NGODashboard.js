import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import CategoryThumb from "../../components/CategoryThumb";
import CollectModal from "../../components/CollectModal";
import { useAuthUser, useFetch } from "../../hooks/useSeva";
import { NGO_MENU } from "./ngoMenu";
import { getCategory } from "../../utils/categories";
import { useCategories } from "../../context/CategoriesContext";
import {
  formatDate,
  fetchMyClaims,
  fetchAvailableDonations,
  getNgoStatsFromClaims,
} from "../../utils/storage";
import "./NGO.css";

/* =========================================================
   NGO DASHBOARD
   ---------------------------------------------------------
   Opens straight after an NGO signs in with the credentials
   it registered with, and shows that organisation's own
   name, profile, claims and donations received.
   ========================================================= */

function NGODashboard() {
  useCategories(); // re-render when the admin changes categories
  const navigate = useNavigate();
  const user = useAuthUser("ngo");
  const [collecting, setCollecting] = useState(null);

  const { data: fetchedClaims, refresh } = useFetch(
    () => (user ? fetchMyClaims() : Promise.resolve([])),
    [user?.id]
  );

  const { data: fetchedAvailable } = useFetch(
    () => (user ? fetchAvailableDonations() : Promise.resolve([])),
    [user?.id]
  );

  if (!user) return null;

  const claims = fetchedClaims || [];
  const stats = getNgoStatsFromClaims(claims, (fetchedAvailable || []).length);

  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const active = claims.filter((claim) => claim.status === "claimed");
  const recent = claims.slice(0, 4);

  return (
    <DashboardShell
      user={user}
      menu={NGO_MENU}
      accent="teal"
      sectionLabel="NGO menu"
      title="NGO dashboard"
      subtitle="Everything your organisation has claimed and received."
      actions={
        <button
          type="button"
          className="sv-btn sv-btn-teal"
          onClick={() => navigate("/ngo/available-donations")}
        >
          🔍 Browse donations
        </button>
      }
    >
      {/* ================= IDENTITY BANNER ================= */}

      <section className="ngo-hero">
        <div className="ngo-hero-inner">
          <div className="ngo-hero-id">
            <div className="ngo-hero-avatar">{initials}</div>

            <div>
              <h2>{user.name}</h2>
              <p className="ngo-hero-sub">
                {user.focusArea
                  ? `${user.focusArea} · registered NGO partner`
                  : "Registered NGO partner"}
              </p>

              <div className="ngo-hero-meta">
                <span className="ngo-verified">✓ Active account</span>
                <span>✉ {user.email}</span>
                {user.phone ? <span>☎ {user.phone}</span> : null}
                {user.city ? <span>⌖ {user.city}</span> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}

      <div className="sv-stats">
        <div
          className="sv-stat"
          style={{ "--accent": "#0d9488", "--accent-soft": "#f0fdfa" }}
        >
          <div className="sv-stat-icon">📋</div>
          <div className="sv-stat-value">{stats.totalClaims}</div>
          <div className="sv-stat-label">Donations claimed</div>
        </div>

        <div
          className="sv-stat"
          style={{ "--accent": "#2563eb", "--accent-soft": "#eff6ff" }}
        >
          <div className="sv-stat-icon">🚚</div>
          <div className="sv-stat-value">{stats.inProgress}</div>
          <div className="sv-stat-label">Awaiting pickup</div>
        </div>

        <div
          className="sv-stat"
          style={{ "--accent": "#16a34a", "--accent-soft": "#f0fdf4" }}
        >
          <div className="sv-stat-icon">✓</div>
          <div className="sv-stat-value">{stats.received}</div>
          <div className="sv-stat-label">Donations received</div>
        </div>

        <div
          className="sv-stat"
          style={{ "--accent": "#f97316", "--accent-soft": "#fff7ed" }}
        >
          <div className="sv-stat-icon">🔍</div>
          <div className="sv-stat-value">{stats.available}</div>
          <div className="sv-stat-label">Available to claim</div>
        </div>
      </div>

      {/* ================= COLUMNS ================= */}

      <div className="ngo-columns">
        <section className="sv-panel">
          <div className="sv-panel-head">
            <div>
              <h2>Awaiting pickup</h2>
              <p>Claims your team still has to collect</p>
            </div>

            <button
              type="button"
              className="sv-btn sv-btn-ghost sv-btn-sm"
              onClick={() => navigate("/ngo/my-claims")}
            >
              All claims
            </button>
          </div>

          {active.length === 0 ? (
            <div className="sv-empty">
              <div className="sv-empty-icon">📦</div>
              <h3>Nothing waiting for collection</h3>
              <p>
                {stats.available > 0
                  ? `${stats.available} donation${
                      stats.available === 1 ? " is" : "s are"
                    } available right now.`
                  : "No donations are available on the platform at the moment."}
              </p>

              <button
                type="button"
                className="sv-btn sv-btn-teal"
                onClick={() => navigate("/ngo/available-donations")}
              >
                Browse available donations
              </button>
            </div>
          ) : (
            <ul className="activity">
              {active.map((donation) => (
                <li key={donation.id}>
                  <span className="activity-dot">
                    {getCategory(donation.category).icon}
                  </span>

                  <div className="activity-body">
                    <strong>
                      {donation.itemName} · {donation.quantity} {donation.unit}
                    </strong>
                    <small>
                      From {donation.donorName} · {donation.city} · claimed{" "}
                      {formatDate(donation.claimedAt)}
                    </small>
                  </div>

                  <button
                    type="button"
                    className="sv-btn sv-btn-teal sv-btn-sm"
                    onClick={() => setCollecting(donation)}
                  >
                    Mark collected
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ================= PROFILE ================= */}

        <section className="sv-panel">
          <div className="sv-panel-head">
            <div>
              <h2>Organisation details</h2>
              <p>As entered during registration</p>
            </div>
          </div>

          <div className="ngo-profile-grid">
            <div className="ngo-profile-item">
              <small>Organisation</small>
              <strong>{user.name}</strong>
            </div>

            <div className="ngo-profile-item">
              <small>Registration no.</small>
              <strong>{user.regNumber || "Not provided"}</strong>
            </div>

            <div className="ngo-profile-item">
              <small>Focus area</small>
              <strong>{user.focusArea || "Not provided"}</strong>
            </div>

            <div className="ngo-profile-item">
              <small>Login email</small>
              <strong>{user.email}</strong>
            </div>

            <div className="ngo-profile-item">
              <small>Phone</small>
              <strong>{user.phone || "Not provided"}</strong>
            </div>

            <div className="ngo-profile-item">
              <small>City</small>
              <strong>{user.city || "Not provided"}</strong>
            </div>

            <div className="ngo-profile-item">
              <small>Address</small>
              <strong>{user.address || "Not provided"}</strong>
            </div>

            <div className="ngo-profile-item">
              <small>Registered on</small>
              <strong>{formatDate(user.createdAt)}</strong>
            </div>
          </div>

          <div className="ngo-contact-box" style={{ marginTop: 20 }}>
            <strong>Impact so far</strong>
            {stats.items} item{stats.items === 1 ? "" : "s"} received from{" "}
            {stats.donors} donor{stats.donors === 1 ? "" : "s"} through
            SevaSetu.
          </div>
        </section>
      </div>

      {/* ================= RECENT CLAIMS ================= */}

      <section className="sv-panel">
        <div className="sv-panel-head">
          <div>
            <h2>Recent claims</h2>
            <p>The latest donations your organisation took on</p>
          </div>
        </div>

        {recent.length === 0 ? (
          <div className="sv-empty">
            <div className="sv-empty-icon">🤝</div>
            <h3>No claims yet</h3>
            <p>Once you claim a donation it will appear here.</p>
          </div>
        ) : (
          <div className="sv-table-wrap">
            <table className="sv-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Condition</th>
                  <th>Donor</th>
                  <th>Status</th>
                  <th>Claimed</th>
                </tr>
              </thead>

              <tbody>
                {recent.map((donation) => (
                  <tr key={donation.id}>
                    <td>
                      <div className="sv-cell-item">
                        <CategoryThumb category={donation.category} />
                        <div>
                          <strong>{donation.itemName}</strong>
                          <small>{getCategory(donation.category).label}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {donation.quantity} {donation.unit}
                    </td>
                    <td>{donation.condition}</td>
                    <td>{donation.donorName}</td>
                    <td>
                      <StatusBadge status={donation.status} />
                    </td>
                    <td>{formatDate(donation.claimedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {collecting ? (
        <CollectModal
          donation={collecting}
          onClose={() => setCollecting(null)}
          onDone={() => {
            setCollecting(null);
            refresh();
          }}
        />
      ) : null}
    </DashboardShell>
  );
}

export default NGODashboard;

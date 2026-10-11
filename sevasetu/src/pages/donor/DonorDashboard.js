import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import CategoryThumb from "../../components/CategoryThumb";
import { useAuthUser, useFetch } from "../../hooks/useSeva";
import { DONOR_MENU } from "./donorMenu";
import { getCategory } from "../../utils/categories";
import { useCategories } from "../../context/CategoriesContext";
import {
  CERTIFICATE_TARGET,
  formatDate,
  fetchMyDonations,
  getCoinsFromDonations,
} from "../../utils/storage";
import "./Donor.css";

/* =========================================================
   DONOR DASHBOARD
   Everything here is derived live from the shared store, so
   a brand new account sees its own name and empty totals
   the moment registration finishes.
   ========================================================= */

function DonorDashboard() {
  useCategories(); // re-render when the admin changes categories
  const navigate = useNavigate();
  const user = useAuthUser("donor");

  const { data: fetchedDonations } = useFetch(
    () => (user ? fetchMyDonations() : Promise.resolve([])),
    [user?.id]
  );

  if (!user) return null;

  const donations = fetchedDonations || [];
  const coins = getCoinsFromDonations(donations);

  const pending = donations.filter((d) => d.status === "pending").length;
  const claimed = donations.filter((d) => d.status === "claimed").length;
  const completed = donations.filter((d) => d.status === "completed").length;

  const progress = Math.min(100, Math.round((coins / CERTIFICATE_TARGET) * 100));
  const remaining = Math.max(0, CERTIFICATE_TARGET - coins);

  const recent = donations.slice(0, 4);

  return (
    <DashboardShell
      user={user}
      menu={DONOR_MENU}
      sectionLabel="Donor menu"
      title={`Welcome back, ${user.name.split(" ")[0]}`}
      subtitle="Here is everything you have given through SevaSetu."
      actions={
        <button
          type="button"
          className="sv-btn sv-btn-primary"
          onClick={() => navigate("/donor/create-donation")}
        >
          ＋ New donation
        </button>
      }
    >
      {/* ================= BANNER ================= */}

      <section className="donor-hero">
        <div className="donor-hero-inner">
          <div>
            <h2>{user.name}</h2>
            <p>
              {donations.length === 0
                ? "You haven't listed anything yet. Your first donation is only a minute away."
                : `You have listed ${donations.length} donation${
                    donations.length === 1 ? "" : "s"
                  } so far. ${completed} of them have already been delivered.`}
            </p>

            <div className="donor-hero-meta">
              <span>✉ {user.email}</span>
              {user.phone ? <span>☎ {user.phone}</span> : null}
              {user.city ? <span>⌖ {user.city}</span> : null}
              <span>★ Member since {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}

      <div className="sv-stats">
        <div
          className="sv-stat"
          style={{ "--accent": "#f97316", "--accent-soft": "#fff7ed" }}
        >
          <div className="sv-stat-icon">🎁</div>
          <div className="sv-stat-value">{donations.length}</div>
          <div className="sv-stat-label">Total donations</div>
        </div>

        <div
          className="sv-stat"
          style={{ "--accent": "#f59e0b", "--accent-soft": "#fffbeb" }}
        >
          <div className="sv-stat-icon">⏳</div>
          <div className="sv-stat-value">{pending}</div>
          <div className="sv-stat-label">Waiting for an NGO</div>
        </div>

        <div
          className="sv-stat"
          style={{ "--accent": "#2563eb", "--accent-soft": "#eff6ff" }}
        >
          <div className="sv-stat-icon">🤝</div>
          <div className="sv-stat-value">{claimed}</div>
          <div className="sv-stat-label">Claimed, awaiting pickup</div>
        </div>

        <div
          className="sv-stat"
          style={{ "--accent": "#16a34a", "--accent-soft": "#f0fdf4" }}
        >
          <div className="sv-stat-icon">✓</div>
          <div className="sv-stat-value">{completed}</div>
          <div className="sv-stat-label">Delivered</div>
        </div>
      </div>

      {/* ================= COLUMNS ================= */}

      <div className="donor-columns">
        <section className="sv-panel">
          <div className="sv-panel-head">
            <div>
              <h2>Recent donations</h2>
              <p>The last few items you listed</p>
            </div>

            <button
              type="button"
              className="sv-btn sv-btn-ghost sv-btn-sm"
              onClick={() => navigate("/donor/my-donations")}
            >
              View all
            </button>
          </div>

          {recent.length === 0 ? (
            <div className="sv-empty">
              <div className="sv-empty-icon">🎁</div>
              <h3>Nothing listed yet</h3>
              <p>
                Food, clothes, books, a spare chair — someone nearby needs it.
              </p>
              <button
                type="button"
                className="sv-btn sv-btn-primary"
                onClick={() => navigate("/donor/create-donation")}
              >
                List your first donation
              </button>
            </div>
          ) : (
            <ul className="activity">
              {recent.map((donation) => (
                <li key={donation.id}>
                  <span className="activity-dot">
                    {getCategory(donation.category).icon}
                  </span>

                  <div className="activity-body">
                    <strong>
                      {donation.itemName} · {donation.quantity} {donation.unit}
                    </strong>
                    <small>
                      {getCategory(donation.category).label} ·{" "}
                      {formatDate(donation.createdAt)}
                      {donation.claimedByNgoName
                        ? ` · claimed by ${donation.claimedByNgoName}`
                        : ""}
                    </small>
                  </div>

                  <StatusBadge status={donation.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div style={{ display: "grid", gap: 22 }}>
          {/* ================= COINS ================= */}

          <section className="coin-panel">
            <div className="coin-top">
              <div className="coin-badge">🪙</div>
              <div>
                <strong>{coins}</strong>
                <small>Seva Coins earned</small>
              </div>
            </div>

            <div className="coin-track">
              <i style={{ width: `${progress}%` }} />
            </div>

            <div className="coin-foot">
              <span>
                {remaining === 0
                  ? "Certificate unlocked 🎉"
                  : `${remaining} coins to your certificate`}
              </span>
              <span>
                {coins}/{CERTIFICATE_TARGET}
              </span>
            </div>

            <button
              type="button"
              className="sv-btn sv-btn-ghost sv-btn-sm"
              style={{ width: "100%", marginTop: 16 }}
              onClick={() => navigate("/donor/certificate")}
            >
              View certificate
            </button>
          </section>

          {/* ================= ACTIONS ================= */}

          <section className="sv-panel">
            <div className="sv-panel-head">
              <div>
                <h2>Quick actions</h2>
              </div>
            </div>

            <div className="quick-actions">
              <button
                type="button"
                className="quick-action"
                onClick={() => navigate("/donor/create-donation")}
              >
                <span className="quick-action-icon">＋</span>
                <div>
                  <strong>Create a donation</strong>
                  <small>List an item in under a minute</small>
                </div>
              </button>

              <button
                type="button"
                className="quick-action"
                onClick={() => navigate("/donor/my-donations")}
              >
                <span className="quick-action-icon">♡</span>
                <div>
                  <strong>Track my donations</strong>
                  <small>See who claimed what, and when</small>
                </div>
              </button>

              <button
                type="button"
                className="quick-action"
                onClick={() => navigate("/donor/certificate")}
              >
                <span className="quick-action-icon">🏆</span>
                <div>
                  <strong>My certificate</strong>
                  <small>Download it once you reach 100 coins</small>
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ================= LATEST LISTINGS ================= */}

      {recent.length > 0 ? (
        <section className="sv-panel">
          <div className="sv-panel-head">
            <div>
              <h2>Your latest listings</h2>
              <p>The most recent items, at a glance</p>
            </div>
          </div>

          <div className="sv-table-wrap">
            <table className="sv-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Condition</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Coins</th>
                  <th>Listed</th>
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
                    <td>{donation.city || "—"}</td>
                    <td>
                      <StatusBadge status={donation.status} />
                    </td>
                    <td>+{donation.coins}</td>
                    <td>{formatDate(donation.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </DashboardShell>
  );
}

export default DonorDashboard;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import CategoryThumb from "../../components/CategoryThumb";
import { Pagination, usePaged } from "../../components/Pagination";
import { useAuthUser, useFetch } from "../../hooks/useSeva";
import { DONOR_MENU } from "./donorMenu";
import { getCategory } from "../../utils/categories";
import { useCategories } from "../../context/CategoriesContext";
import {
  cancelDonation,
  deleteDonation,
  formatDate,
  fetchMyDonations,
} from "../../utils/storage";
import "./Donor.css";

/* =========================================================
   MY DONATIONS
   A table of every listing, with the pickup OTP the donor
   shares with the NGO when it collects the item.
   ========================================================= */

const TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Available" },
  { id: "claimed", label: "Claimed" },
  { id: "completed", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
  { id: "expired", label: "Expired" },
];

function MyDonations() {
  useCategories(); // re-render when the admin changes categories
  const navigate = useNavigate();
  const user = useAuthUser("donor");

  const [tab, setTab] = useState("all");

  const { data: fetchedDonations, refresh } = useFetch(
    () => (user ? fetchMyDonations() : Promise.resolve([])),
    [user?.id]
  );

  const donations = fetchedDonations || [];

  const visible =
    tab === "all"
      ? donations
      : donations.filter((donation) => donation.status === tab);

  const paged = usePaged(visible, 10, tab);

  if (!user) return null;

  const countFor = (id) =>
    id === "all"
      ? donations.length
      : donations.filter((donation) => donation.status === id).length;

  const hasOpenOtp = donations.some(
    (d) => d.otp && (d.status === "pending" || d.status === "claimed")
  );

  const handleCancel = async (donation) => {
    if (
      window.confirm(
        `Take "${donation.itemName}" off the platform? NGOs will no longer see it.`
      )
    ) {
      const result = await cancelDonation(donation.id);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      refresh();
    }
  };

  const handleDelete = async (donation) => {
    if (window.confirm(`Delete "${donation.itemName}" permanently?`)) {
      const result = await deleteDonation(donation.id);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      refresh();
    }
  };

  return (
    <DashboardShell
      user={user}
      menu={DONOR_MENU}
      sectionLabel="Donor menu"
      title="My donations"
      subtitle={`${donations.length} listing${
        donations.length === 1 ? "" : "s"
      } created from this account`}
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
      <div className="mydon-filters">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? "active" : ""}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            <span>{countFor(item.id)}</span>
          </button>
        ))}
      </div>

      {hasOpenOtp ? (
        <div className="sv-table-note">
          🔐 <strong>Verification OTP:</strong> when the NGO comes to collect
          your item, tell them the 6-digit OTP from the table below. Only share
          it in person, at pickup.
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="sv-empty">
          <div className="sv-empty-icon">🎁</div>
          <h3>Nothing here yet</h3>
          <p>
            {tab === "all"
              ? "You haven't listed a donation yet. It only takes a minute."
              : "No donations with this status right now."}
          </p>

          {tab === "all" ? (
            <button
              type="button"
              className="sv-btn sv-btn-primary"
              onClick={() => navigate("/donor/create-donation")}
            >
              Create your first donation
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="sv-table-wrap">
            <table className="sv-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Condition</th>
                  <th>Pickup</th>
                  <th>Status</th>
                  <th>Verification OTP</th>
                  <th>Claimed by</th>
                  <th>Listed</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paged.pageItems.map((donation) => {
                  const open =
                    donation.status === "pending" ||
                    donation.status === "claimed";

                  return (
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

                      <td>
                        {donation.city || "—"}
                        <br />
                        <small className="admin-muted">
                          {donation.pickupDate
                            ? formatDate(donation.pickupDate)
                            : "Flexible"}
                        </small>
                      </td>

                      <td>
                        <StatusBadge status={donation.status} />
                      </td>

                      <td>
                        {open && donation.otp ? (
                          <span className="sv-otp">{donation.otp}</span>
                        ) : (
                          <span className="admin-muted">—</span>
                        )}
                      </td>

                      <td>
                        {donation.claimedByNgoName || (
                          <span className="admin-muted">—</span>
                        )}
                        {donation.completedAt ? (
                          <>
                            <br />
                            <small className="admin-muted">
                              Delivered {formatDate(donation.completedAt)}
                            </small>
                          </>
                        ) : null}
                      </td>

                      <td>{formatDate(donation.createdAt)}</td>

                      <td>
                        <div className="sv-cell-actions">
                          {donation.status === "pending" ? (
                            <button
                              type="button"
                              className="sv-btn sv-btn-ghost sv-btn-sm"
                              onClick={() => handleCancel(donation)}
                            >
                              Cancel
                            </button>
                          ) : null}

                          {donation.status === "pending" ||
                          donation.status === "cancelled" ||
                          donation.status === "expired" ? (
                            <button
                              type="button"
                              className="sv-btn sv-btn-danger sv-btn-sm"
                              onClick={() => handleDelete(donation)}
                            >
                              Delete
                            </button>
                          ) : null}

                          {donation.status === "claimed" ||
                          donation.status === "completed" ? (
                            <span className="admin-muted">—</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination paged={paged} />
        </>
      )}
    </DashboardShell>
  );
}

export default MyDonations;

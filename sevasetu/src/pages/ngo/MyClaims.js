import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import CategoryThumb from "../../components/CategoryThumb";
import CollectModal from "../../components/CollectModal";
import { Pagination, usePaged } from "../../components/Pagination";
import { useAuthUser, useFetch } from "../../hooks/useSeva";
import { NGO_MENU } from "./ngoMenu";
import { getCategory } from "../../utils/categories";
import { useCategories } from "../../context/CategoriesContext";
import { formatDate, fetchMyClaims } from "../../utils/storage";
import "./NGO.css";

/* =========================================================
   MY CLAIMS
   Everything this NGO has claimed, as a table. For the
   donor's privacy the NGO only sees a shortened name and
   the pickup details needed to collect the item - never the
   donor's email or personal account phone number.
   ========================================================= */

const TABS = [
  { id: "all", label: "All" },
  { id: "claimed", label: "Awaiting pickup" },
  { id: "completed", label: "Received" },
];

function MyClaims() {
  useCategories(); // re-render when the admin changes categories
  const navigate = useNavigate();
  const user = useAuthUser("ngo");

  const [tab, setTab] = useState("all");
  const [collecting, setCollecting] = useState(null);

  const { data: fetchedClaims, refresh } = useFetch(
    () => (user ? fetchMyClaims() : Promise.resolve([])),
    [user?.id]
  );

  const claims = fetchedClaims || [];

  const visible =
    tab === "all" ? claims : claims.filter((claim) => claim.status === tab);

  const paged = usePaged(visible, 10, tab);

  if (!user) return null;

  const countFor = (id) =>
    id === "all" ? claims.length : claims.filter((c) => c.status === id).length;

  return (
    <DashboardShell
      user={user}
      menu={NGO_MENU}
      accent="teal"
      sectionLabel="NGO menu"
      title="My claims"
      subtitle={`${claims.length} donation${
        claims.length === 1 ? "" : "s"
      } claimed by ${user.name}`}
      actions={
        <button
          type="button"
          className="sv-btn sv-btn-teal"
          onClick={() => navigate("/ngo/available-donations")}
        >
          🔍 Browse more
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

      {claims.length > 0 ? (
        <div className="sv-table-note teal">
          🔒 To protect donors, you see a shortened name and only the pickup
          address and contact number the donor chose for this donation. When
          you collect an item, ask the donor for their OTP and use{" "}
          <strong>Mark collected</strong>.
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="sv-empty">
          <div className="sv-empty-icon">📋</div>
          <h3>Nothing here yet</h3>
          <p>
            {claims.length === 0
              ? "Your organisation hasn't claimed a donation yet."
              : "No claims with this status right now."}
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
        <>
          <div className="sv-table-wrap">
            <table className="sv-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Donor</th>
                  <th>Pickup contact</th>
                  <th>Pickup address</th>
                  <th>Pickup date</th>
                  <th>Status</th>
                  <th>Claimed</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paged.pageItems.map((donation) => (
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

                    <td>{donation.donorName}</td>

                    <td>☎ {donation.contactPhone || "—"}</td>

                    <td style={{ minWidth: 190 }}>
                      {donation.address || "—"}
                      {donation.city ? `, ${donation.city}` : ""}
                    </td>

                    <td>
                      {donation.pickupDate
                        ? formatDate(donation.pickupDate)
                        : "Flexible"}
                    </td>

                    <td>
                      <StatusBadge status={donation.status} />
                    </td>

                    <td>{formatDate(donation.claimedAt)}</td>

                    <td>
                      {donation.status === "claimed" ? (
                        <button
                          type="button"
                          className="sv-btn sv-btn-teal sv-btn-sm"
                          onClick={() => setCollecting(donation)}
                        >
                          Mark collected
                        </button>
                      ) : (
                        <small className="admin-muted">
                          Received {formatDate(donation.completedAt)}
                        </small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination paged={paged} />
        </>
      )}

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

export default MyClaims;

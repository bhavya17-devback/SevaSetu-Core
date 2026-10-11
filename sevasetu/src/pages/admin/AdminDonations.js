import React, { useState } from "react";
import AdminShell from "./AdminShell";
import { Pagination, usePaged } from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import { useFetch } from "../../hooks/useSeva";
import { getCategory } from "../../utils/categories";
import { useCategories } from "../../context/CategoriesContext";
import {
  adminCancelDonation,
  adminDeleteDonation,
  fetchAllDonationsAdmin,
  formatDate,
} from "../../utils/storage";
import "./Admin.css";

/* =========================================================
   ADMIN - DONATIONS
   Every donation on the platform, with moderation controls.
   ========================================================= */

const STATUSES = [
  { id: "all", label: "All" },
  { id: "pending", label: "Available" },
  { id: "claimed", label: "Claimed" },
  { id: "completed", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

function AdminDonations() {
  useCategories(); // re-render when the admin changes categories
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const { data: fetchedDonations, refresh } = useFetch(
    fetchAllDonationsAdmin,
    []
  );
  const donations = fetchedDonations || [];

  const term = search.trim().toLowerCase();

  const visible = donations.filter((donation) => {
    const matchesStatus = status === "all" || donation.status === status;

    const matchesSearch =
      !term ||
      donation.itemName.toLowerCase().includes(term) ||
      String(donation.donorName).toLowerCase().includes(term) ||
      String(donation.city).toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const paged = usePaged(visible, 10, `${term}|${status}`);

  const handleRemove = async (donation) => {
    if (window.confirm(`Delete the listing "${donation.itemName}"?`)) {
      const result = await adminDeleteDonation(donation.id);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      refresh();
    }
  };

  const handleCancel = async (donation) => {
    if (window.confirm(`Take "${donation.itemName}" off the platform?`)) {
      const result = await adminCancelDonation(donation.id);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      refresh();
    }
  };

  return (
    <AdminShell
      title="Donations"
      subtitle={`${donations.length} listing${
        donations.length === 1 ? "" : "s"
      } across the platform`}
    >
      <div className="mydon-filters" style={{ marginBottom: 18 }}>
        {STATUSES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={status === item.id ? "active" : ""}
            onClick={() => setStatus(item.id)}
          >
            {item.label}
            <span>
              {item.id === "all"
                ? donations.length
                : donations.filter((d) => d.status === item.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="ngo-filters">
        <input
          type="search"
          placeholder="Search by item, donor or city..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {visible.length === 0 ? (
        <div className="sv-empty">
          <div className="sv-empty-icon">🎁</div>
          <h3>No donations found</h3>
          <p>Nothing matches this filter right now.</p>
        </div>
      ) : (
        <>
        <div className="sv-table-wrap">
          <table className="sv-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Donor</th>
                <th>Claimed by</th>
                <th>City</th>
                <th>Status</th>
                <th>Listed</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paged.pageItems.map((donation) => (
                <tr key={donation.id}>
                  <td>
                    <strong>{donation.itemName}</strong>
                    <br />
                    <small className="admin-muted">
                      {donation.quantity} {donation.unit}
                    </small>
                  </td>

                  <td>
                    {getCategory(donation.category).icon}{" "}
                    {getCategory(donation.category).label}
                  </td>

                  <td>
                    {donation.donorName}
                    <br />
                    <small className="admin-muted">{donation.donorEmail}</small>
                  </td>

                  <td>{donation.claimedByNgoName || "—"}</td>

                  <td>{donation.city}</td>

                  <td>
                    <StatusBadge status={donation.status} />
                  </td>

                  <td>{formatDate(donation.createdAt)}</td>

                  <td>
                    <div className="admin-actions">
                      {donation.status === "pending" ? (
                        <button
                          type="button"
                          className="sv-btn sv-btn-ghost sv-btn-sm"
                          onClick={() => handleCancel(donation)}
                        >
                          Unlist
                        </button>
                      ) : null}

                      <button
                        type="button"
                        className="sv-btn sv-btn-danger sv-btn-sm"
                        onClick={() => handleRemove(donation)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination paged={paged} />
        </>
      )}
    </AdminShell>
  );

}

export default AdminDonations;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import CategoryThumb from "../../components/CategoryThumb";
import Modal from "../../components/Modal";
import { Pagination, usePaged } from "../../components/Pagination";
import { useAuthUser, useFetch } from "../../hooks/useSeva";
import { NGO_MENU } from "./ngoMenu";
import { getCategory } from "../../utils/categories";
import { useCategories } from "../../context/CategoriesContext";
import {
  claimDonation,
  formatDate,
  fetchAvailableDonations,
  reportDonation,
  REPORT_REASONS,
} from "../../utils/storage";
import "./NGO.css";

/* =========================================================
   AVAILABLE DONATIONS
   The live feed every NGO claims from, as a table. Food
   listings drop off automatically 2 days after they were
   posted, so this list only ever shows food that is fresh.
   ========================================================= */

const FOOD_HOURS = 48;

const foodHoursLeft = (donation) => {
  if (!/food/i.test(String(donation.category))) return null;

  const expiresAt =
    new Date(donation.createdAt).getTime() + FOOD_HOURS * 60 * 60 * 1000;

  return Math.max(0, Math.ceil((expiresAt - Date.now()) / (60 * 60 * 1000)));
};

function AvailableDonations() {
  const navigate = useNavigate();
  const user = useAuthUser("ngo");
  const { categories } = useCategories();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState("");

  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportNote, setReportNote] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportedIds, setReportedIds] = useState([]);

  const { data: fetchedDonations, refresh } = useFetch(
    () => fetchAvailableDonations(),
    []
  );

  const donations = fetchedDonations || [];

  const cities = [...new Set(donations.map((d) => d.city).filter(Boolean))];

  const term = search.trim().toLowerCase();

  const visible = donations.filter((donation) => {
    const matchesCategory =
      category === "all" || donation.category === category;

    const matchesCity = city === "all" || donation.city === city;

    const matchesSearch =
      !term ||
      donation.itemName.toLowerCase().includes(term) ||
      String(donation.description).toLowerCase().includes(term) ||
      String(donation.donorName).toLowerCase().includes(term);

    return matchesCategory && matchesCity && matchesSearch;
  });

  const paged = usePaged(visible, 10, `${term}|${category}|${city}`);

  if (!user) return null;

  const handleClaim = async (donation) => {
    if (
      !window.confirm(
        `Claim "${donation.itemName}" from ${donation.donorName}? The pickup address and contact number will be shared with you.`
      )
    ) {
      return;
    }

    const result = await claimDonation(donation.id);

    if (!result.ok) {
      setNotice(result.error);
      refresh();
      return;
    }

    refresh();
    navigate("/ngo/my-claims");
  };

  const openReport = (donation) => {
    setReportTarget(donation);
    setReportReason(REPORT_REASONS[0]);
    setReportNote("");
    setReportError("");
  };

  const closeReport = () => setReportTarget(null);

  const submitReport = async (event) => {
    event.preventDefault();

    setReportSubmitting(true);
    const result = await reportDonation(
      reportTarget.id,
      reportReason,
      reportNote.trim()
    );
    setReportSubmitting(false);

    if (!result.ok) {
      setReportError(result.error);
      return;
    }

    setReportedIds((ids) => [...ids, reportTarget.id]);
    setSuccess(
      `Thanks — your report on "${reportTarget.itemName}" was sent to the admin team.`
    );
    setNotice("");
    setReportTarget(null);
  };

  return (
    <DashboardShell
      user={user}
      menu={NGO_MENU}
      accent="teal"
      sectionLabel="NGO menu"
      title="Available donations"
      subtitle={`${donations.length} item${
        donations.length === 1 ? "" : "s"
      } waiting to be claimed`}
    >
      {notice ? <div className="sv-alert sv-alert-error">{notice}</div> : null}
      {success ? (
        <div className="sv-alert sv-alert-success">{success}</div>
      ) : null}

      <div className="ngo-filters">
        <input
          type="search"
          placeholder="Search by item, description or donor..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.icon} {item.label}
            </option>
          ))}
        </select>

        <select value={city} onChange={(event) => setCity(event.target.value)}>
          <option value="all">All cities</option>
          {cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="sv-empty">
          <div className="sv-empty-icon">🔍</div>
          <h3>No donations match right now</h3>
          <p>
            {donations.length === 0
              ? "Nothing is available on the platform at the moment. New listings appear here instantly."
              : "Try clearing the filters to see everything that is available."}
          </p>
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
                  <th>Donor</th>
                  <th>City</th>
                  <th>Pickup date</th>
                  <th>Listed</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paged.pageItems.map((donation) => {
                  const hoursLeft = foodHoursLeft(donation);

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

                      <td>{donation.donorName}</td>

                      <td>{donation.city || "—"}</td>

                      <td>
                        {donation.pickupDate
                          ? formatDate(donation.pickupDate)
                          : "Flexible"}
                      </td>

                      <td>
                        {formatDate(donation.createdAt)}
                        {hoursLeft !== null ? (
                          <>
                            <br />
                            <small style={{ color: "#c2410c" }}>
                              ⏳ Food · {hoursLeft}h left
                            </small>
                          </>
                        ) : null}
                      </td>

                      <td>
                        <div className="sv-cell-actions">
                          <button
                            type="button"
                            className="sv-btn sv-btn-teal sv-btn-sm"
                            onClick={() => handleClaim(donation)}
                          >
                            Claim
                          </button>

                          {reportedIds.includes(donation.id) ? (
                            <span className="admin-muted">✓ Reported</span>
                          ) : (
                            <button
                              type="button"
                              className="sv-btn sv-btn-ghost sv-btn-sm"
                              onClick={() => openReport(donation)}
                            >
                              ⚑ Report
                            </button>
                          )}
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

      {reportTarget ? (
        <Modal title="Report this listing" onClose={closeReport}>
          <form onSubmit={submitReport}>
            <p style={{ marginTop: 0 }}>
              You are reporting <strong>{reportTarget.itemName}</strong> (
              {reportTarget.city || "unknown city"}). The admin team will review
              it.
            </p>

            {reportError ? (
              <div className="sv-alert sv-alert-error">{reportError}</div>
            ) : null}

            <div className="sv-field">
              <label htmlFor="report-reason">Reason</label>
              <select
                id="report-reason"
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
              >
                {REPORT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div className="sv-field">
              <label htmlFor="report-note">Details (optional)</label>
              <textarea
                id="report-note"
                rows={3}
                value={reportNote}
                onChange={(event) => setReportNote(event.target.value)}
                placeholder="Tell us what looks wrong with this listing..."
              />
            </div>

            <div
              className="sv-modal-foot"
              style={{ padding: "18px 0 0", border: 0 }}
            >
              <button
                type="button"
                className="sv-btn sv-btn-ghost"
                onClick={closeReport}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="sv-btn sv-btn-danger"
                disabled={reportSubmitting}
              >
                {reportSubmitting ? "Sending..." : "Submit report"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </DashboardShell>
  );
}

export default AvailableDonations;

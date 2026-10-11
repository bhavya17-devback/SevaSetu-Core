import React, { useState } from "react";
import AdminShell from "./AdminShell";
import { Pagination, usePaged } from "../../components/Pagination";
import { useFetch } from "../../hooks/useSeva";
import {
  fetchAllReports,
  formatDate,
  markReportReviewed,
} from "../../utils/storage";
import "./Admin.css";

/* =========================================================
   ADMIN - REPORTS
   Every "Report this listing" submission an NGO has sent in.
   ========================================================= */

function AdminReports() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: fetchedReports, refresh } = useFetch(fetchAllReports, []);
  const reports = fetchedReports || [];

  const visible = reports.filter(
    (report) => statusFilter === "all" || report.status === statusFilter
  );

  const paged = usePaged(visible, 10, statusFilter);

  const handleReview = async (report) => {
    const result = await markReportReviewed(report.id);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    refresh();
  };

  return (
    <AdminShell
      title="Reports"
      subtitle={`${reports.length} report${reports.length === 1 ? "" : "s"} submitted`}
    >
      <div className="ngo-tabs">
        {["all", "Open", "Reviewed"].map((item) => (
          <button
            key={item}
            className={statusFilter === item ? "active" : ""}
            onClick={() => setStatusFilter(item)}
          >
            {item === "all" ? "All" : item}
            <span>
              {item === "all"
                ? reports.length
                : reports.filter((r) => r.status === item).length}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="sv-empty">
          <div className="sv-empty-icon">⚑</div>
          <h3>No reports here</h3>
          <p>
            {reports.length === 0
              ? "Nobody has flagged a listing yet — reports submitted by NGOs will show up here."
              : "Nothing matches this filter right now."}
          </p>
        </div>
      ) : (
        <>
        <div className="sv-table-wrap">
          <table className="sv-table">
            <thead>
              <tr>
                <th>Donation</th>
                <th>Reason</th>
                <th>Note</th>
                <th>Reported by</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paged.pageItems.map((report) => (
                <tr key={report.id}>
                  <td>
                    <strong>{report.donationName}</strong>
                    <br />
                    <small className="admin-muted">
                      {report.donationCity} ·{" "}
                      {report.donationStatus || "unknown"}
                    </small>
                  </td>

                  <td>{report.reason}</td>

                  <td>
                    {report.description ? (
                      report.description
                    ) : (
                      <span className="admin-muted">—</span>
                    )}
                  </td>

                  <td>
                    {report.reporterName}
                    <br />
                    <small className="admin-muted">{report.reporterRole}</small>
                  </td>

                  <td>{formatDate(report.createdAt)}</td>

                  <td>
                    <span
                      className={`sv-chip ${
                        report.status === "Open" ? "sv-chip-warn" : ""
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>

                  <td>
                    {report.status === "Open" ? (
                      <button
                        type="button"
                        className="sv-btn sv-btn-ghost sv-btn-sm"
                        onClick={() => handleReview(report)}
                      >
                        Mark reviewed
                      </button>
                    ) : (
                      <span className="admin-muted">—</span>
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
    </AdminShell>
  );
}

export default AdminReports;

import React, { useState } from "react";
import AdminShell from "./AdminShell";
import { Pagination, usePaged } from "../../components/Pagination";
import { useFetch } from "../../hooks/useSeva";
import {
  fetchAllDonationsAdmin,
  fetchAllUsers,
  formatDate,
  removeUser,
  setUserStatus,
} from "../../utils/storage";
import "./Admin.css";

/* =========================================================
   ADMIN - USERS
   Review every donor and NGO, suspend or delete accounts.
   ========================================================= */

function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: fetchedUsers, refresh } = useFetch(fetchAllUsers, []);
  const { data: fetchedDonations } = useFetch(fetchAllDonationsAdmin, []);

  const users = fetchedUsers || [];
  const donations = fetchedDonations || [];

  const term = search.trim().toLowerCase();

  const visible = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    const matchesSearch =
      !term ||
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      String(user.city).toLowerCase().includes(term);

    return matchesRole && matchesSearch;
  });

  const paged = usePaged(visible, 10, `${term}|${roleFilter}`);

  const activity = (user) =>
    user.role === "ngo"
      ? `${donations.filter((d) => d.claimedByNgoId === user.id).length} claims`
      : `${donations.filter((d) => d.donorId === user.id).length} donations`;

  const handleToggle = async (user) => {
    const next = user.status === "blocked" ? "active" : "blocked";

    if (
      window.confirm(
        next === "blocked"
          ? `Suspend ${user.name}? They will not be able to sign in.`
          : `Restore access for ${user.name}?`
      )
    ) {
      const result = await setUserStatus(user.id, next);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      refresh();
    }
  };

  const handleDelete = async (user) => {
    if (
      window.confirm(
        `Delete ${user.name} permanently? Their donations will also be removed.`
      )
    ) {
      const result = await removeUser(user.id);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      refresh();
    }
  };

  return (
    <AdminShell
      title="Users"
      subtitle={`${users.length} registered account${
        users.length === 1 ? "" : "s"
      }`}
    >
      <div className="ngo-filters">
        <input
          type="search"
          placeholder="Search by name, email or city..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          <option value="all">All roles</option>
          <option value="donor">Donors</option>
          <option value="ngo">NGOs</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="sv-empty">
          <div className="sv-empty-icon">👥</div>
          <h3>No accounts found</h3>
          <p>Nobody matches this filter yet.</p>
        </div>
      ) : (
        <>
        <div className="sv-table-wrap">
          <table className="sv-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Role</th>
                <th>Contact</th>
                <th>City</th>
                <th>Activity</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paged.pageItems.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-cell-user">
                      <div
                        className={`sv-avatar ${
                          user.role === "ngo" ? "teal" : ""
                        }`}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <strong>{user.name}</strong>
                        {user.regNumber ? (
                          <small className="admin-muted">
                            {user.regNumber}
                          </small>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={`admin-role ${user.role}`}>
                      {user.role}
                    </span>
                  </td>

                  <td>
                    {user.email}
                    <br />
                    <small className="admin-muted">{user.phone}</small>
                  </td>

                  <td>{user.city || "—"}</td>

                  <td>{activity(user)}</td>

                  <td>{formatDate(user.createdAt)}</td>

                  <td>
                    <span
                      className={`sv-badge ${
                        user.status === "blocked"
                          ? "sv-badge-cancelled"
                          : "sv-badge-completed"
                      }`}
                    >
                      {user.status === "blocked" ? "Suspended" : "Active"}
                    </span>
                  </td>

                  <td>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="sv-btn sv-btn-ghost sv-btn-sm"
                        onClick={() => handleToggle(user)}
                      >
                        {user.status === "blocked" ? "Restore" : "Suspend"}
                      </button>

                      <button
                        type="button"
                        className="sv-btn sv-btn-danger sv-btn-sm"
                        onClick={() => handleDelete(user)}
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

export default AdminUsers;

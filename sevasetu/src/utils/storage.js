/* =========================================================
   SEVASETU - CENTRAL DATA LAYER
   ---------------------------------------------------------
   Every page reads and writes data ONLY through this file,
   same as before - the only thing that changed is what's
   behind it. It used to read/write localStorage; now every
   function here calls the real Express + MongoDB backend
   through utils/api.js, and normalizes the response into the
   same shape the rest of the app already expects
   (donation.id, donation.donorName, donation.status as a
   lowercase string, etc.) so the pages barely had to change.
   ========================================================= */

import api, { getToken, setToken, clearToken } from "./api";

export { getToken, setToken, clearToken };

/* Coins earned per donation (used for the certificate). */
export const COINS_PER_DONATION = 10;
export const CERTIFICATE_TARGET = 100;

export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   NORMALIZATION
   ---------------------------------------------------------
   MongoDB gives us `_id`, capitalised statuses ("Available",
   "Claimed"...) and populated donor/claimedBy objects. Every
   page in this app was written against a simpler shape, so
   we translate once, here, instead of teaching every page
   about MongoDB.
   ========================================================= */

const STATUS_MAP = {
  available: "pending",
  pending: "pending",
  claimed: "claimed",
  completed: "completed",
  cancelled: "cancelled",
  expired: "expired",
};

export const normalizeUser = (raw) => {
  if (!raw) return null;

  return {
    id: raw._id || raw.id,
    name: raw.name || "",
    email: raw.email || "",
    phone: raw.phone || "",
    role: String(raw.role || "donor").toLowerCase(),
    city: raw.city || "",
    address: raw.address || "",
    regNumber: raw.regNumber || "",
    focusArea: raw.focusArea || "",
    status: String(raw.status || "active").toLowerCase(),
    createdAt: raw.createdAt,
  };
};

export const normalizeDonation = (raw) => {
  if (!raw) return null;

  const donor = raw.donor && typeof raw.donor === "object" ? raw.donor : null;
  const claimedBy =
    raw.claimedBy && typeof raw.claimedBy === "object" ? raw.claimedBy : null;

  return {
    id: raw._id || raw.id,

    donorId: donor ? donor._id : typeof raw.donor === "string" ? raw.donor : null,
    donorName: (donor && donor.name) || raw.donorName || "Donor",
    donorEmail: (donor && donor.email) || raw.donorEmail || "",
    donorPhone: (donor && donor.phone) || raw.donorPhone || "",

    category: raw.category,
    itemName: raw.itemName || raw.title || "Donation",
    quantity: raw.quantity,
    unit: raw.unit || "Items",
    condition: raw.condition || "Gently Used",
    description: raw.description || "",
    city: raw.city || "",
    address: raw.address || raw.pickupAddress || "",
    pickupDate: raw.pickupDate ? String(raw.pickupDate).slice(0, 10) : "",
    contactPhone: raw.contactPhone || "",

    status: STATUS_MAP[String(raw.status || "").toLowerCase()] || "pending",
    coins: raw.coins ?? COINS_PER_DONATION,
    otp: raw.otp || "",

    claimedByNgoId: claimedBy
      ? claimedBy._id
      : typeof raw.claimedBy === "string"
      ? raw.claimedBy
      : null,
    claimedByNgoName: claimedBy ? claimedBy.name : null,

    createdAt: raw.createdAt,
    claimedAt: raw.claimedAt || null,
    completedAt: raw.completedAt || null,
  };
};

/* =========================================================
   AUTH (raw calls - see src/context/AuthContext.js for the
   session-aware wrapper every page actually uses)
   ========================================================= */

export const apiRegister = (payload) =>
  api.post("/auth/register", {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    phone: payload.phone,
    role: payload.role,
    city: payload.city,
    address: payload.address,
    regNumber: payload.regNumber,
    focusArea: payload.focusArea,
  });

export const apiLogin = (email, password) =>
  api.post("/auth/login", { email, password });

export const apiAdminLogin = (email, password) =>
  api.post("/admin/login", { email, password });

export const apiMe = () => api.get("/auth/me");

/* =========================================================
   DONATIONS - DONOR + PUBLIC
   ========================================================= */

export const fetchAvailableDonations = async () => {
  const res = await api.get("/donations");
  return (res.data || []).map(normalizeDonation);
};

export const fetchMyDonations = async () => {
  const res = await api.get("/donations/my-donations");
  return (res.data || []).map(normalizeDonation);
};

export const fetchMyClaims = async () => {
  const res = await api.get("/claims/my-claims");
  return (res.data || []).map(normalizeDonation);
};

export const createDonation = async (form) => {
  try {
    const res = await api.post("/donations", {
      itemName: form.itemName,
      category: form.category,
      quantity: String(form.quantity),
      unit: form.unit,
      condition: form.condition,
      description: form.description,
      city: form.city,
      address: form.address,
      pickupDate: form.pickupDate || undefined,
      contactPhone: form.contactPhone,
    });
    return { ok: true, donation: normalizeDonation(res.data) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const claimDonation = async (donationId) => {
  try {
    await api.post("/claims", { donationId });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const completeDonation = async (donationId, otp) => {
  try {
    await api.patch(`/claims/${donationId}/status`, {
      status: "Completed",
      otp,
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const cancelDonation = async (donationId) => {
  try {
    await api.patch(`/donations/${donationId}/cancel`, {});
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const deleteDonation = async (donationId) => {
  try {
    await api.del(`/donations/${donationId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

/* Reasons must match the backend's enum exactly. */
export const REPORT_REASONS = [
  "Fake Donation",
  "Spam",
  "Incorrect Information",
  "Inappropriate Content",
];

export const reportDonation = async (donationId, reason, description) => {
  try {
    await api.post("/reports", { donationId, reason, description });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

const normalizeReport = (raw) => {
  if (!raw) return null;

  const donation =
    raw.donation && typeof raw.donation === "object" ? raw.donation : null;
  const reporter =
    raw.reportedBy && typeof raw.reportedBy === "object" ? raw.reportedBy : null;

  return {
    id: raw._id || raw.id,
    donationId: donation ? donation._id : raw.donation,
    donationName: donation ? donation.itemName : "Donation",
    donationCity: donation ? donation.city : "",
    donationStatus: donation
      ? STATUS_MAP[String(donation.status || "").toLowerCase()] || "pending"
      : "",
    reporterName: reporter ? reporter.name : "Someone",
    reporterRole: reporter ? String(reporter.role || "").toLowerCase() : "",
    reason: raw.reason,
    description: raw.description || "",
    status: raw.status || "Open",
    createdAt: raw.createdAt,
  };
};

/* Admin-only. */
export const fetchAllReports = async () => {
  const res = await api.get("/reports");
  return (res.data || []).map(normalizeReport);
};

export const markReportReviewed = async (reportId) => {
  try {
    await api.patch(`/reports/${reportId}/status`, { status: "Reviewed" });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

/* =========================================================
   CATEGORIES / SUBCATEGORIES (admin manage, public read)
   ========================================================= */

const normalizeDbCategory = (raw) =>
  raw
    ? {
        id: raw._id || raw.id,
        name: raw.name,
        slug: raw.slug,
        icon: raw.icon || "",
        blurb: raw.blurb || "",
      }
    : null;

const normalizeDbSubcategory = (raw) => {
  if (!raw) return null;
  const category =
    raw.category && typeof raw.category === "object" ? raw.category : null;

  return {
    id: raw._id || raw.id,
    name: raw.name,
    categoryId: category ? category._id : raw.category,
    categoryName: category ? category.name : "",
  };
};

export const fetchDbCategories = async () => {
  const res = await api.get("/categories");
  return (res.data || []).map(normalizeDbCategory);
};

export const fetchDbSubcategories = async (categoryId) => {
  const res = await api.get(
    categoryId ? `/subcategories?category=${categoryId}` : "/subcategories"
  );
  return (res.data || []).map(normalizeDbSubcategory);
};

export const createDbCategory = async ({ name, icon, blurb }) => {
  try {
    const res = await api.post("/categories", { name, icon, blurb });
    return { ok: true, category: normalizeDbCategory(res.data) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const deleteDbCategory = async (categoryId) => {
  try {
    await api.del(`/categories/${categoryId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const createDbSubcategory = async ({ name, category }) => {
  try {
    const res = await api.post("/subcategories", { name, category });
    return { ok: true, subcategory: normalizeDbSubcategory(res.data) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const deleteDbSubcategory = async (subcategoryId) => {
  try {
    await api.del(`/subcategories/${subcategoryId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

/* =========================================================
   DERIVED VALUES
   ---------------------------------------------------------
   Pure functions - they take a list you already fetched and
   compute a summary from it, so nothing here can ever drift
   out of sync with what's on screen.
   ========================================================= */

export const getCoinsFromDonations = (donations) =>
  (donations || [])
    .filter(
      (donation) =>
        donation.status !== "cancelled" && donation.status !== "expired"
    )
    .reduce(
      (total, donation) => total + (Number(donation.coins) || COINS_PER_DONATION),
      0
    );

export const getNgoStatsFromClaims = (claims, availableCount) => {
  const list = claims || [];

  return {
    totalClaims: list.length,
    inProgress: list.filter((d) => d.status === "claimed").length,
    received: list.filter((d) => d.status === "completed").length,
    available: availableCount || 0,
    donors: [...new Set(list.map((d) => d.donorId).filter(Boolean))].length,
    items: list.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0),
  };
};

/* =========================================================
   ADMIN
   ========================================================= */

export const fetchAllUsers = async () => {
  const res = await api.get("/admin/users");
  return (res.data || []).map(normalizeUser);
};

export const fetchAllDonationsAdmin = async () => {
  const res = await api.get("/admin/donations");
  return (res.data || []).map(normalizeDonation);
};

export const setUserStatus = async (userId, status) => {
  try {
    await api.patch(`/admin/users/${userId}/status`, { status });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const removeUser = async (userId) => {
  try {
    await api.del(`/admin/users/${userId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const adminCancelDonation = async (donationId) => {
  try {
    await api.patch(`/admin/donations/${donationId}/cancel`, {});
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const adminDeleteDonation = async (donationId) => {
  try {
    await api.del(`/admin/donations/${donationId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

/* Public platform totals for the landing page - no login needed. */
export const getPlatformStats = async () => {
  const res = await api.get("/stats");
  return (
    res.data || {
      donors: 0,
      ngos: 0,
      totalDonations: 0,
      pending: 0,
      claimed: 0,
      completed: 0,
      cities: 0,
    }
  );
};

/* Same shape, computed client-side from the full admin lists
   the admin dashboard already has to fetch for its tables. */
export const computeAdminStats = (users, donations) => ({
  donors: (users || []).filter((u) => u.role === "donor").length,
  ngos: (users || []).filter((u) => u.role === "ngo").length,
  totalDonations: (donations || []).length,
  pending: (donations || []).filter((d) => d.status === "pending").length,
  claimed: (donations || []).filter((d) => d.status === "claimed").length,
  completed: (donations || []).filter((d) => d.status === "completed").length,
  cities: [...new Set((donations || []).map((d) => d.city).filter(Boolean))]
    .length,
});

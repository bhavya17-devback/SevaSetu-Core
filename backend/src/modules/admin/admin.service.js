const User = require("../../models/User");
const Donation = require("../../models/Donation");
const bcrypt = require("bcryptjs");
const { expireStaleFoodDonations } = require("../../utils/donationRules");
const claimService = require("../claim/claim.service");

const registerAdmin = async (adminData) => {
  const existingUser = await User.findOne({
    email: String(adminData.email).trim().toLowerCase(),
  });
  if (existingUser) {
    throw new Error("Admin with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(adminData.password, 10);

  // Only these fields are accepted - nothing else from the request body.
  const admin = new User({
    name: adminData.name,
    email: String(adminData.email).trim().toLowerCase(),
    password: hashedPassword,
    phone: adminData.phone,
    city: adminData.city,
    address: adminData.address,
    role: "Admin",
    status: "active",
  });

  await admin.save();
  return admin;
};

// NGO approval uses ONE field: User.status.
//   pending  -> waiting for an admin decision (cannot log in yet)
//   active   -> approved / allowed in
//   rejected -> turned down
// (New NGO sign-ups are "active" straight away; an admin can set an
// account to "pending" to put it back in this queue.)
const getPendingNgos = async () => {
  return await User.find({
    role: { $regex: /^ngo$/i },
    status: { $regex: /^pending$/i },
  }).select("-password");
};

const NGO_STATUS_MAP = {
  approved: "active",
  active: "active",
  rejected: "rejected",
  pending: "pending",
};

const updateNgoStatus = async (ngoId, inputStatus = "active") => {
  const ngo = await User.findById(ngoId);
  if (!ngo || String(ngo.role).toLowerCase() !== "ngo") {
    throw new Error("NGO not found");
  }

  const targetStatus = NGO_STATUS_MAP[String(inputStatus).trim().toLowerCase()];
  if (!targetStatus) {
    throw new Error("Invalid NGO status");
  }

  ngo.status = targetStatus;
  await ngo.save();
  return ngo;
};

// Admin "test" claim - uses the same rules as every other claim
// (atomic, no self-claim, food expiry, claim record).
const adminClaimDonation = async (donationId, adminId) => {
  return await claimService.claimDonation(donationId, adminId);
};

const getPlatformStats = async () => {
  const totalUsers = await User.countDocuments();
  const totalDonations = await Donation.countDocuments();
  const claimedDonations = await Donation.countDocuments({ status: "Claimed" });
  const completedDonations = await Donation.countDocuments({ status: "Completed" });

  return {
    totalUsers,
    totalDonations,
    claimedDonations,
    completedDonations,
  };
};

// --- PHASE 5 METHODS ---

const getAllUsers = async () => {
  return await User.find().select("-password");
};

const updateUserStatus = async (userId, inputStatus) => {
  if (!inputStatus) {
    throw new Error("Status is required");
  }

  const rawStatus = String(inputStatus).trim().toLowerCase();
  const targetStatus = rawStatus === "approved" ? "active" : rawStatus;

  if (!["active", "pending", "blocked", "rejected"].includes(targetStatus)) {
    throw new Error("Invalid status");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { status: targetStatus } },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Their own listings go with them, same as the old local-storage behaviour.
  await Donation.deleteMany({ donor: userId });

  return user;
};

// --- Donation moderation (admin can see/manage every donation) ---

const getAllDonationsForAdmin = async () => {
  await expireStaleFoodDonations();

  // Food that sat unclaimed for 2 days has expired and drops off the list.
  return await Donation.find({ status: { $ne: "Expired" } })
    .sort({ createdAt: -1 })
    .populate("donor", "name email phone")
    .populate("claimedBy", "name email phone");
};

const cancelDonationAsAdmin = async (donationId) => {
  const donation = await Donation.findById(donationId);
  if (!donation) {
    throw new Error("Donation not found");
  }

  donation.status = "Cancelled";
  await donation.save();
  return donation;
};

const deleteDonationAsAdmin = async (donationId) => {
  const donation = await Donation.findByIdAndDelete(donationId);
  if (!donation) {
    throw new Error("Donation not found");
  }
  return donation;
};

module.exports = {
  registerAdmin,
  getPendingNgos,
  updateNgoStatus,
  adminClaimDonation,
  getPlatformStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllDonationsForAdmin,
  cancelDonationAsAdmin,
  deleteDonationAsAdmin,
};
const Donation = require("../../models/Donation");
const claimService = require("../claim/claim.service");
const { withMaskedDonor } = require("../../utils/privacy");
const {
  expireStaleFoodDonations,
  generateOtp,
  assertPickupDateAllowed,
} = require("../../utils/donationRules");

// What an NGO may see BEFORE it claims a listing: no street address, no
// phone number, no OTP. Those unlock only for the NGO that claims it.
const PUBLIC_HIDDEN_FIELDS = "-address -pickupAddress -contactPhone -otp";

// Only these fields come from the donor. Everything else (status, coins,
// claimedBy, otp, ...) is set by the server - a client can't award itself coins.
const CREATE_FIELDS = [
  "title",
  "itemName",
  "category",
  "quantity",
  "unit",
  "condition",
  "description",
  "city",
  "address",
  "pickupAddress",
  "pickupDate",
  "contactPhone",
];

const createDonation = async (donationData, donorId) => {
  assertPickupDateAllowed(donationData.pickupDate);

  const clean = {};
  CREATE_FIELDS.forEach((field) => {
    if (donationData[field] !== undefined) clean[field] = donationData[field];
  });

  return await Donation.create({
    ...clean,
    donor: donorId,
    status: "Available",
    otp: generateOtp(),
  });
};

const getAllDonations = async (filters) => {
  await expireStaleFoodDonations();

  const query = { status: "Available" };

  if (filters.category) {
    // Exact & case-insensitive category match (handles 'cooked_food', 'cooked food', etc.)
    const categoryPattern = filters.category.replace(/_/g, "[\\s_]?");
    query.category = new RegExp(`^${categoryPattern}$`, "i");
  }

  if (filters.city) {
    query.city = new RegExp(filters.city, "i");
  }

  const donations = await Donation.find(query)
    .select(PUBLIC_HIDDEN_FIELDS)
    .sort({ createdAt: -1 })
    .populate("donor", "name");

  return donations.map(withMaskedDonor);
};

const searchDonations = async (keyword) => {
  await expireStaleFoodDonations();

  const query = { status: "Available" };

  if (keyword) {
    const regex = new RegExp(keyword, "i");
    query.$or = [
      { itemName: regex },
      { description: regex },
      { category: regex },
      { city: regex },
      { title: regex }, // Backward compatibility for older test data
    ];
  }

  const donations = await Donation.find(query)
    .select(PUBLIC_HIDDEN_FIELDS)
    .sort({ createdAt: -1 })
    .populate("donor", "name");

  return donations.map(withMaskedDonor);
};

// The donor's own list - the only place the pickup OTP is ever returned.
const getMyDonations = async (donorId) => {
  await expireStaleFoodDonations();

  const donations = await Donation.find({ donor: donorId })
    .select("+otp")
    .sort({ createdAt: -1 })
    .populate("claimedBy", "name email phone");

  // Donations created before OTPs existed get one the first time the
  // donor opens their list, so every open donation can be verified.
  await Promise.all(
    donations
      .filter((d) => !d.otp && ["Available", "Claimed"].includes(d.status))
      .map(async (d) => {
        d.otp = generateOtp();
        await d.save();
      })
  );

  return donations;
};

// Claiming and "my claims" live in claim.service - one implementation,
// so the rules can never differ between routes.
const claimDonation = (donationId, userId) =>
  claimService.claimDonation(donationId, userId);

const getMyClaims = (userId) => claimService.getMyClaims(userId);

// Donor takes their own still-available listing off the platform.
// NGOs stop seeing it, but it stays on the donor's own history.
const cancelDonation = async (donationId, donorId) => {
  const donation = await Donation.findOne({ _id: donationId, donor: donorId });

  if (!donation) {
    throw new Error("Donation not found");
  }

  if (donation.status !== "Available") {
    throw new Error("Only an unclaimed donation can be cancelled");
  }

  donation.status = "Cancelled";
  await donation.save();
  return donation;
};

// Donor permanently removes a listing that was never claimed
// (or one they already cancelled / that expired).
const deleteDonation = async (donationId, donorId) => {
  const donation = await Donation.findOne({ _id: donationId, donor: donorId });

  if (!donation) {
    throw new Error("Donation not found");
  }

  if (!["Available", "Cancelled", "Expired"].includes(donation.status)) {
    throw new Error("A claimed or completed donation cannot be deleted");
  }

  await donation.deleteOne();
  return donation;
};

module.exports = {
  createDonation,
  getAllDonations,
  searchDonations,
  getMyDonations,
  claimDonation,
  getMyClaims,
  cancelDonation,
  deleteDonation,
};

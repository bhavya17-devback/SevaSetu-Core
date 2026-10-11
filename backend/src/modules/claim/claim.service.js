const Donation = require("../../models/Donation");
const Claim = require("../../models/Claim");
const { withMaskedDonor } = require("../../utils/privacy");
const { isFoodExpired, generateOtp } = require("../../utils/donationRules");

// THE one claim implementation - every route goes through here.
//
// Two NGOs pressing "Claim" at the same moment must not both win, so the
// status check and the update are ONE atomic database operation
// (findOneAndUpdate with status: "Available" in the filter). Whoever the
// database processes first gets it; the other gets "no longer available".
const claimDonation = async (donationId, claimantId) => {
  const existing = await Donation.findById(donationId);
  if (!existing) {
    throw new Error("Donation not found");
  }

  if (String(existing.donor) === String(claimantId)) {
    throw new Error("You cannot claim your own donation");
  }

  if (existing.status === "Available" && isFoodExpired(existing)) {
    await Donation.updateOne(
      { _id: existing._id, status: "Available" },
      { $set: { status: "Expired" } }
    );
    throw new Error("This food donation has expired and can no longer be claimed");
  }

  const claimedAt = new Date();

  const donation = await Donation.findOneAndUpdate(
    { _id: donationId, status: "Available" },
    { $set: { status: "Claimed", claimedBy: claimantId, claimedAt } },
    { new: true }
  );

  if (!donation) {
    throw new Error("Donation is no longer available");
  }

  // Real, standalone audit record in its own "claims" collection.
  try {
    await Claim.create({
      donation: donation._id,
      donor: donation.donor,
      ngo: claimantId,
      status: "Claimed",
      claimedAt,
    });
  } catch (error) {
    // Don't leave a donation marked Claimed with no claim record behind it.
    await Donation.updateOne(
      { _id: donation._id, claimedBy: claimantId, status: "Claimed" },
      { $set: { status: "Available", claimedBy: null, claimedAt: null } }
    );
    throw error;
  }

  return donation;
};

// The NGO gets what it needs to collect the item (pickup address, the
// contact number the donor chose for pickup) but only a shortened donor
// name - never the donor's email or account phone number.
const getMyClaims = async (ngoId) => {
  // Claims made before OTPs existed get one now, so the donor sees a
  // code on their dashboard and the NGO can verify the pickup.
  const withoutOtp = await Donation.find({
    claimedBy: ngoId,
    status: "Claimed",
    otp: { $exists: false },
  }).select("+otp");
  await Promise.all(
    withoutOtp.map(async (d) => {
      d.otp = generateOtp();
      await d.save();
    })
  );

  const donations = await Donation.find({ claimedBy: ngoId })
    .sort({ createdAt: -1 })
    .populate("donor", "name");

  return donations.map(withMaskedDonor);
};

const updateClaimStatus = async (donationId, status, ngoId, otp) => {
  const donation = await Donation.findOne({
    _id: donationId,
    claimedBy: ngoId,
  }).select("+otp");
  if (!donation) {
    throw new Error("Claim record not found or unauthorized");
  }

  // Handing the item over is verified with the donor's OTP. (Donations
  // created before OTPs existed have none, so they can still be closed.)
  if (status === "Completed" && donation.otp) {
    if (String(otp || "").trim() !== donation.otp) {
      throw new Error(
        "Incorrect OTP. Ask the donor for the 6-digit code on their My Donations page."
      );
    }
  }

  donation.status = status;
  if (status === "Completed") {
    donation.completedAt = new Date();
  }
  await donation.save();

  const claimRecord = await Claim.findOne({ donation: donation._id, ngo: ngoId }).sort({
    createdAt: -1,
  });
  if (claimRecord) {
    claimRecord.status = status;
    if (status === "Completed") {
      claimRecord.completedAt = new Date();
    }
    await claimRecord.save();
  }

  return donation;
};

module.exports = {
  claimDonation,
  getMyClaims,
  updateClaimStatus,
};
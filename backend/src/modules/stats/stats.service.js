const User = require("../../models/User");
const Donation = require("../../models/Donation");
const { expireStaleFoodDonations } = require("../../utils/donationRules");

const getPublicStats = async () => {
  await expireStaleFoodDonations();

  const [donors, ngos, totalDonations, pending, claimed, completed, cities] =
    await Promise.all([
      User.countDocuments({ role: { $regex: /^donor$/i } }),
      User.countDocuments({ role: { $regex: /^ngo$/i } }),
      Donation.countDocuments({ status: { $ne: "Expired" } }),
      Donation.countDocuments({ status: "Available" }),
      Donation.countDocuments({ status: "Claimed" }),
      Donation.countDocuments({ status: "Completed" }),
      Donation.distinct("city"),
    ]);

  return {
    donors,
    ngos,
    totalDonations,
    pending,
    claimed,
    completed,
    cities: cities.filter(Boolean).length,
  };
};

module.exports = { getPublicStats };

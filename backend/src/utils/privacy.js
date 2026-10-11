/**
 * Turns "Rahul Sharma" into "Rahul S." so an NGO can address the donor
 * without ever seeing their full name.
 */
const maskName = (name) => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "Donor";
  if (parts.length === 1) return parts[0];

  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${parts[0]} ${lastInitial}.`;
};

/**
 * Returns a plain object copy of a donation whose populated `donor`
 * only carries the id and the masked name - no email, no phone.
 */
const withMaskedDonor = (donation) => {
  const plain = donation.toObject ? donation.toObject() : { ...donation };

  if (plain.donor && typeof plain.donor === "object") {
    plain.donor = { _id: plain.donor._id, name: maskName(plain.donor.name) };
  }

  return plain;
};

module.exports = { maskName, withMaskedDonor };

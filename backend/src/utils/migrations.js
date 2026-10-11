const Donation = require("../models/Donation");

// Older records may carry lower-case or "pending" statuses. This folds
// them into the one convention the code uses (Available / Claimed /
// Completed / Cancelled / Expired). Safe to run on every start.
const STATUS_FIXES = [
  [["pending", "Pending", "available"], "Available"],
  [["claimed"], "Claimed"],
  [["completed"], "Completed"],
  [["cancelled"], "Cancelled"],
  [["expired"], "Expired"],
];

const normalizeLegacyData = async () => {
  let changed = 0;

  for (const [from, to] of STATUS_FIXES) {
    const result = await Donation.collection.updateMany(
      { status: { $in: from } },
      { $set: { status: to } }
    );
    changed += result.modifiedCount || 0;
  }

  if (changed > 0) {
    console.log(`Normalized ${changed} donation status value(s).`);
  }
};

module.exports = { normalizeLegacyData };

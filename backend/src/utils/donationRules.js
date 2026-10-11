const crypto = require("crypto");
const Donation = require("../models/Donation");

// Food goes off quickly, so an unclaimed food donation is only shown
// to NGOs and admins for this long after it was listed.
const FOOD_VISIBLE_HOURS = 48;

// A donor can only schedule a pickup within this many days from today.
const MAX_PICKUP_DAYS = 14;

const FOOD_REGEX = /food/i;

const isFoodCategory = (category) => FOOD_REGEX.test(String(category || ""));

const isFoodExpired = (donation) =>
  isFoodCategory(donation.category) &&
  Date.now() - new Date(donation.createdAt).getTime() >
    FOOD_VISIBLE_HOURS * 60 * 60 * 1000;

/**
 * Marks every still-unclaimed food donation older than 2 days as Expired.
 * Called before any list is read, so stale food never shows up and no
 * background job is needed.
 */
const expireStaleFoodDonations = async () => {
  const cutoff = new Date(Date.now() - FOOD_VISIBLE_HOURS * 60 * 60 * 1000);

  await Donation.updateMany(
    {
      status: "Available",
      category: FOOD_REGEX,
      createdAt: { $lt: cutoff },
    },
    { $set: { status: "Expired" } }
  );
};

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const toDayString = (date) => date.toISOString().slice(0, 10);

/**
 * Pickup date must fall between today and today + 14 days.
 * One day of slack on each side so a server in a different timezone
 * than the donor never rejects a date the form legitimately allowed.
 */
const assertPickupDateAllowed = (value) => {
  if (!value) return;

  const picked = new Date(value);
  if (Number.isNaN(picked.getTime())) {
    throw new Error("Pickup date is not valid");
  }

  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const earliest = toDayString(new Date(now - day));
  const latest = toDayString(new Date(now + (MAX_PICKUP_DAYS + 1) * day));
  const chosen = toDayString(picked);

  if (chosen < earliest) {
    throw new Error("Pickup date cannot be in the past");
  }
  if (chosen > latest) {
    throw new Error(
      `Pickup date must be within the next ${MAX_PICKUP_DAYS} days`
    );
  }
};

module.exports = {
  FOOD_VISIBLE_HOURS,
  MAX_PICKUP_DAYS,
  isFoodCategory,
  isFoodExpired,
  expireStaleFoodDonations,
  generateOtp,
  assertPickupDateAllowed,
};

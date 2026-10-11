const express = require("express");
const router = express.Router();
const donationController = require("./donation.controller");
const validateRequest = require("../../middleware/validateRequest");
const { protect, requireRole } = require("../../middleware/authMiddleware");
const { createDonationSchema } = require("./donation.validation");

// Who may do what (enforced here on the server, not just by hiding
// buttons in the website):
//   donor -> create / list / cancel / delete their OWN donations
//   ngo   -> browse the available feed, claim, see their claims
//   admin -> may browse the feed too (moderation lives under /api/admin)

// --- Donor ---
router.post(
  "/",
  protect,
  requireRole("donor"),
  validateRequest(createDonationSchema),
  donationController.create
);

router.get("/my-donations", protect, requireRole("donor"), donationController.getMy);
router.get("/mydonations", protect, requireRole("donor"), donationController.getMy);

router.patch("/:id/cancel", protect, requireRole("donor"), donationController.cancel);
router.delete("/:id", protect, requireRole("donor"), donationController.remove);

// --- NGO (and admin, read-only feed) ---
router.get("/", protect, requireRole("ngo", "admin"), donationController.getAll);
router.get("/search", protect, requireRole("ngo", "admin"), donationController.search);

router.get("/myclaims", protect, requireRole("ngo"), donationController.getMyClaims);
router.put("/:id/claim", protect, requireRole("ngo"), donationController.claim);

module.exports = router;

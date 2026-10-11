const express = require("express");
const router = express.Router();
const claimController = require("./claim.controller");
const validateRequest = require("../../middleware/validateRequest");
const { protect, requireRole } = require("../../middleware/authMiddleware");
const { claimDonationSchema, updateStatusSchema } = require("./claim.validation");

// Claims are an NGO-only feature.
router.post(
  "/",
  protect,
  requireRole("ngo"),
  validateRequest(claimDonationSchema),
  claimController.claim
);
router.get("/my-claims", protect, requireRole("ngo"), claimController.getMyClaims);
router.patch(
  "/:id/status",
  protect,
  requireRole("ngo"),
  validateRequest(updateStatusSchema),
  claimController.updateStatus
);

module.exports = router;
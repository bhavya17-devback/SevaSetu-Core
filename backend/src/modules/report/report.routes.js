const express = require("express");
const router = express.Router();
const reportController = require("./report.controller");
const validateRequest = require("../../middleware/validateRequest");
const {
  protect,
  requireRole,
  adminOnly,
} = require("../../middleware/authMiddleware");
const { createReportSchema } = require("./report.validation");

router.post(
  "/",
  protect,
  requireRole("donor", "ngo"),
  validateRequest(createReportSchema),
  reportController.create
);
router.get("/", protect, adminOnly, reportController.getAll);
router.patch("/:id/status", protect, adminOnly, reportController.updateStatus);

module.exports = router;
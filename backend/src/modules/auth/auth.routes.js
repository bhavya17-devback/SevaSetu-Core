const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const authController = require("./auth.controller");
const { protect } = require("../../middleware/authMiddleware");

// 24. Auth Rate Limiter Configuration (Max 5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many login attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth Routes
router.post("/register", authController.register); // Missing Route Added Back
router.post("/login", authLimiter, authController.login);

// Used by the frontend on page load / refresh to restore the session
// from a saved token, without asking the user to log in again.
router.get("/me", protect, authController.getMe);

module.exports = router;
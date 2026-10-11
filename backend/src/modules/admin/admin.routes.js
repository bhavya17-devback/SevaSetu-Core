const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");
const { protect, adminOnly } = require("../../middleware/authMiddleware");
const { authLimiter } = require("../../middleware/rateLimiter");

// 15. POST Admin Login
router.post("/login", authLimiter, adminController.login);

// Protected Admin Routes - everything below needs a logged-in admin
router.use(protect, adminOnly);

// 14. POST Admin Register - only an existing admin can create another admin.
// (The very first admin comes from the seed script: npm run seed:admin)
router.post("/register", adminController.register);

// 16. PUT Gatekeeping Barrier Check
router.put("/gatekeeper", adminController.gatekeeperCheck);

// 17. GET Pending List NGO
router.get("/ngos/pending", adminController.getPendingNgos);

// 18. PUT NGO Status Approve
router.put("/ngos/:id/approve", adminController.approveNgo);

// 19. PUT Claim Donation Test (Admin)
router.put("/donations/:id/claim", adminController.claimDonation);

// 20. GET Analytics & Reports Test
router.get("/analytics", adminController.getAnalytics);

// 21. GET Fetch All Users Test
router.get("/users", adminController.getAllUsers);

// 22. PATCH Update User Status Test
router.patch("/users/:id/status", adminController.updateUserStatus);

// 23. DEL Delete User Test
router.delete("/users/:id", adminController.deleteUser);

// GET every donation on the platform (any status)
router.get("/donations", adminController.getAllDonations);

// PATCH unlist a donation without deleting it
router.patch("/donations/:id/cancel", adminController.cancelDonation);

// DEL permanently remove a donation
router.delete("/donations/:id", adminController.deleteDonation);

module.exports = router;
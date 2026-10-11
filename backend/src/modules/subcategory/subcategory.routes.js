const express = require("express");
const router = express.Router();
const subcategoryController = require("./subcategory.controller");
const { protect, adminOnly } = require("../../middleware/authMiddleware");

router.get("/", subcategoryController.getAll);

// Admin only.
router.post("/", protect, adminOnly, subcategoryController.create);
router.delete("/:id", protect, adminOnly, subcategoryController.remove);

module.exports = router;

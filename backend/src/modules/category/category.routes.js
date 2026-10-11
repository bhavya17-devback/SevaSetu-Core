const express = require("express");
const router = express.Router();
const categoryController = require("./category.controller");
const { protect, adminOnly } = require("../../middleware/authMiddleware");

// Public - anyone building the donation form can read the category list.
router.get("/", categoryController.getAll);

// Admin only.
router.post("/", protect, adminOnly, categoryController.create);
router.delete("/:id", protect, adminOnly, categoryController.remove);

module.exports = router;

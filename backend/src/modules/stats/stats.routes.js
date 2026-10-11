const express = require("express");
const router = express.Router();
const statsController = require("./stats.controller");

// Public - the landing page shows these totals before anyone logs in.
router.get("/", statsController.getPublicStats);

module.exports = router;

const express = require("express");
const router = express.Router();
const { extractText, analyzePrescription } = require("../controllers/visionController");

// POST /api/v1/vision/extract-text
router.post("/extract-text", extractText);

// POST /api/v1/vision/analyze
router.post("/analyze", analyzePrescription);

module.exports = router;

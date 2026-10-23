const express = require("express");
const router = express.Router();
const { extractText } = require("../controllers/visionController");

// POST /api/v1/vision/extract-text
router.post("/extract-text", extractText);

module.exports = router;

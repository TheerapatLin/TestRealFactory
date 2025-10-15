const express = require("express");

const { getMockAiSummary } = require("../controllers/aiHelperController");

const router = express.Router();

router.post("/", getMockAiSummary);

module.exports = router;

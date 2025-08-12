const express = require("express");
const {getAvailability } = require("../controllers/availabilityController");

const router = express.Router();

router.get("/dates", getAvailability);

module.exports = router;
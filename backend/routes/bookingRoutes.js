const express = require("express");
const { getBookings, respondToBooking } = require("../controllers/bookingController");

const router = express.Router();

router.get("/", getBookings);
router.put("/:id", respondToBooking);

module.exports = router;

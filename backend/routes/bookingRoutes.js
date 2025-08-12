const express = require("express");
const { getBookings, respondToBooking, createBooking } = require("../controllers/bookingController");

const router = express.Router();

// Public booking creation
router.post("/", createBooking);
router.get("/", getBookings);
router.put("/:id", respondToBooking);

module.exports = router;

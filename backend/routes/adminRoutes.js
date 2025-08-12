const express = require("express");
const { addImage, getImages, deleteImage, upload } = require("../controllers/galleryController");
const testimonialsController = require("../controllers/reviewController");
const { getBookings, respondToBooking } = require("../controllers/bookingController");
const { getAvailability, bookDate, updateAvailability } = require("../controllers/availabilityController");

const router = express.Router();


router.post("/gallery", upload.single("image"), addImage);
router.get("/gallery/getimages", getImages);
router.delete("/gallery/:id", deleteImage);

// Review Management
router.get('/gettestimonials', testimonialsController.getTestimonials);

// Booking Management
router.get("/bookings", getBookings);
router.put("/bookings/:id", respondToBooking);

// Availability Management
router.get("/dates", getAvailability);
router.put("/dates", updateAvailability);
router.put("/book-date", bookDate);

module.exports = router;
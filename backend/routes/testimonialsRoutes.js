const express = require('express');
const router = express.Router();
const testimonialsController = require("../controllers/reviewController");

// Route to get testimonials with pagination
router.get('/gettestimonials', testimonialsController.getTestimonials);

// Route to add a new testimonial
router.post('/addtestimonial', testimonialsController.addTestimonial);

module.exports = router;

const { pool } = require("../db");

require("dotenv").config();

// Get Bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await pool.query("SELECT * FROM bookings ORDER BY created_at DESC");

    if (!bookings.rows.length) {
      console.warn("⚠ No bookings found.");
    }

    res.json({ bookings: bookings.rows });
  } catch (err) {
    console.error("Error fetching bookings:", err.message);
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

// Respond to Booking
const respondToBooking = async (req, res) => {
  const { id } = req.params;
  const { response } = req.body;
  try {
    await pool.query("UPDATE bookings SET status = $1 WHERE id = $2", [response, id]);
    res.json({ message: "Booking response updated!" });
  } catch (err) {
    res.status(500).json({ message: "Error updating booking status" });
  }
};

module.exports = { getBookings, respondToBooking };

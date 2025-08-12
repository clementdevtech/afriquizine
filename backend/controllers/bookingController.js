const { pool } = require("../db");

require("dotenv").config();

// Create a booking
const createBooking = async (req, res) => {
  const { name, email, date, numberOfGuests } = req.body;

  if (!name || !email || !date) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // ✅ Ensure user exists (create if not)
    let user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      const username = name.trim().replace(/\s+/g, "_").toLowerCase();
      const newUser = await pool.query(
        `INSERT INTO users (email, username, password, verified) VALUES ($1, $2, '', false) RETURNING *`,
        [email, username]
      );
      user = newUser;
    }

    const userId = user.rows[0].id;

    // ✅ Check if date is available
    const available = await pool.query(
      "SELECT * FROM available_dates WHERE date = $1 AND booked = false",
      [date]
    );
    if (available.rows.length === 0) {
      return res.status(400).json({ message: "Selected date is not available." });
    }

    // ✅ Insert booking
    const booking = await pool.query(
      `INSERT INTO bookings (user_id, date, status) VALUES ($1, $2, 'pending') RETURNING *`,
      [userId, date]
    );

    // ✅ Mark date as booked
    await pool.query("UPDATE available_dates SET booked = true WHERE date = $1", [date]);

    // ✅ Send confirmation email
    const emailContent = `
      <h2>Booking Confirmation</h2>
      <p>Thank you, ${name}! Your booking has been received.</p>
      <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
      <p><strong>Guests:</strong> ${numberOfGuests}</p>
      <p>Status: <strong>Pending</strong></p>
    `;
    await sendEmail(email, "Booking Confirmation", emailContent);

    res.status(201).json({ message: "Booking created successfully.", booking: booking.rows[0] });

  } catch (err) {
    console.error("Error creating booking:", err.message);
    res.status(500).json({ message: "Error creating booking." });
  }
};

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

module.exports = { getBookings, respondToBooking, createBooking };

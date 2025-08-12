const { pool } = require("../db");
require("dotenv").config();

// Get Availability
const getAvailability = async (req, res) => {
  try {
    console.log('Fetching available dates for the next month...');

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    const insertPromises = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const formattedDate = date.toISOString().split("T")[0];

      insertPromises.push(
        pool.query(
          `INSERT INTO available_dates (date, booked) VALUES ($1, false) 
           ON CONFLICT (date) DO NOTHING`,
          [formattedDate]
        )
      );
    }
    await Promise.all(insertPromises);

    const { rows } = await pool.query(
      `SELECT date, booked 
       FROM available_dates 
       WHERE date BETWEEN $1 AND $2 
       ORDER BY date ASC`,
      [today.toISOString().split("T")[0], nextMonth.toISOString().split("T")[0]]
    );

    res.json({ dates: rows });
  } catch (err) {
    console.error('Error fetching availability:', err.message);
    res.status(500).json({ message: "Error fetching availability" });
  }
};

// Book a Date
const bookDate = async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ message: "Date is required" });

  try {
    const result = await pool.query(
      `UPDATE available_dates 
       SET booked = true 
       WHERE date = $1 AND booked = false 
       RETURNING *`,
      [date]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Date is not available or already booked" });
    }

    res.json({ message: "Date successfully booked!" });
  } catch (err) {
    console.error("Error booking date:", err.message);
    res.status(500).json({ message: "Error booking date" });
  }
};

// Update Availability (Admin)
const updateAvailability = async (req, res) => {
  const { dates } = req.body;
  if (!Array.isArray(dates)) return res.status(400).json({ message: "Dates array is required" });

  try {
    await pool.query("TRUNCATE available_dates");
    const insertPromises = dates.map(date =>
      pool.query("INSERT INTO available_dates (date, booked) VALUES ($1, false)", [date])
    );
    await Promise.all(insertPromises);

    res.json({ message: "Availability updated successfully!" });
  } catch (err) {
    console.error("Error updating availability:", err.message);
    res.status(500).json({ message: "Error updating availability" });
  }
};

module.exports = { getAvailability, bookDate, updateAvailability };
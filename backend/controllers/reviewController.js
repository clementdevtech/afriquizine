const { pool } = require('../db');


const getTestimonials = async (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 3;

  console.log(offset, limit)

  try {
    const query = `
      SELECT t.id, t.message, t.created_at, u.username, u.profile_picture
      FROM testimonials t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const values = [limit, offset];

    const testimonials = (await pool.query(query, values)).rows;

    // Get total count
    const totalCount = (await pool.query(`SELECT COUNT(*) FROM testimonials`)).rows[0].count;

    res.status(200).json({
      testimonials,
      totalCount: parseInt(totalCount)
    });
  } catch (err) {
    console.error('Error fetching testimonials:', err.message);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};



const addTestimonial = async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message?.trim()) {
    return res.status(400).json({ error: 'User ID and message are required' });
  }

  if (message.length > 500) {
    return res.status(400).json({ error: 'Message is too long (max 500 chars)' });
  }

  try {
    // Ensure user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const query = `
      INSERT INTO testimonials (user_id, message) 
      VALUES ($1, $2) 
      RETURNING id, user_id, message, created_at;
    `;
    const values = [userId, message.trim()];

    const newTestimonial = (await pool.query(query, values)).rows[0];

    res.status(201).json(newTestimonial);
  } catch (err) {
    console.error('Error saving testimonial:', err);
    res.status(500).json({ error: 'Failed to save testimonial' });
  }
};


module.exports = { getTestimonials, addTestimonial };


const express = require('express');
const router = express.Router();
const db = require('../db');

// Get contact info
router.get('/', async (req, res) => {
    try {
        const contact = await db.select('*').from('contact_info').first();
        res.json(contact);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch contact info' });
    }
});

// Admin: Update contact info
router.put('/update', async (req, res) => {
    const { email, phone, address } = req.body;
    try {
        await db('contact_info').update({ email, phone, address });
        res.json({ message: 'Contact info updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update contact info' });
    }
});

module.exports = router;

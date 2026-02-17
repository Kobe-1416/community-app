const express = require('express');
const router = express.Router();
const pool = require('./db'); // adjust path

/* =========================
   1. Fetch all items
========================= */
router.get('/items', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, prod_name, prod_desc, price, created_at, cell_no
       FROM market
       ORDER BY created_at DESC`
    );

    res.json({ success: true, items: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


/* =========================
   2. Post new item
========================= */
router.post('/items', async (req, res) => {
  try {
    const { user_id, prod_name, prod_desc, price, cell_no } = req.body;

    // Basic validation
    if (!user_id || !prod_name || !price) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO market (user_id, prod_name, prod_desc, price, cell_no, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [user_id, prod_name, prod_desc, price, cell_no]
    );

    res.status(201).json({ success: true, item: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


/* =========================
   3. Remove item
========================= */
router.delete('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM market
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: 'Item removed' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

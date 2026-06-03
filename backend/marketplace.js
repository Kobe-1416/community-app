const express = require('express');
const router = express.Router();
const { sendExpoPush } = require("./services/pushService"); 
const pool = require('./db'); // adjust path

async function notifyMarketplaceUsers({ sellerId, item }) {
  try {
    const tokenResult = await pool.query(
      `
      SELECT expo_push_token
      FROM user_notification_settings
      WHERE push_enabled = true
        AND marketplace_enabled = true
        AND expo_push_token IS NOT NULL
        AND user_id <> $1
      `,
      [sellerId]
    );

    const tokens = tokenResult.rows.map((row) => row.expo_push_token);

    if (tokens.length === 0) {
      console.log("No marketplace notification recipients");
      return;
    }

    await sendExpoPush(tokens, {
      title: "New marketplace item",
      body: `${item.prod_name} was listed for R${item.price}`,
      data: {
        type: "marketplace",
        itemId: item.id,
      },
    });

    console.log(`Marketplace notification sent to ${tokens.length} devices`);
  } catch (err) {
    console.error("Marketplace notification failed:", err);
  }
}

/* =========================
   1. Fetch all items
========================= */
router.get('/items', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, prod_name, prod_desc, price, created_at, cell_no, images
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
router.post('/items', authenticateToken, async (req, res) => {
  try {
    const { user_id, prod_name, prod_desc, price, cell_no, images } = req.body;

    if (!user_id || !prod_name || !price) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO market (user_id, prod_name, prod_desc, price, cell_no, images, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [user_id, prod_name, prod_desc, price, cell_no, JSON.stringify(images)]
    );

    const createdItem = result.rows[0];

    // Send response first so listing creation is never blocked by push failure
    res.status(201).json({ success: true, item: createdItem });

    // Fire-and-forget notification
    notifyMarketplaceUsers({
      sellerId: user_id,
      item: createdItem,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


/* =========================
   3. Remove item
========================= */
router.delete('/items/:id', authenticateToken, async (req, res) => {
  // only admin can delete items, users will ask admin to remove if needed
  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

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

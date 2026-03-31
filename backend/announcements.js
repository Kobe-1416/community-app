// announcements.js
const express = require("express");
const router = express.Router();
const pool = require("./db");
const { sendExpoPush } = require("./services/pushService");
const authenticateToken = require("./middleware/auth");

// Create a new announcement (+ send push)
router.post("/", async (req, res) => {
  try {
    const { title, body, category } = req.body;

    if (!title || !body) {
      return res
        .status(400)
        .json({ success: false, message: "Title and body required" });
    }

    // 1) Insert announcement
    const result = await pool.query(
      `INSERT INTO announcements (title, body, category, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, title, body, category, created_at`,
      [title, body, category || "General"]
    );

    const announcement = result.rows[0];

    // 2) Get tokens for users who enabled push
    const tokensResult = await pool.query(
      `SELECT expo_push_token
       FROM user_notification_settings
       WHERE push_enabled = true
         AND expo_push_token IS NOT NULL`
    );

    const tokens = tokensResult.rows.map((r) => r.expo_push_token);

    // 3) Send push (don’t fail the request if push fails)
    if (tokens.length > 0) {
      sendExpoPush(tokens, {
        title: "New announcement",
        body: announcement.title,
        data: { type: "announcement", id: announcement.id },
      }).catch((e) => console.error("Push send failed:", e));
    }

    return res.status(201).json({ success: true, announcement });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all announcements
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, body, created_at, category
       FROM announcements
       ORDER BY created_at DESC`
    );

    res.json({ success: true, announcements: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Cleanup old announcements
router.delete("/cleanup", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM announcements WHERE created_at < NOW() - INTERVAL '14 days'`
    );

    res.json({ success: true, deleted: result.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM announcements WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
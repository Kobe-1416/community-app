// announcements.js
const express = require("express");
const router = express.Router();
const pool = require("./db");
const { sendExpoPush } = require("./services/pushService");
const authenticateToken = require("./middleware/auth");

// Create a new announcement (+ send push)
router.post("/", authenticateToken, async (req, res) => {
  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  try {
    const { title, body, category } = req.body;
    const userId = req.user.dbUserId;

    if (!title || !body) {
      return res
        .status(400)
        .json({ success: false, message: "Title and body required" });
    }

    // 1) Get creator name
    const userResult = await pool.query(
      `SELECT surname FROM com_users WHERE id = $1 LIMIT 1`,
      [userId]
    );

    const createdBy = userResult.rows[0]?.surname || "Unknown Admin";

    // 2) Insert announcement
    const result = await pool.query(
      `INSERT INTO announcements (title, body, category, created_at, created_by)
       VALUES ($1, $2, $3, NOW(), $4)
       RETURNING id, title, body, category, created_at, created_by`,
      [title, body, category || "General", createdBy]
    );

    const announcement = result.rows[0];

    // 3) Get tokens for users who enabled push
    const tokensResult = await pool.query(
      `SELECT expo_push_token
       FROM user_notification_settings
       WHERE push_enabled = true
         AND expo_push_token IS NOT NULL`
    );

    const tokens = tokensResult.rows.map((r) => r.expo_push_token);

    // 4) Send push without blocking announcement creation
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
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, body, created_at, category, created_by
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
router.delete("/cleanup-auto", async (req, res) => {
  const cronSecret = req.headers["x-cron-secret"];

  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const result = await pool.query(
    `DELETE FROM announcements WHERE created_at < NOW() - INTERVAL '21 days'`
  );

  res.json({ success: true, deleted: result.rowCount });
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
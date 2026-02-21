// backend/notifications.js
const express = require("express");
const router = express.Router();
const pool = require("./db");
const authMiddleware = require("./middleware/auth");

// POST /api/notifications/register
router.post("/register", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.dbUserId; // IMPORTANT
    const { expoPushToken } = req.body;

    if (!expoPushToken || typeof expoPushToken !== "string") {
      return res.status(400).json({ success: false, message: "Missing expoPushToken" });
    }

    await pool.query(
      `
      INSERT INTO user_notification_settings (user_id, expo_push_token, push_enabled, safety_enabled, updated_at)
      VALUES ($1, $2, true, false, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET expo_push_token = EXCLUDED.expo_push_token, updated_at = NOW()
      `,
      [userId, expoPushToken]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/notifications/preferences
router.post("/preferences", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.dbUserId; // IMPORTANT
    const { pushEnabled, safetyEnabled } = req.body;

    await pool.query(
      `
      INSERT INTO user_notification_settings (user_id, push_enabled, safety_enabled, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET push_enabled = $2, safety_enabled = $3, updated_at = NOW()
      `,
      [userId, !!pushEnabled, !!safetyEnabled]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("preferences error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
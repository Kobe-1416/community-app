// announcements.js
const express = require("express");
const router = express.Router();
const pool = require("./db");

// Create a new announcement
router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content required" });
    }

    const result = await pool.query(
      `INSERT INTO announcements (title, body, created_at)
       VALUES ($1, $2, NOW())
       RETURNING id, title, content, created_at`,
      [title, content]
    );

    res.status(201).json({ success: true, announcement: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all announcements
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, body, created_at 
       FROM announcements
       ORDER BY created_at DESC`
    );

    res.json({ success: true, announcements: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Optional: delete announcements older than 2 weeks (can also be a cron job)
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

module.exports = router;

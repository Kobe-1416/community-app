const express = require('express');
const dotenv = require("dotenv");
const router = express.Router();
const pool = require("./db");
const authenticateToken = require("./middleware/auth");

/*
TABLES ASSUMED:
- visitors(id, name, surname, phone, plate)
- visitor_entries(id, visitor_id, plate, host_resident, entry_time, exit_time)
*/


/**
 * Register or reuse visitor + log entry
 * POST /visitors/entry
 * Do not forget to use the authenticateToken function when in production
 */
router.post("/entry", authenticateToken, async (req, res) => {
  const { name, surname, phone, plate, host_resident } = req.body;

  if (!plate || !host_resident) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // 1. Check if visitor already exists
    let visitorResult = await pool.query(
      "SELECT id FROM visitors WHERE plate = $1",
      [plate]
    );

    let visitorId;

    if (visitorResult.rows.length === 0) {
      // 2. Create visitor if new
      const insertVisitor = await pool.query(
        `INSERT INTO visitors (name, surname, phone, plate)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [name, surname, phone, plate]
      );
      visitorId = insertVisitor.rows[0].id;
      // remove this log in production
      console.log(`New visitor created with ID: ${visitorId}`);
    } else {
      visitorId = visitorResult.rows[0].id;
    }

    // 3. Log entry
    await pool.query(
      `INSERT INTO visitor_entries (visitor_id, plate, host_resident)
       VALUES ($1, $2, $3)`,
      [visitorId, plate, host_resident]
    );

    res.json({ success: true, message: "Visitor entry logged" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Log visitor exit
 * PATCH /visitors/exit
 * Do not forget to use the authenticateToken function when in production
 */
router.patch("/exit", authenticateToken, async (req, res) => {
  const { plate } = req.body;

  if (!plate) {
    return res.status(400).json({ message: "Plate required" });
  }

  try {
    const result = await pool.query(
      `UPDATE visitor_entries
       SET exit_time = now()
       WHERE plate = $1 AND exit_time IS NULL
       RETURNING id`,
      [plate]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Active visit not found" });
    }

    res.json({ success: true, message: "Visitor exit logged" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Get today's visitors
 * GET /visitors/today
 * Do not forget to use the authenticateToken function when in production
 */
router.get("/today", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ve.id, v.name, ve.plate, ve.entry_time, ve.exit_time
       FROM visitor_entries ve
       JOIN visitors v ON v.id = ve.visitor_id
       WHERE ve.entry_time::date = CURRENT_DATE
       ORDER BY ve.entry_time DESC`
    );

    res.json({ success: true, visitors: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;





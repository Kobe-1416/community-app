const express = require("express");
const router = express.Router();
const pool = require("./db");
const authenticateToken = require("./middleware/auth");

router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.dbUserId; // from JWT payload
    console.log("dashboard auth payload:", req.user);


    /* 1️⃣ Gate code (current week) */
    const gateCodeResult = await pool.query(
      `
      SELECT g.code, g.week_end
   FROM com_users cu
   JOIN gate_codes g ON cu.current_code_id = g.id
   WHERE cu.id = $1
   LIMIT 1
      `,
      [userId]
    );

    const gateCode = gateCodeResult.rows[0]?.code || null;
    const weekEnd = gateCodeResult.rows[0]?.week_end || null;
    console.log("Gate code fetched:", gateCode, "Week end:", weekEnd);

    /* 2️⃣ Contributions */
    const contributionsResult = await pool.query(
      `
      SELECT
        COALESCE(SUM(amount), 0) AS total,
        COALESCE(
          SUM(amount) FILTER (
            WHERE date_trunc('month', created_at) = date_trunc('month', now())
          ),
          0
        ) AS current
      FROM contributions
      `
    );

    /* 3️⃣ Visitors summary (today) */
    const visitorsSummaryResult = await pool.query(
      `
      SELECT
        COUNT(*) AS today_total,
        COUNT(*) FILTER (WHERE exit_time IS NULL) AS still_inside
      FROM visitor_entries
      WHERE entry_time::date = CURRENT_DATE
      `
    );

    /* 4️⃣ Visitors list (today) */
    const visitorsListResult = await pool.query(
      `
      SELECT
        ve.id,
        v.name,
        v.phone,
        ve.plate,
        ve.exit_time
      FROM visitor_entries ve
      JOIN visitors v ON v.id = ve.visitor_id
      WHERE ve.entry_time::date = CURRENT_DATE
      ORDER BY ve.entry_time DESC
      `
    );

    /* 5️⃣ Marketplace updates since last check */
    const marketplaceCountResult = await pool.query(
      `
      SELECT COUNT(*) 
      FROM listings
      WHERE created_at > (
        SELECT last_checked_marketplace
        FROM com_users
        WHERE id = $1
      )
      `,
      [userId]
    );

    /* 6️⃣ Announcements updates since last check */
    const announcementsCountResult = await pool.query(
      `
      SELECT COUNT(*)
      FROM announcements
      WHERE created_at > (
        SELECT last_checked_announcements
        FROM com_users
        WHERE id = $1
      )
      `,
      [userId]
    );

    res.json({
      gateCode,
      weekEnd,
      contributions: {
        current: Number(contributionsResult.rows[0].current),
        total: Number(contributionsResult.rows[0].total),
      },
      visitorsSummary: {
        todayTotal: Number(visitorsSummaryResult.rows[0].today_total),
        stillInside: Number(visitorsSummaryResult.rows[0].still_inside),
      },
      visitorsList: visitorsListResult.rows,
      counts: {
        marketplace: Number(marketplaceCountResult.rows[0].count),
        announcements: Number(announcementsCountResult.rows[0].count),
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});

module.exports = router;

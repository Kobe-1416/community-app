const express = require("express");
const router = express.Router();
const pool = require("./db");
const authenticateToken = require("./middleware/auth");
const {
  generateAndAssignGateCodes,
} = require("./services/gateCodeService");


router.post("/generate", authenticateToken, async (req, res) => {
  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  const result = await generateAndAssignGateCodes();

  if (!result.success) {
    return res.status(500).json(result);
  }

  res.json(result);
});

router.post("/generate-auto", async (req, res) => {
  const cronSecret = req.headers["x-cron-secret"];

  if (!process.env.CRON_SECRET) {
    return res.status(500).json({
      success: false,
      message: "CRON_SECRET is not configured on the server",
    });
  }

  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized cron request",
    });
  }

  try {
    const result = await generateAndAssignGateCodes();

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("Auto gate code generation error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to auto-generate gate codes",
    });
  }
});


router.delete("/del", authenticateToken, async (req, res) => {
  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Unassign codes from users first
    await client.query(`
      UPDATE com_users
      SET current_code_id = NULL
    `);

    // 2. Now delete the gate codes
    await client.query(`
      DELETE FROM gate_codes
    `);

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "All codes deleted and unassigned",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Delete gate codes error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to delete codes",
    });
  } finally {
    client.release();
  }
});

// Debug
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM gate_codes ORDER BY id");
  res.json({ success: true, codes: result.rows });
});

module.exports = router;
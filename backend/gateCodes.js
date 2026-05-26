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
  const cronId = `cron-${Date.now()}`;
  const startedAt = Date.now();

  console.log(`[${cronId}] Cron request received`);

  const cronSecret = req.headers["x-cron-secret"];

  if (!process.env.CRON_SECRET) {
    console.error(`[${cronId}] CRON_SECRET missing`);

    return res.status(500).json({
      success: false,
      message: "CRON_SECRET is not configured on the server",
    });
  }

  if (cronSecret !== process.env.CRON_SECRET) {
    console.warn(`[${cronId}] Unauthorized cron request`);

    return res.status(401).json({
      success: false,
      message: "Unauthorized cron request",
    });
  }

  try {
    console.log(`[${cronId}] Starting gate code generation`);

    const result = await generateAndAssignGateCodes();

    const durationMs = Date.now() - startedAt;

    console.log(`[${cronId}] Raw result summary:`, {
      success: result.success,
      message: result.message,
      deletedCount: result.deletedCount,
      insertedCount: result.insertedCount,
      assignedCount: result.assignedCount,
      durationMs,
    });

    if (!result.success) {
      console.error(`[${cronId}] Gate code generation failed`, {
        message: result.message,
        durationMs,
      });

      return res.status(500).json({
        success: false,
        message: result.message || "Gate code generation failed",
      });
    }

    console.log(`[${cronId}] Gate code generation completed`);

    return res.json({
      success: true,
      message: "Gate codes generated successfully",
      deletedCount: result.deletedCount ?? null,
      insertedCount: result.insertedCount ?? null,
      assignedCount: result.assignedCount ?? null,
      durationMs,
    });
  } catch (err) {
    const durationMs = Date.now() - startedAt;

    console.error(`[${cronId}] Auto gate code generation error:`, {
      message: err.message,
      stack: err.stack,
      durationMs,
    });

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
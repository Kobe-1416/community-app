const express = require("express");
const router = express.Router();
const pool = require("./db");
const authenticateToken = require("./middleware/auth");

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

router.post("/generate", authenticateToken, async (req, res) => {
  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Clear old codes
    await client.query("DELETE FROM gate_codes");

    // 2️⃣ Calculate week
    const today = new Date();
    const day = today.getDay();

    const monday = new Date(today);
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(today.getDate() + diff);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekStart = monday.toISOString().split("T")[0];
    const weekEnd = sunday.toISOString().split("T")[0];

    // 3️⃣ Generate codes
    const codes = [];
    const used = new Set();

    while (codes.length < 90) {
      const code = generateCode();
      if (!used.has(code)) {
        used.add(code);
        codes.push(code);
      }
    }

    // 4️⃣ Insert codes FIRST
    const values = codes
      .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
      .join(", ");

    const params = codes.flatMap((c) => [c, weekStart, weekEnd]);

    await client.query(
      `
      INSERT INTO gate_codes (code, week_start, week_end)
      VALUES ${values}
      `,
      params
    );

    // 5️⃣ Get inserted code IDs
    const codeIdsResult = await client.query(`
      SELECT id FROM gate_codes ORDER BY id
    `);

    const codeIds = codeIdsResult.rows;

    // 6️⃣ Get users
    const usersResult = await client.query(`
      SELECT id FROM com_users ORDER BY id
    `);

    const users = usersResult.rows;

    // 7️⃣ Assign codes (round-robin)
    for (let i = 0; i < users.length; i++) {
      const userId = users[i].id;
      const codeId = codeIds[i % codeIds.length].id;

      await client.query(
        `UPDATE com_users SET current_code_id = $1 WHERE id = $2`,
        [codeId, userId]
      );
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      count: codes.length,
      week_start: weekStart,
      week_end: weekEnd,
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to generate and assign codes",
    });

  } finally {
    client.release();
  }
});

router.delete("/del", authenticateToken, async (req, res) => {
  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try{
    await pool.query("DELETE FROM gate_codes");
    await pool.query("UPDATE com_users SET current_code_id = NULL");
    res.json({ success: true, message: "All codes deleted and unassigned" });
  }
  catch(err){
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete codes" });
  }
});

// Debug
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM gate_codes ORDER BY id");
  res.json({ success: true, codes: result.rows });
});

module.exports = router;
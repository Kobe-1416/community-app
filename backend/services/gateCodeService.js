// services/gateCodeService.js
const pool = require("../db");

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

async function generateAndAssignGateCodes() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Prevent multiple servers from generating at the same time
    const lockResult = await client.query(
      "SELECT pg_try_advisory_xact_lock(123456789) AS locked"
    );

    if (!lockResult.rows[0].locked) {
      await client.query("ROLLBACK");
      return {
        success: false,
        message: "Gate code generation already running",
      };
    }

    // Unassign old codes first
    await client.query(`
      UPDATE com_users
      SET current_code_id = NULL
    `);

    // Delete old codes
    await client.query(`
      DELETE FROM gate_codes
    `);

    // Calculate current week
    const today = new Date();
    const day = today.getDay();

    const monday = new Date(today);
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(today.getDate() + diff);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekStart = monday.toISOString().split("T")[0];
    const weekEnd = sunday.toISOString().split("T")[0];

    // Generate 90 unique codes
    const codes = [];
    const used = new Set();

    while (codes.length < 90) {
      const code = generateCode();

      if (!used.has(code)) {
        used.add(code);
        codes.push(code);
      }
    }

    const values = codes
      .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
      .join(", ");

    const params = codes.flatMap((code) => [code, weekStart, weekEnd]);

    const insertedCodes = await client.query(
      `
      INSERT INTO gate_codes (code, week_start, week_end)
      VALUES ${values}
      RETURNING id
      `,
      params
    );

    const codeIds = insertedCodes.rows;

    const usersResult = await client.query(`
      SELECT id FROM com_users ORDER BY id
    `);

    const users = usersResult.rows;

    for (let i = 0; i < users.length; i++) {
      const userId = users[i].id;
      const codeId = codeIds[i % codeIds.length].id;

      await client.query(
        `
        UPDATE com_users
        SET current_code_id = $1
        WHERE id = $2
        `,
        [codeId, userId]
      );
    }

    await client.query("COMMIT");

    return {
      success: true,
      count: codes.length,
      assigned_users: users.length,
      week_start: weekStart,
      week_end: weekEnd,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Gate code generation error:", err);

    return {
      success: false,
      message: "Failed to generate and assign codes",
    };
  } finally {
    client.release();
  }
}

module.exports = {
  generateAndAssignGateCodes,
};
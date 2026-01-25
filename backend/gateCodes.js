// gateCodes.js
const express = require("express");
const router = express.Router();
const pool = require("./db");

// Helper to generate a 5-character code (letters + digits)
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Endpoint to refresh weekly codes
router.post("/generate", async (req, res) => {
  try {
    // Delete old codes (or you might want to keep previous weeks)
    await pool.query("DELETE FROM gate_codes");

    // Calculate current week's start (Monday) and end (Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate Monday of this week
    const monday = new Date(today);
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days
    monday.setDate(today.getDate() + diffToMonday);
    
    // Calculate Sunday of this week (6 days after Monday)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Format dates as YYYY-MM-DD
    const weekStart = monday.toISOString().split('T')[0];
    const weekEnd = sunday.toISOString().split('T')[0];

    // Generate 35 unique codes for the current week
    const codes = [];
    const usedCodes = new Set();
    
    for (let i = 0; i < 35; i++) {
      let code;
      let attempts = 0;
      
      // Ensure unique code (retry if duplicate)
      do {
        code = generateCode();
        attempts++;
        if (attempts > 100) {
          throw new Error("Failed to generate unique code after 100 attempts");
        }
      } while (usedCodes.has(code));
      
      usedCodes.add(code);
      codes.push(code);
    }

    // Insert all codes for the current week (single efficient query)
    const values = codes.map((code, index) => 
      `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
    ).join(', ');
    
    const params = codes.flatMap(code => [code, weekStart, weekEnd]);
    
    const query = `
      INSERT INTO gate_codes (code, week_start, week_end) 
      VALUES ${values}
    `;
    
    await pool.query(query, params);

    res.json({ 
      success: true, 
      count: codes.length,
      week_start: weekStart,
      week_end: weekEnd,
      codes 
    });
    
  } catch (err) {
    console.error("Error generating gate codes:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: err.message 
    });
  }
});

// Optional: get all codes (for debugging / admin)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM gate_codes ORDER BY id");
    res.json({ success: true, codes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;

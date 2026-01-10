// auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("./db"); // assumes you have a pool from pg in a separate db.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const JWT_SECRET = process.env.JSON_WEB_TOKEN_SECRET;
const JWT_EXPIRATION = process.env.JSON_EXPIRATION;

// POST /register
router.post("/register", async (req, res) => {
  try {
    const { surname, house_number, street_name, phone, password } = req.body;

    // 1️⃣ Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2️⃣ Insert into DB
    const result = await pool.query(
      `INSERT INTO com_users (surname, house_number, street_name, phone, password_hash)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, surname, phone`,
      [surname, house_number, street_name, phone, hashedPassword]
    );

    // 3️⃣ Respond with success
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    // 4️⃣ Handle duplicate phone
    if (err.code === "23505") {
      return res.status(400).json({ success: false, message: "Phone already registered" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try{
    const {phone, password} = req.body;
    const result = await pool.query(
      `SELECT id, surname, password_hash, phone from com_users where phone = $1`,
      [phone]
    );
    if(result.rows.length === 0){
      return res.status(400).json({success: false, message: "Invalid credentials"});
    }
    if(await bcrypt.compare(password, result.rows[0].password_hash)){
      console.log("Login successful");
      console.log(result);
    }
    else{
      return res.status(400).json({success: false, message: "Invalid credentials"});
    }

    const token = jwt.sign({userId: result.rows[0].phone},JWT_SECRET, {expiresIn: JWT_EXPIRATION} );

    res.json({success: true, message: "Login successful", token});

  }
  catch(err){
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;

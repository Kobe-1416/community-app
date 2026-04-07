const express = require("express");
const router = express.Router();
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// --- CONFIG ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- STORAGE (no local files) ---
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "marketplace", // folder in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

// --- ROUTE ---
router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("UPLOAD ENDPOINT HIT");
    console.log("FILE:", req.file);

    return res.json({
      success: true,
      url: req.file.path, // <-- Cloudinary URL
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;
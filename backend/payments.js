// payments.js
const express = require("express");
const router = express.Router();

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const ExcelJS = require("exceljs");

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const pool = require("./db");
const authenticateToken = require("./middleware/auth");

// -------------------------
// Cloudinary config
// -------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// -------------------------
// Local temp upload storage
// -------------------------
const uploadDir = path.join(__dirname, "tmp", "payment_uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP, and PDF files are allowed"));
    }

    cb(null, true);
  },
});

// -------------------------
// Helpers
// -------------------------
function isAdmin(req) {
  return req.user?.role?.toLowerCase() === "admin";
}

function getPythonCommand() {
  return process.env.PYTHON_BIN || (process.platform === "win32" ? "python" : "python3");
}

function safeDelete(filePath) {
  if (!filePath) return;

  fs.unlink(filePath, (err) => {
    if (err) {
      console.warn("Failed to delete temp file:", filePath, err.message);
    }
  });
}

function resolvePreviewPath(previewPath) {
  if (!previewPath) return null;

  if (path.isAbsolute(previewPath)) {
    return previewPath;
  }

  return path.join(__dirname, previewPath);
}

function processPaymentProof(localFilePath) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      __dirname,
      "scripts",
      "process_payment_proof.py"
    );

    if (!fs.existsSync(scriptPath)) {
      console.warn("Python script not found:", scriptPath);
      return resolve({});
    }

    const python = spawn(getPythonCommand(), [scriptPath, localFilePath], {
      cwd: __dirname,
    });

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`Python script failed with code ${code}: ${stderr}`)
        );
      }

      try {
        const parsed = stdout.trim() ? JSON.parse(stdout) : {};
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Invalid Python JSON output: ${stdout}`));
      }
    });
  });
}

/* =========================
   1. Upload proof endpoint
   POST /api/payments/upload-proof
========================= */
router.post(
  "/upload-proof",
  authenticateToken,
  upload.single("proof"),
  async (req, res) => {
    let localFilePath = null;
    let previewPath = null;

    try {
      const userId = req.user.dbUserId;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No proof of payment uploaded",
        });
      }

      localFilePath = req.file.path;

      // 1. Process local file with Python
      let extraction = {};

      try {
        extraction = await processPaymentProof(localFilePath);
      } catch (err) {
        console.error("Python extraction failed:", err.message);
        extraction = {};
      }

      // 2. Upload original file to Cloudinary
      const originalUpload = await cloudinary.uploader.upload(localFilePath, {
        folder: "payment_proofs",
        resource_type: "auto",
      });

      const originalFileUrl = originalUpload.secure_url;

      // 3. Upload preview image if Python created one
      const rawPreviewPath =
        extraction.preview_image_path ||
        extraction.previewImagePath ||
        extraction.preview_page_path ||
        extraction.previewPagePath ||
        null;

      previewPath = resolvePreviewPath(rawPreviewPath);

      let previewImageUrl = null;

      if (previewPath && fs.existsSync(previewPath)) {
        const previewUpload = await cloudinary.uploader.upload(previewPath, {
          folder: "payment_proofs/previews",
          resource_type: "image",
        });

        previewImageUrl = previewUpload.secure_url;
      } else if (req.file.mimetype.startsWith("image/")) {
        // For image uploads, use the original image as preview.
        previewImageUrl = originalFileUrl;
      }

      // 4. Save payment proof row
      const result = await pool.query(
        `
        INSERT INTO payment_proofs (
          user_id,
          original_file_url,
          preview_image_url,
          raw_extracted_text,
          possible_amount_text,
          possible_reference_text,
          possible_date_text,
          status,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
        RETURNING *
        `,
        [
          userId,
          originalFileUrl,
          previewImageUrl,
          extraction.raw_extracted_text || extraction.rawText || "",
          extraction.possible_amount_text || extraction.possibleAmountText || "",
          extraction.possible_reference_text || extraction.possibleReferenceText || "",
          extraction.possible_date_text || extraction.possibleDateText || "",
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Proof of payment uploaded",
        payment: result.rows[0],
      });
    } catch (err) {
      console.error("Upload proof error:", {
        message: err.message,
        code: err.code,
        detail: err.detail,
      });

      return res.status(500).json({
        success: false,
        message: err.message || "Failed to upload proof of payment",
      });
    } finally {
      safeDelete(localFilePath);
      safeDelete(previewPath);
    }
  }
);

/* =========================
   2. Get payments endpoint
   GET /api/payments
========================= */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.dbUserId;

    let result;

    if (isAdmin(req)) {
      result = await pool.query(
        `
        SELECT
          pp.*,
          cu.surname,
          cu.phone,
          cu.house_number,
          cu.street_name,
          verifier.surname AS verified_by_name
        FROM payment_proofs pp
        JOIN com_users cu ON cu.id = pp.user_id
        LEFT JOIN com_users verifier ON verifier.id = pp.verified_by
        ORDER BY pp.created_at DESC
        `
      );
    } else {
      result = await pool.query(
        `
        SELECT *
        FROM payment_proofs
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
      );
    }

    return res.json({
      success: true,
      payments: result.rows,
    });
  } catch (err) {
    console.error("Get payments error:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
});

/* =========================
   3. Get payment totals endpoint
   GET /api/payments/totals
========================= */
router.get("/totals", authenticateToken, async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        COUNT(*) AS total_count,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'verified') AS verified_count,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count,
        COALESCE(SUM(confirmed_amount) FILTER (WHERE status = 'verified'), 0) AS verified_total
      FROM payment_proofs
      `
    );

    return res.json({
      success: true,
      totals: {
        totalCount: Number(result.rows[0].total_count),
        pendingCount: Number(result.rows[0].pending_count),
        verifiedCount: Number(result.rows[0].verified_count),
        rejectedCount: Number(result.rows[0].rejected_count),
        verifiedTotal: Number(result.rows[0].verified_total),
      },
    });
  } catch (err) {
    console.error("Get payment totals error:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment totals",
    });
  }
});

/* =========================
   4. Verify endpoint
   PATCH /api/payments/:id/verify
========================= */
router.patch("/:id/verify", authenticateToken, async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  try {
    const { id } = req.params;
    const adminId = req.user.dbUserId;

    const { amount, reference, paymentDate } = req.body;

    if (!amount || !reference || !paymentDate) {
      return res.status(400).json({
        success: false,
        message: "Amount, reference, and payment date are required",
      });
    }

    const result = await pool.query(
      `
      UPDATE payment_proofs
      SET
        confirmed_amount = $1,
        confirmed_reference = $2,
        confirmed_payment_date = $3,
        status = 'verified',
        verified_by = $4,
        verified_at = NOW()
      WHERE id = $5
      RETURNING *
      `,
      [amount, reference, paymentDate, adminId, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment proof not found",
      });
    }

    return res.json({
      success: true,
      message: "Payment verified",
      payment: result.rows[0],
    });
  } catch (err) {
    console.error("Verify payment error:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
});

/* =========================
   5. Reject endpoint
   PATCH /api/payments/:id/reject
========================= */
router.patch("/:id/reject", authenticateToken, async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  try {
    const { id } = req.params;
    const adminId = req.user.dbUserId;
    const { reason } = req.body;

    const result = await pool.query(
      `
      UPDATE payment_proofs
      SET
        status = 'rejected',
        verified_by = $1,
        verified_at = NOW(),
        confirmed_reference = COALESCE($2, confirmed_reference)
      WHERE id = $3
      RETURNING *
      `,
      [adminId, reason || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment proof not found",
      });
    }

    return res.json({
      success: true,
      message: "Payment rejected",
      payment: result.rows[0],
    });
  } catch (err) {
    console.error("Reject payment error:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to reject payment",
    });
  }
});

/* =========================
   6. Export endpoint
   GET /api/payments/export
========================= */
router.get("/export", authenticateToken, async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        pp.id,
        cu.surname,
        cu.phone,
        cu.house_number,
        cu.street_name,
        pp.confirmed_amount,
        pp.confirmed_reference,
        pp.confirmed_payment_date,
        pp.status,
        verifier.surname AS verified_by_name,
        pp.verified_at,
        pp.created_at,
        pp.original_file_url
      FROM payment_proofs pp
      JOIN com_users cu ON cu.id = pp.user_id
      LEFT JOIN com_users verifier ON verifier.id = pp.verified_by
      ORDER BY pp.created_at DESC
      `
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Payments");

    worksheet.columns = [
      { header: "Payment ID", key: "id", width: 12 },
      { header: "Resident Surname", key: "surname", width: 20 },
      { header: "Phone", key: "phone", width: 18 },
      { header: "House Number", key: "house_number", width: 15 },
      { header: "Street Name", key: "street_name", width: 25 },
      { header: "Amount", key: "confirmed_amount", width: 15 },
      { header: "Reference", key: "confirmed_reference", width: 30 },
      { header: "Payment Date", key: "confirmed_payment_date", width: 18 },
      { header: "Status", key: "status", width: 15 },
      { header: "Verified By", key: "verified_by_name", width: 20 },
      { header: "Verified At", key: "verified_at", width: 22 },
      { header: "Uploaded At", key: "created_at", width: 22 },
      { header: "Proof URL", key: "original_file_url", width: 60 },
    ];

    result.rows.forEach((row) => {
      worksheet.addRow(row);
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=payment_proofs.xlsx"
    );

    await workbook.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error("Export payments error:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to export payments",
    });
  }
});

module.exports = router;
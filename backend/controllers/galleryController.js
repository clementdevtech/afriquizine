const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { pool } = require("../db");

// --- Config ---
const uploadDir = path.resolve(__dirname, "uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Created uploads directory:", uploadDir);
}

// --- Multer Storage Config ---
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const filename = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// --- Helpers ---
const deleteFileIfExists = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log("🗑️ File deleted:", filePath);
  } else {
    console.warn("⚠️ File not found on disk:", filePath);
  }
};

// --- Controllers ---

// Add Image
const addImage = async (req, res) => {
  try {
    const { category } = req.body;
    const file = req.file;

    if (!file || !category) {
      return res.status(400).json({ message: "Image and category are required" });
    }

    const filename = file.filename;
    await pool.query(
      "INSERT INTO gallery (image_url, category) VALUES ($1, $2)",
      [filename, category]
    );

    res.json({ message: "✅ Image uploaded successfully!", filename });
  } catch (err) {
    console.error("❌ Error adding image:", err);
    res.status(500).json({ message: "Error adding image" });
  }
};

// Get Images
const getImages = async (_, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM gallery ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching gallery:", err);
    res.status(500).json({ message: "Error fetching gallery" });
  }
};

// Delete Image
const deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      "SELECT image_url FROM gallery WHERE id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    const filename = rows[0].image_url;
    const filePath = path.join(uploadDir, filename);

    deleteFileIfExists(filePath);

    await pool.query("DELETE FROM gallery WHERE id = $1", [id]);
    res.json({ message: "✅ Image deleted successfully!" });
  } catch (err) {
    console.error("❌ Error deleting image:", err);
    res.status(500).json({ message: "Error deleting image" });
  }
};

// --- Exports ---
module.exports = { upload, addImage, getImages, deleteImage };
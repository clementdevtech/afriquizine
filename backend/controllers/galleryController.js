const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { pool } = require("../db");

// Configure storage for uploaded images
const uploadDir = path.join(__dirname, "../../frontend/public/uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  console.warn("⚠️ Upload directory does not exist, creating:", uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📂 Saving file to:", uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const newName = Date.now() + path.extname(file.originalname);
    console.log("📝 Generated filename:", newName);
    cb(null, newName);
  },
});

const upload = multer({ storage });

// --- Add Image ---
const addImage = async (req, res) => {
  console.log("📩 Incoming request to /api/gallery/add");
  console.log("➡️ Body:", req.body);
  console.log("➡️ File:", req.file);

  try {
    if (!req.file || !req.body.category) {
      console.warn("⚠️ Missing file or category");
      return res.status(400).json({ message: "Image and category are required" });
    }

    const { category } = req.body;
    const filename = req.file.filename;

    console.log("✅ Inserting into DB:", { filename, category });

    await pool.query(
      "INSERT INTO gallery (image_url, category) VALUES ($1, $2)",
      [filename, category]
    );

    res.json({ message: "Image uploaded successfully!", filename });
  } catch (err) {
    console.error("❌ Error adding image:", err);
    res.status(500).json({ message: "Error adding image", error: err.message });
  }
};

// --- Get Images ---
const getImages = async (req, res) => {
  console.log("📩 Fetching gallery images");
  try {
    const images = await pool.query("SELECT * FROM gallery");
    console.log("✅ Found images:", images.rows.length);
    res.json(images.rows);
  } catch (err) {
    console.error("❌ Error fetching gallery:", err);
    res.status(500).json({ message: "Error fetching gallery", error: err.message });
  }
};

// --- Delete Image ---
const deleteImage = async (req, res) => {
  const { id } = req.params;
  console.log("📩 Delete request for ID:", id);

  try {
    const result = await pool.query("SELECT image_url FROM gallery WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      console.warn("⚠️ No image found with ID:", id);
      return res.status(404).json({ message: "Image not found" });
    }

    const filename = result.rows[0].image_url;
    const filePath = path.join(uploadDir, filename);
    console.log("🗑️ Deleting file:", filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("✅ File deleted");
    } else {
      console.warn("⚠️ File not found on disk:", filePath);
    }

    await pool.query("DELETE FROM gallery WHERE id = $1", [id]);
    console.log("✅ DB record deleted for ID:", id);

    res.json({ message: "Image deleted successfully!" });
  } catch (err) {
    console.error("❌ Error deleting image:", err);
    res.status(500).json({ message: "Error deleting image", error: err.message });
  }
};

// Export functions
module.exports = { addImage, getImages, deleteImage, upload };

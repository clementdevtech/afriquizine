const multer = require("multer");
const path = require("path");
const {pool, db} = require("../db");

// Configure storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../frontend/src/assets/images")); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage });

const addImage = async (req, res) => {
  const { category } = req.body;
  const filename = req.file.filename;

  if (!filename || !category) {
    return res.status(400).json({ message: "Image and category are required" });
  }

  try {
    await pool.query("INSERT INTO gallery (image_url, category) VALUES ($1, $2)", [
      filename,
      category,
    ]);
    res.json({ message: "Image uploaded successfully!", filename });
  } catch (err) {
    console.error("Error adding image:", err.message);
    res.status(500).json({ message: "Error adding image" });
  }
};

// Get all images
const getImages = async (req, res) => {
  try {
    const images = await pool.query("SELECT * FROM gallery");
    res.json(images.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching gallery" });
  }
};

// Delete image
const deleteImage = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT image_url FROM gallery WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    const filename = result.rows[0].filename;
    const filePath = path.join(__dirname, "../public/images", filename);

   
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query("DELETE FROM gallery WHERE id = $1", [id]);
    res.json({ message: "Image deleted successfully!" });
  } catch (err) {
    console.error("Error deleting image:", err.message);
    res.status(500).json({ message: "Error deleting image" });
  }
};

// Export functions
module.exports = { addImage, getImages, deleteImage, upload };

const multer = require("multer");
const path = require("path");
const fs = require("fs");

function createUploader(folderName = "uploads") {
  // Upload path inside backend folder
  const uploadPath = path.resolve(__dirname, "../uploads", folderName);

  // Ensure directory exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  return multer({ storage });
}

module.exports = { createUploader };
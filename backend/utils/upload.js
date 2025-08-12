const multer = require("multer");
const path = require("path");

function createUploader(folderName) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, `../../frontend/src/assets/${folderName}`));
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

  return multer({ storage });
}

module.exports = { createUploader };

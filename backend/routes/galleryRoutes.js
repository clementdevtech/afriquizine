const express = require("express");
const { addImage, getImages, deleteImage, upload } = require("../controllers/galleryController");

const router = express.Router();

// Route to Upload an Image
router.post("/", upload.single("image"), addImage);

// Route to Get All Images
router.get("/getimages", getImages);

// Route to Delete an Image
router.delete("/:id", deleteImage);

module.exports = router;

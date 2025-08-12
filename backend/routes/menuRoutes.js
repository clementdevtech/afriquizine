const express = require("express");
const { createUploader } = require("../utils/upload");
const { addMenuItem, getMenuItems, deleteMenuItem } = require("../controllers/menuController");

const router = express.Router();
const upload = createUploader("menu");

router.post("/", upload.single("image"), addMenuItem);
router.get("/", getMenuItems);
router.delete("/:id", deleteMenuItem);

module.exports = router;
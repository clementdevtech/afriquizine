const express = require("express");
const { addCategory, getCategories, deleteCategory } = require("../controllers/menuCategoryController");

const router = express.Router();

router.post("/", addCategory);
router.get("/", getCategories);
router.delete("/:id", deleteCategory);

module.exports = router;
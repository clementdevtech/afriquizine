const { pool } = require("../db");

// Add Category
const addCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO menu_categories (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.json({ message: "Category added successfully!", category: result.rows[0] });
  } catch (err) {
    console.error("Error adding category:", err.message);
    res.status(500).json({ message: "Error adding category" });
  }
};

// Get Categories
const getCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM menu_categories ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

// Delete Category
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM menu_categories WHERE id = $1", [id]);
    res.json({ message: "Category deleted successfully!" });
  } catch (err) {
    console.error("Error deleting category:", err.message);
    res.status(500).json({ message: "Error deleting category" });
  }
};

module.exports = { addCategory, getCategories, deleteCategory };
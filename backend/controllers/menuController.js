const path = require("path");
const fs = require("fs");
const { pool } = require("../db");
const { sendEmail } = require("./emailController"); // ✅ reuse your sendEmail

// Generate WhatsApp Link
function generateWhatsAppLink(itemName, price, option = "pickup") {
  const phone = process.env.WHATSAPP_NUMBER || "+254704064441";
  const message = `Hello! I would like to order:\n*${itemName}*\nPrice: ${price}\nOption: ${option}\nPlease confirm availability.`;
  return `https://wa.me/${phone.replace(/\+/g, "")}?text=${encodeURIComponent(message)}`;
}

// Add Menu Item
const addMenuItem = async (req, res) => {
  const { name, description, price, category_id } = req.body;
  const filename = req.file?.filename;

  if (!name || !price || !category_id || !filename) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const whatsapp_link = generateWhatsAppLink(name, price);
    const result = await pool.query(
      "INSERT INTO menu_items (name, description, price, category_id, image_url, whatsapp_link) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, description, price, category_id, filename, whatsapp_link]
    );

    // Notify Admin
    await sendEmail(
      process.env.ADMIN_NOTIFY_EMAIL,
      "New Menu Item Added",
      `<p>A new menu item has been added:</p>
       <ul>
         <li><strong>Name:</strong> ${name}</li>
         <li><strong>Price:</strong> ${price}</li>
         <li><strong>Category ID:</strong> ${category_id}</li>
       </ul>`
    );

    res.json({ message: "Menu item added successfully!", item: result.rows[0] });
  } catch (err) {
    console.error("Error adding menu item:", err.message);
    res.status(500).json({ message: "Error adding menu item" });
  }
};

// Get Menu Items
const getMenuItems = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT mi.*, c.name AS category_name
      FROM menu_items mi
      JOIN menu_categories c ON mi.category_id = c.id
      ORDER BY mi.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching menu items:", err.message);
    res.status(500).json({ message: "Error fetching menu items" });
  }
};

// Delete Menu Item
const deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT image_url FROM menu_items WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const filename = result.rows[0].image_url;
    const filePath = path.join(__dirname, "../../frontend/src/assets/menu", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query("DELETE FROM menu_items WHERE id = $1", [id]);
    res.json({ message: "Menu item deleted successfully!" });
  } catch (err) {
    console.error("Error deleting menu item:", err.message);
    res.status(500).json({ message: "Error deleting menu item" });
  }
};

module.exports = { addMenuItem, getMenuItems, deleteMenuItem };
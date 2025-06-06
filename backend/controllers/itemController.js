import Item from "../modals/itemModal.js"; // Use modals, not models
import fs from "fs";

// Add Item
export const addItem = async (req, res) => {
  try {
    let image_filename = req.file?.filename;

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      imageUrl: image_filename,
    });

    await item.save();
    res.json({ success: true, message: "Item Added Successfully" });
  } catch (error) {
    console.error("AddItem Error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding item",
      error: error.message,
    });
  }
};

// List Items
export const listItem = async (req, res) => {
  try {
    const items = await Item.find({});
    res.json({ success: true, data: items });
  } catch (error) {
    console.error("ListItem Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching items",
      error: error.message,
    });
  }
};

// Remove Item
export const removeItem = async (req, res) => {
  try {
    const item = await Item.findById(req.body.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Remove image file if it exists
    if (item.imageUrl) {
      try {
        fs.unlinkSync(`uploads/${item.imageUrl}`);
      } catch (error) {
        console.error("Error removing image file:", error);
      }
    }

    await Item.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Item Removed Successfully" });
  } catch (error) {
    console.error("RemoveItem Error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing item",
      error: error.message,
    });
  }
};

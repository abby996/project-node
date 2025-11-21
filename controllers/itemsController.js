const Item = require('../models/item');

// GET /api/items
const getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// GET /api/items/:id
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid ID format' });
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// POST /api/items
const createItem = async (req, res) => {
  try {
    const item = await Item.create(req.body);
    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// PUT /api/items/:id
const updateItem = async (req, res) => {
  try {
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Item not found' });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
    if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid ID format' });
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// DELETE /api/items/:id
const deleteItem = async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Item not found' });
    // return 200 with message so client sees confirmation
    return res.status(200).json({ success: true, message: 'Item deleted' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid ID format' });
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = { getItems, getItem, createItem, updateItem, deleteItem };
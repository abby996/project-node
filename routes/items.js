const express = require('express');
const router = express.Router();
const {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/itemsController');

/**
 * @route GET /api/items
 * @group Items - Operations about items
 * @returns {Array.<Item>} 200 - An array of items
 * @returns {Error} 500 - Server error
 * @description Get all items
 */
router.route('/')
    .get(getItems);

/**
 * @route POST /api/items
 * @group Items - Operations about items
 * @param {Item.model} item.body.required - The item to create
 * @returns {Item.model} 201 - The created item
 * @returns {Error} 400 - Validation error
 * @returns {Error} 500 - Server error
 * @description Create a new item
 */
router.route('/')
    .post(createItem);

/**
 * @route GET /api/items/{id}
 * @group Items - Operations about items
 * @param {string} id.path.required - Item ID
 * @returns {Item.model} 200 - The requested item
 * @returns {Error} 404 - Item not found
 * @returns {Error} 400 - Invalid ID format
 * @returns {Error} 500 - Server error
 * @description Get a single item by ID
 */
router.route('/:id')
    .get(getItem);

/**
 * @route PUT /api/items/{id}
 * @group Items - Operations about items
 * @param {string} id.path.required - Item ID
 * @param {Item.model} item.body.required - The item data to update
 * @returns {Item.model} 200 - The updated item
 * @returns {Error} 404 - Item not found
 * @returns {Error} 400 - Validation error
 * @returns {Error} 500 - Server error
 * @description Update an existing item
 */
router.route('/:id')
    .put(updateItem);

/**
 * @route DELETE /api/items/{id}
 * @group Items - Operations about items
 * @param {string} id.path.required - Item ID
 * @returns {object} 200 - Success message
 * @returns {Error} 404 - Item not found
 * @returns {Error} 400 - Invalid ID format
 * @returns {Error} 500 - Server error
 * @description Delete an item
 */
router.route('/:id')
    .delete(deleteItem);

module.exports = router;
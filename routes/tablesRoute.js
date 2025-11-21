const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { tableSchemas } = require('../utils/validationSchemas');

// Get all tables (admin only)
router.get('/', protect, isAdmin, tableController.getAllTables);

// Public route to fetch available tables based on reservationDate
router.get('/available', tableController.getAvailableTables);

// Create a new table
router.post('/create', protect, isAdmin, validate(tableSchemas.createTable), tableController.createTable);

// Update table information
router.put('/:id', protect, isAdmin, validate(tableSchemas.updateTable), tableController.updateTable);

// Delete a table
router.delete('/:id', protect, isAdmin, tableController.deleteTable);

module.exports = router;
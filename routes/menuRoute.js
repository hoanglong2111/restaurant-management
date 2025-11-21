const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { menuSchemas } = require('../utils/validationSchemas');

// Tạo món ăn mới
router.post('/create', protect, isAdmin, validate(menuSchemas.createItem), menuController.createMenuItem);

// Lấy danh sách tất cả các món ăn
router.get('/', menuController.getAllMenuItems);

// Cập nhật món ăn
router.put('/:id', protect, isAdmin, validate(menuSchemas.updateItem), menuController.updateMenuItem);

// Xóa món ăn
router.delete('/:id', protect, isAdmin, menuController.deleteMenuItem);

module.exports = router;
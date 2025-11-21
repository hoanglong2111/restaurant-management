const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { userSchemas } = require('../utils/validationSchemas');

// Đăng ký người dùng
router.post('/register', validate(userSchemas.register), userController.registerUser);

// Đăng nhập người dùng
router.post('/login', validate(userSchemas.login), userController.loginUser);

// Lấy danh sách người dùng
router.get('/', protect, isAdmin, userController.getAllUsers);

// Cập nhật quyền admin của người dùng
router.put('/:id', protect, isAdmin, userController.updateUserAdmin);

// Xóa người dùng
router.delete('/:id', protect, isAdmin, userController.deleteUser);

// Cập nhật thông tin cá nhân
router.put('/profile', protect, validate(userSchemas.updateProfile), userController.updateUserProfile);

// Đổi mật khẩu
router.put('/password', protect, userController.changePassword);

module.exports = router;
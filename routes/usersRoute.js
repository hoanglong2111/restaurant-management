const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken'); // Add this import

// Function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Đăng ký người dùng
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// Đăng nhập người dùng
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

// Lấy danh sách người dùng
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cập nhật quyền admin của người dùng
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(user){
      user.isAdmin = req.body.isAdmin;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Xóa người dùng
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(user){
      await User.deleteOne({ _id: req.params.id });
      res.json({ message: 'Người dùng đã bị xóa' });
    } else {
      res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cập nhật thông tin cá nhân
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Đổi mật khẩu
router.put('/password', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(req.body.currentPassword))) {
      user.password = req.body.newPassword;
      await user.save();

      res.json({ message: 'Đổi mật khẩu thành công' });
    } else {
      res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
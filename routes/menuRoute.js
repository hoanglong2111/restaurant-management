const express = require('express');
const router = express.Router();
const MenuItem = require('../models/menuItem');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Tạo món ăn mới
router.post('/create', protect, isAdmin, async (req, res) => {
    const { name, description, price, category, imageUrls, stock, sold } = req.body;

    try {
        const menuItem = new MenuItem({
            name,
            description,
            price,
            category,
            imageUrls,
            stock,
            sold: sold || 0,
        });

        const createdMenuItem = await menuItem.save();
        res.status(201).json(createdMenuItem);
    } catch (error) {
        res.status(400).json({ message: 'Unable to create menu item.' });
    }
});

// Lấy danh sách tất cả các món ăn
router.get('/', async (req, res) => {
    try {
        const menuItems = await MenuItem.find({});
        res.json(menuItems);
    } catch (error) {
        res.status(400).json({ message: 'Unable to retrieve menu items.' });
    }
});

// Cập nhật món ăn
router.put('/:id', protect, isAdmin, async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (menuItem) {
            menuItem.name = req.body.name || menuItem.name;
            menuItem.description = req.body.description || menuItem.description;
            menuItem.price = req.body.price || menuItem.price;
            menuItem.category = req.body.category || menuItem.category;
            menuItem.imageUrls = req.body.imageUrls || menuItem.imageUrls;
            menuItem.availability = req.body.availability !== undefined ? req.body.availability : menuItem.availability;
            menuItem.stock = req.body.stock !== undefined ? req.body.stock : menuItem.stock;
            menuItem.sold = req.body.sold !== undefined ? req.body.sold : menuItem.sold;

            const updatedMenuItem = await menuItem.save();
            res.json(updatedMenuItem);
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Unable to update menu item.' });
    }
});

// Xóa món ăn
router.delete('/:id', protect, isAdmin, async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (menuItem) {
            await menuItem.remove();
            res.json({ message: 'Menu item removed' });
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Unable to delete menu item.' });
    }
});

module.exports = router;
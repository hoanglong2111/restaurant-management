const MenuItem = require('../models/menuItem');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Create new menu item
 * @route   POST /api/menu/create
 * @access  Private/Admin
 */
exports.createMenuItem = async (req, res) => {
    try {
        const { name, description, price, category, imageUrls, stock, sold } = req.body;

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
        ApiResponse.created(res, createdMenuItem, 'Menu item created successfully');
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Get all menu items
 * @route   GET /api/menu
 * @access  Public
 */
exports.getAllMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem.find({});
        ApiResponse.success(res, menuItems);
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Update menu item
 * @route   PUT /api/menu/:id
 * @access  Private/Admin
 */
exports.updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return ApiResponse.notFound(res, 'Menu item not found');
        }

        menuItem.name = req.body.name || menuItem.name;
        menuItem.description = req.body.description || menuItem.description;
        menuItem.price = req.body.price || menuItem.price;
        menuItem.category = req.body.category || menuItem.category;
        menuItem.imageUrls = req.body.imageUrls || menuItem.imageUrls;
        menuItem.availability = req.body.availability !== undefined ? req.body.availability : menuItem.availability;
        menuItem.stock = req.body.stock !== undefined ? req.body.stock : menuItem.stock;
        menuItem.sold = req.body.sold !== undefined ? req.body.sold : menuItem.sold;

        const updatedMenuItem = await menuItem.save();
        ApiResponse.success(res, updatedMenuItem, 'Menu item updated successfully');
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Delete menu item
 * @route   DELETE /api/menu/:id
 * @access  Private/Admin
 */
exports.deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return ApiResponse.notFound(res, 'Menu item not found');
        }

        await MenuItem.deleteOne({ _id: req.params.id });
        ApiResponse.success(res, null, 'Menu item deleted successfully');
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

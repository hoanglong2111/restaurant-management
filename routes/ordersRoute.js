const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Tạo đơn hàng mới
router.post('/create', protect, async (req, res) => {
    const { orderItems, paymentMethod, totalPrice } = req.body;

    try {
        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const order = new Order({
            user: req.user._id,
            orderItems,
            paymentMethod,
            totalPrice,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Lấy danh sách đơn hàng của người dùng
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('orderItems.menuItem');
        res.json(orders);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Lấy tất cả đơn hàng (Admin)
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .populate('orderItems.menuItem');
        res.json(orders);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Cập nhật trạng thái đơn hàng
router.put('/:id', protect, isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = req.body.status || order.status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Xử lý thanh toán bằng Stripe
router.post('/stripe', protect, async (req, res) => {
    const { token, amount, orderItems } = req.body;

    // Validate Required Fields
    if (!token || !amount || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
        return res.status(400).json({ message: 'Please provide token, amount, and order items.' });
    }

    try {
        // Create Stripe Charge
        const charge = await stripe.charges.create({
            amount,
            currency: 'vnd', // Ensure this matches your requirements
            source: token.id,
            description: 'Thanh toán giỏ hàng',
        });

        // Check if Charge was Successful
        if (charge.status === 'succeeded') {
            // Create a New Order
            const order = new Order({
                user: req.user._id,
                orderItems: orderItems.map(item => ({
                    menuItem: item.menuItem, // Ensure this is the MenuItem ID
                    quantity: item.quantity,
                    price: item.price
                })),
                paymentMethod: 'Stripe',
                totalPrice: amount /10 , // Convert cents to main currency unit if needed
                isPaid: true,
                paidAt: Date.now(),
            });

            // Save Order to Database
            const createdOrder = await order.save();

            res.json({ success: true, order: createdOrder });
        } else {
            res.json({ success: false, message: 'Thanh toán không thành công.' });
        }
    } catch (error) {
        console.error('Stripe Charge Error:', error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
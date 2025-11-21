const Order = require('../models/order');
const MenuItem = require('../models/menuItem');
const Payment = require('../models/payment');
const ApiResponse = require('../utils/apiResponse');
const paymentService = require('../services/paymentService');

/**
 * Helper function to update sold quantity for menu items
 */
const updateSoldQuantity = async (orderItems) => {
    for (const item of orderItems) {
        await MenuItem.findByIdAndUpdate(
            item.menuItem,
            { $inc: { sold: item.quantity } }
        );
    }
};

/**
 * @desc    Create new order
 * @route   POST /api/orders/create
 * @access  Private
 */
exports.createOrder = async (req, res) => {
    try {
        const { orderItems, paymentMethod, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return ApiResponse.badRequest(res, 'No order items provided');
        }

        const order = new Order({
            user: req.user._id,
            orderItems,
            paymentMethod,
            totalPrice,
        });

        const createdOrder = await order.save();
        await updateSoldQuantity(orderItems);

        ApiResponse.created(res, createdOrder, 'Order created successfully');
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
exports.getMyOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const count = await Order.countDocuments({ user: req.user._id });
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('orderItems.menuItem');

        ApiResponse.success(res, {
            orders,
            page,
            pages: Math.ceil(count / limit),
            total: count
        });
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private/Admin
 */
exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const count = await Order.countDocuments({});
        const orders = await Order.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'name email')
            .populate('orderItems.menuItem');

        ApiResponse.success(res, {
            orders,
            page,
            pages: Math.ceil(count / limit),
            total: count
        });
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id
 * @access  Private/Admin
 */
exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return ApiResponse.notFound(res, 'Order not found');
        }

        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();

        ApiResponse.success(res, updatedOrder, 'Order status updated');
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Delete order
 * @route   DELETE /api/orders/:id
 * @access  Private/Admin
 */
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return ApiResponse.notFound(res, 'Order not found');
        }

        await Order.deleteOne({ _id: req.params.id });
        ApiResponse.success(res, null, 'Order deleted successfully');
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Process Stripe payment
 * @route   POST /api/orders/stripe
 * @access  Private
 */
exports.processStripePayment = async (req, res) => {
    try {
        const { token, amount, orderItems } = req.body;

        if (!token || !amount || !orderItems || orderItems.length === 0) {
            return ApiResponse.badRequest(res, 'Missing required fields');
        }

        const result = await paymentService.processStripeCharge({
            token,
            amount,
            orderItems,
            userId: req.user._id,
        });

        if (result.success) {
            await updateSoldQuantity(orderItems);
            ApiResponse.success(res, result.order, 'Payment successful');
        } else {
            ApiResponse.error(res, result.message);
        }
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Create Stripe checkout session
 * @route   POST /api/orders/stripe-checkout
 * @access  Private
 */
exports.createStripeCheckoutSession = async (req, res) => {
    try {
        const { orderItems, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return ApiResponse.badRequest(res, 'No order items provided');
        }

        // Use CLIENT_URL from environment - supports both dev and production
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';

        const result = await paymentService.createStripeCheckoutSession({
            orderItems,
            totalPrice,
            userId: req.user._id,
            userEmail: req.user.email,
            frontendUrl,
        });

        ApiResponse.success(res, result);
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Confirm Stripe payment
 * @route   POST /api/orders/stripe-confirm
 * @access  Private
 */
exports.confirmStripePayment = async (req, res) => {
    try {
        const { sessionId, orderId } = req.body;

        const result = await paymentService.confirmStripePayment(sessionId, orderId);

        if (result.success) {
            ApiResponse.success(res, result.order, 'Payment confirmed');
        } else {
            ApiResponse.error(res, result.message, result.statusCode || 400);
        }
    } catch (error) {
        ApiResponse.error(res, error.message, 500);
    }
};

/**
 * @desc    Handle Stripe webhook
 * @route   POST /api/orders/stripe-webhook
 * @access  Public
 */
exports.handleStripeWebhook = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        await paymentService.handleStripeWebhook(req.body, sig);
        res.json({ received: true });
    } catch (error) {
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
};

/**
 * @desc    Process PayPal payment
 * @route   POST /api/orders/paypal
 * @access  Private
 */
exports.processPayPalPayment = async (req, res) => {
    try {
        const { orderID, paymentDetails, orderItems, totalPrice } = req.body;

        const result = await paymentService.processPayPalPayment({
            orderID,
            paymentDetails,
            orderItems,
            totalPrice,
            userId: req.user._id,
        });

        if (result.success) {
            await updateSoldQuantity(orderItems);
            ApiResponse.success(res, result.order, 'Payment successful');
        } else {
            ApiResponse.error(res, result.message);
        }
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Process Cash on Delivery order
 * @route   POST /api/orders/cod
 * @access  Private
 */
exports.processCODOrder = async (req, res) => {
    try {
        const { orderItems, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return ApiResponse.badRequest(res, 'No order items provided');
        }

        const result = await paymentService.processCODOrder({
            orderItems,
            totalPrice,
            userId: req.user._id,
        });

        if (result.success) {
            await updateSoldQuantity(orderItems);
            ApiResponse.success(res, result.order, 'Order placed successfully');
        } else {
            ApiResponse.error(res, result.message);
        }
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Process VietQR payment
 * @route   POST /api/orders/vietqr
 * @access  Private
 */
exports.processVietQRPayment = async (req, res) => {
    try {
        const { orderItems, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return ApiResponse.badRequest(res, 'No order items provided');
        }

        const result = await paymentService.processVietQRPayment({
            orderItems,
            totalPrice,
            userId: req.user._id,
        });

        if (result.success) {
            await updateSoldQuantity(orderItems);
            ApiResponse.success(res, result);
        } else {
            ApiResponse.error(res, result.message);
        }
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

/**
 * @desc    Confirm VietQR payment (Admin only)
 * @route   PUT /api/orders/confirm-payment/:id
 * @access  Private/Admin
 */
exports.confirmVietQRPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return ApiResponse.notFound(res, 'Order not found');
        }

        if (order.paymentMethod !== 'VietQR') {
            return ApiResponse.badRequest(res, 'Order is not a VietQR payment');
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'confirmed';
        await order.save();

        // Create payment record
        const payment = new Payment({
            user: order.user,
            order: order._id,
            amount: order.totalPrice,
            method: 'VietQR',
            status: 'completed',
            transactionId: `VIETQR-${order._id}`,
        });
        await payment.save();

        ApiResponse.success(res, order, 'Payment confirmed successfully');
    } catch (error) {
        ApiResponse.error(res, error.message);
    }
};

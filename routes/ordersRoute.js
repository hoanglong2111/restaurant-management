const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Payment = require('../models/payment');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

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

// Xóa đơn hàng (Admin)
router.delete('/:id', protect, isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            await Order.deleteOne({ _id: req.params.id });
            res.json({ message: 'Đơn hàng đã được xóa' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
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
                status: 'confirmed', // ✅ Set status to confirmed when payment succeeds
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

// Stripe Checkout (New Version) - Create Session
router.post('/stripe-checkout', protect, async (req, res) => {
    try {
        const { orderItems, totalPrice } = req.body;

        console.log('=== Stripe Checkout Session Request ===');
        console.log('User:', req.user.email);
        console.log('Order Items:', orderItems);
        console.log('Total Price:', totalPrice);

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'Vui lòng cung cấp thông tin đơn hàng.' });
        }

        // Create line items for Stripe
        const lineItems = orderItems.map(item => ({
            price_data: {
                currency: 'vnd',
                product_data: {
                    name: item.name || 'Sản phẩm',
                },
                unit_amount: Math.round(item.price),
            },
            quantity: item.quantity,
        }));

        console.log('Line Items:', JSON.stringify(lineItems, null, 2));

        // Frontend URL với fallback
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        console.log('Frontend URL:', frontendUrl);

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/cart`,
            customer_email: req.user.email,
            metadata: {
                userId: req.user._id.toString(),
                orderItems: JSON.stringify(orderItems.map(item => ({
                    menuItem: item.menuItem,
                    quantity: item.quantity,
                    price: item.price
                }))),
                totalPrice: totalPrice.toString(),
            },
        });

        console.log('Session created successfully:', session.id);
        console.log('Checkout URL:', session.url);
        res.json({ 
            success: true, 
            sessionId: session.id,
            checkoutUrl: session.url 
        });
    } catch (error) {
        console.error('=== Stripe Checkout Error ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(400).json({ message: error.message });
    }
});

// Stripe Webhook - Handle successful payment
router.post('/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Create order from session metadata
        const order = new Order({
            user: session.metadata.userId,
            orderItems: JSON.parse(session.metadata.orderItems),
            paymentMethod: 'Stripe',
            totalPrice: parseFloat(session.metadata.totalPrice),
            isPaid: true,
            paidAt: Date.now(),
            status: 'confirmed',
        });

        await order.save();
        console.log('Order created from Stripe webhook:', order._id);
    }

    res.json({ received: true });
});

// PayPal Payment Route
router.post('/paypal', protect, async (req, res) => {
    try {
        const { orderID, paymentDetails, orderItems, totalPrice } = req.body;

        // Verify payment was successful
        if (paymentDetails.status === 'COMPLETED') {
            // Create a New Order
            const order = new Order({
                user: req.user._id,
                orderItems: orderItems.map(item => ({
                    menuItem: item.menuItem,
                    quantity: item.quantity,
                    price: item.price
                })),
                paymentMethod: 'PayPal',
                totalPrice,
                isPaid: true,
                paidAt: Date.now(),
                status: 'confirmed',
                paymentResult: {
                    id: orderID,
                    status: paymentDetails.status,
                    update_time: paymentDetails.update_time,
                    email_address: paymentDetails.payer.email_address,
                },
            });

            const createdOrder = await order.save();
            res.json({ success: true, order: createdOrder });
        } else {
            res.json({ success: false, message: 'Thanh toán PayPal không thành công.' });
        }
    } catch (error) {
        console.error('PayPal Payment Error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Cash on Delivery (COD) Route
router.post('/cod', protect, async (req, res) => {
    try {
        const { orderItems, totalPrice } = req.body;

        // Validate Required Fields
        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ message: 'Vui lòng cung cấp thông tin đơn hàng.' });
        }

        // Create Order with pending status
        const order = new Order({
            user: req.user._id,
            orderItems: orderItems.map(item => ({
                menuItem: item.menuItem,
                quantity: item.quantity,
                price: item.price
            })),
            paymentMethod: 'Cash',
            totalPrice,
            isPaid: false,
            status: 'pending', // Đơn hàng chờ xác nhận
        });

        const createdOrder = await order.save();
        res.json({ success: true, order: createdOrder });
    } catch (error) {
        console.error('COD Order Error:', error);
        res.status(400).json({ message: error.message });
    }
});

// VietQR Payment Route
router.post('/vietqr', protect, async (req, res) => {
    try {
        const { orderItems, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'Vui lòng cung cấp thông tin đơn hàng.' });
        }

        // Create Order with confirmed status (customer confirms they transferred)
        const order = new Order({
            user: req.user._id,
            orderItems: orderItems.map(item => ({
                menuItem: item.menuItem,
                quantity: item.quantity,
                price: item.price
            })),
            paymentMethod: 'VietQR',
            totalPrice,
            isPaid: false,
            status: 'confirmed',
        });

        const createdOrder = await order.save();

        // VietQR Config
        const bankId = process.env.VIETQR_BANK_ID || '970422'; // VCB
        const accountNo = process.env.VIETQR_ACCOUNT_NO;
        const accountName = process.env.VIETQR_ACCOUNT_NAME;
        const template = process.env.VIETQR_TEMPLATE || 'compact2';
        
        // Generate QR content
        const amount = Math.floor(totalPrice);
        const orderId = createdOrder._id.toString();
        const description = `DH${orderId.slice(-8)}`;
        
        // VietQR API URL (free, no registration needed)
        const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;

        console.log('=== VietQR Payment Request ===');
        console.log('Order ID:', orderId);
        console.log('Amount:', amount);
        console.log('Bank ID:', bankId);
        console.log('Account:', accountNo);
        console.log('Description:', description);
        console.log('QR URL:', qrUrl);

        res.json({ 
            success: true, 
            order: createdOrder,
            qrUrl: qrUrl,
            paymentInfo: {
                bankId,
                accountNo,
                accountName,
                amount,
                description
            }
        });
    } catch (error) {
        console.error('VietQR Order Error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Manual payment confirmation route for VietQR (Admin only)
router.put('/confirm-payment/:id', protect, isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order && order.paymentMethod === 'VietQR') {
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

            res.json({ success: true, order });
        } else {
            res.status(404).json({ message: 'Đơn hàng không tìm thấy hoặc không phải VietQR' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
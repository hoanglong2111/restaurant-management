const Stripe = require('stripe');
const Order = require('../models/order');
const logger = require('../utils/logger');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Payment Service
 * Handles all payment-related business logic
 */
class PaymentService {
    /**
     * Process Stripe charge (old method)
     */
    async processStripeCharge({ token, amount, orderItems, userId }) {
        try {
            const charge = await stripe.charges.create({
                amount,
                currency: 'vnd',
                source: token.id,
                description: 'Thanh toán giỏ hàng',
            });

            if (charge.status === 'succeeded') {
                const order = new Order({
                    user: userId,
                    orderItems: orderItems.map(item => ({
                        menuItem: item.menuItem,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    paymentMethod: 'Stripe',
                    totalPrice: amount / 10,
                    isPaid: true,
                    paidAt: Date.now(),
                    status: 'confirmed',
                });

                const createdOrder = await order.save();
                logger.info(`Stripe payment successful for order ${createdOrder._id}`);

                return { success: true, order: createdOrder };
            }

            return { success: false, message: 'Payment failed' };
        } catch (error) {
            logger.error('Stripe charge error:', error);
            throw error;
        }
    }

    /**
     * Create Stripe checkout session
     */
    async createStripeCheckoutSession({
        orderItems,
        totalPrice,
        userId,
        userEmail,
        frontendUrl,
    }) {
        try {
            // Create order first (pending status)
            const order = new Order({
                user: userId,
                orderItems: orderItems.map(item => ({
                    menuItem: item.menuItem,
                    quantity: item.quantity,
                    price: item.price,
                })),
                paymentMethod: 'Stripe',
                totalPrice,
                isPaid: false,
                status: 'pending',
            });

            const createdOrder = await order.save();
            logger.info(`Order created with ID: ${createdOrder._id}`);

            // Create Stripe line items
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

            // Create Stripe Checkout Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${createdOrder._id}`,
                cancel_url: `${frontendUrl}/cart`,
                customer_email: userEmail,
                metadata: {
                    orderId: createdOrder._id.toString(),
                    userId: userId.toString(),
                    orderItems: JSON.stringify(orderItems.map(item => ({
                        menuItem: item.menuItem,
                        quantity: item.quantity,
                        price: item.price,
                    }))),
                    totalPrice: totalPrice.toString(),
                },
            });

            logger.info(`Stripe checkout session created: ${session.id}`);

            return {
                success: true,
                sessionId: session.id,
                checkoutUrl: session.url,
                orderId: createdOrder._id,
            };
        } catch (error) {
            logger.error('Stripe checkout session error:', error);
            throw error;
        }
    }

    /**
     * Confirm Stripe payment after checkout
     */
    async confirmStripePayment(sessionId, orderId) {
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            if (session.payment_status === 'paid') {
                const order = await Order.findById(orderId);

                if (!order) {
                    return { success: false, message: 'Order not found', statusCode: 404 };
                }

                order.isPaid = true;
                order.paidAt = Date.now();
                order.status = 'confirmed';
                await order.save();

                logger.info(`Payment confirmed for order ${order._id}`);
                return { success: true, order };
            }

            return { success: false, message: 'Payment not completed', statusCode: 400 };
        } catch (error) {
            logger.error('Payment confirmation error:', error);
            throw error;
        }
    }

    /**
     * Handle Stripe webhook events
     */
    async handleStripeWebhook(body, signature) {
        let event;

        try {
            if (process.env.STRIPE_WEBHOOK_SECRET) {
                event = stripe.webhooks.constructEvent(
                    body,
                    signature,
                    process.env.STRIPE_WEBHOOK_SECRET
                );
            } else {
                event = JSON.parse(body);
                logger.warn('Webhook secret not configured - skipping signature verification');
            }
        } catch (err) {
            logger.error('Webhook signature verification failed:', err);
            throw err;
        }

        // Handle checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            logger.info(`Stripe payment success webhook for order ${session.metadata.orderId}`);

            try {
                const order = await Order.findById(session.metadata.orderId);
                if (order) {
                    order.isPaid = true;
                    order.paidAt = Date.now();
                    order.status = 'confirmed';
                    await order.save();
                    logger.info(`Order ${order._id} updated to paid`);
                } else {
                    logger.error(`Order not found: ${session.metadata.orderId}`);
                }
            } catch (error) {
                logger.error('Error updating order:', error);
            }
        }
    }

    /**
     * Process PayPal payment
     */
    async processPayPalPayment({
        orderID,
        paymentDetails,
        orderItems,
        totalPrice,
        userId,
    }) {
        try {
            if (paymentDetails.status === 'COMPLETED') {
                const order = new Order({
                    user: userId,
                    orderItems: orderItems.map(item => ({
                        menuItem: item.menuItem,
                        quantity: item.quantity,
                        price: item.price,
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
                logger.info(`PayPal payment successful for order ${createdOrder._id}`);

                return { success: true, order: createdOrder };
            }

            return { success: false, message: 'PayPal payment not completed' };
        } catch (error) {
            logger.error('PayPal payment error:', error);
            throw error;
        }
    }

    /**
     * Process Cash on Delivery order
     */
    async processCODOrder({ orderItems, totalPrice, userId }) {
        try {
            const order = new Order({
                user: userId,
                orderItems: orderItems.map(item => ({
                    menuItem: item.menuItem,
                    quantity: item.quantity,
                    price: item.price,
                })),
                paymentMethod: 'Cash',
                totalPrice,
                isPaid: false,
                status: 'pending',
            });

            const createdOrder = await order.save();
            logger.info(`COD order created: ${createdOrder._id}`);

            return { success: true, order: createdOrder };
        } catch (error) {
            logger.error('COD order error:', error);
            throw error;
        }
    }

    /**
     * Process VietQR payment
     */
    async processVietQRPayment({ orderItems, totalPrice, userId }) {
        try {
            const order = new Order({
                user: userId,
                orderItems: orderItems.map(item => ({
                    menuItem: item.menuItem,
                    quantity: item.quantity,
                    price: item.price,
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

            logger.info(`VietQR payment request for order ${orderId}, amount: ${amount}`);

            return {
                success: true,
                order: createdOrder,
                qrUrl,
                paymentInfo: {
                    bankId,
                    accountNo,
                    accountName,
                    amount,
                    description,
                },
            };
        } catch (error) {
            logger.error('VietQR order error:', error);
            throw error;
        }
    }
}

module.exports = new PaymentService();

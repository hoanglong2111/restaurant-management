const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { orderSchemas } = require('../utils/validationSchemas');

// Order CRUD routes
router.post('/create', protect, validate(orderSchemas.createOrder), orderController.createOrder);
router.get('/myorders', protect, orderController.getMyOrders);
router.get('/', protect, isAdmin, orderController.getAllOrders);
router.put('/:id', protect, isAdmin, validate(orderSchemas.updateStatus), orderController.updateOrderStatus);
router.delete('/:id', protect, isAdmin, orderController.deleteOrder);

// Payment routes
router.post('/stripe', protect, validate(orderSchemas.stripePayment), orderController.processStripePayment);
router.post('/stripe-checkout', protect, validate(orderSchemas.stripeCheckout), orderController.createStripeCheckoutSession);
router.post('/stripe-confirm', protect, orderController.confirmStripePayment);
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), orderController.handleStripeWebhook);

router.post('/paypal', protect, orderController.processPayPalPayment);
router.post('/cod', protect, orderController.processCODOrder);
router.post('/vietqr', protect, orderController.processVietQRPayment);

// Admin payment confirmation
router.put('/confirm-payment/:id', protect, isAdmin, orderController.confirmVietQRPayment);

module.exports = router;
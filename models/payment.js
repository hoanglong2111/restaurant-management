const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        reservation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reservation',
        },
        total: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ['Stripe', 'VNPay', 'ZaloPay', 'Cash', 'PayPal'],
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        transactionId: {
            type: String, // ID từ payment gateway
        },
        responseCode: {
            type: String, // Response code từ gateway
        },
        bankCode: {
            type: String, // Ngân hàng sử dụng (VNPay)
        },
    },
    {
        timestamps: true,
    }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

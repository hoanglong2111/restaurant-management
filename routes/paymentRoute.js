const express = require('express');
const router = express.Router();
const crypto = require('crypto-js');
const moment = require('moment');
const axios = require('axios');
const querystring = require('querystring');
const { protect } = require('../middleware/authMiddleware');
const Payment = require('../models/payment');
const Order = require('../models/order');

// ==================== VNPay ====================

// Tạo payment URL cho VNPay
router.post('/vnpay/create', protect, async (req, res) => {
    try {
        const { orderItems, totalPrice, orderInfo } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống' });
        }

        // Tạo order trước
        const order = new Order({
            user: req.user._id,
            orderItems,
            paymentMethod: 'VNPay',
            totalPrice,
            status: 'pending',
        });
        const createdOrder = await order.save();

        // Tạo payment record
        const payment = new Payment({
            user: req.user._id,
            order: createdOrder._id,
            total: totalPrice,
            paymentMethod: 'VNPay',
            status: 'pending',
        });
        await payment.save();

        // VNPay parameters
        const vnp_TmnCode = process.env.VNPAY_TMN_CODE;
        const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
        const vnp_Url = process.env.VNPAY_URL;
        const vnp_ReturnUrl = process.env.VNPAY_RETURN_URL;

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const orderId = moment(date).format('DDHHmmss');

        const amount = totalPrice;
        const locale = 'vn';
        const currCode = 'VND';

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = payment._id.toString(); // Dùng payment ID
        vnp_Params['vnp_OrderInfo'] = orderInfo || `Thanh toan don hang ${createdOrder._id}`;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPay yêu cầu nhân 100
        vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
        vnp_Params['vnp_IpAddr'] = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
        vnp_Params['vnp_CreateDate'] = createDate;

        // Sắp xếp params theo thứ tự alphabet
        vnp_Params = sortObject(vnp_Params);

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.HmacSHA512(signData, vnp_HashSecret);
        const signed = hmac.toString(crypto.enc.Hex);

        vnp_Params['vnp_SecureHash'] = signed;
        const paymentUrl = vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });

        res.json({
            success: true,
            paymentUrl,
            orderId: createdOrder._id,
            paymentId: payment._id,
        });
    } catch (error) {
        console.error('VNPay Create Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// VNPay Return URL (sau khi user thanh toán)
router.get('/vnpay/return', async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.HmacSHA512(signData, vnp_HashSecret);
        const signed = hmac.toString(crypto.enc.Hex);

        const paymentId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];

        if (secureHash === signed) {
            // Tìm payment
            const payment = await Payment.findById(paymentId);

            if (payment) {
                if (responseCode === '00') {
                    // Thanh toán thành công
                    payment.isPaid = true;
                    payment.paidAt = new Date();
                    payment.status = 'completed';
                    payment.transactionId = vnp_Params['vnp_TransactionNo'];
                    payment.responseCode = responseCode;
                    payment.bankCode = vnp_Params['vnp_BankCode'];
                    await payment.save();

                    // Cập nhật order
                    if (payment.order) {
                        const order = await Order.findById(payment.order);
                        if (order) {
                            order.isPaid = true;
                            order.paidAt = new Date();
                            order.status = 'confirmed';
                            await order.save();
                        }
                    }

                    // Redirect về frontend với success
                    return res.redirect(`${process.env.VNPAY_RETURN_URL}?success=true&orderId=${payment.order}&paymentId=${payment._id}`);
                } else {
                    // Thanh toán thất bại
                    payment.status = 'failed';
                    payment.responseCode = responseCode;
                    await payment.save();

                    return res.redirect(`${process.env.VNPAY_RETURN_URL}?success=false&message=Payment failed`);
                }
            }
        }

        res.redirect(`${process.env.VNPAY_RETURN_URL}?success=false&message=Invalid signature`);
    } catch (error) {
        console.error('VNPay Return Error:', error);
        res.redirect(`${process.env.VNPAY_RETURN_URL}?success=false&message=Error processing payment`);
    }
});

// ==================== ZaloPay ====================

// Tạo payment cho ZaloPay
router.post('/zalopay/create', protect, async (req, res) => {
    try {
        const { orderItems, totalPrice, orderInfo } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống' });
        }

        // Tạo order trước
        const order = new Order({
            user: req.user._id,
            orderItems,
            paymentMethod: 'ZaloPay',
            totalPrice,
            status: 'pending',
        });
        const createdOrder = await order.save();

        // Tạo payment record
        const payment = new Payment({
            user: req.user._id,
            order: createdOrder._id,
            total: totalPrice,
            paymentMethod: 'ZaloPay',
            status: 'pending',
        });
        await payment.save();

        const config = {
            app_id: process.env.ZALOPAY_APP_ID,
            key1: process.env.ZALOPAY_KEY1,
            key2: process.env.ZALOPAY_KEY2,
            endpoint: process.env.ZALOPAY_ENDPOINT,
        };

        const embed_data = {
            redirecturl: `${process.env.VNPAY_RETURN_URL}?source=zalopay`,
        };

        const items = orderItems.map(item => ({
            itemid: item.menuItem,
            itemname: item.name || 'Product',
            itemprice: item.price,
            itemquantity: item.quantity,
        }));

        const transID = Math.floor(Math.random() * 1000000);
        const order_zalopay = {
            app_id: config.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${payment._id}`,
            app_user: req.user.email || req.user.name,
            app_time: Date.now(),
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: totalPrice,
            description: orderInfo || `Thanh toan don hang #${createdOrder._id}`,
            bank_code: '',
            callback_url: process.env.ZALOPAY_CALLBACK_URL,
        };

        // app_id|app_trans_id|app_user|amount|app_time|embed_data|item
        const data = config.app_id + '|' + order_zalopay.app_trans_id + '|' + order_zalopay.app_user + '|' + order_zalopay.amount + '|' + order_zalopay.app_time + '|' + order_zalopay.embed_data + '|' + order_zalopay.item;
        order_zalopay.mac = crypto.HmacSHA256(data, config.key1).toString();

        const response = await axios.post(config.endpoint, null, { params: order_zalopay });

        if (response.data.return_code === 1) {
            // Lưu app_trans_id vào payment
            payment.transactionId = order_zalopay.app_trans_id;
            await payment.save();

            res.json({
                success: true,
                paymentUrl: response.data.order_url,
                orderId: createdOrder._id,
                paymentId: payment._id,
            });
        } else {
            res.status(400).json({ message: 'ZaloPay error', error: response.data });
        }
    } catch (error) {
        console.error('ZaloPay Create Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ZaloPay Callback (ZaloPay gọi về server khi thanh toán xong)
router.post('/zalopay/callback', async (req, res) => {
    try {
        let result = {};
        const config = {
            key2: process.env.ZALOPAY_KEY2,
        };

        const dataStr = req.body.data;
        const reqMac = req.body.mac;

        const mac = crypto.HmacSHA256(dataStr, config.key2).toString();

        // Kiểm tra callback hợp lệ
        if (reqMac !== mac) {
            result.return_code = -1;
            result.return_message = 'mac not equal';
        } else {
            const dataJson = JSON.parse(dataStr);
            const app_trans_id = dataJson['app_trans_id'];

            // Tìm payment theo app_trans_id
            const paymentId = app_trans_id.split('_')[1]; // Extract payment ID
            const payment = await Payment.findById(paymentId);

            if (payment) {
                payment.isPaid = true;
                payment.paidAt = new Date();
                payment.status = 'completed';
                payment.responseCode = '00';
                await payment.save();

                // Cập nhật order
                if (payment.order) {
                    const order = await Order.findById(payment.order);
                    if (order) {
                        order.isPaid = true;
                        order.paidAt = new Date();
                        order.status = 'confirmed';
                        await order.save();
                    }
                }
            }

            result.return_code = 1;
            result.return_message = 'success';
        }

        res.json(result);
    } catch (error) {
        console.error('ZaloPay Callback Error:', error);
        res.json({ return_code: 0, return_message: error.message });
    }
});

// Helper function để sắp xếp object
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
}

module.exports = router;

const crypto = require('crypto');
const querystring = require('querystring');

// Nhập thông tin VNPay của bạn tại đây
const TMN_CODE = 'SSZ0831R';
const HASH_SECRET = 'O0B1B68PYZLZC3PC8Z5EEFJV6MPRSE1N'; // Thay đổi Hash Secret ở đây để test

// Test data
const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: TMN_CODE,
    vnp_Amount: '1000000',
    vnp_CreateDate: '20251107120000',
    vnp_CurrCode: 'VND',
    vnp_IpAddr: '127.0.0.1',
    vnp_Locale: 'vn',
    vnp_OrderInfo: 'Test payment',
    vnp_OrderType: 'other',
    vnp_ReturnUrl: 'http://localhost:3000/return',
    vnp_TxnRef: 'TEST123456',
};

// Sort object
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
        sorted[key] = obj[key];
    });
    return sorted;
}

const sortedParams = sortObject(vnp_Params);

// Build sign data
let signData = [];
for (let key in sortedParams) {
    signData.push(key + '=' + sortedParams[key]);
}
const signDataString = signData.join('&');

// Create signature
const hmac = crypto.createHmac('sha512', HASH_SECRET);
const signature = hmac.update(Buffer.from(signDataString, 'utf-8')).digest('hex');

console.log('=== VNPay Test Tool ===');
console.log('TMN Code:', TMN_CODE);
console.log('Hash Secret:', HASH_SECRET);
console.log('\nSign Data:');
console.log(signDataString);
console.log('\nSignature:');
console.log(signature);
console.log('\nTest URL:');
console.log('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?' + querystring.stringify(sortedParams) + '&vnp_SecureHash=' + signature);
console.log('\n=== Hướng dẫn ===');
console.log('1. Copy URL ở trên');
console.log('2. Mở trên trình duyệt');
console.log('3. Nếu lỗi 70 -> Hash Secret SAI');
console.log('4. Nếu lỗi 72 -> TMN Code SAI hoặc chưa kích hoạt');
console.log('5. Nếu vào trang thanh toán -> ĐÚNG!');

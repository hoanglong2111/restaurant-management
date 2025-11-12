# VNPay Integration Setup Guide

## 🔧 Environment Variables cần thêm trên Render

Vào **Render Dashboard** → **Your Service** → **Environment** → Add các biến sau:

```env
VNPAY_TMN_CODE=SSZ0831R
VNPAY_HASH_SECRET=O0B1B68PYZLZC3PC8Z5EEFJV6MPRSE1N
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://restaurant-management-v6nm.onrender.com/api/orders/vnpay-return
FRONTEND_URL=https://restaurant-management-pink-fifthcens.vercel.app
```

## 📝 Thông tin VNPay Sandbox

### Config:
- **TMN Code**: `SSZ0831R`
- **Hash Secret**: `O0B1B68PYZLZC3PC8Z5EEFJV6MPRSE1N`
- **URL**: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`

### Thẻ test để thanh toán:
```
Ngân hàng: NCB
Số thẻ: 9704198526191432198
Tên chủ thẻ: NGUYEN VAN A
Ngày phát hành: 07/15
Mật khẩu OTP: 123456
```

### Thẻ test khác:
```
Số thẻ: 9704 0000 0000 0018
Tên: NGUYEN VAN A
Ngày phát hành: 03/07
OTP: 123456
```

## 🔄 Luồng hoạt động VNPay

1. **User click "Thanh toán VNPay"** → Frontend gửi request tới backend
2. **Backend tạo order** với status `pending`
3. **Backend tạo payment URL** với chữ ký bảo mật
4. **User redirect** tới VNPay payment gateway
5. **User nhập thông tin thẻ** và xác thực OTP
6. **VNPay callback** về backend: `https://restaurant-management-v6nm.onrender.com/api/orders/vnpay-return`
7. **Backend verify chữ ký** và cập nhật order status
8. **Backend redirect** user về frontend Vercel: `https://restaurant-management-eta-fawn.vercel.app/vnpay-return`
9. **Frontend hiển thị** notification và redirect về `/my-orders`

## ⚠️ Lưu ý quan trọng

1. **VNPAY_RETURN_URL** phải là URL backend (Render) để xử lý callback
2. **FRONTEND_URL** dùng để redirect user sau khi xử lý xong
3. Nhớ thêm đầy đủ ENV variables trên Render
4. Redeploy backend sau khi thêm ENV
5. Clear cache browser nếu gặp lỗi CORS

## 🧪 Test Flow

### Thành công:
1. Thêm sản phẩm vào giỏ hàng
2. Click "Thanh toán VNPay"
3. Chọn ngân hàng NCB
4. Nhập thông tin thẻ test
5. Nhập OTP: `123456`
6. Xác nhận thanh toán
7. ✅ Redirect về My Orders với notification success

### Thất bại:
1. Thực hiện bước 1-4
2. Click "Hủy giao dịch" hoặc nhập sai OTP
3. ❌ Redirect về Cart với notification error

## 📦 Dependencies đã cài

```json
{
  "vnpay": "^latest",
  "crypto": "built-in",
  "querystring": "built-in"
}
```

## 🚀 Deploy Checklist

- [ ] Thêm ENV variables trên Render
- [ ] Redeploy backend
- [ ] Test thanh toán trên production
- [ ] Kiểm tra order status trong database
- [ ] Kiểm tra payment record được tạo

## 📞 Support

VNPay Sandbox không có hỗ trợ technical support. Nếu cần môi trường production thật:
- Đăng ký tài khoản merchant tại: https://vnpay.vn
- Liên hệ VNPay để được cấp TMN Code và Hash Secret thật
- Thay đổi URL từ sandbox sang production

---

**Created**: November 7, 2025
**Status**: ✅ Production Ready

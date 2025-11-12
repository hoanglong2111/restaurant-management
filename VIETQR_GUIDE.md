# 🏦 Hướng dẫn tích hợp VietQR

## 📋 Tổng quan

**VietQR** là giải pháp thanh toán QR Code đơn giản, miễn phí, không cần đăng ký API. Khách hàng chỉ cần quét mã QR bằng app ngân hàng để thanh toán.

### Ưu điểm:
✅ **Miễn phí 100%** - Không phí tích hợp, không phí giao dịch từ VietQR  
✅ **Không cần đăng ký** - Không cần tài khoản sandbox hay production  
✅ **Đơn giản** - Chỉ cần tạo URL QR code  
✅ **An toàn** - Khách hàng thanh toán qua app ngân hàng chính thức  
✅ **Tự động điền** - Số tiền và nội dung chuyển khoản tự động điền sẵn  

### Nhược điểm:
⚠️ **Xác nhận thủ công** - Admin phải xác nhận thanh toán qua backend  
⚠️ **Không tự động** - Cần kiểm tra sao kê ngân hàng để xác nhận  

---

## 🚀 Cách hoạt động

1. **Khách hàng đặt hàng** → Hệ thống tạo đơn hàng với status `pending`
2. **Hiển thị mã QR** → Khách hàng quét QR bằng app ngân hàng
3. **Khách hàng thanh toán** → Chuyển khoản với nội dung đơn hàng
4. **Admin kiểm tra** → Xem sao kê ngân hàng, xác nhận đơn hàng
5. **Cập nhật status** → API `/api/orders/confirm-payment/:orderId`

---

## ⚙️ Cấu hình

### 1. Cập nhật file `.env`

```env
# VietQR Configuration
VIETQR_BANK_ID=970422                    # Mã ngân hàng (VCB = 970422)
VIETQR_ACCOUNT_NO=0123456789             # Số tài khoản của bạn
VIETQR_ACCOUNT_NAME=NGUYEN VAN A         # Tên chủ tài khoản (VIẾT HOA, không dấu)
VIETQR_TEMPLATE=compact2                 # Template QR (compact2, compact, qr_only, print)
```

### 2. Danh sách mã ngân hàng phổ biến

| Ngân hàng | Mã Bank ID |
|-----------|-----------|
| Vietcombank (VCB) | 970422 |
| Techcombank (TCB) | 970407 |
| BIDV | 970418 |
| Vietinbank (CTG) | 970415 |
| ACB | 970416 |
| MBBank | 970422 |
| TPBank | 970423 |
| Sacombank (STB) | 970403 |
| VPBank | 970432 |
| Agribank | 970405 |

**Xem đầy đủ:** https://api.vietqr.io/v2/banks

---

## 📱 Frontend - CartScreen.js

### Thêm VietQR button

```javascript
// Thay thế VNPay button bằng VietQR button
<Button 
    type="primary" 
    loading={loading} 
    onClick={handleVietQR} 
    className="vietqr-button"
    style={{ 
        width: '100%', 
        height: '45px',
        fontSize: '16px',
        backgroundColor: '#00A651',  // Màu xanh lá VietQR
        color: 'white',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontWeight: '600'
    }}
>
    <QrcodeOutlined style={{ fontSize: '20px' }} />
    <span>Thanh toán VietQR</span>
</Button>
```

### Handler function

```javascript
const handleVietQR = async () => {
    try {
        setLoading(true);
        
        // Gọi API tạo đơn hàng và lấy QR
        const { data } = await axios.post(
            '/api/orders/vietqr',
            { orderItems: cart, totalPrice: total },
            { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );

        if (data.success) {
            // Hiển thị modal với QR code
            Modal.info({
                title: 'Quét mã QR để thanh toán',
                width: 500,
                content: (
                    <div style={{ textAlign: 'center' }}>
                        <img 
                            src={data.qrUrl} 
                            alt="VietQR" 
                            style={{ width: '100%', maxWidth: '400px', margin: '20px 0' }}
                        />
                        <div style={{ marginTop: '15px', textAlign: 'left' }}>
                            <p><strong>Số tiền:</strong> {data.paymentInfo.amount.toLocaleString()} VNĐ</p>
                            <p><strong>Nội dung:</strong> {data.paymentInfo.description}</p>
                            <p><strong>Ngân hàng:</strong> {data.paymentInfo.accountName}</p>
                            <p style={{ color: '#ff4d4f', marginTop: '10px' }}>
                                ⚠️ Vui lòng chuyển khoản ĐÚNG nội dung để đơn hàng được xử lý nhanh
                            </p>
                        </div>
                    </div>
                ),
                onOk: () => {
                    clearCart();
                    navigate('/myorders');
                }
            });
        }
    } catch (error) {
        message.error('Có lỗi xảy ra khi tạo mã QR');
    } finally {
        setLoading(false);
    }
};
```

---

## 🎨 CSS Styling

```css
/* CartScreen.css */
.vietqr-button {
    background: linear-gradient(135deg, #00A651 0%, #00843F 100%) !important;
    border: none !important;
    box-shadow: 0 2px 8px rgba(0, 166, 81, 0.3);
    transition: all 0.3s ease;
}

.vietqr-button:hover {
    background: linear-gradient(135deg, #00843F 0%, #006830 100%) !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 166, 81, 0.4);
}
```

---

## 🔧 Backend - ordersRoute.js

### Route đã được tạo sẵn:

#### 1. Tạo đơn hàng và QR Code
```
POST /api/orders/vietqr
```

**Response:**
```json
{
    "success": true,
    "order": {...},
    "qrUrl": "https://img.vietqr.io/image/970422-0123456789-compact2.png?amount=100000&addInfo=DH12345678&accountName=NGUYEN+VAN+A",
    "paymentInfo": {
        "bankId": "970422",
        "accountNo": "0123456789",
        "accountName": "NGUYEN VAN A",
        "amount": 100000,
        "description": "DH12345678"
    }
}
```

#### 2. Xác nhận thanh toán (Admin only)
```
PUT /api/orders/confirm-payment/:orderId
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

---

## 👨‍💼 Admin: Xác nhận thanh toán

### Cách 1: Qua Admin Dashboard

Thêm button "Xác nhận thanh toán" trong `ManageOrders.js`:

```javascript
{order.paymentMethod === 'VietQR' && !order.isPaid && (
    <Button 
        type="primary"
        size="small"
        onClick={() => handleConfirmPayment(order._id)}
    >
        ✅ Xác nhận thanh toán
    </Button>
)}
```

Handler:
```javascript
const handleConfirmPayment = async (orderId) => {
    try {
        const { data } = await axios.put(
            `/api/orders/confirm-payment/${orderId}`,
            {},
            { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        
        if (data.success) {
            message.success('Đã xác nhận thanh toán!');
            // Reload orders
            fetchOrders();
        }
    } catch (error) {
        message.error('Lỗi xác nhận thanh toán');
    }
};
```

### Cách 2: Qua API trực tiếp (Postman)

```
PUT https://restaurant-management-v6nm.onrender.com/api/orders/confirm-payment/6913f7202ad4eb7d7f4c1ee6
Authorization: Bearer <admin_token>
```

---

## 🔄 Workflow hoàn chỉnh

### Khách hàng:
1. Thêm món vào giỏ → Vào `/cart`
2. Click **"Thanh toán VietQR"**
3. Modal hiện QR code và thông tin
4. Mở app ngân hàng → Quét QR
5. Xác nhận chuyển khoản (số tiền + nội dung tự động điền)
6. Đơn hàng chuyển sang `/myorders` với status `pending`

### Admin:
1. Vào `/admin/orders`
2. Kiểm tra sao kê ngân hàng
3. Tìm giao dịch với nội dung `DH12345678`
4. Click **"Xác nhận thanh toán"**
5. Đơn hàng chuyển sang `confirmed`, `isPaid = true`

---

## 🌐 VietQR API Reference

### Base URL
```
https://img.vietqr.io/image/
```

### Parameters
- `{BANK_ID}`: Mã ngân hàng (VD: 970422)
- `{ACCOUNT_NO}`: Số tài khoản
- `{TEMPLATE}`: Loại template QR
  - `compact2`: QR + logo ngân hàng + thông tin chi tiết (khuyến nghị)
  - `compact`: QR + logo ngân hàng
  - `qr_only`: Chỉ QR code
  - `print`: Format in ấn

### Query String
- `amount`: Số tiền (VNĐ)
- `addInfo`: Nội dung chuyển khoản (URL encoded)
- `accountName`: Tên chủ tài khoản (URL encoded)

### Ví dụ URL:
```
https://img.vietqr.io/image/970422-0123456789-compact2.png?amount=500000&addInfo=DH12345678&accountName=NGUYEN+VAN+A
```

---

## 🚀 Deployment

### 1. Cập nhật `.env` trên Render

Vào **Render Dashboard** → Service backend → **Environment**:

```
VIETQR_BANK_ID=970422
VIETQR_ACCOUNT_NO=<SỐ_TÀI_KHOẢN_THẬT>
VIETQR_ACCOUNT_NAME=<TÊN_CHỦ_TÀI_KHOẢN>
VIETQR_TEMPLATE=compact2
```

### 2. Redeploy service

Render sẽ tự động restart sau khi Save.

---

## 📝 Lưu ý quan trọng

### ✅ Nên làm:
- Dùng tên tài khoản VIẾT HOA, không dấu
- Nội dung chuyển khoản ngắn gọn (DH + 8 ký tự cuối order ID)
- Kiểm tra sao kê thường xuyên
- Tạo workflow xác nhận thanh toán cho admin

### ❌ Không nên:
- Dùng tên có dấu hoặc ký tự đặc biệt
- Nội dung quá dài (> 35 ký tự)
- Để khách hàng tự nhập nội dung (dễ sai)

---

## 🆚 So sánh VNPay vs VietQR

| Tiêu chí | VNPay | VietQR |
|----------|-------|--------|
| **Phí tích hợp** | Có (theo gói) | Miễn phí |
| **Đăng ký** | Phức tạp | Không cần |
| **Tự động xác nhận** | ✅ Có | ❌ Không |
| **Sandbox test** | ✅ Có | ❌ Không (dùng thật luôn) |
| **Bảo mật** | Cao (Hash Secret) | Trung bình |
| **UX khách hàng** | Tốt | Rất tốt |
| **UX admin** | Tự động | Thủ công |

---

## 🎯 Kết luận

VietQR phù hợp cho:
- ✅ Dự án cá nhân, startup nhỏ
- ✅ Số lượng đơn hàng ít (< 50/ngày)
- ✅ Có admin kiểm tra thường xuyên
- ✅ Không có budget cho payment gateway

VNPay phù hợp cho:
- ✅ Doanh nghiệp lớn
- ✅ Số lượng đơn hàng nhiều
- ✅ Cần tự động hóa 100%
- ✅ Có budget đầu tư

---

## 📞 Hỗ trợ

- **VietQR API Docs**: https://vietqr.io/developer
- **Danh sách ngân hàng**: https://api.vietqr.io/v2/banks
- **VietQR Support**: support@vietqr.io

---

**Chúc bạn tích hợp thành công! 🎉**

# 🔐 Hướng Dẫn Tạo OAuth Credentials Nhanh

## Google OAuth - 5 phút ⏱️

### Bước 1: Truy cập Google Cloud Console
1. Mở: https://console.cloud.google.com/
2. Đăng nhập Google account của bạn

### Bước 2: Tạo Project
1. Click vào dropdown project ở top bar
2. Click "NEW PROJECT"
3. Project name: `Restaurant Management`
4. Click "CREATE"

### Bước 3: Tạo OAuth Credentials
1. Chọn project vừa tạo
2. Menu bên trái → **APIs & Services** → **Credentials**
3. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**

### Bước 4: Configure Consent Screen (lần đầu)
1. Nếu hỏi, click "CONFIGURE CONSENT SCREEN"
2. Chọn **External** → Click "CREATE"
3. Điền thông tin:
   - App name: `Restaurant Management`
   - User support email: email của bạn
   - Developer contact: email của bạn
4. Click "SAVE AND CONTINUE" (bỏ qua các steps khác)
5. Quay lại **Credentials** tab

### Bước 5: Tạo OAuth Client ID
1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Application type: **Web application**
3. Name: `Restaurant OAuth Client`
4. **Authorized JavaScript origins:**
   - `http://localhost:3000`
   - `http://localhost:5000`
5. **Authorized redirect URIs:**
   - `http://localhost:5000/api/auth/google/callback`
6. Click **"CREATE"**

### Bước 6: Copy Credentials
1. Popup hiện ra với **Client ID** và **Client Secret**
2. Click icon "📋" để copy

### Bước 7: Thêm vào .env
Mở file `e:\restaurant-management\.env` và thêm:
```env
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
```

✅ **Google OAuth Setup XONG!**

---

## Facebook OAuth - 5 phút ⏱️

### Bước 1: Truy cập Facebook Developers
1. Mở: https://developers.facebook.com/
2. Đăng nhập Facebook account của bạn

### Bước 2: Tạo App
1. Click **"My Apps"** (góc phải trên)
2. Click **"Create App"**
3. Use case: Chọn **"Other"** → Click "Next"
4. App type: Chọn **"Consumer"** → Click "Next"
5. Điền thông tin:
   - App name: `Restaurant Management`
   - App contact email: email của bạn
6. Click **"Create app"**
7. Xác nhận bằng password Facebook nếu hỏi

### Bước 3: Setup Facebook Login
1. Trong dashboard, tìm **"Add products to your app"**
2. Tìm **"Facebook Login"** → Click **"Set up"**
3. Chọn platform: **"Web"**
4. Site URL: `http://localhost:3000` → Click "Save"

### Bước 4: Configure Facebook Login Settings
1. Menu bên trái → **Facebook Login** → **Settings**
2. **Valid OAuth Redirect URIs:**
   ```
   http://localhost:5000/api/auth/facebook/callback
   ```
3. Click **"Save Changes"**

### Bước 5: Copy App Credentials
1. Menu bên trái → **Settings** → **Basic**
2. Copy **App ID**
3. Click **"Show"** ở **App Secret** → Copy

### Bước 6: Thêm vào .env
Mở file `e:\restaurant-management\.env` và thêm:
```env
FACEBOOK_APP_ID=paste_your_app_id_here
FACEBOOK_APP_SECRET=paste_your_app_secret_here
```

### Bước 7: Make App Live (Optional - cho production)
- Hiện tại app ở chế độ **Development** (chỉ bạn test được)
- Để public: **Settings** → **Basic** → Toggle "App Mode" to **Live**

✅ **Facebook OAuth Setup XONG!**

---

## Frontend .env

Mở file `e:\restaurant-management\client\.env` và thêm:
```env
REACT_APP_GOOGLE_CLIENT_ID=paste_google_client_id_here
REACT_APP_FACEBOOK_APP_ID=paste_facebook_app_id_here
```

---

## Test OAuth

1. **Restart server:**
   - Stop server (Ctrl+C)
   - Chạy lại: `node server.js`

2. **Restart frontend:**
   - Stop frontend (Ctrl+C)
   - Chạy lại: `npm start`

3. **Test:**
   - Mở: http://localhost:3000/login
   - Click **"Continue with Google"** hoặc **"Continue with Facebook"**
   - Đăng nhập
   - Nếu thành công → Redirect về trang menu!

---

## Troubleshooting

### Lỗi "redirect_uri_mismatch"
- Check lại redirect URI trong Google/Facebook console
- Phải y chang: `http://localhost:5000/api/auth/google/callback`

### Lỗi "invalid_client"
- Check Client ID/Secret đã copy đúng chưa
- Không có khoảng trắng thừa trong .env
- Restart server sau khi sửa .env

### OAuth button không hiện
- Check console log trong browser (F12)
- Verify file `.env` trong client folder có đúng không

---

## Quick Reference

**Files cần sửa:**
1. `e:\restaurant-management\.env` (backend)
2. `e:\restaurant-management\client\.env` (frontend)

**Sau khi thêm credentials:**
- Restart cả backend và frontend
- Test ngay trên login page

**Links:**
- Google Console: https://console.cloud.google.com/apis/credentials
- Facebook Developers: https://developers.facebook.com/apps/

---

Nếu bạn chỉ muốn test app mà không cần OAuth, bỏ qua phần này! App vẫn chạy bình thường với email/password login. 🚀

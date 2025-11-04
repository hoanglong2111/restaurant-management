# 🚀 Hướng Dẫn Deploy Nhanh

## 📋 Chuẩn Bị

### 1. Tạo tài khoản (miễn phí):
- [ ] MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- [ ] Render: https://render.com (cho Backend)
- [ ] Vercel: https://vercel.com (cho Frontend)

---

## 🗄️ BƯỚC 1: Setup Database (MongoDB Atlas)

### 1.1. Tạo Database
1. Đăng ký MongoDB Atlas
2. Tạo cluster mới (FREE tier)
3. Tạo database user (username + password)
4. Whitelist IP: `0.0.0.0/0` (Allow all)

### 1.2. Lấy Connection String
1. Click "Connect" → "Connect your application"
2. Copy connection string:
```
mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/restaurant?retryWrites=true&w=majority
```
3. Thay `<password>` bằng password thật
4. Lưu lại để dùng sau

---

## 🖥️ BƯỚC 2: Deploy Backend (Render)

### 2.1. Push code lên GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2.2. Deploy trên Render
1. Đăng nhập Render bằng GitHub
2. Click **New** → **Web Service**
3. Connect repository của bạn
4. Cấu hình:
   - **Name**: `restaurant-backend`
   - **Root Directory**: `/` (để trống)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. **Environment Variables** (Click "Advanced"):

   **QUAN TRỌNG**: Thêm từng biến một, không copy cả block!

   | Key | Value |
   |-----|-------|
   | `PORT` | `5000` |
   | `MONGO_URI` | `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant` |
   | `JWT_SECRET` | `my_super_secret_jwt_key_change_this_12345` |
   | `NODE_ENV` | `production` |
   | `STRIPE_SECRET_KEY` | `sk_test_xxxxxxxxxxxxxxxx` |
   | `CLIENT_URL` | `http://localhost:3000` |

   **Lưu ý**:
   - Thay `username:password` bằng MongoDB Atlas credentials thật
   - `CLIENT_URL` sẽ cập nhật sau khi deploy frontend
   - `JWT_SECRET` nên dùng chuỗi random mạnh (ít nhất 32 ký tự)

6. Click **Create Web Service**

7. Đợi 5-10 phút để deploy

8. Copy URL backend:
   ```
   https://restaurant-backend-xxxx.onrender.com
   ```

---

## 🎨 BƯỚC 3: Deploy Frontend (Vercel)

### 3.1. Cập nhật API URL

Tạo file `client/.env.production`:
```env
REACT_APP_API_URL=https://restaurant-backend-xxxx.onrender.com
```

### 3.2. Commit changes
```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

### 3.3. Deploy trên Vercel

#### Cách 1: Qua Dashboard (Dễ hơn)
1. Đăng nhập Vercel bằng GitHub
2. Click **New Project**
3. Import repository của bạn
4. Cấu hình:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://restaurant-backend-xxxx.onrender.com
   ```

6. Click **Deploy**

7. Đợi 2-3 phút

8. Copy URL frontend:
   ```
   https://restaurant-app-xxxx.vercel.app
   ```

#### Cách 2: Qua CLI (Nhanh hơn)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd client
vercel --prod
```

---

## 🔄 BƯỚC 4: Cập Nhật CORS (QUAN TRỌNG!)

### 4.1. Cập nhật Backend với Frontend URL

**Sau khi deploy frontend xong**, bạn cần cập nhật `CLIENT_URL`:

1. Vào **Render Dashboard**
2. Chọn service `restaurant-backend`
3. Click **Environment** (menu bên trái)
4. Tìm biến `CLIENT_URL`
5. Click **Edit**
6. Thay đổi từ:
   ```
   CLIENT_URL=http://localhost:3000
   ```
   Thành:
   ```
   CLIENT_URL=https://restaurant-app-xxxx.vercel.app
   ```
   (Thay `xxxx` bằng URL thật của bạn)

7. Click **Save Changes**
8. Service sẽ tự động **redeploy** (~2-3 phút)

### 4.2. Kiểm tra CORS hoạt động

1. Mở frontend URL
2. F12 → Console
3. Không có lỗi CORS là OK! ✅

---

## ✅ BƯỚC 5: Test

### 5.1. Mở Frontend
```
https://restaurant-app-xxxx.vercel.app
```

### 5.2. Test các tính năng:
- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập
- [ ] Xem menu
- [ ] Thêm vào giỏ hàng
- [ ] Đặt chỗ
- [ ] Xem bàn
- [ ] Admin login (nếu có)

### 5.3. Kiểm tra Console
- F12 → Console
- Không có lỗi CORS
- API calls thành công

---

## 🐛 Troubleshooting

### Lỗi CORS
```
Access-Control-Allow-Origin error
```
**Fix**: Cập nhật `CLIENT_URL` trong Render env vars

### Backend không start
```
Application failed to respond
```
**Fix**: 
1. Check Render logs
2. Kiểm tra `MONGO_URI` đúng chưa
3. Kiểm tra MongoDB Atlas IP whitelist

### Frontend không connect được Backend
```
Network Error
```
**Fix**:
1. Kiểm tra `REACT_APP_API_URL` đúng chưa
2. Kiểm tra backend đã deploy thành công chưa
3. Test API trực tiếp: `https://backend-url.onrender.com/api/menu`

### MongoDB connection failed
```
MongoNetworkError
```
**Fix**:
1. Kiểm tra username/password
2. Kiểm tra IP whitelist (phải là 0.0.0.0/0)
3. Kiểm tra connection string format

---

## 📊 URLs Sau Khi Deploy

### Backend (Render)
```
https://restaurant-backend-xxxx.onrender.com
```

### Frontend (Vercel)
```
https://restaurant-app-xxxx.vercel.app
```

### Database (MongoDB Atlas)
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant
```

---

## 🔄 Update Code Sau Này

### Update Backend
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render tự động deploy
```

### Update Frontend
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel tự động deploy
```

### Hoặc deploy manual
```bash
cd client
vercel --prod
```

---

## 💰 Chi Phí

### FREE TIER:
- MongoDB Atlas: 512MB (đủ dùng)
- Render: 750 hours/month (đủ 1 app)
- Vercel: Unlimited (miễn phí)

**Tổng: $0/month** ✅

---

## 📞 Cần Giúp?

### Check Logs:
- **Render**: Dashboard → Logs
- **Vercel**: Dashboard → Deployments → View Logs
- **MongoDB**: Atlas → Metrics

### Common Issues:
1. CORS error → Update CLIENT_URL
2. 404 error → Check API routes
3. 500 error → Check backend logs
4. Database error → Check MongoDB connection

---

## 🎉 Hoàn Thành!

Bạn đã deploy thành công app fullstack lên internet!

**Share link với bạn bè:**
```
https://restaurant-app-xxxx.vercel.app
```

**Chúc mừng! 🎊**


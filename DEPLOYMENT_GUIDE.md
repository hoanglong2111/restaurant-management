# 🚀 Hướng Dẫn Deploy Restaurant Management App

## 📋 Tổng Quan

App của bạn có:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React
- **Database**: MongoDB

## 🎯 OPTION 1: Deploy Riêng Biệt (KHUYẾN NGHỊ)

### Ưu điểm:
- ✅ Dễ quản lý
- ✅ Scale độc lập
- ✅ Free tier tốt hơn
- ✅ Performance tốt hơn

### Kiến trúc:
```
Frontend (Vercel/Netlify)
    ↓ API calls
Backend (Render/Railway)
    ↓ Database
MongoDB Atlas (Free)
```

---

## 📦 BƯỚC 1: Chuẩn Bị Backend

### 1.1. Tạo file `.env` cho production

Tạo file `.env.production` trong thư mục `server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_key_here
NODE_ENV=production
STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=https://your-frontend-url.vercel.app
```

### 1.2. Cập nhật `server.js` để hỗ trợ CORS

Kiểm tra file `server/server.js` có CORS config:

```javascript
const cors = require('cors');

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
```

### 1.3. Tạo file `Procfile` (cho Heroku)

Tạo file `Procfile` trong thư mục `server/`:

```
web: node server.js
```

### 1.4. Cập nhật `package.json` trong `server/`

Thêm scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

---

## 🗄️ BƯỚC 2: Setup MongoDB Atlas (Database)

### 2.1. Tạo tài khoản MongoDB Atlas

1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Đăng ký tài khoản miễn phí
3. Tạo cluster mới (chọn FREE tier)

### 2.2. Lấy Connection String

1. Click "Connect" → "Connect your application"
2. Copy connection string:
```
mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/restaurant?retryWrites=true&w=majority
```
3. Thay `<password>` bằng password thật

### 2.3. Whitelist IP

1. Network Access → Add IP Address
2. Chọn "Allow Access from Anywhere" (0.0.0.0/0)

---

## 🖥️ BƯỚC 3: Deploy Backend lên Render

### 3.1. Tạo tài khoản Render

1. Truy cập: https://render.com
2. Đăng ký bằng GitHub

### 3.2. Deploy Backend

1. **New** → **Web Service**
2. Connect GitHub repository
3. Chọn repository của bạn
4. Cấu hình:
   - **Name**: `restaurant-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

5. **Environment Variables**:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_secret_key
   NODE_ENV=production
   STRIPE_SECRET_KEY=sk_test_...
   CLIENT_URL=https://your-frontend.vercel.app
   ```

6. Click **Create Web Service**

7. Đợi deploy xong, copy URL:
   ```
   https://restaurant-backend.onrender.com
   ```

---

## 🎨 BƯỚC 4: Chuẩn Bị Frontend

### 4.1. Tạo file `.env.production` trong `client/`

```env
REACT_APP_API_URL=https://restaurant-backend.onrender.com
```

### 4.2. Cập nhật `axiosInstance.js`

File `client/src/components/axiosInstance.js`:

```javascript
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
```

### 4.3. Build Frontend

```bash
cd client
npm run build
```

Folder `build/` sẽ được tạo ra.

---

## 🌐 BƯỚC 5: Deploy Frontend lên Vercel

### 5.1. Tạo tài khoản Vercel

1. Truy cập: https://vercel.com
2. Đăng ký bằng GitHub

### 5.2. Deploy Frontend

#### Cách 1: Qua Vercel Dashboard

1. **New Project**
2. Import GitHub repository
3. Cấu hình:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://restaurant-backend.onrender.com
   ```

5. Click **Deploy**

#### Cách 2: Qua Vercel CLI

```bash
cd client
npm install -g vercel
vercel login
vercel --prod
```

### 5.3. Lấy URL Frontend

Sau khi deploy xong:
```
https://restaurant-app.vercel.app
```

---

## 🔄 BƯỚC 6: Cập Nhật CORS và URLs

### 6.1. Cập nhật Backend CORS

Vào Render Dashboard → Environment Variables:

```
CLIENT_URL=https://restaurant-app.vercel.app
```

Redeploy backend.

### 6.2. Test API

Mở browser console trên frontend, test API call:

```javascript
fetch('https://restaurant-backend.onrender.com/api/menu')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 🎯 OPTION 2: Deploy Cùng Nhau (Render)

### Cấu trúc:
```
Backend serve Frontend build files
```

### Bước 1: Build Frontend

```bash
cd client
npm run build
```

### Bước 2: Cập nhật `server.js`

Thêm vào cuối file `server/server.js`:

```javascript
const path = require('path');

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}
```

### Bước 3: Tạo `build.sh`

Tạo file `build.sh` trong root:

```bash
#!/bin/bash
cd client
npm install
npm run build
cd ../server
npm install
```

### Bước 4: Deploy lên Render

1. **New** → **Web Service**
2. Cấu hình:
   - **Build Command**: `bash build.sh`
   - **Start Command**: `cd server && node server.js`
   - **Root Directory**: `/`

---

## 📝 Checklist Deploy

### Backend
- [ ] MongoDB Atlas setup
- [ ] Environment variables configured
- [ ] CORS configured
- [ ] Backend deployed
- [ ] API endpoints working

### Frontend
- [ ] API URL updated
- [ ] Build successful
- [ ] Frontend deployed
- [ ] Can connect to backend

### Testing
- [ ] Login/Register works
- [ ] Menu loads
- [ ] Orders work
- [ ] Reservations work
- [ ] Admin panel works

---

## 🐛 Troubleshooting

### CORS Error
```
Access to fetch at 'https://backend.com' from origin 'https://frontend.com' 
has been blocked by CORS policy
```

**Fix**: Cập nhật `CLIENT_URL` trong backend env vars.

### API Not Found (404)
```
GET https://backend.com/api/menu 404
```

**Fix**: Kiểm tra backend đã deploy đúng routes chưa.

### MongoDB Connection Error
```
MongoNetworkError: failed to connect to server
```

**Fix**: 
1. Kiểm tra MongoDB Atlas IP whitelist
2. Kiểm tra connection string
3. Kiểm tra username/password

### Build Failed
```
npm ERR! code ELIFECYCLE
```

**Fix**: 
1. Xóa `node_modules` và `package-lock.json`
2. `npm install` lại
3. `npm run build`

---

## 💰 Chi Phí

### Free Tier:
- **MongoDB Atlas**: 512MB free
- **Render**: 750 hours/month free
- **Vercel**: Unlimited deployments free
- **Total**: $0/month

### Paid (nếu cần):
- **MongoDB Atlas**: $9/month (2GB)
- **Render**: $7/month (512MB RAM)
- **Vercel**: Free (đủ dùng)

---

## 🔐 Bảo Mật

### 1. Environment Variables
- Không commit `.env` files
- Dùng platform env vars

### 2. JWT Secret
- Dùng secret key mạnh
- Không share public

### 3. MongoDB
- Whitelist IP cụ thể (nếu có thể)
- Dùng strong password

### 4. HTTPS
- Render/Vercel tự động có SSL
- Luôn dùng HTTPS

---

## 📊 Monitoring

### Render Dashboard
- View logs
- Monitor CPU/Memory
- Check uptime

### Vercel Dashboard
- View deployments
- Check analytics
- Monitor errors

### MongoDB Atlas
- Monitor connections
- Check storage usage
- View slow queries

---

## 🚀 Deployment Commands

### Deploy Backend (Render)
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys
```

### Deploy Frontend (Vercel)
```bash
cd client
vercel --prod
```

### Redeploy Everything
```bash
git add .
git commit -m "Update app"
git push origin main
# Both auto-deploy
```

---

## 📞 Support

### Render
- Docs: https://render.com/docs
- Support: support@render.com

### Vercel
- Docs: https://vercel.com/docs
- Support: support@vercel.com

### MongoDB Atlas
- Docs: https://docs.atlas.mongodb.com
- Support: https://support.mongodb.com

---

**Chúc bạn deploy thành công! 🎉**


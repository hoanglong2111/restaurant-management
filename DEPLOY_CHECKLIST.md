# ✅ Deploy Checklist - Restaurant Management System

## 📋 Pre-Deployment Checklist

### Code Preparation
- [ ] All code committed to GitHub
- [ ] `.env` files NOT committed (check `.gitignore`)
- [ ] No console.logs in production code
- [ ] All dependencies in `package.json`
- [ ] Code tested locally

### Environment Files
- [ ] `server/.env.example` exists
- [ ] `client/.env.example` exists
- [ ] `.gitignore` includes `.env` files

---

## 🗄️ Step 1: MongoDB Atlas Setup

### Account & Cluster
- [ ] MongoDB Atlas account created
- [ ] Free tier cluster created (M0)
- [ ] Cluster name noted: `_________________`

### Database User
- [ ] Database user created
- [ ] Username: `_________________`
- [ ] Password saved securely: `_________________`

### Network Access
- [ ] IP Whitelist configured
- [ ] Added `0.0.0.0/0` (Allow from anywhere)

### Connection String
- [ ] Connection string copied
- [ ] Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant`
- [ ] Password replaced in string
- [ ] Connection string saved: `_________________`

### Test Connection
- [ ] Tested connection locally
- [ ] Database `restaurant` created
- [ ] Collections visible in Atlas

---

## 🖥️ Step 2: Backend Deployment (Render)

### Account Setup
- [ ] Render account created
- [ ] GitHub connected to Render

### Service Configuration
- [ ] New Web Service created
- [ ] Repository connected
- [ ] Service name: `restaurant-backend`
- [ ] Root Directory: `/` (empty)
- [ ] Environment: `Node`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Instance Type: `Free`

### Environment Variables Set
- [ ] `PORT` = `5000`
- [ ] `MONGO_URI` = `mongodb+srv://...` (from Step 1)
- [ ] `JWT_SECRET` = `your_random_secret_key_min_32_chars`
- [ ] `NODE_ENV` = `production`
- [ ] `STRIPE_SECRET_KEY` = `sk_test_...` (your Stripe key)
- [ ] `CLIENT_URL` = `http://localhost:3000` (temporary)

### Deployment
- [ ] Service deployed successfully
- [ ] No errors in logs
- [ ] Backend URL noted: `_________________`
- [ ] Health check works: `https://your-backend.onrender.com/api/health`

### Test Backend API
- [ ] Open: `https://your-backend.onrender.com/`
- [ ] Should see: `{"message":"Restaurant Management API","status":"running"}`
- [ ] Test menu endpoint: `https://your-backend.onrender.com/api/menu`

---

## 🎨 Step 3: Frontend Deployment (Vercel)

### Environment File
- [ ] Created `client/.env.production`
- [ ] Added: `REACT_APP_API_URL=https://your-backend.onrender.com`
- [ ] Committed to GitHub

### Account Setup
- [ ] Vercel account created
- [ ] GitHub connected to Vercel

### Project Configuration
- [ ] New Project created
- [ ] Repository imported
- [ ] Framework: `Create React App`
- [ ] Root Directory: `client`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `build`

### Environment Variables
- [ ] `REACT_APP_API_URL` = `https://your-backend.onrender.com`

### Deployment
- [ ] Project deployed successfully
- [ ] No build errors
- [ ] Frontend URL noted: `_________________`

### Test Frontend
- [ ] Website loads
- [ ] No console errors (F12)
- [ ] Can see menu page
- [ ] Images load correctly

---

## 🔄 Step 4: CORS Update (CRITICAL!)

### Update Backend
- [ ] Go to Render Dashboard
- [ ] Select `restaurant-backend`
- [ ] Environment → Edit
- [ ] Update `CLIENT_URL` to: `https://your-frontend.vercel.app`
- [ ] Save Changes
- [ ] Wait for redeploy (~2-3 minutes)

### Verify CORS
- [ ] Open frontend URL
- [ ] F12 → Console
- [ ] No CORS errors
- [ ] API calls working

---

## 🧪 Step 5: Full Testing

### User Features
- [ ] Register new account works
- [ ] Login works
- [ ] Logout works
- [ ] View menu works
- [ ] Add to cart works
- [ ] View cart works
- [ ] Make reservation works
- [ ] View reservations works
- [ ] View tables works
- [ ] Profile page works

### Admin Features (if applicable)
- [ ] Admin login works
- [ ] Dashboard loads
- [ ] Charts display correctly
- [ ] Manage menu works (CRUD)
- [ ] Manage tables works (CRUD)
- [ ] Manage orders works
- [ ] Manage reservations works
- [ ] Manage users works

### Payment (if testing)
- [ ] Stripe checkout opens
- [ ] Test payment works
- [ ] Order created in database

### Mobile Testing
- [ ] Resize browser to mobile (≤768px)
- [ ] Fixed header works
- [ ] Tables scroll horizontally
- [ ] Forms are usable
- [ ] Buttons work
- [ ] Navigation works

---

## 📊 Step 6: Monitoring Setup

### Render
- [ ] Logs accessible
- [ ] No errors in logs
- [ ] Service status: Running

### Vercel
- [ ] Deployment successful
- [ ] Analytics enabled (optional)
- [ ] No errors in logs

### MongoDB Atlas
- [ ] Connections visible
- [ ] Data being written
- [ ] Storage usage normal

---

## 🐛 Troubleshooting Checklist

### CORS Errors
- [ ] `CLIENT_URL` matches frontend URL exactly
- [ ] No trailing slash in URLs
- [ ] Backend redeployed after CORS update

### API Not Working
- [ ] Backend URL correct in frontend env
- [ ] Backend service running on Render
- [ ] MongoDB connection successful
- [ ] Check Render logs for errors

### Frontend Not Loading
- [ ] Build successful on Vercel
- [ ] No errors in Vercel logs
- [ ] Environment variables set correctly
- [ ] Check browser console for errors

### Database Errors
- [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- [ ] Connection string correct
- [ ] Username/password correct
- [ ] Database name is `restaurant`

### Payment Not Working
- [ ] Stripe key is correct
- [ ] Using test key for testing
- [ ] Stripe webhook configured (if needed)

---

## 📝 Post-Deployment

### Documentation
- [ ] Update README.md with live URLs
- [ ] Document any deployment issues
- [ ] Note any configuration changes

### URLs to Save
```
Frontend: https://___________________________
Backend:  https://___________________________
Database: mongodb+srv://___________________
```

### Credentials to Save Securely
```
MongoDB Username: ___________________________
MongoDB Password: ___________________________
JWT Secret:       ___________________________
Stripe Secret:    ___________________________
```

### Share
- [ ] Test with friends/colleagues
- [ ] Get feedback
- [ ] Fix any issues found

---

## 🔄 Future Updates

### Update Backend
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys
```

### Update Frontend
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys
```

### Manual Redeploy
- **Render**: Dashboard → Manual Deploy
- **Vercel**: Dashboard → Redeploy

---

## 💰 Cost Tracking

### Free Tier Limits
- [ ] MongoDB Atlas: 512MB storage
- [ ] Render: 750 hours/month
- [ ] Vercel: Unlimited deployments

### Monitor Usage
- [ ] Check MongoDB storage weekly
- [ ] Check Render hours monthly
- [ ] Upgrade if needed

---

## ✅ Deployment Complete!

**Congratulations! Your app is live! 🎉**

**Frontend URL**: `_________________`

**Share with the world!** 🌍

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Stripe Docs**: https://stripe.com/docs

---

**Date Deployed**: _______________

**Deployed By**: _______________

**Notes**:
```
_________________________________________________
_________________________________________________
_________________________________________________
```


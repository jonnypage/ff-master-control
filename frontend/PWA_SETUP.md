# PWA Setup Guide - Testing on Your Phone

## Quick Start: Deploy to Vercel (Recommended)

### 1. Create Environment Variable
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=https://ff-master-control-production.up.railway.app/graphql
```

### 2. Create PWA Icons (Required)
You need to create two icon files in `frontend/public/`:
- `pwa-192x192.png` (192x192 pixels)
- `pwa-512x512.png` (512x512 pixels)

You can:
- Use an online icon generator (search "PWA icon generator")
- Create simple icons with any image editor
- Use a placeholder image for now (the app will still work)

### 3. Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
cd frontend
npm install -g vercel
vercel
```
Follow the prompts. When asked about environment variables, add:
- `VITE_API_URL` = `https://ff-master-control-production.up.railway.app/graphql`

**Option B: Using GitHub + Vercel Dashboard**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Set root directory to `frontend`
6. Add environment variable:
   - Name: `VITE_API_URL`
   - Value: `https://ff-master-control-production.up.railway.app/graphql`
7. Click "Deploy"

### 4. Install PWA on Your Phone

**Android:**
1. Open the deployed URL in Chrome
2. Tap the menu (3 dots) → "Install app" or "Add to Home screen"
3. The app will install as a PWA

**iOS:**
1. Open the deployed URL in Safari
2. Tap the Share button → "Add to Home Screen"
3. The app will appear on your home screen

---

## Alternative: Test Locally on Your Phone

### 1. Find Your Computer's Local IP
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Or use
ipconfig getifaddr en0  # macOS
```

### 2. Start Dev Server with Network Access
```bash
cd frontend
npm run dev -- --host
```

### 3. Create .env File
```env
VITE_API_URL=https://ff-master-control-production.up.railway.app/graphql
```

### 4. Access from Phone
1. Make sure your phone is on the same Wi-Fi network
2. Open browser on phone and go to: `http://YOUR_LOCAL_IP:5173`
   (Replace YOUR_LOCAL_IP with the IP from step 1, usually something like `192.168.1.100`)

**Note:** Local testing won't work as a PWA (no HTTPS), but you can test functionality.

---

## Troubleshooting

### PWA Not Installing?
- Make sure you're using HTTPS (required for PWA)
- Check that icons exist in `public/` folder
- Try clearing browser cache

### Can't Connect to Backend?
- Verify `VITE_API_URL` is set correctly
- Check that Railway backend is running
- Test the GraphQL endpoint in a browser first

### Team login not working?
- Verify you’re using the correct **Team GUID** and **4-digit PIN**
- Make sure the backend URL (`VITE_API_URL`) is reachable from your device


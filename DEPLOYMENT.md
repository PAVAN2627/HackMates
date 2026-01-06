# 🚀 HackMates Deployment Guide

This guide will help you deploy HackMates to various platforms. The recommended deployment platform is **Vercel** for its seamless integration with React applications.

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ Firebase project set up with Firestore, Authentication, and Storage
- ✅ All environment variables configured
- ✅ Project built and tested locally
- ✅ GitHub repository with latest code

---

## 🌟 Deploy to Vercel (Recommended)

### Step 1: Prepare Your Repository
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Connect to Vercel
1. Visit [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository: `PAVAN2627/HackMates`
4. Vercel will automatically detect it as a Vite project

### Step 3: Configure Environment Variables
In Vercel dashboard, add these environment variables:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 4: Deploy
1. Click "Deploy"
2. Vercel will build and deploy automatically
3. Your app will be live at `https://hackmates-xxx.vercel.app`

### Step 5: Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

---

## 🔥 Deploy to Firebase Hosting

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login and Initialize
```bash
firebase login
firebase init hosting
```

### Step 3: Configure firebase.json
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Step 4: Build and Deploy
```bash
npm run build
firebase deploy
```

---

## 🌐 Deploy to Netlify

### Step 1: Build the Project
```bash
npm run build
```

### Step 2: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Step 3: Configure Environment Variables
In Netlify dashboard:
1. Go to Site Settings → Environment Variables
2. Add all Firebase configuration variables

### Step 4: Configure Redirects
Create `public/_redirects`:
```
/*    /index.html   200
```

---

## ⚙️ Environment Configuration

### Firebase Setup
1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Authentication, Firestore, and Storage

2. **Configure Authentication**
   - Enable Email/Password provider
   - Set up authorized domains

3. **Set up Firestore**
   - Create database in production mode
   - Configure security rules (see below)

4. **Configure Storage**
   - Create storage bucket
   - Set up security rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read all profiles but only edit their own
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Hackathons are readable by all, writable by authenticated users
    match /hackathons/{hackathonId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.creatorId || 
         request.auth.uid in resource.data.teamMembers);
    }
    
    // Messages are private between sender and recipient
    match /directMessages/{messageId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || 
         request.auth.uid == resource.data.recipientId);
    }
    
    // Chat messages are readable by hackathon members
    match /hackathonChat/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Announcements are readable by all, writable by hackathon creators
    match /announcements/{announcementId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

### Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User avatars
    match /user-avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 2 * 1024 * 1024; // 2MB limit
    }
    
    // Hackathon images
    match /hackathon-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
  }
}
```

---

## 🔧 Build Configuration

### Vite Configuration
The project uses Vite with the following optimizations:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  }
})
```

### Performance Optimizations
- Code splitting by routes
- Lazy loading of components
- Image optimization
- Bundle size optimization
- Caching strategies

---

## 📊 Monitoring & Analytics

### Vercel Analytics
Enable Vercel Analytics for performance monitoring:
1. Go to Project Settings → Analytics
2. Enable Web Analytics
3. Monitor Core Web Vitals

### Firebase Analytics
Add Firebase Analytics for user behavior:
```typescript
// Add to firebase.ts
import { getAnalytics } from 'firebase/analytics';
export const analytics = getAnalytics(app);
```

---

## 🚨 Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Environment Variables Not Working**
- Ensure variables start with `VITE_`
- Check spelling and values
- Restart development server

**Firebase Connection Issues**
- Verify Firebase configuration
- Check network connectivity
- Ensure Firebase services are enabled

**Routing Issues on Deployment**
- Configure redirects for SPA
- Ensure `_redirects` or `vercel.json` is configured

### Performance Issues
- Enable gzip compression
- Optimize images
- Use CDN for static assets
- Implement caching headers

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📈 Post-Deployment Checklist

- [ ] ✅ Application loads correctly
- [ ] ✅ Authentication works
- [ ] ✅ Database operations function
- [ ] ✅ File uploads work
- [ ] ✅ Real-time features active
- [ ] ✅ Mobile responsiveness
- [ ] ✅ Theme switching works
- [ ] ✅ All routes accessible
- [ ] ✅ Error handling works
- [ ] ✅ Performance is acceptable

---

## 🎉 Success!

Your HackMates application is now live! 🚀

**Next Steps:**
1. Share the URL with your community
2. Monitor performance and user feedback
3. Set up analytics and monitoring
4. Plan future feature releases

**Support:**
- Check the [GitHub Issues](https://github.com/PAVAN2627/HackMates/issues) for help
- Review the [Documentation](DOCUMENTATION.md)
- Contact the development team

---

*Happy Deploying! 🎯*
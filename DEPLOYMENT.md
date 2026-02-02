# Deployment Guide for Recalla PWA

## Quick Start (Local)

Simply open `index.html` in any modern web browser. No build process or dependencies required!

## Deploy to GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" section
3. Select the branch containing your code (e.g., `main` or `copilot/add-word-learning-pwa`)
4. Select root directory `/`
5. Click "Save"
6. Your app will be available at: `https://yourusername.github.io/Recalla/`

## Deploy to Netlify

1. Sign up at [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Build settings:
   - Build command: (leave empty)
   - Publish directory: `/` (root)
5. Click "Deploy site"

## Deploy to Vercel

1. Sign up at [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Build settings:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
5. Click "Deploy"

## Deploy to Any Static Host

Since this is a static PWA with no backend, you can deploy to any static hosting service:

- **Cloudflare Pages**
- **Firebase Hosting**
- **AWS S3 + CloudFront**
- **Azure Static Web Apps**
- **Surge.sh**

Just upload all the files to the root directory of your hosting service.

## Install as PWA

Once deployed, users can install the app:

### On Desktop (Chrome/Edge):
1. Open the deployed website
2. Click the install icon in the address bar (⊕)
3. Click "Install"

### On Mobile (Android):
1. Open the website in Chrome
2. Tap the menu (⋮)
3. Tap "Install app" or "Add to Home screen"

### On iOS:
1. Open the website in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

## Requirements

- No server-side requirements
- No build process
- No dependencies to install
- Works entirely in the browser

## Testing Locally

You can test the PWA features locally using:

```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080

# Node.js (with npx)
npx http-server -p 8080

# PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

## HTTPS Requirement

PWA features (service worker, installation) require HTTPS in production. All the hosting services listed above provide HTTPS automatically.

## Browser Cache

If you update the app, users may need to:
1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear cache and reload
3. Or update the `CACHE_NAME` in `sw.js` to force cache update

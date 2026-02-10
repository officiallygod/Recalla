# Cache Clearing Guide for Recalla

If you're not seeing the latest UI updates after a deployment, you may need to clear your browser cache and service worker. This guide will help you do that.

## Why This Happens

Recalla is a Progressive Web App (PWA) that uses service workers to cache files for offline use. Sometimes, these cached files need to be manually cleared to see the latest updates.

## Quick Fix (Works for Most Users)

### On Desktop Browsers (Chrome, Edge, Brave)

1. Open the app: `https://officiallygod.github.io/Recalla/`
2. Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac) to hard refresh
3. If that doesn't work:
   - Press `F12` to open DevTools
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

### On Mobile Browsers

**Chrome on Android:**
1. Open Chrome Settings (three dots menu)
2. Go to "Site settings"
3. Find and tap on "officiallygod.github.io"
4. Tap "Clear & reset"
5. Close and reopen the app

**Safari on iOS:**
1. Go to Settings → Safari
2. Tap "Clear History and Website Data"
3. Confirm
4. Reopen the app

## Advanced: Unregister Service Worker

If the above doesn't work, you can manually unregister the service worker:

### Desktop Browsers

1. Open DevTools (`F12` or right-click → Inspect)
2. Go to the "Application" tab (Chrome/Edge) or "Storage" tab (Firefox)
3. Click "Service Workers" in the left sidebar
4. Find the Recalla service worker
5. Click "Unregister"
6. Close DevTools
7. Hard refresh the page (`Ctrl + Shift + R` or `Cmd + Shift + R`)

### Mobile Chrome

1. Visit `chrome://serviceworker-internals/`
2. Find entries for `officiallygod.github.io`
3. Click "Unregister" for each one
4. Close and reopen the app

## For PWA Installed App

If you installed Recalla as a PWA (added to home screen):

### Desktop
1. Uninstall the PWA:
   - Click the three dots in the app window
   - Select "Uninstall Recalla"
2. Clear browser cache as described above
3. Reinstall the PWA

### Mobile
1. Long-press the app icon
2. Select "App info" or "Remove"
3. Uninstall the app
4. Clear browser data as described above
5. Visit the website again and reinstall

## Verification

After clearing cache, you should see:
- Latest UI changes
- Updated features
- New components and screens

## For Developers

If you're a developer and need to ensure users see the latest version:

1. The `vite.config.js` now includes `registerType: 'autoUpdate'` for automatic service worker updates
2. The manifest paths have been corrected to match the deployment base path (`/Recalla/`)
3. Service worker uses workbox for better caching strategies
4. Each build generates new file hashes, which forces cache invalidation

### Testing Locally

```bash
npm run build
npm run preview
```

Then test in an incognito/private window to see the fresh version.

## Still Having Issues?

If you're still seeing the old UI after trying all the above:

1. Try a different browser
2. Make sure you're visiting the correct URL: `https://officiallygod.github.io/Recalla/`
3. Check if the deployment completed successfully in GitHub Actions
4. Wait 5-10 minutes after deployment for CDN caches to clear
5. Open an issue on GitHub with your browser version and device details

## Prevention

To avoid cache issues in the future:

- The app will automatically update in the background when a new version is deployed
- You'll see a notification to reload when an update is available
- Regular browser use (not PWA) gets updates faster
- Developers: ensure `base: '/Recalla/'` matches deployment path in `vite.config.js`

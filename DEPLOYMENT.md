# Deployment Guide for Recalla PWA

## Development

```bash
npm install          # Install dependencies
npm run dev         # Start development server (http://localhost:5173)
npm run build       # Build for production
npm run preview     # Preview production build
```

## Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up
3. Click "New Project" and import your repository
4. Vercel will auto-detect Vite - just click "Deploy"

That's it! Vercel will:
- Build your app automatically
- Provide HTTPS
- Enable PWA features
- Give you a live URL

## Deploy to Netlify

1. Sign up at [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

## Deploy to GitHub Pages

1. Install the gh-pages package:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/Recalla",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Update `vite.config.js`:
```js
export default defineConfig({
  base: '/Recalla/',
  // ... rest of config
})
```

4. Deploy:
```bash
npm run deploy
```

## Deploy to Cloudflare Pages

1. Sign up at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: 18 or higher
4. Deploy

## Deploy to Any Static Host

Build the app:
```bash
npm run build
```

Upload the contents of the `dist/` folder to your hosting:
- AWS S3 + CloudFront
- Firebase Hosting
- Azure Static Web Apps
- DigitalOcean App Platform
- Railway
- Render

## Environment Variables

If you add environment variables later (for API keys, etc.), create a `.env` file:

```
VITE_API_URL=your_api_url
VITE_API_KEY=your_api_key
```

Access in code:
```js
const apiUrl = import.meta.env.VITE_API_URL
```

## HTTPS Requirement

PWA features (service worker, installation) require HTTPS in production. All hosting services listed above provide HTTPS automatically.

## Testing Production Build Locally

```bash
npm run build
npm run preview
```

Open `http://localhost:4173` to test the production build locally.

## Custom Domain

Most hosting providers allow custom domains:

1. **Vercel**: Project Settings → Domains → Add
2. **Netlify**: Site Settings → Domain Management → Add custom domain
3. **Cloudflare**: Configure in Pages settings

## Performance Tips

1. **Image Optimization**: Use WebP format for images
2. **Code Splitting**: Vite handles this automatically
3. **Lazy Loading**: Use React.lazy() for route components
4. **Bundle Analysis**: Add `rollup-plugin-visualizer`

## Troubleshooting

### Build fails
- Ensure Node.js version is 18+
- Clear cache: `rm -rf node_modules dist && npm install`
- Check for TypeScript errors if using TS

### PWA not working
- Must be served over HTTPS (except localhost)
- Check service worker registration in DevTools
- Clear browser cache and reload

### Routing issues (404 on refresh)
Add a `_redirects` file (Netlify) or `vercel.json` (Vercel):

**Netlify** (`public/_redirects`):
```
/*    /index.html   200
```

**Vercel** (`vercel.json`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

## Cache Busting

Vite automatically adds content hashes to filenames for cache busting. When you deploy a new version:

1. Users will automatically get the latest version
2. Service worker will update in the background
3. No manual cache clearing needed

## Monitoring

Consider adding:
- Google Analytics
- Sentry for error tracking
- Web Vitals monitoring

## Updates

To update dependencies:
```bash
npm update
npm audit fix
```

For major version updates:
```bash
npx npm-check-updates -u
npm install
```


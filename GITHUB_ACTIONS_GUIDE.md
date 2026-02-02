# GitHub Actions Build & Deployment Guide

This guide explains how to use the GitHub Actions workflow to automatically build and deploy your Recalla app to GitHub Pages.

## 📋 What's Been Set Up

1. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
   - Automatically builds your app when you push to the `main` branch
   - Can also be triggered manually from the GitHub Actions tab
   - Deploys the built app to GitHub Pages

2. **Vite Configuration** (`vite.config.js`):
   - Updated with `base: '/Recalla/'` to work with GitHub Pages URLs

## 🚀 How to Enable GitHub Pages Hosting

Follow these steps to enable hosting on GitHub Pages:

### Step 1: Enable GitHub Pages in Repository Settings

1. Go to your GitHub repository: `https://github.com/officiallygod/Recalla`
2. Click on **Settings** (top menu)
3. In the left sidebar, click **Pages** (under "Code and automation")
4. Under **Source**, select **GitHub Actions** from the dropdown
5. Click **Save**

That's it! GitHub Pages is now configured to use the GitHub Actions workflow.

### Step 2: Trigger the First Deployment

You have two options:

**Option A: Push to main branch**
```bash
git push origin main
```

**Option B: Manually trigger the workflow**
1. Go to the **Actions** tab in your repository
2. Click on "Build and Deploy to GitHub Pages" workflow
3. Click **Run workflow** button
4. Select the `main` branch
5. Click **Run workflow**

### Step 3: Access Your Deployed App

Once the workflow completes (usually takes 1-3 minutes):

1. Go to the **Actions** tab to see the workflow progress
2. Once complete, your app will be available at:
   ```
   https://officiallygod.github.io/Recalla/
   ```

## 🔄 How It Works

### The Workflow Process

1. **Trigger**: The workflow runs when:
   - Code is pushed to the `main` branch
   - Manually triggered from the Actions tab

2. **Build Job**:
   - Checks out your code
   - Sets up Node.js version 20
   - Installs dependencies with `npm ci`
   - Builds the app with `npm run build`
   - Uploads the `dist` folder as an artifact

3. **Deploy Job**:
   - Takes the built artifact
   - Deploys it to GitHub Pages
   - Provides a URL to access the deployed app

### Directory Structure

```
Recalla/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── dist/                       # Build output (generated)
├── src/                        # Source code
├── public/                     # Static assets
├── vite.config.js              # Vite config (with GitHub Pages base)
└── package.json                # Dependencies and scripts
```

## 🛠️ Troubleshooting

### Build Fails

**Check the logs:**
1. Go to the **Actions** tab
2. Click on the failed workflow run
3. Click on the failed job to see detailed logs

**Common issues:**
- **Node version mismatch**: The workflow uses Node 20. Ensure your code is compatible.
- **Missing dependencies**: Make sure `package.json` and `package-lock.json` are up to date.
- **Build errors**: Run `npm run build` locally to catch build errors before pushing.

### Deployment Fails

**Check GitHub Pages settings:**
- Ensure Source is set to "GitHub Actions"
- Verify the workflow has necessary permissions

**Check workflow permissions:**
- Go to **Settings** → **Actions** → **General**
- Under "Workflow permissions", ensure "Read and write permissions" is enabled
- Or ensure the workflow has explicit permissions (already configured in `deploy.yml`)

### App Not Loading Correctly

**Check the base path:**
- The `vite.config.js` has `base: '/Recalla/'` 
- This must match your repository name
- If you rename the repository, update this value

**Check routing:**
- For a single-page app with routing, GitHub Pages may have issues
- The current setup should work, but if you have issues, check the DEPLOYMENT.md for solutions

### 404 Errors on Routes

If direct navigation to routes (e.g., `/Recalla/game`) gives 404:

1. Add a `404.html` in the `public` folder that redirects to `index.html`
2. Or use hash-based routing in React Router

## 🔧 Customization

### Change the Deployment Branch

Edit `.github/workflows/deploy.yml`:
```yaml
on:
  push:
    branches: [ your-branch-name ]  # Change 'main' to your branch
```

### Add Build Checks

Add additional steps before deployment (linting, testing, etc.):
```yaml
- name: Run tests
  run: npm test

- name: Run linter
  run: npm run lint
```

### Deploy to Different Branch

To deploy from a different branch or to a different environment:
1. Create a new workflow file
2. Change the branch trigger
3. Optionally use different environment names

## 📊 Monitoring Deployments

### View Deployment History

1. Go to **Settings** → **Pages**
2. Scroll down to see "Recent deployments"
3. Each deployment shows timestamp and commit

### View Workflow Runs

1. Go to **Actions** tab
2. See all workflow runs with status
3. Click any run to see detailed logs

## 🌐 Using a Custom Domain

Want to use your own domain instead of `officiallygod.github.io/Recalla`?

1. Go to **Settings** → **Pages**
2. Under "Custom domain", enter your domain (e.g., `recalla.yourdomain.com`)
3. Follow GitHub's instructions to configure DNS
4. Update `vite.config.js`:
   ```js
   base: '/',  // Change from '/Recalla/' to '/'
   ```

## 🔒 Security Notes

- The workflow uses official GitHub Actions with specific versions
- `npm ci` is used instead of `npm install` for reproducible builds
- The workflow has minimal permissions (only what's needed)
- No secrets or API keys are exposed

## 💡 Tips

1. **Test locally first**: Always run `npm run build` locally before pushing
2. **Check Actions tab**: Monitor your workflows after pushing
3. **Use branches**: Test changes in feature branches before merging to main
4. **Cache benefits**: The workflow caches npm dependencies for faster builds

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Documentation](https://vitejs.dev/)
- [Deploying Vite Apps](https://vitejs.dev/guide/static-deploy.html)

## 🎉 Next Steps

After successful deployment:

1. ✅ Visit your deployed app at `https://officiallygod.github.io/Recalla/`
2. ✅ Test all features to ensure everything works
3. ✅ Share the link with users
4. ✅ Set up a custom domain (optional)
5. ✅ Add monitoring/analytics (optional)

## ❓ Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review the workflow logs in the Actions tab
3. Ensure all prerequisites are met
4. Test the build locally with `npm run build`

Happy deploying! 🚀

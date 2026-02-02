# GitHub Actions Workflows

This directory contains automated workflows for the Recalla project.

## 📁 Workflows

### `deploy.yml` - Build and Deploy to GitHub Pages

**Purpose:** Automatically build and deploy the Recalla PWA to GitHub Pages.

**Triggers:**
- 🔄 Automatic: On every push to the `main` branch
- 🖱️ Manual: Can be triggered from the Actions tab

**What it does:**
1. ✅ Checks out the code
2. ✅ Sets up Node.js 20
3. ✅ Installs dependencies (`npm ci`)
4. ✅ Builds the production app (`npm run build`)
5. ✅ Deploys to GitHub Pages
6. ✅ Makes the app available at: `https://officiallygod.github.io/Recalla/`

**Status:** 
- Run time: ~2-3 minutes
- Free to run (GitHub Actions free tier)

---

## 🚀 How to Use

### First-time Setup:
1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save (if prompted)

### Automatic Deployment:
Just push to the `main` branch:
```bash
git push origin main
```

### Manual Deployment:
1. Go to the **Actions** tab
2. Click on "Build and Deploy to GitHub Pages"
3. Click **Run workflow**
4. Select the `main` branch
5. Click **Run workflow**

---

## 📊 Monitoring

### View Workflow Runs:
- Go to the **Actions** tab in the repository
- Click on "Build and Deploy to GitHub Pages"
- See all runs with their status

### View Logs:
- Click on any workflow run
- Click on the job name (Build or Deploy)
- View detailed logs for each step

---

## 🔧 Maintenance

### Update Node Version:
Edit `deploy.yml` line 33:
```yaml
node-version: '20'  # Change to desired version
```

### Change Deployment Branch:
Edit `deploy.yml` line 6:
```yaml
branches: [ main ]  # Change to your branch
```

### Add Build Steps:
Add steps before the "Build" step in `deploy.yml`:
```yaml
- name: Run tests
  run: npm test

- name: Run linter
  run: npm run lint
```

---

## 📚 Documentation

For complete documentation, see:
- **Quick Start**: [QUICK_START_DEPLOYMENT.md](../QUICK_START_DEPLOYMENT.md)
- **Detailed Guide**: [GITHUB_ACTIONS_GUIDE.md](../GITHUB_ACTIONS_GUIDE.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)

---

## 🔒 Security

- Uses official GitHub Actions
- Pinned to specific versions for security
- Minimal required permissions
- No secrets or credentials exposed
- CodeQL scanned and verified

---

## ⚡ Performance

- **Build time**: ~2.6 seconds
- **Total workflow**: 2-3 minutes
- **Output size**: 377.90 KiB
- **Deployments**: Unlimited (free tier)

---

## 🆘 Troubleshooting

### Build Fails
- Check the workflow logs in the Actions tab
- Verify `package.json` and `package-lock.json` are up to date
- Run `npm run build` locally to test

### Deployment Fails
- Ensure GitHub Pages is enabled with "GitHub Actions" as source
- Check workflow permissions in Settings → Actions → General
- Verify the workflow has completed the build job successfully

### App Not Loading
- Verify `vite.config.js` has `base: '/Recalla/'`
- Check that the deployment job completed successfully
- Wait 2-3 minutes after deployment for DNS propagation

---

**Need more help?** Check the [GITHUB_ACTIONS_GUIDE.md](../GITHUB_ACTIONS_GUIDE.md) troubleshooting section.

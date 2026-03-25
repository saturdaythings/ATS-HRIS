# Frontend Deployment Guide

Deploy the V.Two Ops React app to GitHub Pages or Vercel for free.

## Quick Start (2 minutes)

### Option 1: Deploy to Vercel (Easiest)

Vercel is the official Next.js/Vite host with zero-configuration deployment.

#### Steps:

1. **Sign up at [vercel.com](https://vercel.com)** (GitHub login recommended)

2. **Import project:**
   - Dashboard → "Add New..." → "Project"
   - Select your `vtwo-ops` GitHub repository
   - Vercel auto-detects React/Vite

3. **Configure build:**
   - **Root Directory:** `app` (where vite.config.js is)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - Leave everything else default

4. **Set environment variables:**
   - `VITE_API_URL`: Your deployed backend URL
     - Example: `https://vtwo-ops-api.railway.app`
   - Click "Deploy"

5. **Your frontend is live!**
   - Vercel assigns a URL like: `https://vtwo-ops.vercel.app`
   - Auto-deploys on git push to main

6. **Verify:**
   ```bash
   curl https://vtwo-ops.vercel.app/
   # Should load your React app
   ```

---

### Option 2: Deploy to GitHub Pages

Host your static app on GitHub for free (manual or automated).

#### Steps (Automated with Actions):

1. **Update `app/vite.config.js`:**
   ```javascript
   export default defineConfig({
     ...
     build: {
       outDir: '../dist',
       emptyOutDir: true,
     },
     // For GitHub Pages under a repo name
     base: '/vtwo-ops/',  // Change to your repo name if not main repo
   });
   ```

2. **Create GitHub Actions workflow:**
   - Create file: `.github/workflows/deploy-frontend.yml`
   - Copy content from [below](#github-actions-workflow-file)

3. **Create GitHub Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` and `workflow` permissions
   - Copy token

4. **Add to repo secrets:**
   - Go to repository → Settings → Secrets and variables → Actions
   - New secret: `GH_TOKEN` → paste your token

5. **Push to trigger deployment:**
   ```bash
   git push origin main
   ```
   - GitHub Actions automatically builds and deploys to GitHub Pages

6. **View your site:**
   - GitHub Pages URL: `https://your-username.github.io/vtwo-ops/`
   - Or check repo Settings → Pages to see live URL

---

## GitHub Actions Workflow File

Create `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: cd app && npm ci

      - name: Build
        run: cd app && npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GH_TOKEN }}
          publish_dir: ./dist
```

---

## Configuration for Your API

### Development (Local Testing)

1. **Leave `VITE_API_URL` empty in `.env.local`:**
   ```bash
   # app/.env.local
   VITE_API_URL=
   ```

2. **Vite proxy handles it:**
   - Requests to `/api/*` are proxied to `http://localhost:3001`
   - See `app/vite.config.js`

3. **Run both servers:**
   ```bash
   # Terminal 1: Backend
   npm start

   # Terminal 2: Frontend
   cd app && npm run dev
   ```

4. **Access at:** `http://localhost:5173`

---

### Production (Deployed)

#### For Vercel:

1. **Set environment variable:**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Add `VITE_API_URL`: `https://your-backend-url.railway.app`

2. **Redeploy:**
   - Click "Redeploy" in Vercel dashboard
   - Or push to main (if auto-deploy enabled)

#### For GitHub Pages:

1. **Set secret in repo:**
   - Settings → Secrets and variables → Actions
   - Add secret: `VITE_API_URL` with your backend URL

2. **Update workflow to use secret:**
   ```yaml
   - name: Build
     run: cd app && npm run build
     env:
       VITE_API_URL: ${{ secrets.VITE_API_URL }}
   ```

3. **Push to trigger deployment:**
   ```bash
   git push origin main
   ```

---

## Troubleshooting

### "Build failed: Cannot find module"
```bash
cd app
npm ci
npm run build
```

### "API calls return 404 or CORS errors"
- ✅ Check `VITE_API_URL` is set to correct backend URL
- ✅ Check backend is running: `curl https://your-api-url/api/health`
- ✅ Check backend has `FRONTEND_URL` set to your frontend domain

### "Blank page or white screen"
- Open browser DevTools → Console
- Check for JavaScript errors
- Check Network tab to see if /api calls are working

### "GitHub Pages shows 404"
- Verify repository is public (or GitHub Pages enabled for private)
- Check Settings → Pages → Build and deployment
- Ensure source is set to "GitHub Actions"

### "Vercel deployment keeps failing"
- Check build logs in Vercel dashboard
- Ensure `npm run build` works locally: `cd app && npm run build`
- Check for environment variable issues

---

## Update Configuration

### After changing API URL

**Vercel:**
1. Dashboard → Project → Settings → Environment Variables
2. Update `VITE_API_URL`
3. Click "Redeploy"

**GitHub Pages:**
1. Repository → Settings → Secrets and variables → Actions
2. Update `VITE_API_URL` secret
3. Push any commit to main (or manually trigger workflow)

---

## Optimize for Production

### Build size:
```bash
cd app
npm run build
# Check dist/ folder size
ls -lh dist/
```

### Test production build locally:
```bash
cd app
npm run build
npm run preview
# Open http://localhost:5173
```

---

## Monitoring

### Vercel:
- Dashboard shows deployment status
- Analytics tab shows performance metrics
- Logs tab shows build and runtime errors

### GitHub Pages:
- Check Actions tab for workflow runs
- View deployment status in Deployments tab

---

## Custom Domain (Optional)

### Add your own domain:

**Vercel:**
1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain
3. Update DNS records (shown in Vercel)

**GitHub Pages:**
1. Repository → Settings → Pages
2. Add custom domain
3. Update DNS records
4. Create `CNAME` file in repo root

---

## Next Steps

1. **Deploy backend** (see DEPLOY-BACKEND.md)
2. **Deploy frontend** (this guide)
3. **Connect them** (set `VITE_API_URL`)
4. **Share link** with your team

---

## Summary Table

| Provider | Free Tier | Deploy Time | Custom Domain | Best For |
|----------|-----------|-------------|---------------|----------|
| Vercel | ✅ Unlimited | 30 seconds | ✅ Yes | Teams, automatic |
| GitHub Pages | ✅ Unlimited | 1-2 min | ✅ Yes | Solo projects, existing GH |

---

## Support

- Vercel: [vercel.com/docs](https://vercel.com/docs)
- GitHub Pages: [pages.github.com](https://pages.github.com)
- Vite: [vitejs.dev](https://vitejs.dev)

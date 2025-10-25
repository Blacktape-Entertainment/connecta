# Coolify Deployment Guide for Connecta

## 🚀 Quick Setup in Coolify

### 1. **Repository Settings**
- **Repository**: `https://github.com/Blacktape-Entertainment/connecta`
- **Branch**: `main`
- **Build Pack**: `nixpacks` (recommended) or `static`

### 2. **Build Configuration**

**IMPORTANT:** Leave the following fields **EMPTY** in Coolify UI to let `nixpacks.toml` handle the configuration:
- Install Command: *(leave empty)*
- Build Command: *(leave empty)*
- Start Command: *(leave empty)*

**Only set this:**
- **Publish Directory**: `dist`
- **Base Directory**: `/` (or leave empty for root)

> **Why?** If you manually set install/build commands in Coolify UI, they override the `nixpacks.toml` configuration and can cause detection issues.

#### **Alternative: Manual Configuration**
If auto-detection doesn't work, set these **WITHOUT** specifying a base directory path:

#### **Install Command:**
```bash
pnpm install --frozen-lockfile
```

#### **Build Command:**
```bash
pnpm run build
```

#### **Publish Directory:**
```
dist
```

#### **Start Command (leave empty for static sites):**
```
# Leave empty - this is a static site
```

---

## 📝 Environment Variables

If you need to add environment variables (e.g., for PocketBase API URL):

1. Go to **Environment Variables** in Coolify
2. Add the following (if needed):
   - `VITE_POCKETBASE_URL` = `https://api.worldofconnecta.com`

> **Note:** Currently, the API URL is hardcoded in `src/lib/pocketbase.ts`. If you want to make it configurable, update the file to use `import.meta.env.VITE_POCKETBASE_URL`.

---

## ⚙️ Coolify Settings

### **General Settings:**
- **Port**: N/A (static site)
- **Domains**: Configure your custom domain
- **SSL**: Enable automatic HTTPS

### **Build Settings:**
- **Node Version**: 20.x (automatically detected)
- **Package Manager**: pnpm (automatically detected from `pnpm-lock.yaml`)
- **Build Directory**: dist

### **Advanced Settings (Optional):**
- **Base Directory**: / (root)
- **Install Command**: `pnpm install --frozen-lockfile`
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist`

---

## 🔧 Manual Deployment Script

If you prefer using the shell script:

1. **In Coolify UI**, go to **Build Settings**
2. Set **Build Command**:
   ```bash
   chmod +x deploy.sh && ./deploy.sh
   ```

3. Or use the manual commands:
   ```bash
   # Install pnpm if needed
   npm install -g pnpm@10.18.2
   
   # Install dependencies
   pnpm install --frozen-lockfile
   
   # Build the project
   pnpm run build
   ```

---

## 📦 What Gets Built

After running `pnpm run build`, Vite will create:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── logo-[hash].png
└── (other optimized assets)
```

This `dist` folder contains all the static files needed to host your application.

---

## 🌐 Post-Deployment

1. **Verify the build** completed successfully in Coolify logs
2. **Test your application** at the assigned URL
3. **Configure your custom domain** (if needed)
4. **Enable HTTPS** (automatic with Coolify)

---

## 🐛 Troubleshooting

### Build fails with "command not found: pnpm"
**Solution**: Coolify should auto-detect pnpm from `pnpm-lock.yaml`. If not:
- Add `npm install -g pnpm` before build command
- Or use install command: `npm install -g pnpm@10.18.2 && pnpm install --frozen-lockfile`

### Build succeeds but site shows blank page
**Solution**: Check that:
- Publish directory is set to `dist`
- Base path in `vite.config.js` is correct
- Browser console for errors (F12)

### API calls fail
**Solution**: 
- Verify PocketBase URL is accessible: `https://api.worldofconnecta.com`
- Check CORS settings on PocketBase
- Ensure PocketBase SDK is working

---

## 📚 Additional Resources

- [Coolify Documentation](https://coolify.io/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [pnpm Documentation](https://pnpm.io/)

---

## ✅ Deployment Checklist

- [ ] Repository connected to Coolify
- [ ] Build command configured: `pnpm run build`
- [ ] Install command configured: `pnpm install --frozen-lockfile`
- [ ] Publish directory set to: `dist`
- [ ] Environment variables added (if any)
- [ ] Custom domain configured
- [ ] HTTPS enabled
- [ ] First deployment successful
- [ ] Application tested and working
- [ ] Form submission works
- [ ] PocketBase connection verified

---

**Need help?** Contact your DevOps team or check Coolify logs for detailed error messages.

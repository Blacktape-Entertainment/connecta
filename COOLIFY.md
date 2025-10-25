# Connecta - Deployment Configuration

## For Coolify Deployment

### Simple Configuration (Recommended)

Just set these values in Coolify UI:

**Install Command:**
```
pnpm install --frozen-lockfile
```

**Build Command:**
```
pnpm run build
```

**Output Directory:**
```
dist
```

That's it! Coolify will auto-detect Node.js and pnpm from the project files.

---

## Files Created

1. **`nixpacks.toml`** - Nixpacks configuration (Coolify's default build system)
2. **`deploy.sh`** - Alternative manual deployment script
3. **`.coolify`** - Coolify-specific settings
4. **`DEPLOYMENT.md`** - Full deployment guide and troubleshooting

---

## Quick Deploy Steps

1. Connect your Git repository to Coolify
2. Select "Static Site" or "Nixpacks" build pack
3. Set the three commands above
4. Deploy! 🚀

The static files will be served from the `dist` folder.

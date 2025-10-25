# 🚨 Coolify Deployment Error Fix

## Error Message:
```
Nixpacks failed to detect the application type
```

## Root Cause:
Coolify is running nixpacks detection in the wrong directory (`/artifacts/.../dist`) instead of the repository root.

## ✅ Solution:

### In Coolify UI, go to your application settings:

1. **Clear/Remove these fields** (leave them empty):
   - Install Command: ❌ DELETE
   - Build Command: ❌ DELETE
   - Base Directory: ❌ DELETE or set to `/`

2. **Only set these:**
   - **Publish Directory**: `dist`
   - **Build Pack**: `nixpacks`

3. **Save and Redeploy**

### Why This Works:
When you leave install/build commands empty, Coolify uses the `nixpacks.toml` file in your repository root, which correctly detects the Node.js application and runs the build from the right location.

---

## Alternative Fix: Use Docker Deployment

If nixpacks continues to fail, create a `Dockerfile`:

```dockerfile
# Use Node.js 20
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.18.2

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage - serve static files with nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

Then in Coolify:
1. Set **Build Pack** to `dockerfile`
2. Set **Dockerfile Location** to `Dockerfile`
3. Deploy

---

## Quick Checklist:

- [ ] Remove install command from Coolify UI
- [ ] Remove build command from Coolify UI  
- [ ] Set publish directory to `dist`
- [ ] Ensure `nixpacks.toml` is in repository root
- [ ] Ensure `package.json` is in repository root
- [ ] Commit and push changes
- [ ] Redeploy

---

**This should fix the nixpacks detection error!** 🚀

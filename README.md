# Connecta - Event Registration Platform

A modern, animated event registration form built with React, Vite, and WebGL effects.

## ✨ Features

- 🎨 **Interactive WebGL Orb Background** - Beautiful shader-based animated orb
- 🎉 **Success Modal with Fireworks** - Celebratory animation after registration
- 📱 **Fully Responsive** - Works seamlessly on all devices
- 🎯 **Multi-step Form** - Clean, progressive form with validation
- 💾 **PocketBase Integration** - Backend powered by PocketBase
- ⚡ **Fast & Modern** - Built with Vite and React 19
- 🎭 **Smooth Animations** - GSAP and Framer Motion animations

## 🚀 Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
# Build static files
pnpm build

# Preview production build
pnpm preview
```

## 📦 Deployment

### Coolify (Recommended)

This project is ready to deploy on Coolify with zero configuration!

**Quick Setup:**
1. Connect your Git repository
2. Coolify auto-detects the configuration from `nixpacks.toml`
3. Click Deploy! 🚀

**Manual Configuration (if needed):**
- **Install Command**: `pnpm install --frozen-lockfile`
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist`

📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and troubleshooting.

### Other Static Hosting Platforms

The built static files in `dist/` can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages
- Any static file hosting

## 🛠️ Tech Stack

- **Frontend**: React 19.1.1, Vite 7.1.7
- **Styling**: TailwindCSS 4.1.16
- **Animations**: GSAP 3.13.0, Framer Motion 12.23.24
- **Graphics**: OGL 1.0.11 (WebGL)
- **Backend**: PocketBase 0.26.2
- **Package Manager**: pnpm

## 📁 Project Structure

```
connecta/
├── src/
│   ├── components/       # React components
│   │   ├── FormSection.jsx
│   │   ├── Orb.tsx
│   │   ├── SuccessModal.tsx
│   │   └── ...
│   ├── lib/             # Utilities and configs
│   │   ├── pocketbase.ts
│   │   └── utils.ts
│   ├── services/        # API services
│   │   └── applicationService.ts
│   ├── types/           # TypeScript types
│   └── assets/          # Images and static files
├── nixpacks.toml       # Coolify/Nixpacks config
├── deploy.sh           # Deployment script
└── DEPLOYMENT.md       # Deployment guide
```

## 🔧 Configuration

### PocketBase API

The PocketBase URL is configured in `src/lib/pocketbase.ts`:

```typescript
const pb = new PocketBase("https://api.worldofconnecta.com");
```

To change it, update the URL or make it environment-based:

```typescript
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || "https://api.worldofconnecta.com");
```

## 📄 License

All rights reserved - Blacktape Entertainment

## 🤝 Contributing

This is a private project. For access or contributions, contact the repository owner.

---

**Event Details:**
- 📍 El Manara Hall 4
- 📅 17-19 November 2025
- 🕐 10:00 AM - 8:00 PM

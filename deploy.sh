#!/bin/bash

# Coolify Deployment Script for Connecta
# This script installs dependencies and builds the project for static hosting

set -e  # Exit on any error

echo "🚀 Starting Connecta deployment..."

# Install pnpm if not available
if ! command -v pnpm &> /dev/null
then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@10.18.2
fi

echo "📦 Installing dependencies with pnpm..."
pnpm install --frozen-lockfile

echo "🔨 Building project..."
pnpm run build

echo "✅ Build completed successfully!"
echo "📁 Static files are in: ./dist"

# Optional: Display build info
if [ -d "dist" ]; then
    echo "📊 Build size:"
    du -sh dist
    echo "📄 Files in dist:"
    ls -lh dist
fi

echo "🎉 Deployment script completed!"

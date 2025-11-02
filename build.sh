#!/bin/bash

# Build script for Render deployment
# This script builds both frontend and backend

echo "🔨 Starting build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build frontend
echo "🎨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies and generate Prisma client
echo "⚙️  Setting up backend..."
cd backend
npm install
npx prisma generate
cd ..

echo "✅ Build complete!"


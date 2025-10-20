#!/bin/bash

# Production deployment script for Ignite Academy Frontend
# This script handles the complete build and deployment process

set -e  # Exit on any error

echo "🚀 Starting Ignite Academy Frontend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "apps/web/package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version check passed: $(node -v)"

# Navigate to web app directory
cd apps/web

# Install dependencies
print_status "Installing dependencies..."
npm ci --only=production

# Run type checking
print_status "Running type checking..."
npm run typecheck

# Run linting
print_status "Running linting..."
if npm run lint; then
    print_success "Linting passed"
else
    print_warning "Linting found issues, but continuing with build..."
fi

# Run tests
print_status "Running tests..."
if npm run test -- --run; then
    print_success "Tests passed"
else
    print_warning "Some tests failed, but continuing with build..."
fi

# Clean previous build
print_status "Cleaning previous build..."
npm run clean

# Build the application
print_status "Building application for production..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    print_success "Build completed successfully!"
    print_status "Build output size: $(du -sh dist | cut -f1)"
else
    print_error "Build failed - dist directory not found"
    exit 1
fi

# Create production environment file
print_status "Creating production environment configuration..."
cat > .env.production << EOF
VITE_API_BASE_URL=https://ignite-qjis.onrender.com/api/v1
VITE_PAYMENT_API_URL=https://ignite-qjis.onrender.com/api/payments
VITE_APP_NAME=Ignite Academy
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_DEV_TOOLS=false
VITE_ENABLE_LOGGING=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ALLOWED_ORIGINS=https://ignite-qjis.onrender.com,https://your-frontend-domain.onrender.com
EOF

print_success "Production environment file created"

# Generate build info
print_status "Generating build information..."
cat > dist/build-info.json << EOF
{
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nodeVersion": "$(node -v)",
  "npmVersion": "$(npm -v)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "version": "1.0.0",
  "environment": "production"
}
EOF

print_success "Build information generated"

# Security check
print_status "Running security checks..."

# Check for sensitive data in build
if grep -r "localhost\|127.0.0.1\|0.0.0.0" dist/ > /dev/null 2>&1; then
    print_warning "Found localhost references in build - this might be intentional"
fi

# Check for console.log statements
if grep -r "console\.log\|console\.warn\|console\.error" dist/ > /dev/null 2>&1; then
    print_warning "Found console statements in production build"
fi

print_success "Security checks completed"

# Final status
print_success "🎉 Ignite Academy Frontend is ready for deployment!"
print_status "Build directory: apps/web/dist"
print_status "Next steps:"
print_status "1. Deploy the dist folder to your hosting service"
print_status "2. Configure your domain and SSL certificates"
print_status "3. Set up monitoring and logging"
print_status "4. Test the deployed application"

echo ""
print_status "Deployment script completed successfully! 🚀"

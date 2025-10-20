# 🚀 Ignite Academy Frontend - Production Deployment Guide

## Overview
This guide covers deploying the Ignite Academy frontend to production using Render with automatic GitHub integration.

## Prerequisites
- GitHub repository with the code
- Render account (free tier available)
- Backend API deployed at: `https://ignite-qjis.onrender.com`

## 🏗️ Project Structure
```
createxyz-project/
├── apps/
│   └── web/                 # Frontend React application
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions workflow
├── Dockerfile              # Docker configuration
├── nginx.conf              # Nginx configuration
├── render.yaml             # Render deployment config
├── deploy-frontend.sh      # Manual deployment script
└── CORS_CONFIG.md          # CORS configuration guide
```

## 🔧 Configuration Files

### 1. Environment Variables
The application uses environment variables for configuration:

```bash
# Production Environment Variables
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
```

### 2. Docker Configuration
- **Dockerfile**: Multi-stage build with Node.js and Nginx
- **nginx.conf**: Production-ready Nginx configuration with security headers

### 3. Render Configuration
- **render.yaml**: Automatic deployment configuration
- Supports both Docker and Node.js deployments

## 🚀 Deployment Methods

### Method 1: Automatic GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository and branch (main)

3. **Configure Service**:
   - **Name**: `ignite-frontend`
   - **Environment**: `Node`
   - **Build Command**: `cd apps/web && npm ci && npm run build`
   - **Start Command**: `cd apps/web && npm run preview`
   - **Node Version**: `18`

4. **Set Environment Variables**:
   ```
   VITE_API_BASE_URL=https://ignite-qjis.onrender.com/api/v1
   VITE_PAYMENT_API_URL=https://ignite-qjis.onrender.com/api/payments
   VITE_APP_ENVIRONMENT=production
   ```

5. **Deploy**: Click "Create Web Service" and wait for deployment

### Method 2: Docker Deployment

1. **Build Docker Image**:
   ```bash
   docker build -t ignite-frontend .
   ```

2. **Run Container**:
   ```bash
   docker run -p 80:80 ignite-frontend
   ```

3. **Deploy to Render with Docker**:
   - Use the Dockerfile in the root directory
   - Render will automatically detect and use it

### Method 3: Manual Deployment Script

1. **Run Deployment Script**:
   ```bash
   chmod +x deploy-frontend.sh
   ./deploy-frontend.sh
   ```

2. **Upload dist folder** to your hosting service

## 🔒 Security Configuration

### Backend CORS Settings
Update your backend to allow the frontend domain:

```java
// In WebSecurityConfig.java
configuration.setAllowedOrigins(Arrays.asList(
    "https://your-frontend-domain.onrender.com",
    "https://ignite-qjis.onrender.com"
));
```

### Security Headers
The nginx configuration includes:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy: Restrictive policy
- HSTS: HTTP Strict Transport Security

## 📊 Monitoring and Health Checks

### Health Check Endpoint
- **URL**: `https://your-domain.onrender.com/health`
- **Response**: `200 OK` with "healthy" message

### Build Information
- **URL**: `https://your-domain.onrender.com/build-info.json`
- **Contains**: Build time, version, git commit, etc.

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **CORS Errors**:
   - Verify backend CORS configuration
   - Check allowed origins in backend
   - Ensure frontend URL is correct

3. **API Connection Issues**:
   - Verify backend is running
   - Check API base URL configuration
   - Test backend endpoints directly

4. **Static Asset Issues**:
   - Check nginx configuration
   - Verify file paths in build output
   - Check MIME types

### Debug Commands

```bash
# Check build locally
cd apps/web
npm run build
npm run preview

# Test Docker build
docker build -t test-frontend .
docker run -p 3000:80 test-frontend

# Check environment variables
echo $VITE_API_BASE_URL
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
The `.github/workflows/deploy.yml` file includes:
- Automated testing (linting, type checking, tests)
- Build verification
- Automatic deployment to Render

### Required Secrets
Add these to your GitHub repository secrets:
- `RENDER_SERVICE_ID`: Your Render service ID
- `RENDER_API_KEY`: Your Render API key

## 📈 Performance Optimization

### Build Optimizations
- Tree shaking enabled
- Code splitting
- Gzip compression
- Static asset caching
- Minification

### Runtime Optimizations
- Nginx caching
- Security headers
- Compression
- Health checks

## 🚀 Post-Deployment Checklist

- [ ] Verify application loads correctly
- [ ] Test all major features
- [ ] Check API connectivity
- [ ] Verify security headers
- [ ] Test on different devices/browsers
- [ ] Monitor performance
- [ ] Set up error tracking
- [ ] Configure domain (if using custom domain)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Render logs
3. Check GitHub Actions logs
4. Verify backend API status

## 🔄 Updates and Maintenance

### Updating the Application
1. Make changes to the code
2. Push to main branch
3. GitHub Actions will automatically deploy
4. Monitor deployment status in Render dashboard

### Environment Variable Updates
1. Go to Render dashboard
2. Navigate to your service
3. Go to Environment tab
4. Update variables as needed
5. Redeploy the service

---

**🎉 Congratulations! Your Ignite Academy frontend is now ready for production deployment!**

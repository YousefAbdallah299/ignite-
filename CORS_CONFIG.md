# CORS Configuration for Production
# This file contains the CORS configuration that should be set in your backend

# Backend CORS Configuration (Spring Boot)
# Set these environment variables in your backend deployment:

# ALLOWED_ORIGINS=https://your-frontend-domain.onrender.com,https://ignite-qjis.onrender.com
# CORS_MAX_AGE=3600
# CORS_ALLOW_CREDENTIALS=true

# Frontend CORS Headers (nginx.conf)
# The nginx configuration already includes these headers:
# - Access-Control-Allow-Origin: https://ignite-qjis.onrender.com
# - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
# - Access-Control-Allow-Headers: Authorization, Content-Type
# - Access-Control-Allow-Credentials: true

# Security Headers for Production
# - X-Frame-Options: SAMEORIGIN
# - X-Content-Type-Options: nosniff
# - X-XSS-Protection: 1; mode=block
# - Referrer-Policy: strict-origin-when-cross-origin
# - Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://ignite-qjis.onrender.com;

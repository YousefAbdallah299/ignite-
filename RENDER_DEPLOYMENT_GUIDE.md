# Render Deployment Guide for Ignite Frontend

## Environment Variables Setup

To properly connect your frontend to the backend, you need to set the following environment variables in your Render dashboard:

### Required Environment Variables

1. **VITE_API_BASE_URL**
   - Value: `https://ignite-qjis.onrender.com/api/v1`
   - Description: Base URL for all API calls to the backend

2. **VITE_PAYMENT_API_URL**
   - Value: `https://ignite-qjis.onrender.com/api/payments`
   - Description: URL for payment processing endpoints

3. **VITE_APP_NAME**
   - Value: `Ignite Academy`
   - Description: Application name

4. **VITE_APP_VERSION**
   - Value: `1.0.0`
   - Description: Application version

5. **VITE_APP_ENVIRONMENT**
   - Value: `production`
   - Description: Environment identifier

6. **VITE_ENABLE_DEV_TOOLS**
   - Value: `false`
   - Description: Disable development tools in production

7. **VITE_ENABLE_LOGGING**
   - Value: `false`
   - Description: Disable verbose logging in production

8. **VITE_ENABLE_ANALYTICS**
   - Value: `true`
   - Description: Enable analytics tracking

9. **VITE_ENABLE_ERROR_REPORTING**
   - Value: `true`
   - Description: Enable error reporting

10. **VITE_ALLOWED_ORIGINS**
    - Value: `https://ignite-qjis.onrender.com,https://ignite-7e2w.onrender.com`
    - Description: CORS allowed origins

## How to Set Environment Variables in Render

1. Go to your Render dashboard
2. Navigate to your frontend service (ignite-frontend)
3. Click on "Environment" tab
4. Add each environment variable listed above
5. Click "Save Changes"
6. Redeploy your service

## Backend CORS Configuration

Make sure your backend service has the following CORS configuration:

```properties
ALLOWED_ORIGINS=https://ignite-7e2w.onrender.com,https://ignite-qjis.onrender.com
CORS_MAX_AGE=3600
CORS_ALLOW_CREDENTIALS=true
```

## Testing the Connection

After setting up the environment variables, you can test the connection by:

1. Opening your deployed frontend
2. Opening browser developer tools (F12)
3. Going to the Console tab
4. Running: `window.testBackendConnection()`

This will test the connection to your backend and show any errors.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure both frontend and backend have correct CORS origins configured
2. **Environment Variables Not Loading**: Ensure variables are set in Render dashboard and service is redeployed
3. **Network Errors**: Check that backend service is running and accessible
4. **Authentication Issues**: Verify that JWT tokens are being handled correctly

### Debug Steps

1. Check browser network tab for failed requests
2. Verify environment variables are loaded: `console.log(import.meta.env)`
3. Test backend directly: `curl https://ignite-qjis.onrender.com/api/v1/auth/refresh`
4. Check Render service logs for any deployment issues

## Deployment Commands

The service should automatically build and deploy when you push to your repository. The build command is:
```bash
npm run build
```

And the start command is:
```bash
npm start
```

## File Structure

Make sure your `render.yaml` file is properly configured:
```yaml
services:
  - type: web
    name: ignite-frontend
    env: static
    strictName: true
    buildCommand: npm run build
    staticPublishPath: ./build/client
```

## Support

If you continue to have issues, check:
1. Render service logs
2. Browser console for JavaScript errors
3. Network tab for failed API calls
4. Backend service status in Render dashboard


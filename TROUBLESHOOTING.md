# Troubleshooting Guide

## "Failed to Fetch" Error When Logging In/Signing Up

This error typically occurs when the frontend cannot connect to the backend API. Here's how to fix it:

### Step 1: Start the Backend Server

The Ignite backend needs to be running on `localhost:8080` for the frontend to work.

#### Option A: Using the provided script (Windows)
```bash
./start-backend.bat
```

#### Option B: Using the provided script (Linux/Mac)
```bash
chmod +x start-backend.sh
./start-backend.sh
```

#### Option C: Manual start
```bash
cd apps/Ignite
mvn spring-boot:run
```

### Step 2: Verify Backend is Running

1. Open your browser and go to: http://localhost:8080
2. You should see the Spring Boot application running
3. Check the Swagger documentation at: http://localhost:8080/swagger-ui.html

### Step 3: Use the Backend Debugger

I've added a debugger component to the sign-in page:

1. Go to the sign-in page in your frontend
2. Look for the "Backend Debugger" widget in the bottom-right corner
3. Click "Test Connection" to verify the backend is accessible
4. Check the logs for any connection issues

### Step 4: Check Common Issues

#### Issue 1: Backend Not Running
**Symptoms:** "Failed to fetch" error
**Solution:** Start the backend using one of the methods above

#### Issue 2: Wrong Port
**Symptoms:** Connection timeout
**Solution:** Ensure the backend is running on port 8080

#### Issue 3: CORS Issues
**Symptoms:** CORS error in browser console
**Solution:** The backend is configured with CORS enabled, but if you see CORS errors, check the WebSecurityConfig.java file

#### Issue 4: Database Issues
**Symptoms:** Backend starts but API calls fail
**Solution:** Check the application.properties file for database configuration

### Step 5: Test the API Directly

You can test the API endpoints directly using curl or a tool like Postman:

```bash
# Test the refresh endpoint (should work without authentication)
curl http://localhost:8080/api/v1/auth/refresh

# Test registration
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User", 
    "email": "test@example.com",
    "password": "password123",
    "role": "CANDIDATE"
  }'
```

### Step 6: Check Browser Console

1. Open browser developer tools (F12)
2. Go to the Console tab
3. Try to sign in/register
4. Look for any error messages that might give more details

### Step 7: Verify API Client Configuration

The API client is configured to connect to:
- Base URL: `http://localhost:8080/api/v1`
- All endpoints are properly mapped to the backend controllers

### Common Error Messages and Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Failed to fetch" | Backend not running | Start the backend server |
| "Network Error" | Wrong URL or port | Check backend is on localhost:8080 |
| "CORS error" | CORS not configured | Backend should handle CORS automatically |
| "401 Unauthorized" | Authentication issue | Check login credentials |
| "500 Internal Server Error" | Backend error | Check backend logs |

### Getting Help

If you're still having issues:

1. Check the backend console for error messages
2. Use the Backend Debugger in the frontend
3. Verify all dependencies are installed (Java, Maven)
4. Make sure no other application is using port 8080

### Quick Test

To quickly verify everything is working:

1. Start the backend: `./start-backend.bat` (Windows) or `./start-backend.sh` (Linux/Mac)
2. Wait for "Started IgniteApplication" message
3. Open frontend and go to sign-in page
4. Use the Backend Debugger to test connection
5. Try registering a new user

If all steps work, the integration should be functioning correctly!

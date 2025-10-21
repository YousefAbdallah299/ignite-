// Simple connection test for the Ignite backend
export const testBackendConnection = async () => {
  console.log('Testing backend connection...');
  
  try {
    // Test basic connectivity
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://ignite-qjis.onrender.com/api/v1';
    const response = await fetch(`${backendUrl}/auth/refresh`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors', // Explicitly set CORS mode
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      console.log('✅ Backend is running and accessible!');
      return true;
    } else {
      console.log('❌ Backend responded with error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error response body:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to connect to backend:', error);
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
    
    // More specific error handling
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('Network error - possible causes:');
      console.log('1. Backend is not running on localhost:8080');
      console.log('2. CORS is not configured properly');
      console.log('3. Network connectivity issues');
      console.log('4. Firewall blocking the connection');
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.log('Failed to fetch - this usually means:');
      console.log('1. The server is not responding');
      console.log('2. CORS is blocking the request');
      console.log('3. The URL is incorrect');
    }
    
    return false;
  }
};

// Test specific endpoints
export const testAuthEndpoint = async () => {
  console.log('Testing auth endpoint...');
  
  try {
    const testData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password: 'password123',
      role: 'CANDIDATE'
    };
    
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://ignite-qjis.onrender.com/api/v1';
    const response = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Auth endpoint response:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Auth endpoint working:', data);
      return true;
    } else {
      const errorData = await response.text();
      console.log('❌ Auth endpoint error:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Auth endpoint failed:', error);
    return false;
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.testBackendConnection = testBackendConnection;
  window.testAuthEndpoint = testAuthEndpoint;
}

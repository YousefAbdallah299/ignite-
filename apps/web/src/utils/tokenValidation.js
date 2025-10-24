/**
 * Global token validation utility
 * Checks token validity and handles redirects to sign-in
 */

export class TokenValidationService {
  static isTokenValid(token) {
    if (!token) return false;
    
    try {
      // Check if token has the correct JWT format (3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Check if token is expired by decoding the payload
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  static clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  static redirectToSignIn() {
    // Clear auth data
    this.clearAuthData();
    
    // Prevent infinite redirects
    if (window.location.pathname !== '/account/signin') {
      console.log('Token invalid, redirecting to sign-in');
      window.location.href = '/account/signin';
    }
  }

  static validateAndRedirect() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      this.redirectToSignIn();
      return false;
    }
    
    // Only redirect if token is clearly invalid (malformed or expired)
    if (!this.isTokenValid(token)) {
      console.log('Token validation failed, redirecting to sign-in');
      this.redirectToSignIn();
      return false;
    }
    
    return true;
  }

  static async validateTokenWithBackend() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      this.redirectToSignIn();
      return false;
    }

    try {
      // Make a simple API call to validate the token
      const response = await fetch('/api/v1/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('Token validation failed with status:', response.status);
        this.redirectToSignIn();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating token with backend:', error);
      this.redirectToSignIn();
      return false;
    }
  }
}

// Global token validation hook
export const useTokenValidation = () => {
  const validateToken = () => {
    return TokenValidationService.validateAndRedirect();
  };

  const validateTokenWithBackend = async () => {
    return await TokenValidationService.validateTokenWithBackend();
  };

  const clearAuthAndRedirect = () => {
    TokenValidationService.clearAuthData();
    TokenValidationService.redirectToSignIn();
  };

  return {
    validateToken,
    validateTokenWithBackend,
    clearAuthAndRedirect,
  };
};


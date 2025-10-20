'use client';

import { useEffect } from 'react';
import { useTokenValidation } from '@/utils/tokenValidation';
import { useAuthAPI } from '@/hooks/useAuthAPI';

/**
 * Global page wrapper that validates tokens on every page load
 * This component should wrap all pages that require authentication
 */
export default function TokenValidationWrapper({ children, requireAuth = true }) {
  const { validateToken } = useTokenValidation();
  const { user, isAuthenticated } = useAuthAPI();

  useEffect(() => {
    // Only validate if authentication is required
    if (requireAuth) {
      console.log('TokenValidationWrapper: Validating token on page load');
      
      // Check if user is authenticated
      if (!isAuthenticated) {
        console.log('TokenValidationWrapper: User not authenticated, redirecting to sign-in');
        validateToken();
        return;
      }

      // Validate token format and expiration
      const isValid = validateToken();
      if (!isValid) {
        console.log('TokenValidationWrapper: Token validation failed');
        return;
      }

      console.log('TokenValidationWrapper: Token validation passed');
    }
  }, [requireAuth, isAuthenticated, validateToken]);

  // Don't render children if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating authentication...</p>
        </div>
      </div>
    );
  }

  return children;
}

/**
 * Hook for pages that need to validate tokens
 */
export const usePageTokenValidation = (requireAuth = true) => {
  const { validateToken } = useTokenValidation();
  const { user, isAuthenticated } = useAuthAPI();

  useEffect(() => {
    if (requireAuth) {
      console.log('usePageTokenValidation: Validating token');
      
      if (!isAuthenticated) {
        console.log('usePageTokenValidation: User not authenticated');
        validateToken();
        return;
      }

      const isValid = validateToken();
      if (!isValid) {
        console.log('usePageTokenValidation: Token validation failed');
        return;
      }

      console.log('usePageTokenValidation: Token validation passed');
    } else {
      console.log('usePageTokenValidation: Authentication not required for this page');
    }
  }, [requireAuth, isAuthenticated, validateToken]);

  return {
    isValid: requireAuth ? isAuthenticated : true,
    user,
  };
};

import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/apiClient';
import { SecureStorage } from '../utils/secureStorage';

export const useAuthAPI = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = SecureStorage.getToken();
      const userData = SecureStorage.getUserData();
      
      if (token && userData) {
        try {
          setUser(userData);
        } catch (err) {
          console.error('Error parsing user data:', err);
          SecureStorage.removeToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(credentials);
      
      // Store token securely
      SecureStorage.setToken(response.token);
      
      // Try to get user profile information
      let userProfile = null;
      try {
        // Import appropriate API based on user role
        const { candidatesAPI, recruitersAPI } = await import('../utils/apiClient');
        
        if (response.role === 'RECRUITER') {
          userProfile = await recruitersAPI.getMyProfile();
        } else if (response.role === 'CANDIDATE') {
          userProfile = await candidatesAPI.getMyProfile();
        }
        
        console.log('Profile fetched successfully:', userProfile);
      } catch (profileError) {
        console.warn('Could not fetch user profile:', profileError);
        // Try to get profile from existing localStorage if available
        const existingUserData = localStorage.getItem('userData');
        if (existingUserData) {
          try {
            const parsed = JSON.parse(existingUserData);
            if (parsed.name || parsed.firstName) {
              userProfile = { name: parsed.name, firstName: parsed.firstName };
              console.log('Using cached profile data:', userProfile);
            }
          } catch (e) {
            console.warn('Could not parse cached user data:', e);
          }
        }
      }
      
      // Store user data with profile information
      const userData = {
        id: userProfile?.id || null,
        role: response.role,
        email: credentials.email,
        name: userProfile?.name || null,
        firstName: userProfile?.firstName || (userProfile?.name?.split(' ')[0]) || null,
        token: response.token
      };
      
      console.log('Final user data stored:', userData);
      // Store user data securely
      SecureStorage.setUserData(userData);
      setUser(userData);
      
      return response;
    } catch (err) {
      // Provide more descriptive error messages
      let errorMessage = 'Login failed';
      const errorMsg = err.message?.toLowerCase() || '';
      
      if (errorMsg.includes('bad credentials') || errorMsg.includes('invalid') || errorMsg.includes('401')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (errorMsg.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData, autoLogin = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      
      // Only store token and user data if autoLogin is true
      if (autoLogin) {
        localStorage.setItem('authToken', response.token);
        const userDataToStore = {
          id: response.id,
          role: userData.role,
          email: response.email,
          name: response.name,
          firstName: response.name?.split(' ')[0] || null,
          token: response.token
        };
        
        // Store user data securely
        SecureStorage.setUserData(userDataToStore);
        setUser(userDataToStore);
      }
      
      return response;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear secure storage regardless of API call success
      SecureStorage.removeToken();
      setUser(null);
      setLoading(false);
      
      // Redirect to home page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }, []);

  // Forgot password function
  const forgotPassword = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.forgotPassword(email);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (token, passwordData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.resetPassword(token, passwordData);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Confirm email function
  const confirmEmail = useCallback(async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.confirmEmail(token);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to confirm email');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Function to refresh user profile data
  const refreshUserProfile = useCallback(async () => {
    try {
      const { candidatesAPI, recruitersAPI } = await import('../utils/apiClient');
      
      let userProfile;
      if (user?.role === 'RECRUITER') {
        userProfile = await recruitersAPI.getMyProfile();
      } else if (user?.role === 'CANDIDATE') {
        userProfile = await candidatesAPI.getMyProfile();
      } else {
        throw new Error('Invalid user role');
      }
      
      const updatedUserData = {
        ...user,
        id: userProfile?.id || user?.id,
        name: userProfile?.name || user?.name,
        firstName: userProfile?.firstName || (userProfile?.name?.split(' ')[0]) || user?.firstName,
      };
      
      // Update stored user data securely
      SecureStorage.setUserData(updatedUserData);
      setUser(updatedUserData);
      
      return updatedUserData;
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
      throw err;
    }
  }, [user]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    confirmEmail,
    refreshUserProfile,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isRecruiter: user?.role === 'RECRUITER',
    isCandidate: user?.role === 'CANDIDATE',
    isInterviewer: user?.role === 'INTERVIEWER',
  };
};

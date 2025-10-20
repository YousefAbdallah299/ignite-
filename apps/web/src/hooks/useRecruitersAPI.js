import { useState, useCallback } from 'react';
import { recruitersAPI } from '../utils/apiClient';

export const useRecruitersAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiCall = useCallback(async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      return await apiCall();
    } catch (err) {
      setError(err.message || 'API call failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllRecruiters = useCallback(async (page = 0, size = 10, query = null) => {
    return handleApiCall(() => recruitersAPI.getAllRecruiters(page, size, query));
  }, [handleApiCall]);

  const getMyProfile = useCallback(async () => {
    return handleApiCall(() => recruitersAPI.getMyProfile());
  }, [handleApiCall]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    getAllRecruiters,
    getMyProfile,
    clearError,
  };
};

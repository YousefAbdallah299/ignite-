import { useState, useCallback } from 'react';
import { candidatesAPI } from '../utils/apiClient';

export const useCandidatesAPI = () => {
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

  const getAllCandidates = useCallback(async (page = 0, size = 20, query = null, skills = null) => {
    return handleApiCall(() => candidatesAPI.getAllCandidates(page, size, query, skills));
  }, [handleApiCall]);

  const getMyProfile = useCallback(async () => {
    return handleApiCall(() => candidatesAPI.getMyProfile());
  }, [handleApiCall]);

  const updateMyProfile = useCallback(async (profileData) => {
    return handleApiCall(() => candidatesAPI.updateMyProfile(profileData));
  }, [handleApiCall]);

  const getCandidateById = useCallback(async (candidateId) => {
    return handleApiCall(() => candidatesAPI.getCandidateById(candidateId));
  }, [handleApiCall]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    getAllCandidates,
    getMyProfile,
    updateMyProfile,
    getCandidateById,
    clearError,
  };
};

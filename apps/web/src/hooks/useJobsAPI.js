import { useState, useCallback } from 'react';
import { jobsAPI } from '../utils/apiClient';

export const useJobsAPI = () => {
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

  const getAllJobs = useCallback(async (page = 0, size = 20, query = null, categories = null) => {
    return handleApiCall(() => jobsAPI.getAllJobs(page, size, query, categories));
  }, [handleApiCall]);

  const createJob = useCallback(async (jobData) => {
    return handleApiCall(() => jobsAPI.createJob(jobData));
  }, [handleApiCall]);

  const deleteJob = useCallback(async (id) => {
    return handleApiCall(() => jobsAPI.deleteJob(id));
  }, [handleApiCall]);

  const applyForJob = useCallback(async (id) => {
    return handleApiCall(() => jobsAPI.applyForJob(id));
  }, [handleApiCall]);

  const cancelJobApplication = useCallback(async (id) => {
    return handleApiCall(() => jobsAPI.cancelJobApplication(id));
  }, [handleApiCall]);

  const getMyAppliedJobs = useCallback(async (page = 0, size = 20) => {
    return handleApiCall(() => jobsAPI.getMyAppliedJobs(page, size));
  }, [handleApiCall]);

  const getJobById = useCallback(async (id) => {
    return handleApiCall(() => jobsAPI.getJobById(id));
  }, [handleApiCall]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    getAllJobs,
    createJob,
    deleteJob,
    applyForJob,
    cancelJobApplication,
    getMyAppliedJobs,
    getJobById,
    clearError,
  };
};

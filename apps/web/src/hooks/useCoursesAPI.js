import { useState, useCallback } from 'react';
import { coursesAPI } from '../utils/apiClient';

export const useCoursesAPI = () => {
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

  const getAllCourses = useCallback(async (page = 0, size = 20, query = null, categories = null) => {
    return handleApiCall(() => coursesAPI.getAllCourses(page, size, query, categories));
  }, [handleApiCall]);

  const getCourseById = useCallback(async (id) => {
    return handleApiCall(() => coursesAPI.getCourseById(id));
  }, [handleApiCall]);

  const getEnrolledCourses = useCallback(async (page = 0, size = 20) => {
    return handleApiCall(() => coursesAPI.getEnrolledCourses(page, size));
  }, [handleApiCall]);

  const createCourse = useCallback(async (courseData) => {
    return handleApiCall(() => coursesAPI.createCourse(courseData));
  }, [handleApiCall]);

  const deleteCourse = useCallback(async (id) => {
    return handleApiCall(() => coursesAPI.deleteCourse(id));
  }, [handleApiCall]);

  const enrollCourse = useCallback(async (id) => {
    return handleApiCall(() => coursesAPI.enrollCourse(id));
  }, [handleApiCall]);

  const cancelEnrollment = useCallback(async (id) => {
    return handleApiCall(() => coursesAPI.cancelEnrollment(id));
  }, [handleApiCall]);

  const getLessonsBySection = useCallback(async (sectionId) => {
    return handleApiCall(() => coursesAPI.getLessonsBySection(sectionId));
  }, [handleApiCall]);

  const getNumberOfLessonsBySection = useCallback(async (sectionId) => {
    return handleApiCall(() => coursesAPI.getNumberOfLessonsBySection(sectionId));
  }, [handleApiCall]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    getAllCourses,
    getCourseById,
    getEnrolledCourses,
    createCourse,
    deleteCourse,
    enrollCourse,
    cancelEnrollment,
    getLessonsBySection,
    getNumberOfLessonsBySection,
    clearError,
  };
};

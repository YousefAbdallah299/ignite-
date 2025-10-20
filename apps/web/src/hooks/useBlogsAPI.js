import { useState, useCallback } from 'react';
import { blogsAPI } from '../utils/apiClient';

export const useBlogsAPI = () => {
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

  const getAllBlogs = useCallback(async (page = 0, size = 20) => {
    return handleApiCall(() => blogsAPI.getAllBlogs(page, size));
  }, [handleApiCall]);

  const getBlogById = useCallback(async (id) => {
    return handleApiCall(() => blogsAPI.getBlogById(id));
  }, [handleApiCall]);

  const getComments = useCallback(async (id, page = 0, size = 15) => {
    return handleApiCall(() => blogsAPI.getComments(id, page, size));
  }, [handleApiCall]);

  const getReplies = useCallback(async (commentId, page = 0, size = 15) => {
    return handleApiCall(() => blogsAPI.getReplies(commentId, page, size));
  }, [handleApiCall]);

  const getBlogLikes = useCallback(async (id, page = 0, size = 15) => {
    return handleApiCall(() => blogsAPI.getBlogLikes(id, page, size));
  }, [handleApiCall]);

  const getCommentLikes = useCallback(async (commentId, page = 0, size = 15) => {
    return handleApiCall(() => blogsAPI.getCommentLikes(commentId, page, size));
  }, [handleApiCall]);

  const likeBlog = useCallback(async (id) => {
    return handleApiCall(() => blogsAPI.likeBlog(id));
  }, [handleApiCall]);

  const likeComment = useCallback(async (commentId) => {
    return handleApiCall(() => blogsAPI.likeComment(commentId));
  }, [handleApiCall]);

  const createBlog = useCallback(async (content, mediaType, file) => {
    return handleApiCall(() => blogsAPI.createBlog(content, mediaType, file));
  }, [handleApiCall]);

  const deleteBlog = useCallback(async (id) => {
    return handleApiCall(() => blogsAPI.deleteBlog(id));
  }, [handleApiCall]);

  const addComment = useCallback(async (id, content, parentId = null) => {
    return handleApiCall(() => blogsAPI.addComment(id, content, parentId));
  }, [handleApiCall]);

  const deleteComment = useCallback(async (commentId) => {
    return handleApiCall(() => blogsAPI.deleteComment(commentId));
  }, [handleApiCall]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    getAllBlogs,
    getBlogById,
    getComments,
    getReplies,
    getBlogLikes,
    getCommentLikes,
    likeBlog,
    likeComment,
    createBlog,
    deleteBlog,
    addComment,
    deleteComment,
    clearError,
  };
};

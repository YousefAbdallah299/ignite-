// API Client for Ignite Backend
// Direct communication with Spring Boot backend

import { TokenValidationService } from './tokenValidation';
import { SecureStorage, logger } from './secureStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ignite-qjis.onrender.com/api/v1';

// Helper function to get auth token from secure storage
const getAuthToken = () => {
  return SecureStorage.getToken();
};

// Helper function to create headers
const createHeaders = (includeAuth = true, isFormData = false) => {
  const headers = {};
  
  // Only set Content-Type for JSON, not for FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      logger.log('Authorization header set');
    } else {
      logger.warn('No auth token found');
    }
  }
  
  return headers;
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  // Only validate token if authentication is required
  const token = getAuthToken();
  if (token && options.includeAuth !== false) {
    if (!TokenValidationService.isTokenValid(token)) {
      console.log('Token is invalid, redirecting to sign-in');
      TokenValidationService.redirectToSignIn();
      return;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;
  const defaultHeaders = createHeaders(options.includeAuth !== false, isFormData);
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  logger.log(`Making API call to: ${url}`);
  logger.log(`Request config:`, config);

  try {
    const response = await fetch(url, config);
    
    logger.log(`Response status: ${response.status}`);
    logger.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    // Check for authentication errors only if auth was required
    if (response.status === 401 && options.includeAuth !== false) {
      logger.log('Received 401 Unauthorized, token may be invalid');
      TokenValidationService.redirectToSignIn();
      return;
    }
    
    if (!response.ok) {
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          logger.error('Failed to parse error response as JSON:', jsonError);
        }
      } else {
        // If it's HTML (like an error page), get the text
        try {
          const errorText = await response.text();
          logger.error('Non-JSON error response:', errorText.substring(0, 200));
        } catch (textError) {
          logger.error('Failed to read error response:', textError);
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // Handle empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }
    
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      logger.log(`API response data:`, data);
      return data;
    } else {
      // If it's not JSON, return the text
      const text = await response.text();
      logger.warn('Non-JSON response received:', text.substring(0, 200));
      return text;
    }
  } catch (error) {
    logger.error('API call failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (credentials) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Logout user
  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST',
    });
  },

  // Confirm email
  confirmEmail: async (token) => {
    return apiCall(`/auth/confirm?token=${token}`, {
      method: 'GET',
    });
  },

  // Delete user (Admin only)
  deleteUser: async (userId) => {
    return apiCall(`/auth/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiCall(`/auth/forgot-password?email=${email}`, {
      method: 'POST',
    });
  },

  // Reset password
  resetPassword: async (token, passwordData) => {
    return apiCall(`/auth/reset-password?token=${token}`, {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },

  // Refresh session (for deployed platform)
  refresh: async () => {
    return apiCall('/auth/refresh', {
      method: 'GET',
    });
  },
};

// Courses API
export const coursesAPI = {
  // Get all courses with pagination and filters
  getAllCourses: async (page = 0, size = 20, query = null, categories = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (query) params.append('query', query);
    if (categories && categories.length > 0) {
      categories.forEach(cat => params.append('categories', cat));
    }
    
    return apiCall(`/courses?${params.toString()}`, {
      method: 'GET',
      includeAuth: false,
    });
  },

  // Get course by ID
  getCourseById: async (id) => {
    return apiCall(`/courses/${id}`, {
      method: 'GET',
      includeAuth: false,
    });
  },

  // Get enrolled courses
  getEnrolledCourses: async (page = 0, size = 20) => {
    return apiCall(`/courses/me?page=${page}&size=${size}`, {
      method: 'GET',
    });
  },

  // Create course
  createCourse: async (courseData) => {
    return apiCall('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  // Delete course
  deleteCourse: async (id) => {
    return apiCall(`/courses/${id}`, {
      method: 'DELETE',
    });
  },

  // Enroll in course
  enrollCourse: async (id) => {
    return apiCall(`/courses/${id}/enroll`, {
      method: 'POST',
    });
  },

  // Cancel enrollment
  cancelEnrollment: async (id) => {
    return apiCall(`/courses/${id}/cancel`, {
      method: 'POST',
    });
  },

  // Get lessons by section
  getLessonsBySection: async (sectionId) => {
    return apiCall(`/courses/sections/${sectionId}/lessons`, {
      method: 'GET',
      includeAuth: false,
    });
  },

  // Get number of lessons by section
  getNumberOfLessonsBySection: async (sectionId) => {
    console.log(`Fetching lesson count for section ${sectionId}`);
    const endpoint = `/courses/sections/${sectionId}/number-of-lessons`;
    console.log(`Calling endpoint: ${endpoint}`);
    const result = await apiCall(endpoint, {
      method: 'GET',
      includeAuth: false,
    });
    console.log(`Lesson count for section ${sectionId}:`, result, 'Type:', typeof result);
    return result;
  },

  // Get course preview (sections only, no lessons)
  getCoursePreview: async (id) => {
    return apiCall(`/courses/${id}/preview`, {
      method: 'GET',
      includeAuth: false,
    });
  },

  // Workshop API
  inviteToWorkshop: async (invitationData) => {
    console.log('Sending workshop invitation:', invitationData);
    return apiCall('/workshops/invite', {
      method: 'POST',
      body: JSON.stringify(invitationData),
      includeAuth: false,
    });
  },

  // Get course learning content (full content with lessons)
  getCourseLearning: async (id) => {
    return apiCall(`/courses/${id}/learn`, {
      method: 'GET',
    });
  },

  // Mark lesson as complete
  markLessonComplete: async (lessonId) => {
    return apiCall(`/courses/lessons/${lessonId}/complete`, {
      method: 'POST',
    });
  },

  // Get lesson completion status
  getLessonCompletion: async (courseId) => {
    return apiCall(`/courses/${courseId}/completion`, {
      method: 'GET',
    });
  },
  
  // Course Progress API
  getCourseProgress: async (courseId) => {
    return apiCall(`/courses/${courseId}/progress`, {
      method: 'GET',
    });
  },
  
  markLessonComplete: async (courseId, lessonId, completed = true) => {
    return apiCall(`/courses/${courseId}/lessons/${lessonId}/complete?completed=${completed}`, {
      method: 'POST',
    });
  },
};

// Jobs API
export const jobsAPI = {
  // Get all jobs with pagination and filters
  getAllJobs: async (page = 0, size = 20, query = null, categories = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (query) params.append('query', query);
    if (categories && categories.length > 0) {
      categories.forEach(cat => params.append('categories', cat));
    }
    
    return apiCall(`/jobs?${params.toString()}`, {
      method: 'GET',
      includeAuth: false,
    });
  },

  // Create job
  createJob: async (jobData) => {
    return apiCall('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  // Delete job
  deleteJob: async (id) => {
    return apiCall(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  // Apply for job
  applyForJob: async (id) => {
    return apiCall(`/jobs/${id}/apply`, {
      method: 'POST',
    });
  },

  // Cancel job application
  cancelJobApplication: async (id) => {
    return apiCall(`/jobs/${id}/cancel`, {
      method: 'POST',
    });
  },

  // Get my applied jobs
  getMyAppliedJobs: async (page = 0, size = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    return apiCall(`/jobs/me?${params.toString()}`, {
      method: 'GET',
    });
  },

  // Get my jobs (for recruiters)
  getMyJobs: async (page = 0, size = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    return apiCall(`/jobs/my-jobs?${params.toString()}`, {
      method: 'GET',
    });
  },

  // Get job applications
  getJobApplications: async (jobId) => {
    return apiCall(`/jobs/${jobId}/applications`, {
      method: 'GET',
    });
  },

  // Send offer to candidate
  sendOffer: async (offerData) => {
    return apiCall('/offers', {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  },

  // Get job by ID
  getJobById: async (id) => {
    return apiCall(`/jobs/${id}`, {
      method: 'GET',
      includeAuth: false,
    });
  },
};

// Offers API
export const offersAPI = {
  // Send offer
  sendOffer: async (offerData) => {
    return apiCall('/offers', {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  },

  // Get my offers
  getMyOffers: async () => {
    return apiCall('/offers/me', {
      method: 'GET',
    });
  },

  // Get all offers (Admin)
  getAllOffers: async () => {
    return apiCall('/offers', {
      method: 'GET',
    });
  },

  // Respond to offer
  respondToOffer: async (offerId, status) => {
    return apiCall(`/offers/${offerId}/respond?status=${status}`, {
      method: 'POST',
    });
  },

  // Withdraw offer
  withdrawOffer: async (offerId) => {
    return apiCall(`/offers/${offerId}/withdraw`, {
      method: 'POST',
    });
  },
};

// Blogs API
export const blogsAPI = {
  // Get all blogs with pagination
  getAllBlogs: async (page = 0, size = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    return apiCall(`/blogs?${params.toString()}`, {
      method: 'GET',
      includeAuth: true,
    });
  },

  // Get blog by ID
  getBlogById: async (id) => {
    return apiCall(`/blogs/${id}`, {
      method: 'GET',
      includeAuth: false,
    });
  },

  // Get blog comments
  getComments: async (id, page = 0, size = 15) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    return apiCall(`/blogs/${id}/comments?${params.toString()}`, {
      method: 'GET',
      includeAuth: true,
    });
  },

  // Get comment replies
  getReplies: async (commentId, page = 0, size = 15) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    return apiCall(`/blogs/comments/${commentId}/replies?${params.toString()}`, {
      method: 'GET',
      includeAuth: true,
    });
  },

  // Get blog likes
  getBlogLikes: async (id, page = 0, size = 15) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    return apiCall(`/blogs/${id}/likes?${params.toString()}`, {
      method: 'GET',
      includeAuth: true,
    });
  },

  // Get comment likes
  getCommentLikes: async (commentId, page = 0, size = 15) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    return apiCall(`/blogs/comments/${commentId}/likes?${params.toString()}`, {
      method: 'GET',
      includeAuth: false,
    });
  },

  // Like blog
  likeBlog: async (id) => {
    return apiCall(`/blogs/${id}/like`, {
      method: 'POST',
    });
  },

  // Like comment
  likeComment: async (commentId) => {
    return apiCall(`/blogs/comments/${commentId}/like`, {
      method: 'POST',
    });
  },

  // Create blog with media upload
  createBlog: async (content, mediaType, file) => {
    const formData = new FormData();
    
    if (content) {
      formData.append('content', content);
    }
    
    if (mediaType) {
      formData.append('mediaType', mediaType);
    }
    
    if (file) {
      formData.append('file', file);
    }

    return apiCall('/blogs', {
      method: 'POST',
      body: formData,
    });
  },

  // Delete blog
  deleteBlog: async (id) => {
    return apiCall(`/blogs/${id}`, {
      method: 'DELETE',
    });
  },

  // Add comment
  addComment: async (id, content, parentId = null) => {
    const params = parentId ? `?parentId=${parentId}` : '';
    return apiCall(`/blogs/${id}/comments${params}`, {
      method: 'POST',
      body: content,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  },

  // Delete comment
  deleteComment: async (commentId) => {
    return apiCall(`/blogs/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};

// Candidates API
export const candidatesAPI = {
  // Get all candidates with pagination and filters
  getAllCandidates: async (page = 0, size = 20, query = null, skills = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (query) params.append('query', query);
    if (skills && skills.length > 0) {
      skills.forEach(skill => params.append('skills', skill.toLowerCase()));
    }
    
    return apiCall(`/candidates?${params.toString()}`, {
      method: 'GET',
      includeAuth: false,
    });
  },

  // Get my profile
  getMyProfile: async () => {
    return apiCall('/candidates/me', {
      method: 'GET',
    });
  },

  // Update my profile
  updateMyProfile: async (profileData) => {
    return apiCall('/candidates/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Get candidate by ID
  getCandidateById: async (candidateId) => {
    return apiCall(`/candidates/${candidateId}`, {
      method: 'GET',
      includeAuth: false,
    });
  },

  // Add skills to my profile
  addSkillsToMyProfile: async (skillNames) => {
    return apiCall('/candidates/me/skills', {
      method: 'POST',
      body: JSON.stringify({ skillNames }),
    });
  },

  // Rate candidate skill (Admin only)
  rateCandidateSkill: async (candidateId, skillId, rating) => {
    return apiCall(`/candidates/${candidateId}/skills/rating`, {
      method: 'POST',
      body: JSON.stringify({ skillId, rating }),
    });
  },
};

// Recruiters API
export const recruitersAPI = {
  // Get all recruiters (Admin)
  getAllRecruiters: async (page = 0, size = 10, query = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (query) params.append('query', query);
    
    return apiCall(`/recruiters?${params.toString()}`, {
      method: 'GET',
    });
  },

  // Get my profile (Recruiter)
  getMyProfile: async () => {
    return apiCall('/recruiters/me', {
      method: 'GET',
    });
  },

  // Update my profile (Recruiter)
  updateMyProfile: async (profileData) => {
    return apiCall('/recruiters/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Skills API
export const skillsAPI = {
  // Get all available skills
  getAllSkills: async () => {
    return apiCall('/candidates/skills', {
      method: 'GET',
      includeAuth: false,
    });
  },
};

// Workshops API
export const workshopsAPI = {
  // Invite to workshop
  inviteToWorkshop: async (invitationData) => {
    return apiCall('/workshops/invite', {
      method: 'POST',
      body: JSON.stringify(invitationData),
    });
  },
};

// Payments API
export const paymentsAPI = {
  // Initiate a payment
  initiatePayment: async (paymentData) => {
    // Note: Payment endpoint uses /api/payments (not /api/v1/payments)
    const url = import.meta.env.VITE_PAYMENT_API_URL || 'https://ignite-qjis.onrender.com/api/payments/initiate';
    const token = getAuthToken();
    
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(paymentData),
    };

    logger.log(`Making payment API call to: ${url}`);
    logger.log(`Request config:`, config);

    try {
      const response = await fetch(url, config);
      
      logger.log(`Response status: ${response.status}`);
      
      if (response.status === 401) {
        logger.log('Received 401 Unauthorized');
        TokenValidationService.redirectToSignIn();
        return;
      }
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            console.error('Failed to parse error response as JSON:', jsonError);
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      logger.log(`Payment API response:`, data);
      return data;
    } catch (error) {
      logger.error('Payment API call failed:', error);
      throw error;
    }
  },
};

// Export all APIs
export default {
  auth: authAPI,
  courses: coursesAPI,
  jobs: jobsAPI,
  offers: offersAPI,
  blogs: blogsAPI,
  candidates: candidatesAPI,
  recruiters: recruitersAPI,
  skills: skillsAPI,
  workshops: workshopsAPI,
  payments: paymentsAPI,
};

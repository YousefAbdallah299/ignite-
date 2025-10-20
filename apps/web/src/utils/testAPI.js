// Test script to verify API integration
// Run this in browser console to test API calls

import { authAPI, coursesAPI, jobsAPI, blogsAPI } from './apiClient';

export const testAPI = {
  // Test authentication
  async testAuth() {
    console.log('Testing authentication...');
    try {
      // Test login
      const loginResponse = await authAPI.login({
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('Login response:', loginResponse);
      
      // Test logout
      await authAPI.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Auth test failed:', error);
    }
  },

  // Test courses API
  async testCourses() {
    console.log('Testing courses API...');
    try {
      const courses = await coursesAPI.getAllCourses(0, 10);
      console.log('Courses response:', courses);
    } catch (error) {
      console.error('Courses test failed:', error);
    }
  },

  // Test jobs API
  async testJobs() {
    console.log('Testing jobs API...');
    try {
      const jobs = await jobsAPI.getAllJobs(0, 10);
      console.log('Jobs response:', jobs);
    } catch (error) {
      console.error('Jobs test failed:', error);
    }
  },

  // Test blogs API
  async testBlogs() {
    console.log('Testing blogs API...');
    try {
      const blogs = await blogsAPI.getAllBlogs(0, 10);
      console.log('Blogs response:', blogs);
    } catch (error) {
      console.error('Blogs test failed:', error);
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('Starting API tests...');
    await this.testCourses();
    await this.testJobs();
    await this.testBlogs();
    console.log('All tests completed');
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.testAPI = testAPI;
}

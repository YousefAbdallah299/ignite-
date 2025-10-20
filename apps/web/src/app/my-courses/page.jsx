'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCoursesAPI } from "@/hooks/useCoursesAPI";
import { coursesAPI } from "@/utils/apiClient";
import { useAuthAPI } from "@/hooks/useAuthAPI";
import { BookOpen, Play, ArrowRight, GraduationCap, ArrowLeft } from "lucide-react";

export default function MyCoursesPage() {
  const { isCandidate } = useAuthAPI();
  const { getEnrolledCourses } = useCoursesAPI();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0, limit: 20 });

  // Helper function for consistent skill level colors
  const getSkillLevelStyle = (skillLevel) => {
    const level = skillLevel?.toLowerCase() || 'beginner';
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-600';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-600';
      case 'advanced':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-green-100 text-green-600';
    }
  };

  useEffect(() => {
    if (isCandidate) {
      fetchEnrolledCourses();
    } else {
      setError('Access denied. This page is only available for job seekers.');
      setLoading(false);
    }
  }, [isCandidate]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getEnrolledCourses(0, 100);
      console.log('Enrolled courses response:', response);

      if (response && response.content && Array.isArray(response.content)) {
        const coursesWithDetails = await Promise.all(
          response.content.map(async (course) => {
            try {
              // Fetch individual course details to get section count
              const courseDetails = await coursesAPI.getCourseById(course.id);
              return {
                ...course,
                sectionCount: courseDetails?.sections?.length || 0,
                skillLevel: course.skillLevel || 'BEGINNER'
              };
            } catch (error) {
              console.warn(`Failed to fetch details for course ${course.id}:`, error);
              return {
                ...course,
                sectionCount: 0,
                skillLevel: course.skillLevel || 'BEGINNER'
              };
            }
          })
        );
        
        setCourses(coursesWithDetails);
        setPagination({
          page: response.page + 1,
          pages: response.totalPages,
          total: response.totalElements,
          limit: response.size,
        });
        console.log('Enrolled courses loaded:', coursesWithDetails.length);
      } else {
        console.log('No enrolled courses response or content is not an array');
        setCourses([]);
        setPagination({ page: 1, pages: 0, total: 0, limit: 20 });
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setError(error.message || 'Failed to load enrolled courses');
      setCourses([]);
      setPagination({ page: 1, pages: 0, total: 0, limit: 20 });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLearning = (courseId) => {
    window.location.href = `/courses/${courseId}/learn`;
  };

  const handleViewCourse = (courseId) => {
    window.location.href = `/courses/${courseId}`;
  };

  if (!isCandidate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">
              Access Denied
            </div>
            <p className="text-gray-600 mb-6">
              This page is only available for job seekers.
            </p>
            <a
              href="/courses"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Browse All Courses
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your enrolled courses...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">
              {error}
            </div>
            <button
              onClick={fetchEnrolledCourses}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium mr-4"
            >
              Try Again
            </button>
            <a
              href="/courses"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Browse Courses
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 page-fade-in">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="w-12 h-12 text-green-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">
                My Courses
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Continue your learning journey with your enrolled courses
            </p>
          </div>

          {/* Back to All Courses */}
          <div className="text-center">
            <a
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md border border-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Browse All Courses
            </a>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {loading ? 'Loading...' : `${pagination.total || 0} enrolled courses`}
              </h2>
              <p className="text-gray-600 text-sm">
                {courses.length > 0 ? 'Click "Continue Learning" to access course content' : 'You haven\'t enrolled in any courses yet'}
              </p>
            </div>
          </div>

          {/* Course Listings */}
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
                  {/* Course Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-green-600" />
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    {/* Course Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
                            Enrolled
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getSkillLevelStyle(course.skillLevel)}`}>
                          {course.skillLevel ? course.skillLevel.charAt(0) + course.skillLevel.slice(1).toLowerCase() : 'Beginner'}
                        </span>
                      </div>
                    </div>

                    {/* Course Description */}
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                      {course.description}
                    </p>

                    {/* Categories */}
                    {course.categories && (Array.isArray(course.categories) ? course.categories.length > 0 : course.categories.size > 0) && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {(Array.isArray(course.categories) ? course.categories : Array.from(course.categories)).slice(0, 2).map((category, index) => (
                          <span key={index} className="bg-gradient-to-r from-green-50 to-blue-50 text-green-600 px-3 py-1.5 rounded-full text-xs font-medium border border-green-100">
                            {typeof category === 'string' ? category : category.name}
                          </span>
                        ))}
                        {(Array.isArray(course.categories) ? course.categories.length : course.categories.size) > 2 && (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium">
                            +{(Array.isArray(course.categories) ? course.categories.length : course.categories.size) - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Course Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mb-4">
                      <div className="flex items-center gap-4 text-gray-500 text-sm">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.sectionCount || 0} sections</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleContinueLearning(course.id)}
                        className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Play className="w-4 h-4" />
                        <span>Continue Learning</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleViewCourse(course.id)}
                        className="px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <GraduationCap className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                No Enrolled Courses
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You haven't enrolled in any courses yet. Browse our course catalog to start your learning journey!
              </p>
              <a
                href="/courses"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <BookOpen className="w-5 h-5" />
                Browse Courses
              </a>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

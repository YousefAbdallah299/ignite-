'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import PageFadeIn from "@/components/PageFadeIn";
import { useCoursesAPI } from "@/hooks/useCoursesAPI";
import { coursesAPI } from "@/utils/apiClient";
import { useAuthAPI } from "@/hooks/useAuthAPI";
import { Search, Filter, Clock, DollarSign, Star, BookOpen, Play, User, ArrowRight, CheckCircle, GraduationCap } from "lucide-react";

const courseCategories = [
  'Web Development', 'Data Science', 'Marketing', 'Design', 'Business', 
  'Programming', 'Photography', 'Writing', 'Finance', 'Personal Development'
];


function CourseCard({ course, onEnrollmentChange, enrolledCourseIds, isCandidate }) {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  // Check enrollment status on component mount
  useEffect(() => {
    setIsEnrolled(enrolledCourseIds.has(course.id));
  }, [course.id, enrolledCourseIds]);

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

  const handlePreview = () => {
    window.location.href = `/courses/${course.id}`;
  };

  const handleEnrollment = async (e) => {
    e.preventDefault();
    
    try {
      setEnrollmentLoading(true);
      
      if (isEnrolled) {
        // Cancel enrollment
        await coursesAPI.cancelEnrollment(course.id);
        setIsEnrolled(false);
        console.log('Enrollment cancelled');
        
        // Notify parent component of enrollment change
        if (onEnrollmentChange) {
          onEnrollmentChange(course.id, false);
        }
      } else {
        // Enroll in course
        await coursesAPI.enrollCourse(course.id);
        setIsEnrolled(true);
        console.log('Enrolled in course');
        
        // Notify parent component of enrollment change
        if (onEnrollmentChange) {
          onEnrollmentChange(course.id, true);
        }
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      // Handle specific error cases
      if (error.message.includes('not currently enrolled')) {
        setIsEnrolled(false);
        alert('You are not enrolled in this course');
      } else if (error.message.includes('already enrolled')) {
        setIsEnrolled(true);
        alert('You are already enrolled in this course');
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setEnrollmentLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
      {/* Course Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
        <BookOpen className="w-16 h-16 text-red-600" />
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
              {isEnrolled && (
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
                  Enrolled
                </span>
              )}
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
              <span key={index} className="bg-gradient-to-r from-red-50 to-pink-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-medium border border-red-100">
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
          {/* Enroll/Cancel Button - Only show for candidates */}
          {isCandidate && (
            <button
              onClick={handleEnrollment}
              disabled={enrollmentLoading}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isEnrolled
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-300'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
              } ${enrollmentLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {enrollmentLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <>
                  {isEnrolled ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      <span>Enroll</span>
                    </>
                  )}
                </>
              )}
            </button>
          )}

          {/* Preview Button */}
          <button
            onClick={handlePreview}
            className="px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
          >
            <Play className="w-4 h-4" />
          </button>
        </div>

        {/* Enrollment Status Message */}
        {isCandidate && (
          <div className="mt-4 text-center text-sm text-gray-500">
            {isEnrolled ? (
              <p>You are enrolled in this course</p>
            ) : (
              <p>Enroll to access course content</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const { getAllCourses, getEnrolledCourses, loading, error } = useCoursesAPI();
  const { user, isCandidate } = useAuthAPI();
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [apiError, setApiError] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '',
    categories: [],
    page: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    // Get URL parameters on component mount
    const urlParams = new URLSearchParams(window.location.search);
    const categoriesParam = urlParams.get('categories');
    const categories = categoriesParam ? categoriesParam.split(',').filter(cat => cat.trim()) : [];
    
    const initialFilters = {
      search: urlParams.get('search') || '',
      categories: categories,
      page: 0
    };
    setFilters(initialFilters);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchEnrolledCourses = async () => {
    if (!isCandidate) return;
    
    try {
      const response = await getEnrolledCourses(0, 100);
      
      if (response && response.content && Array.isArray(response.content)) {
        const enrolledIds = new Set(response.content.map(course => course.id));
        setEnrolledCourses(enrolledIds);
      } else {
        console.log('No enrolled courses response or content is not an array');
        setEnrolledCourses(new Set());
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setEnrolledCourses(new Set());
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
    fetchAvailableCategories();
  }, [isCandidate]);

  const fetchAvailableCategories = async () => {
    try {
      // First try to get categories from actual courses
      const response = await getAllCourses(0, 1000, null, null);
      if (response && response.content && Array.isArray(response.content)) {
        const allCategories = new Set();
        response.content.forEach(course => {
          if (course.categories) {
            const categories = Array.isArray(course.categories) ? course.categories : Array.from(course.categories);
            categories.forEach(cat => {
              if (typeof cat === 'string') {
                allCategories.add(cat);
              } else if (cat && cat.name) {
                allCategories.add(cat.name);
              }
            });
          }
        });
        
        const sortedCategories = Array.from(allCategories).sort();
        setAvailableCategories(sortedCategories);
      } else {
        // Fallback to predefined categories if no courses found
        setAvailableCategories(courseCategories);
      }
    } catch (error) {
      console.error('Error fetching available categories:', error);
      // Fallback to predefined categories on error
      setAvailableCategories(courseCategories);
    }
  };

  const fetchCourses = async () => {
    try {
      setApiError(null);
      console.log('Fetching courses with filters:', filters);
      const categories = filters.categories && filters.categories.length > 0 ? filters.categories : null;
      const response = await getAllCourses(
        filters.page,
        20,
        filters.search || null,
        categories
      );

      console.log('Courses API response:', response);

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
        console.log('Courses loaded:', coursesWithDetails.length);
      } else {
        console.log('No response received from courses API or content is not an array');
        setCourses([]);
        setPagination({ page: 1, pages: 0, total: 0, limit: 20 });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setApiError(error.message || 'Failed to load courses');
      setCourses([]);
      setPagination({ page: 1, pages: 0, total: 0, limit: 20 });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const handleCategoryToggle = (category) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(cat => cat !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories, page: 0 };
    });
  };

  const clearAllFilters = () => {
    setFilters({ search: '', categories: [], page: 0 });
    setCategorySearch('');
  };

  const getFilteredCategories = () => {
    if (!categorySearch.trim()) {
      return availableCategories;
    }
    return availableCategories.filter(category =>
      category.toLowerCase().includes(categorySearch.toLowerCase())
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <PageFadeIn className="bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-white to-pink-50 py-12 initial-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Learn New Skills
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advance your career with our comprehensive selection of professional courses
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Course title, skills, or instructor"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-0 outline-none text-gray-700 placeholder-gray-400 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
                
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
                >
                  Search Courses
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <RevealOnScroll>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-red-600"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Categories {filters.categories.length > 0 && `(${filters.categories.length})`}
                  </label>
                  
                  {/* Category Search Input */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                    {categorySearch && (
                      <button
                        onClick={() => setCategorySearch('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-4 h-4"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  {/* Categories List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {getFilteredCategories().length > 0 ? (
                      getFilteredCategories().map(category => (
                        <label key={category} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category)}
                            onChange={() => handleCategoryToggle(category)}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700 flex-1">{category}</span>
                        </label>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        {categorySearch ? 'No categories found matching your search' : 'No categories available'}
                      </div>
                    )}
                  </div>
                  
                  {/* Search Results Info */}
                  {categorySearch && (
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      Showing {getFilteredCategories().length} of {availableCategories.length} categories
                    </div>
                  )}
                  
                  {/* Selected Categories Display */}
                  {filters.categories.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-600 mb-2">Selected categories:</div>
                      <div className="flex flex-wrap gap-2">
                        {filters.categories.map(category => (
                          <span
                            key={category}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full"
                          >
                            {category}
                            <button
                              onClick={() => handleCategoryToggle(category)}
                              className="ml-1 text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>


                {/* Clear Filters */}
                <button
                  onClick={clearAllFilters}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Course Listings */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {loading ? 'Loading...' : `${pagination.total || 0} courses found`}
                </h2>
                <p className="text-gray-600 text-sm">
                  Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total || 0)} - {Math.min(pagination.page * pagination.limit, pagination.total || 0)} of {pagination.total || 0} results
                </p>
                
                {/* Active Filters Display */}
                {(filters.search || filters.categories.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {filters.search && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Search: "{filters.search}"
                        <button
                          onClick={() => handleFilterChange('search', '')}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.categories.map(category => (
                      <span
                        key={category}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full"
                      >
                        {category}
                        <button
                          onClick={() => handleCategoryToggle(category)}
                          className="ml-1 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {isCandidate && (
                <a
                  href="/my-courses"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md"
                >
                  <GraduationCap className="w-5 h-5" />
                  My Courses ({enrolledCourses.size})
                </a>
              )}
            </div>

            {/* Course Listings */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="text-red-600 text-sm">
                    <strong>Error:</strong> {apiError}
                  </div>
                  <button
                    onClick={() => {
                      setApiError(null);
                      fetchCourses();
                    }}
                    className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Course Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-300 rounded"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(course => (
                    <CourseCard 
                      key={course.id} 
                      course={course} 
                      enrolledCourseIds={enrolledCourses}
                      isCandidate={isCandidate}
                      onEnrollmentChange={(courseId, newStatus) => {
                        // Update the enrolled courses set
                        setEnrolledCourses(prev => {
                          const newSet = new Set(prev);
                          if (newStatus) {
                            newSet.add(courseId);
                          } else {
                            newSet.delete(courseId);
                          }
                          return newSet;
                        });
                        console.log(`Course ${courseId} enrollment status changed to:`, newStatus);
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex gap-2">
                      {pagination.page > 1 && (
                        <button
                          onClick={() => handleFilterChange('page', pagination.page - 1)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Previous
                        </button>
                      )}
                      
                      {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handleFilterChange('page', page)}
                            className={`px-4 py-2 rounded-lg ${
                              page === pagination.page
                                ? 'bg-red-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      {pagination.page < pagination.pages && (
                        <button
                          onClick={() => handleFilterChange('page', pagination.page + 1)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {courses.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      </RevealOnScroll>

      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>

      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </PageFadeIn>
  );
}
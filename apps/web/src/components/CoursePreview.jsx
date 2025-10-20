import React from 'react';
import { BookOpen, Users, ArrowRight, CheckCircle, Lock } from 'lucide-react';

const CoursePreview = ({ 
  course, 
  isEnrolled, 
  enrollmentLoading, 
  onEnrollmentChange, 
  onContinueLearning,
  isCandidate 
}) => {
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

  const handleEnrollment = async (e) => {
    e.preventDefault();
    await onEnrollmentChange();
  };

  const handleContinueLearning = () => {
    if (isEnrolled) {
      onContinueLearning();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      {/* Course Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {course.title}
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            {course.description}
          </p>
        </div>
              <div className="ml-6">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getSkillLevelStyle(course.skillLevel)}`}>
                  {course.skillLevel ? course.skillLevel.charAt(0) + course.skillLevel.slice(1).toLowerCase() : 'Beginner'}
                </span>
              </div>
      </div>

      {/* Course Info */}
      <div className="flex items-center gap-6 text-gray-500 text-sm mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>{course.sections?.length || 0} sections</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>Unlimited access</span>
        </div>
      </div>

      {/* Categories */}
      {course.categories && (Array.isArray(course.categories) ? course.categories.length > 0 : course.categories.size > 0) && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(course.categories) ? course.categories : Array.from(course.categories)).map((category, index) => (
              <span key={index} className="bg-gradient-to-r from-red-50 to-pink-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-medium border border-red-100">
                {typeof category === 'string' ? category : category.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Course Sections Preview */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
        
        {course.sections && course.sections.length > 0 ? (
          <div className="space-y-4">
            {course.sections.map((section, index) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  <div className="flex items-center gap-2 text-gray-500 text-sm ml-auto">
                    {isCandidate ? (
                      isEnrolled ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Available</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Locked</span>
                        </>
                      )
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span>Preview</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No sections available yet</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {/* Continue Learning Button - Only show for enrolled candidates */}
        {isCandidate && isEnrolled && (
          <button
            onClick={handleContinueLearning}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <BookOpen className="w-4 h-4" />
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

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
                    <span>Cancel Enrollment</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>Enroll Now</span>
                  </>
                )}
              </>
            )}
          </button>
        )}
      </div>

      {/* Enrollment Status Message */}
      {isCandidate && (
        <div className="mt-4 text-center text-sm text-gray-500">
          {isEnrolled ? (
            <p>You are enrolled in this course. Click "Continue Learning" to access all lessons.</p>
          ) : (
            <p>Enroll to access all lessons and course content</p>
          )}
        </div>
      )}

      {/* Preview Notice for Non-Candidates */}
      {!isCandidate && (
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Course preview available</p>
          <p className="text-xs mt-1">Enrollment restricted to job seekers</p>
        </div>
      )}
    </div>
  );
};

export default CoursePreview;

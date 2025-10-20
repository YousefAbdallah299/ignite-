import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CoursePreview from "@/components/CoursePreview";
import { coursesAPI } from "@/utils/apiClient";
import { useAuthAPI } from "@/hooks/useAuthAPI";
import { ArrowLeft } from "lucide-react";

export default function CourseDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const courseId = params.id;
  const { isCandidate } = useAuthAPI();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      checkEnrollmentStatus();
    }
  }, [courseId]);

  const checkEnrollmentStatus = async () => {
    try {
      // Try to enroll - if it fails with "already enrolled", user is enrolled
      await coursesAPI.enrollCourse(courseId);
      // If we get here, user was not enrolled, so cancel the enrollment we just made
      await coursesAPI.cancelEnrollment(courseId);
      setIsEnrolled(false);
    } catch (error) {
      if (error.message.includes('already enrolled')) {
        setIsEnrolled(true);
      } else {
        // For other errors, assume not enrolled
        setIsEnrolled(false);
      }
    }
  };

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const courseData = await coursesAPI.getCourseById(courseId);
      console.log('Course details:', courseData);
      
      setCourse(courseData);
      
    } catch (error) {
      console.error('Error fetching course details:', error);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentChange = async () => {
    try {
      setEnrollmentLoading(true);
      
      if (isEnrolled) {
        // Cancel enrollment
        await coursesAPI.cancelEnrollment(courseId);
        setIsEnrolled(false);
        console.log('Enrollment cancelled');
      } else {
      // Enroll in course
      await coursesAPI.enrollCourse(courseId);
      setIsEnrolled(true);
      console.log('Successfully enrolled');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      // Handle specific error cases
      if (error.message.includes('already enrolled')) {
        setIsEnrolled(true);
        alert('You are already enrolled in this course');
      } else if (error.message.includes('not currently enrolled')) {
        setIsEnrolled(false);
        alert('You are not enrolled in this course');
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleContinueLearning = () => {
    navigate(`/courses/${courseId}/learn`);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">
              {error || 'Course not found'}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 page-fade-in">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </button>

        {/* Course Preview */}
        <CoursePreview
          course={course}
          isEnrolled={isEnrolled}
          enrollmentLoading={enrollmentLoading}
          onEnrollmentChange={handleEnrollmentChange}
          onContinueLearning={handleContinueLearning}
          isCandidate={isCandidate}
        />
      </div>

      <Footer />
    </div>
  );
}
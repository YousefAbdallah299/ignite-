import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { coursesAPI } from "@/utils/apiClient";
import { useAuthAPI } from "@/hooks/useAuthAPI";
import { useCoursesAPI } from "@/hooks/useCoursesAPI";
import { BookOpen, Clock, Users, ArrowLeft, Play, CheckCircle, Lock, ChevronDown, ChevronRight, FileText, Image, Video, ArrowRight, Maximize2, Minimize2, Volume2, VolumeX, X, GraduationCap, Star } from "lucide-react";
import RevealOnScroll from '@/components/RevealOnScroll';

export default function CourseLearningPage() {
  const params = useParams();
  const navigate = useNavigate();
  const courseId = params.id;
  const { isCandidate } = useAuthAPI();
  const { getNumberOfLessonsBySection } = useCoursesAPI();

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
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [currentSection, setCurrentSection] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sectionsWithLessons, setSectionsWithLessons] = useState(new Map());
  const [loadingLessons, setLoadingLessons] = useState(new Set());
  const [showCongrats, setShowCongrats] = useState(false);
  const [courseProgress, setCourseProgress] = useState(null);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      checkEnrollmentStatus();
      fetchProgressFromBackend();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const courseData = await coursesAPI.getCourseById(courseId);
      setCourse(courseData);
      
      // Initialize sections map and fetch lesson counts immediately
      if (courseData?.sections?.length > 0) {
        const sectionsMap = new Map();
        
        // First, initialize all sections with empty lessons and default count
        courseData.sections.forEach(section => {
          sectionsMap.set(section.id, {
            ...section,
            lessons: [],
            lessonsLoaded: false,
            lessonCount: 0 // Initialize with 0, will be updated below
          });
        });
        
        // Set initial state so UI shows sections immediately
        setSectionsWithLessons(sectionsMap);
        
        // Then fetch lesson counts for all sections in parallel and update
        // For now, let's use the working lessons API and count the results
        const lessonCountPromises = courseData.sections.map(async (section) => {
          try {
            console.log(`Fetching lessons for section ${section.id} (${section.title}) to count them`);
            
            // Use the working lessons API and count the results
            const lessons = await coursesAPI.getLessonsBySection(section.id);
            const lessonCount = lessons ? lessons.length : 0;
            
            console.log(`Section ${section.id} (${section.title}) has ${lessonCount} lessons`);
            return {
              sectionId: section.id,
              lessonCount: lessonCount
            };
          } catch (err) {
            console.error(`Failed to fetch lessons for section ${section.id}:`, err);
            return {
              sectionId: section.id,
              lessonCount: 0
            };
          }
        });
        
        const lessonCountResults = await Promise.all(lessonCountPromises);
        console.log('Lesson count results:', lessonCountResults);
        
        // Update sections with actual lesson counts
        setSectionsWithLessons(prev => {
          const newMap = new Map(prev);
          lessonCountResults.forEach(({ sectionId, lessonCount }) => {
            const section = newMap.get(sectionId);
            if (section) {
              newMap.set(sectionId, {
                ...section,
                lessonCount
              });
            }
          });
          return newMap;
        });
        
        // Auto-expand first section and load its lessons
        const firstSectionId = courseData.sections[0].id;
        setExpandedSections(new Set([firstSectionId]));
        // Don't await this to avoid blocking the UI update
        loadSectionLessons(firstSectionId);
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError(err.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const loadSectionLessons = async (sectionId) => {
    try {
      setLoadingLessons(prev => new Set(prev).add(sectionId));
      
      const lessons = await coursesAPI.getLessonsBySection(sectionId);
      setSectionsWithLessons(prev => {
        const newMap = new Map(prev);
        const section = newMap.get(sectionId);
        if (section) {
          newMap.set(sectionId, {
            ...section,
            lessons: lessons || [],
            lessonsLoaded: true,
            // Preserve the lessonCount
            lessonCount: section.lessonCount
          });
        }
        return newMap;
      });
      
      // Set current section if it's the first one or if it's being expanded
      const updatedSection = sectionsWithLessons.get(sectionId);
      if (updatedSection && (!currentSection || expandedSections.has(sectionId))) {
        setCurrentSection({
          ...updatedSection,
          lessons: lessons || [],
          lessonsLoaded: true
        });
      }
    } catch (err) {
      console.error(`Failed to fetch lessons for section ${sectionId}:`, err);
      setSectionsWithLessons(prev => {
        const newMap = new Map(prev);
        const section = newMap.get(sectionId);
        if (section) {
          newMap.set(sectionId, {
            ...section,
            lessons: [],
            lessonsLoaded: true,
            // Preserve the lessonCount
            lessonCount: section.lessonCount
          });
        }
        return newMap;
      });
    } finally {
      setLoadingLessons(prev => {
        const newSet = new Set(prev);
        newSet.delete(sectionId);
        return newSet;
      });
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const enrolledCourses = await coursesAPI.getEnrolledCourses(0, 100);
      const isEnrolledInCourse = enrolledCourses?.content?.some(course => course.id === parseInt(courseId));
      setIsEnrolled(isEnrolledInCourse);
    } catch (err) {
      console.error('Error checking enrollment:', err);
      setIsEnrolled(false);
    }
  };

  const fetchProgressFromBackend = async () => {
    try {
      const progress = await coursesAPI.getCourseProgress(courseId);
      setCourseProgress(progress);
      setCompletedLessons(new Set(progress.completedLessonIds || []));
      console.log('Loaded progress:', progress);
    } catch (err) {
      console.error('Error fetching progress:', err);
      // If no progress exists, that's okay - start fresh
      setCompletedLessons(new Set());
    }
  };
  
  const markLessonAsComplete = async (lessonId, completed) => {
    try {
      setMarkingComplete(true);
      const updatedProgress = await coursesAPI.markLessonComplete(courseId, lessonId, completed);
      
      // Update local state
      setCourseProgress(updatedProgress);
      setCompletedLessons(new Set(updatedProgress.completedLessonIds || []));
      
      console.log('Progress updated:', updatedProgress);
      
      // Show congrats if course is 100% complete
      if (updatedProgress.completionPercentage === 100) {
        setShowCongrats(true);
        setTimeout(() => setShowCongrats(false), 5000);
      }
    } catch (err) {
      console.error('Error marking lesson complete:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  const toggleSection = async (sectionId) => {
    const section = sectionsWithLessons.get(sectionId);
    
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
        // Load lessons if not already loaded
        if (section && !section.lessonsLoaded) {
          loadSectionLessons(sectionId);
        }
      }
      return newSet;
    });
  };

  const handleLessonClick = (lesson, section, lessonIndex) => {
    setSelectedLesson(lesson);
    setCurrentSection(section);
    setCurrentLessonIndex(lessonIndex);
    setShowSidebar(false); // Hide sidebar on mobile when viewing lesson
  };

  const handleNextLesson = () => {
    if (!currentSection) return;
    
    const lessons = currentSection.lessons || [];
    if (currentLessonIndex < lessons.length - 1) {
      const nextLesson = lessons[currentLessonIndex + 1];
      setSelectedLesson(nextLesson);
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handlePreviousLesson = () => {
    if (!currentSection) return;
    
    if (currentLessonIndex > 0) {
      const lessons = currentSection.lessons || [];
      const prevLesson = lessons[currentLessonIndex - 1];
      setSelectedLesson(prevLesson);
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const toggleLessonCompletion = async (lessonId) => {
    const isCurrentlyCompleted = completedLessons.has(lessonId);
    await markLessonAsComplete(lessonId, !isCurrentlyCompleted);
  };

  const checkCourseCompletion = () => {
    const totalLessons = Array.from(sectionsWithLessons.values()).reduce((total, section) => total + (section.lessonCount || section.lessons?.length || 0), 0);
    const completedCount = completedLessons.size;
    return totalLessons > 0 && completedCount >= totalLessons;
  };

  const handleContinueToCongrats = () => {
    setShowCongrats(true);
  };

  const isVideoUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.includes('drive.google.com') || url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
  };

  const isImageUrl = (url) => {
    if (!url) return false;
    // Check for common image file extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.ico'];
    const lowerUrl = url.toLowerCase();
    
    // Check for file extensions
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
      return true;
    }
    
    // Check for common image hosting services
    const imageHosts = ['unsplash.com', 'images.unsplash.com', 'pixabay.com', 'pexels.com', 'imgur.com', 'flickr.com', 'photobucket.com'];
    if (imageHosts.some(host => lowerUrl.includes(host))) {
      return true;
    }
    
    // Check for data URLs (base64 images)
    if (lowerUrl.startsWith('data:image/')) {
      return true;
    }
    
    return false;
  };

  const CongratulationsPage = () => (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Congratulations Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xl">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Congratulations! 🎉</h1>
            <p className="text-green-100 text-lg">
              You've successfully completed <strong>{course?.title}</strong>
            </p>
          </div>

          {/* Completion Stats */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Sections Completed</h3>
                <p className="text-2xl font-bold text-blue-600">{Array.from(sectionsWithLessons.values()).length || 0}</p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Lessons Completed</h3>
                <p className="text-2xl font-bold text-green-600">{completedLessons.size}</p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Course Progress</h3>
                <p className="text-2xl font-bold text-purple-600">{Math.round(courseProgress?.completionPercentage || 0)}%</p>
              </div>
            </div>

            {/* Achievement Message */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-6 py-3 mb-4">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">Achievement Unlocked!</span>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                You've demonstrated dedication and perseverance by completing this course. 
                Your new knowledge and skills will serve you well in your future endeavors!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/courses')}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <BookOpen className="w-5 h-5" />
                Explore More Courses
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 border border-gray-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Home
              </button>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );

  // Show congratulations page if all lessons are completed and user clicked continue
  if (showCongrats) {
    return <CongratulationsPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course content...</p>
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
            <div className="text-red-600 text-lg mb-4">{error}</div>
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

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="text-gray-600 text-lg mb-4">Course not found</div>
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

  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">You need to be enrolled in this course to access the learning content</div>
            <button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Go to Course Page
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
      
      {/* Course Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between initial-fade-in">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600">Learning Mode</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getSkillLevelStyle(course.skillLevel)}`}>
                {course.skillLevel ? course.skillLevel.charAt(0) + course.skillLevel.slice(1).toLowerCase() : 'Beginner'}
              </span>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BookOpen className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RevealOnScroll>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className={`lg:col-span-1 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
              {/* Progress */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Progress</h3>
                <div className="bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${courseProgress?.completionPercentage || 0}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {completedLessons.size} of {Array.from(sectionsWithLessons.values()).reduce((total, section) => total + (section.lessonCount || section.lessons?.length || 0), 0) || 0} lessons completed ({Math.round(courseProgress?.completionPercentage || 0)}%)
                </p>
              </div>

              {/* Course Sections */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Course Content</h3>
                <div className="space-y-2">
                  {Array.from(sectionsWithLessons.values()).map((section, index) => {
                    const isExpanded = expandedSections.has(section.id);
                    const lessons = section.lessons || [];
                    const lessonCount = section.lessonCount || lessons.length;
                    
                    console.log(`Rendering section ${section.id}: lessonCount=${section.lessonCount}, lessons.length=${lessons.length}, final count=${lessonCount}`);
                    
                    return (
                      <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Section Header */}
                        <div 
                          className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleSection(section.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </div>
                              <h4 className="font-medium text-sm text-gray-900">{section.title}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {section.lessonCount !== undefined ? section.lessonCount : lessonCount}
                              </span>
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content - Lessons */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50">
                            {loadingLessons.has(section.id) ? (
                              <div className="p-4 text-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mx-auto mb-2"></div>
                                <p className="text-xs text-gray-500">Loading lessons...</p>
                              </div>
                            ) : lessons.length > 0 ? (
                              <div className="p-2 space-y-1">
                                {lessons.map((lesson, lessonIndex) => {
                                  const isCompleted = completedLessons.has(lesson.id);
                                  const isSelected = selectedLesson?.id === lesson.id;
                                  
                                  return (
                                    <div 
                                      key={lesson.id}
                                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                        isSelected 
                                          ? 'bg-red-100 border border-red-200' 
                                          : 'hover:bg-white'
                                      }`}
                                      onClick={() => handleLessonClick(lesson, section, lessonIndex)}
                                    >
                                      <div className="flex-shrink-0">
                                        {isCompleted ? (
                                          <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <div className="flex items-center gap-1">
                                            {(() => {
                                              const contentTypes = [];
                                              const hasVideo = lesson.videoUrl || (lesson.content && isVideoUrl(lesson.content));
                                              const hasImage = lesson.imageURL || (lesson.content && isImageUrl(lesson.content));
                                              const hasText = lesson.content && !isVideoUrl(lesson.content) && !isImageUrl(lesson.content);
                                              
                                              if (hasVideo) {
                                                contentTypes.push(<Video key="video" className="w-3 h-3 text-red-500" />);
                                              }
                                              if (hasImage) {
                                                contentTypes.push(<Image key="image" className="w-3 h-3 text-blue-500" />);
                                              }
                                              if (hasText) {
                                                contentTypes.push(<FileText key="text" className="w-3 h-3 text-gray-500" />);
                                              }
                                              
                                              // If no specific content types, show a generic icon
                                              if (contentTypes.length === 0) {
                                                contentTypes.push(<FileText key="default" className="w-3 h-3 text-gray-400" />);
                                              }
                                              
                                              return contentTypes;
                                            })()}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h5 className={`text-xs font-medium truncate ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
                                          {lesson.title}
                                        </h5>
                                        <div className="flex items-center gap-2 mt-1">
                                          {(() => {
                                            const contentTypes = [];
                                            const hasVideo = lesson.videoUrl || (lesson.content && isVideoUrl(lesson.content));
                                            const hasImage = lesson.imageURL || (lesson.content && isImageUrl(lesson.content));
                                            const hasText = lesson.content && !isVideoUrl(lesson.content) && !isImageUrl(lesson.content);
                                            
                                            if (hasVideo) {
                                              contentTypes.push(
                                                <span key="video" className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                                  Video
                                                </span>
                                              );
                                            }
                                            if (hasImage) {
                                              contentTypes.push(
                                                <span key="image" className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                  Image
                                                </span>
                                              );
                                            }
                                            if (hasText) {
                                              contentTypes.push(
                                                <span key="text" className="text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">
                                                  Text
                                                </span>
                                              );
                                            }
                                            return contentTypes;
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-2 text-center text-gray-500">
                                <p className="text-xs">No lessons available</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedLesson ? (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Lesson Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h2>
                      <p className="text-gray-600 text-sm">
                        {currentSection?.title} • Lesson {currentLessonIndex + 1} of {currentSection?.lessons?.length || 0}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {(selectedLesson.videoUrl || (selectedLesson.content && isVideoUrl(selectedLesson.content))) ? (
                        <Video className="w-5 h-5 text-red-500" />
                      ) : selectedLesson.content && isImageUrl(selectedLesson.content) ? (
                        <Image className="w-5 h-5 text-blue-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePreviousLesson}
                      disabled={currentLessonIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </button>
                    
                    <button
                      onClick={() => toggleLessonCompletion(selectedLesson.id)}
                      disabled={markingComplete}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        completedLessons.has(selectedLesson.id)
                          ? 'bg-gray-600 hover:bg-gray-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      } ${markingComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {markingComplete ? 'Saving...' : (completedLessons.has(selectedLesson.id) ? 'Mark Incomplete' : 'Mark Complete')}
                    </button>
                    
                    <button
                      onClick={handleNextLesson}
                      disabled={currentLessonIndex >= (currentSection?.lessons?.length || 0) - 1}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lesson Content */}
                <div className="p-6">
                  {(() => {
                    const hasVideo = selectedLesson.videoUrl || (selectedLesson.content && isVideoUrl(selectedLesson.content));
                    const hasImage = selectedLesson.imageURL || (selectedLesson.content && isImageUrl(selectedLesson.content));
                    const hasText = selectedLesson.content && !isVideoUrl(selectedLesson.content) && !isImageUrl(selectedLesson.content);
                    const hasAnyContent = hasVideo || hasImage || hasText;

                    if (!hasAnyContent) {
                      return (
                        <div className="text-center py-12 text-gray-500">
                          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg">No content available for this lesson</p>
                          <p className="text-sm mt-2">This lesson may be under development or the content is not yet available.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6">
                        {/* Video Content */}
                        {hasVideo && (
                          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <Video className="w-5 h-5 text-red-500" />
                                <h4 className="font-semibold text-gray-900">Video Lesson</h4>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="relative bg-black rounded-lg overflow-hidden shadow-lg" style={{ aspectRatio: '16/9' }}>
                                {(() => {
                                  const videoSrc = selectedLesson.videoUrl || selectedLesson.content;
                                  const isYouTube = videoSrc && (videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be'));
                                  const isGoogleDrive = videoSrc && videoSrc.includes('drive.google.com');
                                  
                                  if (isYouTube) {
                                    // Extract YouTube video ID
                                    let videoId = '';
                                    if (videoSrc.includes('youtube.com/watch?v=')) {
                                      videoId = videoSrc.split('v=')[1]?.split('&')[0];
                                    } else if (videoSrc.includes('youtu.be/')) {
                                      videoId = videoSrc.split('youtu.be/')[1]?.split('?')[0];
                                    }
                                    
                                    if (videoId) {
                                      return (
                                        <iframe
                                          className="w-full h-full"
                                          src={`https://www.youtube.com/embed/${videoId}`}
                                          title={selectedLesson.title}
                                          frameBorder="0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                        />
                                      );
                                    }
                                  }
                                  
                                  if (isGoogleDrive) {
                                    // Extract Google Drive file ID
                                    let fileId = '';
                                    if (videoSrc.includes('/file/d/')) {
                                      // Format: https://drive.google.com/file/d/FILE_ID/view
                                      fileId = videoSrc.split('/file/d/')[1]?.split('/')[0];
                                    } else if (videoSrc.includes('id=')) {
                                      // Format: https://drive.google.com/open?id=FILE_ID
                                      fileId = videoSrc.split('id=')[1]?.split('&')[0];
                                    }
                                    
                                    if (fileId) {
                                      // Convert to direct video URL for embedding
                                      const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                                      return (
                                        <iframe
                                          className="w-full h-full"
                                          src={embedUrl}
                                          title={selectedLesson.title}
                                          frameBorder="0"
                                          allow="autoplay"
                                        />
                                      );
                                    }
                                  }
                                  
                                  // For direct video files (mp4, webm, mov, etc.)
                                  return (
                                    <video
                                      controls
                                      className="w-full h-full"
                                      src={videoSrc}
                                      poster={selectedLesson.imageURL}
                                    >
                                      Your browser does not support the video tag.
                                    </video>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Image Content */}
                        {hasImage && (
                          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <Image className="w-5 h-5 text-blue-500" />
                                <h4 className="font-semibold text-gray-900">Visual Content</h4>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="relative">
                                <img
                                  src={selectedLesson.imageURL || selectedLesson.content}
                                  alt={selectedLesson.title}
                                  className="w-full h-auto rounded-lg shadow-lg"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Text Content */}
                        {hasText && (
                          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-500" />
                                <h4 className="font-semibold text-gray-900">Lesson Content</h4>
                              </div>
                            </div>
                            <div className="p-6">
                              <div className="prose max-w-none">
                                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">
                                  {selectedLesson.content}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  {/* Course Completion Check */}
                  {checkCourseCompletion() && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-green-800 mb-2">Course Completed! 🎉</h3>
                        <p className="text-green-700 mb-6">
                          Congratulations! You've completed all lessons in this course.
                        </p>
                        <button
                          onClick={handleContinueToCongrats}
                          className="flex items-center justify-center gap-2 mx-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <GraduationCap className="w-5 h-5" />
                          Continue to Congratulations
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lesson metadata */}
                  {(selectedLesson.videoUrl || selectedLesson.content) && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          {(() => {
                            const contentTypes = [];
                            const hasVideo = selectedLesson.videoUrl || (selectedLesson.content && isVideoUrl(selectedLesson.content));
                            const hasImage = selectedLesson.imageURL || (selectedLesson.content && isImageUrl(selectedLesson.content));
                            const hasText = selectedLesson.content && !isVideoUrl(selectedLesson.content) && !isImageUrl(selectedLesson.content);
                            
                            if (hasVideo) {
                              contentTypes.push(
                                <div key="video" className="flex items-center gap-1">
                                  <Video className="w-4 h-4 text-red-500" />
                                  <span>Video</span>
                                </div>
                              );
                            }
                            if (hasImage) {
                              contentTypes.push(
                                <div key="image" className="flex items-center gap-1">
                                  <Image className="w-4 h-4 text-blue-500" />
                                  <span>Image</span>
                                </div>
                              );
                            }
                            if (hasText) {
                              contentTypes.push(
                                <div key="text" className="flex items-center gap-1">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span>Text</span>
                                </div>
                              );
                            }
                            return contentTypes;
                          })()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Lesson {currentLessonIndex + 1} of {currentSection?.lessons?.length || 0}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                {checkCourseCompletion() ? (
                  <>
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Completed! 🎉</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Congratulations! You've successfully completed all lessons in <strong>{course.title}</strong>.
                    </p>
                    <button
                      onClick={handleContinueToCongrats}
                      className="flex items-center justify-center gap-2 mx-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <GraduationCap className="w-5 h-5" />
                      Continue to Congratulations
                    </button>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to {course.title}</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Select a lesson from the sidebar to start learning. Lessons can contain videos, images, text, or any combination of these content types.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                      <div className="flex flex-col items-center gap-1">
                        <Video className="w-5 h-5 text-red-500" />
                        <span>Video</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Image className="w-5 h-5 text-blue-500" />
                        <span>Images</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <span>Text</span>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-sm mx-auto">
                      <p className="text-xs text-gray-600">
                        <strong>Tip:</strong> Look for content type badges in the lesson list to see what each lesson contains before clicking on it.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        </RevealOnScroll>
      </div>

      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </div>
  );
}
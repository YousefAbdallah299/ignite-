'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthAPI } from '@/hooks/useAuthAPI';
import { TokenValidationService } from '@/utils/tokenValidation';
import { coursesAPI, candidatesAPI, skillsAPI } from '@/utils/apiClient';
import RevealOnScroll from '@/components/RevealOnScroll';
import PageFadeIn from '@/components/PageFadeIn';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuthAPI();
  const navigate = useNavigate();
  const [accessDenied, setAccessDenied] = useState(false);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [emailQuery, setEmailQuery] = useState('');
  const [debouncedEmailQuery, setDebouncedEmailQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [newCourse, setNewCourse] = useState({ title: '', description: '', categories: [], skillLevel: 'BEGINNER' });
  const [sections, setSections] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([
    'Web Development', 'Data Science', 'Marketing', 'Design', 'Business', 
    'Programming', 'Photography', 'Writing', 'Finance', 'Personal Development',
    'Mobile Development', 'DevOps', 'Machine Learning', 'UI/UX', 'Project Management'
  ]);
  const [newCategory, setNewCategory] = useState('');

  // Workshop invite state
  const [workshopInvite, setWorkshopInvite] = useState({
    name: '',
    description: '',
    invitationLink: '',
    startDate: '',
    recipientEmails: []
  });
  const [emailInput, setEmailInput] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  // Skill rating state
  const [candidates, setCandidates] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillRating, setSkillRating] = useState(50);
  const [ratingCandidate, setRatingCandidate] = useState(false);

  // Available user roles
  const userRoles = [
    { value: '', label: 'All Roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'CANDIDATE', label: 'Candidate' },
    { value: 'RECRUITER', label: 'Recruiter' }
  ];

  // Check admin access on component mount
  useEffect(() => {
    console.log('=== ADMIN PAGE COMPONENT MOUNTED ===');
    console.log('Initial state:', {
      user: user?.email,
      isAdmin,
      authLoading,
      accessDenied
    });
    
    const checkAdminAccess = async () => {
      // Wait for auth to load
      if (authLoading) return;
      
      // Check if user is authenticated
      if (!user) {
        setAccessDenied(true);
        setTimeout(() => {
          navigate('/account/signin');
        }, 2000);
        return;
      }
      
      // Check if user is admin
      if (!isAdmin) {
        setAccessDenied(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
        return;
      }
      
      // Validate token
      const isValid = TokenValidationService.validateToken();
      if (!isValid) {
        setAccessDenied(true);
        setTimeout(() => {
          navigate('/account/signin');
        }, 2000);
        return;
      }
    };

    checkAdminAccess();
  }, [user, isAdmin, authLoading, navigate]);

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
      
      const headers = {
        'Authorization': `Bearer ${token}`, // Backend expects "Bearer " prefix
        'Content-Type': 'application/json'
      };

      // Test basic connectivity first
      console.log('Testing backend connectivity...');
      try {
        const testResponse = await fetch('http://localhost:8080/api/v1/users?page=0&size=5', { 
          method: 'GET',
          headers: headers
        });
        console.log('Test response status:', testResponse.status);
        console.log('Test response ok:', testResponse.ok);
        
        if (!testResponse.ok) {
          const errorText = await testResponse.text();
          console.error('Test error response:', errorText);
          throw new Error(`Backend error: ${testResponse.status} - ${errorText}`);
        }
        
        const testData = await testResponse.json();
        console.log('Test response data:', testData);
        
        // Load courses from Ignite backend
        const coursesResponse = await fetch('http://localhost:8080/api/v1/courses?page=0&size=100', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData.content || []);
        } else {
          console.error('Failed to load courses from backend');
          setCourses([]);
        }

        // Load users with pagination, search, and role filter
        let userParams;
        let usersUrl;
        
        if (debouncedEmailQuery.trim()) {
          // Use email search endpoint with role filtering
          userParams = new URLSearchParams({
            emailPart: debouncedEmailQuery.trim(),
            page: currentPage.toString(),
            size: '20'
          });
          
          if (selectedRole) {
            userParams.append('role', selectedRole);
          }
          
          usersUrl = `http://localhost:8080/api/v1/users/search-by-email?${userParams}`;
        } else {
          // Use regular search endpoint with role filtering
          userParams = new URLSearchParams({
            page: currentPage.toString(),
            size: '20'
          });
          
          if (debouncedSearchQuery.trim()) {
            userParams.append('query', debouncedSearchQuery.trim());
          }
          
          if (selectedRole) {
            userParams.append('role', selectedRole);
          }
          
          usersUrl = `http://localhost:8080/api/v1/users?${userParams}`;
        }

        console.log('Fetching users from:', usersUrl);
        console.log('Headers:', headers);
        
        const response = await fetch(usersUrl, { headers });
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const u = await response.json();
        console.log('Users response:', u);
        console.log('Response structure:', {
          hasContent: 'content' in u,
          hasData: 'data' in u,
          hasUsers: 'users' in u,
          keys: Object.keys(u),
          contentLength: u.content?.length,
          dataLength: u.data?.length,
          usersLength: u.users?.length
        });
        
        // Backend returns: { content: [...], page: 0, size: 20, totalElements: 3, totalPages: 1, last: true }
        console.log('Backend response structure:', {
          hasContent: 'content' in u,
          contentLength: u.content?.length,
          totalElements: u.totalElements,
          totalPages: u.totalPages,
          page: u.page,
          size: u.size,
          last: u.last
        });
        
        const usersArray = Array.isArray(u.content) ? u.content : [];
        console.log('Setting users state:', usersArray);
        console.log('Setting totalPages:', u.totalPages || 0);
        console.log('Setting totalElements:', u.totalElements || 0);
        
        setUsers(usersArray);
        setTotalPages(u.totalPages || 0);
        setTotalElements(u.totalElements || 0);
        
        console.log('State updated - users count:', usersArray.length);
        
      } catch (testError) {
        console.error('Backend connectivity test failed:', testError);
        throw testError;
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // If the API fails, try a fallback or show a message
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.log('Network error - backend might not be running');
        setUsers([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } finally { 
      setLoading(false); 
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce email query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmailQuery(emailQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [emailQuery]);

  useEffect(() => { load(); }, [debouncedSearchQuery, debouncedEmailQuery, selectedRole, currentPage]);
  
  // Load candidates and skills for skill rating
  useEffect(() => {
    if (isAdmin) {
      loadCandidates();
      loadAvailableSkills();
    }
  }, [isAdmin]);

  const deleteCourse = async (id) => { 
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/v1/courses/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete course');
      }
      
      console.log('Course deleted successfully');
      load(); // Reload the courses list
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(`Error deleting course: ${error.message}`);
    }
  };
  
  const deleteUser = async (id) => { 
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/v1/auth/users/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      
      console.log('User deleted successfully');
      load(); // Reload the users list
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Error deleting user: ${error.message}`);
    }
  };
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handleEmailSearch = (e) => {
    setEmailQuery(e.target.value);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(0); // Reset to first page when filtering
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Workshop invite functions
  const addEmail = () => {
    if (emailInput.trim() && !workshopInvite.recipientEmails.includes(emailInput.trim())) {
      setWorkshopInvite({
        ...workshopInvite,
        recipientEmails: [...workshopInvite.recipientEmails, emailInput.trim()]
      });
      setEmailInput('');
    }
  };

  const removeEmail = (emailToRemove) => {
    setWorkshopInvite({
      ...workshopInvite,
      recipientEmails: workshopInvite.recipientEmails.filter(email => email !== emailToRemove)
    });
  };

  const sendWorkshopInvite = async (e) => {
    e.preventDefault();
    if (workshopInvite.recipientEmails.length === 0) {
      alert('Please add at least one recipient email');
      return;
    }

    setSendingInvite(true);
    try {
      // Convert startDate to ISO format for backend
      const invitationData = {
        ...workshopInvite,
        startDate: workshopInvite.startDate ? new Date(workshopInvite.startDate).toISOString() : null
      };

      // Use the apiClient which handles text responses correctly
      const result = await coursesAPI.inviteToWorkshop(invitationData);
      console.log('Workshop invitation sent successfully:', result);

      // Reset form
      setWorkshopInvite({
        name: '',
        description: '',
        invitationLink: '',
        startDate: '',
        recipientEmails: []
      });
      setEmailInput('');

      alert('Workshop invitations sent successfully!');
    } catch (error) {
      console.error('Error sending workshop invitations:', error);
      alert(`Error sending workshop invitations: ${error.message}`);
    } finally {
      setSendingInvite(false);
    }
  };

  // Load candidates for skill rating
  const loadCandidates = async () => {
    try {
      const response = await candidatesAPI.getAllCandidates(0, 100);
      setCandidates(response.content || []);
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  // Load available skills
  const loadAvailableSkills = async () => {
    try {
      const response = await skillsAPI.getAllSkills();
      setAvailableSkills(response || []);
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  // Rate candidate skill
  const rateCandidateSkill = async () => {
    if (!selectedCandidate || !selectedSkill) {
      alert('Please select both a candidate and a skill');
      return;
    }

    setRatingCandidate(true);
    try {
      await candidatesAPI.rateCandidateSkill(selectedCandidate.id, selectedSkill.id, skillRating);
      alert(`Successfully rated ${selectedCandidate.name}'s ${selectedSkill.name} skill as ${skillRating}%`);
      
      // Reset form
      setSelectedCandidate(null);
      setSelectedSkill(null);
      setSkillRating(50);
      
      // Reload candidates to show updated ratings
      loadCandidates();
    } catch (error) {
      console.error('Error rating candidate skill:', error);
      alert('Failed to rate candidate skill');
    } finally {
      setRatingCandidate(false);
    }
  };
  const createCourse = async (e) => {
    e.preventDefault();
    try {
      // Transform the form data to match the Ignite backend DTO structure
      const courseData = {
        title: newCourse.title,
        description: newCourse.description,
        categories: newCourse.categories, // Backend expects array of categories
        skillLevel: newCourse.skillLevel,
        sections: sections.map(section => ({
          title: section.title,
          content: '', // Backend expects content field
          videoUrl: '', // Backend expects videoUrl field
          lessons: section.lessons.map(lesson => ({
            title: lesson.title,
            content: lesson.text || '', // Map text to content
            videoUrl: lesson.videoUrl || '',
            imageUrl: lesson.imageUrl || '' // Map imageUrl field for backend DTO
          }))
        }))
      };

      console.log('Sending course data:', JSON.stringify(courseData, null, 2));

      // Use the Ignite backend API
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/v1/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, get the text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error('Could not read error response:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        if (responseText.trim() === '') {
          result = { success: true, message: 'Course created successfully' };
        } else {
          result = JSON.parse(responseText);
        }
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        throw new Error('Invalid response format from server');
      }
      
      console.log('Course created successfully:', result);

      // Reset form completely
      setNewCourse({ title: '', description: '', categories: [], skillLevel: 'BEGINNER' });
      setSections([]);
      
      // Reload courses list
      load();
      
      // Redirect to courses page
      navigate('/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      alert(`Error creating course: ${error.message}`);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied message
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-red-600 text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access the admin panel. Only administrators can view this page.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to the appropriate page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log('=== ADMIN PAGE RENDER ===');
  console.log('Render state:', {
    authLoading,
    accessDenied,
    loading,
    users: users.length,
    totalElements,
    usersData: users
  });

  return (
    <PageFadeIn className="bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-200px)]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>
        </div>
        {loading ? (
          <div className="text-gray-600 min-h-[600px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading admin panel...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 min-h-[600px]">
            <RevealOnScroll>
              <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-8">
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Courses</h2>
                <div className="space-y-2 mb-4">
                  {courses.map((c) => (
                    <div key={c.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                      <div className="text-gray-800">
                        {c.title} • {Array.isArray(c.categories) ? 
                          c.categories.map(cat => typeof cat === 'string' ? cat : cat.name).join(', ') : 
                          (c.category || 'No category')}
                      </div>
                      <button onClick={() => deleteCourse(c.id)} className="text-red-600 font-medium">Delete</button>
                    </div>
                  ))}
                </div>
                <form onSubmit={createCourse} className="space-y-3">
                  <input 
                    value={newCourse.title} 
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} 
                    placeholder="Course title" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm" 
                  />
                  <textarea 
                    value={newCourse.description} 
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} 
                    placeholder="Description" 
                    className="w-full p-2 border border-gray-300 rounded-lg min-h-16 text-sm" 
                  />
                  
                  {/* Multiple Categories Selection - Compact */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">Skill Level</label>
              <select
                value={newCourse.skillLevel}
                onChange={(e) => setNewCourse({ ...newCourse, skillLevel: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
                    
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">Categories</label>
                    {newCourse.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {newCourse.categories.map((category, index) => (
                          <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            {category}
                            <button
                              type="button"
                              onClick={() => setNewCourse({ 
                                ...newCourse, 
                                categories: newCourse.categories.filter((_, i) => i !== index) 
                              })}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Add Category Input - Compact */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Add a category"
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newCategory.trim() && !newCourse.categories.includes(newCategory.trim())) {
                              setNewCourse({ 
                                ...newCourse, 
                                categories: [...newCourse.categories, newCategory.trim()] 
                              });
                              setNewCategory('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCategory.trim() && !newCourse.categories.includes(newCategory.trim())) {
                            setNewCourse({ 
                              ...newCourse, 
                              categories: [...newCourse.categories, newCategory.trim()] 
                            });
                            setNewCategory('');
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                    
                    {/* Available Categories - Compact */}
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Quick select:</p>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {availableCategories
                          .filter(cat => !newCourse.categories.includes(cat))
                          .map((category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={() => {
                                if (!newCourse.categories.includes(category)) {
                                  setNewCourse({ 
                                    ...newCourse, 
                                    categories: [...newCourse.categories, category] 
                                  });
                                }
                              }}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs transition-colors"
                            >
                              + {category}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                  {/* Sections Builder - Compact */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-900 text-sm">Sections ({sections.length})</div>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {sections.map((section, sIdx) => (
                        <div key={sIdx} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              value={section.title}
                              onChange={(e) => {
                                const copy = [...sections];
                                copy[sIdx].title = e.target.value;
                                setSections(copy);
                              }}
                              placeholder={`Section ${sIdx + 1} title`}
                              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <button 
                              type="button" 
                              onClick={() => setSections(sections.filter((_, i) => i !== sIdx))} 
                              className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded"
                            >
                              Remove
                            </button>
                          </div>
                          
                          {/* Lessons for this section */}
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-700">Lessons ({section.lessons.length})</div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {section.lessons.map((lesson, lIdx) => (
                                <div key={lIdx} className="border border-gray-100 rounded p-2">
                                  <div className="flex items-center gap-2 mb-2">
                                    <input
                                      value={lesson.title}
                                      onChange={(e) => {
                                        const copy = [...sections];
                                        copy[sIdx].lessons[lIdx].title = e.target.value;
                                        setSections(copy);
                                      }}
                                      placeholder={`Lesson ${lIdx + 1} title`}
                                      className="flex-1 p-1 border border-gray-300 rounded text-sm"
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        const copy = [...sections];
                                        copy[sIdx].lessons = copy[sIdx].lessons.filter((_, i) => i !== lIdx);
                                        setSections(copy);
                                      }} 
                                      className="text-red-600 hover:text-red-800 text-xs font-medium px-1 py-1"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  <textarea
                                    value={lesson.text}
                                    onChange={(e) => {
                                      const copy = [...sections];
                                      copy[sIdx].lessons[lIdx].text = e.target.value;
                                      setSections(copy);
                                    }}
                                    placeholder="Optional lesson text/content"
                                    className="w-full p-1 border border-gray-300 rounded text-sm min-h-12 mb-1"
                                  />
                                  <div className="grid grid-cols-2 gap-1">
                                    <input
                                      value={lesson.videoUrl}
                                      onChange={(e) => {
                                        const copy = [...sections];
                                        copy[sIdx].lessons[lIdx].videoUrl = e.target.value;
                                        setSections(copy);
                                      }}
                                      placeholder="Video URL"
                                      className="p-1 border border-gray-300 rounded text-xs"
                                    />
                                    <input
                                      value={lesson.imageUrl}
                                      onChange={(e) => {
                                        const copy = [...sections];
                                        copy[sIdx].lessons[lIdx].imageUrl = e.target.value;
                                        setSections(copy);
                                      }}
                                      placeholder="Image URL"
                                      className="p-1 border border-gray-300 rounded text-xs"
                                    />
                                  </div>
                                </div>
                              ))}
                              
                              {/* Add Lesson Button - At the end of lessons list */}
                              <button 
                                type="button" 
                                onClick={() => {
                                  const copy = [...sections];
                                  copy[sIdx].lessons.push({ title: '', text: '', videoUrl: '', imageUrl: '' });
                                  setSections(copy);
                                }} 
                                className="w-full text-red-600 hover:text-red-800 text-sm font-medium py-2 border border-dashed border-red-300 rounded hover:bg-red-50"
                              >
                                + Add Lesson to Section {sIdx + 1}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add Section Button - At the end of sections list */}
                      <button 
                        type="button" 
                        onClick={() => setSections([...sections, { title: '', lessons: [] }])} 
                        className="w-full text-red-600 hover:text-red-800 text-sm font-medium py-3 border border-dashed border-red-300 rounded hover:bg-red-50"
                      >
                        + Add New Section
                      </button>
                    </div>
                  </div>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">Create Course</button>
                </form>
              </section>

              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">Users ({totalElements})</h2>
                  </div>
                  
                  {/* Search and Filter Controls - More Compact */}
                  <div className="space-y-2">
                    {/* Role Filter */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-700 w-16">Filter:</label>
                      <select
                        value={selectedRole}
                        onChange={handleRoleChange}
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        {userRoles.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Search Inputs - Stacked for better space usage */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-700 w-16">Name:</label>
                        <input
                          type="text"
                          placeholder="Search by name..."
                          value={searchQuery}
                          onChange={handleSearch}
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-700 w-16">Email:</label>
                        <input
                          type="email"
                          placeholder="Search by email..."
                          value={emailQuery}
                          onChange={handleEmailSearch}
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-2 mb-4 min-h-[200px]">
                  {console.log('Rendering users list - users.length:', users.length, 'users:', users)}
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-4 bg-gray-300 rounded w-32"></div>
                                <div className="h-5 bg-gray-300 rounded-full w-16"></div>
                              </div>
                              <div className="h-3 bg-gray-300 rounded w-48 mb-1"></div>
                              <div className="h-3 bg-gray-300 rounded w-32"></div>
                            </div>
                            <div className="h-6 bg-gray-300 rounded w-12"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">👥</div>
                      <p className="text-sm">No users found</p>
                      <p className="text-xs mt-1">
                        Check console for API response details
                      </p>
                    </div>
                  ) : (
                    users.map((u) => {
                      console.log('Rendering user:', u);
                      return (
                    <div key={u.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {u.first_name} {u.last_name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                              u.role === 'RECRUITER' ? 'bg-blue-100 text-blue-800' :
                              u.role === 'CANDIDATE' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {u.role || 'USER'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{u.email}</p>
                          {u.phoneNumber && (
                            <p className="text-sm text-gray-500">{u.phoneNumber}</p>
                          )}
                        </div>
                        <button 
                          onClick={() => deleteUser(u.id)} 
                          className="text-red-600 hover:text-red-800 font-medium text-sm ml-2"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                      );
                    })
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {currentPage + 1} of {totalPages} ({totalElements} total users)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Skill Rating Section */}
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Rate Candidate Skills</h2>
                <div className="space-y-4">
                  {/* Candidate Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Candidate</label>
                    <select
                      value={selectedCandidate?.id || ''}
                      onChange={(e) => {
                        const candidate = candidates.find(c => c.id === parseInt(e.target.value));
                        setSelectedCandidate(candidate);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Choose a candidate...</option>
                      {candidates.map(candidate => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.name} - {candidate.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Skill Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Skill</label>
                    <select
                      value={selectedSkill?.id || ''}
                      onChange={(e) => {
                        const skill = availableSkills.find(s => s.id === parseInt(e.target.value));
                        setSelectedSkill(skill);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      disabled={!selectedCandidate}
                    >
                      <option value="">Choose a skill...</option>
                      {availableSkills.map(skill => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating Slider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill Rating: {skillRating}%
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={skillRating}
                      onChange={(e) => setSkillRating(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={!selectedSkill}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Current Skills Display */}
                  {selectedCandidate && selectedCandidate.skills && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Skills</label>
                      <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                        {Object.entries(selectedCandidate.skills).length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(selectedCandidate.skills).map(([skill, rating]) => (
                              <span key={skill} className={`px-2 py-1 rounded text-sm ${
                                rating === 0 
                                  ? 'bg-gray-100 text-gray-600' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {skill}: {rating === 0 ? 'unverified' : `${rating}% verified`}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No skills rated yet</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={rateCandidateSkill}
                    disabled={!selectedCandidate || !selectedSkill || ratingCandidate}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    {ratingCandidate ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Rating...
                      </div>
                    ) : (
                      'Rate Skill'
                    )}
                  </button>
                </div>
              </section>

              {/* Workshop Invite Section */}
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Workshop Invitations</h2>
                <form onSubmit={sendWorkshopInvite} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Workshop Name</label>
                    <input
                      type="text"
                      value={workshopInvite.name}
                      onChange={(e) => setWorkshopInvite({ ...workshopInvite, name: e.target.value })}
                      placeholder="Enter workshop name"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={workshopInvite.description}
                      onChange={(e) => setWorkshopInvite({ ...workshopInvite, description: e.target.value })}
                      placeholder="Enter workshop description"
                      className="w-full p-2 border border-gray-300 rounded-lg min-h-16 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Invitation Link</label>
                    <input
                      type="url"
                      value={workshopInvite.invitationLink}
                      onChange={(e) => setWorkshopInvite({ ...workshopInvite, invitationLink: e.target.value })}
                      placeholder="Enter meeting/invitation link"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={workshopInvite.startDate}
                      onChange={(e) => setWorkshopInvite({ ...workshopInvite, startDate: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Recipients</label>
                    <div className="space-y-2">
                      {/* Email Input */}
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="Enter recipient email"
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addEmail();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={addEmail}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                        >
                          Add
                        </button>
                      </div>

                      {/* Selected Emails */}
                      {workshopInvite.recipientEmails.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">Recipients ({workshopInvite.recipientEmails.length}):</p>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {workshopInvite.recipientEmails.map((email, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                                <span className="text-gray-700 truncate flex-1 mr-2">{email}</span>
                                <button
                                  type="button"
                                  onClick={() => removeEmail(email)}
                                  className="text-red-600 hover:text-red-800 font-medium"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sendingInvite || workshopInvite.recipientEmails.length === 0}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    {sendingInvite ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Workshop Invitations'
                    )}
                  </button>
                </form>
              </section>
              </div>
            </RevealOnScroll>
          </div>
        )}
      </div>
      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </PageFadeIn>
  );
}



'use client';

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PasswordInput from '@/components/PasswordInput';
import { useAuthAPI } from '@/hooks/useAuthAPI';
import { TokenValidationService } from '@/utils/tokenValidation';
import { coursesAPI, candidatesAPI, skillsAPI, adminAPI, adsAPI, recruitersAPI, offersAPI, siteSettingsAPI } from '@/utils/apiClient';
import { DEFAULT_SITE_SETTINGS, useSiteSettings } from '@/hooks/useSiteSettings';
import { toast } from 'sonner';

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ignite-qjis.onrender.com/api/v1';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuthAPI();
  const { refreshSettings } = useSiteSettings();
  const navigate = useNavigate();
  const [accessDenied, setAccessDenied] = useState(false);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
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
  
  // Course image upload state
  const [courseImageFile, setCourseImageFile] = useState(null);
  const [courseImagePreview, setCourseImagePreview] = useState(null);
  const [courseImageUrl, setCourseImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

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

  // Custom admin creation state
  const [showCustomAdminForm, setShowCustomAdminForm] = useState(false);
  const [customAdminForm, setCustomAdminForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    privileges: []
  });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [myPrivileges, setMyPrivileges] = useState([]);
  
  // Admin password change state
  const [showPasswordChangeForm, setShowPasswordChangeForm] = useState(false);
  const [passwordChangeForm, setPasswordChangeForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Ads management state
  const [ads, setAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [offersAdminList, setOffersAdminList] = useState([]);
  const [loadingOffersAdmin, setLoadingOffersAdmin] = useState(false);
  const [offersAdminPage, setOffersAdminPage] = useState(1);
  const OFFERS_ADMIN_PAGE_SIZE = 10;
  const [showAdForm, setShowAdForm] = useState(false);
  const [newAd, setNewAd] = useState({
    title: '',
    imageUrl: '',
    redirectUrl: '',
    startDate: '',
    endDate: ''
  });
  const [creatingAd, setCreatingAd] = useState(false);

  // Site settings state
  const [siteSettingsForm, setSiteSettingsForm] = useState({ ...DEFAULT_SITE_SETTINGS });
  const [loadingSiteSettings, setLoadingSiteSettings] = useState(false);
  const [savingSiteSettings, setSavingSiteSettings] = useState(false);
  
  const availablePrivileges = [
    { name: 'MANAGE_COURSES', label: 'Manage Courses' },
    { name: 'MANAGE_USERS', label: 'Manage Users' },
    { name: 'MANAGE_WORKSHOPS', label: 'Manage Workshops' },
    { name: 'RATE_SKILLS', label: 'Rate Skills' },
    { name: 'MANAGE_ADS', label: 'Manage Ads' },
    { name: 'MANAGE_OFFERS', label: 'Manage Offers' },
    { name: 'MANAGE_SITE_SETTINGS', label: 'Manage Site Settings' }
  ];

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

  // Load courses (only once on mount)
  const loadCourses = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const coursesResponse = await fetch(`${API_BASE_URL}/courses?page=0&size=100`, {
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
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses([]);
    }
  };

  // Load users separately (called on filter/search changes)
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load users with pagination, search, and role filter
      let userParams;
      let usersUrl;
      
      if (debouncedEmailQuery.trim()) {
        userParams = new URLSearchParams({
          emailPart: debouncedEmailQuery.trim(),
          page: currentPage.toString(),
          size: '20'
        });
        
        if (selectedRole) {
          userParams.append('role', selectedRole);
        }
        
        usersUrl = `${API_BASE_URL}/users/search-by-email?${userParams}`;
      } else {
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
        
        usersUrl = `${API_BASE_URL}/users?${userParams}`;
      }

      const response = await fetch(usersUrl, { headers });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const u = await response.json();
      const usersArray = Array.isArray(u.content) ? u.content : [];
      
      setUsers(usersArray);
      setTotalPages(u.totalPages || 0);
      setTotalElements(u.totalElements || 0);
      
    } catch (error) {
      console.error('Error loading users:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setUsers([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } finally { 
      setLoadingUsers(false); 
    }
  };

  // Initial load (only once on mount)
  const load = async () => {
    setLoading(true);
    try {
      await loadCourses();
      await loadUsers();
    } catch (error) {
      console.error('Error loading data:', error);
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

  // Initial load only once
  useEffect(() => {
    load();
  }, []);

  // Reload only users when filters change (skip initial mount to avoid double load)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!loading) {
      loadUsers();
    }
  }, [debouncedSearchQuery, debouncedEmailQuery, selectedRole, currentPage]);
  
  // Load candidates and skills for skill rating
  useEffect(() => {
    if (isAdmin) {
      loadCandidates();
      loadAvailableSkills();
      loadMyPrivileges();
      loadAds();
      loadAdminOffers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || myPrivileges.length === 0) return;
    if (hasPrivilege('MANAGE_SITE_SETTINGS')) {
      loadSiteSettings();
    }
  }, [isAdmin, myPrivileges]);
  
  // Load ads
  const loadAds = async () => {
    setLoadingAds(true);
    try {
      const allAds = await adsAPI.getAllAds();
      setAds(allAds || []);
    } catch (error) {
      console.error('Error loading ads:', error);
      setAds([]);
    } finally {
      setLoadingAds(false);
    }
  };

  const loadAdminOffers = async () => {
    setLoadingOffersAdmin(true);
    try {
      const allOffers = await offersAPI.getAllOffers();
      const sorted = [...(allOffers || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setOffersAdminList(sorted);
      setOffersAdminPage(1);
    } catch (error) {
      console.error('Error loading offers:', error);
      setOffersAdminList([]);
    } finally {
      setLoadingOffersAdmin(false);
    }
  };
  
  // Create ad
  const createAd = async (e) => {
    e.preventDefault();
    setCreatingAd(true);
    try {
      const adData = {
        ...newAd,
        startDate: newAd.startDate || new Date().toISOString().split('T')[0],
        endDate: newAd.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      await adsAPI.createAd(adData);
      toast.success('Ad created successfully!');
      setNewAd({
        title: '',
        imageUrl: '',
        redirectUrl: '',
        startDate: '',
        endDate: ''
      });
      setShowAdForm(false);
      loadAds();
    } catch (error) {
      console.error('Error creating ad:', error);
      toast.error(`Error creating ad: ${error.message}`);
    } finally {
      setCreatingAd(false);
    }
  };
  
  // Delete ad
  const deleteAd = async (id) => {
    if (!confirm('Are you sure you want to delete this ad?')) {
      return;
    }
    try {
      await adsAPI.deleteAd(id);
      toast.success('Ad deleted successfully!');
      loadAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error(`Error deleting ad: ${error.message}`);
    }
  };

  const getAdScheduleState = (ad) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(ad.startDate);
    const end = new Date(ad.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < today) return 'expired';
    if (start > today) return 'scheduled';
    return 'current';
  };

  const getAdStatusMeta = (ad) => {
    const scheduleState = getAdScheduleState(ad);

    if (scheduleState === 'scheduled') {
      return {
        label: 'Scheduled',
        toneClass: 'bg-blue-100 text-blue-700 border-blue-200',
        muted: true,
      };
    }

    if (scheduleState === 'expired') {
      return {
        label: 'Expired',
        toneClass: 'bg-amber-100 text-amber-700 border-amber-200',
        muted: true,
      };
    }

    return {
      label: 'Active',
      toneClass: 'bg-green-100 text-green-700 border-green-200',
      muted: false,
    };
  };

  const totalOffersAdminPages = Math.max(1, Math.ceil(offersAdminList.length / OFFERS_ADMIN_PAGE_SIZE));
  const paginatedAdminOffers = offersAdminList.slice(
    (offersAdminPage - 1) * OFFERS_ADMIN_PAGE_SIZE,
    offersAdminPage * OFFERS_ADMIN_PAGE_SIZE
  );

  const loadMyPrivileges = async () => {
    try {
      const privileges = await adminAPI.getMyPrivileges();
      setMyPrivileges(privileges || []);
    } catch (error) {
      console.error('Error loading privileges:', error);
      setMyPrivileges([]);
    }
  };

  const hasPrivilege = (privilegeName) => {
    // Full admins have all privileges
    if (myPrivileges.length === 0 || myPrivileges.some(p => p.privilegeName === privilegeName && p.enabled)) {
      return true;
    }
    return false;
  };

  const loadSiteSettings = async () => {
    setLoadingSiteSettings(true);
    try {
      const data = await siteSettingsAPI.getAdminSettings();
      if (data) {
        setSiteSettingsForm({ ...DEFAULT_SITE_SETTINGS, ...data });
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
      toast.error('Failed to load site settings');
    } finally {
      setLoadingSiteSettings(false);
    }
  };

  const saveSiteSettings = async (e) => {
    e.preventDefault();
    setSavingSiteSettings(true);
    try {
      const updated = await siteSettingsAPI.updateSettings(siteSettingsForm);
      if (updated) {
        setSiteSettingsForm({ ...DEFAULT_SITE_SETTINGS, ...updated });
        await refreshSettings();
        toast.success('Site settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving site settings:', error);
      toast.error(error.message || 'Failed to save site settings');
    } finally {
      setSavingSiteSettings(false);
    }
  };

  const createCustomAdmin = async (e) => {
    e.preventDefault();
    if (customAdminForm.privileges.length === 0) {
      alert('Please select at least one privilege');
      return;
    }

    setCreatingAdmin(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/admin/custom-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customAdminForm)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.message || `Failed to create custom admin: ${response.status}`);
      }

      const result = await response.json();
      alert('Custom admin created successfully!');
      setCustomAdminForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        privileges: []
      });
      setShowCustomAdminForm(false);
      loadUsers(); // Reload only the users list
    } catch (error) {
      console.error('Error creating custom admin:', error);
      alert(`Error creating custom admin: ${error.message}`);
    } finally {
      setCreatingAdmin(false);
    }
  };

  const deleteCourse = async (id) => { 
    try {
      await coursesAPI.deleteCourse(id);
      console.log('Course deleted successfully');
      loadCourses(); // Reload only the courses list
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(`Error deleting course: ${error.message}`);
    }
  };
  
  const deleteUser = async (id) => { 
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, { 
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
      loadUsers(); // Reload only the users list
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Error deleting user: ${error.message}`);
    }
  };

  const suspendUser = async (id, suspend = true) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}/suspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ suspended: suspend })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${suspend ? 'suspend' : 'unsuspend'} user`);
      }
      
      toast.success(`User ${suspend ? 'suspended' : 'unsuspended'} successfully`);
      loadUsers();
    } catch (error) {
      console.error(`Error ${suspend ? 'suspending' : 'unsuspending'} user:`, error);
      toast.error(`Error ${suspend ? 'suspending' : 'unsuspending'} user: ${error.message}`);
    }
  };

  const changeAdminPassword = async (e) => {
    e.preventDefault();
    
    if (passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordChangeForm.newPassword.length < 8) {
      alert('New password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordChangeForm.currentPassword,
          newPassword: passwordChangeForm.newPassword,
          confirmPassword: passwordChangeForm.confirmPassword
        })
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to change password';
        const contentType = response.headers.get('content-type');
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorData.details || errorMessage;
          } else {
            // Try to get text response
            const errorText = await response.text();
            if (errorText && errorText.trim()) {
              errorMessage = errorText;
            } else {
              errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
          }
        } catch (parseError) {
          // If parsing fails, use status-based message
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
        }
        
        // Display error in alert
        alert(`Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }
      
      const result = await response.text();
      toast.success('Password changed successfully!');
      setPasswordChangeForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChangeForm(false);
    } catch (error) {
      console.error('Error changing password:', error);
      // Show error in alert if it's a network error or other error
      if (error.message && error.message !== 'Failed to change password') {
        // Error was already shown in the if block above
        return;
      }
      const errorMessage = error.message || 'Failed to change password. Please check your connection and try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setChangingPassword(false);
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
  // Handle course image file selection
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setCourseImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload course image
  const uploadCourseImage = async () => {
    if (!courseImageFile) {
      alert('Please select an image file first');
      return;
    }

    setUploadingImage(true);
    try {
      console.log('Uploading image file:', courseImageFile.name, courseImageFile.size);
      const response = await coursesAPI.uploadCourseImage(courseImageFile);
      console.log('Upload response:', response);
      
      const imageUrl = response?.imageUrl;
      console.log('Extracted imageUrl from response:', imageUrl);
      
      if (!imageUrl) {
        throw new Error('No imageUrl returned from server');
      }
      
      // Store the relative path returned by backend (e.g., "/uploads/courses/filename.jpg")
      // This is what we'll send to the backend when creating the course
      setCourseImageUrl(imageUrl);
      console.log('Set courseImageUrl state to:', imageUrl);
      
      // For preview, construct full URL if needed
      if (imageUrl && !imageUrl.startsWith('http')) {
        // Extract base URL from API_BASE_URL (e.g., "https://ignite-qjis.onrender.com")
        const baseUrl = API_BASE_URL.replace('/api/v1', '');
        const previewUrl = `${baseUrl}${imageUrl}`;
        // Update preview to show the full URL for display
        setCourseImagePreview(previewUrl);
        console.log('Set preview URL to:', previewUrl);
      } else {
        setCourseImagePreview(imageUrl);
      }
      
      alert('Image uploaded successfully! URL: ' + imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Clear course image
  const clearCourseImage = () => {
    setCourseImageFile(null);
    setCourseImagePreview(null);
    setCourseImageUrl('');
  };

  const createCourse = async (e) => {
    e.preventDefault();
    
    // Warn if file is selected but not uploaded
    if (courseImageFile && !courseImageUrl) {
      const shouldContinue = window.confirm(
        'You have selected an image file but haven\'t uploaded it yet. ' +
        'The course will be created without an image. Do you want to continue?'
      );
      if (!shouldContinue) {
        return;
      }
    }
    
    try {
      // Log current state before creating course
      console.log('=== Creating Course ===');
      console.log('Current courseImageUrl state:', courseImageUrl);
      console.log('Current courseImagePreview state:', courseImagePreview);
      console.log('Current courseImageFile state:', courseImageFile);
      
      // Transform the form data to match the Ignite backend DTO structure
      // Convert empty string to null for imageUrl
      const imageUrlValue = courseImageUrl && courseImageUrl.trim() !== '' ? courseImageUrl.trim() : null;
      
      const courseData = {
        title: newCourse.title,
        description: newCourse.description,
        categories: newCourse.categories, // Backend expects array of categories
        skillLevel: newCourse.skillLevel,
        imageUrl: imageUrlValue, // Include uploaded image URL (null if not uploaded)
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
      console.log('Course imageUrl being sent:', courseData.imageUrl);

      // Use the Ignite backend API
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/courses`, {
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
      clearCourseImage();
      
      // Reload courses list
      loadCourses();
      
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
    <div className="min-h-screen bg-gray-50 page-fade-in">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-200px)]">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>
        {loading ? (
          <div className="text-gray-600 min-h-[600px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading admin panel...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 min-h-[600px]">
            {/* Admin Password Change Section */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Change Admin Password</h2>
                <button
                  onClick={() => setShowPasswordChangeForm(!showPasswordChangeForm)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {showPasswordChangeForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>
              
              {showPasswordChangeForm && (
                <form onSubmit={changeAdminPassword} className="space-y-4 border-t border-gray-200 pt-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <PasswordInput
                      value={passwordChangeForm.currentPassword}
                      onChange={(e) => setPasswordChangeForm({ ...passwordChangeForm, currentPassword: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      required
                      placeholder="Current Password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <PasswordInput
                      value={passwordChangeForm.newPassword}
                      onChange={(e) => setPasswordChangeForm({ ...passwordChangeForm, newPassword: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      required
                      minLength={8}
                      placeholder="New Password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <PasswordInput
                      value={passwordChangeForm.confirmPassword}
                      onChange={(e) => setPasswordChangeForm({ ...passwordChangeForm, confirmPassword: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      required
                      minLength={8}
                      placeholder="Confirm New Password"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              )}
            </section>

            {/* Custom Admin Creation Section */}
            {hasPrivilege('MANAGE_USERS') && (
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Custom Admin Management</h2>
                  <button
                    onClick={() => setShowCustomAdminForm(!showCustomAdminForm)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {showCustomAdminForm ? 'Cancel' : '+ Create Custom Admin'}
                  </button>
                </div>
                
                {showCustomAdminForm && (
                  <form onSubmit={createCustomAdmin} className="space-y-4 border-t border-gray-200 pt-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          value={customAdminForm.firstName}
                          onChange={(e) => setCustomAdminForm({ ...customAdminForm, firstName: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={customAdminForm.lastName}
                          onChange={(e) => setCustomAdminForm({ ...customAdminForm, lastName: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={customAdminForm.email}
                        onChange={(e) => setCustomAdminForm({ ...customAdminForm, email: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <PasswordInput
                        value={customAdminForm.password}
                        onChange={(e) => setCustomAdminForm({ ...customAdminForm, password: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        required
                        minLength={6}
                        placeholder="Password"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Privileges</label>
                      <div className="space-y-2">
                        {availablePrivileges.map(priv => (
                          <label key={priv.name} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={customAdminForm.privileges.includes(priv.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCustomAdminForm({
                                    ...customAdminForm,
                                    privileges: [...customAdminForm.privileges, priv.name]
                                  });
                                } else {
                                  setCustomAdminForm({
                                    ...customAdminForm,
                                    privileges: customAdminForm.privileges.filter(p => p !== priv.name)
                                  });
                                }
                              }}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{priv.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={creatingAdmin}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      {creatingAdmin ? 'Creating...' : 'Create Custom Admin'}
                    </button>
                  </form>
                )}
              </section>
            )}

            {hasPrivilege('MANAGE_SITE_SETTINGS') && (
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Site Settings</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Manage recruiter pricing and contact emails/phone shown across the app.
                </p>
                {loadingSiteSettings ? (
                  <p className="text-sm text-gray-500">Loading settings...</p>
                ) : (
                  <form onSubmit={saveSiteSettings} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recruiter Price Display</label>
                      <input
                        type="text"
                        value={siteSettingsForm.recruiterPriceDisplay}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, recruiterPriceDisplay: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                        <input
                          type="email"
                          value={siteSettingsForm.contactEmail}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, contactEmail: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                        <input
                          type="email"
                          value={siteSettingsForm.supportEmail}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, supportEmail: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Email</label>
                        <input
                          type="email"
                          value={siteSettingsForm.privacyEmail}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, privacyEmail: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="text"
                          value={siteSettingsForm.contactPhone}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, contactPhone: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingSiteSettings}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-semibold"
                    >
                      {savingSiteSettings ? 'Saving...' : 'Save Site Settings'}
                    </button>
                  </form>
                )}
              </section>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-8">
              {hasPrivilege('MANAGE_COURSES') && (
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
                  
                  {/* Course Image Upload Section */}
                  <div className="space-y-2 border border-gray-200 rounded-lg p-3">
                    <label className="block text-xs font-medium text-gray-700">Course Image</label>
                    
                    {/* Image Preview */}
                    {(courseImagePreview || courseImageUrl) && (
                      <div className="relative mb-2">
                        <img 
                          src={courseImagePreview || (courseImageUrl 
                            ? `${API_BASE_URL.replace('/api/v1', '')}${courseImageUrl}` 
                            : '')} 
                          alt="Course preview" 
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={clearCourseImage}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    
                    {/* File Input and Upload Button */}
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="flex-1 text-xs text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                        disabled={uploadingImage}
                      />
                      {courseImageFile && !courseImageUrl && (
                        <button
                          type="button"
                          onClick={uploadCourseImage}
                          disabled={uploadingImage}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg text-xs font-medium"
                        >
                          {uploadingImage ? 'Uploading...' : 'Upload'}
                        </button>
                      )}
                    </div>
                    
                    {/* Upload Status */}
                    {courseImageUrl && (
                      <div className="space-y-1">
                        <p className="text-xs text-green-600">✓ Image uploaded successfully</p>
                        <p className="text-xs text-gray-500 font-mono break-all">URL: {courseImageUrl}</p>
                      </div>
                    )}
                    
                    {courseImageFile && !courseImageUrl && (
                      <p className="text-xs text-yellow-600">⚠ Please click "Upload" button to upload the image before creating the course</p>
                    )}
                    
                    {!courseImageFile && !courseImageUrl && (
                      <p className="text-xs text-gray-500">Upload a course image (optional, max 5MB)</p>
                    )}
                  </div>
                  
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
              )}

              {hasPrivilege('MANAGE_USERS') && (
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
                  {loadingUsers ? (
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
                      const isAdmin = u.role === 'ADMIN';
                      const handleUserClick = () => {
                        if (isAdmin) return; // Admins are not clickable
                        if (u.role === 'CANDIDATE') {
                          // Navigate using the clicked user's id
                          navigate(`/candidates/${u.id}`);
                        } else if (u.role === 'RECRUITER') {
                          // Navigate using the clicked user's id
                          navigate(`/recruiters/${u.id}`);
                        }
                      };
                      return (
                    <div 
                      key={u.id} 
                      className={`border border-gray-200 rounded-lg p-4 transition-colors ${
                        isAdmin ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50'
                      }`}
                      onClick={handleUserClick}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${isAdmin ? 'text-gray-900' : 'text-gray-900'}`}>
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
                          {u.suspended && (
                            <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium mt-1">
                              Suspended
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {u.suspended ? (
                            <button 
                              onClick={() => suspendUser(u.id, false)} 
                              className="text-green-600 hover:text-green-800 font-medium text-sm"
                              title="Unsuspend user"
                            >
                              Unsuspend
                            </button>
                          ) : (
                            <button 
                              onClick={() => suspendUser(u.id, true)} 
                              className="text-yellow-600 hover:text-yellow-800 font-medium text-sm"
                              title="Suspend user"
                            >
                              Suspend
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete user ${u.first_name} ${u.last_name}?`)) {
                                deleteUser(u.id);
                              }
                            }} 
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                            title="Delete user"
                          >
                            Delete
                          </button>
                        </div>
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
              )}

              {/* Skill Rating Section */}
              {hasPrivilege('RATE_SKILLS') && (
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
              )}

              {/* Offers Management Section */}
              {hasPrivilege('MANAGE_OFFERS') && (
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">Offers Management</h2>
                  <button
                    onClick={loadAdminOffers}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    Refresh
                  </button>
                </div>

                <div className="space-y-3">
                  {loadingOffersAdmin ? (
                    <div className="text-center py-6 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                      <p className="text-sm">Loading offers...</p>
                    </div>
                  ) : offersAdminList.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No offers found</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs text-gray-500">
                        Showing {paginatedAdminOffers.length} of {offersAdminList.length} offers
                      </div>
                      {paginatedAdminOffers.map((offer) => (
                        <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="space-y-1 text-xs text-gray-600">
                                <p>
                                  <strong>Status:</strong> {offer.status || 'N/A'}
                                </p>
                                <p>
                                  <strong>Recruiter:</strong>{" "}
                                  {`${offer.recruiterFirstName ?? ""} ${offer.recruiterLastName ?? ""}`.trim() || "N/A"}{" "}
                                  ({offer.recruiterEmail || "N/A"})
                                </p>
                                <p>
                                  <strong>Candidate:</strong>{" "}
                                  {`${offer.candidateFirstName ?? ""} ${offer.candidateLastName ?? ""}`.trim() || "N/A"}{" "}
                                  ({offer.candidateEmail || "N/A"})
                                </p>
                                <p>
                                  <strong>Salary:</strong>{" "}
                                  {offer.salary != null ? `${offer.currency || ""} ${offer.salary}` : "N/A"}
                                </p>
                                <p>
                                  <strong>Date:</strong>{" "}
                                  {offer.createdAt ? new Date(offer.createdAt).toLocaleDateString() : "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {totalOffersAdminPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                          <button
                            onClick={() => setOffersAdminPage((p) => Math.max(1, p - 1))}
                            disabled={offersAdminPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-600">
                            Page {offersAdminPage} of {totalOffersAdminPages}
                          </span>
                          <button
                            onClick={() => setOffersAdminPage((p) => Math.min(totalOffersAdminPages, p + 1))}
                            disabled={offersAdminPage === totalOffersAdminPages}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>
              )}

              {/* Ads Management Section */}
              {hasPrivilege('MANAGE_ADS') && (
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Ads Management</h2>
                  <button
                    onClick={() => setShowAdForm(!showAdForm)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {showAdForm ? 'Cancel' : '+ Create Ad'}
                  </button>
                </div>
                
                {showAdForm && (
                  <form onSubmit={createAd} className="space-y-4 border-t border-gray-200 pt-4 mt-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={newAd.title}
                        onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        required
                        placeholder="Ad title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="url"
                        value={newAd.imageUrl}
                        onChange={(e) => setNewAd({ ...newAd, imageUrl: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        required
                        placeholder="https://cdn.site.com/ads/sale.png"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL</label>
                      <input
                        type="url"
                        value={newAd.redirectUrl}
                        onChange={(e) => setNewAd({ ...newAd, redirectUrl: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        required
                        placeholder="https://example.com/sale"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={newAd.startDate}
                          onChange={(e) => setNewAd({ ...newAd, startDate: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={newAd.endDate}
                          onChange={(e) => setNewAd({ ...newAd, endDate: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={creatingAd}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      {creatingAd ? 'Creating...' : 'Create Ad'}
                    </button>
                  </form>
                )}
                
                {/* Ads List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {loadingAds ? (
                    <div className="text-center py-4 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                      <p className="text-sm">Loading ads...</p>
                    </div>
                  ) : ads.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📢</div>
                      <p className="text-sm">No ads found</p>
                    </div>
                  ) : (
                    ads.map((ad) => {
                      const status = getAdStatusMeta(ad);
                      return (
                      <div key={ad.id} className={`border rounded-lg p-4 transition-colors ${status.muted ? 'border-gray-200 bg-gray-50/80 opacity-80' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${status.toneClass}`}>
                                {status.label}
                              </span>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              <p className="break-words">
                                <strong>Image:</strong>{' '}
                                <a 
                                  href={ad.imageUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline break-all"
                                  title={ad.imageUrl}
                                >
                                  {ad.imageUrl}
                                </a>
                              </p>
                              <p className="break-words">
                                <strong>Redirect:</strong>{' '}
                                <a 
                                  href={ad.redirectUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline break-all"
                                  title={ad.redirectUrl}
                                >
                                  {ad.redirectUrl}
                                </a>
                              </p>
                              <p><strong>Period:</strong> {new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteAd(ad.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm flex-shrink-0"
                            title="Delete ad"
                          >
                            Delete
                          </button>
                        </div>
                        {ad.imageUrl && (
                          <div className="mt-3">
                            <img
                              src={ad.imageUrl}
                              alt={ad.title}
                              className={`w-full h-32 object-cover rounded border border-gray-200 ${status.muted ? 'grayscale-[35%]' : ''}`}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )})
                  )}
                </div>
              </section>
              )}

              {/* Workshop Invite Section */}
              {hasPrivilege('MANAGE_WORKSHOPS') && (
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
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

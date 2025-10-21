import React from 'react';

'use client';

import { useEffect, useState } from 'react';
import { Edit3, Save, X, User, Mail, Phone, MapPin, Calendar, FileText, Briefcase, GraduationCap, Award, Link, Eye, EyeOff, Check, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthAPI } from '@/hooks/useAuthAPI';
import { useCandidatesAPI } from '@/hooks/useCandidatesAPI';
import { useOffersAPI } from '@/hooks/useOffersAPI';
import { usePageTokenValidation } from '@/components/TokenValidationWrapper';
import { candidatesAPI, skillsAPI } from '@/utils/apiClient';

// Offer Card Component
function OfferCard({ offer, onRespond }) {
  const [responding, setResponding] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'ACCEPTED': return 'text-green-600 bg-green-50';
      case 'REJECTED': return 'text-red-600 bg-red-50';
      case 'WITHDRAWN': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleResponse = async (status) => {
    setResponding(true);
    try {
      await onRespond(offer.id, status);
    } finally {
      setResponding(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm mb-1">{offer.title || `Offer #${offer.id}`}</h4>
          {offer.salary && (
            <p className="text-sm text-gray-600 mb-2">${offer.salary.toLocaleString()}</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
          {offer.status}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {formatDate(offer.createdAt)}
        </div>
        
        {offer.status === 'PENDING' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleResponse('ACCEPTED')}
              disabled={responding}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="w-3 h-3" />
              Accept
            </button>
            <button
              onClick={() => handleResponse('REJECTED')}
              disabled={responding}
              className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle className="w-3 h-3" />
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuthAPI();
  const { getMyProfile, updateMyProfile, loading: profileLoading } = useCandidatesAPI();
  const { getMyOffers, respondToOffer, loading: offersLoading } = useOffersAPI();
  const { isValid } = usePageTokenValidation(true); // Profile page requires auth
  
  const [profile, setProfile] = useState(null);
  const [offers, setOffers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSkills, setShowSkills] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [addingSkills, setAddingSkills] = useState(false);
  const [newSkillNames, setNewSkillNames] = useState('');
  const [showAddSkillsForm, setShowAddSkillsForm] = useState(false);

  useEffect(() => {
    console.log('Profile page useEffect - user:', user);
    console.log('User role:', user?.role);
    
    // Check authentication token first
    const token = localStorage.getItem('authToken');
    console.log('Auth token:', token);
    console.log('Token length:', token?.length);
    console.log('Token format check:', token?.split('.').length);
    
    // Only redirect if there's absolutely no token (not just malformed)
    if (!token) {
      console.log('No auth token found, redirecting to login');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      // Prevent infinite redirects
      if (window.location.pathname !== '/account/signin') {
        window.location.href = '/account/signin';
      }
      return;
    }
    
    // Wait for user to be loaded before proceeding
    if (!user) {
      console.log('User not loaded yet, waiting...');
      return;
    }
    
    // Additional check: if user exists but has no role, might still be loading
    if (user && !user.role) {
      console.log('User loaded but no role yet, waiting...');
      return;
    }
    
    // Check if user is a candidate before loading profile
    if (user?.role !== 'CANDIDATE') {
      console.log('User is not a candidate, setting error');
      setError('This page is only accessible to candidates');
      return;
    }
    
    console.log('User is a candidate with token, loading profile');
    loadProfile();
    loadOffers();
    loadAvailableSkills();
  }, [user]);


  const loadProfile = async () => {
    try {
      setError(null);
      
      const profileData = await getMyProfile();
      console.log('Profile data received:', profileData);
      setProfile(profileData);
    } catch (err) {
      console.error('Error loading profile:', err);
      console.error('Error message:', err.message);
      console.error('Error status:', err.status);
      
      // Check for authentication errors first
      if (err.message?.includes('JWT') || 
          err.message?.includes('token') ||
          err.message?.includes('Unauthorized') ||
          err.message?.includes('unauthorized') ||
          err.status === 401) {
        console.log('Authentication error detected, redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        // Prevent infinite redirects
        if (window.location.pathname !== '/account/signin') {
          window.location.href = '/account/signin';
        }
        return;
      }
      
      // Check for profile not found error
      const errorMessage = err.message || '';
      if (errorMessage.includes('Profile not found') || 
          errorMessage.includes('profile not found') ||
          errorMessage.includes('Profile Not Found') ||
          err.status === 404) {
        // User doesn't have a profile yet, try to create one
        console.log('Profile not found, creating basic profile');
        try {
          // Create a basic profile using the exact DTO structure
          const basicProfile = {
            title: 'Software Developer', // Required field
            summary: '',
            resumeUrl: '',
            location: ''
          };
          const newProfile = await updateMyProfile(basicProfile);
          console.log('Basic profile created successfully:', newProfile);
          setProfile(newProfile);
        } catch (createErr) {
          console.error('Failed to create basic profile:', createErr);
          // Check if creation failed due to auth error
          if (createErr.message?.includes('JWT') || 
              createErr.message?.includes('token') ||
              createErr.message?.includes('Unauthorized') ||
              createErr.status === 401) {
            console.log('Authentication error during profile creation, redirecting to login');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            // Prevent infinite redirects
            if (window.location.pathname !== '/account/signin') {
              window.location.href = '/account/signin';
            }
            return;
          }
          setError('Unable to create profile. Please contact support.');
        }
      } else {
        setError('Failed to load profile: ' + errorMessage);
      }
    }
  };

  const loadOffers = async () => {
    try {
      const offersData = await getMyOffers();
      setOffers(offersData || []);
    } catch (err) {
      console.error('Error loading offers:', err);
      
      // Check for authentication errors
      if (err.message?.includes('JWT') || 
          err.message?.includes('token') ||
          err.message?.includes('Unauthorized') ||
          err.message?.includes('unauthorized') ||
          err.status === 401) {
        console.log('Authentication error during offers load, redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        // Prevent infinite redirects
        if (window.location.pathname !== '/account/signin') {
          window.location.href = '/account/signin';
        }
        return;
      }
      
      // For offers, we don't want to show an error if it fails
      // Just log it and continue
      console.warn('Failed to load offers, continuing without offers');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // Create the update payload using the exact DTO structure
      const updatePayload = {
        title: profile.title || 'Software Developer', // Required field
        summary: profile.summary || null,
        resumeUrl: profile.resumeUrl || null,
        location: profile.location || null
      };
      
      console.log('Saving profile with payload:', updatePayload);
      const updatedProfile = await updateMyProfile(updatePayload);
      console.log('Profile updated successfully:', updatedProfile);
      
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      
      // Check for authentication errors
      if (err.message?.includes('JWT') || 
          err.message?.includes('token') ||
          err.message?.includes('Unauthorized') ||
          err.message?.includes('unauthorized') ||
          err.status === 401) {
        console.log('Authentication error during save, redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        // Prevent infinite redirects
        if (window.location.pathname !== '/account/signin') {
          window.location.href = '/account/signin';
        }
        return;
      }
      
      setError('Failed to save profile: ' + (err.message || 'Unknown error'));
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadProfile(); // Reset to original data
    setError(null);
  };

  const handleOfferResponse = async (offerId, status) => {
    try {
      await respondToOffer(offerId, status);
      // Reload offers to get updated status
      await loadOffers();
      toast.success(`Offer ${status.toLowerCase()} successfully!`);
    } catch (err) {
      console.error('Error responding to offer:', err);
      
      // Check for authentication errors
      if (err.message?.includes('JWT') || 
          err.message?.includes('token') ||
          err.message?.includes('Unauthorized') ||
          err.message?.includes('unauthorized') ||
          err.status === 401) {
        console.log('Authentication error during offer response, redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        // Prevent infinite redirects
        if (window.location.pathname !== '/account/signin') {
          window.location.href = '/account/signin';
        }
        return;
      }
      
      toast.error(`Failed to ${status.toLowerCase()} offer. Please try again.`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };


  const getTopSkills = () => {
    if (!profile?.skills || typeof profile.skills !== 'object') return [];
    return Object.entries(profile.skills)
      .sort(([,a], [,b]) => b - a)
      .slice(0, showSkills ? Object.keys(profile.skills).length : 6)
      .map(([skill, level]) => ({ skill, level }));
  };

  // Load available skills
  const loadAvailableSkills = async () => {
    try {
      setLoadingSkills(true);
      const response = await skillsAPI.getAllSkills();
      setAvailableSkills(response || []);
    } catch (error) {
      console.error('Error loading skills:', error);
      toast.error('Failed to load available skills');
    } finally {
      setLoadingSkills(false);
    }
  };

  // Add skills to profile
  const addSkillsToProfile = async () => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }

    try {
      setAddingSkills(true);
      const skillNames = selectedSkills.map(skill => skill.name);
      await candidatesAPI.addSkillsToMyProfile(skillNames);
      
      // Refresh profile data
      await loadProfile();
      setSelectedSkills([]);
      toast.success('Skills added successfully!');
    } catch (error) {
      console.error('Error adding skills:', error);
      toast.error('Failed to add skills');
    } finally {
      setAddingSkills(false);
    }
  };

  // Add new skills by name
  const addNewSkillsByName = async () => {
    if (!newSkillNames.trim()) {
      toast.error('Please enter at least one skill name');
      return;
    }

    try {
      setAddingSkills(true);
      // Split by comma and clean up the skill names
      const skillNames = newSkillNames
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);

      if (skillNames.length === 0) {
        toast.error('Please enter valid skill names');
        return;
      }

      console.log('Adding skills:', skillNames);
      console.log('Request payload:', { skillNames });
      
      const response = await candidatesAPI.addSkillsToMyProfile(skillNames);
      console.log('Skills added successfully:', response);
      
      // Refresh profile data
      await loadProfile();
      setNewSkillNames('');
      setShowAddSkillsForm(false);
      toast.success(`${skillNames.length} skill(s) added successfully!`);
    } catch (error) {
      console.error('Error adding skills:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      
      // More specific error messages
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
        toast.error('Invalid skill names. Please check your input.');
      } else if (error.message?.includes('404')) {
        toast.error('Profile not found. Please try again.');
      } else {
        toast.error(`Failed to add skills: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setAddingSkills(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse">
            <div className="bg-white rounded-xl p-8 mb-8">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if user is not a candidate
  if (user?.role !== 'CANDIDATE') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">This page is only accessible to candidates.</p>
            <p className="text-sm text-gray-500">Your current role: {user?.role || 'Unknown'}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    if (error) {
      return (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white rounded-xl p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Error</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setError(null);
                    loadProfile();
                  }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white rounded-xl p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
              <p className="text-gray-600">Unable to load your profile information.</p>
            </div>
          </div>
          <Footer />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 page-fade-in">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.name || user?.name || user?.firstName || 'User'}
                </h1>
                <p className="text-xl text-gray-600 mb-2">{profile.title || 'Software Developer'}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {user?.email}
                  </span>
                  {profile.phoneNumber && (
                    <span className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {profile.phoneNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              <span>{isEditing ? 'View' : 'Edit'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-red-600" />
                About
              </h2>
              {isEditing ? (
                <textarea
                  value={profile.summary || ''}
                  onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={6}
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {profile.summary || 'No summary provided yet.'}
                </p>
              )}
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-red-600" />
                  Skills
                </h2>
                {!isEditing && getTopSkills().length > 6 && (
                  <button
                    onClick={() => setShowSkills(!showSkills)}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center"
                  >
                    {showSkills ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    {showSkills ? 'Show Less' : 'Show All'}
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Current skills: {profile.skills ? Object.keys(profile.skills).length : 0} skills
                    </div>
                    <button
                      onClick={() => setShowAddSkillsForm(!showAddSkillsForm)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Add New Skills
                    </button>
                  </div>
                  
                  {/* Add New Skills Form */}
                  {showAddSkillsForm && (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Skills</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter skill names (separate multiple skills with commas)
                          </label>
                          <input
                            type="text"
                            value={newSkillNames}
                            onChange={(e) => setNewSkillNames(e.target.value)}
                            placeholder="e.g., JavaScript, React, Node.js, Python"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Example: JavaScript, React, Node.js, Python, Machine Learning
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={addNewSkillsByName}
                            disabled={addingSkills || !newSkillNames.trim()}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                          >
                            {addingSkills ? 'Adding...' : 'Add Skills'}
                          </button>
                          <button
                            onClick={() => {
                              setShowAddSkillsForm(false);
                              setNewSkillNames('');
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Current Skills Display */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">My Skills</h3>
                    
                    {profile.skills && Object.keys(profile.skills).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(profile.skills).map(([skillName, rating]) => (
                          <div key={skillName} className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{skillName}</h4>
                              <span className={`text-sm font-bold ${
                                rating === 0 ? 'text-gray-500' : 'text-green-600'
                              }`}>
                                {rating === 0 ? 'unverified' : `${rating}% verified`}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  rating === 0 
                                    ? 'bg-gray-400' 
                                    : 'bg-gradient-to-r from-green-500 to-green-600'
                                }`}
                                style={{ width: `${rating}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>0%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No Skills Added Yet</h4>
                        <p className="text-gray-500 mb-4">Add skills to showcase your expertise to potential employers.</p>
                        <button
                          onClick={() => setShowAddSkillsForm(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Add Your First Skill
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {getTopSkills().map(({ skill, level }) => (
                    <div key={skill} className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      level === 0 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-green-50 text-green-700'
                    }`}>
                      {skill} ({level === 0 ? 'unverified' : `${level}% verified`})
                    </div>
                  ))}
                  {(!profile.skills || Object.keys(profile.skills).length === 0) && (
                    <p className="text-gray-500">No skills added yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Professional Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-red-600" />
                Professional Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.title || ''}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="e.g., Software Engineer"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.title || 'Not specified'}</p>
                  )}
                </div>
                

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profile.resumeUrl || ''}
                      onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="https://example.com/resume.pdf"
                    />
                  ) : (
                    <div>
                      {profile.resumeUrl ? (
                        <a 
                          href={profile.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-700 flex items-center"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View Resume
                        </a>
                      ) : (
                        <p className="text-gray-500">No resume uploaded</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.location || ''}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="e.g., New York, NY"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      {profile.location || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            {isEditing && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Skills</span>
                  <span className="font-semibold">{profile.skills ? Object.keys(profile.skills).length : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Offers Received</span>
                  <span className="font-semibold">{offers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">{formatDate(profile?.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* My Offers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Offers</h3>
              {offersLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : offers.length === 0 ? (
                <p className="text-gray-500 text-sm">No offers yet.</p>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                  {offers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} onRespond={handleOfferResponse} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthAPI } from "@/hooks/useAuthAPI";
import { candidatesAPI, offersAPI } from "@/utils/apiClient";
import { Search, MapPin, Filter, Briefcase, GraduationCap, UserRound, Calendar, FileText, Award, X, DollarSign } from "lucide-react";

function SeekerCard({ seeker, onOpenOfferModal, sendingOfferId, hasOfferSent, userRole }) {
  const getTopSkills = () => {
    if (!seeker.skills || typeof seeker.skills !== 'object') return [];
    return Object.entries(seeker.skills)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([skill, level]) => ({ skill, level }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const getAvailabilityStatus = () => {
    if (!seeker.availableFrom) return { status: 'Available', color: 'text-green-600' };
    const availableDate = new Date(seeker.availableFrom);
    const now = new Date();
    if (availableDate <= now) {
      return { status: 'Available', color: 'text-green-600' };
    } else {
      return { status: `Available ${formatDate(seeker.availableFrom)}`, color: 'text-yellow-600' };
    }
  };

  return (
    <div className="relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-red-200 transition-all duration-300 group">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold">
          {seeker.name?.charAt(0) || 'C'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-red-600 transition-colors">
              {seeker.name || 'Candidate'}
            </h3>
            {hasOfferSent && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                Offer Sent
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">{seeker.title || 'Software Developer'}</p>
        </div>
      </div>

      <div className="space-y-3 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span className={`font-medium ${getAvailabilityStatus().color}`}>
            {getAvailabilityStatus().status}
          </span>
        </div>
        {seeker.resumeUrl && (
          <div className="flex items-center gap-2 text-gray-500">
            <FileText className="w-4 h-4" />
            <a 
              href={seeker.resumeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700"
            >
              View Resume
            </a>
          </div>
        )}
      </div>

      {seeker.summary && (
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {seeker.summary}
          </p>
        </div>
      )}

      {getTopSkills().length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-gray-700">Skills</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {getTopSkills().map(({ skill, level }) => (
              <div key={skill} className={`px-2 py-1 rounded-md text-xs font-medium ${
                level === 0 
                  ? 'bg-gray-100 text-gray-600' 
                  : 'bg-green-50 text-green-700'
              }`}>
                {skill} ({level === 0 ? 'unverified' : `${level}% verified`})
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={() => window.open(`/candidates/${seeker.id}`, '_blank')}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
          >
            View Profile
          </button>
          {userRole === 'RECRUITER' && (
            <button
              onClick={() => onOpenOfferModal(seeker)}
              disabled={sendingOfferId === seeker.id || hasOfferSent}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                hasOfferSent 
                  ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {sendingOfferId === seeker.id ? 'Sending...' : hasOfferSent ? 'Offer Sent' : 'Send Offer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobSeekersPage() {
  const { isAuthenticated, isRecruiter, isAdmin, user } = useAuthAPI();
  const [seekers, setSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    last: true
  });
  const [filters, setFilters] = useState({
    query: '',
    skills: [],
    page: 0,
    size: 20,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sendingOfferId, setSendingOfferId] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [offerForm, setOfferForm] = useState({
    title: '',
    salary: '',
    currency: 'USD'
  });
  const [sentOffers, setSentOffers] = useState(new Set());
  const [manualSkill, setManualSkill] = useState('');
  
  // Common skills for quick filtering
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript',
    'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'HTML', 'CSS',
    'Angular', 'Vue.js', 'Spring Boot', 'Express.js', 'PostgreSQL',
    'Redis', 'Kubernetes', 'GraphQL', 'REST API', 'Microservices',
    'Machine Learning', 'Data Science', 'DevOps', 'Agile', 'Scrum'
  ];

  // Redirect if not authorized
  useEffect(() => {
    if (isAuthenticated && !isRecruiter && !isAdmin) {
      window.location.href = '/jobs';
    }
  }, [isAuthenticated, isRecruiter, isAdmin]);

  // Show access denied message for unauthorized users
  if (isAuthenticated && !isRecruiter && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only accessible to recruiters and administrators.</p>
          <a href="/jobs" className="text-red-600 hover:text-red-700 font-medium">
            Go to Jobs
          </a>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query') || '';
    const skillsParam = urlParams.get('skills');
    const skills = skillsParam ? skillsParam.split(',').filter(s => s.trim()) : [];
    
    const initialFilters = {
      query,
      skills,
      page: 0,
      size: 20,
    };
    setFilters(initialFilters);
  }, []);

  useEffect(() => {
    fetchSeekers();
  }, [filters]);

  const fetchSeekers = async () => {
    setLoading(true);
    try {
      console.log('Fetching candidates with filters:', filters);
      
      // Convert page from 0-based to 0-based (already correct)
      const page = filters.page;
      const size = filters.size;
      const query = filters.query?.trim() || null;
      const skills = filters.skills.length > 0 ? filters.skills : null;
      
      console.log('API call parameters:', { page, size, query, skills });
      
      const response = await candidatesAPI.getAllCandidates(page, size, query, skills);
      
      console.log('Candidates response:', response);
      
      setSeekers(response.content || []);
      setPagination({
        page: response.page,
        size: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        last: response.last
      });
      
      // Extract unique skills from all candidates for filter options
      const allSkills = new Set();
      response.content?.forEach(candidate => {
        if (candidate.skills && typeof candidate.skills === 'object') {
          Object.keys(candidate.skills).forEach(skill => allSkills.add(skill));
        }
      });
      setAvailableSkills(Array.from(allSkills).sort());
      
    } catch (error) {
      console.error('Error fetching candidates:', error);
      
      // Check for authentication errors
      if (error.message?.includes('JWT') || 
          error.message?.includes('token') ||
          error.message?.includes('Unauthorized') ||
          error.message?.includes('unauthorized') ||
          error.status === 401) {
        console.log('Authentication error during candidates fetch, redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        // Prevent infinite redirects
        if (window.location.pathname !== '/account/signin') {
          window.location.href = '/account/signin';
        }
        return;
      }
      
      toast.error('Failed to load candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }));
  };

  const handleSkillToggle = (skill) => {
    setFilters((prev) => {
      const newSkills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: newSkills, page: 0 };
    });
  };

  const addManualSkill = () => {
    const skill = manualSkill.trim();
    if (skill && !filters.skills.includes(skill)) {
      setFilters((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
        page: 0
      }));
      setManualSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
      page: 0
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 0 }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      skills: [],
      page: 0,
      size: 20,
    });
    setManualSkill('');
  };

  const openOfferModal = (seeker) => {
    // Don't open modal if offer already sent
    if (sentOffers.has(seeker.id)) {
      toast.info('Offer already sent to this candidate');
      return;
    }
    
    setSelectedCandidate(seeker);
    setOfferForm({
      title: `Job Offer for ${seeker.title || 'Software Developer'}`,
      salary: '',
      currency: 'USD'
    });
    setShowOfferModal(true);
  };

  const closeOfferModal = () => {
    setShowOfferModal(false);
    setSelectedCandidate(null);
    setOfferForm({ title: '', salary: '', currency: 'USD' });
  };

  const sendOffer = async () => {
    if (!selectedCandidate) return;
    
    try {
      setSendingOfferId(selectedCandidate.id);
      
      // Create offer data matching SendOfferDTO structure
      const offerData = {
        candidateProfileId: selectedCandidate.id,
        title: offerForm.title.trim(),
        salary: offerForm.salary ? parseFloat(offerForm.salary) : null,
        currency: offerForm.currency || 'USD'
      };
      
      console.log('Sending offer with data:', offerData);
      
      const response = await offersAPI.sendOffer(offerData);
      console.log('Offer sent successfully:', response);
      
      toast.success(`Offer sent successfully to ${selectedCandidate.name}!`);
      setSentOffers(prev => new Set([...prev, selectedCandidate.id]));
      closeOfferModal();
      
    } catch (error) {
      console.error('Error sending offer:', error);
      
      // Check for authentication errors
      if (error.message?.includes('JWT') || 
          error.message?.includes('token') ||
          error.message?.includes('Unauthorized') ||
          error.message?.includes('unauthorized') ||
          error.status === 401) {
        console.log('Authentication error during offer send, redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        // Prevent infinite redirects
        if (window.location.pathname !== '/account/signin') {
          window.location.href = '/account/signin';
        }
        return;
      }
      
      // Check for specific error messages
      if (error.message?.includes('Only recruiters can send offers')) {
        toast.error('Only recruiters can send offers. Please check your account type.');
      } else if (error.message?.includes('Candidate not found')) {
        toast.error('Candidate not found. Please refresh the page and try again.');
      } else if (error.message?.includes('Recruiter profile not found')) {
        toast.error('Recruiter profile not found. Please complete your profile first.');
      } else {
        toast.error('Failed to send offer. Please try again.');
      }
    } finally {
      setSendingOfferId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 page-fade-in">
      <Header />

      <section className="bg-gradient-to-br from-red-50 via-white to-pink-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Job Seekers</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover talented candidates matching your roles. Search by title or summary, and filter by skills.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by title or summary"
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-0 outline-none text-gray-700 placeholder-gray-400 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80">
            <div className="bg-white rounded-xl p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-gray-900">Filters</h3>
                <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden text-red-600">
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Skills Filter</label>
                  
                  {/* Selected Skills Display */}
                  {filters.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {filters.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual Skill Input */}
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualSkill}
                        onChange={(e) => setManualSkill(e.target.value)}
                        placeholder="Add custom skill..."
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addManualSkill();
                          }
                        }}
                      />
                      <button
                        onClick={addManualSkill}
                        disabled={!manualSkill.trim()}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Common Skills */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Common Skills</h4>
                    <div className="max-h-48 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {commonSkills.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => handleSkillToggle(skill)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                              filters.skills.includes(skill)
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Available Skills from Candidates */}
                  {availableSkills.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">From Candidates</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {availableSkills.map((skill) => (
                          <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.skills.includes(skill)}
                              onChange={() => handleSkillToggle(skill)}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{skill}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {loading ? 'Loading...' : `${pagination.totalElements || 0} candidates found`}
                </h2>
                <p className="text-gray-600 text-sm">
                  Showing {Math.min(pagination.page * pagination.size + 1, pagination.totalElements || 0)} - {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements || 0)} of {pagination.totalElements || 0} results
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {seekers.map((seeker) => (
                    <div key={seeker.id} className={sendingOfferId === seeker.id ? 'opacity-60 pointer-events-none' : ''}>
                      <SeekerCard 
                        seeker={seeker} 
                        onOpenOfferModal={openOfferModal} 
                        sendingOfferId={sendingOfferId}
                        hasOfferSent={sentOffers.has(seeker.id)}
                        userRole={user?.role}
                      />
                    </div>
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex gap-2">
                      {pagination.page > 0 && (
                        <button
                          onClick={() => handleFilterChange('page', pagination.page - 1)}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Previous
                        </button>
                      )}
                      
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = Math.max(0, pagination.page - 2) + i;
                        if (pageNum >= pagination.totalPages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleFilterChange('page', pageNum)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              pageNum === pagination.page
                                ? 'bg-red-600 text-white'
                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                      
                      {pagination.page < pagination.totalPages - 1 && (
                        <button
                          onClick={() => handleFilterChange('page', pagination.page + 1)}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {seekers.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <UserRound className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No candidates found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Offer Modal */}
      {showOfferModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Send Job Offer</h3>
              <button
                onClick={closeOfferModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold">
                  {selectedCandidate.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedCandidate.name}</h4>
                  <p className="text-sm text-gray-600">{selectedCandidate.title}</p>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); sendOffer(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Salary (Optional)
                  </label>
                  <input
                    type="number"
                    value={offerForm.salary}
                    onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })}
                    placeholder="e.g., 75000"
                    min="1"
                    max="1000000"
                    step="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={offerForm.currency}
                    onChange={(e) => setOfferForm({ ...offerForm, currency: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="EGP">EGP</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeOfferModal}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!offerForm.title.trim() || sendingOfferId === selectedCandidate.id}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sendingOfferId === selectedCandidate.id ? 'Sending...' : 'Send Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



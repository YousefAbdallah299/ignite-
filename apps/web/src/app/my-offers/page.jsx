'use client';

import { useEffect, useState } from 'react';
import { Check, XCircle, Clock, User, DollarSign, Calendar, Eye, Trash2, Building2, CreditCard, ExternalLink, Edit3, Save, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RevealOnScroll from '@/components/RevealOnScroll';
import { useAuthAPI } from '@/hooks/useAuthAPI';
import { useOffersAPI } from '@/hooks/useOffersAPI';
import { usePageTokenValidation } from '@/components/TokenValidationWrapper';
import { recruitersAPI } from '@/utils/apiClient';

// Offer Card Component for Recruiters
function RecruiterOfferCard({ offer, onWithdrawOffer, withdrawingId }) {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'ACCEPTED': return <Check className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      case 'WITHDRAWN': return <Eye className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {offer.title || `Offer #${offer.id}`}
          </h3>
          
          <div className="space-y-2">
            {offer.salary && (
              <div className="flex items-center text-gray-600">
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="font-medium">${offer.salary.toLocaleString()}</span>
              </div>
            )}
            
            {offer.candidate && (
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>To: {offer.candidate.name || offer.candidate.firstName || 'Candidate'}</span>
              </div>
            )}
            
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Sent: {formatDate(offer.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(offer.status)}`}>
            {getStatusIcon(offer.status)}
            {offer.status}
          </span>
        </div>
      </div>
      
      {offer.candidate && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Candidate Information:</h4>
          <div className="text-sm text-gray-600">
            <p><strong>Name:</strong> {offer.candidate.name || offer.candidate.firstName || 'Not provided'}</p>
            {offer.candidate.title && (
              <p><strong>Title:</strong> {offer.candidate.title}</p>
            )}
            {offer.candidate.email && (
              <p><strong>Email:</strong> {offer.candidate.email}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Withdraw Button - Only show for PENDING offers */}
      {offer.status === 'PENDING' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onWithdrawOffer(offer.id)}
            disabled={withdrawingId === offer.id}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {withdrawingId === offer.id ? 'Withdrawing...' : 'Withdraw Offer'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyOffersPage() {
  const { user, isRecruiter, isAuthenticated } = useAuthAPI();
  const { getMyOffers, withdrawOffer, loading: offersLoading } = useOffersAPI();
  const { isValid } = usePageTokenValidation(true); // My offers page requires auth
  
  const [offers, setOffers] = useState([]);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editingCompanyName, setEditingCompanyName] = useState('');
  const [savingCompany, setSavingCompany] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0
  });

  useEffect(() => {
    // Redirect if not a recruiter
    if (isAuthenticated && !isRecruiter) {
      window.location.href = '/profile';
    }
  }, [isAuthenticated, isRecruiter]);

  useEffect(() => {
    if (isRecruiter) {
      loadRecruiterProfile();
      loadOffers();
    }
  }, [isRecruiter]);

  const loadRecruiterProfile = async () => {
    try {
      setProfileLoading(true);
      console.log('Loading recruiter profile...');
      const profileData = await recruitersAPI.getMyProfile();
      console.log('Recruiter profile data received:', profileData);
      setRecruiterProfile(profileData);
    } catch (err) {
      console.error('Error loading recruiter profile:', err);
      
      // Check for authentication errors
      if (err.message?.includes('JWT') || 
          err.message?.includes('token') ||
          err.message?.includes('Unauthorized') ||
          err.message?.includes('unauthorized') ||
          err.status === 401) {
        console.log('Authentication error during profile load, redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        // Prevent infinite redirects
        if (window.location.pathname !== '/account/signin') {
          window.location.href = '/account/signin';
        }
        return;
      }
      
      toast.error('Failed to load recruiter profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const loadOffers = async () => {
    try {
      const offersData = await getMyOffers();
      setOffers(offersData || []);
      
      // Calculate stats
      const stats = {
        total: offersData?.length || 0,
        pending: offersData?.filter(o => o.status === 'PENDING').length || 0,
        accepted: offersData?.filter(o => o.status === 'ACCEPTED').length || 0,
        rejected: offersData?.filter(o => o.status === 'REJECTED').length || 0,
        withdrawn: offersData?.filter(o => o.status === 'WITHDRAWN').length || 0
      };
      setStats(stats);
    } catch (err) {
      console.error('Error loading offers:', err);
      toast.error('Failed to load offers');
    }
  };

  const handleWithdrawOffer = async (offerId) => {
    try {
      setWithdrawingId(offerId);
      
      console.log('Withdrawing offer:', offerId);
      await withdrawOffer(offerId);
      
      toast.success('Offer withdrawn successfully');
      
      // Reload offers to get updated status
      await loadOffers();
      
    } catch (error) {
      console.error('Error withdrawing offer:', error);
      
      // Check for authentication errors
      if (error.message?.includes('JWT') || 
          error.message?.includes('token') ||
          error.message?.includes('Unauthorized') ||
          error.message?.includes('unauthorized') ||
          error.status === 401) {
        console.log('Authentication error during withdraw, redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        // Prevent infinite redirects
        if (window.location.pathname !== '/account/signin') {
          window.location.href = '/account/signin';
        }
        return;
      }
      
      // Check for specific error messages
      if (error.message?.includes('Only recruiters can withdraw offers')) {
        toast.error('Only recruiters can withdraw offers.');
      } else if (error.message?.includes('Offer not found')) {
        toast.error('Offer not found. Please refresh the page.');
      } else if (error.message?.includes('Cannot withdraw offer')) {
        toast.error('This offer cannot be withdrawn.');
      } else {
        toast.error('Failed to withdraw offer. Please try again.');
      }
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleEditCompany = () => {
    setIsEditingCompany(true);
    setEditingCompanyName(recruiterProfile?.companyName || '');
  };

  const handleCancelEdit = () => {
    setIsEditingCompany(false);
    setEditingCompanyName('');
  };

  const handleSaveCompany = async () => {
    if (!editingCompanyName.trim()) {
      toast.error('Company name cannot be empty');
      return;
    }

    try {
      setSavingCompany(true);
      
      console.log('Updating company name to:', editingCompanyName);
      
      // Create update payload matching the backend DTO structure
      const updatePayload = {
        companyName: editingCompanyName.trim()
      };
      
      // Make actual API call to update recruiter profile
      const updatedProfile = await recruitersAPI.updateMyProfile(updatePayload);
      console.log('Profile updated successfully:', updatedProfile);
      
      // Update local state with the response from backend
      setRecruiterProfile(updatedProfile);
      
      setIsEditingCompany(false);
      setEditingCompanyName('');
      toast.success('Company name updated successfully');
      
    } catch (error) {
      console.error('Error updating company name:', error);
      
      // Check for authentication errors
      if (error.message?.includes('JWT') || 
          error.message?.includes('token') ||
          error.message?.includes('Unauthorized') ||
          error.message?.includes('unauthorized') ||
          error.status === 401) {
        console.log('Authentication error during company update, redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        // Prevent infinite redirects
        if (window.location.pathname !== '/account/signin') {
          window.location.href = '/account/signin';
        }
        return;
      }
      
      // Check for specific backend error messages
      if (error.message?.includes('Only recruiters can update')) {
        toast.error('Only recruiters can update their profile.');
      } else if (error.message?.includes('Profile not found')) {
        toast.error('Profile not found. Please refresh the page.');
      } else if (error.message?.includes('Company name is required')) {
        toast.error('Company name is required.');
      } else {
        toast.error('Failed to update company name. Please try again.');
      }
    } finally {
      setSavingCompany(false);
    }
  };

  // Show access denied for non-recruiters
  if (isAuthenticated && !isRecruiter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only accessible to recruiters.</p>
          <a href="/profile" className="text-red-600 hover:text-red-700 font-medium">
            Go to My Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 page-fade-in">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 initial-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your company profile and track offers sent to candidates</p>
        </div>

        {/* Company & Subscription Card */}
        <RevealOnScroll>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Building2 className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                {isEditingCompany ? (
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={editingCompanyName}
                      onChange={(e) => setEditingCompanyName(e.target.value)}
                      className="text-xl font-semibold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter company name"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveCompany}
                      disabled={savingCompany || !editingCompanyName.trim()}
                      className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {savingCompany ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={savingCompany}
                      className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {profileLoading ? 'Loading...' : recruiterProfile?.companyName || 'Company Name'}
                    </h2>
                    <button
                      onClick={handleEditCompany}
                      className="flex items-center px-2 py-1 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Edit company name"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    recruiterProfile?.status === 'SUBSCRIBED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <CreditCard className="w-4 h-4 mr-1" />
                    {recruiterProfile?.status === 'SUBSCRIBED' ? 'Subscribed' : 'Guest'}
                  </span>
                  {recruiterProfile?.subscriptionEndDate && recruiterProfile?.status === 'SUBSCRIBED' && (
                    <span className="text-sm text-gray-600">
                      Valid until: {new Date(recruiterProfile.subscriptionEndDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Only show buttons for non-subscribed users */}
            {recruiterProfile?.status !== 'SUBSCRIBED' && (
              <div className="flex items-center space-x-3">
                <a
                  href="/pricing"
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  See Pricing
                </a>
                <a
                  href="/payment"
                  className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Subscribe
                </a>
              </div>
            )}
          </div>
          </div>
        </RevealOnScroll>

        {/* Stats Cards */}
        <RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Offers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Eye className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Withdrawn</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withdrawn}</p>
              </div>
            </div>
          </div>
          </div>
        </RevealOnScroll>

        {/* Offers List */}
        <RevealOnScroll>
          <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Offers</h2>
          </div>
          
          <div className="p-6">
            {offersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No offers sent yet</h3>
                <p className="text-gray-600 mb-6">Start by browsing candidates and sending your first offer.</p>
                <a 
                  href="/job-seekers" 
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Browse Candidates
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {offers.map((offer) => (
                  <RecruiterOfferCard 
                    key={offer.id} 
                    offer={offer} 
                    onWithdrawOffer={handleWithdrawOffer}
                    withdrawingId={withdrawingId}
                  />
                ))}
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

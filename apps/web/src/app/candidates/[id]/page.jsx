'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthAPI } from '@/hooks/useAuthAPI';
import { MapPin, Briefcase, GraduationCap, Calendar, FileText, Award, User, Mail, Phone, X } from 'lucide-react';
import { candidatesAPI, offersAPI } from '@/utils/apiClient';

export default function CandidatePage() {
  const { isAuthenticated, isRecruiter, isAdmin } = useAuthAPI();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: '',
    salary: '',
    currency: 'USD'
  });
  const id = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await candidatesAPI.getCandidateById(id);
        setData(response);
      } catch (error) {
        console.error('Error fetching candidate:', error);
        toast.error('Failed to load candidate profile');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const sendOffer = async () => {
    if (!data) return;
    
    try {
      setSending(true);
      
      // Create offer data matching SendOfferDTO structure
      const offerData = {
        candidateProfileId: data.id,
        title: offerForm.title.trim(),
        salary: offerForm.salary ? parseFloat(offerForm.salary) : null,
        currency: offerForm.currency || 'USD'
      };
      
      console.log('Sending offer with data:', offerData);
      
      const response = await offersAPI.sendOffer(offerData);
      console.log('Offer sent successfully:', response);
      
      toast.success(`Offer sent successfully to ${data.name}!`);
      setShowOfferModal(false);
      setOfferForm({ title: '', salary: '', currency: 'USD' });
      
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
      setSending(false);
    }
  };

  const openOfferModal = () => {
    setOfferForm({
      title: `Job Offer for ${data.title || 'Software Developer'}`,
      salary: '',
      currency: 'USD'
    });
    setShowOfferModal(true);
  };

  const closeOfferModal = () => {
    setShowOfferModal(false);
    setOfferForm({ title: '', salary: '', currency: 'USD' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };


  const getTopSkills = () => {
    if (!data?.skills || typeof data.skills !== 'object') return [];
    return Object.entries(data.skills)
      .sort(([,a], [,b]) => b - a)
      .slice(0, showSkills ? Object.keys(data.skills).length : 6)
      .map(([skill, level]) => ({ skill, level }));
  };

  if (loading) {
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

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Candidate Not Found</h1>
            <p className="text-gray-600">The candidate profile you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
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
                {data.name?.charAt(0) || 'C'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {data.name || 'Candidate'}
                </h1>
                <p className="text-xl text-gray-600 mb-2">{data.title || 'Software Developer'}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Contact via platform
                  </span>
                </div>
              </div>
            </div>
            {isRecruiter && (
              <button 
                onClick={openOfferModal} 
                disabled={sending} 
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg font-semibold transition-colors"
              >
                {sending ? 'Sending…' : 'Send Offer'}
              </button>
            )}
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
              <p className="text-gray-700 leading-relaxed">
                {data.summary || 'No summary provided yet.'}
              </p>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-red-600" />
                  Skills
                </h2>
                {getTopSkills().length > 6 && (
                  <button
                    onClick={() => setShowSkills(!showSkills)}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center"
                  >
                    {showSkills ? 'Show Less' : 'Show All'}
                  </button>
                )}
              </div>
              
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
                {(!data.skills || Object.keys(data.skills).length === 0) && (
                  <p className="text-gray-500">No skills added yet.</p>
                )}
              </div>
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
                  <p className="text-gray-900">{data.title || 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
                  <div>
                    {data.resumeUrl ? (
                      <a 
                        href={data.resumeUrl} 
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {data.location || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Skills</span>
                  <span className="font-semibold">{data.skills ? Object.keys(data.skills).length : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">{formatDate(data?.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Contact via platform</span>
                </div>
                <div className="text-xs text-gray-500">
                  Contact information is protected for privacy. {isRecruiter && 'Use the "Send Offer" button to reach out.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Send Job Offer</h3>
              <button
                onClick={closeOfferModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold">
                  {data.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{data.name}</h4>
                  <p className="text-sm text-gray-600">{data.title}</p>
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
                    Salary (Optional)
                  </label>
                  <input
                    type="number"
                    value={offerForm.salary}
                    onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })}
                    placeholder="e.g., 75000"
                    min="0"
                    step="1000"
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

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? 'Sending...' : 'Send Offer'}
                </button>
                <button
                  type="button"
                  onClick={closeOfferModal}
                  disabled={sending}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}



"use client";

import { useState, useEffect } from "react";
import { toast } from 'sonner';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import { jobsAPI, offersAPI } from "@/utils/apiClient";
import { useAuthAPI } from "@/hooks/useAuthAPI";
import { usePageTokenValidation } from "@/components/TokenValidationWrapper";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Building2,
  ArrowRight,
  Plus,
  Eye,
  Send,
  User,
  Calendar,
  Mail,
  Phone,
  FileText,
  X,
} from "lucide-react";

export default function MyJobsPage() {
  const { user, isRecruiter, isAdmin } = useAuthAPI();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showApplications, setShowApplications] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [offerForm, setOfferForm] = useState({
    title: '',
    salary: '',
    currency: 'USD'
  });
  const [sendingOfferId, setSendingOfferId] = useState(null);
  const [sentOffers, setSentOffers] = useState(new Set());

  const currencies = [
    "USD", "EUR", "GBP", "EGP", "SAR", "AED"
  ];

  // Redirect if not authorized
  if (user && !isRecruiter && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">Only recruiters can view their jobs.</p>
            <a href="/jobs" className="text-red-600 hover:text-red-700 font-medium">
              Browse Jobs
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const fetchMyJobs = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsAPI.getMyJobs(page, 10);
      setJobs(response.content || []);
      setCurrentPage(response.number || 0);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      
    } catch (err) {
      console.error('Error fetching my jobs:', err);
      setError('Failed to load your jobs');
      toast.error('Failed to load your jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobApplications = async (jobId) => {
    try {
      const response = await jobsAPI.getJobApplications(jobId);
      setApplications(response || []);
      setShowApplications(true);
    } catch (err) {
      console.error('Error fetching applications:', err);
      toast.error('Failed to load applications');
    }
  };

  const openOfferModal = (application) => {
    // Don't open modal if offer already sent
    if (sentOffers.has(application.id)) {
      toast.info('Offer already sent to this candidate');
      return;
    }
    
    setSelectedApplication(application);
    setOfferForm({
      title: `Job Offer for ${application.candidateTitle || 'Software Developer'}`,
      salary: '',
      currency: 'USD'
    });
    setShowOfferModal(true);
  };

  const closeOfferModal = () => {
    setShowOfferModal(false);
    setSelectedApplication(null);
    setOfferForm({ title: '', salary: '', currency: 'USD' });
  };

  const sendOffer = async () => {
    if (!selectedApplication) return;
    
    try {
      setSendingOfferId(selectedApplication.id);
      
      const offerData = {
        candidateProfileId: selectedApplication.candidateId,
        title: offerForm.title.trim(),
        salary: offerForm.salary ? parseFloat(offerForm.salary) : null,
        currency: offerForm.currency
      };
      
      await offersAPI.sendOffer(offerData);
      toast.success(`Offer sent successfully to ${selectedApplication.candidateName}!`);
      setSentOffers(prev => new Set([...prev, selectedApplication.id]));
      closeOfferModal();
      
    } catch (err) {
      console.error('Error sending offer:', err);
      toast.error('Failed to send offer');
    } finally {
      setSendingOfferId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };


  useEffect(() => {
    if (user && (isRecruiter || isAdmin)) {
      fetchMyJobs();
    }
  }, [user, isRecruiter, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your jobs...</p>
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
              onClick={() => fetchMyJobs()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Try Again
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
        {/* Header */}
        <div className="mb-8 initial-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
              <p className="text-gray-600 mt-2">
                Manage your posted jobs and view applications
              </p>
            </div>
            <a
              href="/jobs/create"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              Post New Job
            </a>
          </div>
        </div>

        {/* Stats */}
        <RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{totalElements}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.reduce((total, job) => total + (job.applicationCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          </div>
        </RevealOnScroll>

        {/* Jobs List */}
        <RevealOnScroll>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Posted Jobs</h2>
          </div>
          
          {jobs.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-600 mb-6">Start by posting your first job to attract candidates.</p>
              <a
                href="/jobs/create"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                Post Your First Job
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {job.employmentType}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{job.salary}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(job.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{job.applicationCount || 0} applications</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          fetchJobApplications(job.id);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Applications
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </RevealOnScroll>

        {/* Pagination */}
        {totalPages > 1 && (
          <RevealOnScroll>
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => fetchMyJobs(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            
            <button
              onClick={() => fetchMyJobs(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          </RevealOnScroll>
        )}
      </div>

      {/* Applications Modal */}
      {showApplications && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Applications for "{selectedJob.title}"
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {applications.length} applications received
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowApplications(false);
                    setSelectedJob(null);
                    setApplications([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600">Applications will appear here when candidates apply for this job.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {application.candidateName}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Applied {formatDate(application.appliedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {application.resumeUrl ? 'Resume Available' : 'No Resume'}
                              </span>
                            </div>
                            
                            {application.candidateTitle && (
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{application.candidateTitle}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => openOfferModal(application)}
                            disabled={sendingOfferId === application.id || sentOffers.has(application.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                              sentOffers.has(application.id)
                                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            <Send className="w-4 h-4" />
                            {sendingOfferId === application.id ? 'Sending...' : sentOffers.has(application.id) ? 'Offer Sent' : 'Send Offer'}
                          </button>
                          
                          <a
                            href={`/candidates/${application.candidateId}`}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Profile
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>

      {/* Offer Modal */}
      {showOfferModal && selectedApplication && (
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
                  {selectedApplication.candidateName?.charAt(0) || 'C'}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedApplication.candidateName}</h4>
                  <p className="text-sm text-gray-600">{selectedApplication.candidateTitle}</p>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Salary (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={offerForm.salary}
                    onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })}
                    placeholder="e.g., 75000"
                    min="1"
                    max="1000000"
                    step="1"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <select
                    value={offerForm.currency}
                    onChange={(e) => setOfferForm({ ...offerForm, currency: e.target.value })}
                    className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter annual salary in your local currency</p>
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
                  disabled={!offerForm.title.trim() || sendingOfferId === selectedApplication.id}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sendingOfferId === selectedApplication.id ? 'Sending...' : 'Send Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

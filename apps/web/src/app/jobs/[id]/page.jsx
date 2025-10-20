'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useJobsAPI } from '@/hooks/useJobsAPI';
import { useAuthAPI } from '@/hooks/useAuthAPI';
import { usePageTokenValidation } from '@/components/TokenValidationWrapper';
import {
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Calendar,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Building2,
  User,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams();
  const { getJobById, applyForJob, cancelJobApplication, getMyAppliedJobs, loading } = useJobsAPI();
  const { user, isCandidate, isAuthenticated } = useAuthAPI();
  const { isValid } = usePageTokenValidation(false); // Job detail page doesn't require auth
  
  const [job, setJob] = useState(null);
  const [isApplied, setIsApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadJob();
      if (isCandidate) {
        checkApplicationStatus();
      }
    }
  }, [id, isCandidate]);

  const loadJob = async () => {
    try {
      setError(null);
      const jobData = await getJobById(id);
      setJob(jobData);
    } catch (err) {
      console.error('Error loading job:', err);
      setError('Failed to load job details');
    }
  };

  const checkApplicationStatus = async () => {
    try {
      // Get applied jobs to check if this job is applied to
      const response = await getMyAppliedJobs(0, 1000);
      if (response && response.content) {
        const appliedJobIds = response.content.map(job => job.id);
        setIsApplied(appliedJobIds.includes(parseInt(id)));
      }
    } catch (err) {
      console.error('Error checking application status:', err);
    }
  };

  const handleApply = async () => {
    if (!isCandidate) {
      toast.error('Only candidates can apply for jobs');
      return;
    }

    setIsApplying(true);
    try {
      await applyForJob(id);
      setIsApplied(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      console.error('Error applying for job:', err);
      if (err.message?.includes('already applied')) {
        toast.error('You have already applied for this job');
        setIsApplied(true);
      } else {
        toast.error('Failed to apply for job. Please try again.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancel = async () => {
    if (!isCandidate) {
      toast.error('Only candidates can cancel applications');
      return;
    }

    setIsApplying(true);
    try {
      await cancelJobApplication(id);
      setIsApplied(false);
      toast.success('Application cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling application:', err);
      toast.error('Failed to cancel application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const getTimeAgo = (dateString) => {
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
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The job you are looking for does not exist.'}</p>
            <a
              href="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Jobs
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 page-fade-in">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <div className="mb-6">
          <a
            href="/jobs"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Jobs
          </a>
        </div>

        {/* Job Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
              
              {/* Job Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{job.location}</span>
                </div>
                {job.employmentType && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    <span>{job.employmentType}</span>
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    <span>{job.salary}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Posted {getTimeAgo(job.createdAt)}</span>
                </div>
              </div>

              {/* Categories */}
              {job.categories && job.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.categories.map((category, index) => (
                    <span key={index} className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {isCandidate ? (
              isApplied ? (
                <button
                  onClick={handleCancel}
                  disabled={isApplying}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-5 h-5" />
                  {isApplying ? 'Canceling...' : 'Cancel Application'}
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  {isApplying ? 'Applying...' : 'Apply Now'}
                </button>
              )
            ) : (
              <div className="text-gray-600 text-sm">
                {isAuthenticated ? 'Sign in as a candidate to apply for this job' : 'Sign in to apply for this job'}
              </div>
            )}
            
            {isApplied && (
              <div className="flex items-center gap-2 px-4 py-3 bg-green-100 text-green-800 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Applied</span>
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{job.location}</p>
                </div>
              </div>
              
              {job.salary && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="font-medium text-gray-900">{job.salary}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Posted</p>
                  <p className="font-medium text-gray-900">{formatDate(job.createdAt)}</p>
                </div>
              </div>
              
              {job.categories && job.categories.length > 0 && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Categories</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {job.categories.map((category, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
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
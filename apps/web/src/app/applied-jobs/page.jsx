'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RevealOnScroll from '@/components/RevealOnScroll';
import { useJobsAPI } from '@/hooks/useJobsAPI';
import { useAuthAPI } from '@/hooks/useAuthAPI';
import { usePageTokenValidation } from '@/components/TokenValidationWrapper';
import {
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Calendar,
  X,
  ExternalLink,
  Trash2
} from 'lucide-react';

function AppliedJobCard({ job, onCancel, isCanceling }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-red-200 transition-all duration-300 group">
      {/* Job Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          Job
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-red-600 transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 text-green-600 text-sm mt-1">
            <Calendar className="w-4 h-4" />
            Applied
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <MapPin className="w-4 h-4" />
          {job.location}
        </div>
        <div className="flex items-center gap-4 text-sm">
          {job.salary && (
            <div className="flex items-center gap-2 text-gray-500">
              <DollarSign className="w-4 h-4" />
              {job.salary}
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            Posted {formatDate(job.createdAt)}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      {/* Categories */}
      {job.categories && job.categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {job.categories.map((category, index) => (
            <span key={index} className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
              {category}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex gap-2">
          <a 
            href={`/jobs/${job.id}`} 
            className="flex-1 border border-red-600 text-red-700 hover:bg-red-50 py-2.5 rounded-lg font-semibold text-sm text-center inline-flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Job
          </a>
          <button 
            onClick={() => onCancel(job.id)}
            disabled={isCanceling}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isCanceling ? 'Canceling...' : 'Cancel Application'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppliedJobsPage() {
  const { cancelJobApplication, getMyAppliedJobs, loading } = useJobsAPI();
  const { user, isCandidate, isAuthenticated } = useAuthAPI();
  const { isValid } = usePageTokenValidation(true); // Applied jobs page requires auth
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [cancelingJobId, setCancelingJobId] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(0);

  useEffect(() => {
    // Redirect if not a candidate
    if (isAuthenticated && !isCandidate) {
      window.location.href = '/jobs';
    }
  }, [isAuthenticated, isCandidate]);

  useEffect(() => {
    // Clear applied jobs state when user changes or logs out
    if (!isCandidate) {
      setAppliedJobs([]);
      return;
    }
    
    // Load applied jobs for the current user
    loadAppliedJobs();
  }, [isCandidate, page, user?.id]);

  const loadAppliedJobs = async () => {
    try {
      console.log('Loading applied jobs...');
      console.log('Current user:', user?.id, user?.email);
      console.log('isCandidate:', isCandidate);
      console.log('Page:', page);
      
      const response = await getMyAppliedJobs(page, 10);
      console.log('Applied jobs response:', response);
      console.log('Response content:', response?.content);
      console.log('Response length:', response?.content?.length);
      
      if (response) {
        setAppliedJobs(response.content || []);
        setPagination({
          page: response.page + 1,
          pages: response.totalPages,
          total: response.totalElements,
          limit: response.size,
        });
        console.log('Applied jobs set to state:', response.content || []);
      }
    } catch (error) {
      console.error('Error loading applied jobs:', error);
      console.error('Error details:', error.message);
      setAppliedJobs([]);
    }
  };

  const handleCancel = async (jobId) => {
    setCancelingJobId(jobId);
    try {
      await cancelJobApplication(jobId);
      
      // Reload applied jobs from backend
      await loadAppliedJobs();
      
      toast.success('Application cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling application:', err);
      toast.error('Failed to cancel application. Please try again.');
    } finally {
      setCancelingJobId(null);
    }
  };

  // Show access denied for non-candidates
  if (isAuthenticated && !isCandidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only accessible to job seekers.</p>
          <a href="/jobs" className="text-red-600 hover:text-red-700 font-medium">
            Browse Jobs
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applied Jobs</h1>
              <p className="text-gray-600">Track and manage your job applications</p>
            </div>
            <a
              href="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md"
            >
              <Briefcase className="w-5 h-5" />
              Browse More Jobs
            </a>
          </div>
        </div>

        {/* Stats Card */}
        <RevealOnScroll>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <Briefcase className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">Application Summary</h2>
              <p className="text-gray-600">
                You have applied to <span className="font-semibold text-red-600">{appliedJobs.length}</span> job{appliedJobs.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          </div>
        </RevealOnScroll>

        {/* Applied Jobs Grid */}
        {appliedJobs.length === 0 ? (
          <RevealOnScroll>
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No applications yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start applying to jobs that match your skills and interests
            </p>
            <a
              href="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              Browse Jobs
            </a>
          </div>
          </RevealOnScroll>
        ) : (
          <RevealOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appliedJobs.map((job) => (
              <AppliedJobCard 
                key={job.id} 
                job={job} 
                onCancel={handleCancel}
                isCanceling={cancelingJobId === job.id}
              />
            ))}
            </div>
          </RevealOnScroll>
        )}
      </div>

      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>

      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

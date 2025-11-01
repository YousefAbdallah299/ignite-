"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from 'sonner';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import PageFadeIn from "@/components/PageFadeIn";
import { useJobsAPI } from "@/hooks/useJobsAPI";
import { useAuthAPI } from "@/hooks/useAuthAPI";
import { usePageTokenValidation } from "@/components/TokenValidationWrapper";
import {
  Search,
  MapPin,
  Filter,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Building2,
  BookOpen,
  Heart,
  ArrowRight,
  Plus,
} from "lucide-react";

const jobCategories = [
  "Technology",
  "Marketing",
  "Design",
  "Sales",
  "Data Science",
  "Engineering",
  "Finance",
  "HR",
  "Operations",
  "Customer Service",
];

const jobTypes = [
  "full-time",
  "part-time",
  "contract",
  "freelance",
  "internship",
];

function JobCard({ job, onApply, onCancel, isApplied, isApplying, userRole }) {
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
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-red-200 transition-all duration-300 group relative overflow-hidden">
      {/* Job Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          Job
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-red-600 transition-colors">
            {job.title}
          </h3>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <MapPin className="w-4 h-4" />
          {job.location}
        </div>
        <div className="flex items-center gap-4 text-sm">
          {job.employmentType && (
            <div className="flex items-center gap-2 text-gray-500">
              <Briefcase className="w-4 h-4" />
              {job.employmentType}
            </div>
          )}
          {job.salary && (
            <div className="flex items-center gap-2 text-gray-500">
              <DollarSign className="w-4 h-4" />
              {job.salary}
            </div>
          )}
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

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-gray-400 text-sm">
          {formatDate(job.createdAt)}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex gap-2">
          {userRole === 'CANDIDATE' ? (
            isApplied ? (
              <button 
                onClick={() => onCancel(job.id)}
                disabled={isApplying}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isApplying ? 'Canceling...' : 'Cancel Application'}
              </button>
            ) : (
              <button 
                onClick={() => onApply(job.id)}
                disabled={isApplying}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isApplying ? 'Applying...' : 'Apply Now'}
              </button>
            )
          ) : null}
          <a 
            href={`/jobs/${job.id}`} 
            className="flex-1 border border-red-600 text-red-700 hover:bg-red-50 py-2.5 rounded-lg font-semibold text-sm text-center"
          >
            View Job
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
    </div>
  );
}

export default function JobsPage() {
  const { getAllJobs, applyForJob, cancelJobApplication, getMyAppliedJobs, loading, error } = useJobsAPI();
  const { user, isCandidate, isAuthenticated } = useAuthAPI();
  const { isValid } = usePageTokenValidation(false); // Jobs page doesn't require auth
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    page: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Get URL parameters on component mount
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters = {
      search: urlParams.get("search") || "",
      category: urlParams.get("category") || "",
      page: 0,
    };
    setFilters(initialFilters);
  }, []);

  const loadAppliedJobs = useCallback(async () => {
    // Don't try to load if user is not authenticated or not a candidate
    if (!isAuthenticated || !user || !isCandidate) {
      console.log('Skipping loadAppliedJobs - conditions:', {
        isAuthenticated,
        hasUser: !!user,
        isCandidate
      });
      return;
    }

    try {
      console.log('Loading applied jobs for jobs page...');
      console.log('Current user:', user?.id, user?.email);
      console.log('isCandidate:', isCandidate);
      console.log('isAuthenticated:', isAuthenticated);
      
      const response = await getMyAppliedJobs(0, 100); // Get more applied jobs for checking
      console.log('Applied jobs response:', response);
      console.log('Response content:', response?.content);
      console.log('Response length:', response?.content?.length);
      
      if (response && response.content) {
        // Convert all IDs to numbers for consistent comparison
        const appliedJobIds = response.content.map(job => {
          const id = Number(job.id);
          console.log('Mapping applied job - Original ID:', job.id, 'Type:', typeof job.id, 'Converted:', id);
          return id;
        }).filter(id => {
          const isValid = !isNaN(id);
          if (!isValid) {
            console.warn('Filtered out invalid job ID:', id);
          }
          return isValid;
        });
        console.log('=== LOADING APPLIED JOBS ===');
        console.log('Raw response content:', response.content);
        console.log('Applied job IDs array:', appliedJobIds);
        console.log('Applied job IDs count:', appliedJobIds.length);
        const appliedJobsSet = new Set(appliedJobIds);
        console.log('Setting applied jobs Set with size:', appliedJobsSet.size);
        console.log('Set contents:', Array.from(appliedJobsSet));
        setAppliedJobs(appliedJobsSet);
        console.log('Applied jobs state updated!');
        console.log('===========================');
      } else {
        console.log('No applied jobs found or empty response');
        // Don't clear existing state if response is empty - might be a temporary issue
        // Only clear if we got an actual response with empty content
        if (response && response.content && response.content.length === 0) {
          setAppliedJobs(new Set());
        }
      }
    } catch (error) {
      console.error('Error loading applied jobs:', error);
      console.error('Error details:', error.message);
      // Don't clear state on error - might be a temporary network issue
      // Only log the error but keep existing state
    }
  }, [getMyAppliedJobs, user, user?.id, isCandidate, isAuthenticated]);

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  useEffect(() => {
    // Only clear applied jobs if we know for sure the user is NOT a candidate (not just undefined)
    // Don't clear if user is still loading (user === null but might become a candidate)
    if (user !== null && !isCandidate) {
      // User is loaded and is NOT a candidate, clear applied jobs
      console.log('Clearing applied jobs - user is not a candidate');
      setAppliedJobs(new Set());
      return;
    }
    
    // Only load applied jobs if user is authenticated and is a candidate
    // Use isAuthenticated instead of isValid since this page doesn't require auth
    if (isAuthenticated && user && isCandidate) {
      console.log('=== TRIGGERING loadAppliedJobs ===');
      console.log('User:', user?.id, user?.email);
      console.log('isCandidate:', isCandidate);
      console.log('isAuthenticated:', isAuthenticated);
      loadAppliedJobs();
    } else {
      console.log('NOT loading applied jobs - conditions:', {
        isAuthenticated,
        hasUser: !!user,
        isCandidate,
        userRole: user?.role
      });
    }
  }, [isCandidate, isAuthenticated, user, user?.id, loadAppliedJobs]);

  // Additional safety: If we have a candidate user but empty applied jobs, try loading once
  useEffect(() => {
    if (isAuthenticated && user && isCandidate && appliedJobs.size === 0) {
      console.log('=== SAFETY CHECK: Candidate user but empty applied jobs, attempting to load ===');
      const timer = setTimeout(() => {
        loadAppliedJobs();
      }, 2000); // Wait 2 seconds after initial load in case auth is still settling
      return () => clearTimeout(timer);
    }
  }, [user, isCandidate, isAuthenticated, appliedJobs.size, loadAppliedJobs]);

  // Listen for job application updates and refresh applied jobs list
  useEffect(() => {
    if (!isAuthenticated || !user || !isCandidate) return;

    const handleApplicationUpdate = (event) => {
      console.log('Job application updated event received:', event.detail);
      // Small delay to ensure backend has processed the request
      setTimeout(() => {
        loadAppliedJobs();
      }, 500);
    };

    window.addEventListener('jobApplicationUpdated', handleApplicationUpdate);

    // Also refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && user && isCandidate) {
        // Delay slightly to avoid race conditions
        setTimeout(() => {
          loadAppliedJobs();
        }, 300);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Refresh on window focus
    const handleFocus = () => {
      if (isAuthenticated && user && isCandidate) {
        setTimeout(() => {
          loadAppliedJobs();
        }, 300);
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('jobApplicationUpdated', handleApplicationUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, isCandidate, isAuthenticated, loadAppliedJobs]);

  const fetchJobs = async () => {
    try {
      console.log('Fetching jobs with filters:', filters);
      const categories = filters.category ? [filters.category.toLowerCase()] : null;
      
      console.log('Calling getAllJobs with params:', {
        page: filters.page,
        size: 20,
        query: filters.search || null,
        categories: categories
      });
      
      const response = await getAllJobs(
        filters.page,
        20,
        filters.search || null,
        categories
      );

      console.log('Jobs response:', response);
      console.log('Response type:', typeof response);
      console.log('Response content:', response?.content);
      console.log('Response length:', response?.content?.length);

      if (response) {
        setJobs(response.content || []);
        setPagination({
          page: response.page + 1,
          pages: response.totalPages,
          total: response.totalElements,
          limit: response.size,
        });
        console.log('Jobs set to state:', response.content || []);
      } else {
        console.log('No response received');
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApply = async (jobId) => {
    if (!isCandidate) {
      toast.error('Only candidates can apply for jobs');
      return;
    }

    setApplyingJobId(jobId);
    try {
      await applyForJob(jobId);
      // Update local state immediately for instant UI feedback
      const jobIdNum = Number(jobId);
      setAppliedJobs(prev => {
        const newSet = new Set(prev);
        newSet.add(jobIdNum);
        return newSet;
      });
      toast.success('Application submitted successfully!');
      
      // Dispatch custom event to notify other pages (like applied-jobs page) to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('jobApplicationUpdated', { 
          detail: { jobId, action: 'applied' } 
        }));
      }
      
      // Reload applied jobs from backend after a short delay to ensure backend has processed
      // This ensures the backend state is synced, but we keep the optimistic update
      setTimeout(async () => {
        await loadAppliedJobs();
      }, 1000);
    } catch (err) {
      console.error('Error applying for job:', err);
      if (err.message?.includes('already applied')) {
        toast.error('You have already applied for this job');
        // Reload applied jobs to sync state
        setTimeout(async () => {
          await loadAppliedJobs();
        }, 500);
      } else {
        toast.error('Failed to apply for job. Please try again.');
        // Revert optimistic update on error
        const jobIdNum = Number(jobId);
        setAppliedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobIdNum);
          return newSet;
        });
      }
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleCancel = async (jobId) => {
    if (!isCandidate) {
      toast.error('Only candidates can cancel applications');
      return;
    }

    setApplyingJobId(jobId);
    try {
      await cancelJobApplication(jobId);
      // Update local state immediately for instant UI feedback
      const jobIdNum = Number(jobId);
      setAppliedJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobIdNum);
        return newSet;
      });
      toast.success('Application cancelled successfully!');
      
      // Dispatch custom event to notify other pages (like applied-jobs page) to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('jobApplicationUpdated', { 
          detail: { jobId, action: 'cancelled' } 
        }));
      }
      
      // Reload applied jobs from backend after a short delay to ensure backend has processed
      setTimeout(async () => {
        await loadAppliedJobs();
      }, 1000);
    } catch (err) {
      console.error('Error cancelling application:', err);
      toast.error('Failed to cancel application. Please try again.');
      // Revert optimistic update on error
      const jobIdNum = Number(jobId);
      setAppliedJobs(prev => {
        const newSet = new Set(prev);
        newSet.add(jobIdNum);
        return newSet;
      });
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <PageFadeIn className="bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="initial-fade-in">
      <section className="bg-gradient-to-br from-red-50 via-white to-pink-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Your Dream Job
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover thousands of opportunities from leading companies
              worldwide
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Job title or keywords"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="w-full pl-12 pr-4 py-3 border-0 outline-none text-gray-700 placeholder-gray-400 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
                >
                  Search Jobs
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
      </div>

      {/* Main Content */}
      <RevealOnScroll>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-red-600"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              <div
                className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}
              >
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">All categories</option>
                    {jobCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() =>
                    setFilters({
                      search: "",
                      category: "",
                      page: 0,
                    })
                  }
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {loading
                    ? "Loading..."
                    : `${pagination.total || 0} jobs found`}
                </h2>
                <p className="text-gray-600 text-sm">
                  Showing{" "}
                  {Math.min(
                    (pagination.page - 1) * pagination.limit + 1,
                    pagination.total || 0,
                  )}{" "}
                  -{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total || 0,
                  )}{" "}
                  of {pagination.total || 0} results
                </p>
              </div>
              
              {/* Post Job Button for Recruiters */}
              {user?.role === 'RECRUITER' && (
                <a
                  href="/jobs/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  Post a Job
                </a>
              )}
              
              {user?.role === 'CANDIDATE' && (
                <a
                  href="/applied-jobs"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md"
                >
                  <Briefcase className="w-5 h-5" />
                  My Applications ({appliedJobs.size})
                </a>
              )}
            </div>

            {/* Job Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                  >
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
                  {jobs.map((job) => {
                    const jobIdNum = Number(job.id);
                    const isAppliedCheck = appliedJobs.has(jobIdNum);
                    // Debug logging for first job only to avoid spam
                    if (jobs.indexOf(job) === 0) {
                      console.log('=== JOB APPLIED CHECK DEBUG ===');
                      console.log('Job ID:', job.id, 'Type:', typeof job.id);
                      console.log('Job ID as Number:', jobIdNum);
                      console.log('Applied Jobs Set size:', appliedJobs.size);
                      console.log('Applied Jobs Set contents:', Array.from(appliedJobs));
                      console.log('Is Applied Check:', isAppliedCheck);
                      console.log('Set has job?', appliedJobs.has(jobIdNum));
                      console.log('==============================');
                    }
                    return (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        onApply={handleApply}
                        onCancel={handleCancel}
                        isApplied={isAppliedCheck}
                        isApplying={applyingJobId === job.id}
                        userRole={user?.role}
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex gap-2">
                      {pagination.page > 1 && (
                        <button
                          onClick={() =>
                            handleFilterChange("page", pagination.page - 1)
                          }
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Previous
                        </button>
                      )}

                      {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handleFilterChange("page", page)}
                            className={`px-4 py-2 rounded-lg ${
                              page === pagination.page
                                ? "bg-red-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      {pagination.page < pagination.pages && (
                        <button
                          onClick={() =>
                            handleFilterChange("page", pagination.page + 1)
                          }
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {jobs.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No jobs found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      </RevealOnScroll>

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
    </PageFadeIn>
  );
}

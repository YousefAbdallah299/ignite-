'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, ArrowRight, Users } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCandidatesAPI } from '@/hooks/useCandidatesAPI';
import RevealOnScroll from '@/components/RevealOnScroll';
import PageFadeIn from '@/components/PageFadeIn';

function ProfessionalCard({ candidate }) {
  const getTopSkills = () => {
    if (!candidate.skills) return [];
    return Object.entries(candidate.skills)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([skill]) => skill);
  };

  const getAvailabilityStatus = () => {
    if (!candidate.availableFrom) return { status: "Available", color: "text-green-600" };
    const availableDate = new Date(candidate.availableFrom);
    const now = new Date();
    if (availableDate <= now) {
      return { status: "Available", color: "text-green-600" };
    } else {
      return { status: `Available ${availableDate.toLocaleDateString()}`, color: "text-yellow-600" };
    }
  };

  const availability = getAvailabilityStatus();
  const topSkills = getTopSkills();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-red-200 transition-all duration-300 group relative overflow-hidden">
      {/* Professional Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-semibold">
          {candidate.name?.charAt(0) || 'C'}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{candidate.name}</h3>
          <p className="text-red-600 text-sm font-medium mb-2">{candidate.title}</p>
        </div>
      </div>

      {/* Summary */}
      {candidate.summary && (
        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
          {candidate.summary}
        </p>
      )}

      {/* Skills */}
      {topSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {topSkills.map((skill, index) => (
            <span
              key={index}
              className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="font-semibold text-gray-900 text-sm">
            {candidate.skills ? Object.keys(candidate.skills).length : 0}
          </div>
          <div className="text-gray-500 text-xs">Skills</div>
        </div>
        <div className="w-px h-8 bg-gray-200"></div>
        <div className="text-center">
          <div className={`font-semibold text-sm ${availability.color}`}>
            {availability.status}
          </div>
          <div className="text-gray-500 text-xs">Status</div>
        </div>
      </div>

      {/* Action Button */}
      <a 
        href={`/candidates/${candidate.id}`} 
        className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-lg font-semibold transition-all group-hover:bg-red-600 group-hover:text-white flex items-center justify-center gap-2"
      >
        View Profile
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>

      {/* Hover Effect */}
      <div className="pointer-events-none absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
    </div>
  );
}

export default function JobSeekersPage() {
  const { getAllCandidates, loading } = useCandidatesAPI();
  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(12);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await getAllCandidates(currentPage, pageSize, debouncedSearchQuery || null, selectedSkills.length > 0 ? selectedSkills : null);
        if (response) {
          setCandidates(response.content || []);
          setTotalPages(response.totalPages || 0);
          setTotalElements(response.totalElements || 0);
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
        toast.error('Failed to load candidates');
      }
    };

    fetchCandidates();
  }, [getAllCandidates, currentPage, debouncedSearchQuery, selectedSkills, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageFadeIn className="bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Talented Professionals</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover exceptional professionals ready to make an impact at your organization
          </p>
        </div>

        {/* Search Bar */}
        <RevealOnScroll>
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search professionals by name, title, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </RevealOnScroll>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          {loading ? (
            <p>Loading professionals...</p>
          ) : (
            <p>
              Showing {candidates.length} of {totalElements} professionals
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                </div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Professionals Grid */}
        {!loading && candidates.length > 0 && (
          <RevealOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {candidates.map((candidate) => (
                <ProfessionalCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
          </RevealOnScroll>
        )}

        {/* Empty State */}
        {!loading && candidates.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No professionals found
            </h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search criteria' : 'Check back later for talented professionals'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i;
                } else if (currentPage < 3) {
                  page = i;
                } else if (currentPage > totalPages - 4) {
                  page = totalPages - 5 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? 'bg-red-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page + 1}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Footer />
    </PageFadeIn>
  );
}

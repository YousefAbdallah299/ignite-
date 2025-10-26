'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Award } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { candidatesAPI } from '@/utils/apiClient';
import RevealOnScroll from '@/components/RevealOnScroll';
import PageFadeIn from '@/components/PageFadeIn';

export default function JobSeekersPage() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadCandidates();
  }, [searchQuery, currentPage]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const response = await candidatesAPI.getAllCandidates(
        currentPage,
        20,
        searchQuery || null,
        selectedSkills.length > 0 ? selectedSkills : null
      );
      
      setCandidates(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Error loading candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const getTopSkills = (skills) => {
    if (!skills || typeof skills !== 'object') return [];
    return Object.entries(skills)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([skill, level]) => ({ skill, level }));
  };

  return (
    <PageFadeIn className="bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Candidates</h1>
          <p className="text-gray-600">Discover talented professionals ready to join your team</p>
        </div>

        {/* Search Section */}
        <RevealOnScroll>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates by name or title..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* Candidates Grid */}
        <RevealOnScroll>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="h-16 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-600">No candidates found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {candidate.name?.charAt(0) || 'C'}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {candidate.name || 'Candidate'}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {candidate.title || 'Professional'}
                  </p>

                  {candidate.location && (
                    <p className="text-sm text-gray-500 mb-4 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {candidate.location}
                    </p>
                  )}

                  {candidate.skills && getTopSkills(candidate.skills).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getTopSkills(candidate.skills).map(({ skill, level }) => (
                        <span 
                          key={skill}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            level > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {candidate.summary && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {candidate.summary}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <span className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      {candidate.skills ? Object.keys(candidate.skills).length : 0} skills
                    </span>
                    <span className="text-red-600 font-medium hover:text-red-700">
                      View Profile →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </RevealOnScroll>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </PageFadeIn>
  );
}

import React, { useState, useEffect } from 'react';
import { MapPin, Star, ArrowRight, Users } from "lucide-react";
import { useCandidatesAPI } from "@/hooks/useCandidatesAPI";

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
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
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
              className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-medium"
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
      <a href={`/candidates/${candidate.id}`} className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-lg font-semibold transition-all group-hover:bg-red-600 group-hover:text-white flex items-center justify-center gap-2">
        View Profile
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>

      {/* Hover Effect */}
      <div className="pointer-events-none absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
    </div>
  );
}

export default function TalentedProfessionals() {
  const { getAllCandidates, loading, error } = useCandidatesAPI();
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await getAllCandidates(0, 6); // Get first 6 candidates
        if (response) {
          setCandidates(response.content || []);
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
      }
    };

    fetchCandidates();
  }, [getAllCandidates]);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Talented Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Connect with exceptional professionals who are ready to make an impact at your organization
            </p>
          </div>
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
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Talented Professionals
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connect with exceptional professionals who are ready to make an impact at your organization
          </p>
        </div>

        {/* Professionals Grid */}
        {candidates.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {candidates.map((candidate) => (
                <ProfessionalCard key={candidate.id} candidate={candidate} />
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <a href="/job-seekers" className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg group">
                View All Professionals
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No professionals found
            </h3>
            <p className="text-gray-600">
              Check back later for talented professionals
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
import React from 'react';
import { useState } from "react";
import { Users, Building2, ArrowRight, Check } from "lucide-react";

export default function NewsletterSection() {

  return (
    <section className="py-16 bg-gradient-to-br from-red-600 to-red-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-300 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-pink-200 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-red-100 max-w-2xl mx-auto mb-8">
          Join thousands of professionals and companies who trust Ignite to connect talent with opportunity.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
          <a
            href="/account/signup?role=candidate"
            className="w-full sm:w-auto bg-white text-red-600 hover:bg-red-50 px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:shadow-lg active:transform active:scale-95"
          >
            <Users className="w-5 h-5" />
            Find Your Dream Job
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="/account/signup?role=recruiter"
            className="w-full sm:w-auto bg-white bg-opacity-20 text-white hover:bg-opacity-30 px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:shadow-lg active:transform active:scale-95 border border-white border-opacity-30"
          >
            <Building2 className="w-5 h-5" />
            Hire Top Talent
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-red-100 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>10,000+ active users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>500+ companies</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Free to get started</span>
          </div>
        </div>
      </div>
    </section>
  );
}
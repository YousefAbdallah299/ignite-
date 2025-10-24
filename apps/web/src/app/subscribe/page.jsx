import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RevealOnScroll from '@/components/RevealOnScroll';

const SubscribePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 page-fade-in">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="initial-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Subscribe to Ignite</h1>
          <p className="text-gray-700 mb-8">Get access to premium recruiter features and connect with top talent.</p>
        </div>

        <RevealOnScroll>
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recruiter Subscription</h2>
            <p className="text-gray-600 mb-6">
              Unlock the full potential of Ignite with our premium recruiter features.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="text-gray-700">Post unlimited job listings</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="text-gray-700">Access candidate database</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="text-gray-700">Send offers to candidates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="text-gray-700">Advanced search filters</span>
              </div>
            </div>

            <div className="text-center">
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Subscribe Now - 29 EGP/month
              </button>
            </div>
          </div>
        </RevealOnScroll>
      </div>

      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </div>
  );
};

export default SubscribePage;

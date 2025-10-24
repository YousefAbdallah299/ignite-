'use client';

import { useEffect } from 'react';
import { CheckCircle, Home, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RevealOnScroll from '@/components/RevealOnScroll';
import PageFadeIn from '@/components/PageFadeIn';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Confetti effect or success sound could be added here
    console.log('Payment successful!');
  }, []);

  return (
    <PageFadeIn className="bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12 text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Payment Successful!
            </h1>
            
            <p className="text-lg text-gray-600 mb-2">
              Your subscription has been activated successfully.
            </p>
            
            <p className="text-sm text-gray-500">
              You now have access to all premium recruiter features.
            </p>
          </div>

          {/* Success Details */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Post unlimited job listings</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Access candidate database</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Send offers to candidates</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </button>
            
            <button
              onClick={() => navigate('/my-offers')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
            >
              View My Profile
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              A confirmation email has been sent to your registered email address.
            </p>
          </div>
        </div>
      </div>
      
      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </PageFadeIn>
  );
}


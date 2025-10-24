'use client';

import { useEffect } from 'react';
import { XCircle, Home, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RevealOnScroll from '@/components/RevealOnScroll';
import PageFadeIn from '@/components/PageFadeIn';

export default function PaymentFailedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Payment failed');
  }, []);

  return (
    <PageFadeIn className="bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12 text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Payment Failed
            </h1>
            
            <p className="text-lg text-gray-600 mb-2">
              We couldn't process your payment.
            </p>
            
            <p className="text-sm text-gray-500">
              Don't worry, you haven't been charged. Please try again.
            </p>
          </div>

          {/* Common Reasons */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3 text-left">Common reasons for payment failure:</h3>
            <ul className="space-y-2 text-sm text-gray-700 text-left">
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>Insufficient funds in your account</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>Incorrect card details or expired card</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>Payment was cancelled during processing</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>Network or connection issues</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/subscribe')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </button>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Need help? Contact our support team
            </p>
            <a href="/help" className="text-sm text-red-600 hover:text-red-700 font-medium">
              Visit Help Center →
            </a>
          </div>
        </div>
      </div>
      
      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </PageFadeIn>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, Check, Lock, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthAPI } from '@/hooks/useAuthAPI';

export default function SubscribePage() {
  const navigate = useNavigate();
  const { user, isRecruiter, isAuthenticated, loading } = useAuthAPI();
  const [selectedPlan, setSelectedPlan] = useState('professional');

  const plans = [
    {
      id: 'professional',
      name: 'Recruiter Subscription',
      price: 2900, // Price in cents (29.00 EGP)
      priceDisplay: '29 EGP',
      period: 'per month',
      description: 'Access all premium features for recruiters',
      features: [
        'Post unlimited job listings',
        'Access candidate database',
        'Advanced search filters',
        'Send offers to candidates',
        'Check verified skills',
        'View blogs',
        'Priority support',
      ],
    },
  ];

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  // Check if user is authenticated and is a recruiter
  useEffect(() => {
    // Wait for auth loading to complete before checking
    if (loading) return;
    
    if (!isAuthenticated) {
      toast.error('Please sign in to subscribe');
      navigate('/account/signin');
      return;
    }
    
    if (!isRecruiter) {
      toast.error('Only recruiters can subscribe to these plans');
      navigate('/');
      return;
    }
  }, [loading, isAuthenticated, isRecruiter, navigate]);

  const handleProceedToPayment = () => {
    // Navigate to payment page with selected plan amount in query params
    navigate(`/payment?amount=${selectedPlanData.price}&plan=${selectedPlanData.name}`);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 page-fade-in">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <a
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </a>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscribe as a Recruiter</h1>
          <p className="text-gray-600">Review your subscription and proceed to payment to unlock premium features.</p>
        </div>

        {/* Plan Details Card */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-xl border-2 border-red-500 shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-100">
                  <Building2 className="w-8 h-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedPlanData.name}</h3>
                  <p className="text-sm text-gray-600">{selectedPlanData.description}</p>
                </div>
              </div>
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="text-4xl font-bold text-gray-900">{selectedPlanData.priceDisplay}</div>
              <div className="text-sm text-gray-600">{selectedPlanData.period}</div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">What's included:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedPlanData.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Order Summary & Checkout */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div>
                <div className="font-semibold text-gray-900">{selectedPlanData?.name} Plan</div>
                <div className="text-sm text-gray-600">{selectedPlanData?.period}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{selectedPlanData?.priceDisplay}</div>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Subscription Type</span>
              <span className="font-medium">Monthly Billing</span>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Billed To</span>
              <span className="font-medium">{user?.email}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Due Today</span>
              <span className="text-2xl font-bold text-red-600">{selectedPlanData?.priceDisplay}</span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center text-sm text-gray-600 mb-6">
            <Lock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Your payment will be processed securely via Paymob payment gateway</span>
          </div>

          {/* Proceed Button */}
          <button
            onClick={handleProceedToPayment}
            className="w-full flex items-center justify-center px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Proceed to Payment
          </button>

          {/* Terms */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              By proceeding, you agree to our{' '}
              <a href="/terms" className="text-red-600 hover:text-red-700">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-red-600 hover:text-red-700">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


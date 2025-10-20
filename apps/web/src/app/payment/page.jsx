'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePaymentAPI } from '@/hooks/usePaymentAPI';
import { useAuthAPI } from '@/hooks/useAuthAPI';
import { recruitersAPI } from '@/utils/apiClient';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { user, isRecruiter, loading: authLoading } = useAuthAPI();
  const { initiatePayment, loading, error, paymentResponse, clearError } = usePaymentAPI();
  
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [amount, setAmount] = useState(2900); // Default amount in cents (29.00 EGP)
  const [planName, setPlanName] = useState('Professional'); // Default plan name
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card'); // card payment (visa/mastercard)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    apartment: '',
    floor: '',
    street: '',
    building: '',
    city: '',
    country: '',
    postalCode: '',
    state: '',
  });

  // Fetch recruiter profile on mount and get query params
  useEffect(() => {
    // Get amount and plan from query params
    const urlParams = new URLSearchParams(window.location.search);
    const amountParam = urlParams.get('amount');
    const planParam = urlParams.get('plan');
    
    if (amountParam) {
      setAmount(parseInt(amountParam));
    }
    if (planParam) {
      setPlanName(planParam);
    }

    const fetchRecruiterProfile = async () => {
      // Wait for auth loading to complete
      if (authLoading) return;
      
      if (!isRecruiter) {
        toast.error('Only recruiters can make payments');
        navigate('/');
        return;
      }

      try {
        const profile = await recruitersAPI.getMyProfile();
        setRecruiterProfile(profile);
        
        // Pre-fill form with user data if available
        if (user?.email) {
          setFormData(prev => ({
            ...prev,
            email: user.email,
            firstName: user.firstName || user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
          }));
        }
      } catch (err) {
        console.error('Failed to fetch recruiter profile:', err);
        toast.error('Failed to load profile. Please try again.');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchRecruiterProfile();
  }, [authLoading, isRecruiter, navigate, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validation rules
    let validatedValue = value;
    
    // Only allow numbers for phone and postal code
    if (name === 'phoneNumber' || name === 'postalCode') {
      validatedValue = value.replace(/[^0-9+\s-]/g, ''); // Allow numbers, +, spaces, and hyphens for phone
      if (name === 'postalCode') {
        validatedValue = value.replace(/[^0-9]/g, ''); // Only numbers for postal code
      }
    }
    
    // Only allow letters and spaces for names and location fields
    if (name === 'firstName' || name === 'lastName' || name === 'city' || name === 'country' || name === 'state') {
      validatedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: validatedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!recruiterProfile?.id) {
      toast.error('Recruiter profile not found');
      return;
    }

    // Show toast based on selected payment method
    const paymentMethodName = 'Card Payment (Visa/Mastercard)';
    
    try {
      const paymentData = {
        recruiterId: recruiterProfile.id,
        amountCents: amount,
        currency: 'EGP',
        billing: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          apartment: formData.apartment,
          floor: formData.floor,
          street: formData.street,
          building: formData.building,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postalCode,
          state: formData.state,
        }
      };

      // Note: All payment methods currently use the same Paymob integration
      // In the future, you could add payment method differentiation here
      console.log(`Processing payment via ${paymentMethodName}`);
      
      const response = await initiatePayment(paymentData);
      
      if (response?.iframeUrl) {
        toast.success(`Payment initiated via ${paymentMethodName}!`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err.message || 'Failed to initiate payment. Please try again.');
    }
  };

  // If payment iframe is available, show it
  if (paymentResponse?.iframeUrl) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
            <p className="text-gray-600">Please complete the payment in the form below</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ minHeight: '700px' }}>
            <iframe
              src={paymentResponse.iframeUrl}
              width="100%"
              height="700px"
              frameBorder="0"
              title="Payment Gateway"
              className="w-full"
            />
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/profile')}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Return to Profile
            </button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Loading state
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 page-fade-in">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <a
              href="/profile"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </a>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Information</h1>
          <p className="text-gray-600">Enter your billing details to proceed with the payment.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
            
            {/* Payment Method Selection */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="max-w-md">
                {/* Card Payment (Visa & Mastercard) */}
                <div
                  className="border-2 border-red-500 bg-red-50 rounded-lg p-4"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-4 h-10 mb-3">
                      {/* Visa Logo */}
                      <img 
                        src="https://usa.visa.com/dam/VCOM/regional/ve/romania/blogs/hero-image/visa-logo-800x450.jpg" 
                        alt="Visa"
                        className="h-7 w-auto object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png";
                        }}
                      />
                      {/* Mastercard Logo */}
                      <div className="flex items-center justify-center">
                        <div className="flex -space-x-2">
                          <div className="w-5 h-5 rounded-full bg-red-600"></div>
                          <div className="w-5 h-5 rounded-full bg-orange-500"></div>
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-sm text-gray-900">Card Payment</div>
                    <div className="text-xs text-gray-500 mt-1">Credit/Debit Card</div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount (Read-only, coming from plan) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (EGP)
                </label>
                <input
                  type="text"
                  value={(amount / 100).toFixed(2) + ' EGP'}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">Amount is based on selected plan</p>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    pattern="[A-Za-z\s]+"
                    title="First name should only contain letters"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    pattern="[A-Za-z\s]+"
                    title="Last name should only contain letters"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9+\s-]+"
                  title="Phone number should only contain numbers, +, spaces, and hyphens"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="+20 123 456 7890"
                />
              </div>

              {/* Address Information */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building *
                    </label>
                    <input
                      type="text"
                      name="building"
                      value={formData.building}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Building number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floor *
                    </label>
                    <input
                      type="text"
                      name="floor"
                      value={formData.floor}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Floor number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apartment *
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Apartment number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Street name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      pattern="[A-Za-z\s]+"
                      title="City should only contain letters"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      pattern="[A-Za-z\s]+"
                      title="State/Province should only contain letters"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="State or province"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]+"
                      title="Postal code should only contain numbers"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="12345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      pattern="[A-Za-z\s]+"
                      title="Country should only contain letters"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="EG"
                    />
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center text-sm text-gray-600 pt-4">
                <Lock className="w-4 h-4 mr-2 flex-shrink-0" />
                Your payment information is secure and encrypted via Paymob
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-start gap-3">
                  <span className="text-gray-600 text-sm">Plan</span>
                  <span className="font-semibold text-sm text-right flex-1">{planName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Amount</span>
                  <span className="font-semibold text-sm">{(amount / 100).toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Payment Method</span>
                  <span className="font-semibold text-sm">Card Payment</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{(amount / 100).toFixed(2)} EGP</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You will be redirected to Paymob payment gateway to complete your payment securely.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By proceeding, you agree to our{' '}
            <a href="/terms" className="text-red-600 hover:text-red-700">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-red-600 hover:text-red-700">Privacy Policy</a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}


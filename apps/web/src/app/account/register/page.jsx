'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthAPI } from "@/hooks/useAuthAPI";
import RevealOnScroll from '@/components/RevealOnScroll';
import PageFadeIn from '@/components/PageFadeIn';

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuthAPI();
  const navigate = useNavigate();
  const [role, setRole] = useState('CANDIDATE');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== FORM SUBMISSION START ===');
    console.log('Form data:', { 
      agreementAccepted, 
      email, 
      phoneNumber, 
      password, 
      confirmPassword,
      firstName,
      lastName,
      role
    });
    
    clearError();
    setValidationError('');
    
    // Validation checks
    if (!agreementAccepted) {
      console.log('Validation failed: Agreement not accepted');
      const errorMsg = 'Please review and accept the registration agreement to continue.';
      setValidationError(errorMsg);
      setShowAgreementModal(true);
      toast.error(errorMsg);
      alert(errorMsg); // Fallback alert
      return;
    }

    if (!firstName.trim()) {
      console.log('Validation failed: First name missing');
      const errorMsg = 'First name is required.';
      setValidationError(errorMsg);
      toast.error(errorMsg);
      alert(errorMsg);
      return;
    }

    if (!lastName.trim()) {
      console.log('Validation failed: Last name missing');
      const errorMsg = 'Last name is required.';
      setValidationError(errorMsg);
      toast.error(errorMsg);
      alert(errorMsg);
      return;
    }

    if (!email.trim()) {
      console.log('Validation failed: Email missing');
      const errorMsg = 'Email is required.';
      setValidationError(errorMsg);
      toast.error(errorMsg);
      alert(errorMsg);
      return;
    }

    if (!phoneNumber.trim()) {
      console.log('Validation failed: Phone number missing');
      const errorMsg = 'Phone number is required.';
      setValidationError(errorMsg);
      toast.error(errorMsg);
      alert(errorMsg);
      return;
    }

    if (!password || password.length < 8) {
      console.log('Validation failed: Password too short');
      const errorMsg = 'Password must be at least 8 characters long.';
      setValidationError(errorMsg);
      toast.error(errorMsg);
      alert(errorMsg);
      return;
    }

    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match', { password, confirmPassword });
      const errorMsg = 'Passwords do not match. Please check and try again.';
      setValidationError(errorMsg);
      toast.error(errorMsg);
      alert(errorMsg); // Fallback alert
      return;
    }

    console.log('All validations passed, calling register function...');
    
    try {
      const registerData = { 
        first_name: firstName.trim(), 
        last_name: lastName.trim(), 
        email: email.trim(), 
        password,
        confirmPassword,
        role,
        phoneNumber: phoneNumber.trim()
      };
      
      console.log('Register data being sent:', { ...registerData, password: '***', confirmPassword: '***' });
      
      const result = await register(registerData);
      console.log('Registration successful:', result);
      
      // Show success message and redirect to sign in page
      toast.success('Account created successfully! Please sign in to continue.');
      // Delay navigation to allow toast to be visible
      setTimeout(() => {
        navigate('/account/signin');
      }, 100);
    } catch (err) {
      console.error('Registration error caught:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      // Show error toast
      toast.error(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <PageFadeIn className="bg-gray-50">
      <Header />

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="initial-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-600 mb-6">Choose how you want to use Ignite.</p>
          </div>

          <RevealOnScroll>
            <div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setRole('CANDIDATE')}
                  className={`p-3 rounded-lg border text-sm font-medium ${role === 'CANDIDATE' ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Continue as Job Seeker
                </button>
                <button
                  onClick={() => setRole('RECRUITER')}
                  className={`p-3 rounded-lg border text-sm font-medium ${role === 'RECRUITER' ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Continue as Recruiter
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
              )}
              {validationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{validationError}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Retype Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="text-xs text-gray-500 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAgreementModal(true);
                    }}
                    className="text-red-600 font-medium hover:underline"
                  >
                    Review registration agreement
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading || !agreementAccepted}
                  onClick={(e) => {
                    console.log('Button clicked!', { loading, agreementAccepted });
                    if (!agreementAccepted) {
                      e.preventDefault();
                      setShowAgreementModal(true);
                      toast.error('Please accept the registration agreement first.');
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
                {!agreementAccepted && (
                  <p className="text-xs text-red-600 text-center mt-2">
                    Please accept the registration agreement to continue
                  </p>
                )}
              </form>

              <p className="text-sm text-gray-600 mt-6 text-center">
                Already have an account? <a href="/account/signin" className="text-red-600 font-medium">Sign in</a>
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </div>

      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>

      {showAgreementModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-10 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Ignite Registration Agreement</h2>
            <p className="text-gray-600 mb-4">
              By creating an account you confirm that all information provided is accurate and that you agree to our{' '}
              <a href="/terms" className="text-red-600 font-semibold hover:underline" target="_blank" rel="noopener noreferrer">Terms of Service</a> and{' '}
              <a href="/privacy" className="text-red-600 font-semibold hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. 
              This includes receiving important updates about your account, job alerts, and coursework.
            </p>
            <ul className="text-gray-600 text-sm space-y-2 mb-6 list-disc pl-5">
              <li>You consent to us processing your data to provide recruiting and learning services.</li>
              <li>You agree to only submit truthful information about your identity, experience, and skills.</li>
              <li>You understand that violating our terms may result in account suspension.</li>
            </ul>
            <label className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                checked={agreementChecked}
                onChange={(e) => setAgreementChecked(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-gray-700 text-sm">
                I have read and agree to the Ignite Registration Agreement, Terms of Service, and Privacy Policy.
              </span>
            </label>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setAgreementChecked(false);
                  setAgreementAccepted(false);
                  setShowAgreementModal(false);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!agreementChecked) {
                    toast.error('Please check the agreement to proceed.');
                    return;
                  }
                  setAgreementAccepted(true);
                  setShowAgreementModal(false);
                }}
                disabled={!agreementChecked}
                className="px-6 py-2 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-60"
              >
                Agree & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </PageFadeIn>
  );
}



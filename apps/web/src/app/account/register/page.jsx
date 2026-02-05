'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PasswordInput from "@/components/PasswordInput";
import OTPVerification from "@/components/OTPVerification";
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
  const [expectedPosition, setExpectedPosition] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [expectedSalaryCurrency, setExpectedSalaryCurrency] = useState('EGP');
  const [showAgreementModal, setShowAgreementModal] = useState(true);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

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
      return;
    }

    if (!firstName.trim()) {
      console.log('Validation failed: First name missing');
      setValidationError('First name is required.');
      return;
    }

    if (!lastName.trim()) {
      console.log('Validation failed: Last name missing');
      setValidationError('Last name is required.');
      return;
    }

    if (!email.trim()) {
      console.log('Validation failed: Email missing');
      setValidationError('Email is required.');
      return;
    }

    if (!phoneNumber.trim()) {
      console.log('Validation failed: Phone number missing');
      setValidationError('Phone number is required.');
      return;
    }

    // Validate phone number format
    const cleanPhone = phoneNumber.trim().replace(/[\s-]/g, '');
    if (!/^(0|\+)/.test(cleanPhone)) {
      console.log('Validation failed: Phone number must start with 0 or +');
      setValidationError('Phone number must start with 0 or +');
      return;
    }
    if (cleanPhone.length < 8) {
      console.log('Validation failed: Phone number too short');
      setValidationError('Phone number must be at least 8 characters');
      return;
    }

    // Check if phone is verified
    if (!phoneVerified) {
      setValidationError('Please verify your phone number first');
      setShowOTPModal(true);
      return;
    }

    if (!password || password.length < 8) {
      console.log('Validation failed: Password too short');
      setValidationError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match', { password, confirmPassword });
      setValidationError('Passwords do not match. Please check and try again.');
      return;
    }

    // Additional validation for job seekers
    if (role === 'CANDIDATE') {
      if (!expectedPosition.trim()) {
        console.log('Validation failed: Expected position missing');
        setValidationError('Expected position is required for job seekers.');
        return;
      }
      if (!expectedSalary.trim()) {
        console.log('Validation failed: Expected salary missing');
        setValidationError('Expected salary is required for job seekers.');
        return;
      }
      const salaryValue = parseFloat(expectedSalary);
      if (isNaN(salaryValue) || salaryValue < 0) {
        console.log('Validation failed: Invalid salary value');
        setValidationError('Please enter a valid expected salary.');
        return;
      }
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
        phoneNumber: phoneNumber.trim(),
        ...(role === 'CANDIDATE' && {
          expectedPosition: expectedPosition.trim(),
          expectedSalary: parseFloat(expectedSalary),
          expectedSalaryCurrency: expectedSalaryCurrency
        })
      };
      
      console.log('Register data being sent:', { ...registerData, password: '***', confirmPassword: '***' });
      
      const result = await register(registerData);
      console.log('Registration successful:', result);
      
      // Redirect to profile page for candidates to complete their profile
      if (role === 'CANDIDATE') {
        toast.success('Account created successfully! Please complete your profile.');
        navigate('/profile', { state: { completeProfile: true } });
      } else {
        // For recruiters, go to sign in
        toast.success('Account created successfully! Please sign in to continue.');
        setTimeout(() => {
          navigate('/account/signin');
        }, 100);
      }
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-600">*</span>
                    </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retype Password <span className="text-red-600">*</span>
                  </label>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Retype Password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-600">*</span>
                    {phoneVerified && (
                      <span className="ml-2 text-green-600 text-xs">✓ Verified</span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow digits, +, and spaces
                        if (value === '' || /^[0-9+\s-]*$/.test(value)) {
                          setPhoneNumber(value);
                          setPhoneVerified(false); // Reset verification if phone changes
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value && !/^(0|\+)/.test(value)) {
                          setValidationError('Phone number must start with 0 or +');
                        } else if (value && value.replace(/[\s-]/g, '').length < 8) {
                          setValidationError('Phone number must be at least 8 characters');
                        } else {
                          setValidationError('');
                        }
                      }}
                      required
                      pattern="^(0|\+)[0-9+\s-]{7,}"
                      title="Phone number must start with 0 or + and be at least 8 characters"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="+1234567890 or 01234567890"
                      disabled={phoneVerified}
                    />
                    {!phoneVerified && phoneNumber.trim() && phoneNumber.trim().replace(/[\s-]/g, '').length >= 8 && /^(0|\+)/.test(phoneNumber.trim().replace(/[\s-]/g, '')) && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            // Clean phone number (remove spaces and hyphens)
                            const cleanPhone = phoneNumber.trim().replace(/[\s-]/g, '');
                            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ignite-qjis.onrender.com/api/v1';
                            const response = await fetch(`${API_BASE_URL}/auth/send-phone-otp`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({ phoneNumber: cleanPhone })
                            });
                            
                            if (!response.ok) {
                              const errorData = await response.json();
                              throw new Error(errorData.message || 'Failed to send OTP');
                            }
                            
                            toast.success('OTP sent to your phone number');
                            setShowOTPModal(true);
                          } catch (err) {
                            toast.error(err.message || 'Failed to send OTP');
                          }
                        }}
                        className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                      >
                        Send OTP
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must start with 0 or + and be at least 8 characters. Click "Send OTP" to verify.</p>
                </div>
                
                {/* Job Seeker Specific Fields */}
                {role === 'CANDIDATE' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Position <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={expectedPosition}
                        onChange={(e) => setExpectedPosition(e.target.value)}
                        required
                        placeholder="e.g., Software Engineer, Data Analyst"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Salary <span className="text-red-600">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={expectedSalary}
                          onChange={(e) => setExpectedSalary(e.target.value)}
                          required
                          min="0"
                          step="1"
                          placeholder="e.g., 50000"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <select
                          value={expectedSalaryCurrency}
                          onChange={(e) => setExpectedSalaryCurrency(e.target.value)}
                          className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                          required
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="EGP">EGP</option>
                          <option value="CAD">CAD</option>
                          <option value="AUD">AUD</option>
                          <option value="JPY">JPY</option>
                          <option value="CHF">CHF</option>
                          <option value="AED">AED</option>
                          <option value="SAR">SAR</option>
                          <option value="KWD">KWD</option>
                          <option value="QAR">QAR</option>
                          <option value="BHD">BHD</option>
                          <option value="OMR">OMR</option>
                          <option value="JOD">JOD</option>
                          <option value="LBP">LBP</option>
                          <option value="MAD">MAD</option>
                          <option value="TND">TND</option>
                          <option value="DZD">DZD</option>
                          <option value="LYD">LYD</option>
                          <option value="SDG">SDG</option>
                          <option value="ETB">ETB</option>
                          <option value="KES">KES</option>
                          <option value="NGN">NGN</option>
                          <option value="ZAR">ZAR</option>
                          <option value="GHS">GHS</option>
                          <option value="UGX">UGX</option>
                          <option value="TZS">TZS</option>
                          <option value="RWF">RWF</option>
                          <option value="BWP">BWP</option>
                          <option value="SZL">SZL</option>
                          <option value="LSL">LSL</option>
                          <option value="NAD">NAD</option>
                          <option value="MZN">MZN</option>
                          <option value="AOA">AOA</option>
                          <option value="ZMW">ZMW</option>
                          <option value="MWK">MWK</option>
                          <option value="BIF">BIF</option>
                          <option value="DJF">DJF</option>
                          <option value="KMF">KMF</option>
                          <option value="MGA">MGA</option>
                          <option value="MUR">MUR</option>
                          <option value="SCR">SCR</option>
                          <option value="SOS">SOS</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Enter your expected annual salary</p>
                    </div>
                  </>
                )}
                
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

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <OTPVerification
          phoneNumber={phoneNumber.trim()}
          onVerified={() => {
            setPhoneVerified(true);
            setShowOTPModal(false);
            toast.success('Phone number verified successfully!');
          }}
          onCancel={() => setShowOTPModal(false)}
          onResendOTP={async (phone) => {
            // Phone is already cleaned in the component
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ignite-qjis.onrender.com/api/v1';
            const response = await fetch(`${API_BASE_URL}/auth/send-phone-otp`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ phoneNumber: phone })
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to resend OTP');
            }
          }}
        />
      )}
    </PageFadeIn>
  );
}



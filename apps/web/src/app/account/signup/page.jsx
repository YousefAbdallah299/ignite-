'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import PageFadeIn from "@/components/PageFadeIn";
import PasswordInput from "@/components/PasswordInput";
import { useAuthAPI } from "@/hooks/useAuthAPI";

export default function SignupPage() {
  const { register, loading, error, clearError } = useAuthAPI();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get role from URL parameter, default to CANDIDATE
  const roleParam = searchParams.get('role');
  const [role, setRole] = useState(roleParam === 'recruiter' ? 'RECRUITER' : 'CANDIDATE');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Update role when URL parameter changes
  useEffect(() => {
    if (roleParam === 'recruiter') {
      setRole('RECRUITER');
    } else if (roleParam === 'candidate') {
      setRole('CANDIDATE');
    }
  }, [roleParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (role === 'CANDIDATE') {
      toast.info('Job seeker signup now requires OTP and mandatory resume upload. Redirecting...');
      navigate('/account/register');
      return;
    }

    if (!email.trim()) {
      toast.error('Email is required.');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Mobile number is required.');
      return;
    }

    // Validate phone number format
    const cleanPhone = phoneNumber.trim().replace(/[\s-]/g, '');
    if (!/^(0|\+)/.test(cleanPhone)) {
      toast.error('Phone number must start with 0 or +');
      return;
    }
    if (cleanPhone.length < 8) {
      toast.error('Phone number must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      await register({ 
        first_name: firstName, 
        last_name: lastName, 
        email, 
        password, 
        confirmPassword,
        role,
        phoneNumber: phoneNumber.trim()
      });
      
      // Show success message and redirect to sign in page
      toast.success('Account created successfully! Please sign in to continue.');
      // Delay navigation to allow toast to be visible
      setTimeout(() => {
        navigate('/account/signin');
      }, 100);
    } catch (err) {
      console.error('Registration error:', err);
      // Show error toast
      toast.error(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <PageFadeIn className="bg-gray-50">
      <Header />

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600 mb-6">Choose how you want to use Ignite.</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setRole('CANDIDATE')}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                role === 'CANDIDATE' 
                  ? 'border-red-500 text-red-600 bg-red-50' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Continue as Job Seeker
            </button>
            <button
              onClick={() => setRole('RECRUITER')}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                role === 'RECRUITER' 
                  ? 'border-red-500 text-red-600 bg-red-50' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Continue as Recruiter
            </button>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
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
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Confirm Password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow digits, +, and spaces
                  if (value === '' || /^[0-9+\s-]*$/.test(value)) {
                    setPhoneNumber(value);
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value && !/^(0|\+)/.test(value)) {
                    toast.error('Phone number must start with 0 or +');
                  } else if (value && value.replace(/[\s-]/g, '').length < 8) {
                    toast.error('Phone number must be at least 8 characters');
                  }
                }}
                required
                pattern="^(0|\+)[0-9+\s-]{7,}"
                title="Phone number must start with 0 or + and be at least 8 characters"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="+1234567890 or 01234567890"
              />
              <p className="text-xs text-gray-500 mt-1">Must start with 0 or + and be at least 8 characters</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Already have an account? <a href="/account/signin" className="text-red-600 font-medium hover:underline">Sign in</a>
          </p>
        </div>
      </div>

      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </PageFadeIn>
  );
}





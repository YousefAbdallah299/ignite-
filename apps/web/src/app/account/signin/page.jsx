'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import PageFadeIn from "@/components/PageFadeIn";
import { useAuthAPI } from "@/hooks/useAuthAPI";

export default function SignInPage() {
  const { login, loading, error, clearError } = useAuthAPI();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toastShownRef = useRef(false);
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  
  // Show message from state if user was redirected here (only once)
  useEffect(() => {
    if (location.state?.message && !toastShownRef.current) {
      toast.info(location.state.message);
      toastShownRef.current = true;
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      const response = await login({ email, password });
      
      // Check if there's a return URL from the state
      const returnUrl = location.state?.returnUrl;
      
      // Check if user is admin and redirect accordingly
      if (response.role === 'ADMIN') {
        toast.success('Welcome to the admin panel!');
        setTimeout(() => {
          navigate(returnUrl || '/admin');
        }, 100);
      } else {
        toast.success('Welcome back!');
        setTimeout(() => {
          navigate(returnUrl || '/');
        }, 100);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <PageFadeIn className="bg-gray-50">
      <Header />

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h1>
          <p className="text-gray-600 mb-6">
            {location.state?.message 
              ? location.state.message 
              : 'Welcome back. Please enter your details.'}
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Don't have an account? <a href="/account/register" className="text-red-600 font-medium">Create one</a>
          </p>
        </div>
      </div>

      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </PageFadeIn>
  );
}



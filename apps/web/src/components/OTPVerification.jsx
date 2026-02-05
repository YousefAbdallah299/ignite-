'use client';

import { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OTPVerification({ 
  phoneNumber, 
  onVerified, 
  onCancel,
  onResendOTP 
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 6) {
            newOtp[i] = digit;
          }
        });
        setOtp(newOtp);
        if (digits.length === 6) {
          inputRefs.current[5]?.focus();
        } else if (digits.length > 0) {
          inputRefs.current[digits.length]?.focus();
        }
      });
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Call the verification API
      // Clean phone number (remove spaces and hyphens)
      const cleanPhone = phoneNumber.trim().replace(/[\s-]/g, '');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ignite-qjis.onrender.com/api/v1';
      
      const response = await fetch(`${API_BASE_URL}/auth/verify-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: cleanPhone,
          otp: otpString
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid OTP');
      }

      toast.success('Phone number verified successfully!');
      if (onVerified) {
        onVerified();
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      if (onResendOTP) {
        // Clean phone number before sending
        const cleanPhone = phoneNumber.trim().replace(/[\s-]/g, '');
        await onResendOTP(cleanPhone);
        toast.success('OTP sent successfully!');
        setOtp(['', '', '', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (err) {
      toast.error('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Verify Phone Number</h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <p className="text-gray-600 mb-6">
          We've sent a 6-digit verification code to <strong>{phoneNumber}</strong>. 
          Please enter it below to verify your phone number.
        </p>

        <div className="mb-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  error
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 focus:border-red-500'
                }`}
              />
            ))}
          </div>
          {error && (
            <div className="mt-3 flex items-center justify-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleVerify}
            disabled={isVerifying || otp.join('').length !== 6}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Verify Phone Number
              </>
            )}
          </button>

          <button
            onClick={handleResend}
            disabled={isVerifying}
            className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium disabled:opacity-50"
          >
            Didn't receive the code? <span className="text-red-600 hover:text-red-700">Resend OTP</span>
          </button>
        </div>
      </div>
    </div>
  );
}


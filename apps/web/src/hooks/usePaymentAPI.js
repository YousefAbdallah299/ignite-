import { useState, useCallback } from 'react';
import { paymentsAPI } from '../utils/apiClient';

export const usePaymentAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentResponse, setPaymentResponse] = useState(null);

  // Initiate payment
  const initiatePayment = useCallback(async (paymentData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await paymentsAPI.initiatePayment(paymentData);
      setPaymentResponse(response);
      
      return response;
    } catch (err) {
      setError(err.message || 'Payment initiation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear payment response
  const clearPaymentResponse = useCallback(() => {
    setPaymentResponse(null);
  }, []);

  return {
    loading,
    error,
    paymentResponse,
    initiatePayment,
    clearError,
    clearPaymentResponse,
  };
};





import { useState, useCallback } from 'react';
import { offersAPI } from '../utils/apiClient';

export const useOffersAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiCall = useCallback(async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      return await apiCall();
    } catch (err) {
      setError(err.message || 'API call failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendOffer = useCallback(async (offerData) => {
    return handleApiCall(() => offersAPI.sendOffer(offerData));
  }, [handleApiCall]);

  const getMyOffers = useCallback(async () => {
    return handleApiCall(() => offersAPI.getMyOffers());
  }, [handleApiCall]);

  const getAllOffers = useCallback(async () => {
    return handleApiCall(() => offersAPI.getAllOffers());
  }, [handleApiCall]);

  const respondToOffer = useCallback(async (offerId, status) => {
    return handleApiCall(() => offersAPI.respondToOffer(offerId, status));
  }, [handleApiCall]);

  const withdrawOffer = useCallback(async (offerId) => {
    return handleApiCall(() => offersAPI.withdrawOffer(offerId));
  }, [handleApiCall]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    sendOffer,
    getMyOffers,
    getAllOffers,
    respondToOffer,
    withdrawOffer,
    clearError,
  };
};

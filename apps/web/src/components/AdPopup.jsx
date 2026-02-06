'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { adsAPI } from '@/utils/apiClient';

/**
 * AdPopup Component
 * Displays active ads from the backend API
 * Shows popup in empty space on pages, can be dismissed with X button
 */
export default function AdPopup() {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissedAds, setDismissedAds] = useState(new Set());

  useEffect(() => {
    const loadAds = async () => {
      try {
        const activeAds = await adsAPI.getActiveAds();
        if (activeAds && activeAds.length > 0) {
          setAds(activeAds);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error loading ads:', error);
      }
    };

    loadAds();
  }, []);

  const handleDismiss = () => {
    if (ads.length > 0) {
      const currentAdId = ads[currentAdIndex]?.id;
      if (currentAdId) {
        setDismissedAds(prev => new Set([...prev, currentAdId]));
      }
      
      // Move to next ad if available
      if (currentAdIndex < ads.length - 1) {
        setCurrentAdIndex(prev => prev + 1);
      } else {
        setIsVisible(false);
      }
    }
  };

  const handleAdClick = (redirectUrl) => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    }
    handleDismiss();
  };

  // Don't show if no ads, not visible, or current ad is dismissed
  if (!ads.length || !isVisible) {
    return null;
  }

  const currentAd = ads[currentAdIndex];
  if (!currentAd || dismissedAds.has(currentAd.id)) {
    // Move to next ad
    if (currentAdIndex < ads.length - 1) {
      setCurrentAdIndex(prev => prev + 1);
      return null;
    }
    return null;
  }

  // Determine position based on viewport - try to fit in empty space
  const [position, setPosition] = useState('bottom-right');
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updatePosition = () => {
      const scrollY = window.scrollY;
      // If scrolled down significantly, show at top
      if (scrollY > 200) {
        setPosition('top-right');
      } else {
        setPosition('bottom-right');
      }
    };
    
    updatePosition();
    window.addEventListener('scroll', updatePosition, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isVisible]);
  
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-300`}
      style={{ maxWidth: '400px' }}
    >
      <div 
        className="relative bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden cursor-pointer hover:shadow-3xl transition-shadow"
        onClick={() => handleAdClick(currentAd.redirectUrl)}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="absolute top-3 right-3 z-10 text-gray-500 hover:text-gray-700 transition-colors bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
          aria-label="Close ad"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Ad Image */}
        {currentAd.imageUrl && (
          <div className="w-full h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
            <img
              src={currentAd.imageUrl}
              alt={currentAd.title || 'Advertisement'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full flex items-center justify-center text-gray-400">
              <span>Image not available</span>
            </div>
          </div>
        )}
        
        {/* Ad Title */}
        {currentAd.title && (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 pr-8">{currentAd.title}</h3>
          </div>
        )}
      </div>
    </div>
  );
}


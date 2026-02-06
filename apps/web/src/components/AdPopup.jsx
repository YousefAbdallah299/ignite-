'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { adsAPI } from '@/utils/apiClient';

/**
 * AdPopup Component
 * Displays active ads from the backend API
 * Shows popup after 2 seconds on all pages
 */
export default function AdPopup() {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState('bottom-right');

  // Load ads on mount
  useEffect(() => {
    const loadAds = async () => {
      try {
        console.log('Loading ads...');
        const activeAds = await adsAPI.getActiveAds();
        console.log('Active ads received:', activeAds);
        
        if (activeAds && Array.isArray(activeAds) && activeAds.length > 0) {
          setAds(activeAds);
          // Show ad after 2 seconds
          setTimeout(() => {
            console.log('Showing ad after delay');
            setIsVisible(true);
          }, 2000);
        } else {
          console.log('No active ads found');
        }
      } catch (error) {
        console.error('Error loading ads:', error);
      }
    };

    loadAds();
  }, []);

  // Update position based on scroll
  useEffect(() => {
    if (typeof window === 'undefined' || !isVisible) return;
    
    const updatePosition = () => {
      const scrollY = window.scrollY;
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

  const handleDismiss = () => {
    if (currentAdIndex < ads.length - 1) {
      // Move to next ad
      setCurrentAdIndex(prev => prev + 1);
    } else {
      // No more ads, hide popup
      setIsVisible(false);
    }
  };

  const handleAdClick = (redirectUrl) => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    }
    handleDismiss();
  };

  // Don't render if no ads or not visible
  if (!ads.length || !isVisible) {
    return null;
  }

  const currentAd = ads[currentAdIndex];
  if (!currentAd) {
    return null;
  }

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 max-w-sm w-full`}
      style={{ maxWidth: '400px', zIndex: 9999 }}
    >
      <div 
        className="relative bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden cursor-pointer hover:shadow-3xl transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-300"
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
                const errorDiv = e.target.nextElementSibling;
                if (errorDiv) {
                  errorDiv.classList.remove('hidden');
                }
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

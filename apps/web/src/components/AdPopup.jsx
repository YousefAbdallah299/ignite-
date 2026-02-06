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
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only runs on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true);
      console.log('AdPopup: component mounted on client');
      console.log('AdPopup: window.location:', window.location.href);
    }
  }, []);

  // Load ads on mount (only after component is confirmed to be on client)
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') {
      console.log('AdPopup: Skipping loadAds - not mounted or no window');
      return;
    }

    console.log('AdPopup: useEffect for loadAds triggered, isMounted:', isMounted);

    const loadAds = async () => {
      try {
        console.log('AdPopup: Starting to load ads...');
        console.log('AdPopup: Calling adsAPI.getActiveAds()');
        console.log('AdPopup: adsAPI object:', adsAPI);
        console.log('AdPopup: adsAPI.getActiveAds function:', typeof adsAPI?.getActiveAds);
        
        if (!adsAPI || typeof adsAPI.getActiveAds !== 'function') {
          console.error('AdPopup: adsAPI.getActiveAds is not a function!');
          return;
        }
        
        const activeAds = await adsAPI.getActiveAds();
        console.log('AdPopup: Active ads received:', activeAds);
        console.log('AdPopup: Active ads type:', typeof activeAds);
        console.log('AdPopup: Active ads is array?', Array.isArray(activeAds));
        
        if (activeAds && Array.isArray(activeAds) && activeAds.length > 0) {
          console.log('AdPopup: Setting ads state with', activeAds.length, 'ads');
          setAds(activeAds);
          // Show ad after 2 seconds
          setTimeout(() => {
            console.log('AdPopup: Showing ad after delay');
            setIsVisible(true);
          }, 2000);
        } else {
          console.log('AdPopup: No active ads found or empty array');
          console.log('AdPopup: activeAds value:', activeAds);
        }
      } catch (error) {
        console.error('AdPopup: Error loading ads:', error);
        console.error('AdPopup: Error stack:', error?.stack);
        console.error('AdPopup: Error message:', error?.message);
        console.error('AdPopup: Full error object:', error);
      }
    };

    // Small delay to ensure everything is ready
    const timer = setTimeout(() => {
      console.log('AdPopup: Timer fired, calling loadAds');
      loadAds();
    }, 100);

    return () => {
      console.log('AdPopup: Cleaning up timer');
      clearTimeout(timer);
    };
  }, [isMounted]);

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

  // Don't render if not mounted (SSR safety)
  if (!isMounted || typeof window === 'undefined') {
    return null;
  }

  // Dev mode: Always show debug info
  const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APP_ENVIRONMENT !== 'production';

  // Don't render if no ads or not visible
  if (!ads.length || !isVisible) {
    // Helpful runtime log so we can see render decision in the console
    try {
      console.log('AdPopup: not rendering. ads.length=', ads.length, 'isVisible=', isVisible, 'isMounted=', isMounted);
    } catch (e) {
      /* ignore */
    }
    
    // In dev mode, show a small indicator that the component is mounted
    if (isDev) {
      return (
        <div style={{ 
          position: 'fixed', 
          left: 8, 
          top: 8, 
          zIndex: 99999, 
          background: 'rgba(0,0,0,0.7)', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: 6, 
          fontSize: 12,
          fontFamily: 'monospace'
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>AdPopup Status</div>
          <div>Mounted: {String(isMounted)}</div>
          <div>Ads: {ads.length}</div>
          <div>Visible: {String(isVisible)}</div>
        </div>
      );
    }
    
    return null;
  }

  const currentAd = ads[currentAdIndex];
  if (!currentAd) {
    console.log('AdPopup: currentAd is falsy despite ads.length > 0');
    return null;
  }

  // Defensive media field handling: backend may return different keys (imageUrl, image, img, mediaUrl)
  const imageSrc = currentAd.imageUrl || currentAd.image || currentAd.img || currentAd.mediaUrl || currentAd.media;
  const videoSrc = currentAd.videoUrl || currentAd.video || currentAd.mediaVideo;

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <>
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

          {/* Ad Image or Video */}
          {imageSrc ? (
            <div className="w-full h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                src={imageSrc}
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
          ) : videoSrc ? (
            <div className="w-full h-48 overflow-hidden bg-black flex items-center justify-center">
              <video className="w-full h-full object-cover" src={videoSrc} controls />
            </div>
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gray-50 text-gray-500">
              <span>No media available for this ad</span>
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

      {/* Dev-only overlay: shows fetched ads and helpful info to diagnose missing network requests */}
      {isDev && (
        <div style={{ position: 'fixed', left: 8, bottom: 8, zIndex: 99999, background: 'rgba(0,0,0,0.7)', color: 'white', padding: 8, borderRadius: 6, maxWidth: 420, fontSize: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Ad Debug</div>
          <div>ads.length: {ads.length}</div>
          <div>isVisible: {String(isVisible)}</div>
          <div style={{ maxHeight: 160, overflow: 'auto', marginTop: 6 }}>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(ads, null, 2)}</pre>
          </div>
        </div>
      )}
    </>
  );
}

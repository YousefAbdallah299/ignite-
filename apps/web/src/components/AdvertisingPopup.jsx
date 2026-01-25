'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * AdvertisingPopup Component
 * Generic advertising popup for external ads and monetization
 * Supports image/video ads, text ads, and clickable banners
 * 
 * Ad object structure:
 * {
 *   image: string (image URL),
 *   video: string (video URL),
 *   title: string (optional),
 *   description: string (optional),
 *   link: string (destination URL),
 *   ctaText: string (button text),
 *   advertiser: string (optional, for tracking),
 *   adId: string (optional, for analytics)
 * }
 */
export default function AdvertisingPopup({ 
  ad = null, // { image, video, title, description, link, ctaText, advertiser, adId }
  position = 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'center'
  showDelay = 3000, // Delay before showing (ms)
  minViewportWidth = 640, // Minimum viewport width to show
  minViewportHeight = 500, // Minimum viewport height to show
  storageKey = 'ad_popup_dismissed', // localStorage key for dismissal
  size = 'medium' // 'small', 'medium', 'large'
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if ad was dismissed
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed === 'true') {
      return;
    }

    if (!ad) {
      return;
    }

    // Check viewport size
    const checkViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const meetsRequirements = width >= minViewportWidth && height >= minViewportHeight;
      setShouldShow(meetsRequirements);
      
      if (!meetsRequirements) {
        setIsVisible(false);
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);

    return () => {
      window.removeEventListener('resize', checkViewport);
    };
  }, [ad, minViewportWidth, minViewportHeight, storageKey]);

  // Separate effect to handle the delay timer
  useEffect(() => {
    if (!shouldShow || !ad) {
      setIsVisible(false);
      return;
    }

    const dismissed = localStorage.getItem(storageKey);
    if (dismissed === 'true') {
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [shouldShow, ad, showDelay, storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  const handleClick = () => {
    if (ad?.link) {
      // Track ad click if adId is provided
      if (ad.adId) {
        // Analytics tracking can be added here
        console.log('Ad clicked:', ad.adId, ad.advertiser);
      }
      window.open(ad.link, '_blank', 'noopener,noreferrer');
    }
    handleDismiss();
  };

  if (!isVisible || !ad || !shouldShow) {
    return null;
  }

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  const sizeClasses = {
    'small': 'max-w-xs',
    'medium': 'max-w-sm',
    'large': 'max-w-md'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 w-full ${sizeClasses[size]} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden cursor-pointer" onClick={ad?.link ? handleClick : undefined}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="absolute top-3 right-3 z-10 text-gray-500 hover:text-gray-700 transition-colors bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Image Ad */}
        {ad.image && !ad.video && (
          <div className="w-full h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
            <img
              src={ad.image}
              alt={ad.title || ad.advertiser || 'Advertisement'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Video Ad */}
        {ad.video && (
          <div className="w-full h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
            <video
              src={ad.video}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* Text Content */}
        {(ad.title || ad.description || ad.ctaText) && (
          <div className="p-5 space-y-3">
            {ad.title && (
              <h3 className="text-lg font-semibold text-gray-900 pr-8">{ad.title}</h3>
            )}
            {ad.description && (
              <p className="text-sm text-gray-600">{ad.description}</p>
            )}
            {ad.link && ad.ctaText && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                {ad.ctaText}
              </button>
            )}
            {ad.advertiser && (
              <p className="text-xs text-gray-400 text-right">Ad by {ad.advertiser}</p>
            )}
          </div>
        )}

        {/* Image-only ad (clickable) */}
        {ad.image && !ad.title && !ad.description && !ad.ctaText && (
          <div className="w-full h-auto">
            <img
              src={ad.image}
              alt={ad.advertiser || 'Advertisement'}
              className="w-full h-auto object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to manage advertising popups
 */
export function useAdvertisingPopup() {
  const [ads, setAds] = useState([]);

  // Example ads - in production, these would come from an API or CMS
  useEffect(() => {
    // You can fetch ads from an API here
    const exampleAds = [
      {
        id: 'job-seekers',
        image: '/images/ads/job-seekers.jpg',
        title: 'Find Your Dream Job',
        description: 'Browse thousands of opportunities from top companies.',
        link: '/jobs',
        ctaText: 'Explore Jobs',
        position: 'bottom-right',
        storageKey: 'ad_job_seekers_dismissed'
      },
      {
        id: 'recruiters',
        image: '/images/ads/recruiters.jpg',
        title: 'Hire Top Talent',
        description: 'Post your job openings and reach qualified candidates.',
        link: '/recruiters',
        ctaText: 'Post a Job',
        position: 'bottom-left',
        storageKey: 'ad_recruiters_dismissed'
      }
    ];
    setAds(exampleAds);
  }, []);

  return { ads };
}



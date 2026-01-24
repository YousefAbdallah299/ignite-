'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * AdvertisingPopup Component
 * Displays marketing/advertising popups throughout the application
 * Only shows when there's enough space and doesn't crowd the page
 */
export default function AdvertisingPopup({ 
  ad = null, // { image, title, description, link, ctaText }
  position = 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'center'
  showDelay = 3000, // Delay before showing (ms)
  minViewportWidth = 768, // Minimum viewport width to show
  minViewportHeight = 600, // Minimum viewport height to show
  storageKey = 'ad_popup_dismissed' // localStorage key for dismissal
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if ad was dismissed
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed === 'true') {
      return;
    }

    // Check viewport size
    const checkViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (width >= minViewportWidth && height >= minViewportHeight) {
        setShouldShow(true);
      } else {
        setShouldShow(false);
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);

    // Show after delay if conditions are met
    if (shouldShow && ad) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, showDelay);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkViewport);
      };
    }

    return () => {
      window.removeEventListener('resize', checkViewport);
    };
  }, [shouldShow, ad, showDelay, minViewportWidth, minViewportHeight, storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  const handleClick = () => {
    if (ad?.link) {
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

  return (
    <div className={`fixed ${positionClasses[position]} z-50 w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300`}>
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-10 text-gray-500 hover:text-gray-700 transition-colors bg-white rounded-full p-1 shadow-sm"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        
        {ad.image && (
          <div className="w-full h-48 overflow-hidden bg-gray-100">
            <img
              src={ad.image}
              alt={ad.title || 'Advertisement'}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-5 space-y-3">
          {ad.title && (
            <h3 className="text-lg font-semibold text-gray-900 pr-8">{ad.title}</h3>
          )}
          {ad.description && (
            <p className="text-sm text-gray-600">{ad.description}</p>
          )}
          {ad.link && ad.ctaText && (
            <button
              onClick={handleClick}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              {ad.ctaText}
            </button>
          )}
        </div>
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


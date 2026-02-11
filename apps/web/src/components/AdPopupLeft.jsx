'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { adsAPI } from '@/utils/apiClient';

/**
 * AdPopupLeft Component
 * Displays active ads from the backend API
 * Shows popup after 2 seconds - fixed position in bottom-left that stays on scroll
 */
export default function AdPopupLeft() {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only runs on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true);
    }
  }, []);

  // Load ads on mount
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const loadAds = async () => {
      try {
        const activeAds = await adsAPI.getActiveAds();
        
        if (activeAds && Array.isArray(activeAds) && activeAds.length > 0) {
          setAds(activeAds);
          // Show ad after 2 seconds
          setTimeout(() => {
            setIsVisible(true);
          }, 2000);
        }
      } catch (error) {
        console.error('Error loading ads:', error);
      }
    };

    loadAds();
  }, [isMounted]);

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
  if (!isMounted || typeof window === 'undefined') return null;

  // Don't render if no ads or not visible
  if (!ads.length || !isVisible) return null;

  const currentAd = ads[currentAdIndex];
  if (!currentAd) return null;

  // Get image URL - handle different field names from backend
  const imageSrc = currentAd.imageUrl || currentAd.image || currentAd.img || currentAd.mediaUrl || currentAd.media;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        maxWidth: '320px',
        width: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          cursor: 'pointer',
          animation: 'fadeIn 0.3s ease-out',
        }}
        onClick={() => handleAdClick(currentAd.redirectUrl)}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
            backgroundColor: 'white',
            borderRadius: '50%',
            padding: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close ad"
        >
          <X size={16} color="#6b7280" />
        </button>

        {/* Ad Image */}
        {imageSrc ? (
          <div style={{ width: '100%', height: '160px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
            <img
              src={imageSrc}
              alt={currentAd.title || 'Advertisement'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : null}

        {/* Ad Title */}
        {currentAd.title && (
          <div style={{ padding: '16px' }}>
            <h3 style={{ fontWeight: 600, fontSize: '16px', color: '#111827', margin: 0 }}>
              {currentAd.title}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}

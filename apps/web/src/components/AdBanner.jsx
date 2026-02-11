import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { adsAPI } from '../utils/apiClient';

/**
 * Storage key for dismissed ads
 */
const getDismissedKey = (position) => `ad_dismissed_${position}`;

/**
 * AdBanner Component - Displays active advertisements with optional rotation
 * 
 * @param {Object} props
 * @param {string} props.variant - Display variant: 'banner' (default), 'sidebar', 'card'
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.rotate - Whether to rotate through multiple ads (default: true)
 * @param {number} props.rotationInterval - Time in ms between rotations (default: 5000)
 * @param {string} props.position - Position for dismiss storage key (default: 'default')
 */
export function AdBanner({ 
  variant = 'banner', 
  className = '', 
  rotate = true, 
  rotationInterval = 5000,
  position = 'default'
}) {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if ad was dismissed on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(getDismissedKey(position));
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [position]);

  // Fetch ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const activeAds = await adsAPI.getActiveAds();
        // Shuffle ads for variety
        const shuffled = [...(activeAds || [])].sort(() => Math.random() - 0.5);
        setAds(shuffled);
      } catch (err) {
        console.error('Failed to fetch ads:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // Rotate ads if enabled and multiple ads available
  useEffect(() => {
    if (!rotate || ads.length <= 1 || isDismissed) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [ads, rotate, rotationInterval, isDismissed]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    localStorage.setItem(getDismissedKey(position), 'true');
  }, [position]);

  if (loading) {
    return (
      <div className={`ad-banner ad-banner--loading ${className}`}>
        <div className="ad-banner__skeleton" />
      </div>
    );
  }

  if (error || ads.length === 0 || isDismissed) {
    return null;
  }

  const currentAd = ads[currentIndex];

  // Variant styles
  const variantClasses = {
    banner: 'ad-banner--banner',
    sidebar: 'ad-banner--sidebar',
    card: 'ad-banner--card',
    floating: 'ad-banner--floating',
  };

  return (
    <div className={`ad-banner ad-banner--${variantClasses[variant] || variantClasses.banner} ${className}`}>
      <a
        href={currentAd.redirectUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="ad-banner__link"
      >
        {currentAd.imageUrl && (
          <img
            src={currentAd.imageUrl}
            alt={currentAd.title || 'Advertisement'}
            className="ad-banner__image"
            loading="lazy"
          />
        )}
        {currentAd.title && variant !== 'floating' && (
          <span className="ad-banner__title">{currentAd.title}</span>
        )}
      </a>
      
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="ad-banner__dismiss"
        aria-label="Dismiss advertisement"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Rotation indicator dots */}
      {rotate && ads.length > 1 && (
        <div className="ad-banner__dots">
          {ads.map((_, index) => (
            <span
              key={index}
              className={`ad-banner__dot ${index === currentIndex ? 'ad-banner__dot--active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * FloatingAd Component - Displays a floating ad on the side of the page with close button
 * 
 * @param {Object} props
 * @param {string} props.position - Position: 'left' (default) or 'right'
 * @param {string} props.size - Size: 'small', 'medium', 'large'
 */
export function FloatingAd({ position = 'left', size = 'medium' }) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const storageKey = `floating_ad_${position}_visible`;

  // Check if ad was closed on mount
  useEffect(() => {
    const closed = sessionStorage.getItem(storageKey);
    if (closed === 'true') {
      setIsVisible(false);
    }
  }, [storageKey]);

  // Fetch ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const activeAds = await adsAPI.getActiveAds();
        const shuffled = [...(activeAds || [])].sort(() => Math.random() - 0.5);
        setAds(shuffled);
      } catch (err) {
        console.error('Failed to fetch floating ads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // Rotate ads
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem(storageKey, 'true');
  };

  if (!isVisible || loading || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentIndex];
  const sizeClasses = {
    small: 'floating-ad--small',
    medium: 'floating-ad--medium',
    large: 'floating-ad--large',
  };

  return (
    <div className={`floating-ad floating-ad--${position} floating-ad--${sizeClasses[size]} floating-ad--visible`}>
      <button
        onClick={handleClose}
        className="floating-ad__close"
        aria-label="Close advertisement"
      >
        <X className="w-4 h-4" />
      </button>
      
      <a
        href={currentAd.redirectUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-ad__link"
      >
        {currentAd.imageUrl && (
          <img
            src={currentAd.imageUrl}
            alt={currentAd.title || 'Advertisement'}
            className="floating-ad__image"
            loading="lazy"
          />
        )}
        {currentAd.title && (
          <span className="floating-ad__title">{currentAd.title}</span>
        )}
      </a>
    </div>
  );
}

/**
 * AdBannerList Component - Displays multiple ads
 * 
 * @param {Object} props
 * @param {string} props.layout - Layout: 'grid' (default), 'horizontal', 'stacked'
 * @param {number} props.count - Number of ads to display (default: 3)
 */
export function AdBannerList({ layout = 'grid', count = 3 }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const activeAds = await adsAPI.getActiveAds();
        setAds((activeAds || []).slice(0, count));
      } catch (err) {
        console.error('Failed to fetch ads:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [count]);

  if (loading) {
    return (
      <div className={`ad-banner-list ad-banner-list--loading ad-banner-list--${layout}`}>
        {[...Array(Math.min(count, 3))].map((_, i) => (
          <div key={i} className="ad-banner-list__skeleton" />
        ))}
      </div>
    );
  }

  if (error || ads.length === 0) {
    return null;
  }

  return (
    <div className={`ad-banner-list ad-banner-list--${layout}`}>
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.redirectUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="ad-banner-list__item"
        >
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt={ad.title || 'Advertisement'}
              className="ad-banner-list__image"
              loading="lazy"
            />
          )}
          {ad.title && (
            <span className="ad-banner-list__title">{ad.title}</span>
          )}
        </a>
      ))}
    </div>
  );
}

export default AdBanner;

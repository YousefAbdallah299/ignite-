import { useState, useEffect } from 'react';
import { adsAPI } from '../utils/apiClient';

/**
 * AdBanner Component - Displays active advertisements
 * 
 * @param {Object} props
 * @param {string} props.variant - Display variant: 'banner' (default), 'sidebar', 'card'
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.maxAds - Maximum number of ads to display (default: 1)
 */
export function AdBanner({ variant = 'banner', className = '', maxAds = 1 }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const activeAds = await adsAPI.getActiveAds();
        // Filter and limit ads
        const filteredAds = (activeAds || []).slice(0, maxAds);
        setAds(filteredAds);
      } catch (err) {
        console.error('Failed to fetch ads:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [maxAds]);

  if (loading) {
    return (
      <div className={`ad-banner ad-banner--loading ${className}`}>
        <div className="ad-banner__skeleton" />
      </div>
    );
  }

  if (error || ads.length === 0) {
    return null; // Don't render anything if no ads or error
  }

  const ad = ads[0]; // Display first ad

  // Variant styles
  const variantClasses = {
    banner: 'ad-banner--banner',
    sidebar: 'ad-banner--sidebar',
    card: 'ad-banner--card',
  };

  return (
    <a
      href={ad.redirectUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`ad-banner ad-banner--${variantClasses[variant] || variantClasses.banner} ${className}`}
    >
      {ad.imageUrl && (
        <img
          src={ad.imageUrl}
          alt={ad.title || 'Advertisement'}
          className="ad-banner__image"
          loading="lazy"
        />
      )}
      {ad.title && (
        <span className="ad-banner__title">{ad.title}</span>
      )}
    </a>
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

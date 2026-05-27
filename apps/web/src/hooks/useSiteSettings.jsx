import { createContext, useContext, useEffect, useState } from 'react';
import { siteSettingsAPI } from '@/utils/apiClient';

export const DEFAULT_SITE_SETTINGS = {
  recruiterPriceDisplay: '29 EGP',
  contactEmail: 'contact@ignite.com',
  supportEmail: 'support@ignite.com',
  privacyEmail: 'privacy@ignite.com',
  contactPhone: '+1 (555) 123-4567',
};

const SiteSettingsContext = createContext({
  settings: DEFAULT_SITE_SETTINGS,
  loading: true,
  refreshSettings: async () => {},
});

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await siteSettingsAPI.getPublicSettings();
      if (data) {
        setSettings({ ...DEFAULT_SITE_SETTINGS, ...data });
      }
    } catch (error) {
      console.error('Failed to load site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

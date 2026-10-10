import { AdConfig, DEFAULT_AD_CONFIG } from '../types/ad';

const ADS_STORAGE_KEY = 'amarmetro_ads_config';

/**
 * Loads current ad configuration from server API, falling back to localStorage, then defaults.
 */
export async function getAdConfig(): Promise<AdConfig> {
  // Try server first
  try {
    const res = await fetch('/api/ads');
    if (res.ok) {
      const serverConfig = await res.json();
      if (serverConfig && serverConfig.leaderboard) {
        // Cache to localStorage
        localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(serverConfig));
        return {
          ...DEFAULT_AD_CONFIG,
          ...serverConfig,
          googleAdSense: { ...DEFAULT_AD_CONFIG.googleAdSense, ...(serverConfig.googleAdSense || {}) },
          leaderboard: { ...DEFAULT_AD_CONFIG.leaderboard, ...(serverConfig.leaderboard || {}) },
          inArticle: { ...DEFAULT_AD_CONFIG.inArticle, ...(serverConfig.inArticle || {}) },
          sidebar: { ...DEFAULT_AD_CONFIG.sidebar, ...(serverConfig.sidebar || {}) },
        };
      }
    }
  } catch (err) {
    // offline or static host fallback
  }

  // Fallback to localStorage
  try {
    const cached = localStorage.getItem(ADS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        ...DEFAULT_AD_CONFIG,
        ...parsed,
        googleAdSense: { ...DEFAULT_AD_CONFIG.googleAdSense, ...(parsed.googleAdSense || {}) },
        leaderboard: { ...DEFAULT_AD_CONFIG.leaderboard, ...(parsed.leaderboard || {}) },
        inArticle: { ...DEFAULT_AD_CONFIG.inArticle, ...(parsed.inArticle || {}) },
      };
    }
  } catch (e) {
    // ignore
  }

  return DEFAULT_AD_CONFIG;
}

/**
 * Saves ad configuration to server (if accessible) and localStorage.
 */
export async function saveAdConfig(config: AdConfig): Promise<boolean> {
  // Always update localStorage
  try {
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }

  // Also dispatch window event so active banners update immediately without page reload
  window.dispatchEvent(new CustomEvent('amarmetro_ads_updated', { detail: config }));

  // Save to server
  try {
    const res = await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn('Could not save to /api/ads (might be running static host)', err);
  }

  return true;
}

/**
 * Dynamically loads the official Google AdSense script into document head if a valid publisher ID exists
 */
export function loadGoogleAdSenseScript(publisherId: string): void {
  if (!publisherId || !publisherId.trim().startsWith('ca-pub-')) {
    return;
  }

  const scriptId = 'google-adsense-script';
  const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (existingScript) {
    if (existingScript.src.includes(publisherId.trim())) {
      return; // Already loaded
    }
    // Update src if publisher changed
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.id = scriptId;
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId.trim())}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

import { AdConfig, DEFAULT_AD_CONFIG } from '../types/ad';

const ADS_STORAGE_KEY = 'amarmetro_ads_config';

/**
 * Loads current ad configuration from server API, falling back to static /data/ads.json, localStorage, then defaults.
 */
export async function getAdConfig(): Promise<AdConfig> {
  // 1. Try server API first
  try {
    const res = await fetch('/api/ads');
    if (res.ok) {
      const serverConfig = await res.json();
      if (serverConfig && (serverConfig.leaderboard || serverConfig.slots)) {
        const merged: AdConfig = {
          ...DEFAULT_AD_CONFIG,
          ...serverConfig,
          googleAdSense: { ...DEFAULT_AD_CONFIG.googleAdSense, ...(serverConfig.googleAdSense || {}) },
          leaderboard: { ...DEFAULT_AD_CONFIG.leaderboard, ...(serverConfig.leaderboard || {}) },
          inArticle: { ...DEFAULT_AD_CONFIG.inArticle, ...(serverConfig.inArticle || {}) },
          sidebar: { ...DEFAULT_AD_CONFIG.sidebar, ...(serverConfig.sidebar || {}) },
          slots: { ...DEFAULT_AD_CONFIG.slots, ...(serverConfig.slots || {}) },
        };
        try {
          localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(merged));
        } catch (e) {
          // ignore
        }
        return merged;
      }
    }
  } catch (err) {
    // API not reachable, try static file next
  }

  // 2. Try static /data/ads.json (works on GitHub Pages & static web servers)
  try {
    const res = await fetch('/data/ads.json');
    if (res.ok) {
      const staticConfig = await res.json();
      if (staticConfig && (staticConfig.leaderboard || staticConfig.slots)) {
        const merged: AdConfig = {
          ...DEFAULT_AD_CONFIG,
          ...staticConfig,
          googleAdSense: { ...DEFAULT_AD_CONFIG.googleAdSense, ...(staticConfig.googleAdSense || {}) },
          leaderboard: { ...DEFAULT_AD_CONFIG.leaderboard, ...(staticConfig.leaderboard || {}) },
          inArticle: { ...DEFAULT_AD_CONFIG.inArticle, ...(staticConfig.inArticle || {}) },
          sidebar: { ...DEFAULT_AD_CONFIG.sidebar, ...(staticConfig.sidebar || {}) },
          slots: { ...DEFAULT_AD_CONFIG.slots, ...(staticConfig.slots || {}) },
        };
        return merged;
      }
    }
  } catch (e) {
    // fallback
  }

  // 3. Fallback to localStorage
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
        sidebar: { ...DEFAULT_AD_CONFIG.sidebar, ...(parsed.sidebar || {}) },
        slots: { ...DEFAULT_AD_CONFIG.slots, ...(parsed.slots || {}) },
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

  // Dispatch window event so active banners update immediately across the app without page reload
  window.dispatchEvent(new CustomEvent('amarmetro_ads_updated', { detail: config }));

  // Save to server if Express backend is running
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
    console.warn('Could not save to /api/ads (running on static host or offline)', err);
  }

  return true;
}

/**
 * Downloads ads.json file for committing to GitHub Pages repository
 */
export function downloadAdsJson(config: AdConfig): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(config, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', 'ads.json');
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
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

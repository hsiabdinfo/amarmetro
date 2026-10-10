import React, { useEffect, useState, useRef } from 'react';
import { ExternalLink, Sparkles, CheckCircle, Info } from 'lucide-react';
import { AdConfig, AdSlotConfig, DEFAULT_AD_CONFIG } from '../types/ad';
import { getAdConfig, loadGoogleAdSenseScript } from '../utils/ads';

interface AdBannerProps {
  format: 'leaderboard' | 'in-article' | 'rectangle';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdBanner: React.FC<AdBannerProps> = ({ format, className = '' }) => {
  const [adConfig, setAdConfig] = useState<AdConfig>(DEFAULT_AD_CONFIG);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const adRef = useRef<HTMLModElement | null>(null);

  // Load config on mount & listen for admin live updates
  useEffect(() => {
    let isMounted = true;
    getAdConfig().then((cfg) => {
      if (isMounted) {
        setAdConfig(cfg);
        if (cfg.googleAdSense?.publisherId) {
          loadGoogleAdSenseScript(cfg.googleAdSense.publisherId);
        }
      }
    });

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setAdConfig(e.detail);
        if (e.detail.googleAdSense?.publisherId) {
          loadGoogleAdSenseScript(e.detail.googleAdSense.publisherId);
        }
      }
    };

    window.addEventListener('amarmetro_ads_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('amarmetro_ads_updated', handleUpdate);
    };
  }, []);

  // Determine which slot configuration to use
  const slot: AdSlotConfig =
    format === 'leaderboard'
      ? adConfig.leaderboard
      : format === 'in-article'
      ? adConfig.inArticle
      : adConfig.sidebar || adConfig.leaderboard;

  // Execute AdSense push when slot is Google AdSense
  useEffect(() => {
    if (slot.type === 'google-adsense' && slot.adSlot && adConfig.googleAdSense.publisherId) {
      try {
        if (typeof window !== 'undefined') {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setIsAdLoaded(true);
        }
      } catch (e) {
        // Ignored or ad blocker
      }
    }
  }, [slot.type, slot.adSlot, adConfig.googleAdSense.publisherId]);

  // If slot is explicitly disabled by admin, render nothing
  if (slot.enabled === false) {
    return null;
  }

  // 1. Google AdSense Mode
  if (slot.type === 'google-adsense') {
    const pubId = slot.adClient || adConfig.googleAdSense.publisherId;
    const slotId = slot.adSlot;

    return (
      <div className={`w-full my-6 ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest px-2 mb-1">
          <span>বিজ্ঞাপন / ADVERTISEMENT</span>
          <span>Google AdSense ({pubId ? 'Active' : 'Setup Required'})</span>
        </div>

        <div className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-4 overflow-hidden min-h-[100px] flex flex-col items-center justify-center text-center">
          {pubId && slotId ? (
            <div className="w-full overflow-x-auto text-center">
              <ins
                ref={adRef}
                className="adsbygoogle block"
                style={{ display: 'block', minHeight: format === 'leaderboard' ? '90px' : '150px' }}
                data-ad-client={pubId}
                data-ad-slot={slotId}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
              {/* Dev/Fallback preview info if AdSense isn't serving yet on non-approved domain */}
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  AdSense Slot #{slotId} সংযুক্ত আছে। গুগল থেকে বিজ্ঞাপন লোড না হলে লাইভ ডোমেইনে অনুমোদন চেক করুন।
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 px-4 space-y-2 text-slate-500 max-w-md">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-700 mx-auto">
                <Info className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-sm text-slate-800">গুগল অ্যাডসেন্স স্লট কনফিগারেশন প্রয়োজন</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                অ্যাডমিন প্যানেল থেকে <strong>Publisher ID</strong> ও <strong>Slot ID</strong> সেট করুন, অথবা কাস্টম বিজ্ঞাপনে স্যুইচ করুন।
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Custom Sponsored Ad Mode
  if (slot.type === 'custom') {
    const isLeaderboard = format === 'leaderboard';
    return (
      <div className={`w-full my-6 ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest px-2 mb-1">
          <span>{slot.badge || 'বিজ্ঞাপন / SPONSORED'}</span>
          <span>Verified Partner</span>
        </div>

        <div className="w-full bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            {slot.imageUrl ? (
              <img
                src={slot.imageUrl}
                alt={slot.title || 'Sponsor Ad'}
                className={`${
                  isLeaderboard ? 'w-full sm:w-44 h-24 sm:h-20' : 'w-full sm:w-36 h-28'
                } object-cover rounded-xl border border-slate-200 shadow-2xs shrink-0`}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
            )}

            <div className="space-y-1 text-center sm:text-left flex-1">
              {slot.badge && (
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  {slot.badge}
                </span>
              )}
              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {slot.title || 'আপনার বিজ্ঞাপন এখানে প্রচার করুন'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                {slot.description || 'amarmetro.com এ বিজ্ঞাপন দিতে যোগাযোগ করুন।'}
              </p>
            </div>

            {slot.targetUrl && (
              <a
                href={slot.targetUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="px-4 py-2.5 bg-slate-900 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98 self-center sm:self-auto"
              >
                <span>{slot.ctaText || 'বিস্তারিত জানুন'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Default Preset Metro Transit Ad Mode
  if (format === 'leaderboard') {
    return (
      <div className={`w-full my-6 ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest px-2 mb-1">
          <span>বিজ্ঞাপন / ADVERTISEMENT</span>
          <span>Google AdSense Slot</span>
        </div>
        <div className="w-full bg-gradient-to-r from-slate-100 via-emerald-50/50 to-slate-100 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                {slot.badge || 'স্পনসরড ট্রানজিট সার্ভিস'}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {slot.title || 'ডিজিটাল এমআরটি ও সিটি বাস ট্র্যাকার – সহজে টিকিট ও রুট জানুন'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {slot.description || 'আপনার প্রতিষ্ঠানের বিজ্ঞাপন এখানে প্রচার করতে যোগাযোগ করুন'}
              </p>
            </div>
          </div>
          <a
            href={slot.targetUrl || '#fare'}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>{slot.ctaText || 'বিস্তারিত জানুন'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  if (format === 'in-article') {
    return (
      <div
        className={`my-8 p-5 bg-gradient-to-br from-slate-50 via-emerald-50/40 to-slate-50 rounded-2xl border border-dashed border-emerald-300/80 ${className}`}
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest mb-3">
          <span>বিজ্ঞাপন / SPONSORED</span>
          <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[9px] font-bold">
            এডসেন্স স্লট
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <img
            src={
              slot.imageUrl ||
              'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=400&q=80'
            }
            alt="Ad Banner"
            className="w-full sm:w-36 h-28 object-cover rounded-xl shadow-2xs shrink-0"
          />
          <div className="space-y-1.5 flex-1 text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              {slot.title || 'স্মার্ট পাস ও ডিজিটাল ওয়ালেট রিচার্জ সার্ভিস'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {slot.description ||
                'মেট্রোরেল যাত্রীদের জন্য দ্রুততম মোবাইল রিচার্জ ও ক্যাশব্যাক অফার। দীর্ঘ লাইনে না দাঁড়িয়ে মুহূর্তেই ব্যালেন্স চেক করুন।'}
            </p>
            <div className="pt-1">
              <a
                href={slot.targetUrl || '#'}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                {slot.ctaText || 'অফারটি দেখতে ক্লিক করুন'} →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center ${className}`}>
      <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">বিজ্ঞাপন (AD)</span>
      <div className="p-6 bg-white border border-slate-100 rounded-xl space-y-2">
        <h5 className="font-bold text-sm text-slate-800">{slot.title || 'এখানে আপনার বিজ্ঞাপন প্রচার করুন'}</h5>
        <p className="text-xs text-slate-500">
          {slot.description || 'amarmetro.com এর হাজারো যাত্রীর কাছে আপনার ব্র্যান্ড পৌঁছে দিন'}
        </p>
      </div>
    </div>
  );
};

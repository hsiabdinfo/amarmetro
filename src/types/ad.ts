export interface AdSlotConfig {
  enabled: boolean;
  type: 'default' | 'google-adsense' | 'custom';
  // Google AdSense settings
  adClient?: string; // e.g. "ca-pub-1234567890123456"
  adSlot?: string;   // e.g. "1234567890"
  // Custom sponsor settings
  badge?: string;    // e.g. "স্পনসরড বিজ্ঞাপন" / "বিজ্ঞাপন"
  title?: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  ctaText?: string;
}

export interface AdConfig {
  googleAdSense: {
    publisherId: string; // e.g. "ca-pub-1234567890123456"
    autoAdsEnabled: boolean;
  };
  leaderboard: AdSlotConfig;
  inArticle: AdSlotConfig;
  sidebar?: AdSlotConfig;
}

export const DEFAULT_AD_CONFIG: AdConfig = {
  googleAdSense: {
    publisherId: '',
    autoAdsEnabled: false,
  },
  leaderboard: {
    enabled: true,
    type: 'default',
    badge: 'স্পনসরড ট্রানজিট সার্ভিস',
    title: 'ডিজিটাল এমআরটি ও সিটি বাস ট্র্যাকার – সহজে টিকিট ও রুট জানুন',
    description: 'আপনার প্রতিষ্ঠানের বিজ্ঞাপন এখানে প্রচার করতে যোগাযোগ করুন',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    targetUrl: 'https://amarmetro.com',
    ctaText: 'বিস্তারিত জানুন',
  },
  inArticle: {
    enabled: true,
    type: 'default',
    badge: 'স্পনসরড পার্টনার',
    title: 'স্মার্ট পাস ও ডিজিটাল ওয়ালেট রিচার্জ সার্ভিস',
    description: 'মেট্রোরেল যাত্রীদের জন্য দ্রুততম মোবাইল রিচার্জ ও ক্যাশব্যাক অফার। দীর্ঘ লাইনে না দাঁড়িয়ে মুহূর্তেই ব্যালেন্স চেক করুন।',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=400&q=80',
    targetUrl: 'https://amarmetro.com',
    ctaText: 'অফারটি দেখতে ক্লিক করুন',
  },
  sidebar: {
    enabled: true,
    type: 'default',
    badge: 'বিজ্ঞাপন',
    title: 'এখানে আপনার বিজ্ঞাপন প্রচার করুন',
    description: 'amarmetro.com এর হাজারো যাত্রীর কাছে আপনার ব্র্যান্ড পৌঁছে দিন',
    imageUrl: '',
    targetUrl: 'https://amarmetro.com',
    ctaText: 'যোগাযোগ করুন',
  },
};

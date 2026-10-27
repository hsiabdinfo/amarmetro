export interface AdSlotConfig {
  enabled: boolean;
  type: 'default' | 'google-adsense' | 'custom';
  // Google AdSense settings
  adClient?: string; // e.g. "ca-pub-1234567890123456"
  adSlot?: string;   // e.g. "1234567890" (Google AdSense Slot ID)
  adCode?: string;   // Raw Google AdSense snippet code pasted by user
  adFormat?: string; // 'auto' | 'rectangle' | 'horizontal'
  // Custom sponsor settings
  badge?: string;    // e.g. "স্পনসরড বিজ্ঞাপন" / "বিজ্ঞাপন"
  title?: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  ctaText?: string;
}

export interface AdSlotMeta {
  key: string;
  tab: string; // 'home' | 'stations' | 'bus-routes' | 'schedule' | 'pass' | 'civic' | 'blog' | 'article'
  tabLabelBn: string;
  slotLabelBn: string;
  defaultFormat: 'leaderboard' | 'rectangle' | 'in-article';
  position: 'top' | 'bottom' | 'mid';
}

export const AD_SLOTS_DIRECTORY: AdSlotMeta[] = [
  { key: 'home-top', tab: 'home', tabLabelBn: 'হোম পেজ', slotLabelBn: 'স্লট ১: ভাড়া ক্যালকুলেটর নিচে (ব্যানার)', defaultFormat: 'leaderboard', position: 'top' },
  { key: 'home-bottom', tab: 'home', tabLabelBn: 'হোম পেজ', slotLabelBn: 'স্লট ২: ব্লগ প্রিভিউ নিচে (ফুটার আগে)', defaultFormat: 'leaderboard', position: 'bottom' },
  { key: 'stations-top', tab: 'stations', tabLabelBn: 'স্টেশন ও ম্যাপ', slotLabelBn: 'স্লট ১: রুট ম্যাপের উপরে', defaultFormat: 'leaderboard', position: 'top' },
  { key: 'stations-bottom', tab: 'stations', tabLabelBn: 'স্টেশন ও ম্যাপ', slotLabelBn: 'স্লট ২: স্টেশন বিস্তারিত সুবিধার নিচে', defaultFormat: 'rectangle', position: 'bottom' },
  { key: 'bus-routes-top', tab: 'bus-routes', tabLabelBn: 'বাস রুট গাইড', slotLabelBn: 'স্লট ১: রুট ফিল্টারের নিচে', defaultFormat: 'leaderboard', position: 'top' },
  { key: 'bus-routes-bottom', tab: 'bus-routes', tabLabelBn: 'বাস রুট গাইড', slotLabelBn: 'স্লট ২: টার্মিনাল কানেকশনের নিচে', defaultFormat: 'rectangle', position: 'bottom' },
  { key: 'schedule-top', tab: 'schedule', tabLabelBn: 'ট্রেন সময়সূচী', slotLabelBn: 'স্লট ১: পিক/অফ-পিক সূচীর উপরে', defaultFormat: 'leaderboard', position: 'top' },
  { key: 'schedule-bottom', tab: 'schedule', tabLabelBn: 'ট্রেন সময়সূচী', slotLabelBn: 'স্লট ২: বিশেষ নির্দেশনার নিচে', defaultFormat: 'rectangle', position: 'bottom' },
  { key: 'pass-top', tab: 'pass', tabLabelBn: 'এমআরটি পাস', slotLabelBn: 'স্লট ১: পাস ডিসকাউন্ট ক্যালকুলেটরে', defaultFormat: 'leaderboard', position: 'top' },
  { key: 'pass-bottom', tab: 'pass', tabLabelBn: 'এমআরটি পাস', slotLabelBn: 'স্লট ২: রেজিস্ট্রেশন গাইডের নিচে', defaultFormat: 'rectangle', position: 'bottom' },
  { key: 'civic-top', tab: 'civic', tabLabelBn: 'নাগরিক সেবা', slotLabelBn: 'স্লট ১: সেবা তালিকা উপরে', defaultFormat: 'leaderboard', position: 'top' },
  { key: 'civic-bottom', tab: 'civic', tabLabelBn: 'নাগরিক সেবা', slotLabelBn: 'স্লট ২: হেল্পলাইন ডিরেক্টরির নিচে', defaultFormat: 'rectangle', position: 'bottom' },
  { key: 'blog-top', tab: 'blog', tabLabelBn: 'মেট্রো ব্লগ পাতা', slotLabelBn: 'স্লট ১: ফিচার্ড আর্টিকেলের নিচে', defaultFormat: 'leaderboard', position: 'top' },
  { key: 'blog-bottom', tab: 'blog', tabLabelBn: 'মেট্রো ব্লগ পাতা', slotLabelBn: 'স্লট ২: সকল পোস্ট গ্রিডের নিচে', defaultFormat: 'rectangle', position: 'bottom' },
  { key: 'article-mid', tab: 'article', tabLabelBn: 'আর্টিকেল ভিউ', slotLabelBn: 'স্লট ১: আর্টিকেলের মাঝে', defaultFormat: 'in-article', position: 'mid' },
  { key: 'article-bottom', tab: 'article', tabLabelBn: 'আর্টিকেল ভিউ', slotLabelBn: 'স্লট ২: আর্টিকেলের শেষে (মন্তব্যের আগে)', defaultFormat: 'rectangle', position: 'bottom' },
];

export interface AdConfig {
  googleAdSense: {
    publisherId: string; // e.g. "ca-pub-1234567890123456"
    autoAdsEnabled: boolean;
  };
  leaderboard: AdSlotConfig;
  inArticle: AdSlotConfig;
  sidebar?: AdSlotConfig;
  slots: Record<string, AdSlotConfig>;
}

export const createDefaultSlot = (badge: string, title: string, description: string): AdSlotConfig => ({
  enabled: true,
  type: 'default',
  badge,
  title,
  description,
  imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
  targetUrl: 'https://amarmetro.com',
  ctaText: 'বিস্তারিত দেখুন',
});

const defaultSlotsRecord: Record<string, AdSlotConfig> = {};
AD_SLOTS_DIRECTORY.forEach((meta) => {
  defaultSlotsRecord[meta.key] = createDefaultSlot(
    'বিজ্ঞাপন / ট্রানজিট স্পনসর',
    `${meta.tabLabelBn} – ডিজিটাল রিচার্জ ও পার্টনার সার্ভিস`,
    'মেট্রোরেল যাত্রীদের জন্য দ্রুততম সেবা ও বিশেষ ছাড়। বিজ্ঞাপনের জন্য যোগাযোগ করুন।'
  );
});

export const DEFAULT_AD_CONFIG: AdConfig = {
  googleAdSense: {
    publisherId: 'ca-pub-5488136470537852',
    autoAdsEnabled: true,
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
  slots: defaultSlotsRecord,
};

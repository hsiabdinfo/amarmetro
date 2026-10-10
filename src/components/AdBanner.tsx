import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

interface AdBannerProps {
  format: 'leaderboard' | 'in-article' | 'rectangle';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ format, className = '' }) => {
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
                স্পনসরড ট্রানজিট সার্ভিস
              </span>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                ডিজিটাল এমআরটি ও সিটি বাস ট্র্যাকার – সহজে টিকিট ও রুট জানুন
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                আপনার প্রতিষ্ঠানের বিজ্ঞাপন এখানে প্রচার করতে যোগাযোগ করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>বিস্তারিত জানুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (format === 'in-article') {
    return (
      <div className={`my-8 p-5 bg-gradient-to-br from-slate-50 via-emerald-50/40 to-slate-50 rounded-2xl border border-dashed border-emerald-300/80 ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest mb-3">
          <span>বিজ্ঞাপন / SPONSORED</span>
          <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[9px] font-bold">এডসেন্স স্লট</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=400&q=80"
            alt="Ad Banner"
            className="w-full sm:w-36 h-28 object-cover rounded-xl shadow-2xs shrink-0"
          />
          <div className="space-y-1.5 flex-1 text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              স্মার্ট পাস ও ডিজিটাল ওয়ালেট রিচার্জ সার্ভিস
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              মেট্রোরেল যাত্রীদের জন্য দ্রুততম মোবাইল রিচার্জ ও ক্যাশব্যাক অফার। দীর্ঘ লাইনে না দাঁড়িয়ে মুহূর্তেই ব্যালেন্স চেক করুন।
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline cursor-pointer">
                অফারটি দেখতে ক্লিক করুন →
              </span>
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
        <h5 className="font-bold text-sm text-slate-800">এখানে আপনার বিজ্ঞাপন প্রচার করুন</h5>
        <p className="text-xs text-slate-500">amarmetro.com এর হাজারো যাত্রীর কাছে আপনার ব্র্যান্ড পৌঁছে দিন</p>
      </div>
    </div>
  );
};

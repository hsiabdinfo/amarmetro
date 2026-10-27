import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X } from 'lucide-react';

interface CookieConsentProps {
  lang: 'bn' | 'en';
  onOpenPrivacy: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ lang, onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('amarmetro_cookie_consent');
      if (!consent) {
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('amarmetro_cookie_consent', JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    } catch {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('amarmetro_cookie_consent', JSON.stringify({ accepted: false, date: new Date().toISOString() }));
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 pointer-events-none animate-slideUp">
      <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-5 pointer-events-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{lang === 'bn' ? 'কুকি ও বিজ্ঞাপন নীতিমালা সম্মতি' : 'Cookie & Ad Policy Consent'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-sm font-medium">
                GDPR & AdSense
              </span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              {lang === 'bn' ? (
                <>
                  আমাদের সাইটে আপনার অভিজ্ঞতা উন্নত করতে, ভিজিটর ট্র্যাকিং এবং গুগল এডসেন্স (Google AdSense) বিজ্ঞাপন পরিবেশনে স্ট্যান্ডার্ড কুকি ব্যবহৃত হয়। গুগল ও তৃতীয় পক্ষ অংশীদাররা ব্যবহারকারীর আগ্রহ অনুযায়ী বিজ্ঞাপন প্রদর্শনে কুকি ব্যবহার করতে পারে। বিস্তারিত জানুন আমাদের{' '}
                  <button
                    onClick={onOpenPrivacy}
                    className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300 font-semibold cursor-pointer"
                  >
                    গোপনীয়তা নীতিমালায়
                  </button>
                  ।
                </>
              ) : (
                <>
                  We use cookies to analyze traffic and display relevant ads through Google AdSense. Google and third-party vendors use cookies to serve ads based on prior visits. Learn more in our{' '}
                  <button
                    onClick={onOpenPrivacy}
                    className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300 font-semibold cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                  .
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end pt-2 md:pt-0">
          <button
            onClick={handleDecline}
            className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'প্রয়োজনীয় শুধু' : 'Essential Only'}
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সম্মতি দিচ্ছি' : 'Accept All'}</span>
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ml-1"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

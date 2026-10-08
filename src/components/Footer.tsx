import React from 'react';
import { Train, Globe, MapPin, Bus, Building2 } from 'lucide-react';

interface FooterProps {
  lang: 'bn' | 'en';
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Train className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                amar<span className="text-emerald-400">metro</span>
                <span className="text-xs font-semibold text-slate-500">.com</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {lang === 'bn'
                ? 'amarmetro.com হলো ঢাকা মেট্রো রেল ও ঢাকা মেট্রোপলিটন নাগরিক যোগাযোগের একটি সমন্বিত ডিজিটাল তথ্যভাণ্ডার। সঠিক মেট্রোরেল ভাড়া, স্টেশন গাইড, ঢাকা সিটি বাস রুট এবং প্রয়োজনীয় নাগরিক সেবাসমূহ সহজে পৌঁছে দেওয়াই আমাদের লক্ষ্য।'
                : 'amarmetro.com is a digital portal for Dhaka Metro commuters and urban mobility, featuring fare calculators, station directories, city bus feeder lines, and civic services.'}
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
              <span>MRT Line-6</span>
              <span aria-hidden="true">·</span>
              <span>ঢাকা মেট্রোপলিটন এরিয়া</span>
              <span aria-hidden="true">·</span>
              <span>বাংলাদেশ</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'bn' ? 'দ্রুত লিঙ্ক' : 'Transit Links'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'ভাড়া ও সময় ক্যালকুলেটর' : 'Fare Calculator'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('stations')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'স্টেশন তালিকা ও সুযোগ-সুবিধা' : 'Station Directory'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bus-routes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'ঢাকা বাস রুট ও ফিডার সার্ভিস' : 'Dhaka Bus Routes'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('civic')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'নাগরিক সেবা ও জরুরি প্রতিষ্ঠান' : 'Civic Amenities'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('blog')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'মেট্রো ব্লগ ও ভ্রমণ সহায়িকা' : 'Metro Blog'}
                </button>
              </li>
            </ul>
          </div>

          {/* Metropolitan Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'bn' ? 'মেট্রোপলিটন সেবা' : 'Civic Utilities'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <span className="block text-slate-300 font-medium">ঢাকা উত্তর সিটি করপোরেশন (DNCC)</span>
                <span className="text-[11px] text-slate-500">উত্তরা, মিরপুর, গুলশান, বাড্ডা</span>
              </li>
              <li>
                <span className="block text-slate-300 font-medium">ঢাকা দক্ষিণ সিটি করপোরেশন (DSCC)</span>
                <span className="text-[11px] text-slate-500">ফার্মগেট, শাহবাগ, মতিঝিল, ধানমন্ডি</span>
              </li>
              <li>
                <span className="block text-slate-300 font-medium">কমলাপুর মাল্টিমোডাল হাব</span>
                <span className="text-[11px] text-slate-500">বাংলাদেশ রেলওয়ে হেডকোয়ার্টার</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} amarmetro.com. {lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}</p>
          <p className="flex items-center gap-1">
            <span>{lang === 'bn' ? 'ঢাকার সম্মানিত যাত্রী ও নাগরিকদের জন্য নিবেদিত' : 'Crafted for Dhaka transit commuters'}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

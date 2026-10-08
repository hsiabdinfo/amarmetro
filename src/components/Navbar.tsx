import React from 'react';
import { Train, Bus, Building2, Clock, BookOpen, CreditCard } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Live Metro Rail Alert Strip (No helpline) */}
      <div className="bg-emerald-900 text-emerald-100 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-medium">
              {lang === 'bn'
                ? 'এমআরটি লাইন-৬ আপডেট: ট্রেন চলাচল সম্পূর্ণ স্বাভাবিক · উত্তরা উত্তর ↔ মতিঝিল'
                : 'MRT Line-6 Live: Normal operations across all 16 stations · Uttara North ↔ Motijheel'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-emerald-200">
            <span>{lang === 'bn' ? 'পিক আওয়ার ফ্রিকোয়েন্সি: ৬ মিনিট' : 'Peak Frequency: 6 mins'}</span>
            <span aria-hidden="true">·</span>
            <span>{lang === 'bn' ? 'অফ-পিক: ১০ মিনিট' : 'Off-peak: 10 mins'}</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 text-left group focus:outline-hidden cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  amar<span className="text-emerald-700">metro</span>
                  <span className="text-xs font-semibold text-slate-400">.com</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm">
                  মেট্রোপলিটন
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-none">
                {lang === 'bn' ? 'ঢাকা মেট্রো ও নাগরিক ট্রানজিট গাইড' : 'Dhaka Transit & Commuter Portal'}
              </p>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentTab === 'home'
                  ? 'text-emerald-800 bg-emerald-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {lang === 'bn' ? 'ভাড়া ও রুট' : 'Fare & Route'}
            </button>

            <button
              onClick={() => setCurrentTab('stations')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentTab === 'stations'
                  ? 'text-emerald-800 bg-emerald-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {lang === 'bn' ? 'স্টেশন গাইড' : 'Station Guide'}
            </button>

            <button
              onClick={() => setCurrentTab('bus-routes')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'bus-routes'
                  ? 'text-emerald-800 bg-emerald-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Bus className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'bn' ? 'বাস রুটস' : 'Bus Routes'}</span>
            </button>

            <button
              onClick={() => setCurrentTab('civic')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'civic'
                  ? 'text-emerald-800 bg-emerald-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'bn' ? 'নাগরিক সুবিধা' : 'Civic Amenities'}</span>
            </button>

            <button
              onClick={() => setCurrentTab('schedule')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentTab === 'schedule'
                  ? 'text-emerald-800 bg-emerald-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {lang === 'bn' ? 'সময়সূচী' : 'Timetable'}
            </button>

            <button
              onClick={() => setCurrentTab('pass')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentTab === 'pass'
                  ? 'text-emerald-800 bg-emerald-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {lang === 'bn' ? 'এমআরটি পাস' : 'MRT Pass'}
            </button>

            <button
              onClick={() => setCurrentTab('blog')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'blog'
                  ? 'text-emerald-800 bg-emerald-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'bn' ? 'মেট্রো ব্লগ' : 'Metro Blog'}</span>
            </button>
          </nav>

          {/* Right Action buttons - Language switcher only (NO ADMIN BUTTON ON FRONTEND) */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setLang('bn')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  lang === 'bn' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  lang === 'en' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ENG
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md ${
              currentTab === 'home' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            {lang === 'bn' ? 'ভাড়া ও রুট' : 'Fare'}
          </button>
          <button
            onClick={() => setCurrentTab('stations')}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md ${
              currentTab === 'stations' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            {lang === 'bn' ? 'স্টেশন' : 'Stations'}
          </button>
          <button
            onClick={() => setCurrentTab('bus-routes')}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md ${
              currentTab === 'bus-routes' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            {lang === 'bn' ? 'বাস রুটস' : 'Bus Routes'}
          </button>
          <button
            onClick={() => setCurrentTab('civic')}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md ${
              currentTab === 'civic' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            {lang === 'bn' ? 'নাগরিক সুবিধা' : 'Civic'}
          </button>
          <button
            onClick={() => setCurrentTab('schedule')}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md ${
              currentTab === 'schedule' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            {lang === 'bn' ? 'সময়সূচী' : 'Timetable'}
          </button>
          <button
            onClick={() => setCurrentTab('pass')}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md ${
              currentTab === 'pass' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            {lang === 'bn' ? 'এমআরটি পাস' : 'MRT Pass'}
          </button>
          <button
            onClick={() => setCurrentTab('blog')}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md ${
              currentTab === 'blog' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            {lang === 'bn' ? 'ব্লগ' : 'Blog'}
          </button>
        </div>
      </div>
    </header>
  );
};

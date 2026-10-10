import React from 'react';
import { Train, Bus, Building2, Clock, BookOpen, CreditCard, Compass } from 'lucide-react';

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
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        {/* Live Metro Rail Alert Strip (No helpline) */}
        <div className="bg-emerald-900 text-emerald-100 px-4 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-medium text-[11px] sm:text-xs">
                {lang === 'bn'
                  ? 'এমআরটি লাইন-৬ আপডেট: ট্রেন চলাচল স্বাভাবিক · উত্তরা উত্তর ↔ মতিঝিল'
                  : 'MRT Line-6 Live: Normal operations across all 16 stations'}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-emerald-200 text-xs">
              <span>{lang === 'bn' ? 'পিক আওয়ার ফ্রিকোয়েন্সি: ৬ মিনিট' : 'Peak: 6 mins'}</span>
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

            {/* Language Switcher */}
            <div className="flex items-center gap-2">
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

          {/* Mobile Swipeable Category Strip (Horizontal touch momentum) */}
          <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2.5 border-t border-slate-100 no-scrollbar touch-pan-x">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg transition-all ${
                currentTab === 'home' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
              }`}
            >
              ভাড়া ও রুট
            </button>
            <button
              onClick={() => setCurrentTab('stations')}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg transition-all ${
                currentTab === 'stations' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
              }`}
            >
              স্টেশন গাইড
            </button>
            <button
              onClick={() => setCurrentTab('bus-routes')}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg transition-all flex items-center gap-1 ${
                currentTab === 'bus-routes' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Bus className="w-3 h-3" />
              বাস রুটস
            </button>
            <button
              onClick={() => setCurrentTab('civic')}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg transition-all flex items-center gap-1 ${
                currentTab === 'civic' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Building2 className="w-3 h-3" />
              নাগরিক সেবা
            </button>
            <button
              onClick={() => setCurrentTab('schedule')}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg transition-all ${
                currentTab === 'schedule' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
              }`}
            >
              সময়সূচী
            </button>
            <button
              onClick={() => setCurrentTab('pass')}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg transition-all ${
                currentTab === 'pass' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
              }`}
            >
              এমআরটি পাস
            </button>
            <button
              onClick={() => setCurrentTab('blog')}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg transition-all flex items-center gap-1 ${
                currentTab === 'blog' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              মেট্রো ব্লগ
            </button>
          </div>
        </div>
      </header>

      {/* Modern Mobile Bottom Navigation Bar (বার টাইপ মেনু) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 lg:hidden shadow-lg safe-bottom">
        <div className="grid grid-cols-5 h-14">
          <button
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
              currentTab === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Train className="w-5 h-5" />
            <span className="text-[10px]">ভাড়া ও রুট</span>
          </button>

          <button
            onClick={() => setCurrentTab('stations')}
            className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
              currentTab === 'stations' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px]">স্টেশন</span>
          </button>

          <button
            onClick={() => setCurrentTab('bus-routes')}
            className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
              currentTab === 'bus-routes' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bus className="w-5 h-5" />
            <span className="text-[10px]">বাস রুট</span>
          </button>

          <button
            onClick={() => setCurrentTab('civic')}
            className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
              currentTab === 'civic' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-[10px]">নাগরিক সেবা</span>
          </button>

          <button
            onClick={() => setCurrentTab('blog')}
            className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
              currentTab === 'blog' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">ব্লগ</span>
          </button>
        </div>
      </div>
    </>
  );
};

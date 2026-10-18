import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { FareCalculator } from './components/FareCalculator.tsx';
import { BlogSection } from './components/BlogSection.tsx';
import { Footer } from './components/Footer.tsx';
import { AdBanner } from './components/AdBanner.tsx';

// Code-split heavy interactive modules for rapid initial page load & high PageSpeed score
const RouteMap = lazy(() => import('./components/RouteMap.tsx').then((m) => ({ default: m.RouteMap })));
const BusRoutesGuide = lazy(() => import('./components/BusRoutesGuide.tsx').then((m) => ({ default: m.BusRoutesGuide })));
const CivicAmenitiesGuide = lazy(() => import('./components/CivicAmenitiesGuide.tsx').then((m) => ({ default: m.CivicAmenitiesGuide })));
const MrtPassGuide = lazy(() => import('./components/MrtPassGuide.tsx').then((m) => ({ default: m.MrtPassGuide })));
const ScheduleInfo = lazy(() => import('./components/ScheduleInfo.tsx').then((m) => ({ default: m.ScheduleInfo })));
const ArticleModal = lazy(() => import('./components/ArticleModal.tsx').then((m) => ({ default: m.ArticleModal })));
const AdminPanel = lazy(() => import('./components/AdminPanel.tsx').then((m) => ({ default: m.AdminPanel })));
import defaultPostsData from '../data/posts.json';
import { INITIAL_BLOG_POSTS } from './data/defaultPosts.ts';
import { BlogPost } from './types/blog.ts';
import { getCustomSecretSlug } from './utils/security.ts';
import {
  Train,
  Clock,
  Sparkles,
  CreditCard,
  MapPin,
  ArrowRight,
  Zap,
  Bus,
  Building2,
  Link as LinkIcon,
  Check,
  Copy,
  Share2,
} from 'lucide-react';

const TabLoadingSkeleton = () => (
  <div className="w-full min-h-[340px] flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
    <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
    <span className="text-xs font-semibold text-slate-500">লোড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন</span>
  </div>
);

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [selectedStationId, setSelectedStationId] = useState<string>('motijheel');
  const [copiedHomePostId, setCopiedHomePostId] = useState<string | null>(null);

  // Synchronize Tab Changes with Clean History State
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    if (selectedPost) {
      setSelectedPost(null);
    }
    const cleanUrl = tab === 'home' ? '/' : `?tab=${encodeURIComponent(tab)}`;
    window.history.pushState({}, '', cleanUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Blog Post with Direct Permalink in URL
  const handleOpenPost = (post: BlogPost) => {
    setSelectedPost(post);
    const slug = post.slug || post.id;
    const newUrl = `?post=${encodeURIComponent(slug)}`;
    window.history.pushState({ postId: post.id }, '', newUrl);
    document.title = `${post.title} | Amar Metro - আমার মেট্রো`;
  };

  // Close Article Reader and Restore URL
  const handleClosePost = () => {
    setSelectedPost(null);
    const cleanUrl = currentTab === 'home' ? '/' : `?tab=${encodeURIComponent(currentTab)}`;
    window.history.pushState({}, '', cleanUrl);
    document.title = 'Amar Metro - আমার মেট্রো | ঢাকা মেট্রো রেল গাইড, ভাড়া ও ব্লগ';
  };

  // Quick Copy / Share Permalink on Homepage Card
  const handleCopyHomePermalink = async (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://amarmetro.com';
    const rawPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const cleanPath = rawPath.endsWith('/') ? rawPath : `${rawPath}/`;
    const permalink = `${origin}${cleanPath}?post=${encodeURIComponent(post.slug || post.id)}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${post.title} | Amar Metro - আমার মেট্রো`,
          text: post.excerpt,
          url: permalink,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(permalink);
      setCopiedHomePostId(post.id);
      setTimeout(() => setCopiedHomePostId(null), 2500);
    }
  };

  // Check URL pathname, hash, or query for admin path (e.g. /backend/login, #login, #admin, or custom secret slug)
  useEffect(() => {
    const checkAdminPath = () => {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      const customSlug = getCustomSecretSlug().toLowerCase();

      if (
        path === '/backend/login' ||
        path === '/backend' ||
        path === '/admin' ||
        path === '/backend/' ||
        path.startsWith('/backend') ||
        path.startsWith('/admin') ||
        hash.includes('backend') ||
        hash.includes('admin') ||
        hash.includes('login') ||
        (customSlug && hash.includes(customSlug)) ||
        (customSlug && search.includes(customSlug)) ||
        search.includes('backend') ||
        search.includes('admin') ||
        search.includes('login')
      ) {
        setIsAdminOpen(true);
      }
    };

    checkAdminPath();
    window.addEventListener('popstate', checkAdminPath);
    window.addEventListener('hashchange', checkAdminPath);
    return () => {
      window.removeEventListener('popstate', checkAdminPath);
      window.removeEventListener('hashchange', checkAdminPath);
    };
  }, []);

  // Handle URL Permalinks (?post=<slug>, ?tab=<tab>, #post/<slug>, #<tab>)
  useEffect(() => {
    const handleUrlRouting = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash || '';

      // Check tab param
      const tabParam = urlParams.get('tab');
      if (tabParam && ['home', 'stations', 'bus-routes', 'schedule', 'pass', 'civic', 'blog'].includes(tabParam)) {
        setCurrentTab(tabParam);
      } else if (hash.startsWith('#tab/')) {
        const hashTab = hash.replace('#tab/', '').toLowerCase();
        if (['home', 'stations', 'bus-routes', 'schedule', 'pass', 'civic', 'blog'].includes(hashTab)) {
          setCurrentTab(hashTab);
        }
      }

      // Check post permalink param
      let postParam = urlParams.get('post');
      if (!postParam && (hash.startsWith('#post/') || hash.startsWith('#article/'))) {
        postParam = hash.replace(/^#(post|article)\//, '');
      }

      if (postParam && posts.length > 0) {
        const decodedParam = decodeURIComponent(postParam).toLowerCase();
        const found = posts.find(
          (p) =>
            (p.slug && p.slug.toLowerCase() === decodedParam) ||
            p.id.toLowerCase() === decodedParam
        );
        if (found) {
          setSelectedPost(found);
          document.title = `${found.title} | Amar Metro - আমার মেট্রো`;
        }
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, [posts]);

  // Global secret keyboard shortcut: Ctrl+Shift+A or Ctrl+Shift+L to toggle Admin Panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && (e.key === 'a' || e.key === 'A' || e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.pathname.startsWith('/backend') || window.location.pathname.startsWith('/admin')) {
      window.history.pushState({}, '', '/');
    }
  };

  // Fetch blog posts from backend API (with static GitHub Pages & fallback guarantee)
  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const res = await fetch('/api/posts?status=all');
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data && Array.isArray(data.posts) && data.posts.length > 0) {
            setPosts(data.posts);
            localStorage.setItem('amarmetro_posts_cache', JSON.stringify(data.posts));
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable (running static/offline):', err);
    } finally {
      setIsLoadingPosts(false);
    }

    // Fallback for static hosts (e.g. GitHub Pages)
    const cached = localStorage.getItem('amarmetro_posts_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
          return;
        }
      } catch (e) {
        console.error('Error parsing cached posts:', e);
      }
    }

    // Default bundled posts guarantee
    if (Array.isArray(defaultPostsData) && defaultPostsData.length > 0) {
      setPosts(defaultPostsData as BlogPost[]);
    } else {
      setPosts(INITIAL_BLOG_POSTS);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleStationClickFromMap = (stationId: string) => {
    setSelectedStationId(stationId);
    setCurrentTab('stations');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['SolaimanLipi',sans-serif]">
      {/* Header Navigation (Public - No Admin Link) */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Content Area (pb-24 for mobile bottom bar clearance) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-10 w-full space-y-10">
        {/* HERO SECTION (Shown on Home Tab) */}
        {currentTab === 'home' && (
          <div className="space-y-10">
            {/* Transit Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-8 sm:p-12 shadow-lg border border-emerald-900/40">
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold backdrop-blur-xs">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {lang === 'bn' ? 'ঢাকা মেট্রো ও মেট্রোপলিটন ট্রানজিট পোর্টাল' : 'Dhaka Metro & Metropolitan Transit Portal'}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  {lang === 'bn' ? (
                    <>
                      যানজটমুক্ত রাজধানী, <br />
                      <span className="text-emerald-400">মেট্রোরেল ও নগর যোগাযোগের</span> সম্পূর্ণ গাইড
                    </>
                  ) : (
                    <>
                      Seamless Dhaka Commute, <br />
                      <span className="text-emerald-400">Metro Rail & City Transit</span> Complete Guide
                    </>
                  )}
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  {lang === 'bn'
                    ? 'উত্তরা উত্তর থেকে মতিঝিল দ্রুততম মেট্রো ভ্রমণ, স্টেশন গাইড, ঢাকা সিটির সংযোগকারী বাস রুট এবং প্রয়োজনীয় নাগরিক সেবাসমূহের সমন্বিত ডিজিটাল তথ্যভাণ্ডার।'
                    : 'Commute fast across Dhaka MRT Line-6, check fares, station amenities, city feeder bus routes, and key metropolitan civic services in one unified portal.'}
                </p>

                {/* Quick CTAs (Public Transit Links Only) */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleTabChange('stations')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
                  >
                    <Train className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'স্টেশন রুট ম্যাপ' : 'Explore Stations'}</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('bus-routes')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition-all cursor-pointer backdrop-blur-xs"
                  >
                    <Bus className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'bn' ? 'কানেক্টিং বাস রুটস' : 'Bus Feeder Routes'}</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('civic')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition-all cursor-pointer backdrop-blur-xs"
                  >
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'bn' ? 'নাগরিক সেবা ও প্রতিষ্ঠান' : 'Civic Amenities'}</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('blog')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-slate-300 hover:text-white font-medium text-sm transition-colors cursor-pointer"
                  >
                    <span>{lang === 'bn' ? 'মেট্রো ব্লগ' : 'Read Blog'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Transit Metrics strip inside hero */}
              <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-white">
                <div>
                  <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'যাত্রা সময়' : 'Full Journey'}</span>
                  <span className="text-2xl font-black text-emerald-400">~৩১ মিনিট</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'পিক ফ্রিকোয়েন্সি' : 'Peak Frequency'}</span>
                  <span className="text-2xl font-black text-emerald-400">৬ মিনিট</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'এমআরটি পাস ছাড়' : 'MRT Pass Discount'}</span>
                  <span className="text-2xl font-black text-emerald-400">১০% সাশ্রয়</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'সক্রিয় মেট্রো স্টেশন' : 'Active Stations'}</span>
                  <span className="text-2xl font-black text-emerald-400">১৬টি স্টেশন</span>
                </div>
              </div>
            </div>

            {/* Live Interactive Fare Calculator Section */}
            <FareCalculator
              lang={lang}
              onSelectStation={handleStationClickFromMap}
            />

            {/* Responsive Leaderboard Advertisement Slot 1: Home Top */}
            <AdBanner slotKey="home-top" format="leaderboard" label="হোম পেজ ব্যানার ১" />

            {/* Metropolitan Feature Highlight Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bus Routes Highlight */}
              <div
                onClick={() => setCurrentTab('bus-routes')}
                className="group bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Bus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {lang === 'bn' ? 'ঢাকা সিটি বাস রুট ও ফিডার সার্ভিস' : 'City Bus Routes & Feeder Transit'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === 'bn'
                        ? 'মেট্রোরেল স্টেশন সংলগ্ন বিকল্প, বিহঙ্গ, প্রজাপতি ও অন্যান্য বাসের রুট ও স্টপেজ'
                        : 'Explore connecting bus services directly from Line-6 stations'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>

              {/* Civic Amenities Highlight */}
              <div
                onClick={() => setCurrentTab('civic')}
                className="group bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {lang === 'bn' ? 'মেট্রোপলিটন নাগরিক সুবিধা ও সেবা' : 'Metropolitan Civic Services'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === 'bn'
                        ? 'মেট্রোরেল করিডোরের হাসপাতাল, পাসপোর্ট অফিস, সচিবালয় ও দর্শনীয় স্থান'
                        : 'Hospitals, passport offices, ministries, and parks near stations'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            </div>

            {/* Recent Blog Highlights on Home */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-emerald-600 rounded-sm"></span>
                    {lang === 'bn' ? 'সাম্প্রতিক ব্লগ ও ভ্রমণ সহায়িকা' : 'Latest Blog Highlights'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'bn'
                      ? 'amarmetro.com এর নিয়মিত নাগরিক ও ট্রানজিট প্রতিবেদন'
                      : 'Editorial guides published on amarmetro.com'}
                  </p>
                </div>

                <button
                  onClick={() => handleTabChange('blog')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'bn' ? 'সকল পোস্ট দেখুন' : 'View All'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts.slice(0, 3).map((post) => (
                  <article
                    key={post.id}
                    onClick={() => handleOpenPost(post)}
                    className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 overflow-hidden bg-slate-100 aspect-[16/9]">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          width={400}
                          height={225}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                          <span className="font-semibold text-emerald-700">{post.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{post.readTime}</span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>
                    <div className="p-5 pt-0 border-t border-slate-50 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => handleCopyHomePermalink(e, post)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition-colors text-[11px] font-semibold cursor-pointer"
                        title="পোস্টের পার্মালিংক কপি বা শেয়ার করুন"
                      >
                        {copiedHomePostId === post.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">কপি হয়েছে!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3 h-3 text-slate-400" />
                            <span>শেয়ার</span>
                          </>
                        )}
                      </button>

                      <span className="text-xs font-semibold text-emerald-700 group-hover:translate-x-1 inline-flex items-center gap-1 transition-transform">
                        {lang === 'bn' ? 'পড়ুন' : 'Read'} →
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {/* Responsive Leaderboard Advertisement Slot 2: Home Bottom */}
              <AdBanner slotKey="home-bottom" format="leaderboard" label="হোম পেজ ব্যানার ২" className="mt-8" />
            </div>
          </div>
        )}

        {/* STATIONS TAB */}
        {currentTab === 'stations' && (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <RouteMap
              lang={lang}
              selectedStationId={selectedStationId}
              onSetAsFrom={() => handleTabChange('home')}
              onSetAsTo={() => handleTabChange('home')}
            />
          </Suspense>
        )}

        {/* BUS ROUTES TAB */}
        {currentTab === 'bus-routes' && (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <BusRoutesGuide lang={lang} />
          </Suspense>
        )}

        {/* CIVIC AMENITIES TAB */}
        {currentTab === 'civic' && (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <CivicAmenitiesGuide lang={lang} />
          </Suspense>
        )}

        {/* TIMETABLE TAB */}
        {currentTab === 'schedule' && (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <ScheduleInfo lang={lang} />
          </Suspense>
        )}

        {/* PASS GUIDE TAB */}
        {currentTab === 'pass' && (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <MrtPassGuide lang={lang} />
          </Suspense>
        )}

        {/* BLOG PORTAL TAB */}
        {currentTab === 'blog' && (
          <BlogSection
            posts={posts}
            lang={lang}
            onSelectPost={(post) => handleOpenPost(post)}
          />
        )}
      </main>

      {/* Reader Modal for Full Article with Direct Permalinks */}
      {selectedPost && (
        <Suspense fallback={null}>
          <ArticleModal
            post={selectedPost}
            onClose={handleClosePost}
            lang={lang}
          />
        </Suspense>
      )}

      {/* Dedicated Hidden Backend Admin / Login Panel (Accessible via /backend/login) */}
      {isAdminOpen && (
        <Suspense fallback={null}>
          <AdminPanel
            isOpen={isAdminOpen}
            onClose={handleCloseAdmin}
            posts={posts}
            onRefreshPosts={fetchPosts}
            lang={lang}
          />
        </Suspense>
      )}

      {/* Footer (Public with discreet Admin link) */}
      <Footer
        lang={lang}
        onNavigate={handleTabChange}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />
    </div>
  );
}

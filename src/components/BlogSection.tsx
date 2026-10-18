import React, { useState } from 'react';
import { BlogPost } from '../types/blog.ts';
import { METRO_CATEGORIES } from '../data/metroData.ts';
import { Search, BookOpen, Clock, Eye, ChevronRight, PenSquare, ArrowUpRight, Copy, Check, Share2, Link as LinkIcon } from 'lucide-react';
import { AdBanner } from './AdBanner.tsx';

interface BlogSectionProps {
  posts: BlogPost[];
  lang: 'bn' | 'en';
  onSelectPost: (post: BlogPost) => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({
  posts,
  lang,
  onSelectPost,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('সব বিভাগ');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const getPostPermalink = (post: BlogPost) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://amarmetro.com';
    const rawPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const cleanPath = rawPath.endsWith('/') ? rawPath : `${rawPath}/`;
    return `${origin}${cleanPath}?post=${encodeURIComponent(post.slug || post.id)}`;
  };

  const handleCopyPermalink = async (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    const permalink = getPostPermalink(post);
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
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2500);
    }
  };

  const publishedPosts = posts.filter((p) => p.status === 'published');

  const filteredPosts = publishedPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'সব বিভাগ' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts[0];
  const restPosts = filteredPosts.slice(1);

  return (
    <div className="space-y-8">
      {/* Blog Header & Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>amarmetro.com · ট্রানজিট জার্নাল</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {lang === 'bn' ? 'মেট্রো রেল ও ঢাকা ট্রানজিট ব্লগ' : 'Metro Rail & Dhaka Transit Blog'}
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              {lang === 'bn'
                ? 'দৈনন্দিন যাতায়াতের স্মার্ট টিপস, এমআরটি পাসের ব্যবহার, বাস রুট সংযোগ, ট্রানজিট সংবাদ ও মেগা প্রকল্পের বিশদ পর্যালোচনা।'
                : 'Commuter insights, ticketing tutorials, connecting bus feeder routes, and urban mobility updates.'}
            </p>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Category Tabs (Segmented interactive buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {METRO_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'ব্লগ বা টপিক খুঁজুন...' : 'Search articles...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Featured Lead Post */}
      {featuredPost && (
        <div
          onClick={() => onSelectPost(featuredPost)}
          className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12"
        >
          <div className="lg:col-span-7 h-64 sm:h-80 lg:h-full relative overflow-hidden bg-slate-100 aspect-video lg:aspect-auto">
            <img
              src={featuredPost.coverImage}
              alt={featuredPost.title}
              width={800}
              height={450}
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Zero-Pill unboxed metadata */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <span className="font-semibold text-emerald-700">{featuredPost.category}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {featuredPost.readTime}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-slate-400" />
                  {featuredPost.views} {lang === 'bn' ? 'বার পড়া হয়েছে' : 'views'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                {featuredPost.title}
              </h3>

              <p className="text-sm text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                {featuredPost.excerpt}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 block">
                  {featuredPost.author.name}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {featuredPost.author.role}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleCopyPermalink(e, featuredPost)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="পার্মালিংক কপি করুন"
                >
                  {copiedPostId === featuredPost.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 text-[11px] font-bold">লিংক কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span className="text-[11px]">পার্মালিংক</span>
                    </>
                  )}
                </button>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform">
                  {lang === 'bn' ? 'সম্পূর্ণ পড়ুন' : 'Read Article'}
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AdSense Slot 1: Blog Top Leaderboard */}
      <AdBanner slotKey="blog-top" format="leaderboard" label="ব্লগ পোর্টাল স্লট ১ (উপরে)" />

      {/* Grid of Other Posts */}
      {restPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="h-48 overflow-hidden bg-slate-100 relative aspect-video">
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
                  {/* Clean unboxed metadata */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-emerald-700">{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTime}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.views} {lang === 'bn' ? 'ভিউ' : 'views'}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-50 flex items-center justify-between mt-auto">
                <span className="text-xs text-slate-500 font-medium">
                  {post.author.name}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleCopyPermalink(e, post)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors text-[11px] font-semibold cursor-pointer"
                    title="পোস্টের পার্মালিংক কপি বা শেয়ার করুন"
                  >
                    {copiedPostId === post.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3 h-3 text-slate-500" />
                        <span>শেয়ার</span>
                      </>
                    )}
                  </button>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                    {lang === 'bn' ? 'বিস্তারিত' : 'Read'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">
            {lang === 'bn' ? 'কোনো পোস্ট পাওয়া যায়নি' : 'No posts found'}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {lang === 'bn'
              ? 'অন্য কোনো বিষয় বা বিভাগে অনুসন্ধান করে দেখুন।'
              : 'Try searching for different keywords or categories.'}
          </p>
        </div>
      ) : null}

      {/* AdSense Slot 2: Blog Bottom Banner */}
      <AdBanner slotKey="blog-bottom" format="rectangle" label="ব্লগ পোর্টাল স্লট ২ (নিচে)" />
    </div>
  );
};

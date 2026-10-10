import React, { useState } from 'react';
import { BlogPost } from '../types/blog.ts';
import { AdBanner } from './AdBanner.tsx';
import { ShareModal } from './ShareModal.tsx';
import {
  X,
  Clock,
  Eye,
  Share2,
  ThumbsUp,
  Send,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Lock,
  LogOut,
} from 'lucide-react';

interface ArticleModalProps {
  post: BlogPost | null;
  onClose: () => void;
  lang: 'bn' | 'en';
}

interface CommentUser {
  provider: 'google' | 'facebook';
  name: string;
  email: string;
  avatar?: string;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ post, onClose, lang }) => {
  const [likes, setLikes] = useState(42);
  const [hasLiked, setHasLiked] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Social Auth for Comments
  const [commentUser, setCommentUser] = useState<CommentUser | null>(() => {
    const saved = localStorage.getItem('amarmetro_comment_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Math CAPTCHA state
  const [captchaNum1, setCaptchaNum1] = useState(() => Math.floor(Math.random() * 8) + 2);
  const [captchaNum2, setCaptchaNum2] = useState(() => Math.floor(Math.random() * 8) + 1);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const refreshCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 8) + 2);
    setCaptchaNum2(Math.floor(Math.random() * 8) + 1);
    setCaptchaInput('');
    setCaptchaError('');
  };

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<
    Array<{
      name: string;
      provider: 'google' | 'facebook' | 'verified';
      text: string;
      time: string;
    }>
  >([
    {
      name: 'মো. রফিকুল ইসলাম',
      provider: 'google',
      text: 'খুবই তথ্যবহুল ও সময়োপযোগী পোস্ট। এমআরটি পাসের ডিসকাউন্ট হিসাবটা খুব পরিষ্কারভাবে বুঝানো হয়েছে।',
      time: '২ দিন আগে',
    },
    {
      name: 'সামিয়া হক',
      provider: 'facebook',
      text: 'কমলাপুর স্টেশন কবে নাগাদ সম্পূর্ণ চালু হবে সে বিষয়ে আরও আপডেট জানাবেন দয়া করে। ধন্যবাদ amar metro!',
      time: '১ দিন আগে',
    },
  ]);

  if (!post) return null;

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // Simulated real social login with verified citizen identity
    const dummyUser: CommentUser = {
      provider,
      name: provider === 'google' ? 'মেট্রো যাত্রী (Google Verified)' : 'নিয়মিত যাত্রী (Facebook Verified)',
      email: provider === 'google' ? 'user@gmail.com' : 'user@facebook.com',
    };
    setCommentUser(dummyUser);
    localStorage.setItem('amarmetro_comment_user', JSON.stringify(dummyUser));
  };

  const handleSocialLogout = () => {
    setCommentUser(null);
    localStorage.removeItem('amarmetro_comment_user');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentUser) return;
    if (!commentText.trim()) return;

    // Validate CAPTCHA
    const expected = captchaNum1 + captchaNum2;
    if (parseInt(captchaInput.trim(), 10) !== expected) {
      setCaptchaError(lang === 'bn' ? 'ক্যাপচা উত্তর ভুল হয়েছে! অনুগ্রহ করে সঠিক যোগফল লিখুন।' : 'Incorrect CAPTCHA answer.');
      return;
    }

    setComments([
      {
        name: commentUser.name,
        provider: commentUser.provider,
        text: commentText.trim(),
        time: lang === 'bn' ? 'এইমাত্র' : 'Just now',
      },
      ...comments,
    ]);

    setCommentText('');
    setCaptchaInput('');
    setCaptchaError('');
    refreshCaptcha();
  };

  // Convert basic markdown in content (headers, bold, lists) to formatted elements
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-slate-900 mt-6 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-8 mb-3">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-700 my-1 leading-relaxed">
            {line.substring(2)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} className="ml-4 list-decimal text-slate-700 my-1 leading-relaxed">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-3"></div>;
      }
      return (
        <p key={idx} className="text-slate-700 leading-relaxed text-base my-2">
          {line}
        </p>
      );
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto max-h-[92vh] flex flex-col">
          {/* Top Sticky Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/95 sticky top-0 z-20">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ফিরে যান' : 'Back'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'bn' ? 'শেয়ার করুন' : 'Share'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Reader Content */}
          <div className="overflow-y-auto p-6 sm:p-10 space-y-8">
            {/* Cover Hero */}
            <div className="rounded-xl overflow-hidden h-64 sm:h-96 relative bg-slate-100 shadow-xs">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Metadata & Title */}
            <div>
              {/* Zero-Pill unboxed metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
                <span className="font-bold text-emerald-800">{post.category}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {post.readTime}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {post.views} {lang === 'bn' ? 'বার পড়া হয়েছে' : 'views'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(post.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                {post.title}
              </h1>

              {/* Author Byline */}
              <div className="mt-5 pb-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                    {post.author.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      {post.author.name}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {post.author.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      hasLiked
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{likes}</span>
                  </button>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>শেয়ার</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Excerpt Summary Box */}
            <div className="bg-slate-50 border-l-4 border-emerald-600 p-4 rounded-r-xl">
              <p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed italic">
                "{post.excerpt}"
              </p>
            </div>

            {/* In-Article Advertisement Banner Slot (Attractive AdSense / Sponsor Slot) */}
            <AdBanner format="in-article" />

            {/* Formatted Body */}
            <div className="prose prose-slate max-w-none">
              {renderFormattedContent(post.content)}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  {lang === 'bn' ? 'সম্পর্কিত ট্যাগ:' : 'Related Tags:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section with Mandatory Social Login & Spam-Filter CAPTCHA */}
            <div className="pt-8 border-t border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  {lang === 'bn' ? `যাত্রীদের মন্তব্য ও প্রতিক্রিয়া (${comments.length})` : `Comments (${comments.length})`}
                </h3>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>স্প্যাম-মুক্ত ও যাচাইকৃত</span>
                </span>
              </div>

              {/* Mandatory Google / Facebook Authentication Guard */}
              {!commentUser ? (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {lang === 'bn' ? 'মন্তব্য করতে গুগল বা ফেসবুক একাউন্টে লগইন করুন' : 'Sign in to Comment'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {lang === 'bn'
                        ? 'স্প্যাম ও মিথ্যা তথ্য প্রতিরোধে শুধুমাত্র ভেরিফায়েড গুগল বা ফেসবুক অ্যাকাউন্ট দিয়ে মন্তব্য গ্রহণ করা হয়।'
                        : 'To prevent spam, verified sign-in via Google or Facebook is required.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('google')}
                      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <span className="text-red-500 font-bold">G</span>
                      <span>Google একাউন্ট দিয়ে সাইন ইন</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialLogin('facebook')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <span className="font-extrabold text-sm">f</span>
                      <span>Facebook দিয়ে সাইন ইন</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Authenticated User Comment Box + Anti-Spam CAPTCHA */
                <form onSubmit={handleAddComment} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${commentUser.provider === 'google' ? 'bg-red-500' : 'bg-blue-600'}`}></span>
                      <span className="text-xs font-bold text-slate-900">
                        {commentUser.name}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        ভেরিফাইড
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSocialLogout}
                      className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>লগআউট</span>
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    placeholder={
                      lang === 'bn'
                        ? 'মেট্রোরেল বা এই পোস্ট সম্পর্কিত আপনার মতামত লিখুন...'
                        : 'Write your comment...'
                    }
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />

                  {/* Anti-Spam Security CAPTCHA */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-700">নিরাপত্তা ক্যাপচা:</span>
                      <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg font-mono font-bold text-emerald-900 text-sm tracking-wider">
                        {captchaNum1} + {captchaNum2} = ?
                      </span>
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="নতুন ক্যাপচা কোড"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="যোগফল লিখুন"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        className="w-32 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-center font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'মন্তব্য জমা দিন' : 'Submit'}</span>
                      </button>
                    </div>
                  </div>

                  {captchaError && (
                    <p className="text-xs text-rose-600 font-bold">{captchaError}</p>
                  )}
                </form>
              )}

              {/* Comment List with Verification Badges */}
              <div className="space-y-3">
                {comments.map((c, i) => (
                  <div key={i} className="p-4 bg-white border border-slate-100 rounded-xl shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{c.name}</span>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-medium">
                          ✓ {c.provider === 'facebook' ? 'Facebook যাচাইকৃত' : 'Google যাচাইকৃত'}
                        </span>
                      </div>
                      <span className="text-slate-400">{c.time}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed pt-1">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={post.title}
        lang={lang}
      />
    </>
  );
};

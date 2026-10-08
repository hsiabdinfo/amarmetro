import React, { useState } from 'react';
import { BlogPost } from '../types/blog.ts';
import { X, Clock, Eye, Share2, ThumbsUp, Send, Check, Bookmark, Calendar, ArrowLeft } from 'lucide-react';

interface ArticleModalProps {
  post: BlogPost | null;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ post, onClose, lang }) => {
  const [copied, setCopied] = useState(false);
  const [likes, setLikes] = useState(42);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ name: string; text: string; time: string }>>([
    {
      name: 'মো. রফিকুল ইসলাম',
      text: 'খুবই তথ্যবহুল ও সময়োপযোগী পোস্ট। এমআরটি পাসের ডিসকাউন্ট হিসাবটা খুব পরিষ্কারভাবে বুঝানো হয়েছে।',
      time: '২ দিন আগে',
    },
    {
      name: 'সামিয়া হক',
      text: 'কমলাপুর স্টেশন কবে নাগাদ সম্পূর্ণ চালু হবে সে বিষয়ে আরও আপডেট জানাবেন দয়া করে। ধন্যবাদ amar metro!',
      time: '১ দিন আগে',
    },
  ]);

  if (!post) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([
      {
        name: commentName.trim() || (lang === 'bn' ? 'মেট্রো যাত্রী' : 'Commuter'),
        text: commentText.trim(),
        time: lang === 'bn' ? 'এইমাত্র' : 'Just now',
      },
      ...comments,
    ]);
    setCommentText('');
    setCommentName('');
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
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">{lang === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{lang === 'bn' ? 'শেয়ার লিংক' : 'Share Link'}</span>
                </>
              )}
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
          <div className="rounded-xl overflow-hidden h-64 sm:h-96 relative bg-slate-100">
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
            </div>
          </div>

          {/* Excerpt Summary Box */}
          <div className="bg-slate-50 border-l-4 border-emerald-600 p-4 rounded-r-xl">
            <p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed italic">
              "{post.excerpt}"
            </p>
          </div>

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

          {/* Comments Section */}
          <div className="pt-8 border-t border-slate-200 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">
              {lang === 'bn' ? `যাত্রীদের প্রতিক্রিয়া (${comments.length})` : `Commuter Responses (${comments.length})`}
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'আপনার নাম (ঐচ্ছিক)' : 'Your name (optional)'}
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <textarea
                rows={3}
                placeholder={lang === 'bn' ? 'এই প্রতিবেদন সম্পর্কে আপনার মতামত বা প্রশ্ন লিখুন...' : 'Write your comment or question...'}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'মন্তব্য জমা দিন' : 'Post Comment'}</span>
                </button>
              </div>
            </form>

            {/* Comment List */}
            <div className="space-y-3">
              {comments.map((c, i) => (
                <div key={i} className="p-3.5 bg-white border border-slate-100 rounded-xl">
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span className="text-slate-400">{c.time}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

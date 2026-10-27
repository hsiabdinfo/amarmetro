import React, { useState } from 'react';
import { X, MessageCircle, Mail, Printer, Share2, Copy, Check, Send, Smartphone, Globe } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
  lang: 'bn' | 'en';
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  lang,
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  // Use the exact passed post permalink url, or current window location
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://amarmetro.com');
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(`${title} - ঢাকা মেট্রো রেল ট্রানজিট গাইড`);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${title} | Amar Metro - আমার মেট্রো`,
          text: `${title}\n\nপোস্টটি সম্পূর্ণ পড়ুন:`,
          url: currentUrl,
        });
        return;
      } catch (err) {
        // Fallback to copy
      }
    }
    handleCopy();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {lang === 'bn' ? 'পোস্টটি শেয়ার করুন' : 'Share Post Link'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'bn' ? 'সোশ্যাল মিডিয়া বা বন্ধুদের সাথে সরাসরি পোস্টের লিংক শেয়ার করুন' : 'Share only this specific article link'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Post Title Callout */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
            {lang === 'bn' ? 'নির্বাচিত পোস্ট:' : 'Selected Article:'}
          </span>
          <p className="text-xs text-slate-800 font-semibold line-clamp-2 leading-snug">
            {title}
          </p>
        </div>

        {/* Primary Mobile / Device Share Button */}
        {typeof navigator !== 'undefined' && !!navigator.share && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-98 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>{lang === 'bn' ? 'মোবাইলে সরাসরি শেয়ার (WhatsApp, Facebook, Apps)' : 'Direct Mobile Share Sheet'}</span>
          </button>
        )}

        {/* Share buttons grid (Using exact post permalink) */}
        <div>
          <span className="text-[11px] font-bold text-slate-600 block mb-2">
            {lang === 'bn' ? 'অথবা সরাসরি সোশ্যাল মিডিয়ায় শেয়ার করুন:' : 'Or share to social apps:'}
          </span>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition-colors border border-emerald-100 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold">হোয়াটসঅ্যাপ</span>
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 transition-colors border border-blue-100 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <span className="font-extrabold text-base leading-none">f</span>
              </div>
              <span className="text-[11px] font-bold">ফেসবুক</span>
            </a>

            {/* Messenger */}
            <a
              href={`https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 transition-colors border border-indigo-100 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold">মেসেঞ্জার</span>
            </a>

            {/* Twitter / X */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-colors border border-slate-200 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs font-bold text-xs">
                𝕏
              </div>
              <span className="text-[11px] font-bold">টুইটার / X</span>
            </a>

            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 transition-colors border border-sky-100 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-xs">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold">টেলিগ্রাম</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:?subject=${encodedText}&body=পড়ুন%20amarmetro.com%20এ:%20${encodedUrl}`}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-xs">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold">ই-মেইল</span>
            </a>
          </div>
        </div>

        {/* Copy link input bar (Specific Post Link ONLY) */}
        <div className="pt-2">
          <label className="text-[11px] font-bold text-slate-600 block mb-1 flex items-center justify-between">
            <span>{lang === 'bn' ? 'শুধু এই পোস্টের পার্মালিংক কপি করুন:' : 'Direct Post Permalink:'}</span>
            <span className="text-[10px] text-emerald-700 font-mono font-normal">
              {currentUrl.includes('?post=') ? '✓ Post Link' : ''}
            </span>
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-300 rounded-xl focus-within:border-emerald-500">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="bg-transparent text-xs text-slate-800 px-2 flex-1 focus:outline-hidden font-mono select-all truncate"
            />
            <button
              onClick={handleCopy}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>কপি</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

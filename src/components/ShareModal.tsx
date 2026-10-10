import React, { useState } from 'react';
import { X, MessageCircle, Mail, Printer, Share2, Copy, Check, Send } from 'lucide-react';

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

  const currentUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(`${title} - amarmetro.com`);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">
              {lang === 'bn' ? 'সোশ্যাল মিডিয়া ও বন্ধুদের সাথে শেয়ার করুন' : 'Share Article'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium line-clamp-2">
          {title}
        </p>

        {/* Share buttons grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors border border-emerald-100"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">হোয়াটসঅ্যাপ</span>
          </a>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 transition-colors border border-blue-100"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <span className="font-extrabold text-lg">f</span>
            </div>
            <span className="text-xs font-bold">ফেসবুক</span>
          </a>

          {/* Messenger */}
          <a
            href={`fb-messenger://share/?link=${encodedUrl}`}
            onClick={(e) => {
              // Web fallback if app doesn't open
              window.open(`https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`, '_blank');
            }}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 transition-colors border border-indigo-100 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Send className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">মেসেঞ্জার</span>
          </a>

          {/* Email */}
          <a
            href={`mailto:?subject=${encodedText}&body=পড়ুন%20amarmetro.com%20এ:%20${encodedUrl}`}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200"
          >
            <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">ই-মেইল</span>
          </a>

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">প্রিন্ট করুন</span>
          </button>

          {/* Twitter / X */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-colors border border-slate-200"
          >
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs font-bold text-sm">
              𝕏
            </div>
            <span className="text-xs font-bold">টুইটার / X</span>
          </a>
        </div>

        {/* Copy link input bar */}
        <div className="pt-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            সরাসরি লিংক কপি করুন:
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="bg-transparent text-xs text-slate-600 px-2 flex-1 focus:outline-hidden font-mono truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>কপি হয়েছে</span>
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

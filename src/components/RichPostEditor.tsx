import React, { useRef, useState } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Quote,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Table,
  Minus,
  Info,
  Code,
  Eye,
  Edit3,
  Columns,
  Sparkles,
} from 'lucide-react';
import { renderRichContent } from '../utils/markdown.tsx';

interface RichPostEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minRows?: number;
  lang?: 'bn' | 'en';
}

export const RichPostEditor: React.FC<RichPostEditorProps> = ({
  value,
  onChange,
  placeholder,
  minRows = 12,
  lang = 'bn',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [viewMode, setViewMode] = useState<'write' | 'preview' | 'split'>('write');

  // Helper to wrap or insert text at cursor position in textarea
  const applyFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + '\n' + prefix + defaultText + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const replacement = selectedText ? `${prefix}${selectedText}${suffix}` : `${prefix}${defaultText}${suffix}`;
    const newContent = value.substring(0, start) + replacement + value.substring(end);

    onChange(newContent);

    // Restore focus and cursor position after state update
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText
        ? start + replacement.length
        : start + prefix.length + defaultText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // Dedicated insertion shortcuts
  const insertH1 = () => applyFormatting('\n# ', '\n', lang === 'bn' ? 'প্রধান শিরোনাম' : 'Main Heading');
  const insertH2 = () => applyFormatting('\n## ', '\n', lang === 'bn' ? 'উপ-শিরোনাম' : 'Sub Heading');
  const insertH3 = () => applyFormatting('\n### ', '\n', lang === 'bn' ? 'সেকশন শিরোনাম' : 'Section Heading');

  const insertBold = () => applyFormatting('**', '**', lang === 'bn' ? 'বোল্ড টেক্সট' : 'Bold text');
  const insertItalic = () => applyFormatting('*', '*', lang === 'bn' ? 'ইটালিক টেক্সট' : 'Italic text');
  const insertUnderline = () => applyFormatting('<u>', '</u>', lang === 'bn' ? 'আন্ডারলাইন টেক্সট' : 'Underline text');
  const insertStrikethrough = () => applyFormatting('~~', '~~', lang === 'bn' ? 'কাটা দাগ' : 'Strikethrough');

  const insertQuote = () => applyFormatting('\n> ', '\n', lang === 'bn' ? 'গুরুত্বপূর্ণ উক্তি বা বার্তা লিখুন...' : 'Quote message...');
  const insertCallout = () => applyFormatting('\n> 💡 [!INFO] **নোট:** ', '\n', lang === 'bn' ? 'যাত্রীদের জন্য জরুরি নোটিশ বা তথ্য এখানে লিখুন...' : 'Notice text...');

  const insertBulletList = () => applyFormatting('\n- ', '\n- পয়েন্ট ২\n- পয়েন্ট ৩\n', lang === 'bn' ? 'পয়েন্ট ১' : 'Point 1');
  const insertNumberList = () => applyFormatting('\n1. ', '\n2. দ্বিতীয় ধাপ\n3. তৃতীয় ধাপ\n', lang === 'bn' ? 'প্রথম ধাপ' : 'Step 1');

  const insertLink = () => {
    const url = prompt(lang === 'bn' ? 'লিংক URL দিন:' : 'Enter Link URL:', 'https://');
    if (url) {
      applyFormatting('[', `](${url})`, lang === 'bn' ? 'লিংক শিরোনাম' : 'Link Title');
    }
  };

  const insertImage = () => {
    const url = prompt(lang === 'bn' ? 'ছবির ওয়েব লিংক (URL) দিন:' : 'Enter Image URL:', 'https://images.unsplash.com/');
    if (url) {
      applyFormatting('\n![', `](${url})\n`, lang === 'bn' ? 'ছবির ক্যাপশন বা বিবরণ' : 'Image description');
    }
  };

  const insertTable = () => {
    const sampleTable = `\n| স্টেশন | ১ম ট্রেন | শেষ ট্রেন | ভাড়া |\n|---|---|---|---|\n| উত্তরা উত্তর | ০৭:১০ মি. | ০৯:০০ মি. | ১০০৳ |\n| মতিঝিল | ০৭:৩০ মি. | ০৯:৪০ মি. | ১০০৳ |\n`;
    applyFormatting('', '', sampleTable);
  };

  const insertDivider = () => applyFormatting('\n---\n', '');
  const insertCodeBlock = () => applyFormatting('\n```\n', '\n```\n', lang === 'bn' ? '// কোড বা বিশেষ তথ্য' : '// Code or text');

  // Stats
  const wordCount = (value || '').trim().split(/\s+/).filter(Boolean).length;
  const readTimeEst = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-600 transition-all">
      {/* Top Toolbar */}
      <div className="bg-slate-100/90 border-b border-slate-200 p-2 flex flex-wrap items-center justify-between gap-2">
        {/* Formatting Buttons Group */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={insertH1}
              className="px-2 py-1 hover:bg-slate-100 rounded text-xs font-black text-slate-800 cursor-pointer transition-colors"
              title="প্রধান শিরোনাম (H1 - Heading 1)"
            >
              H1
            </button>
            <button
              type="button"
              onClick={insertH2}
              className="px-2 py-1 hover:bg-slate-100 rounded text-xs font-extrabold text-slate-800 cursor-pointer transition-colors"
              title="উপ-শিরোনাম (H2 - Heading 2)"
            >
              H2
            </button>
            <button
              type="button"
              onClick={insertH3}
              className="px-2 py-1 hover:bg-slate-100 rounded text-xs font-bold text-slate-700 cursor-pointer transition-colors"
              title="সেকশন শিরোনাম (H3 - Heading 3)"
            >
              H3
            </button>
          </div>

          {/* Text Style: B, I, U, S */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={insertBold}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors font-bold"
              title="বোল্ড (Bold - **text**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={insertItalic}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="ইটালিক (Italic - *text*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={insertUnderline}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="আন্ডারলাইন (Underline - <u>text</u>)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={insertStrikethrough}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="কাটা দাগ (Strikethrough - ~~text~~)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={insertBulletList}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="বুলেট তালিকা (Bullet List)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={insertNumberList}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="নম্বর তালিকা (Numbered List)"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quotes & Callouts */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={insertQuote}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="উদ্ধৃতি (Blockquote)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={insertCallout}
              className="p-1.5 hover:bg-slate-100 rounded text-amber-700 cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-semibold"
              title="নোট / তথ্য বক্স (Info Box)"
            >
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>নোট</span>
            </button>
          </div>

          {/* Insert Items: Link, Image, Table, HR, Code */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={insertLink}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="লিংক যোগ করুন (Link)"
            >
              <Link2 className="w-3.5 h-3.5 text-emerald-600" />
            </button>
            <button
              type="button"
              onClick={insertImage}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="ছবি যোগ করুন (Image URL)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            </button>
            <button
              type="button"
              onClick={insertTable}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="ছক / টেবিল যোগ করুন (Table)"
            >
              <Table className="w-3.5 h-3.5 text-purple-600" />
            </button>
            <button
              type="button"
              onClick={insertDivider}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="বিভাজক দাগ (Horizontal Rule)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={insertCodeBlock}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="কোড ব্লক (Code Block)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* View Switcher: Write / Preview / Split */}
        <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('write')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'write' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>{lang === 'bn' ? 'এডিটর' : 'Write'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'preview' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{lang === 'bn' ? 'প্রিভিউ' : 'Preview'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'split' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="পাশাপাশি এডিটর ও প্রিভিউ দেখুন"
          >
            <Columns className="w-3 h-3" />
            <span>স্প্লিট</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative">
        {viewMode === 'write' && (
          <textarea
            ref={textareaRef}
            rows={minRows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              placeholder ||
              (lang === 'bn'
                ? `# পোস্টের প্রধান শিরোনাম\n\n## প্রথম সেকশন\nএখানে আপনার পোস্টের বিস্তারিত লিখুন। কোনো শব্দ সিলেক্ট করে উপরের **Bold**, *Italic*, <u>Underline</u> বা H1/H2 বাটনে চাপলেই ফরম্যাট হয়ে যাবে।\n\n> 💡 [!INFO] **নোট:** মেট্রোরেল যাত্রীদের জন্য ১০% ডিসকাউন্ট রেট প্রযোজ্য।\n\n- পয়েন্ট ১\n- পয়েন্ট ২`
                : 'Write your article here...')
            }
            className="w-full p-4 text-sm font-mono text-slate-900 bg-white leading-relaxed focus:outline-hidden min-h-[300px] resize-y"
            required
          />
        )}

        {viewMode === 'preview' && (
          <div className="p-6 bg-slate-50/70 min-h-[300px] max-h-[600px] overflow-y-auto">
            {value.trim() ? (
              renderRichContent(value)
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs italic">
                {lang === 'bn' ? 'বামে এডিটরে কিছু লিখলে এখানে লাইভ ফরম্যাটেড প্রিভিউ দেখা যাবে।' : 'Preview will appear here as you type.'}
              </div>
            )}
          </div>
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[360px]">
            <div className="p-0">
              <textarea
                ref={textareaRef}
                rows={minRows}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-full p-4 text-sm font-mono text-slate-900 bg-white leading-relaxed focus:outline-hidden resize-none min-h-[360px]"
                required
              />
            </div>
            <div className="p-5 bg-slate-50/70 overflow-y-auto max-h-[600px] min-h-[360px]">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                {lang === 'bn' ? 'লাইভ প্রিভিউ (Live Preview)' : 'Live Preview'}
              </div>
              {value.trim() ? (
                renderRichContent(value)
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  {lang === 'bn' ? 'বামে টাইপ করুন...' : 'Type on the left...'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>
            {lang === 'bn' ? 'শব্দ সংখ্যা:' : 'Words:'} <strong className="text-slate-800">{wordCount}</strong>
          </span>
          <span>·</span>
          <span>
            {lang === 'bn' ? 'পড়ার আনুমানিক সময়:' : 'Est. Read:'} <strong className="text-emerald-700">~{readTimeEst} {lang === 'bn' ? 'মিনিট' : 'min'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>H1, H2, H3, Bold, Italic, Underline, Lists, Links, Quotes কার্যকর</span>
        </div>
      </div>
    </div>
  );
};

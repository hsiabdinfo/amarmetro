import React, { useRef, useState, useEffect } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Link2,
  Image as ImageIcon,
  Table,
  Minus,
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Code,
  Eye,
  Edit3,
  Columns,
  Undo2,
  Redo2,
  Maximize2,
  Minimize2,
  HelpCircle,
  ChevronDown,
  Sparkles,
  X,
  Upload,
  FileText,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eraser,
  Subscript,
  Superscript,
  Palette,
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Undo / Redo history state
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Modal dialog states for Link, Image, Table, Callouts
  const [activeModal, setActiveModal] = useState<'link' | 'image' | 'table' | 'callout' | 'faq' | null>(null);

  // Link dialog state
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('https://');

  // Image dialog state
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Table dialog state
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Push to history when text changes from user actions
  const pushToHistory = (newVal: string) => {
    if (newVal === value) return;
    const nextHistory = history.slice(0, historyIndex + 1);
    if (nextHistory.length >= 40) {
      nextHistory.shift();
    }
    nextHistory.push(newVal);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    onChange(newVal);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevVal = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChange(prevVal);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextVal = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChange(nextVal);
    }
  };

  // Smart line-aware formatting for Headings, Lists, Quotes, Tasks
  const applyLinePrefix = (prefix: string, defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      pushToHistory(value + '\n' + prefix + defaultPlaceholder + '\n');
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find the start of the current line
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = value.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = value.length;

    const currentLine = value.substring(lineStart, lineEnd);

    // Existing line prefixes to match & replace
    const headingPrefixMatch = currentLine.match(/^(#{1,4}\s+|-\s+|\d+\.\s+|-\s*\[[ xX]\]\s+|>\s*)/);

    let newLine = currentLine;
    if (headingPrefixMatch) {
      const currentPrefix = headingPrefixMatch[0];
      const stripped = currentLine.substring(currentPrefix.length);

      // If clicking the same prefix, toggle it off (make it normal text)
      if (currentPrefix.trim() === prefix.trim()) {
        newLine = stripped;
      } else {
        newLine = prefix + stripped;
      }
    } else {
      if (currentLine.trim().length === 0) {
        newLine = prefix + defaultPlaceholder;
      } else {
        newLine = prefix + currentLine;
      }
    }

    const newContent = value.substring(0, lineStart) + newLine + value.substring(lineEnd);
    pushToHistory(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursor = lineStart + newLine.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 10);
  };

  // Smart inline formatting: Bold, Italic, Underline, Strike, Highlight, Code
  const applyInlineFormatting = (prefix: string, suffix: string, defaultPlaceholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      pushToHistory(value + prefix + defaultPlaceholder + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    // Check if selected is already wrapped with this formatting (Toggle off)
    if (selected.startsWith(prefix) && selected.endsWith(suffix) && selected.length >= prefix.length + suffix.length) {
      const unwrapped = selected.slice(prefix.length, -suffix.length);
      const newContent = value.substring(0, start) + unwrapped + value.substring(end);
      pushToHistory(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + unwrapped.length);
      }, 10);
      return;
    }

    // Check if characters immediately surrounding the selection match the formatting (Toggle off)
    const beforeSelection = value.substring(Math.max(0, start - prefix.length), start);
    const afterSelection = value.substring(end, Math.min(value.length, end + suffix.length));

    if (beforeSelection === prefix && afterSelection === suffix) {
      const newContent = value.substring(0, start - prefix.length) + selected + value.substring(end + suffix.length);
      pushToHistory(newContent);
      setTimeout(() => {
        textarea.focus();
        const newStart = start - prefix.length;
        textarea.setSelectionRange(newStart, newStart + selected.length);
      }, 10);
      return;
    }

    // Wrap or insert
    const replacement = selected ? `${prefix}${selected}${suffix}` : `${prefix}${defaultPlaceholder}${suffix}`;
    const newContent = value.substring(0, start) + replacement + value.substring(end);
    pushToHistory(newContent);

    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start, start + replacement.length);
      } else {
        const selStart = start + prefix.length;
        const selEnd = selStart + defaultPlaceholder.length;
        textarea.setSelectionRange(selStart, selEnd);
      }
    }, 10);
  };

  // Clear all formatting from selected text
  const applyClearFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;
    const selected = value.substring(start, end);
    const cleaned = selected
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/<u>(.*?)<\/u>/gi, '$1')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/==(.*?)==/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/<[^>]+>/g, '');
    const newContent = value.substring(0, start) + cleaned + value.substring(end);
    pushToHistory(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + cleaned.length);
    }, 10);
  };

  // Alignment formatting
  const applyAlignment = (align: 'left' | 'center' | 'right') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || (lang === 'bn' ? 'টেক্সট' : 'Text');
    const snippet = `<div align="${align}">\n${selected}\n</div>`;
    const newContent = value.substring(0, start) + snippet + value.substring(end);
    pushToHistory(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + snippet.length);
    }, 10);
  };

  // Colored badge helper
  const applyColorBadge = (color: 'green' | 'amber' | 'rose' | 'blue') => {
    const labels: Record<string, string> = {
      green: 'সবুজ ব্যাজ',
      amber: 'হলুদ সতর্কতা',
      rose: 'জরুরি নোটিশ',
      blue: 'গুরুত্বপূর্ণ তথ্য',
    };
    applyInlineFormatting(`<span class="badge-${color}">`, '</span>', lang === 'bn' ? labels[color] : `${color} badge`);
  };

  // Keyboard shortcuts handler: Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Z, Ctrl+Y
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        applyInlineFormatting('**', '**', lang === 'bn' ? 'বোল্ড টেক্সট' : 'Bold text');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        applyInlineFormatting('*', '*', lang === 'bn' ? 'ইটালিক টেক্সট' : 'Italic text');
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        applyInlineFormatting('<u>', '</u>', lang === 'bn' ? 'আন্ডারলাইন টেক্সট' : 'Underline text');
      } else if (e.key === 'z' || e.key === 'Z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        handleRedo();
      }
    }
  };

  // Insert Modal Submissions
  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    const textToInsert = linkText.trim() || (lang === 'bn' ? 'লিংক শিরোনাম' : 'Link title');
    const mdLink = `[${textToInsert}](${linkUrl.trim()})`;
    insertRawSnippet(mdLink);
    setActiveModal(null);
    setLinkText('');
    setLinkUrl('https://');
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    const caption = imageCaption.trim() || (lang === 'bn' ? 'ছবির বিবরণ' : 'Image description');
    const mdImage = `\n![${caption}](${imageUrl.trim()})\n`;
    insertRawSnippet(mdImage);
    setActiveModal(null);
    setImageUrl('');
    setImageCaption('');
  };

  const handleImageUploadDirect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const rawBase64 = ev.target?.result as string;
        try {
          // Attempt backend upload
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, base64Data: rawBase64 }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.url) {
              setImageUrl(data.url);
              setIsUploadingImage(false);
              return;
            }
          }
        } catch {
          // Fallback to base64
        }
        setImageUrl(rawBase64);
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploadingImage(false);
    }
  };

  const handleInsertTable = () => {
    let tableMd = '\n';
    // Header
    tableMd += '| ' + Array.from({ length: tableCols }, (_, i) => `কলাম ${i + 1}`).join(' | ') + ' |\n';
    // Separator
    tableMd += '| ' + Array.from({ length: tableCols }, () => '---').join(' | ') + ' |\n';
    // Rows
    for (let r = 0; r < tableRows; r++) {
      tableMd += '| ' + Array.from({ length: tableCols }, (_, c) => `তথ্য ${r + 1}-${c + 1}`).join(' | ') + ' |\n';
    }
    tableMd += '\n';

    insertRawSnippet(tableMd);
    setActiveModal(null);
  };

  const handleInsertPresetTable = (preset: 'schedule' | 'fare') => {
    let snippet = '';
    if (preset === 'schedule') {
      snippet = `\n| স্টেশন | ১ম ট্রেন (উত্তরা) | ১ম ট্রেন (মতিঝিল) | শেষ ট্রেন |\n|---|---|---|---|\n| উত্তরা উত্তর | ০৭:১০ মি. | — | ০৯:০০ মি. |\n| পল্লবী | ০৭:১৫ মি. | ০৭:৪০ মি. | ০৯:১৫ মি. |\n| ফার্মগেট | ০৭:২৮ মি. | ০৭:২৬ মি. | ০৯:৩০ মি. |\n| মতিঝিল | — | ০৭:১৫ মি. | ০৯:৪০ মি. |\n`;
    } else {
      snippet = `\n| যাত্রা শুরু | গন্তব্য | সাধারণ ভাড়া | এমআরটি পাস (১০% ছাড়) |\n|---|---|---|---|\n| উত্তরা উত্তর | মতিঝিল | ১০০৳ | ৯০৳ |\n| উত্তরা উত্তর | ফার্মগেট | ৬০৳ | ৫৪৳ |\n| মিরপুর-১০ | মতিঝিল | ৫০৳ | ৪৫৳ |\n| শাহবাগ | সচিবালয় | ২০৳ | ১৮৳ |\n`;
    }
    insertRawSnippet(snippet);
    setActiveModal(null);
  };

  const handleInsertCallout = (type: 'info' | 'warning' | 'success' | 'danger') => {
    let snippet = '';
    if (type === 'info') {
      snippet = `\n> 💡 [!INFO] **জরুরি তথ্য:** এখানে যাত্রীদের জন্য বিশেষ তথ্য বা সাধারণ জ্ঞাতব্য লিখুন...\n`;
    } else if (type === 'warning') {
      snippet = `\n> ⚠️ [!WARNING] **সতর্কতা:** প্ল্যাটফর্মে হলুদ দাগ অতিক্রম করবেন না ও ট্রেনের দরজায় হেলান দেবেন না।\n`;
    } else if (type === 'success') {
      snippet = `\n> ✅ [!SUCCESS] **সুখবর:** এখন থেকে এমআরটি পাসের ব্যালেন্স রিচার্জ স্টেশনের সকল টিভিএম-এ চালু রয়েছে।\n`;
    } else if (type === 'danger') {
      snippet = `\n> 🚨 [!DANGER] **জরুরি নোটিশ:** জরুরি পরিস্থিতিতে স্টেশনের এসওএস (SOS) বোতাম চাপুন অথবা কাস্টমার সার্ভিসে যোগাযোগ করুন।\n`;
    }
    insertRawSnippet(snippet);
    setActiveModal(null);
  };

  const handleInsertFAQ = () => {
    const faqSnippet = `\n<details>\n<summary>প্রশ্ন: এমআরটি পাসে কি প্রতি ট্রিপে ছাড় পাওয়া যায়?</summary>\nহ্যাঁ, যেকোনো ভ্রমণের ক্ষেত্রে এমআরটি পাস ব্যবহারকারী নিয়মিত ভাড়ার চেয়ে ১০% তাৎক্ষণিক ছাড় পান।\n</details>\n`;
    insertRawSnippet(faqSnippet);
    setActiveModal(null);
  };

  const insertRawSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      pushToHistory(value + snippet);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = value.substring(0, start) + snippet + value.substring(end);
    pushToHistory(newContent);
    setTimeout(() => {
      textarea.focus();
      const pos = start + snippet.length;
      textarea.setSelectionRange(pos, pos);
    }, 10);
  };

  // Stats calculation
  const wordCount = (value || '').trim().split(/\s+/).filter(Boolean).length;
  const charCount = (value || '').length;
  const readTimeEst = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div
      className={`w-full bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-xs transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl flex flex-col' : ''
      }`}
    >
      {/* Primary Top Toolbar */}
      <div className="bg-slate-100/90 border-b border-slate-200 p-2 flex flex-wrap items-center justify-between gap-2 select-none">
        {/* Left Formatting Groups */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Undo / Redo */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`p-1.5 rounded transition-colors ${
                historyIndex > 0 ? 'text-slate-700 hover:bg-slate-100 cursor-pointer' : 'text-slate-300 cursor-not-allowed'
              }`}
              title="পূর্বাবস্থা (Undo - Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`p-1.5 rounded transition-colors ${
                historyIndex < history.length - 1 ? 'text-slate-700 hover:bg-slate-100 cursor-pointer' : 'text-slate-300 cursor-not-allowed'
              }`}
              title="পুনরাবৃত্তি (Redo - Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Heading Dropdown & Buttons (H1, H2, H3, H4) */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => applyLinePrefix('# ', lang === 'bn' ? 'প্রধান শিরোনাম' : 'Main Heading')}
              className="px-2 py-1 hover:bg-emerald-50 hover:text-emerald-800 rounded text-xs font-black text-slate-800 cursor-pointer transition-colors"
              title="প্রধান শিরোনাম (H1 - Heading 1)"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix('## ', lang === 'bn' ? 'উপ-শিরোনাম' : 'Sub Heading')}
              className="px-2 py-1 hover:bg-emerald-50 hover:text-emerald-800 rounded text-xs font-extrabold text-slate-800 cursor-pointer transition-colors"
              title="উপ-শিরোনাম (H2 - Heading 2)"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix('### ', lang === 'bn' ? 'সেকশন শিরোনাম' : 'Section Heading')}
              className="px-2 py-1 hover:bg-emerald-50 hover:text-emerald-800 rounded text-xs font-bold text-slate-700 cursor-pointer transition-colors"
              title="সেকশন শিরোনাম (H3 - Heading 3)"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix('#### ', lang === 'bn' ? 'ছোট শিরোনাম' : 'Small Heading')}
              className="px-1.5 py-1 hover:bg-emerald-50 hover:text-emerald-800 rounded text-[11px] font-semibold text-slate-600 cursor-pointer transition-colors"
              title="ছোট শিরোনাম (H4 - Heading 4)"
            >
              H4
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix('', '')}
              className="px-2 py-1 hover:bg-slate-100 rounded text-xs font-medium text-slate-600 cursor-pointer transition-colors border-l border-slate-200"
              title="সাধারণ অনুচ্ছেদ / প্যারাগ্রাফ (Normal Text)"
            >
              প্যারা
            </button>
          </div>

          {/* Text Style: Bold, Italic, Underline, Strikethrough, Highlight */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => applyInlineFormatting('**', '**', lang === 'bn' ? 'বোল্ড টেক্সট' : 'Bold text')}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 cursor-pointer transition-colors font-bold"
              title="বোল্ড (Bold - Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyInlineFormatting('*', '*', lang === 'bn' ? 'ইটালিক টেক্সট' : 'Italic text')}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-800 cursor-pointer transition-colors"
              title="ইটালিক (Italic - Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyInlineFormatting('<u>', '</u>', lang === 'bn' ? 'আন্ডারলাইন টেক্সট' : 'Underline text')}
              className="p-1.5 hover:bg-slate-100 rounded text-emerald-700 hover:text-emerald-900 cursor-pointer transition-colors"
              title="আন্ডারলাইন (Underline - Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyInlineFormatting('~~', '~~', lang === 'bn' ? 'কাটা দাগ' : 'Strikethrough')}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="কাটা দাগ (Strikethrough)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyInlineFormatting('==', '==', lang === 'bn' ? 'হাইলাইট টেক্সট' : 'Highlighted text')}
              className="p-1.5 hover:bg-amber-50 rounded text-amber-700 cursor-pointer transition-colors"
              title="হলুদ মার্কার হাইলাইট (Highlight - ==text==)"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyInlineFormatting('<sub>', '</sub>', '২')}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 cursor-pointer transition-colors"
              title="সাবস্ক্রিপ্ট (Subscript - H₂O)"
            >
              <Subscript className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyInlineFormatting('<sup>', '</sup>', '২')}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 cursor-pointer transition-colors"
              title="সুপারস্ক্রিপ্ট (Superscript - x²)"
            >
              <Superscript className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={applyClearFormatting}
              className="p-1.5 hover:bg-rose-50 rounded text-slate-500 hover:text-rose-600 cursor-pointer transition-colors border-l border-slate-200"
              title="ফরম্যাটিং মুছে সাধারণ করুন (Clear Formatting)"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Text Alignment: Left, Center, Right */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => applyAlignment('left')}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="বামপাশে সাজানো (Align Left)"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyAlignment('center')}
              className="p-1.5 hover:bg-emerald-50 hover:text-emerald-800 rounded text-slate-700 cursor-pointer transition-colors"
              title="মাঝখানে সাজানো (Align Center)"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyAlignment('right')}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="ডানপাশে সাজানো (Align Right)"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Colored Badges */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => applyColorBadge('green')}
              className="px-1.5 py-1 hover:bg-emerald-50 rounded text-[10px] font-bold text-emerald-700 cursor-pointer transition-colors"
              title="সবুজ ব্যাজ (Green Badge)"
            >
              সবুজ
            </button>
            <button
              type="button"
              onClick={() => applyColorBadge('amber')}
              className="px-1.5 py-1 hover:bg-amber-50 rounded text-[10px] font-bold text-amber-700 cursor-pointer transition-colors"
              title="হলুদ ব্যাজ (Amber Badge)"
            >
              হলুদ
            </button>
            <button
              type="button"
              onClick={() => applyColorBadge('rose')}
              className="px-1.5 py-1 hover:bg-rose-50 rounded text-[10px] font-bold text-rose-700 cursor-pointer transition-colors"
              title="লাল ব্যাজ (Red Alert Badge)"
            >
              লাল
            </button>
            <button
              type="button"
              onClick={() => applyColorBadge('blue')}
              className="px-1.5 py-1 hover:bg-blue-50 rounded text-[10px] font-bold text-blue-700 cursor-pointer transition-colors"
              title="নীল ব্যাজ (Blue Info Badge)"
            >
              নীল
            </button>
          </div>

          {/* Lists: Bullet, Numbered, Checklist */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => applyLinePrefix('- ', lang === 'bn' ? 'পয়েন্ট' : 'Point')}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="বুলেট তালিকা (Bullet List)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix('1. ', lang === 'bn' ? 'ধাপ' : 'Step')}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="নম্বর তালিকা (Numbered List)"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix('- [ ] ', lang === 'bn' ? 'করণীয় কাজ বা নির্দেশিকা' : 'Task item')}
              className="p-1.5 hover:bg-emerald-50 rounded text-emerald-700 cursor-pointer transition-colors"
              title="চেকলিস্ট / টাস্ক তালিকা (- [ ] Task)"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quotes & Notice Boxes */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => applyLinePrefix('> ', lang === 'bn' ? 'উদ্ধৃতি বা উক্তি লিখুন...' : 'Quote...')}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="উদ্ধৃতি (Blockquote)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(activeModal === 'callout' ? null : 'callout')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                activeModal === 'callout' ? 'bg-amber-100 text-amber-900' : 'text-amber-800 hover:bg-amber-50'
              }`}
              title="নোটিশ / তথ্য বক্স তৈরি করুন"
            >
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>নোটিশ বক্স</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Rich Inserts: Link, Image, Table, FAQ, HR, Code */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveModal(activeModal === 'link' ? null : 'link')}
              className={`p-1.5 rounded cursor-pointer transition-colors ${
                activeModal === 'link' ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="লিংক যোগ করুন (Link)"
            >
              <Link2 className="w-3.5 h-3.5 text-emerald-600" />
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(activeModal === 'image' ? null : 'image')}
              className={`p-1.5 rounded cursor-pointer transition-colors ${
                activeModal === 'image' ? 'bg-blue-100 text-blue-900' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="ছবি যোগ করুন (Upload or Image URL)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(activeModal === 'table' ? null : 'table')}
              className={`p-1.5 rounded cursor-pointer transition-colors ${
                activeModal === 'table' ? 'bg-purple-100 text-purple-900' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="ছক / টেবিল তৈরি করুন (Table)"
            >
              <Table className="w-3.5 h-3.5 text-purple-600" />
            </button>
            <button
              type="button"
              onClick={handleInsertFAQ}
              className="p-1.5 hover:bg-slate-100 rounded text-indigo-700 cursor-pointer transition-colors"
              title="FAQ বা বিস্তারযোগ্য প্রশ্ন-উত্তর (Accordion)"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertRawSnippet('\n---\n')}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="বিভাজক রেখা (Horizontal Divider)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertRawSnippet('\n```\n// কোড বা বিশেষ তথ্য এখানে দিন\n```\n')}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 cursor-pointer transition-colors"
              title="কোড ব্লক (Code Block)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Action Controls: Write / Preview / Split & Fullscreen */}
        <div className="flex items-center gap-1.5">
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

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shadow-2xs cursor-pointer transition-colors"
            title={isFullscreen ? 'সাধারণ পর্দায় ফিরুন' : 'ফুলস্ক্রিন মোড'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-emerald-700" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Interactive Popover Modal: Link Dialog */}
      {activeModal === 'link' && (
        <div className="bg-emerald-50/90 border-b border-emerald-200 p-3 flex flex-wrap items-center gap-2 animate-fadeIn text-xs">
          <span className="font-bold text-emerald-900 flex items-center gap-1">
            <Link2 className="w-3.5 h-3.5" />
            <span>লিংক সন্নিবেশ:</span>
          </span>
          <input
            type="text"
            placeholder="লিংকের দৃশ্যমান শিরোনাম (যেমন: সময়সূচী দেখুন)"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-slate-800 flex-1 min-w-[160px] focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="https://amarmetro.com/..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-slate-800 font-mono flex-1 min-w-[200px] focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleInsertLink}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer transition-colors"
          >
            যুক্ত করুন
          </button>
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interactive Popover Modal: Image Dialog */}
      {activeModal === 'image' && (
        <div className="bg-blue-50/95 border-b border-blue-200 p-3 space-y-2 animate-fadeIn text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-950 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>আর্টিকেলে ছবি যোগ করুন</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="p-1 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">
                ছবি নির্বাচন বা আপলোড (কম্পিউটার/মোবাইল):
              </label>
              <label className="flex items-center justify-center gap-2 p-2 bg-white border border-blue-300 border-dashed rounded-lg text-blue-800 font-semibold cursor-pointer hover:bg-blue-50/50 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingImage ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে ফাইল বেছে নিন'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadDirect}
                  disabled={isUploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">
                অথবা ছবির সরাসরি ওয়েব লিংক (URL):
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-2.5 py-2 bg-white border border-blue-300 rounded-lg text-slate-800 font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="ছবির ক্যাপশন বা বিবরণ (যেমন: দিয়াবাড়ি মেট্রোরেল ডিপো)"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-800 flex-1 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleInsertImage}
              disabled={!imageUrl.trim() || isUploadingImage}
              className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-lg cursor-pointer transition-colors"
            >
              আর্টিকেলে সন্নিবেশ করুন
            </button>
          </div>
        </div>
      )}

      {/* Interactive Popover Modal: Table Dialog */}
      {activeModal === 'table' && (
        <div className="bg-purple-50/95 border-b border-purple-200 p-3 space-y-3 animate-fadeIn text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-950 flex items-center gap-1.5">
              <Table className="w-4 h-4 text-purple-600" />
              <span>ছক বা টেবিল তৈরি করুন</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="p-1 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 font-semibold">কলাম সংখ্যা:</span>
              <input
                type="number"
                min={2}
                max={6}
                value={tableCols}
                onChange={(e) => setTableCols(Math.max(2, Math.min(6, parseInt(e.target.value) || 2)))}
                className="w-14 px-2 py-1 bg-white border border-purple-300 rounded text-center font-bold"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-700 font-semibold">সারি (Rows):</span>
              <input
                type="number"
                min={1}
                max={15}
                value={tableRows}
                onChange={(e) => setTableRows(Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))}
                className="w-14 px-2 py-1 bg-white border border-purple-300 rounded text-center font-bold"
              />
            </div>

            <button
              type="button"
              onClick={handleInsertTable}
              className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg cursor-pointer transition-colors"
            >
              টেবিল যোগ করুন
            </button>

            <span className="text-slate-400">|</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-medium">প্রস্তুত ছক:</span>
              <button
                type="button"
                onClick={() => handleInsertPresetTable('schedule')}
                className="px-2 py-1 bg-white border border-purple-200 hover:bg-purple-100 text-purple-800 rounded font-semibold cursor-pointer"
              >
                মেট্রো সময়সূচি
              </button>
              <button
                type="button"
                onClick={() => handleInsertPresetTable('fare')}
                className="px-2 py-1 bg-white border border-purple-200 hover:bg-purple-100 text-purple-800 rounded font-semibold cursor-pointer"
              >
                ভাড়া তালিকা
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Popover Modal: Callout Selection */}
      {activeModal === 'callout' && (
        <div className="bg-amber-50/95 border-b border-amber-200 p-3 flex flex-wrap items-center gap-2 animate-fadeIn text-xs">
          <span className="font-bold text-amber-950 mr-2">নোটিশ বক্সের ধরন নির্বাচন করুন:</span>
          <button
            type="button"
            onClick={() => handleInsertCallout('info')}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg font-bold border border-blue-200 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-blue-700" />
            <span>💡 তথ্য বক্স (Info)</span>
          </button>

          <button
            type="button"
            onClick={() => handleInsertCallout('warning')}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold border border-amber-200 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>⚠️ সতর্কতা বক্স (Warning)</span>
          </button>

          <button
            type="button"
            onClick={() => handleInsertCallout('success')}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-bold border border-emerald-200 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>✅ সুখবর / সাফল্য (Success)</span>
          </button>

          <button
            type="button"
            onClick={() => handleInsertCallout('danger')}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg font-bold border border-rose-200 cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>🚨 জরুরি নোটিশ (Alert)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="p-1 ml-auto text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className={`relative ${isFullscreen ? 'flex-1 overflow-hidden' : ''}`}>
        {viewMode === 'write' && (
          <textarea
            ref={textareaRef}
            rows={isFullscreen ? undefined : minRows}
            value={value}
            onChange={(e) => pushToHistory(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              placeholder ||
              (lang === 'bn'
                ? `# পোস্টের প্রধান শিরোনাম\n\n## প্রথম সেকশন\nএখানে আপনার পোস্টের বিস্তারিত লিখুন। যেকোনো লাইন বা শব্দ সিলেক্ট করে উপরের **Bold**, *Italic*, <u>Underline</u>, H1/H2 বা নোটিশ বক্সে ক্লিক করলেই সরাসরি ফরম্যাট হয়ে যাবে।\n\n> 💡 [!INFO] **জরুরি নোট:** মেট্রোরেল যাত্রীদের জন্য এমআরটি পাসে ১০% ডিসকাউন্ট রেট প্রযোজ্য।\n\n- পয়েন্ট ১\n- পয়েন্ট ২\n\n- [ ] করণীয় কাজ ১\n- [x] সম্পন্ন কাজ ২`
                : 'Write your article here...')
            }
            className={`w-full p-4 sm:p-5 text-sm font-mono text-slate-900 bg-white leading-relaxed focus:outline-hidden ${
              isFullscreen ? 'h-full resize-none' : 'min-h-[340px] resize-y'
            }`}
            required
          />
        )}

        {viewMode === 'preview' && (
          <div
            className={`p-6 sm:p-8 bg-slate-50/80 overflow-y-auto ${
              isFullscreen ? 'h-full' : 'min-h-[340px] max-h-[640px]'
            }`}
          >
            {value.trim() ? (
              <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
                {renderRichContent(value)}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs italic">
                {lang === 'bn'
                  ? 'বামে এডিটরে কিছু লিখলে এখানে লাইভ ফরম্যাটেড প্রিভিউ দেখা যাবে।'
                  : 'Live preview will appear here as you type.'}
              </div>
            )}
          </div>
        )}

        {viewMode === 'split' && (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 ${
              isFullscreen ? 'h-full' : 'min-h-[400px]'
            }`}
          >
            <div className="p-0 h-full">
              <textarea
                ref={textareaRef}
                rows={isFullscreen ? undefined : minRows}
                value={value}
                onChange={(e) => pushToHistory(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full p-4 sm:p-5 text-sm font-mono text-slate-900 bg-white leading-relaxed focus:outline-hidden resize-none ${
                  isFullscreen ? 'h-full' : 'min-h-[400px] h-full'
                }`}
                required
              />
            </div>
            <div
              className={`p-5 sm:p-6 bg-slate-50/80 overflow-y-auto ${
                isFullscreen ? 'h-full' : 'max-h-[600px] min-h-[400px]'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{lang === 'bn' ? 'লাইভ প্রিভিউ (Live Preview)' : 'Live Preview'}</span>
              </div>
              {value.trim() ? (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                  {renderRichContent(value)}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs italic">
                  {lang === 'bn' ? 'বামে টাইপ করলে এখানে লাইভ ফলাফল দেখতে পাবেন...' : 'Type on the left...'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar with Word/Char counts & formatting guide */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 select-none">
        <div className="flex items-center gap-3">
          <span>
            {lang === 'bn' ? 'শব্দ:' : 'Words:'} <strong className="text-slate-800">{wordCount}</strong>
          </span>
          <span>·</span>
          <span>
            {lang === 'bn' ? 'অক্ষর:' : 'Chars:'} <strong className="text-slate-800">{charCount}</strong>
          </span>
          <span>·</span>
          <span>
            {lang === 'bn' ? 'পড়ার সময়:' : 'Est. Read:'}{' '}
            <strong className="text-emerald-700 font-bold">~{readTimeEst} {lang === 'bn' ? 'মিনিট' : 'min'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>H1-H4 · বোল্ড · আন্ডারলাইন · নোটিশ · টেবিল · টাস্কলিস্ট কার্যকর</span>
        </div>
      </div>
    </div>
  );
};


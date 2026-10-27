import React from 'react';
import { ExternalLink, Info, CheckCircle2 } from 'lucide-react';

/**
 * Parses inline formatting:
 * **bold**, *italic*, <u>underline</u>, ~~strike~~, [text](url), `code`, ==highlight==
 */
export function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return '';

  // We split by combined markdown inline tokens
  // Matches:
  // 1. Links: [text](url)
  // 2. Bold: **text** or __text__
  // 3. Italic: *text* or _text_
  // 4. Underline: <u>text</u> or ++text++
  // 5. Strikethrough: ~~text~~ or <del>text</del>
  // 6. Inline code: `code`
  // 7. Highlight: ==text== or <mark>text</mark>

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  // Regex pattern matching any of the inline elements
  const pattern = /(!?\[(.*?)\]\((.*?)\))|(\*\*(.*?)\*\*)|(__([^_]+)__)|(<u>(.*?)<\/u>)|(\+\+(.*?)\+\+)|(~~(.*?)~~)|(<del>(.*?)<\/del>)|(==(.*?)==)|(<mark>(.*?)<\/mark>)|(`(.*?)`)|(<sub>(.*?)<\/sub>)|(<sup>(.*?)<\/sup>)|(<span\s+class="badge-(green|amber|rose|blue)">(.*?)<\/span>)|(\*(.*?)\*)|(_([^_]+)_)/;

  while (remaining.length > 0) {
    const match = remaining.match(pattern);
    if (!match || match.index === undefined) {
      parts.push(remaining);
      break;
    }

    // Push preceding plain text
    if (match.index > 0) {
      parts.push(remaining.substring(0, match.index));
    }

    const matchedStr = match[0];

    // Check link or image
    if (matchedStr.startsWith('[') && matchedStr.includes('](')) {
      const linkMatch = matchedStr.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkHref = linkMatch[2];
        parts.push(
          <a
            key={`link-${keyIndex++}`}
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-800 underline font-semibold inline-flex items-center gap-0.5 transition-colors"
          >
            <span>{linkText}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
        );
      } else {
        parts.push(matchedStr);
      }
    }
    // Bold: **text** or __text__
    else if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      const inner = matchedStr.slice(2, -2);
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-bold text-slate-900">
          {renderInlineMarkdown(inner)}
        </strong>
      );
    } else if (matchedStr.startsWith('__') && matchedStr.endsWith('__')) {
      const inner = matchedStr.slice(2, -2);
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-bold text-slate-900">
          {renderInlineMarkdown(inner)}
        </strong>
      );
    }
    // Underline: <u>text</u> or ++text++
    else if (matchedStr.startsWith('<u>') && matchedStr.endsWith('</u>')) {
      const inner = matchedStr.slice(3, -4);
      parts.push(
        <u key={`u-${keyIndex++}`} className="underline decoration-emerald-600 underline-offset-3 decoration-1">
          {renderInlineMarkdown(inner)}
        </u>
      );
    } else if (matchedStr.startsWith('++') && matchedStr.endsWith('++')) {
      const inner = matchedStr.slice(2, -2);
      parts.push(
        <u key={`u-${keyIndex++}`} className="underline decoration-emerald-600 underline-offset-3 decoration-1">
          {renderInlineMarkdown(inner)}
        </u>
      );
    }
    // Strikethrough: ~~text~~ or <del>text</del>
    else if (matchedStr.startsWith('~~') && matchedStr.endsWith('~~')) {
      const inner = matchedStr.slice(2, -2);
      parts.push(
        <del key={`del-${keyIndex++}`} className="line-through text-slate-400">
          {renderInlineMarkdown(inner)}
        </del>
      );
    } else if (matchedStr.startsWith('<del>') && matchedStr.endsWith('</del>')) {
      const inner = matchedStr.slice(5, -6);
      parts.push(
        <del key={`del-${keyIndex++}`} className="line-through text-slate-400">
          {renderInlineMarkdown(inner)}
        </del>
      );
    }
    // Highlight: ==text== or <mark>text</mark>
    else if (matchedStr.startsWith('==') && matchedStr.endsWith('==')) {
      const inner = matchedStr.slice(2, -2);
      parts.push(
        <mark key={`mark-${keyIndex++}`} className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-medium">
          {renderInlineMarkdown(inner)}
        </mark>
      );
    } else if (matchedStr.startsWith('<mark>') && matchedStr.endsWith('</mark>')) {
      const inner = matchedStr.slice(6, -7);
      parts.push(
        <mark key={`mark-${keyIndex++}`} className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-medium">
          {renderInlineMarkdown(inner)}
        </mark>
      );
    }
    // Inline Code: `text`
    else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
      const inner = matchedStr.slice(1, -1);
      parts.push(
        <code key={`code-${keyIndex++}`} className="bg-slate-100 text-emerald-800 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200">
          {inner}
        </code>
      );
    }
    // Subscript: <sub>text</sub>
    else if (matchedStr.startsWith('<sub>') && matchedStr.endsWith('</sub>')) {
      const inner = matchedStr.slice(5, -6);
      parts.push(
        <sub key={`sub-${keyIndex++}`} className="text-[10px] text-slate-700 font-semibold align-sub">
          {renderInlineMarkdown(inner)}
        </sub>
      );
    }
    // Superscript: <sup>text</sup>
    else if (matchedStr.startsWith('<sup>') && matchedStr.endsWith('</sup>')) {
      const inner = matchedStr.slice(5, -6);
      parts.push(
        <sup key={`sup-${keyIndex++}`} className="text-[10px] text-emerald-800 font-bold align-super">
          {renderInlineMarkdown(inner)}
        </sup>
      );
    }
    // Colored Badges: <span class="badge-green|amber|rose|blue">text</span>
    else if (matchedStr.startsWith('<span class="badge-') && matchedStr.endsWith('</span>')) {
      const badgeMatch = matchedStr.match(/^<span class="badge-(green|amber|rose|blue)">(.*?)<\/span>$/);
      if (badgeMatch) {
        const color = badgeMatch[1];
        const inner = badgeMatch[2];
        const colorClasses: Record<string, string> = {
          green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          amber: 'bg-amber-100 text-amber-900 border-amber-200',
          rose: 'bg-rose-100 text-rose-800 border-rose-200',
          blue: 'bg-blue-100 text-blue-800 border-blue-200',
        };
        parts.push(
          <span
            key={`badge-${keyIndex++}`}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${colorClasses[color] || colorClasses.green} mx-0.5 shadow-2xs`}
          >
            {renderInlineMarkdown(inner)}
          </span>
        );
      } else {
        parts.push(matchedStr);
      }
    }
    // Italic: *text* or _text_
    else if ((matchedStr.startsWith('*') && matchedStr.endsWith('*')) || (matchedStr.startsWith('_') && matchedStr.endsWith('_'))) {
      const inner = matchedStr.slice(1, -1);
      parts.push(
        <em key={`em-${keyIndex++}`} className="italic text-slate-800">
          {renderInlineMarkdown(inner)}
        </em>
      );
    } else {
      parts.push(matchedStr);
    }

    remaining = remaining.substring(match.index + matchedStr.length);
  }

  return parts;
}

/**
 * Full Article Markdown / Rich Text Renderer
 * Supports H1, H2, H3, H4, Bullet Lists, Numbered Lists, Quotes,
 * Callout Boxes, Tables, Images, Horizontal Rules, and Code Blocks.
 */
export function renderRichContent(content: string): React.ReactNode {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let index = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Empty lines
    if (!trimmed) {
      elements.push(<div key={`spacer-${index++}`} className="h-3" />);
      continue;
    }

    // 2. Horizontal Divider: --- or ***
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      elements.push(<hr key={`hr-${index++}`} className="my-6 border-slate-200" />);
      continue;
    }

    // 3. Headings: H1, H2, H3, H4
    if (rawLine.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${index++}`} className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-8 mb-4 border-b border-slate-100 pb-2 leading-tight">
          {renderInlineMarkdown(rawLine.replace(/^#\s+/, ''))}
        </h1>
      );
      continue;
    }
    if (rawLine.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${index++}`} className="text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-3 flex items-center gap-2 leading-snug">
          <span className="w-1.5 h-5 bg-emerald-600 rounded-xs inline-block shrink-0"></span>
          <span>{renderInlineMarkdown(rawLine.replace(/^##\s+/, ''))}</span>
        </h2>
      );
      continue;
    }
    if (rawLine.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${index++}`} className="text-lg font-bold text-slate-900 mt-5 mb-2 leading-normal">
          {renderInlineMarkdown(rawLine.replace(/^###\s+/, ''))}
        </h3>
      );
      continue;
    }
    if (rawLine.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${index++}`} className="text-base font-bold text-slate-800 mt-4 mb-1.5">
          {renderInlineMarkdown(rawLine.replace(/^####\s+/, ''))}
        </h4>
      );
      continue;
    }

    // 4. Embedded Image: ![alt](url)
    if (trimmed.startsWith('![') && trimmed.includes('](')) {
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const src = imgMatch[2];
        elements.push(
          <figure key={`img-${index++}`} className="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
            <img src={src} alt={alt} className="w-full max-h-[450px] object-cover" loading="lazy" decoding="async" />
            {alt && (
              <figcaption className="text-center text-xs text-slate-500 py-2 px-4 italic bg-slate-50 border-t border-slate-100">
                {alt}
              </figcaption>
            )}
          </figure>
        );
        continue;
      }
    }

    // 5. Code Block: ```
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={`codeblock-${index++}`} className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto my-4 border border-slate-800">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // 6. Blockquote or Callout: >
    if (rawLine.startsWith('>')) {
      const quoteLines: string[] = [rawLine.replace(/^>\s?/, '')];
      while (i + 1 < lines.length && lines[i + 1].startsWith('>')) {
        i++;
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
      }
      const fullQuote = quoteLines.join(' ');
      const lower = fullQuote.toLowerCase();
      
      const isWarning = lower.includes('[!warning]') || fullQuote.includes('⚠️') || lower.includes('সতর্কতা:');
      const isSuccess = lower.includes('[!success]') || fullQuote.includes('✅') || lower.includes('সফল:');
      const isDanger = lower.includes('[!danger]') || lower.includes('[!alert]') || fullQuote.includes('🚨') || lower.includes('জরুরি:');
      const isInfo = lower.includes('[!info]') || fullQuote.includes('💡') || lower.includes('নোট:') || lower.includes('তথ্য:');

      let calloutClass = 'bg-slate-50 border-slate-400 text-slate-700 italic';
      let iconColor = 'text-slate-500';
      let icon = null;

      if (isDanger) {
        calloutClass = 'bg-rose-50/80 border-rose-500 text-rose-950 font-medium';
        iconColor = 'text-rose-600';
        icon = <span className="text-base leading-none shrink-0">🚨</span>;
      } else if (isWarning) {
        calloutClass = 'bg-amber-50/80 border-amber-500 text-amber-950 font-medium';
        iconColor = 'text-amber-600';
        icon = <span className="text-base leading-none shrink-0">⚠️</span>;
      } else if (isSuccess) {
        calloutClass = 'bg-emerald-50/80 border-emerald-600 text-emerald-950 font-medium';
        iconColor = 'text-emerald-600';
        icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      } else if (isInfo) {
        calloutClass = 'bg-blue-50/80 border-blue-500 text-blue-950 font-medium';
        iconColor = 'text-blue-600';
        icon = <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
      }

      const cleanText = fullQuote
        .replace(/\[!(INFO|WARNING|SUCCESS|DANGER|ALERT)\]/gi, '')
        .trim();

      elements.push(
        <blockquote
          key={`quote-${index++}`}
          className={`my-4 p-4 rounded-xl border-l-4 leading-relaxed ${calloutClass}`}
        >
          <div className="flex items-start gap-2.5">
            {icon}
            <div className="text-sm flex-1">
              {renderInlineMarkdown(cleanText)}
            </div>
          </div>
        </blockquote>
      );
      continue;
    }

    // 7. Details / Accordion: <details><summary>Q</summary>A</details>
    if (trimmed.startsWith('<details') || trimmed.includes('<summary>')) {
      let detailsContent = rawLine;
      while (i + 1 < lines.length && !lines[i].includes('</details>')) {
        i++;
        detailsContent += '\n' + lines[i];
      }
      const summaryMatch = detailsContent.match(/<summary>(.*?)<\/summary>/is);
      const summaryText = summaryMatch ? summaryMatch[1].trim() : 'বিস্তারিত দেখুন';
      const bodyText = detailsContent.replace(/<details.*?>/i, '').replace(/<\/details>/i, '').replace(/<summary>.*?<\/summary>/is, '').trim();

      elements.push(
        <details key={`details-${index++}`} className="my-4 rounded-xl border border-slate-200 bg-white overflow-hidden group shadow-2xs">
          <summary className="p-3.5 sm:p-4 font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center justify-between text-sm select-none transition-colors">
            <span>{summaryText}</span>
            <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="p-4 text-sm text-slate-700 border-t border-slate-100 bg-white leading-relaxed">
            {renderRichContent(bodyText)}
          </div>
        </details>
      );
      continue;
    }

    // 8. Table handling: | Col 1 | Col 2 |
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < lines.length && lines[i + 1].includes('|-')) {
      const headers = trimmed.split('|').filter(c => c.trim().length > 0).map(c => c.trim());
      i += 2; // skip header and divider line
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const rowCells = lines[i].trim().split('|').filter(c => c.trim().length > 0).map(c => c.trim());
        rows.push(rowCells);
        i++;
      }
      i--; // adjust loop step

      elements.push(
        <div key={`table-${index++}`} className="overflow-x-auto my-5 rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                {headers.map((h, hIdx) => (
                  <th key={hIdx} className="p-3 font-bold text-slate-900">
                    {renderInlineMarkdown(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((r, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                  {r.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 text-slate-700">
                      {renderInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 9. Checklist Task item: - [ ] or - [x]
    if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ') || trimmed.startsWith('* [ ] ') || trimmed.startsWith('* [x] ')) {
      const isChecked = trimmed.startsWith('- [x] ') || trimmed.startsWith('* [x] ');
      const text = trimmed.substring(6);
      elements.push(
        <div key={`task-${index++}`} className="flex items-start gap-2.5 my-1.5 text-sm">
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="w-4 h-4 rounded text-emerald-600 focus:ring-0 mt-0.5 cursor-default pointer-events-none"
          />
          <span className={`text-slate-700 leading-snug ${isChecked ? 'line-through text-slate-400' : ''}`}>
            {renderInlineMarkdown(text)}
          </span>
        </div>
      );
      continue;
    }

    // 10. Bullet List: - item or * item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems: string[] = [trimmed.substring(2)];
      while (i + 1 < lines.length && (lines[i + 1].trim().startsWith('- ') || lines[i + 1].trim().startsWith('* '))) {
        // Skip task items
        if (lines[i + 1].trim().startsWith('- [') || lines[i + 1].trim().startsWith('* [')) break;
        i++;
        listItems.push(lines[i].trim().substring(2));
      }

      elements.push(
        <ul key={`ul-${index++}`} className="my-3 space-y-1.5 ml-1">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 11. Numbered List: 1. item
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = [trimmed.replace(/^\d+\.\s/, '')];
      while (i + 1 < lines.length && /^\d+\.\s/.test(lines[i + 1].trim())) {
        i++;
        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
      }

      elements.push(
        <ol key={`ol-${index++}`} className="my-3 space-y-1.5 ml-2 list-decimal list-inside text-sm text-slate-700 leading-relaxed font-medium">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="text-slate-700 leading-relaxed">
              <span className="font-normal">{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 12. Standard Paragraph
    elements.push(
      <p key={`p-${index++}`} className="text-slate-700 leading-relaxed text-sm sm:text-base my-2">
        {renderInlineMarkdown(rawLine)}
      </p>
    );
  }

  return <div className="rich-article-content space-y-1">{elements}</div>;
}

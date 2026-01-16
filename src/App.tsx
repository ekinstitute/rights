import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { QRCodeSVG } from 'qrcode.react';

// Import all markdown files at build time
const contentModules = import.meta.glob('/content/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
});

interface ContentMeta {
  language: string;
  languageName: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
}

interface ParsedContent {
  meta: ContentMeta;
  content: string;
}

// Simple frontmatter parser
function parseFrontmatter(raw: string): ParsedContent {
  const lines = raw.split('\n');
  let inFrontmatter = false;
  let frontmatterEnd = 0;
  const metaLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
      } else {
        frontmatterEnd = i + 1;
        break;
      }
    } else if (inFrontmatter) {
      metaLines.push(lines[i]);
    }
  }

  const meta: Record<string, string> = {};
  for (const line of metaLines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      meta[key] = value;
    }
  }

  return {
    meta: meta as unknown as ContentMeta,
    content: lines.slice(frontmatterEnd).join('\n').trim(),
  };
}

// Load and parse all content
function loadAllContent(): Map<string, ParsedContent> {
  const contentMap = new Map<string, ParsedContent>();

  for (const [path, raw] of Object.entries(contentModules)) {
    const langCode = path.replace('/content/', '').replace('.md', '');
    const parsed = parseFrontmatter(raw as string);
    contentMap.set(langCode, parsed);
  }

  return contentMap;
}

function App() {
  const [allContent] = useState(() => loadAllContent());
  const [currentLang, setCurrentLang] = useState(() => {
    // Check URL parameter first (for QR code links)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && allContent.has(urlLang)) return urlLang;

    // Check localStorage
    const saved = localStorage.getItem('preferred-language');
    if (saved && allContent.has(saved)) return saved;

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (allContent.has(browserLang)) return browserLang;

    return 'en';
  });

  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const content = allContent.get(currentLang) || allContent.get('en')!;

  // Sort languages: English first, then alphabetically by native name
  const languages = Array.from(allContent.entries())
    .map(([code, data]) => ({
      code,
      name: data.meta.languageName,
    }))
    .sort((a, b) => {
      if (a.code === 'en') return -1;
      if (b.code === 'en') return 1;
      return a.name.localeCompare(b.name);
    });

  // Generate the URL for sharing/QR
  const getShareUrl = () => {
    const base = window.location.origin + window.location.pathname;
    return currentLang === 'en' ? base : `${base}?lang=${currentLang}`;
  };

  // Announce to screen readers
  const announce = (message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  };

  // Copy URL to clipboard
  const handleShare = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      announce('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      announce('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle language change with announcement
  const handleLanguageChange = (newLang: string) => {
    const langName = allContent.get(newLang)?.meta.languageName || newLang;
    setCurrentLang(newLang);
    announce(`Language changed to ${langName}`);
  };

  useEffect(() => {
    localStorage.setItem('preferred-language', currentLang);
    document.documentElement.lang = currentLang;

    // Update URL without reload (for sharing)
    const url = new URL(window.location.href);
    if (currentLang === 'en') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', currentLang);
    }
    window.history.replaceState({}, '', url.toString());
  }, [currentLang]);

  // Reset QR view after printing
  useEffect(() => {
    const handleAfterPrint = () => setShowQR(false);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:static print:border-0" role="banner">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <a
            href={window.location.pathname}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
            aria-label="Go to home page"
          >
            <div className="bg-blue-600 rounded-lg p-2" aria-hidden="true">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <span className="font-semibold text-slate-900 hidden sm:block">
              {content.meta.title}
            </span>
          </a>

          <nav className="flex items-center gap-2 sm:gap-3 print:hidden" role="navigation" aria-label="Main navigation">
            {/* Language Selector */}
            <label htmlFor="language-select" className="sr-only">Select language</label>
            <select
              id="language-select"
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg py-2 px-2 sm:px-3 text-slate-700 font-medium cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            >
              {languages.map(({ code, name }) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={copied ? 'Link copied!' : 'Copy link to share'}
              title={copied ? 'Link copied!' : 'Copy link to share'}
            >
              {copied ? (
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              )}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
            </button>

            {/* Print Doc Button */}
            <button
              onClick={() => { setShowQR(false); setTimeout(() => window.print(), 100); }}
              className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Print document"
              title="Print document"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Print QR Button */}
            <button
              onClick={() => { setShowQR(true); setTimeout(() => window.print(), 100); }}
              className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Print QR code"
              title="Print QR code"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="3" height="3"/>
                <rect x="18" y="14" width="3" height="3"/>
                <rect x="14" y="18" width="3" height="3"/>
                <rect x="18" y="18" width="3" height="3"/>
              </svg>
              <span className="hidden sm:inline">QR</span>
            </button>
          </nav>
        </div>
      </header>

      {/* QR Code Print View */}
      {showQR && (
        <div className="hidden print:flex print:flex-col print:items-center print:justify-center print:min-h-screen print:py-8" role="img" aria-label={`QR code linking to ${content.meta.languageName} version`}>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{content.meta.title}</h1>
          <p className="text-lg text-slate-600 mb-8">{content.meta.languageName}</p>
          <QRCodeSVG value={getShareUrl()} size={280} level="M" />
          <p className="mt-6 text-sm text-slate-500 break-all max-w-xs text-center">{getShareUrl()}</p>
        </div>
      )}

      {/* Main Content */}
      <main
        id="main-content"
        className={`max-w-3xl mx-auto px-4 py-8 ${showQR ? 'print:hidden' : ''}`}
        role="main"
        tabIndex={-1}
      >
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            {content.meta.title}
          </h1>
          <p className="text-lg text-slate-600">
            {content.meta.subtitle}
          </p>
          {content.meta.lastUpdated && (
            <p className="text-sm text-slate-500 mt-2">
              <time dateTime={content.meta.lastUpdated}>
                Last updated: {new Date(content.meta.lastUpdated).toLocaleDateString(currentLang, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </p>
          )}
        </div>

        {/* Markdown Content */}
        <article
          className="prose prose-slate prose-lg max-w-none
            prose-headings:text-slate-900
            prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-200
            prose-p:text-slate-700 prose-p:leading-relaxed
            prose-li:text-slate-700
            prose-strong:text-slate-900
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-hr:border-slate-200 prose-hr:my-8
            [&>ul]:space-y-2 [&>ul]:my-4
            [&_li]:marker:text-blue-500
          "
          aria-label="Rights information"
        >
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content.content}</ReactMarkdown>
        </article>
      </main>

      {/* Footer */}
      <footer
        className={`bg-slate-800 text-slate-400 py-6 mt-12 print:bg-white print:text-slate-500 print:mt-4 print:py-4 print:border-t ${showQR ? 'print:hidden' : ''}`}
        role="contentinfo"
      >
        <div className="max-w-3xl mx-auto px-4 text-center text-sm">
          <p>Built for community mutual aid.</p>
          <p className="mt-2 text-slate-500 print:hidden">
            <a
              href="https://github.com/ekinstitute/rights"
              className="hover:text-slate-300 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contribute translations on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

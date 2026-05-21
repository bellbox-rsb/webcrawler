import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Globe, 
  Sliders, 
  Sparkles, 
  Layers, 
  Search, 
  ExternalLink, 
  Copy, 
  Save, 
  Check, 
  Info, 
  FileCode, 
  Eye, 
  ChevronRight, 
  List, 
  Palette, 
  Type, 
  Image as ImageIcon,
  Send,
  Loader2
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Slider } from './components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from './components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from './components/ui/tooltip';
import { cn } from './lib/utils';
import { getTechBadgeUrl } from './lib/techBadges';

// Color Role Classifier Heuristics
const hexToRgb = (hex) => {
  if (!hex) return { r: 0, g: 0, b: 0 };
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
};

const classifyColors = (colorsMap) => {
  const primary = [];
  const secondary = [];
  const accent = [];
  const backgrounds = [];
  const texts = [];

  if (!colorsMap) return { primary, secondary, accent, backgrounds, texts };

  const list = Object.entries(colorsMap)
    .map(([color, frequency]) => ({ color, frequency }))
    .sort((a, b) => b.frequency - a.frequency);

  list.forEach(item => {
    const rgb = hexToRgb(item.color);
    const max = Math.max(rgb.r, rgb.g, rgb.b);
    const min = Math.min(rgb.r, rgb.g, rgb.b);
    const saturation = max - min;
    const isSaturated = saturation > 30;
    const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;

    if (isSaturated) {
      accent.push(item);
    } else if (luminance < 60 || luminance > 220) {
      backgrounds.push(item);
    } else {
      texts.push(item);
    }
  });

  accent.sort((a, b) => b.frequency - a.frequency);
  if (accent.length > 0) {
    primary.push(accent.shift());
  }
  if (accent.length > 0) {
    secondary.push(accent.shift());
  }

  return { primary, secondary, accent, backgrounds, texts };
};

export default function App() {
  // App Input State
  const [targetUrl, setTargetUrl] = useState('https://example.com');
  const [crawlDepth, setCrawlDepth] = useState(0);
  const [maxPages, setMaxPages] = useState(1);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // App Async State
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlingProgress, setCrawlingProgress] = useState(0);
  const [crawlingStatusText, setCrawlingStatusText] = useState('');
  const [crawledData, setCrawledData] = useState(null);

  // Navigation & Export Views State
  const [activeTab, setActiveTab] = useState('overview-tab');
  const [exportFormat, setExportFormat] = useState('design-md');
  const [exportViewMode, setExportViewMode] = useState('code'); // 'code' or 'preview'

  // Sync / Stitch Settings
  const [stitchProjectId, setStitchProjectId] = useState('');
  const [stitchScreenId, setStitchScreenId] = useState('');
  const [stitchSyncStatus, setStitchSyncStatus] = useState('');

  // UI Interactive Dialogs State
  const [selectedPage, setSelectedPage] = useState(null);
  const [lightboxAsset, setLightboxAsset] = useState(null);
  const [pagesSearch, setPagesSearch] = useState('');
  const [assetFilter, setAssetFilter] = useState('all');

  // Copy indicators
  const [copiedColor, setCopiedColor] = useState(null);
  const [copiedExport, setCopiedExport] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  
  const handleCopyMarkdown = useCallback((text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    });
  }, []);
  
  // Custom Toast State
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Sync pages/depth controls
  useEffect(() => {
    if (crawlDepth === 0) {
      setMaxPages(1);
    }
  }, [crawlDepth]);

  // Color Classification Memo
  const colorGroups = useMemo(() => {
    if (!crawledData?.tokens?.colors) {
      return { primary: [], secondary: [], accent: [], backgrounds: [], texts: [] };
    }
    return classifyColors(crawledData.tokens.colors);
  }, [crawledData]);

  // Exporter specs generators
  const generatedFiles = useMemo(() => {
    if (!crawledData) return { designMd: '', tailwindConfig: '', cssVariables: '' };

    const groups = colorGroups;
    const fonts = Object.keys(crawledData.tokens.fonts || {}).slice(0, 3);
    const sizes = Object.keys(crawledData.tokens.fontSizes || {}).slice(0, 6);
    const weights = Object.keys(crawledData.tokens.fontWeights || {}).slice(0, 4);
    const spacings = Object.keys(crawledData.tokens.spacing || {}).slice(0, 8);
    const assets = (crawledData.assets?.images || []).slice(0, 5);

    // 1. DESIGN.md
    let md = `# Design System Specification\n\n`;
    md += `Auto-generated from crawls of **${targetUrl}** on ${new Date().toLocaleDateString()}.\n\n`;
    md += `## Color System (Role-Based Grouping)\n\n`;
    md += `Below are the color tokens classified by their designated styling roles:\n\n`;

    if (groups.primary.length > 0) {
      md += `### Primary Brand Colors\n`;
      md += `*Core brand identity tokens used for dominant elements and primary interactive components.*\n\n`;
      groups.primary.forEach((c, i) => md += `- **Primary ${i + 1}**: \`${c.color}\` (Frequency: ${c.frequency}x)\n`);
      md += `\n`;
    }
    if (groups.secondary.length > 0) {
      md += `### Secondary Brand Colors\n`;
      md += `*Supporting colors used for hover elements, active badges, and visual layouts.*\n\n`;
      groups.secondary.forEach((c, i) => md += `- **Secondary ${i + 1}**: \`${c.color}\` (Frequency: ${c.frequency}x)\n`);
      md += `\n`;
    }
    if (groups.accent.length > 0) {
      md += `### Visual Accents\n`;
      md += `*Vibrant highlights and indicator tokens used to grab attention or flag statuses.*\n\n`;
      groups.accent.slice(0, 6).forEach((c, i) => md += `- **Accent ${i + 1}**: \`${c.color}\` (Frequency: ${c.frequency}x)\n`);
      md += `\n`;
    }
    if (groups.backgrounds.length > 0) {
      md += `### Neutral Backgrounds\n`;
      md += `*Structural layout tokens, canvas colors, and panel fills.*\n\n`;
      groups.backgrounds.slice(0, 6).forEach((c, i) => md += `- **BG Neutral ${i + 1}**: \`${c.color}\` (Frequency: ${c.frequency}x)\n`);
      md += `\n`;
    }
    if (groups.texts.length > 0) {
      md += `### Typography Texts & UI Borders\n`;
      md += `*Contrast-optimized neuter colors used for readable typography, paragraphs, and divider scales.*\n\n`;
      groups.texts.slice(0, 8).forEach((c, i) => md += `- **UI Neutral ${i + 1}**: \`${c.color}\` (Frequency: ${c.frequency}x)\n`);
      md += `\n`;
    }
    
    md += `## Typography\n\n`;
    md += `### Font Families\n`;
    fonts.forEach(f => md += `- \`${f}\`\n`);
    md += `\n### Font Scales\n`;
    sizes.forEach(s => md += `- Size: \`${s}\`\n`);
    md += `\n### Font Weights\n`;
    weights.forEach(w => md += `- Weight: \`${w}\`\n`);
    md += `\n## Spacing Units\n\n`;
    spacings.forEach(sp => md += `- Spacing scale: \`${sp}\`\n`);
    md += `\n## Visual Assets\n\n`;
    assets.forEach((ass, idx) => {
      md += `- **Asset ${idx + 1}** (${ass.type}): [Link](${ass.url})  \n`;
    });

    // 2. tailwind.config.js
    let conf = `/** @type {import('tailwindcss').Config} */\n`;
    conf += `module.exports = {\n`;
    conf += `  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],\n`;
    conf += `  theme: {\n`;
    conf += `    extend: {\n`;
    conf += `      colors: {\n`;
    if (groups.primary.length > 0) {
      conf += `        primary: {\n`;
      groups.primary.forEach((c, i) => conf += `          ${i + 1}: "${c.color}",\n`);
      conf += `        },\n`;
    }
    if (groups.secondary.length > 0) {
      conf += `        secondary: {\n`;
      groups.secondary.forEach((c, i) => conf += `          ${i + 1}: "${c.color}",\n`);
      conf += `        },\n`;
    }
    if (groups.accent.length > 0) {
      conf += `        accent: {\n`;
      groups.accent.slice(0, 6).forEach((c, i) => conf += `          ${i + 1}: "${c.color}",\n`);
      conf += `        },\n`;
    }
    if (groups.backgrounds.length > 0) {
      conf += `        bg: {\n`;
      groups.backgrounds.slice(0, 6).forEach((c, i) => conf += `          ${i + 1}: "${c.color}",\n`);
      conf += `        },\n`;
    }
    if (groups.texts.length > 0) {
      conf += `        text: {\n`;
      groups.texts.slice(0, 8).forEach((c, i) => conf += `          ${i + 1}: "${c.color}",\n`);
      conf += `        },\n`;
    }
    conf += `      },\n`;
    conf += `      fontFamily: {\n`;
    fonts.forEach((font, idx) => {
      conf += `        font${idx + 1}: ["${font}", "sans-serif"],\n`;
    });
    conf += `      },\n`;
    conf += `    },\n`;
    conf += `  },\n`;
    conf += `  plugins: [],\n`;
    conf += `};\n`;

    // 3. variables.css
    let css = `:root {\n`;
    css += `  /* Primary Brand Colors */\n`;
    groups.primary.forEach((c, i) => css += `  --color-primary-${i + 1}: ${c.color};\n`);
    if (groups.secondary.length > 0) {
      css += `\n  /* Secondary Brand Colors */\n`;
      groups.secondary.forEach((c, i) => css += `  --color-secondary-${i + 1}: ${c.color};\n`);
    }
    if (groups.accent.length > 0) {
      css += `\n  /* Accent Indicators */\n`;
      groups.accent.slice(0, 6).forEach((c, i) => css += `  --color-accent-${i + 1}: ${c.color};\n`);
    }
    if (groups.backgrounds.length > 0) {
      css += `\n  /* Neutral Layout Backgrounds */\n`;
      groups.backgrounds.slice(0, 6).forEach((c, i) => css += `  --color-bg-${i + 1}: ${c.color};\n`);
    }
    if (groups.texts.length > 0) {
      css += `\n  /* Typography Texts & UI Elements */\n`;
      groups.texts.slice(0, 8).forEach((c, i) => css += `  --color-text-${i + 1}: ${c.color};\n`);
    }
    css += `\n  /* Typography Families */\n`;
    fonts.forEach((font, idx) => css += `  --font-family-${idx + 1}: '${font}', sans-serif;\n`);
    css += `\n  /* Spacing Scale */\n`;
    spacings.forEach((sp, idx) => css += `  --spacing-${idx + 1}: ${sp};\n`);
    css += `}\n`;

    return { designMd: md, tailwindConfig: conf, cssVariables: css };
  }, [crawledData, colorGroups, targetUrl]);

  // Start Scraper execution
  const startScrape = async (urlStr = targetUrl, customDepth = crawlDepth, customPages = maxPages) => {
    let checkUrl = urlStr.trim();
    if (!checkUrl) {
      addToast('Please specify a target website URL.', 'error');
      return;
    }
    try {
      new URL(checkUrl);
    } catch (e) {
      addToast('Invalid URL format. Please include http:// or https://', 'error');
      return;
    }

    setIsCrawling(true);
    setCrawlingProgress(15);
    setCrawlingStatusText('Initializing connection socket...');

    // Simulate progress updates for a smoother visual experience
    const steps = [
      { progress: 30, text: 'Resolving DNS and scanning internal stylesheet paths...' },
      { progress: 55, text: 'Fetching target stylesheet CSS files...' },
      { progress: 75, text: 'Extracting semantic fonts & grouping color roles...' },
      { progress: 90, text: 'Mapping SVG files and responsive assets...' }
    ];

    let timer = 0;
    steps.forEach((step, idx) => {
      setTimeout(() => {
        setCrawlingProgress(step.progress);
        setCrawlingStatusText(step.text);
      }, (idx + 1) * 800);
      timer = (idx + 1) * 800;
    });

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: checkUrl,
          maxPages: customPages,
          maxDepth: customDepth
        })
      });

      if (!response.ok) {
        const errObj = await response.json();
        throw new Error(errObj.error || 'Failed to complete crawls.');
      }

      const data = await response.json();
      
      setTimeout(() => {
        setCrawlingProgress(100);
        setCrawlingStatusText('Scan successfully finalized!');
        setTimeout(() => {
          setIsCrawling(false);
          setCrawledData(data);
          addToast('Scan complete! Tokens categorized successfully.');
          setActiveTab('colors-tab');
        }, 500);
      }, timer + 500);

    } catch (err) {
      console.error(err);
      setIsCrawling(false);
      addToast(err.message || 'An error occurred during scanning.', 'error');
    }
  };

  const handleQuickScan = (exampleUrl) => {
    setTargetUrl(exampleUrl);
    setCrawlDepth(0);
    setMaxPages(1);
    startScrape(exampleUrl, 0, 1);
  };

  // Copy exports or colors
  const handleCopyColor = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    addToast(`Copied Hex: ${color.toUpperCase()}`);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const handleCopyExportCode = () => {
    let copyText = '';
    if (exportFormat === 'design-md') copyText = generatedFiles.designMd;
    else if (exportFormat === 'tailwind') copyText = generatedFiles.tailwindConfig;
    else if (exportFormat === 'css') copyText = generatedFiles.cssVariables;

    navigator.clipboard.writeText(copyText);
    setCopiedExport(true);
    addToast('Design tokens code copied to clipboard!');
    setTimeout(() => setCopiedExport(false), 2000);
  };

  // Local Disk Write
  const handleSaveLocalDisk = async () => {
    if (!crawledData) return;

    // Client-side download helper
    const triggerDownload = (filename, text) => {
      const element = document.createElement("a");
      const file = new Blob([text], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    };

    // 1. Trigger client-side browser downloads (works everywhere, including Vercel!)
    try {
      triggerDownload('DESIGN.md', generatedFiles.designMd);
      triggerDownload('tailwind.config.js', generatedFiles.tailwindConfig);
      triggerDownload('variables.css', generatedFiles.cssVariables);
      addToast('Downloading files to your computer...');
    } catch (downloadErr) {
      console.error('Client-side download failed:', downloadErr);
    }

    // 2. Attempt local server write (for local development)
    try {
      const res = await fetch('/api/export-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designMd: generatedFiles.designMd,
          tailwindConfig: generatedFiles.tailwindConfig,
          cssVariables: generatedFiles.cssVariables
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.serverlessMode) {
          addToast('Also successfully saved to /exports/ locally!');
        }
      }
    } catch (err) {
      console.warn('Local server filesystem write skipped or unavailable:', err.message);
    }
  };

  // Stitch syncing triggers
  const handleStitchSync = async () => {
    if (!stitchProjectId || !stitchScreenId) {
      addToast('Project ID and Screen ID are both required.', 'error');
      return;
    }
    try {
      setStitchSyncStatus('Preparing configuration files...');
      const res = await fetch('/api/export-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designMd: generatedFiles.designMd
        })
      });
      if (!res.ok) throw new Error('Failed to output DESIGN.md local config.');

      setStitchSyncStatus('ready');
      addToast('DESIGN.md successfully saved. Ready for Stitch sync.');
    } catch (err) {
      console.error(err);
      setStitchSyncStatus('failed');
      addToast('Failed to write local spec: ' + err.message, 'error');
    }
  };

  // Scraped pages search filter
  const filteredPages = useMemo(() => {
    if (!crawledData?.pages) return [];
    const q = pagesSearch.toLowerCase().trim();
    if (!q) return crawledData.pages;
    return crawledData.pages.filter(page => 
      (page.url || '').toLowerCase().includes(q) ||
      (page.title || '').toLowerCase().includes(q) ||
      (page.description || '').toLowerCase().includes(q) ||
      (page.h1 || '').toLowerCase().includes(q)
    );
  }, [crawledData, pagesSearch]);

  // Assets gallery filter
  const filteredAssets = useMemo(() => {
    if (!crawledData?.assets) return [];
    const images = crawledData.assets.images || [];
    const svgs = crawledData.assets.svgs || [];
    
    if (assetFilter === 'images') return images;
    if (assetFilter === 'svgs') return svgs;
    return [...images, ...svgs];
  }, [crawledData, assetFilter]);

  return (
    <div className="relative min-h-screen">
      {/* Background radial neon glows */}
      <div className="bg-glow bg-glow-1 w-[260px] h-[260px] sm:w-[500px] sm:h-[500px] top-[-50px] sm:top-[-100px] right-[-50px] bg-[radial-gradient(circle,var(--color-accent-primary),rgba(0,0,0,0))]" />
      <div className="bg-glow bg-glow-2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bottom-[-50px] sm:bottom-[-150px] left-[-50px] bg-[radial-gradient(circle,var(--color-accent-secondary),rgba(0,0,0,0))]" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* Responsive Header */}
        <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-5 w-full">
          {/* Logo Area */}
          <div className="flex items-center gap-3.5">
            <div className="bg-gradient-to-br from-accent-primary to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-[0_0_20px_var(--color-accent-primary-glow)] animate-logo-glow">
              ▲
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                AetherCrawler
              </h1>
              <span className="text-xs text-slate-400 font-medium tracking-wide">
                Design Token & Content Extractor
              </span>
            </div>
          </div>

          {/* Crawl URL Input Panel */}
          <div className="glass-panel rounded-2xl p-4 flex-grow max-w-full lg:max-w-[900px] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex flex-col gap-1.5 flex-grow w-full">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Target Website URL
                </label>
                <div className="relative flex items-center w-full">
                  <Globe size={16} className="absolute left-4 text-slate-500" />
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-slate-950/80 border border-white/8 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/40 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full sm:w-auto items-center">
                <Button 
                  variant="glass" 
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="whitespace-nowrap px-4 w-full sm:w-auto"
                >
                  <Sliders size={14} className="mr-2" />
                  <span>Advanced Settings {isAdvancedOpen ? '▴' : '▾'}</span>
                </Button>

                <Button 
                  onClick={() => startScrape()} 
                  disabled={isCrawling}
                  className="whitespace-nowrap font-bold w-full sm:w-auto min-w-[130px]"
                >
                  {isCrawling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Scanning</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="mr-2 text-glow-secondary" />
                      <span>Scan Website</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Collapsible Advanced settings segment */}
            <div 
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out flex flex-col sm:flex-row gap-6",
                isAdvancedOpen ? "max-h-[200px] opacity-100 mt-2 pt-4 border-t border-dashed border-white/10" : "max-h-0 opacity-0 pointer-events-none"
              )}
            >
              {/* Slider: Depth */}
              <div className="flex flex-col gap-2 flex-grow">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    Crawl Depth: 
                    <span className="text-accent-secondary font-bold text-glow-secondary">
                      {crawlDepth === 0 ? '0 (Single Page)' : crawlDepth}
                    </span>
                    
                    {/* Tooltip */}
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={12} className="text-slate-500 hover:text-slate-300 transition-colors duration-200" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Depth defines how many levels of internal links the crawler follows. Depth 0 crawls only the single pasted URL page.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </div>
                <Slider
                  min={0}
                  max={3}
                  step={1}
                  value={crawlDepth}
                  onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                />
              </div>

              {/* Slider: Max Pages */}
              <div className="flex flex-col gap-2 flex-grow">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    Max Pages: 
                    <span className={cn("font-bold text-glow-secondary", crawlDepth === 0 ? "text-slate-500" : "text-accent-secondary")}>
                      {maxPages} {crawlDepth === 0 && '(Locked)'}
                    </span>
                    
                    {/* Tooltip */}
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={12} className="text-slate-500 hover:text-slate-300 transition-colors duration-200" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Max Pages limits the maximum pages fetched in a single scan, safeguarding memory and network bandwidth.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </div>
                <Slider
                  min={1}
                  max={30}
                  step={1}
                  value={maxPages}
                  onChange={(e) => setMaxPages(parseInt(e.target.value))}
                  disabled={crawlDepth === 0}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Real-time Loader Card */}
        {isCrawling && (
          <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-pulse-slow">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-accent-primary/20 border-t-accent-primary animate-spin" />
              <span className="text-accent-primary text-xl font-black">▲</span>
            </div>
            <div className="flex-grow flex flex-col gap-2 text-center md:text-left w-full">
              <h3 className="text-lg font-bold text-white tracking-tight">Scanning website in progress...</h3>
              <p className="text-xs sm:text-sm text-slate-400">{crawlingStatusText}</p>
              
              {/* Glowing progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mt-1 border border-white/5 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-accent-primary to-accent-secondary h-full rounded-full transition-all duration-300 shadow-[0_0_10px_var(--color-accent-primary-glow)]"
                  style={{ width: `${crawlingProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Counter Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
              📄
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pages Scanned</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">{crawledData?.stats?.pagesCount || 0}</h2>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xl">
              🎨
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unique Colors</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">{crawledData?.stats?.colorsCount || 0}</h2>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">
              🔤
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Typography Fonts</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">{crawledData?.stats?.fontsCount || 0}</h2>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xl">
              🖼️
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assets Found</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">{crawledData?.stats?.assetsCount || 0}</h2>
            </div>
          </div>
        </section>

        {/* Tab Switcher Area */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview-tab">Overview</TabsTrigger>
            <TabsTrigger value="pages-tab">Scraped Pages</TabsTrigger>
            <TabsTrigger value="colors-tab">Color Palette</TabsTrigger>
            <TabsTrigger value="typography-tab">Typography & Spacing</TabsTrigger>
            <TabsTrigger value="assets-tab">Assets Gallery</TabsTrigger>
            <TabsTrigger value="export-tab" className="text-accent-secondary border-emerald-500/30">Design System Export</TabsTrigger>
          </TabsList>

          <main className="w-full">
            
            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview-tab">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Intro Card */}
                <div className="lg:col-span-2 glass-panel rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Extract Design Tokens & Structured Content
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Welcome to AetherCrawler! This dashboard extracts custom color roles, typographies, spacing hierarchies, and vector assets directly from any public website. Enter a URL above and click <strong>Scan Website</strong> to generate standard configurations.
                  </p>
                  
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex gap-4">
                      <span className="text-accent-secondary text-sm font-black">✔</span>
                      <div className="flex flex-col">
                        <strong className="text-xs sm:text-sm text-slate-200">Deep CSS Inspection</strong>
                        <span className="text-xs text-slate-400 mt-0.5">Scrapes internal style scripts, embedded attribute properties, and external linked stylings.</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <span className="text-accent-secondary text-sm font-black">✔</span>
                      <div className="flex flex-col">
                        <strong className="text-xs sm:text-sm text-slate-200">Role-Based Color Categorization</strong>
                        <span className="text-xs text-slate-400 mt-0.5">Aggregates colors and groups them automatically by saturation and luminance into brand categories.</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <span className="text-accent-secondary text-sm font-black">✔</span>
                      <div className="flex flex-col">
                        <strong className="text-xs sm:text-sm text-slate-200">Typography Scale Map</strong>
                        <span className="text-xs text-slate-400 mt-0.5">Discovers active typographic elements, mapping styles directly in responsive code specifications.</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <span className="text-accent-secondary text-sm font-black">✔</span>
                      <div className="flex flex-col">
                        <strong className="text-xs sm:text-sm text-slate-200">Masonry Asset Extractor</strong>
                        <span className="text-xs text-slate-400 mt-0.5">Compiles vector XML SVGs and static image file structures into responsive previews.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Quick Actions Card */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5 justify-between">
                  <div className="flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-white tracking-wider uppercase">Quick Demo Triggers</h4>
                    <p className="text-xs text-slate-400 leading-normal">
                      Instantly explore crawler specs without typing. Trigger a quick scan of major domains:
                    </p>
                    <div className="flex flex-col gap-2.5">
                      <Button variant="glass" onClick={() => handleQuickScan('https://github.com')} className="justify-start">
                        <span>GitHub.com Specs</span>
                      </Button>
                      <Button variant="glass" onClick={() => handleQuickScan('https://apple.com')} className="justify-start">
                        <span>Apple.com Specs</span>
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5">
                    <h5 className="text-xs font-bold text-accent-secondary flex items-center gap-1.5">
                      💡 Design Tip
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
                      When scanning completes, navigate to the <strong>Design System Export</strong> panel. Copy code to your clipboard or synch variables instantly to your **Stitch** project workspace!
                    </p>
                  </div>
                </div>

                {/* Tech Stack / Detected Technologies Card */}
                <div className="lg:col-span-3 glass-panel rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-secondary/10 border border-accent-secondary/20">
                      <Sparkles className="w-5 h-5 text-accent-secondary animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        Detected Tech Stack & Platform
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {crawledData?.detectedTechnologies && crawledData.detectedTechnologies.length > 0 ? "Identified frameworks, styles, infrastructure, and server architecture fingerprints." : "Simulated preview of technology stack scans (Enter a URL to see real results)."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-2">
                    {crawledData?.detectedTechnologies && crawledData.detectedTechnologies.length > 0 ? (
                      crawledData.detectedTechnologies.map((tech) => (
                        <div 
                          key={tech} 
                          className="hover:scale-105 transition-all duration-300 rounded-lg overflow-hidden border border-white/10 shadow-lg cursor-default animate-in fade-in zoom-in-95"
                        >
                          <img 
                            src={getTechBadgeUrl(tech)} 
                            alt={tech} 
                            className="h-10 object-contain block" 
                          />
                        </div>
                      ))
                    ) : (
                      // Gorgeous placeholder stack
                      ['React', 'Next.js', 'Tailwind CSS', 'node.js', 'WordPress', 'Cloudflare', 'Nginx'].map((tech) => (
                        <div 
                          key={tech} 
                          className="opacity-40 hover:opacity-85 hover:scale-105 transition-all duration-300 rounded-lg overflow-hidden border border-white/5 shadow-md cursor-default"
                        >
                          <img 
                            src={getTechBadgeUrl(tech)} 
                            alt={tech} 
                            className="h-10 object-contain block grayscale" 
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </TabsContent>

            {/* TAB 2: SCRAPED PAGES */}
            <TabsContent value="pages-tab">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <h3 className="text-lg font-bold text-white">Scraped Page Targets</h3>
                  
                  {/* Search query box */}
                  <div className="relative flex items-center w-full sm:max-w-xs">
                    <Search size={14} className="absolute left-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={pagesSearch}
                      onChange={(e) => setPagesSearch(e.target.value)}
                      placeholder="Search url, titles, snippets..."
                      className="w-full bg-slate-900 border border-white/8 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-accent-primary"
                    />
                  </div>
                </div>

                <div className="glass-panel rounded-2xl overflow-x-auto w-full">
                  <table className="glass-table w-full">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>URL Target</th>
                        <th>Page Title</th>
                        <th>H1 Headline</th>
                        <th className="text-center">Depth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPages.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-xs text-slate-500 py-10">
                            {crawledData ? 'No pages matched your search filter.' : 'No pages crawled yet. Start a scan to view data.'}
                          </td>
                        </tr>
                      ) : (
                        filteredPages.map((page, idx) => (
                          <tr 
                            key={idx} 
                            onClick={() => setSelectedPage(page)}
                            className="cursor-pointer"
                          >
                            <td className="w-20">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                                Scraped
                              </span>
                            </td>
                            <td className="max-w-[200px] truncate font-mono text-xs text-slate-400">
                              {page.url}
                            </td>
                            <td className="max-w-[200px] truncate font-semibold text-slate-200">
                              {page.title || 'Untitled'}
                            </td>
                            <td className="max-w-[200px] truncate text-slate-400">
                              {page.h1 || <span className="italic text-slate-600">None detected</span>}
                            </td>
                            <td className="text-center font-mono font-bold text-accent-secondary">
                              {page.depth}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: COLORS TAB */}
            <TabsContent value="colors-tab">
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Discovered CSS Colors</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Color values automatically normalized and categorized by UI roles using luminance heuristics. Click any chip to copy its Hex color.
                  </p>
                </div>

                {!crawledData ? (
                  <div className="glass-panel rounded-2xl p-10 text-center text-xs text-slate-500">
                    No color tokens found. Start a website scan to parse stylings.
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {/* Render Group Panel wrapper */}
                    {[
                      { 
                        title: 'Primary Brand Colors', 
                        list: colorGroups.primary, 
                        desc: 'Primary brand identity tokens used for key call-to-actions.', 
                        badge: 'Brand Accent' 
                      },
                      { 
                        title: 'Secondary Brand Colors', 
                        list: colorGroups.secondary, 
                        desc: 'Supporting colors used for secondary elements and borders.', 
                        badge: 'SubAccent' 
                      },
                      { 
                        title: 'Visual Accents', 
                        list: colorGroups.accent, 
                        desc: 'Vibrant highlight colors parsed from code styles.', 
                        badge: 'Accents' 
                      },
                      { 
                        title: 'Neutral Backgrounds', 
                        list: colorGroups.backgrounds, 
                        desc: 'Structural canvas backgrounds and containers.', 
                        badge: 'BG Neutral' 
                      },
                      { 
                        title: 'Typography Texts & UI Borders', 
                        list: colorGroups.texts, 
                        desc: 'Neuter contrast colors for body texts, boundaries and line separators.', 
                        badge: 'UI Texts' 
                      }
                    ].map((grp, gIdx) => grp.list.length > 0 && (
                      <div key={gIdx} className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/5 pb-3">
                          <div>
                            <h4 className="font-bold text-white text-sm flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-accent-primary animate-pulse" />
                              {grp.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">{grp.desc}</p>
                          </div>
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-white/5 text-slate-300 mt-2 sm:mt-0 max-w-max">
                            {grp.badge}
                          </span>
                        </div>

                        {/* Grid chips */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                          {grp.list.map((c, cIdx) => (
                            <div 
                              key={cIdx} 
                              onClick={() => handleCopyColor(c.color)}
                              className="group relative glass-panel rounded-xl p-2.5 flex flex-col items-center gap-2 cursor-pointer hover:border-white/20 active:scale-95"
                            >
                              <div 
                                className="w-full aspect-square rounded-lg shadow-inner" 
                                style={{ backgroundColor: c.color }} 
                              />
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-xs font-bold text-white group-hover:text-accent-secondary uppercase">
                                  {c.color}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {c.frequency}x usage
                                </span>
                              </div>

                              {/* Copy Check Icon overlay */}
                              {copiedColor === c.color && (
                                <div className="absolute inset-0 bg-slate-950/80 rounded-xl flex items-center justify-center animate-in fade-in">
                                  <Check size={16} className="text-accent-secondary" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 4: TYPOGRAPHY & SPACING */}
            <TabsContent value="typography-tab">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Font Families */}
                <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-white/5 pb-2.5">
                    Discovered Font Families
                  </h4>
                  <div className="flex flex-col gap-3">
                    {!crawledData?.tokens?.fonts ? (
                      <div className="text-xs text-slate-500 text-center py-6">No font tokens.</div>
                    ) : Object.keys(crawledData.tokens.fonts).length === 0 ? (
                      <div className="text-xs text-slate-500 text-center py-6">No font families parsed.</div>
                    ) : (
                      Object.entries(crawledData.tokens.fonts).sort((a, b) => b[1] - a[1]).map(([font, count], idx) => (
                        <div key={idx} className="glass-panel rounded-xl p-4 flex justify-between items-center">
                          <div className="flex flex-col gap-1.5 flex-grow">
                            <span className="text-xs text-slate-400 font-mono">family[{idx}]</span>
                            <span 
                              className="text-base text-white tracking-wide truncate pr-4"
                              style={{ fontFamily: font }}
                            >
                              {font}
                            </span>
                            <span 
                              className="text-xs text-slate-500 tracking-wide font-light truncate max-w-xs"
                              style={{ fontFamily: font }}
                            >
                              AaBbCcDdEeFfGg 12345
                            </span>
                          </div>
                          <span className="px-2.5 py-1 text-[10px] bg-slate-900 border border-white/5 text-slate-300 rounded-md font-bold">
                            {count} elements
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Sizing & Spacing */}
                <div className="flex flex-col gap-6">
                  {/* Font Sizes Grid */}
                  <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-white/5 pb-2.5">
                      Font Sizes Used
                    </h4>
                    <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                      {!crawledData?.tokens?.fontSizes || Object.keys(crawledData.tokens.fontSizes).length === 0 ? (
                        <div className="col-span-2 text-xs text-slate-500 text-center py-4">None found</div>
                      ) : (
                        Object.entries(crawledData.tokens.fontSizes).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([size, count], idx) => (
                          <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950/60 rounded-xl border border-white/5 text-xs">
                            <span className="font-mono text-slate-400 font-bold">{size}</span>
                            <span className="px-2 py-0.5 text-[9px] bg-white/5 text-slate-400 rounded font-semibold">{count}x</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Font Weights & Layout margins */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Weights */}
                    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-white/5 pb-2.5">
                        Font Weights
                      </h4>
                      <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                        {!crawledData?.tokens?.fontWeights || Object.keys(crawledData.tokens.fontWeights).length === 0 ? (
                          <div className="text-xs text-slate-500 text-center py-4">None</div>
                        ) : (
                          Object.entries(crawledData.tokens.fontWeights).sort((a, b) => b[1] - a[1]).map(([weight, count], idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-slate-950/60 rounded-lg border border-white/5 text-xs">
                              <span style={{ fontWeight: weight }} className="text-slate-200">{weight}</span>
                              <span className="text-[10px] text-slate-500">{count}x</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Margins/paddings */}
                    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-white/5 pb-2.5">
                        Paddings / Margins
                      </h4>
                      <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                        {!crawledData?.tokens?.spacing || Object.keys(crawledData.tokens.spacing).length === 0 ? (
                          <div className="text-xs text-slate-500 text-center py-4">None</div>
                        ) : (
                          Object.entries(crawledData.tokens.spacing).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([space, count], idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-slate-950/60 rounded-lg border border-white/5 text-xs">
                              <span className="font-mono text-slate-400">{space}</span>
                              <span className="text-[10px] text-slate-500">{count}x</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: ASSETS GALLERY */}
            <TabsContent value="assets-tab">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Scraped Visual Media</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Extracted inline vector code (SVGs) and normal pixel images (PNGs, JPGs, WebPs) cataloged during scans.</p>
                  </div>

                  {/* Filter switches */}
                  <div className="flex gap-1.5 p-1 bg-white/4 border border-white/5 rounded-xl self-start sm:self-auto">
                    {[
                      { val: 'all', title: 'All Assets' },
                      { val: 'images', title: 'Images Only' },
                      { val: 'svgs', title: 'Vectors / SVGs' }
                    ].map((filt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAssetFilter(filt.val)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer",
                          assetFilter === filt.val && "bg-white/10 text-white border border-white/10"
                        )}
                      >
                        {filt.title}
                      </button>
                    ))}
                  </div>
                </div>

                {!crawledData ? (
                  <div className="glass-panel rounded-2xl p-10 text-center text-xs text-slate-500">
                    No visual media crawled yet. Perform a scan to catalog assets.
                  </div>
                ) : filteredAssets.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-10 text-center text-xs text-slate-500">
                    No assets found matching the selected type.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredAssets.map((asset, idx) => {
                      const isSvg = asset.type === 'svg';
                      let filename = 'vector-asset.svg';
                      if (!isSvg) {
                        try {
                          filename = asset.url.split('/').pop().split('?')[0] || 'scraped-image.webp';
                        } catch (e) {
                          filename = 'scraped-image.webp';
                        }
                      }

                      return (
                        <div 
                          key={idx} 
                          className="glass-panel rounded-xl overflow-hidden flex flex-col justify-between group border border-white/5 hover:border-white/12 shadow hover:shadow-lg transition-all duration-300"
                        >
                          {/* Media Preview Box */}
                          <div 
                            className="aspect-video w-full flex items-center justify-center bg-slate-950/80 cursor-pointer overflow-hidden p-3"
                            onClick={() => {
                              if (isSvg) {
                                navigator.clipboard.writeText(asset.markup);
                                addToast('SVG XML Markup copied to clipboard!');
                              } else {
                                setLightboxAsset({ url: asset.url, alt: filename });
                              }
                            }}
                          >
                            {isSvg ? (
                              <div 
                                className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain flex justify-center items-center text-glow-primary text-slate-400 group-hover:scale-105 transition-transform duration-300"
                                dangerouslySetInnerHTML={{ __html: asset.markup }} 
                              />
                            ) : (
                              <img
                                src={asset.url}
                                alt={filename}
                                loading="lazy"
                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const parent = e.target.parentElement;
                                  if (parent) {
                                    parent.className += " bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center p-4 border border-white/5 rounded-xl";
                                    parent.innerHTML = `<div class="text-[10px] text-slate-400 font-mono text-center">Image Load Failed</div>`;
                                  }
                                }}
                              />
                            )}
                          </div>

                          {/* Media Details */}
                          <div className="p-3 border-t border-white/5 bg-slate-950/40 flex justify-between items-center text-xs">
                            <div className="flex flex-col w-[80%]">
                              <span className="text-[9px] font-bold text-accent-secondary uppercase">{asset.type}</span>
                              <span className="text-[11px] font-medium text-slate-300 truncate mt-0.5" title={filename}>
                                {filename}
                              </span>
                            </div>
                            
                            {/* Copy trigger */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(isSvg ? asset.markup : asset.url);
                                addToast(isSvg ? 'SVG markup copied!' : 'Asset URL copied!');
                              }}
                              className="text-slate-500 hover:text-white rounded p-1 hover:bg-white/5 cursor-pointer"
                              title={isSvg ? 'Copy SVG Code' : 'Copy Image Link'}
                            >
                              {isSvg ? <FileCode size={14} /> : <ExternalLink size={14} />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 6: DESIGN SYSTEM EXPORT */}
            <TabsContent value="export-tab">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Control Action Panel */}
                <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col gap-6">
                  <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                    <h3 className="text-base font-bold text-white">Design Tokens Exporter</h3>
                    <p className="text-xs text-slate-400 leading-normal">
                      Export compiled tokens into popular UI standards. Choose a format to display, copy, or save files.
                    </p>
                  </div>

                  {/* Format triggers */}
                  <div className="flex flex-col gap-2">
                    {[
                      { val: 'design-md', label: 'DESIGN.md (Stitch Spec)' },
                      { val: 'tailwind', label: 'tailwind.config.js (Tailwind)' },
                      { val: 'css', label: 'variables.css (Native variables)' }
                    ].map((fmt, idx) => (
                      <Button
                        key={idx}
                        variant={exportFormat === fmt.val ? 'default' : 'glass'}
                        onClick={() => setExportFormat(fmt.val)}
                        className="justify-start px-4 h-11"
                      >
                        <FileCode size={14} className="mr-2.5" />
                        <span>{fmt.label}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Main Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="glass" 
                      onClick={handleCopyExportCode}
                      disabled={!crawledData}
                      className="w-full text-xs font-semibold py-2.5 h-11 border border-white/10"
                    >
                      {copiedExport ? (
                        <>
                          <Check size={14} className="mr-2 text-accent-secondary" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} className="mr-2" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </Button>

                    <Button 
                      onClick={handleSaveLocalDisk}
                      disabled={!crawledData}
                      className="w-full text-xs font-semibold py-2.5 h-11 bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10"
                      variant="glass"
                    >
                      <Save size={14} className="mr-2" />
                      <span>Export Files</span>
                    </Button>
                  </div>

                  {/* Stitch Syncer Segment */}
                  <div className="border-t border-dashed border-white/10 pt-5 mt-2 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Stitch MCP Integration</h4>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Sync discovered specs to your active Stitch Project directly using Stitch MCP tools!
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Project ID</label>
                        <input
                          type="text"
                          value={stitchProjectId}
                          onChange={(e) => setStitchProjectId(e.target.value)}
                          placeholder="e.g. 4044680601076201931"
                          className="bg-slate-950/80 border border-white/8 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent-primary"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Screen Instance ID</label>
                        <input
                          type="text"
                          value={stitchScreenId}
                          onChange={(e) => setStitchScreenId(e.target.value)}
                          placeholder="e.g. 1"
                          className="bg-slate-950/80 border border-white/8 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-accent-primary"
                        />
                      </div>

                      <Button 
                        onClick={handleStitchSync}
                        disabled={!crawledData}
                        className="w-full font-bold h-10 mt-1"
                      >
                        <Send size={13} className="mr-2" />
                        <span>Prepare Stitch Upload</span>
                      </Button>

                      {stitchSyncStatus && (
                        <div 
                          className={cn(
                            "p-3 rounded-xl text-[11px] leading-relaxed border mt-2 font-mono animate-in fade-in",
                            stitchSyncStatus === 'Preparing configuration files...' && "bg-slate-900 border-white/5 text-slate-300",
                            stitchSyncStatus === 'ready' && "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
                            stitchSyncStatus === 'failed' && "bg-rose-500/10 border-rose-500/25 text-rose-400"
                          )}
                        >
                          {stitchSyncStatus === 'Preparing configuration files...' && (
                            <span className="flex items-center gap-1.5">
                              <Loader2 size={12} className="animate-spin" /> Preparing local DESIGN.md...
                            </span>
                          )}
                          
                          {stitchSyncStatus === 'ready' && (
                            <div>
                              <strong>Design spec written locally!</strong><br />
                              <span className="text-white">Next Step:</span> Copy and paste this prompt in your AI agent chat:
                              <pre className="mt-2 p-2 bg-slate-950 border border-white/5 rounded text-[10px] text-slate-300 select-all font-mono break-all whitespace-pre-wrap">
                                Please upload the local DESIGN.md file to Stitch project ID <strong>{stitchProjectId}</strong> using the screen instance ID <strong>{stitchScreenId}</strong>
                              </pre>
                            </div>
                          )}

                          {stitchSyncStatus === 'failed' && (
                            <span>Local compilation failed. Verify that server.js is running.</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Exporter Viewer Output Panel */}
                <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden flex flex-col justify-between min-h-[450px]">
                  {/* Header togglers */}
                  <div className="p-3 sm:p-4 bg-slate-950/40 border-b border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 font-bold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                      {exportFormat === 'design-md' ? 'DESIGN.md' : exportFormat === 'tailwind' ? 'tailwind.config.js' : 'variables.css'}
                    </span>

                    <div className="flex gap-1.5 p-1 bg-white/4 border border-white/5 rounded-lg self-start sm:self-auto">
                      {[
                        { val: 'code', label: 'Code View', icon: FileCode },
                        { val: 'preview', label: 'Doc Preview', icon: Eye }
                      ].map((view, idx) => {
                        const Icon = view.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => setExportViewMode(view.val)}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-xs font-semibold text-slate-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer",
                              exportViewMode === view.val && "bg-white/10 text-white border border-white/10"
                            )}
                          >
                            <Icon size={12} />
                            <span>{view.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Body display */}
                  <div className="flex-grow p-4 sm:p-6 overflow-auto bg-slate-950/20 max-h-[500px]">
                    {!crawledData ? (
                      <div className="text-xs text-slate-500 text-center py-20">
                        Scan a target website URL to compile tokens and export configurations here.
                      </div>
                    ) : exportViewMode === 'code' ? (
                      <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre pr-2">
                        <code>
                          {exportFormat === 'design-md' && generatedFiles.designMd}
                          {exportFormat === 'tailwind' && generatedFiles.tailwindConfig}
                          {exportFormat === 'css' && generatedFiles.cssVariables}
                        </code>
                      </pre>
                    ) : (
                      // Markdown/Visual Preview
                      <div className="prose prose-invert text-xs sm:text-sm text-slate-300 max-w-full flex flex-col gap-4">
                        <h1 className="text-lg font-bold text-white border-b border-white/5 pb-2">
                          {exportFormat === 'design-md' && 'Design Specification Spec'}
                          {exportFormat === 'tailwind' && 'Tailwind Theme Specification'}
                          {exportFormat === 'css' && 'CSS Custom Variables Specification'}
                        </h1>
                        <p className="text-slate-400 italic">
                          Generated values compiled from active scans of <strong>{targetUrl}</strong>.
                        </p>

                        {/* Rendering styled sections */}
                        <div className="flex flex-col gap-4 mt-2">
                          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Extracted Colors Grouped</h2>
                          
                          {[
                            { title: 'Primary Brand Theme', list: colorGroups.primary, label: 'primary' },
                            { title: 'Secondary Brand Theme', list: colorGroups.secondary, label: 'secondary' },
                            { title: 'Visual Accent Highlight Themes', list: colorGroups.accent.slice(0, 6), label: 'accent' },
                            { title: 'Neutral UI Backgrounds', list: colorGroups.backgrounds.slice(0, 6), label: 'bg' },
                            { title: 'Typography Texts & Borders', list: colorGroups.texts.slice(0, 8), label: 'text' }
                          ].map((sec, idx) => sec.list.length > 0 && (
                            <div key={idx} className="flex flex-col gap-2 p-3 bg-slate-900/60 rounded-xl border border-white/5">
                              <h3 className="text-xs font-semibold text-white">{sec.title}</h3>
                              <div className="flex flex-wrap gap-2.5 mt-1">
                                {sec.list.map((c, cIdx) => (
                                  <div key={cIdx} className="flex items-center gap-1.5 text-[10px] bg-slate-950 px-2 py-1 rounded border border-white/5 font-mono">
                                    <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: c.color }} />
                                    <span className="text-slate-300 font-bold uppercase">{c.color}</span>
                                    <span className="text-slate-500">({sec.label}.{cIdx + 1})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {/* Spacing or Spacings */}
                          {exportFormat === 'css' && Object.keys(crawledData.tokens.spacing || {}).length > 0 && (
                            <div className="flex flex-col gap-2 mt-2">
                              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Spacing Mappings</h2>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(crawledData.tokens.spacing).slice(0, 8).map(([space, count], idx) => (
                                  <div key={idx} className="p-2 bg-slate-900/60 border border-white/5 rounded-lg flex justify-between font-mono text-[10px]">
                                    <span className="text-accent-secondary">--spacing-{idx + 1}</span>
                                    <span className="text-slate-300 font-bold">{space}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 bg-slate-950/40 border-t border-white/5 flex justify-end text-[10px] text-slate-500">
                    Auto-generated by AetherCrawler Exporter Engine
                  </div>
                </div>

              </div>
            </TabsContent>

          </main>
        </Tabs>

      </div>

      {/* Pages details drawer details Dialog modal */}
      <Dialog open={selectedPage !== null} onOpenChange={(open) => !open && setSelectedPage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedPage?.title || 'Untitled Page Details'}</DialogTitle>
            <DialogDescription className="font-mono break-all text-accent-secondary mt-1">
              {selectedPage?.url}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="metadata" className="w-full my-2">
            <TabsList className="grid grid-cols-2 mb-4 w-full bg-slate-950/50 p-1 border border-white/5 rounded-xl">
              <TabsTrigger value="metadata">Page Metadata</TabsTrigger>
              <TabsTrigger value="markdown">Extracted Markdown</TabsTrigger>
            </TabsList>
            
            <TabsContent value="metadata" className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Meta Description</h4>
                <p className="text-xs text-slate-300 bg-slate-950/85 border border-white/5 rounded-xl p-3.5 leading-relaxed">
                  {selectedPage?.description || 'No meta description tag detected on this page.'}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary H1 Headline</h4>
                <p className="text-xs text-slate-300 bg-slate-950/85 border border-white/5 rounded-xl p-3.5 font-semibold">
                  {selectedPage?.h1 || 'No H1 tags detected.'}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Scraped Body Snippet</h4>
                <pre className="text-[11px] text-slate-400 bg-slate-950 border border-white/5 rounded-xl p-4 overflow-y-auto max-h-[160px] font-mono leading-relaxed whitespace-pre-wrap select-text scrollbar-thin">
                  {selectedPage?.textSnippet || 'No clean body text content parsed.'}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="markdown" className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Extracted Markdown Content</h4>
                <Button 
                  onClick={() => handleCopyMarkdown(selectedPage?.markdown)} 
                  variant="glass" 
                  className="h-8 px-3 text-[11px] flex items-center gap-1.5 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400"
                >
                  {copiedMarkdown ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="relative">
                <pre className="text-[11px] text-slate-300 bg-slate-950 border border-white/5 rounded-xl p-4 overflow-y-auto max-h-[280px] font-mono leading-relaxed whitespace-pre-wrap select-text scrollbar-thin">
                  {selectedPage?.markdown || 'No Markdown generated for this page.'}
                </pre>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <DialogClose className="w-full sm:w-auto">
              <Button variant="glass" className="w-full">Close Previews</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox asset preview modal */}
      <Dialog open={lightboxAsset !== null} onOpenChange={(open) => !open && setLightboxAsset(null)}>
        <DialogContent className="max-w-3xl border border-white/10 rounded-2xl overflow-hidden p-0 bg-transparent flex flex-col justify-center items-center">
          <div className="relative w-full max-h-[75vh] flex justify-center items-center bg-slate-950/90 p-4">
            <img 
              src={lightboxAsset?.url} 
              alt={lightboxAsset?.alt} 
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95" 
            />
          </div>
          <div className="w-full bg-slate-950 border-t border-white/5 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-accent-secondary uppercase">Scraped Image Attachment</span>
              <span className="text-xs font-semibold text-white truncate max-w-sm mt-0.5" title={lightboxAsset?.alt}>
                {lightboxAsset?.alt}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="glass" 
                size="sm" 
                onClick={() => {
                  navigator.clipboard.writeText(lightboxAsset?.url);
                  addToast('Image URL copied to clipboard!');
                }}
              >
                Copy Link
              </Button>
              <DialogClose>
                <Button size="sm">Dismiss</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom dynamic Toasts container at bottom-right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={cn(
              "p-4 rounded-xl shadow-lg border backdrop-blur-md flex items-center gap-3 pointer-events-auto transition-all duration-300 animate-in slide-in-from-right-5",
              toast.type === 'success' 
                ? "bg-slate-900/90 border-emerald-500/25 text-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.15)]" 
                : "bg-slate-900/90 border-rose-500/25 text-rose-400 shadow-[0_4px_20px_rgba(244,63,94,0.15)]"
            )}
          >
            <span className="text-lg">{toast.type === 'success' ? '✔' : '✖'}</span>
            <span className="text-xs font-medium text-slate-100">{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

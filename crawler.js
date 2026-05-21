import * as cheerio from 'cheerio';
import { URL } from 'url';
import TurndownService from 'turndown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});


// Helper: Scan HTML and headers for technology signatures
function detectTechnologies(html, headers = {}) {
  const detected = new Set();
  const htmlLower = html.toLowerCase();

  const heuristics = {
    'React': ['data-reactroot', '_reactlistening', 'react-dom', 'react-jsx'],
    'Vue.js': ['data-v-', '__vue__', 'vue-server-renderer', 'vue.js', 'vue.runtime'],
    'Next.js': ['id="__next_data__"', 'next-router', '_next/static'],
    'Nuxt.js': ['id="__nuxt__"', 'data-n-head'],
    'Angular': ['ng-version', 'app-root', 'ng-content', 'ng-binding'],
    'Svelte': ['svelte-', '__svelte'],
    'Tailwind CSS': ['tailwindcss', 'text-slate-', 'bg-slate-'],
    'Bootstrap': ['bootstrap.min.css', 'navbar-expand', 'btn-primary'],
    'jQuery': ['jquery.js', 'jquery.min.js', 'jquery-'],
    'WordPress': ['wp-content', 'wp-includes', 'wp-json'],
    'PHP': ['wp-content', '.php', 'php-powered'],
  };

  // 1. Scan HTML
  for (const [tech, triggers] of Object.entries(heuristics)) {
    if (triggers.some(trigger => htmlLower.includes(trigger))) {
      detected.add(tech);
      if (tech === 'Next.js') detected.add('React');
      if (tech === 'Nuxt.js') detected.add('Vue.js');
      if (tech === 'WordPress') detected.add('PHP');
    }
  }

  // 2. Scan Response Headers
  const serverHeader = (headers['server'] || '').toLowerCase();
  const poweredByHeader = (headers['x-powered-by'] || '').toLowerCase();

  if (poweredByHeader.includes('express') || poweredByHeader.includes('next.js')) {
    detected.add('Node.js');
  }
  if (poweredByHeader.includes('php')) {
    detected.add('PHP');
  }
  if (serverHeader.includes('cloudflare')) {
    detected.add('Cloudflare');
  }
  if (serverHeader.includes('nginx')) {
    detected.add('Nginx');
  }
  if (serverHeader.includes('apache')) {
    detected.add('Apache');
  }

  return Array.from(detected);
}

// Helper: Normalize URL to absolute path
function resolveUrl(base, relative) {
  try {
    return new URL(relative, base).toString();
  } catch (e) {
    return null;
  }
}

// Helper: Convert HSL to HEX
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Helper: Convert RGB to HEX
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = parseInt(x, 10).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Helper: Normalize colors into hex format
function normalizeColor(colorStr) {
  colorStr = colorStr.trim().toLowerCase();

  // 1. Plain HEX (e.g. #fff, #ffffff, #ffffff80)
  const hexMatch = colorStr.match(/^#([0-9a-f]{3,8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      return '#' + hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 4) {
      // #rgba -> #rrggbbaa -> we will just grab the RGB part to simplify
      return '#' + hex.slice(0, 3).split('').map(c => c + c).join('');
    }
    if (hex.length === 8) {
      // #rrggbbaa -> strip alpha for primary visual representation
      return '#' + hex.slice(0, 6);
    }
    return '#' + hex;
  }

  // 2. RGB or RGBA (e.g. rgb(255, 255, 255), rgba(255,255,255,0.5))
  const rgbMatch = colorStr.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[0-9.]+\s*)?\)$/);
  if (rgbMatch) {
    return rgbToHex(rgbMatch[1], rgbMatch[2], rgbMatch[3]);
  }

  // 3. HSL or HSLA (e.g. hsl(120, 100%, 50%))
  const hslMatch = colorStr.match(/^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*[0-9.]+\s*)?\)$/);
  if (hslMatch) {
    return hslToHex(parseInt(hslMatch[1], 10), parseInt(hslMatch[2], 10), parseInt(hslMatch[3], 10));
  }

  // 4. Named colors (standard clean ones)
  const cssNames = {
    white: '#ffffff', black: '#000000', transparent: 'transparent',
    red: '#ff0000', blue: '#0000ff', green: '#008000', yellow: '#ffff00',
    purple: '#800080', orange: '#ffa500', gray: '#808080', grey: '#808080'
  };
  if (cssNames[colorStr]) {
    return cssNames[colorStr];
  }

  return null;
}

// Main CSS Token Extractor
function extractCssTokens(cssContent, tokensStore) {
  if (!cssContent) return;

  // 1. Color values (Hex, RGB, RGBA, HSL, HSLA, named colors)
  // We match color patterns: HEX, rgb/rgba/hsl/hsla blocks
  const hexPattern = /#([0-9a-fA-F]{3,8})\b/g;
  const rgbPattern = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[0-9.]+\s*)?\)/gi;
  const hslPattern = /hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*[0-9.]+\s*)?\)/gi;

  let match;
  while ((match = hexPattern.exec(cssContent)) !== null) {
    const raw = match[0];
    const norm = normalizeColor(raw);
    if (norm && norm !== 'transparent') {
      tokensStore.colors[norm] = (tokensStore.colors[norm] || 0) + 1;
    }
  }

  while ((match = rgbPattern.exec(cssContent)) !== null) {
    const raw = match[0];
    const norm = normalizeColor(raw);
    if (norm && norm !== 'transparent') {
      tokensStore.colors[norm] = (tokensStore.colors[norm] || 0) + 1;
    }
  }

  while ((match = hslPattern.exec(cssContent)) !== null) {
    const raw = match[0];
    const norm = normalizeColor(raw);
    if (norm && norm !== 'transparent') {
      tokensStore.colors[norm] = (tokensStore.colors[norm] || 0) + 1;
    }
  }

  // 2. Font Families
  // Format: font-family: "Inter", sans-serif;
  const fontFamilyPattern = /font-family\s*:\s*([^;!}]+)/gi;
  while ((match = fontFamilyPattern.exec(cssContent)) !== null) {
    let families = match[1].split(',').map(f => f.trim().replace(/['"]/g, ''));
    // Grab the first font (the primary font choice)
    const primaryFont = families[0];
    if (primaryFont && !['sans-serif', 'serif', 'monospace', 'inherit', 'initial', 'unset'].includes(primaryFont.toLowerCase())) {
      tokensStore.fonts[primaryFont] = (tokensStore.fonts[primaryFont] || 0) + 1;
    }
  }

  // 3. Font Sizes
  // Format: font-size: 16px; or font-size: 1.2rem;
  const fontSizePattern = /font-size\s*:\s*([^;!}]+)/gi;
  while ((match = fontSizePattern.exec(cssContent)) !== null) {
    const size = match[1].trim();
    if (size && !['inherit', 'initial', 'unset', 'medium', 'large', 'small'].includes(size.toLowerCase())) {
      tokensStore.fontSizes[size] = (tokensStore.fontSizes[size] || 0) + 1;
    }
  }

  // 4. Font Weights
  // Format: font-weight: 600; or font-weight: bold;
  const fontWeightPattern = /font-weight\s*:\s*([^;!}]+)/gi;
  while ((match = fontWeightPattern.exec(cssContent)) !== null) {
    const weight = match[1].trim();
    if (weight && !['inherit', 'initial', 'unset'].includes(weight.toLowerCase())) {
      tokensStore.fontWeights[weight] = (tokensStore.fontWeights[weight] || 0) + 1;
    }
  }

  // 5. Spacing (Paddings and Margins)
  // padding: 12px; margin-top: 2rem;
  const spacingPattern = /(?:padding|margin)(?:-top|-bottom|-left|-right)?\s*:\s*([^;!}]+)/gi;
  while ((match = spacingPattern.exec(cssContent)) !== null) {
    const val = match[1].trim();
    // Only match simple metrics (px, rem, em, % etc.) and exclude complex multi-directional paddings for layout tokens
    if (val && /^-?\d+(\.\d+)?(px|rem|em|%|vh|vw)$/i.test(val)) {
      tokensStore.spacing[val] = (tokensStore.spacing[val] || 0) + 1;
    }
  }

  // 6. Background Images in CSS
  const bgImgPattern = /background(?:-image)?\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
  while ((match = bgImgPattern.exec(cssContent)) !== null) {
    const imgUrl = match[1].trim();
    if (imgUrl && !imgUrl.startsWith('data:')) {
      tokensStore.bgImages.add(imgUrl);
    }
  }
}

export async function crawlWebsite(startUrl, maxPages = 15, maxDepth = 2) {
  const origin = new URL(startUrl).origin;
  const visited = new Set();
  const queue = [{ url: startUrl, depth: 0 }];
  const allDetectedTechnologies = new Set();
  
  const results = {
    stats: {
      totalPages: 0,
      totalAssets: 0,
      crawledAt: new Date().toISOString(),
    },
    pages: [],
    tokens: {
      colors: {},       // normalized hex -> frequency
      fonts: {},        // font family -> frequency
      fontSizes: {},    // font size -> frequency
      fontWeights: {},  // font weight -> frequency
      spacing: {},      // spacing value -> frequency
    },
    assets: {
      images: [],       // list of unique image URLs with dimensions metadata (if available)
      svgs: []          // list of unique SVGs
    }
  };

  const cssStore = {
    colors: {},
    fonts: {},
    fontSizes: {},
    fontWeights: {},
    spacing: {},
    bgImages: new Set()
  };

  const uniqueImages = new Set();
  const uniqueSvgs = new Set();

  while (queue.length > 0 && visited.size < maxPages) {
    const { url, depth } = queue.shift();
    if (visited.has(url)) continue;

    console.log(`Crawling: ${url} (Depth: ${depth})`);
    visited.add(url);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(10000) // 10s timeout
      });

      if (!response.ok) {
        console.error(`Failed to fetch ${url}: Status ${response.status}`);
        results.pages.push({
          url,
          status: response.status,
          error: `HTTP Error: ${response.statusText}`,
          depth
        });
        continue;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        console.log(`Skipping non-HTML page: ${url} (${contentType})`);
        continue;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Save page basic info
      const title = $('title').text().trim() || 'Untitled Page';
      const metaDescription = $('meta[name="description"]').attr('content') || 
                                $('meta[property="og:description"]').attr('content') || '';
      const h1Text = $('h1').first().text().trim() || '';

      // Get page text content sample
      $('script, style, svg').remove(); // remove scripts and style blocks from text
      const pageText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 1000);

      // --- Technology Stack Fingerprinting ---
      const headersObj = {};
      response.headers.forEach((val, key) => {
        headersObj[key.toLowerCase()] = val;
      });
      const pageTech = detectTechnologies(html, headersObj);
      pageTech.forEach(t => allDetectedTechnologies.add(t));

      // --- Clean Markdown Extraction ---
      const $clean = cheerio.load(html);
      
      // Resolve relative images and links to absolute in Markdown
      $clean('a').each((_, el) => {
        const href = $clean(el).attr('href');
        if (href) {
          const absHref = resolveUrl(url, href);
          if (absHref) $clean(el).attr('href', absHref);
        }
      });
      $clean('img').each((_, el) => {
        const src = $clean(el).attr('src');
        if (src) {
          const absSrc = resolveUrl(url, src);
          if (absSrc) $clean(el).attr('src', absSrc);
        }
      });

      // Strip clutter elements: script, style, nav, footer, noscript, iframe, header
      $clean('script, style, nav, footer, noscript, iframe, header').remove();

      // Find main content container
      const contentEl = $clean('main').length ? $clean('main') 
                      : $clean('article').length ? $clean('article') 
                      : $clean('#content').length ? $clean('#content') 
                      : $clean('.content').length ? $clean('.content')
                      : $clean('body');
      
      const cleanHtml = contentEl.html() || '';
      const markdown = turndownService.turndown(cleanHtml);

      results.pages.push({
        url,
        status: 200,
        title,
        description: metaDescription,
        h1: h1Text,
        textSnippet: pageText,
        markdown: markdown || '',
        depth
      });

      // Reload jQuery-like cheerio to extract assets and styles properly
      const $styles = cheerio.load(html);

      // --- Style Extraction ---
      // A. Inline styles
      $styles('[style]').each((_, el) => {
        const inlineCss = $styles(el).attr('style');
        extractCssTokens(inlineCss, cssStore);
      });

      // B. Inside <style> tags
      $styles('style').each((_, el) => {
        const inlineStyle = $styles(el).text();
        extractCssTokens(inlineStyle, cssStore);
      });

      // C. External stylesheets <link rel="stylesheet">
      const stylesheetUrls = [];
      $styles('link[rel="stylesheet"]').each((_, el) => {
        const href = $styles(el).attr('href');
        if (href) {
          const fullCssUrl = resolveUrl(url, href);
          if (fullCssUrl) stylesheetUrls.push(fullCssUrl);
        }
      });

      // Fetch external stylesheets in parallel
      const cssPromises = stylesheetUrls.map(async (cssUrl) => {
        try {
          const cssRes = await fetch(cssUrl, { signal: AbortSignal.timeout(6000) });
          if (cssRes.ok) {
            const cssText = await cssRes.text();
            extractCssTokens(cssText, cssStore);
          }
        } catch (e) {
          console.error(`Failed to fetch stylesheet: ${cssUrl}`, e.message);
        }
      });
      await Promise.all(cssPromises);

      // --- Asset Extraction ---
      // 1. Images
      $styles('img').each((_, el) => {
        const src = $styles(el).attr('src');
        const alt = $styles(el).attr('alt') || '';
        if (src) {
          const absSrc = resolveUrl(url, src);
          if (absSrc && !absSrc.startsWith('data:') && !uniqueImages.has(absSrc)) {
            uniqueImages.add(absSrc);
            results.assets.images.push({
              type: 'image',
              url: absSrc,
              alt: alt,
              sourcePage: url
            });
          }
        }
      });

      // 2. SVGs
      $styles('svg').each((_, el) => {
        // Only grab non-trivial SVGs
        const svgContent = $styles(el).parent().html();
        if (svgContent) {
          // Keep SVGs unique by taking a slice of content
          const hash = svgContent.slice(0, 100);
          if (!uniqueSvgs.has(hash)) {
            uniqueSvgs.add(hash);
            // Limit stored SVG content to preserve API bandwidth
            results.assets.svgs.push({
              type: 'svg',
              markup: svgContent,
              sourcePage: url
            });
          }
        }
      });

      // --- Internal Links Queueing ---
      if (depth < maxDepth) {
        $styles('a').each((_, el) => {
          const href = $styles(el).attr('href');
          if (href) {
            const fullLink = resolveUrl(url, href);
            if (fullLink) {
              const parsedLink = new URL(fullLink);
              // Must be same host, not visited, not already in queue, and not an anchor/hash or media file
              const isSameHost = parsedLink.origin === origin;
              const cleanLink = parsedLink.origin + parsedLink.pathname + parsedLink.search;
              const isMedia = /\.(png|jpe?g|gif|webp|svg|pdf|zip|mp4)$/i.test(cleanLink);

              if (isSameHost && !visited.has(cleanLink) && !queue.some(q => q.url === cleanLink) && !isMedia) {
                queue.push({ url: cleanLink, depth: depth + 1 });
              }
            }
          }
        });
      }

    } catch (e) {
      console.error(`Error crawling ${url}:`, e.message);
      results.pages.push({
        url,
        status: 500,
        error: e.message,
        depth
      });
    }
  }

  // Add background images to assets list
  for (const bgImg of cssStore.bgImages) {
    const absBgImg = resolveUrl(startUrl, bgImg);
    if (absBgImg && !uniqueImages.has(absBgImg)) {
      uniqueImages.add(absBgImg);
      results.assets.images.push({
        type: 'background',
        url: absBgImg,
        alt: 'CSS Background Image',
        sourcePage: startUrl
      });
    }
  }

  // Populate results tokens with compiled stores
  results.tokens.colors = cssStore.colors;
  results.tokens.fonts = cssStore.fonts;
  results.tokens.fontSizes = cssStore.fontSizes;
  results.tokens.fontWeights = cssStore.fontWeights;
  results.tokens.spacing = cssStore.spacing;

  // Finalize overall stats
  results.stats.totalPages = visited.size;
  results.stats.totalAssets = results.assets.images.length + results.assets.svgs.length;
  results.stats.pagesCount = visited.size;
  results.stats.colorsCount = Object.keys(cssStore.colors).length;
  results.stats.fontsCount = Object.keys(cssStore.fonts).length;
  results.stats.assetsCount = results.assets.images.length + results.assets.svgs.length;

  results.detectedTechnologies = Array.from(allDetectedTechnologies);

  return results;
}

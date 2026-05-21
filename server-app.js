import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { crawlWebsite } from './crawler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve frontend static assets from public/
app.use(express.static(path.join(__dirname, 'public')));

// API: Perform crawl
app.post('/api/crawl', async (req, res) => {
  const { url, maxPages, maxDepth } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required.' });
  }

  try {
    // Validate URL syntax
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format. Please include http:// or https://' });
  }

  console.log(`Received crawl request for: ${url}`);
  try {
    const data = await crawlWebsite(url, maxPages || 10, maxDepth || 2);
    res.json(data);
  } catch (err) {
    console.error(`Crawl error for ${url}:`, err);
    res.status(500).json({ error: 'An error occurred during crawling.', details: err.message });
  }
});

// API: Export design files locally (variables.css, tailwind.config.js, and DESIGN.md)
app.post('/api/export-local', (req, res) => {
  const { designMd, tailwindConfig, cssVariables } = req.body;

  try {
    const exportsDir = path.join(__dirname, 'exports');
    
    // Check if writable or handle gracefully
    let localWriteSuccess = false;
    let paths = {};
    
    try {
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      // Write individual files
      if (designMd) {
        fs.writeFileSync(path.join(exportsDir, 'DESIGN.md'), designMd, 'utf8');
        fs.writeFileSync(path.join(__dirname, 'DESIGN.md'), designMd, 'utf8'); // Also save in root for Stitch MCP upload
      }
      if (tailwindConfig) {
        fs.writeFileSync(path.join(exportsDir, 'tailwind.config.js'), tailwindConfig, 'utf8');
      }
      if (cssVariables) {
        fs.writeFileSync(path.join(exportsDir, 'variables.css'), cssVariables, 'utf8');
      }
      localWriteSuccess = true;
      paths = {
        designMd: path.join(exportsDir, 'DESIGN.md'),
        rootDesignMd: path.join(__dirname, 'DESIGN.md'),
        tailwindConfig: path.join(exportsDir, 'tailwind.config.js'),
        cssVariables: path.join(exportsDir, 'variables.css')
      };
    } catch (writeErr) {
      console.warn('Local file write skipped or failed (likely read-only serverless filesystem):', writeErr.message);
    }

    if (localWriteSuccess) {
      res.json({
        success: true,
        message: 'Design system files exported successfully to local workspace!',
        paths
      });
    } else {
      res.json({
        success: true,
        message: 'Files compiled. Client-side download initiated (server disk is read-only).',
        serverlessMode: true
      });
    }
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to process export request.', details: err.message });
  }
});

export default app;

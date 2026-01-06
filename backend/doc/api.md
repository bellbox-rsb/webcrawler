# API Documentation

[← Back to README](../README.md)

## Crawler Service

### POST /crawl

Crawls a URL and returns content + metadata.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "html": "<html>...</html>",
  "markdown": "# Example...",
  "tech_stack": { ... },
  "media": {
    "images": [ ... ],
    "videos": [ ... ],
    "links": [ ... ]
  }
}
```

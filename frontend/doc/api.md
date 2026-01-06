# API Documentation

[← Back to README](../README.md)

## Crawler Service (Backend)

The backend exposes a RESTful API to handle web crawling operations.

### POST /crawl

Initiates a crawl for a specific URL.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "html": "<!DOCTYPE html>...",
  "tech_stack": {
    "frameworks": ["React", "Tailwind CSS"],
    "server": "Nginx"
  }
}
```

## Frontend Internals

### useCrawler Composable

Manages the state of the crawling process.

- `url`: Current URL input.
- `loading`: Boolean indicating if a crawl is in progress.
- `data`: The result data from the crawl (HTML, tech stack).
- `error`: Error message if the crawl failed.
- `crawl(url)`: Function to trigger the crawl.
- `reset()`: Function to clear the state.



# Web Crawler Backend

The backend service for the Web Crawler application, built with **Flask**.

## Features

- **Crawling API**: REST endpoint to crawl URLs and extract content.
- **Tech Stack Detection**: Analyzes response headers and HTML to identify technologies.
- **Media Extraction**: Extracts images, videos, and links.
- **Markdown Conversion**: Converts HTML content to clean Markdown.

## Tech Stack

- **Framework**: Flask
- **HTTP Client**: Requests
- **Parsing**: BeautifulSoup4
- **Testing**: Pytest

## Getting Started

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Application**
   ```bash
   python run.py
   ```
   Server runs on `http://localhost:5001`.

## Documentation

- [API Reference](doc/api.md)
- [Technical Architecture](doc/tech.md)

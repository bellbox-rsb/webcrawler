import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from typing import Dict, Any

from app.services.extractors import get_extractor
from app.services.tech_detector import analyze_tech_stack
from app.services.media_extractor import extract_media

def crawl_url(url: str) -> Dict[str, Any]:
    """
    Crawls the given URL, extracts its main content as Markdown,
    and detects the technology stack used.

    Args:
        url (str): The target URL to crawl.

    Returns:
        Dict[str, Any]: A dictionary containing:
            - success (bool): Whether the operation was successful.
            - markdown (Optional[str]): The converted markdown content.
            - tech_stack (Optional[Dict]): Detected technologies.
            - url (str): The provided URL.
            - error (Optional[str]): Error message if failed.
    """
    try:
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        # 1. Fetch Content (Single Request Optimization)
        headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; MarkdownCrawler/2.0; +https://github.com/yourusername/markdown-crawler)'
        }
        # Increased timeout slightly for slow sites, but rely on single request speedup
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()

        # Optimize: Use lxml if available, else fallback
        try:
            soup = BeautifulSoup(response.content, 'lxml')
        except Exception:
            soup = BeautifulSoup(response.content, 'html.parser')

        # 2. Detect Tech Stack (Reuse response)
        tech_stack = analyze_tech_stack(url, response.text, response.headers, soup)

        # 3. Extract Content using Strategy Pattern
        extractor = get_extractor(url)
        markdown_content = extractor.extract(soup, url)
        
        # Extract Metadata
        title = soup.title.string.strip() if soup.title and soup.title.string else url
        description = ""
        meta_desc = soup.find('meta', attrs={'name': 'description'}) or soup.find('meta', attrs={'property': 'og:description'})
        if meta_desc:
            description = meta_desc.get('content', '').strip()

        print(f"Crawl Success: Extracted {len(markdown_content)} chars of Markdown from {url}")

        # 4. Extract Media
        media_data = extract_media(soup, url)

        return {
            'success': True,
            'markdown': markdown_content,
            'html': str(soup),
            'tech_stack': tech_stack,
            'media': media_data,
            'metadata': {
                'title': title,
                'description': description,
                'url': url,
                'domain': urlparse(url).netloc
            },
            'url': url
        }

    except requests.exceptions.MissingSchema:
        return {'success': False, 'error': "Invalid URL format. Please include http:// or https://", 'status_code': 400}
    except requests.exceptions.ConnectionError:
        return {'success': False, 'error': "Failed to connect to the server. Check the URL or internet connection.", 'status_code': 502}
    except requests.exceptions.Timeout:
        return {'success': False, 'error': "Request timed out. The server took too long to respond.", 'status_code': 504}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {'success': False, 'error': f"An unexpected error occurred: {str(e)}", 'status_code': 500}

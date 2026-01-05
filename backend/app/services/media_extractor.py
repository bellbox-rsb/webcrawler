from bs4 import BeautifulSoup
from urllib.parse import urljoin
from typing import Dict, List

def extract_media(soup: BeautifulSoup, url: str) -> Dict[str, List[Dict[str, str]]]:
    """
    Extracts images, videos, and links from the page.
    """
    media = {
        'images': [],
        'videos': [],
        'links': []
    }
    
    # Images
    for img in soup.find_all('img', src=True):
        src = urljoin(url, img['src'])
        alt = img.get('alt', '')
        # Filter out tiny tracking pixels or icons if possible, but basic validation for now
        if src.startswith(('http://', 'https://')):
             media['images'].append({'src': src, 'alt': alt})

    # Videos (HTML5)
    for video in soup.find_all('video', src=True):
        src = urljoin(url, video['src'])
        if src:
             media['videos'].append({'src': src, 'title': 'HTML5 Video'})
    
    # Iframes (YouTube/Vimeo)
    for iframe in soup.find_all('iframe', src=True):
        src = iframe['src']
        if 'youtube.com' in src or 'youtu.be' in src or 'vimeo.com' in src:
             media['videos'].append({'src': src, 'title': 'Embedded Video'})

    # Links
    for a in soup.find_all('a', href=True):
        href = urljoin(url, a['href'])
        text = a.get_text(strip=True)
        # Limit to valid http links
        if href.startswith(('http://', 'https://')):
            media['links'].append({'href': href, 'text': text or href})
            
    # Limit results to avoid massive payloads
    media['images'] = media['images'][:20]
    media['videos'] = media['videos'][:10]
    media['links'] = media['links'][:20]

    return media

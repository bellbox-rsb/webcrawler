import requests
from bs4 import BeautifulSoup, Tag
# from markdownify import markdownify as md # Removed as we are returning HTML now
import builtwith
from Wappalyzer import Wappalyzer, WebPage
from urllib.parse import urlparse, urljoin
from typing import Dict, Any, List, Optional, Set

def crawl_url(url: str) -> Dict[str, Any]:
    """
    Crawls the given URL, extracts its main content as Markdown,
    and detects the technology stack used.

    Args:
        url (str): The target URL to crawl.

    Returns:
        Dict[str, Any]: A dictionary containing:
            - success (bool): Whether the operation was successful.
            - success (bool): Whether the operation was successful.
            - html (Optional[str]): The cleaned HTML content.
            - tech_stack (Optional[Dict]): Detected technologies.
            - url (str): The provided URL.
            - error (Optional[str]): Error message if failed.
    """
    try:
        # 1. Detect Tech Stack
        tech_stack = _detect_tech_stack(url)

        # 2. Fetch Content
        headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; MarkdownCrawler/2.0; +https://github.com/raksitbell/webcrawler)'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # 3. Enhance Tech Stack with Heuristics & Wappalyzer
        more_tech = _analyze_client_side(url, soup)
        tech_stack = _merge_tech_stacks(tech_stack, more_tech)

        # 4. Clean and Process Content
        _resolve_relative_links(soup, url)
        _embed_youtube_links(soup)
        _remove_clutter(soup)

        # 5. Extract Main Content
        html_content, title = _extract_html(soup)

        # 6. Extract Media for Gallery
        media = _extract_media(soup)

        return {
            'success': True,
            'html': html_content,
            'title': title,
            'tech_stack': tech_stack,
            'media': media,
            'url': url
        }

    except requests.exceptions.MissingSchema:
        return {'success': False, 'error': "Invalid URL format. Please include http:// or https://"}
    except requests.exceptions.ConnectionError:
        return {'success': False, 'error': "Failed to connect to the server. Check the URL or internet connection."}
    except requests.exceptions.Timeout:
        return {'success': False, 'error': "Request timed out. The server took too long to respond."}
    except Exception as e:
        return {'success': False, 'error': f"An unexpected error occurred: {str(e)}"}


def _detect_tech_stack(url: str) -> Dict[str, List[Dict[str, Optional[str]]]]:
    """Uses builtwith to detect server-side stack."""
    try:
        raw_stack = builtwith.builtwith(url)
        formatted_tech = {}
        for category, technologies in raw_stack.items():
            if not technologies: continue
            
            formatted_list = []
            for tech in technologies:
                # Heuristic: verify version extraction
                parts = tech.rsplit(' ', 1)
                if len(parts) == 2 and (parts[1][0].isdigit() or parts[1].lower().startswith('v')):
                    formatted_list.append({'name': parts[0], 'version': parts[1]})
                else:
                    formatted_list.append({'name': tech, 'version': None})
            
            formatted_tech[category] = formatted_list
        return formatted_tech
    except Exception:
        return {}


def _analyze_client_side(url: str, soup: BeautifulSoup) -> Set[str]:
    """Uses Wappalyzer and custom heuristics to detect client-side frameworks."""
    # Wappalyzer
    try:
        # Check for custom technologies.json
        import json
        import os
        
        tech_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'technologies.json')
        
        if os.path.exists(tech_file):
            with open(tech_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # handle different formats (apps or technologies key)
                techs = data.get('apps') or data.get('technologies') or data
                
                # Sanitize patterns (strings vs lists)
                techs = _sanitize_technologies(techs)
                
                # Must provide categories (using defaults from latest)
                default_wap = Wappalyzer.latest()
                wappalyzer = Wappalyzer(categories=default_wap.categories, technologies=techs)
        else:
            wappalyzer = Wappalyzer.latest()
            
        webpage = WebPage.new_from_url(url)
        wap_technologies = wappalyzer.analyze(webpage) or set()
    except Exception as e:
        print(f"Wappalyzer error: {e}")
        wap_technologies = set()

    # Custom Heuristics
    heuristics_found = set()
    html_str = str(soup)
    
    heuristic_map = {
        'React': ['data-reactroot', '_reactListening', 'react-dom'],
        'Vue.js': ['data-v-', '__vue__', 'vue-server-renderer'],
        'Next.js': ['id="__NEXT_DATA__"', 'next-router'],
        'Nuxt.js': ['id="__NUXT__"', 'data-n-head'],
        'Angular': ['ng-version', 'app-root', 'ng-content'],
        'Svelte': ['svelte-'],
        'Tailwind CSS': ['tailwindcss', 'text-gray-'],
        'Bootstrap': ['bootstrap.min.css', 'navbar-expand']
    }

    for tech, triggers in heuristic_map.items():
        if any(trigger in html_str for trigger in triggers):
            heuristics_found.add(tech)
            # Implied dependencies
            if tech == 'Next.js': heuristics_found.add('React')
            if tech == 'Nuxt.js': heuristics_found.add('Vue.js')

    return wap_technologies.union(heuristics_found)


def _merge_tech_stacks(server_side: Dict, client_side: Set[str]) -> Dict:
    """Merges client-side findings into the server-side dictionary."""
    if not client_side:
        return server_side
    
    if 'Detected' not in server_side:
        server_side['Detected'] = []

    # Gather existing names to avoid dupes
    existing_names = set()
    for techs in server_side.values():
        for t in techs:
            existing_names.add(t['name'].lower())

    for tech_name in client_side:
        if tech_name.lower() not in existing_names:
            server_side['Detected'].append({'name': tech_name, 'version': None})
            
    return server_side


def _resolve_relative_links(soup: BeautifulSoup, base_url: str):
    """Converts relative URLs in img and a tags to absolute."""
    for tag in soup.find_all(['img', 'a']):
        if tag.name == 'img' and tag.get('src'):
            tag['src'] = urljoin(base_url, tag['src'])
        if tag.name == 'a' and tag.get('href'):
            tag['href'] = urljoin(base_url, tag['href'])


def _remove_clutter(soup: BeautifulSoup):
    """Removes scripts, styles, and other non-content elements."""
    for tag in soup(["script", "style", "nav", "footer", "noscript"]):
        tag.decompose()
        
    # Handle iframes selectively
    for iframe in soup.find_all("iframe"):
        src = iframe.get('src', '')
        if "youtube.com" in src or "youtu.be" in src:
            continue
        iframe.decompose()


def _embed_youtube_links(soup: BeautifulSoup):
    """Converts YouTube links and existing iframes to standardized embeds."""
    # 1. Convert Links
    for a in soup.find_all('a', href=True):
        href = a['href']
        video_id = _extract_youtube_id(href)
        if video_id:
            iframe = soup.new_tag("iframe", src=f"https://www.youtube.com/embed/{video_id}", width="100%", height="400", frameborder="0", allowfullscreen="true")
            
            # Wrap in div for Tiptap detection
            wrapper = soup.new_tag("div", **{"data-youtube-video": ""})
            wrapper.append(iframe)
            a.replace_with(wrapper)

    # 2. Normalize Existing Iframes
    for iframe in soup.find_all('iframe'):
        src = iframe.get('src', '')
        video_id = _extract_youtube_id(src)
        if video_id:
            # Replace with clean iframe to ensure Tiptap recognition
            new_iframe = soup.new_tag("iframe", src=f"https://www.youtube.com/embed/{video_id}", width="100%", height="400", frameborder="0", allowfullscreen="true")
            
            # Wrap in div for Tiptap detection
            wrapper = soup.new_tag("div", **{"data-youtube-video": ""})
            wrapper.append(new_iframe)
            iframe.replace_with(wrapper)


def _extract_youtube_id(url: str) -> Optional[str]:
    """Extracts video ID from various YouTube URL formats."""
    if "youtube.com/watch" in url:
        parsed = urlparse(url)
        if 'v=' in parsed.query:
            return parsed.query.split('v=')[1].split('&')[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    elif "youtube.com/embed/" in url:
        return url.split("youtube.com/embed/")[1].split("?")[0]
    return None


def _extract_html(soup: BeautifulSoup) -> (str, str):
    """Extracts cleaned HTML from the main content area."""
    content = soup.find('main') or soup.find('article') or soup.find('div', {'id': 'content'}) or soup.body
    
    title = soup.title.string if soup.title else "Untitled"

    if content:
        return str(content), title
    return str(soup), title


def _extract_media(soup: BeautifulSoup) -> Dict[str, List[Dict[str, str]]]:
    """Extracts lists of images, videos, and links for the media gallery."""
    media = {
        'images': [],
        'videos': [],
        'links': []
    }

    # Images
    for img in soup.find_all('img'):
        src = img.get('src')
        if src:
            media['images'].append({
                'src': src,
                'alt': img.get('alt', 'Image')
            })

    # Videos (YouTube/Iframes)
    for iframe in soup.find_all('iframe'):
        src = iframe.get('src')
        if src:
            media['videos'].append({
                'src': src,
                'title': iframe.get('title', 'Video')
            })

    # Links
    seen_links = set()
    for a in soup.find_all('a', href=True):
        href = a.get('href')
        if href and href not in seen_links and not href.startswith('#') and not href.startswith('javascript:'):
            seen_links.add(href)
            media['links'].append({
                'href': href,
                'text': a.get_text(strip=True) or href
            })
            
    return media


def _sanitize_technologies(techs: Dict) -> Dict:
    """Sanitize technologies based on keys to match python-Wappalyzer format."""
    if not isinstance(techs, dict):
        return techs
        
    sanitized = {}
    pattern_keys = ['scriptSrc', 'html', 'script']
    dict_pattern_keys = ['headers', 'cookies', 'meta']
    
    for k, v in techs.items():
        if isinstance(v, dict):
             sanitized[k] = _sanitize_app(v, pattern_keys, dict_pattern_keys)
        else:
             sanitized[k] = v
    return sanitized


def _sanitize_app(app: Dict, pattern_keys: List[str], dict_pattern_keys: List[str]) -> Dict:
    new_app = app.copy()
    
    def clean_pattern(p):
        if isinstance(p, list):
            if not p: return ""
            for x in p:
                if isinstance(x, str): return x
            return ""
        return p

    for pk in pattern_keys:
        if pk in new_app:
            new_app[pk] = clean_pattern(new_app[pk])
            
    for dpk in dict_pattern_keys:
        if dpk in new_app and isinstance(new_app[dpk], dict):
            new_dict = {}
            for subk, subv in new_app[dpk].items():
                new_dict[subk] = clean_pattern(subv)
            new_app[dpk] = new_dict
            
    return new_app

import requests
from bs4 import BeautifulSoup, Tag
from markdownify import markdownify as md
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
            - markdown (Optional[str]): The converted markdown content.
            - tech_stack (Optional[Dict]): Detected technologies.
            - url (str): The provided URL.
            - error (Optional[str]): Error message if failed.
    """
    try:
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        # 1. Detect Tech Stack
        tech_stack = _detect_tech_stack(url)

        # 2. Fetch Content
        headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; MarkdownCrawler/2.0; +https://github.com/yourusername/markdown-crawler)'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # 3. Enhance Tech Stack with Heuristics & Wappalyzer
        more_tech = _analyze_client_side(url, soup)
        tech_stack = _merge_tech_stacks(tech_stack, more_tech)

        # 4. Clean and Process Content
        _resolve_relative_links(soup, url)
        _remove_clutter(soup)

        # 5. Extract Main Content
        markdown_content = _extract_markdown(soup)

        return {
            'success': True,
            'markdown': markdown_content,
            'tech_stack': tech_stack,
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
        wappalyzer = Wappalyzer.latest()
        webpage = WebPage.new_from_url(url)
        wap_technologies = wappalyzer.analyze(webpage) or set()
    except Exception:
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
    for script in soup(["script", "style", "nav", "footer", "iframe", "noscript"]):
        script.decompose()


def _extract_markdown(soup: BeautifulSoup) -> str:
    """Extracts markdown from the main content area."""
    content = soup.find('main') or soup.find('article') or soup.find('div', {'id': 'content'}) or soup.body
    if content:
        return md(str(content), heading_style="ATX")
    return md(str(soup), heading_style="ATX")

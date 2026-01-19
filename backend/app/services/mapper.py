import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
from typing import Dict, Any, List

def map_url(url: str) -> Dict[str, Any]:
    """
    Crawls the given URL and extracts all internal and external links.

    Args:
        url (str): The target URL to map.

    Returns:
        Dict[str, Any]: A dictionary containing:
            - success (bool): Whether the operation was successful.
            - internal (List[str]): List of internal links.
            - external (List[str]): List of external links.
            - url (str): The provided URL.
            - error (Optional[str]): Error message if failed.
    """
    try:
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; LinkMapper/1.0;)'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()

        try:
            soup = BeautifulSoup(response.content, 'lxml')
        except Exception:
            soup = BeautifulSoup(response.content, 'html.parser')

        internal_links = set()
        external_links = set()
        base_domain = urlparse(url).netloc

        for tag in soup.find_all('a', href=True):
            href = tag['href']
            full_url = urljoin(url, href)
            parsed_href = urlparse(full_url)
            
            # Skip invalid schemes (mailto, tel, javascript, etc.) and fragments
            if parsed_href.scheme not in ('http', 'https'):
                continue

            if parsed_href.netloc == base_domain:
                internal_links.add(full_url)
            else:
                external_links.add(full_url)

        return {
            'success': True,
            'internal': sorted(list(internal_links)),
            'external': sorted(list(external_links)),
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

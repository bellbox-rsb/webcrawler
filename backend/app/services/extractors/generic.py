from .base import BaseExtractor
from bs4 import BeautifulSoup

class GenericExtractor(BaseExtractor):
    """Default extractor for unknown domains."""
    
    def extract(self, soup: BeautifulSoup, base_url: str) -> str:
        self._resolve_relative_links(soup, base_url)
        self._clean_common(soup)
        
        content = soup.find('main') or soup.find('article') or soup.find('div', {'id': 'content'}) or soup.body
        
        if content:
            return self._to_markdown(content)
        return self._to_markdown(soup)

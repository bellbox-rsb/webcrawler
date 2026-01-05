from bs4 import BeautifulSoup
from markdownify import markdownify as md
from urllib.parse import urljoin

class BaseExtractor:
    """Base class for all content extractors."""
    
    def extract(self, soup: BeautifulSoup, base_url: str) -> str:
        """Main extraction method. Override this in subclasses."""
        raise NotImplementedError
    
    def _clean_common(self, soup: BeautifulSoup):
        """Removes scripts, styles, and handles iframe conversion."""
        # Remove standard clutter
        for tag in soup(["script", "style", "nav", "footer", "noscript", "aside"]):
            tag.decompose()
            
        # Handle iframes: Remove all, but convert YouTube to links first
        for iframe in soup.find_all("iframe"):
            # Check src, data-src, or data-embed-src
            src = iframe.get("src") or iframe.get("data-src") or iframe.get("data-embed-src") or ""
            
            if "youtube.com/embed" in src or "youtu.be" in src or "youtube-nocookie.com/embed" in src:
                 # Convert to standard watch URL if possible, or just link to source
                 new_tag = soup.new_tag("a", href=src)
                 new_tag.string = f"Watch Video ({src})"
                 iframe.replace_with(new_tag)
            else:
                 iframe.decompose()

    def _resolve_relative_links(self, soup: BeautifulSoup, base_url: str):
        """Converts relative URLs in img and a tags to absolute."""
        for tag in soup.find_all(['img', 'a']):
            if tag.name == 'img' and tag.get('src'):
                tag['src'] = urljoin(base_url, tag['src'])
            if tag.name == 'a' and tag.get('href'):
                tag['href'] = urljoin(base_url, tag['href'])

    def _to_markdown(self, content_soup) -> str:
        """Converts soup object to markdown."""
        return md(str(content_soup), heading_style="ATX")

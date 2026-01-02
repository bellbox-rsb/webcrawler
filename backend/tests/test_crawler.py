import unittest
from unittest.mock import patch, MagicMock
from app.services.crawler import crawl_url
import requests

class TestCrawler(unittest.TestCase):

    @patch('app.services.crawler.requests.get')
    # Note: We are mocking builtwith and Wappalyzer via sys.modules or direct patching in the new Docker environment
    # ideally, but for unit tests, patching where it's imported is key.
    # checking imports in crawler.py: 
    # import builtwith
    # from Wappalyzer import Wappalyzer, WebPage
    @patch('app.services.crawler.builtwith.builtwith')
    @patch('app.services.crawler.Wappalyzer.latest')
    @patch('app.services.crawler.WebPage.new_from_url')
    def test_crawl_url_success(self, mock_webpage, mock_wappalyzer, mock_builtwith, mock_get):
        # Mock tech stack detection
        mock_builtwith.return_value = {'web-servers': ['Nginx'], 'javascript-frameworks': ['React']}
        
        # Mock Wappalyzer
        mock_wappalyzer_instance = MagicMock()
        mock_wappalyzer_instance.analyze.return_value = {'Flask', 'Python'}
        mock_wappalyzer.return_value = mock_wappalyzer_instance
        
        # Mock HTML response
        mock_response = MagicMock()
        mock_response.content = b"<html><head><title>Test Page</title></head><body><h1>Test Header</h1><p>Test Content</p></body></html>"
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        url = "https://example.com"
        result = crawl_url(url)

        self.assertTrue(result['success'])
        # Updated assertion: checks for HTML content, not markdown
        self.assertIn("<h1>Test Header</h1>", result['html'])
        self.assertEqual(result['title'], "Test Page")
        # Check for normalized tech stack
        self.assertEqual(result['tech_stack']['web-servers'][0]['name'], 'Nginx')
        
        # Check for media extraction
        self.assertIn('media', result)
        self.assertIsInstance(result['media']['images'], list)
        self.assertIsInstance(result['media']['videos'], list)
        self.assertIsInstance(result['media']['links'], list)

    @patch('app.services.crawler.requests.get')
    def test_crawl_url_youtube_embed(self, mock_get):
        # Mock HTML with YouTube link
        mock_response = MagicMock()
        html_content = '<html><body><p>Check this out:</p><a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Video</a></body></html>'
        mock_response.content = html_content.encode('utf-8')
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        # Mock dependencies
        with patch('app.services.crawler.builtwith.builtwith', return_value={}), \
             patch('app.services.crawler.Wappalyzer.latest'), \
             patch('app.services.crawler.WebPage.new_from_url'):
            
            result = crawl_url("https://example.com")
            
            self.assertTrue(result['success'])
            # Check if iframe is present and correct (wrapped in div)
            self.assertIn('<div data-youtube-video="">', result['html'])
            self.assertIn('<iframe', result['html'])
            self.assertIn('src="https://www.youtube.com/embed/dQw4w9WgXcQ"', result['html'])
            self.assertNotIn('<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"', result['html'])

        
    @patch('app.services.crawler.requests.get')
    def test_crawl_url_connection_error(self, mock_get):
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection Refused")
        result = crawl_url("https://bad-url.com")
        self.assertFalse(result['success'])
        self.assertIn("Failed to connect", result['error'])

    @patch('app.services.crawler.requests.get')
    def test_crawl_url_timeout(self, mock_get):
        mock_get.side_effect = requests.exceptions.Timeout("Timed out")
        result = crawl_url("https://slow-url.com")
        self.assertFalse(result['success'])
        self.assertIn("Request timed out", result['error'])

if __name__ == '__main__':
    unittest.main()

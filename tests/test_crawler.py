import unittest
from unittest.mock import patch, MagicMock
from app.services.crawler import crawl_url
import requests

class TestCrawler(unittest.TestCase):

    @patch('app.services.crawler.requests.get')
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
        mock_response.content = b"<html><body><h1>Test Header</h1><p>Test Content</p></body></html>"
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        url = "https://example.com"
        result = crawl_url(url)

        self.assertTrue(result['success'])
        self.assertIn("# Test Header", result['markdown'])
        # Check for new structure: {'web-servers': [{'name': 'Nginx', 'version': None}], ...}
        self.assertEqual(result['tech_stack']['web-servers'][0]['name'], 'Nginx')
        self.assertEqual(result['url'], url)

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

    def test_crawl_url_missing_schema(self):
        # Requests usually handles this, but our try-catch block specifically catches MissingSchema
        # However, requests.get might raise it directly if we don't handle it before calling get.
        # In our implementation, we call requests.get immediately.
        
        # To test this, we can rely on requests.get raising MissingSchema for invalid URLs
        result = crawl_url("invalid-url.com")
        
        self.assertFalse(result['success'])
        self.assertIn("Invalid URL format", result['error'])

if __name__ == '__main__':
    unittest.main()

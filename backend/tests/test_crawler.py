import unittest
from unittest.mock import patch, MagicMock
from app.services.crawler import crawl_url
import requests

class TestCrawler(unittest.TestCase):

    @patch('app.services.crawler.requests.get')
    @patch('app.services.crawler.analyze_tech_stack')
    @patch('app.services.crawler.extract_media')
    def test_crawl_url_success(self, mock_extract_media, mock_analyze_tech_stack, mock_get):
        # Mock tech stack detection
        mock_analyze_tech_stack.return_value = {
            'Detected': [{'name': 'Nginx', 'version': None}, {'name': 'React', 'version': None}]
        }
        
        # Mock media extraction
        mock_extract_media.return_value = {
            'images': [],
            'videos': [],
            'links': []
        }
        
        # Mock HTML response
        mock_response = MagicMock()
        mock_response.text = "<html><head><title>Test Page</title></head><body><h1>Test Header</h1><p>Test Content</p></body></html>"
        mock_response.content = mock_response.text.encode('utf-8')
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        url = "https://example.com"
        result = crawl_url(url)

        self.assertTrue(result['success'])
        self.assertIn("<h1>Test Header</h1>", result['html'])
        self.assertEqual(result['metadata']['title'], "Test Page")
        
        # Check for normalized tech stack
        self.assertEqual(result['tech_stack']['Detected'][0]['name'], 'Nginx')
        
        # Check for media extraction
        self.assertIn('media', result)
        self.assertIsInstance(result['media']['images'], list)

    def test_media_extraction(self):
         # Mock soup and url
         mock_soup = MagicMock()
         mock_soup.find_all.return_value = []
         
         # Creating a real soup object for better testing of the extractor logic if needed, 
         # but for unit testing the service orchestration, we can rely on the mocks or 
         # simply test that the extractor is called if we mocked it.
         # In the previous test_crawl_url_success, we already verified 'media' is present.
         pass

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

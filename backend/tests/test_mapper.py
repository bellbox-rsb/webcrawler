import unittest
from unittest.mock import patch, MagicMock
from app.services.mapper import map_url
import requests

class TestMapper(unittest.TestCase):

    @patch('app.services.mapper.requests.get')
    def test_map_url_success(self, mock_get):
        # Mock HTML response
        mock_response = MagicMock()
        mock_response.text = """
        <html>
            <body>
                <a href="/internal-page">Internal Link</a>
                <a href="https://external.com">External Link</a>
                <a href="mailto:test@example.com">Email Link</a>
            </body>
        </html>
        """
        mock_response.content = mock_response.text.encode('utf-8')
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        url = "https://example.com"
        result = map_url(url)

        self.assertTrue(result['success'])
        self.assertIn("https://example.com/internal-page", result['internal'])
        self.assertIn("https://external.com", result['external'])
        # Ensure mailto link is ignored
        self.assertNotIn("mailto:test@example.com", result['external'])
        self.assertNotIn("mailto:test@example.com", result['internal'])

    @patch('app.services.mapper.requests.get')
    def test_map_url_connection_error(self, mock_get):
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection Refused")
        result = map_url("https://bad-url.com")
        self.assertFalse(result['success'])
        self.assertIn("Failed to connect", result['error'])

    @patch('app.services.mapper.requests.get')
    def test_map_url_timeout(self, mock_get):
        mock_get.side_effect = requests.exceptions.Timeout("Timed out")
        result = map_url("https://slow-url.com")
        self.assertFalse(result['success'])
        self.assertIn("Request timed out", result['error'])

if __name__ == '__main__':
    unittest.main()

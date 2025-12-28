import unittest
from unittest.mock import patch
from app import create_app

class TestApp(unittest.TestCase):

    def setUp(self):
        self.app = create_app().test_client()
        self.app.testing = True

    def test_index_route_get(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Markdown Crawler', response.data)

    @patch('app.routes.crawl_url')
    def test_crawl_route_post_success(self, mock_crawl):
        # Mock successful crawl
        mock_crawl.return_value = {
            'success': True,
            'markdown': '# Success',
            'tech_stack': {'Server': [{'name': 'Nginx', 'version': '1.0'}]},
            'url': 'https://example.com'
        }
        
        response = self.app.post('/', data={'url': 'https://example.com'})
        
        self.assertEqual(response.status_code, 200)
        # Check if the markdown is properly embedded in the hidden textarea
        self.assertIn(b'># Success</textarea>', response.data)
        self.assertIn(b'Nginx', response.data)

    @patch('app.routes.crawl_url')
    def test_crawl_route_post_failure(self, mock_crawl):
        # Mock failed crawl
        mock_crawl.return_value = {
            'success': False,
            'error': 'Something went wrong'
        }
        
        response = self.app.post('/', data={'url': 'https://fail.com'})
        
        # Should render index with error (which uses our Toast mechanism now)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Something went wrong', response.data)

    def test_download_route(self):
        response = self.app.post('/download', data={'markdown_content': '# Valid Markdown'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['Content-Disposition'], 'attachment; filename=crawled_content.md')
        self.assertEqual(response.data, b'# Valid Markdown')

    def test_download_route_empty(self):
        response = self.app.post('/download', data={})
        self.assertEqual(response.status_code, 400)

if __name__ == '__main__':
    unittest.main()

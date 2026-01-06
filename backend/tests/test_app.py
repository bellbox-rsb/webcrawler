import unittest
from unittest.mock import patch
from app import create_app

class TestApp(unittest.TestCase):

    def setUp(self):
        self.app = create_app().test_client()
        self.app.testing = True

    def test_health_check(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['status'], 'online')
        self.assertEqual(response.json['version'], 'v3.0.0')

    @patch('app.routes.crawl_url')
    def test_crawl_route_success(self, mock_crawl):
        # Mock successful crawl
        mock_crawl.return_value = {
            'success': True,
            'html': '<h1>Success</h1>',
            'title': 'Test Page',
            'tech_stack': {'Server': [{'name': 'Nginx', 'version': '1.0'}]},
            'url': 'https://example.com'
        }
        
        response = self.app.post('/crawl', json={'url': 'https://example.com'})
        
        self.assertEqual(response.status_code, 200)
        data = response.json
        self.assertTrue(data['success'])
        self.assertEqual(data['html'], '<h1>Success</h1>')
        self.assertEqual(data['title'], 'Test Page')

    @patch('app.routes.crawl_url')
    def test_crawl_route_failure(self, mock_crawl):
        # Mock failed crawl
        mock_crawl.return_value = {
            'success': False,
            'error': 'Something went wrong'
        }
        
        response = self.app.post('/crawl', json={'url': 'https://fail.com'})
        
        self.assertEqual(response.status_code, 500)
        self.assertFalse(response.json['success'])
        self.assertEqual(response.json['error'], 'Something went wrong')

    def test_crawl_route_missing_url(self):
        response = self.app.post('/crawl', json={})
        self.assertEqual(response.status_code, 400)
        self.assertIn('Please provide a URL', response.json['error'])

if __name__ == '__main__':
    unittest.main()

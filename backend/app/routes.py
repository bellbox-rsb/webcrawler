from flask import Blueprint, jsonify, request
from app.services.crawler import crawl_url

main = Blueprint('main', __name__)

@main.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online", 
        "service": "WebCrawler Backend", 
        "version": "v3.0.0"
    }), 200

@main.route('/crawl', methods=['POST'])
def crawl():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({"error": "Please provide a URL in the request body", "success": False}), 400
    
    url = data['url']
    result = crawl_url(url)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), result.get('status_code', 500)

from flask import Blueprint, jsonify, request
from app.services.crawler import crawl_url
from app.services.mapper import map_url

main = Blueprint('main', __name__)

@main.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online", 
        "service": "WebCrawler Backend"
    }), 200

@main.route('/crawl', methods=['POST'])
def crawl():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({"success": False, "error": "Please provide a URL in the request body"}), 400
    
    url = data['url']
    mode = data.get('mode', 'crawl')

    try:
        if mode == 'map':
            result = map_url(url)
        else:
            result = crawl_url(url)

        if result.get('success'):
            return jsonify(result), 200
        else:
            status_code = result.get('status_code', 500)
            return jsonify(result), status_code
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

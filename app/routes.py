from flask import Blueprint, render_template, request
from app.services.crawler import crawl_url
import markdown
import os

main = Blueprint('main', __name__)

@main.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        url = request.form.get('url')
        if not url:
            return render_template('index.html', error="Please enter a URL")
        
        result = crawl_url(url)
        
        if result['success']:
            return render_template('index.html', 
                                   markdown=result['markdown'], 
                                   tech_stack=result['tech_stack'],
                                   url=result['url'])
        else:
            return render_template('index.html', error=result['error'], url=url)
            
    return render_template('index.html')


@main.route('/docs')
@main.route('/docs/<path:filename>')
def documentation(filename=None):
    """
    Renders documentation pages.
    - /docs -> README.md
    - /docs/docs/tech.md -> docs/tech.md
    """
    try:
        base_dir = os.path.dirname(os.path.dirname(__file__))
        
        if not filename:
             # Serve README.md at /docs
            file_path = os.path.join(base_dir, 'README.md')
        else:
            # Handle the relative links from README (e.g. docs/tech.md) which might come in as docs/docs/tech.md
            # Clean up the path to prevent directory traversal
            clean_name = filename.strip('/')
            
            # If the browser request included 'docs/' prefix (common if link was relative "docs/tech.md" from "/docs"),
            # ensure we map it to the actual file system path.
            # Our docs are in /workspaces/crawler/docs/
            
            # Safe logic: join base directory with the requested filename
            # logic: if filename is "docs/tech.md", path is base/docs/tech.md
            # logic: if filename is "tech.md" (if user navigated manually), path is base/docs/tech.md ? 
            # The links in README are explicit 'docs/tech.md'.
            
            file_path = os.path.join(base_dir, clean_name)
            
            # Security check: ensure the file is within the project directory
            if not os.path.abspath(file_path).startswith(base_dir):
                return render_template('doc.html', content="<h1>403 Forbidden</h1><p>Invalid file path.</p>")
            
            if not os.path.exists(file_path):
                # Try prepending docs/ if valid
                if not clean_name.startswith('docs/'):
                     possible_path = os.path.join(base_dir, 'docs', clean_name)
                     if os.path.exists(possible_path):
                         file_path = possible_path
                     else:
                         return render_template('doc.html', content=f"<h1>404 Not Found</h1><p>Documentation '{clean_name}' not found.</p>")
                else:
                    return render_template('doc.html', content=f"<h1>404 Not Found</h1><p>Documentation '{clean_name}' not found.</p>")

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Convert Markdown to HTML
        # 'md_in_html' allows parsing markdown inside HTML blocks (like <div align="center">)
        html_content = markdown.markdown(content, extensions=['fenced_code', 'tables', 'md_in_html'])
        
        return render_template('doc.html', content=html_content)
    except Exception as e:
        return render_template('doc.html', content=f"<h1>Error loading documentation</h1><p>{str(e)}</p>")

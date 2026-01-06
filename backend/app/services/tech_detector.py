from bs4 import BeautifulSoup
from Wappalyzer import Wappalyzer, WebPage
from typing import Dict, Set

# Initialize Wappalyzer lazily to avoid startup delays
_wappalyzer = None

def get_wappalyzer():
    global _wappalyzer
    if _wappalyzer is None:
        try:
            _wappalyzer = Wappalyzer.latest()
        except Exception as e:
            print(f"Warning: Could not initialize Wappalyzer: {e}")
            # Fallback to a basic instance or None
            _wappalyzer = False # Use False to indicate attempted but failed
    return _wappalyzer

def analyze_tech_stack(url: str, html: str, headers: dict, soup: BeautifulSoup) -> Dict:
    """
    Detects tech stack using Wappalyzer (fed with existing content) and custom heuristics.
    """
    detected_tech = {}
    
    # 1. Wappalyzer (Reusing fetched content)
    wap_technologies = set()
    wappalyzer_instance = get_wappalyzer()
    if wappalyzer_instance:
        try:
            webpage = WebPage(url, html=html, headers=headers)
            wap_technologies = wappalyzer_instance.analyze(webpage) or set()
        except Exception:
            pass
            
    # 2. Custom Heuristics (Faster than Wappalyzer for common stuff)
    heuristics_found = set()
    # Convert regex checks to be efficient if possible, but str(soup) is consistent
    html_str = str(soup)
    
    heuristic_map = {
        'React': ['data-reactroot', '_reactListening', 'react-dom'],
        'Vue.js': ['data-v-', '__vue__', 'vue-server-renderer'],
        'Next.js': ['id="__NEXT_DATA__"', 'next-router'],
        'Nuxt.js': ['id="__NUXT__"', 'data-n-head'],
        'Angular': ['ng-version', 'app-root', 'ng-content'],
        'Svelte': ['svelte-'],
        'Tailwind CSS': ['tailwindcss', 'text-gray-'],
        'Bootstrap': ['bootstrap.min.css', 'navbar-expand']
    }

    for tech, triggers in heuristic_map.items():
        if any(trigger in html_str for trigger in triggers):
            heuristics_found.add(tech)
            # Implied dependencies
            if tech == 'Next.js': heuristics_found.add('React')
            if tech == 'Nuxt.js': heuristics_found.add('Vue.js')

    # Merge results
    all_techs = wap_technologies.union(heuristics_found)
    
    if all_techs:
        detected_tech['Detected'] = [{'name': tech, 'version': None} for tech in all_techs]
    
    return detected_tech

from urllib.parse import urlparse
from .generic import GenericExtractor

# Legacy extractors removed per user request
# from .survivetheark import SurviveTheArkExtractor
# from .paradox import ParadoxExtractor

def get_extractor(url: str):
    """Factory function to return the appropriate extractor for a URL."""
    # domain = urlparse(url).netloc.lower()
    
    # if 'survivetheark.com' in domain:
    #     return SurviveTheArkExtractor()
    # elif 'paradoxinteractive.com' in domain:
    #     return ParadoxExtractor()
    
    return GenericExtractor()

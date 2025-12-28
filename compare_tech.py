from Wappalyzer import Wappalyzer, WebPage
import builtwith
import json
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")

def compare(url):
    print(f"Analyzing {url}...\n")

    # BuiltWith
    print("--- BuiltWith ---")
    try:
        bw_res = builtwith.builtwith(url)
        print(json.dumps(bw_res, indent=2))
    except Exception as e:
        print(f"Error: {e}")

    # Wappalyzer
    print("\n--- Wappalyzer ---")
    try:
        wappalyzer = Wappalyzer.latest()
        webpage = WebPage.new_from_url(url)
        wap_res = wappalyzer.analyze(webpage)
        print(json.dumps(list(wap_res), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    compare("https://www.google.com")
    compare("https://vuejs.org")

from google import genai
import requests
import json
import os
import itertools
import re
from dotenv import load_dotenv

load_dotenv()

KEYS = [k for k in [
    os.getenv("GEMINI_KEY_1"),
    os.getenv("GEMINI_KEY_2"),
    os.getenv("GEMINI_KEY_3"),
] if k]

if not KEYS:
    raise ValueError("No Gemini API keys found. Set GEMINI_KEY_1, GEMINI_KEY_2, GEMINI_KEY_3 in .env")

key_pool = itertools.cycle(KEYS)
SERPAPI_KEY = os.getenv("SERPAPI_KEY")
MODEL = "gemini-2.0-flash-lite"


def get_client():
    return genai.Client(api_key=next(key_pool))


def fetch_market_prices(product_name, gadget_type="smartphone"):
    if not product_name or product_name.strip() == "":
        return _empty_market_data()

    search_name = product_name.strip()

    if SERPAPI_KEY:
        try:
            result = _serpapi_search(search_name, gadget_type)
            if not result.get("new_prices", {}).get("amazon_price") and not result.get("new_prices", {}).get("flipkart_price") and not result.get("used_prices", {}).get("olx_average"):
                return _fallback_estimate(search_name, gadget_type)
            return result
        except Exception:
            pass

    return _fallback_estimate(search_name, gadget_type)


def _serpapi_search(product_name, gadget_type="smartphone"):
    category_hint = {
        "smartphone": "smartphone",
        "laptop": "laptop",
        "tablet": "tablet",
        "earbuds": "earbuds",
        "bt_speaker": "bluetooth speaker",
    }.get(gadget_type, gadget_type)

    accessory_keywords = [
        "case", "cover", "tempered", "glass", "protector", "charger", "cable",
        "adapter", "battery", "back cover", "housing", "panel", "screen guard",
        "display combo", "replacement", "repair", "spare", "lens", "camera glass",
        "skin", "pouch", "bumper"
    ]

    min_reasonable_price = {
        "smartphone": 3000,
        "laptop": 10000,
        "tablet": 5000,
        "earbuds": 1000,
        "bt_speaker": 1200,
    }.get(gadget_type, 1000)

    def search(query):
        r = requests.get(
            "https://serpapi.com/search",
            params={
                "engine": "google_shopping",
                "q": query,
                "gl": "in",
                "hl": "en",
                "api_key": SERPAPI_KEY,
            },
            timeout=10,
        )
        return r.json().get("shopping_results", [])

    def parse_price(price_str):
        try:
            cleaned = price_str.replace("₹", "").replace(",", "").strip()
            cleaned = cleaned.split()[0]
            return int(float(cleaned))
        except Exception:
            return None

    def normalize_words(text):
        return re.findall(r"[a-z0-9]+", (text or "").lower())

    product_words = set(normalize_words(product_name))
    strong_words = {w for w in product_words if len(w) >= 3}

    def looks_like_accessory(title):
        t = (title or "").lower()
        return any(word in t for word in accessory_keywords)

    def title_match_score(title):
        title_words = set(normalize_words(title))
        return len(strong_words & title_words)

    def is_reasonable_result(result, used=False):
        title = result.get("title", "") or ""
        price = parse_price(result.get("price", ""))
        if not price or price < min_reasonable_price:
            return False
        if looks_like_accessory(title):
            return False
        overlap = title_match_score(title)
        if overlap == 0:
            return False
        if not used and overlap < 2 and len(strong_words) >= 2:
            return False
        return True

    def filter_results(results, used=False):
        return [r for r in results if is_reasonable_result(r, used=used)]

    def get_price(results, keyword):
        keyword = keyword.lower()
        best = None
        best_score = -1
        for r in results:
            source = (r.get("source", "") or "").lower()
            title = r.get("title", "") or ""
            price = parse_price(r.get("price", ""))
            if not price:
                continue
            score = title_match_score(title)
            if keyword in source and score > best_score:
                best = price
                best_score = score
        return best

    def parse_prices(results):
        prices = []
        for r in results:
            p = parse_price(r.get("price", ""))
            if p:
                prices.append(p)
        return prices

    exact_new_results = filter_results(search(f"{product_name} {category_hint} new price India"), used=False)
    fallback_new_results = filter_results(search(f"{product_name} price India"), used=False)
    used_results = filter_results(search(f"{product_name} {category_hint} used second hand India"), used=True)
    new_results = exact_new_results if exact_new_results else fallback_new_results

    new_prices_list = parse_prices(new_results)
    used_prices_list = parse_prices(used_results)
    amazon_price = get_price(new_results, "amazon")
    flipkart_price = get_price(new_results, "flipkart")  # FIXED: was flipkartPrice
    cashify_price = get_price(used_results, "cashify")
    olx_avg = int(sum(used_prices_list) / len(used_prices_list)) if used_prices_list else None
    lowest_new = min(new_prices_list) if new_prices_list else None

    if amazon_price and flipkart_price:
        average_new_price = int((amazon_price + flipkart_price) / 2)  # FIXED: was flipkartPrice
    elif amazon_price:
        average_new_price = amazon_price
    elif flipkart_price:
        average_new_price = flipkart_price
    else:
        average_new_price = lowest_new

    return {
        "product_searched": product_name,
        "search_successful": True,
        "used_prices": {
            "olx_listings": [],
            "olx_lowest": min(used_prices_list) if used_prices_list else None,
            "olx_average": olx_avg,
            "olx_highest": max(used_prices_list) if used_prices_list else None,
        },
        "refurbished_prices": {
            "cashify_price": cashify_price,
            "cashify_condition": "Good",
            "cashify_url": None,
            "cashify_warranty": "6 months",
        },
        "new_prices": {
            "amazon_price": amazon_price,
            "amazon_url": None,
            "flipkart_price": flipkart_price,
            "flipkart_url": None,
            "lowest_new": lowest_new,
            "average_new_price": average_new_price,
        },
        "market_summary": {
            "fair_used_price": int(lowest_new * 0.45) if lowest_new else olx_avg,
            "average_new_price": average_new_price,
            "price_trend": "Stable",
            "demand_level": "Medium",
            "depreciation_note": f"Typical depreciation for {category_hint} in India",
        },
        "alternatives": [],
        "sources_checked": ["Google Shopping India via SerpAPI"],
    }


def _fallback_estimate(product_name, gadget_type="smartphone"):
    prompt = f"""
You are a market research expert for Indian second-hand electronics market (2025-2026).

Give realistic price estimates for: {product_name} ({gadget_type})

Return ONLY valid JSON.

{{
    "product_searched": "{product_name}",
    "search_successful": false,
    "note": "Estimated from AI knowledge — verify on OLX/Amazon before buying",
    "used_prices": {{"olx_listings": [], "olx_lowest": 0, "olx_average": 0, "olx_highest": 0}},
    "refurbished_prices": {{"cashify_price": 0, "cashify_condition": "Good", "cashify_url": null, "cashify_warranty": "6 months typically"}},
    "new_prices": {{"amazon_price": 0, "amazon_url": null, "flipkart_price": 0, "flipkart_url": null, "lowest_new": 0, "average_new_price": 0}},
    "market_summary": {{"fair_used_price": 0, "average_new_price": 0, "price_trend": "Stable", "demand_level": "Medium", "depreciation_note": "Estimated depreciation for {gadget_type} in India"}},
    "alternatives": [],
    "sources_checked": ["AI knowledge base (offline estimate)"]
}}
"""
    try:
        client = get_client()
        response = client.models.generate_content(model=MODEL, contents=prompt)
        text = response.text.strip().replace("```json", "").replace("```", "").strip()
        start = text.find("{")
        end = text.rfind("}") + 1
        if start != -1:
            text = text[start:end]
        return json.loads(text)
    except Exception:
        return _empty_market_data()


def _empty_market_data():
    return {
        "product_searched": "",
        "search_successful": False,
        "note": "Could not fetch market data",
        "used_prices": {"olx_listings": [], "olx_lowest": None, "olx_average": None, "olx_highest": None},
        "refurbished_prices": {"cashify_price": None, "cashify_condition": "Unknown", "cashify_url": None},
        "new_prices": {"amazon_price": None, "amazon_url": None, "flipkart_price": None, "flipkart_url": None, "lowest_new": None, "average_new_price": None},
        "market_summary": {"fair_used_price": None, "average_new_price": None, "price_trend": "Unknown", "demand_level": "Unknown"},
        "alternatives": [],
        "sources_checked": [],
    }
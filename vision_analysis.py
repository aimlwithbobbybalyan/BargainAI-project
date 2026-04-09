from groq import Groq
from PIL import Image
import base64
import json
import os
import io
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_KEY"))
MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
MAX_IMAGE_SIZE = 1024
MIN_CONFIDENCE = 35


def resize_and_encode(path):
    with Image.open(path) as img:
        img = img.convert("RGB")
        w, h = img.size
        if max(w, h) > MAX_IMAGE_SIZE:
            ratio = MAX_IMAGE_SIZE / max(w, h)
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        data = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/jpeg;base64,{data}"


def clamp_percent(value, default=0):
    try:
        value = int(value)
    except Exception:
        return default
    return max(0, min(100, value))


def fallback_box_from_location(location_text, label="damage"):
    text = (location_text or "").lower()
    if "top-left" in text:
        return {"label": label, "location_text": location_text, "top": 10, "left": 8, "width": 22, "height": 16}
    if "top-right" in text:
        return {"label": label, "location_text": location_text, "top": 10, "left": 70, "width": 22, "height": 16}
    if "bottom-left" in text:
        return {"label": label, "location_text": location_text, "top": 72, "left": 8, "width": 22, "height": 16}
    if "bottom-right" in text:
        return {"label": label, "location_text": location_text, "top": 72, "left": 70, "width": 22, "height": 16}
    if "center" in text or "middle" in text:
        return {"label": label, "location_text": location_text, "top": 38, "left": 34, "width": 30, "height": 20}
    if "camera" in text:
        return {"label": label, "location_text": location_text, "top": 10, "left": 64, "width": 20, "height": 18}
    if "screen" in text or "display" in text:
        return {"label": label, "location_text": location_text, "top": 18, "left": 18, "width": 64, "height": 52}
    if "back" in text:
        return {"label": label, "location_text": location_text, "top": 20, "left": 18, "width": 64, "height": 52}
    if "charging port" in text or "bottom side" in text:
        return {"label": label, "location_text": location_text, "top": 78, "left": 36, "width": 28, "height": 10}
    if "left side" in text or "left edge" in text:
        return {"label": label, "location_text": location_text, "top": 28, "left": 6, "width": 16, "height": 42}
    if "right side" in text or "right edge" in text:
        return {"label": label, "location_text": location_text, "top": 28, "left": 78, "width": 16, "height": 42}
    return {"label": label, "location_text": location_text, "top": 32, "left": 28, "width": 42, "height": 22}


def normalize_damage_boxes(boxes):
    normalized = []
    if not isinstance(boxes, list):
        return normalized
    for box in boxes:
        if not isinstance(box, dict):
            continue
        top = clamp_percent(box.get("top", 0))
        left = clamp_percent(box.get("left", 0))
        width = clamp_percent(box.get("width", 20), 20)
        height = clamp_percent(box.get("height", 20), 20)
        if left + width > 100:
            width = max(1, 100 - left)
        if top + height > 100:
            height = max(1, 100 - top)
        normalized.append({
            "label": str(box.get("label", "damage")).strip() or "damage",
            "location_text": str(box.get("location_text", "")).strip(),
            "top": top,
            "left": left,
            "width": width,
            "height": height,
        })
    return normalized


def analyse_single_image(image_b64, seller_price, usage_period, gadget_type, user_issues, device_model, image_index, total_images):
    prompt = f"""
You are an expert second-hand mobile and gadget evaluator in India with 10 years of real shop-floor experience.

You inspect gadgets exactly like a professional resale shop owner.
Analyse all uploaded pictures carefully, compare them together, and do not ignore small scratches, cracks, dents, edge wear, back-panel marks, or camera-area damage visible in any image.

You are examining photo {image_index} of {total_images}.

USER PROVIDED:
- Seller asking price: Rs {seller_price}
- Usage period: {usage_period}
- Device model (user says): {device_model if device_model else 'Not mentioned — identify from photo'}
- Issues user reported: {user_issues if user_issues else 'None'}

IMPORTANT RULES:
- If user mentioned the device model, use it as primary identifier.
- If damage is visible in even one image, include it in the final result.
- If damage_found is not empty, damage_boxes must not be empty.
- If exact box is uncertain, return the closest approximate visible region.
- If there is screen reflection, still inspect visible edges, corners, frame, and body condition separately.
- If the photo is unclear, mention that in ai_reasoning, but still report any visible damage that is reasonably noticeable.

Return ONLY valid JSON. No markdown. No extra text.

{{
    "product_name": "Full brand + model",
    "category": "{gadget_type}",
    "specs_detected": "Any visible specs or Unknown",
    "condition_score": 0,
    "condition_label": "Excellent or Good or Fair or Poor",
    "usage_estimation": {{
        "estimated_age": "e.g. 1.5 years",
        "source": "user mentioned or estimated from photos",
        "usage_level": "Light or Medium or Heavy",
        "screen_wear": "None or Minimal or Moderate or Heavy",
        "overall_wear": "Like new or Lightly used or Moderately used or Heavily used"
    }},
    "damage_found": ["each visible scratch, crack, dent, or cosmetic issue in THIS photo"],
    "damage_locations": ["exact location of each damage"],
    "damage_boxes": [
        {{
            "label": "screen scratches",
            "location_text": "center of display",
            "top": 20,
            "left": 22,
            "width": 46,
            "height": 28
        }}
    ],
    "damage_severity": "None or Minor or Moderate or Severe",
    "estimated_fair_value_inr": 0,
    "new_price_estimate_inr": 0,
    "worth_buying": true,
    "confidence_score": 0,
    "ai_reasoning": "Detailed practical inspection summary for this photo",
    "negotiation_script": {{
        "opening_line": "Exact words to say to seller first",
        "if_seller_resists": "Exact words if seller won't budge",
        "final_offer": "Maximum fair price in rupees",
        "walk_away_if": "Condition when user should not buy"
    }},
    "red_flags": ["Serious issues visible in this photo"],
    "green_flags": ["Positive things visible in this photo"]
}}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": image_b64}},
            ],
        }],
        max_tokens=2200,
    )

    text = response.choices[0].message.content.strip().replace("```json", "").replace("```", "").strip()
    start = text.find("{")
    end = text.rfind("}") + 1
    if start != -1 and end > start:
        text = text[start:end]

    result = json.loads(text)
    result["damage_boxes"] = normalize_damage_boxes(result.get("damage_boxes", []))

    if not result["damage_boxes"] and result.get("damage_found"):
        fallback_boxes = []
        locations = result.get("damage_locations", [])
        damages = result.get("damage_found", [])
        for i, damage in enumerate(damages):
            location_text = locations[i] if i < len(locations) else ""
            fallback_boxes.append(fallback_box_from_location(location_text, damage))
        result["damage_boxes"] = normalize_damage_boxes(fallback_boxes)

    return result


def merge_results(results):
    if len(results) == 1:
        result = results[0]
        result["damage_boxes"] = normalize_damage_boxes(result.get("damage_boxes", []))
        return result

    best = max(results, key=lambda r: r.get("confidence_score", 0))
    all_damage = []
    all_locations = []
    all_boxes = []
    seen_damage = set()

    for r in results:
        boxes = normalize_damage_boxes(r.get("damage_boxes", []))
        damages = r.get("damage_found", [])
        locations = r.get("damage_locations", [])
        for i, damage in enumerate(damages):
            if damage and damage.lower() not in seen_damage:
                seen_damage.add(damage.lower())
                all_damage.append(damage)
                all_locations.append(locations[i] if i < len(locations) else "unspecified")
                if i < len(boxes):
                    all_boxes.append(boxes[i])
                else:
                    all_boxes.append(fallback_box_from_location(locations[i] if i < len(locations) else "", damage))

    all_red = list({f for r in results for f in r.get("red_flags", []) if f})
    all_green = list({f for r in results for f in r.get("green_flags", []) if f})
    avg_condition = int(sum(r.get("condition_score", 50) for r in results) / len(results))
    severity_rank = {"None": 0, "Minor": 1, "Moderate": 2, "Severe": 3}
    worst_severity = max([r.get("damage_severity", "None") for r in results], key=lambda s: severity_rank.get(s, 0))
    fair_values = [r.get("estimated_fair_value_inr", 0) for r in results if r.get("estimated_fair_value_inr", 0) > 0]
    avg_fair_value = int(sum(fair_values) / len(fair_values)) if fair_values else 0

    return {
        "product_name": best.get("product_name", "Unknown"),
        "category": best.get("category", ""),
        "specs_detected": best.get("specs_detected", "Unknown"),
        "condition_score": avg_condition,
        "condition_label": best.get("condition_label", "Fair"),
        "usage_estimation": best.get("usage_estimation", {}),
        "damage_found": all_damage,
        "damage_locations": all_locations,
        "damage_boxes": normalize_damage_boxes(all_boxes),
        "damage_severity": worst_severity,
        "estimated_fair_value_inr": avg_fair_value,
        "new_price_estimate_inr": best.get("new_price_estimate_inr", 0),
        "worth_buying": best.get("worth_buying", True),
        "confidence_score": best.get("confidence_score", 0),
        "ai_reasoning": f"Analysed {len(results)} photo(s). " + best.get("ai_reasoning", ""),
        "negotiation_script": best.get("negotiation_script", {}),
        "red_flags": all_red,
        "green_flags": all_green,
    }


def run_vision_analysis(image_paths, seller_price, usage_period="not mentioned", gadget_type="smartphone", user_issues="", device_model=""):
    if not image_paths:
        raise ValueError("No images provided")

    results = []
    low_conf_count = 0
    total = len(image_paths)

    for i, path in enumerate(image_paths):
        try:
            image_b64 = resize_and_encode(path)
            result = analyse_single_image(image_b64, seller_price, usage_period, gadget_type, user_issues, device_model, i + 1, total)
            conf = result.get("confidence_score", 0)
            if conf < MIN_CONFIDENCE:
                low_conf_count += 1
                continue
            results.append(result)
        except Exception:
            continue

    if not results:
        if low_conf_count == total:
            raise ValueError("All uploaded photos were unclear or too low-confidence. Please upload clearer, well-lit photos.")
        raise ValueError("Could not analyse uploaded photos. Please try again with clearer images.")

    return merge_results(results)
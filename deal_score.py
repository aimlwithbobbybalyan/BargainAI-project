def calculate_deal_score(seller_price, vision_result, market_data):
    """
    Calculates overall deal score 0-100.
    Normalized — only counts factors where data is actually available.
    """

    factors       = []  # list of (points_earned, max_points)
    fair_value    = vision_result.get("estimated_fair_value_inr", 0)
    condition_score = vision_result.get("condition_score", 50)
    damage_severity = vision_result.get("damage_severity", "None")
    olx_avg       = market_data.get("used_prices", {}).get("olx_average")

    # ─────────────────────────────────────────
    # FACTOR 1: Price vs Fair Value (weight: 40)
    # Most important factor
    # ─────────────────────────────────────────
    if fair_value and fair_value > 0:
        ratio = seller_price / fair_value
        if ratio < 0.6:
            pts = 40
        elif ratio < 0.75:
            pts = 32
        elif ratio < 0.9:
            pts = 24
        elif ratio < 1.0:
            pts = 18
        elif ratio < 1.1:
            pts = 10
        elif ratio < 1.25:
            pts = 4
        else:
            pts = 0
        factors.append((pts, 40))

    # ─────────────────────────────────────────
    # FACTOR 2: Product Condition (weight: 30)
    # ─────────────────────────────────────────
    if condition_score >= 85:
        pts = 30
    elif condition_score >= 70:
        pts = 22
    elif condition_score >= 50:
        pts = 14
    elif condition_score >= 30:
        pts = 6
    else:
        pts = 0
    factors.append((pts, 30))

    # ─────────────────────────────────────────
    # FACTOR 3: OLX Market Comparison (weight: 20)
    # Only counts if OLX data is available
    # ─────────────────────────────────────────
    if olx_avg and olx_avg > 0:
        if seller_price < olx_avg * 0.85:
            pts = 20
        elif seller_price < olx_avg:
            pts = 14
        elif seller_price <= olx_avg * 1.05:
            pts = 8
        elif seller_price <= olx_avg * 1.15:
            pts = 3
        else:
            pts = 0
        factors.append((pts, 20))
    # If no OLX data — this factor is simply skipped (not penalized)

    # ─────────────────────────────────────────
    # FACTOR 4: Damage Severity (weight: 10)
    # ─────────────────────────────────────────
    if damage_severity == "None":
        pts = 10
    elif damage_severity == "Minor":
        pts = 7
    elif damage_severity == "Moderate":
        pts = 3
    else:  # Severe
        pts = 0
    factors.append((pts, 10))

    # ─────────────────────────────────────────
    # Normalized score: scale to 0-100
    # based only on factors with available data
    # ─────────────────────────────────────────
    if not factors:
        score = 50  # fallback if nothing available
    else:
        total_earned = sum(f[0] for f in factors)
        total_max    = sum(f[1] for f in factors)
        score = round((total_earned / total_max) * 100)

    score = max(0, min(100, score))

    # ─────────────────────────────────────────
    # Verdict
    # ─────────────────────────────────────────
    if score >= 80:
        verdict = "Excellent Deal"
        emoji   = "🔥"
    elif score >= 65:
        verdict = "Good Deal"
        emoji   = "✅"
    elif score >= 50:
        verdict = "Fair Deal"
        emoji   = "👍"
    elif score >= 35:
        verdict = "Overpriced"
        emoji   = "⚠️"
    else:
        verdict = "Bad Deal"
        emoji   = "❌"

    return {
        "score":   score,
        "verdict": verdict,
        "emoji":   emoji,
        "breakdown": {
            "seller_price":    seller_price,
            "fair_value":      fair_value,
            "condition_score": condition_score,
            "olx_average":     olx_avg,
            "damage_severity": damage_severity,
            "factors_used":    len(factors),
            "olx_data_used":   olx_avg is not None and olx_avg > 0,
        }
    }
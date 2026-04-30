from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import json
import sqlite3
import time
from datetime import datetime
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

CORS(app)

UPLOAD_FOLDER = "uploads"
DB_PATH = "bargainai.db"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

rate_limit_store = defaultdict(list)
RATE_LIMIT = 5
RATE_WINDOW = 60


def is_rate_limited(ip):
    now = time.time()
    rate_limit_store[ip] = [
        t for t in rate_limit_store[ip]
        if now - t < RATE_WINDOW
    ]

    if len(rate_limit_store[ip]) >= RATE_LIMIT:
        return True

    rate_limit_store[ip].append(now)
    return False


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            created_at TEXT,
            gadget_type TEXT,
            seller_price INTEGER,
            device_model TEXT,
            product_name TEXT,
            condition_score INTEGER,
            deal_score INTEGER,
            verdict TEXT,
            damage_severity TEXT,
            confidence INTEGER,
            search_method TEXT,
            full_result TEXT
        )
    """)
    conn.commit()
    conn.close()


def save_analysis(analysis_id, data, device_model="", search_method="ai"):
    conn = sqlite3.connect(DB_PATH)

    product = data.get("product", {}) or {}
    ds = data.get("deal_score", {}) or {}

    conn.execute(
        """
        INSERT OR REPLACE INTO analyses
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            analysis_id,
            datetime.now().isoformat(),
            data.get("gadget_type", ""),
            data.get("seller_price", 0),
            device_model,
            product.get("product_name", "Unknown Device"),
            product.get("condition_score", 0),
            ds.get("score", 0),
            ds.get("verdict", ""),
            product.get("damage_severity", "None"),
            product.get("confidence_score", 0),
            search_method,
            json.dumps(data),
        )
    )

    conn.commit()
    conn.close()


def get_history(limit=20):
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("""
        SELECT id, created_at, gadget_type, seller_price,
               product_name, deal_score, verdict, condition_score,
               damage_severity, confidence
        FROM analyses
        ORDER BY created_at DESC
        LIMIT ?
    """, (limit,)).fetchall()
    conn.close()

    return [{
        "id": r[0],
        "created_at": r[1],
        "gadget_type": r[2],
        "seller_price": r[3],
        "product_name": r[4],
        "deal_score": r[5],
        "verdict": r[6],
        "condition_score": r[7],
        "damage_severity": r[8],
        "confidence": r[9],
    } for r in rows]


init_db()


@app.route("/")
def home():
    return jsonify({
        "status": "running",
        "app": "BargainAI",
        "version": "2.0",
        "developer": "Bobby Balyan"
    })


@app.route("/api/gadgets")
def get_gadgets():
    return jsonify({"gadgets": [
        {"id": "smartphone", "name": "Smartphone", "icon": "📱", "examples": "iPhone, Samsung, Redmi, OnePlus"},
        {"id": "laptop", "name": "Laptop", "icon": "💻", "examples": "Dell, HP, Lenovo, MacBook"},
        {"id": "tablet", "name": "Tablet", "icon": "📟", "examples": "iPad, Samsung Tab, Lenovo Tab"},
        {"id": "earbuds", "name": "Earbuds", "icon": "🎧", "examples": "AirPods, Galaxy Buds, OnePlus Buds"},
        {"id": "bt_speaker", "name": "BT Speaker", "icon": "🔊", "examples": "JBL, Boat, Sony, Bose"},
    ]})


@app.route("/api/analyse", methods=["POST"])
def analyse():
    ip = request.headers.get("X-Forwarded-For", request.remote_addr)

    if is_rate_limited(ip):
        return jsonify({
            "error": "Too many requests. Please wait a minute before trying again."
        }), 429

    saved_paths = []

    try:
        seller_price = int(request.form.get("seller_price", 0))

        if seller_price <= 0:
            return jsonify({"error": "Please enter a valid seller price."}), 400

        usage_period = request.form.get("usage_period", "not mentioned")
        gadget_type = request.form.get("gadget_type", "smartphone")
        user_issues = request.form.get("user_issues", "")
        device_model = request.form.get("device_model", "").strip()

        files = request.files.getlist("images")

        if not files:
            return jsonify({"error": "No images uploaded"}), 400

        allowed_ext = {"jpg", "jpeg", "png", "webp"}

        for file in files:
            if file and file.filename:
                ext = file.filename.rsplit(".", 1)[-1].lower()

                if ext not in allowed_ext:
                    return jsonify({
                        "error": "Only JPG, JPEG, PNG and WEBP files are allowed."
                    }), 400

                path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.{ext}")
                file.save(path)
                saved_paths.append(path)

        if not saved_paths:
            return jsonify({"error": "No valid images uploaded"}), 400

        from vision_analysis import run_vision_analysis
        from market_research import fetch_market_prices
        from deal_score import calculate_deal_score

        vision_result = run_vision_analysis(
            saved_paths,
            seller_price,
            usage_period,
            gadget_type,
            user_issues,
            device_model
        )

        search_name = device_model if device_model else vision_result.get("product_name", gadget_type)
        search_method = "user_model" if device_model else "ai_detected"

        market_data = fetch_market_prices(search_name, gadget_type)
        deal_score = calculate_deal_score(seller_price, vision_result, market_data)

        analysis_id = str(uuid.uuid4())

        result = {
            "success": True,
            "analysis_id": analysis_id,
            "gadget_type": gadget_type,
            "seller_price": seller_price,
            "device_model": device_model,
            "product": vision_result,
            "market_data": market_data,
            "deal_score": deal_score,
            "timestamp": datetime.now().isoformat(),
        }

        save_analysis(analysis_id, result, device_model, search_method)

        return jsonify(result)

    except Exception as e:
        print("ANALYSE ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

    finally:
        for path in saved_paths:
            try:
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass


@app.route("/api/history")
def history():
    return jsonify({"history": get_history()})


@app.route("/api/analysis/<analysis_id>")
def get_analysis(analysis_id):
    conn = sqlite3.connect(DB_PATH)
    row = conn.execute(
        "SELECT full_result FROM analyses WHERE id=?",
        (analysis_id,)
    ).fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Not found"}), 404

    return jsonify(json.loads(row[0]))


@app.route("/api/stats")
def stats():
    conn = sqlite3.connect(DB_PATH)

    total = conn.execute("SELECT COUNT(*) FROM analyses").fetchone()[0]
    avg_score = conn.execute("SELECT AVG(deal_score) FROM analyses").fetchone()[0]
    avg_conf = conn.execute("SELECT AVG(confidence) FROM analyses").fetchone()[0]

    top_row = conn.execute("""
        SELECT gadget_type, COUNT(*) c
        FROM analyses
        GROUP BY gadget_type
        ORDER BY c DESC
        LIMIT 1
    """).fetchone()

    conn.close()

    return jsonify({
        "total_analyses": total,
        "avg_deal_score": round(avg_score or 0, 1),
        "avg_confidence": round(avg_conf or 0, 1),
        "top_gadget": top_row[0] if top_row else "smartphone",
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))

    print("=" * 50)
    print(f"  BargainAI v2.0 → http://localhost:{port}")
    print("  Developer: Bobby Balyan")
    print("=" * 50)

    app.run(host="0.0.0.0", debug=False, port=port)
# BargainAI

> AI-powered second-hand gadget analyser for the Indian market. Upload photos, get a deal verdict, and walk away with a negotiation script — in under 30 seconds.

**Live:** https://bargain-ai-project.vercel.app

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Core Features](#core-features)
- [How It Works](#how-it-works)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Authors](#authors)

---

## Overview

Millions of second-hand gadget transactions happen every day across India — on OLX, Quikr, and in local markets. Most buyers have no reliable way to know whether the price is fair, whether the condition is accurately described, or what to say to negotiate effectively.

BargainAI solves this by combining computer vision, live market data, and AI-generated negotiation scripts into a single tool anyone can use from their phone.

---

## The Problem

You are standing in front of a seller. He is asking Rs 28,000 for a used iPhone 13. It looks okay. Maybe a small scratch. He says barely used, six months old.

You open OLX. Some listings say Rs 24,000. Some say Rs 32,000. You do not know which are genuine. You do not know what that scratch does to the resale value. You do not know how to bring the price down without sounding desperate.

So you either overpay by thousands of rupees — or walk away from a deal that was actually fine.

This happens to everyone, every day, in every city in India. **BargainAI fixes this.**

---

## Core Features

### Vision Analysis
- Identifies the exact product from photos — brand, model, storage, colour
- Analyses each uploaded image separately and merges all damage findings
- Detects every visible scratch, dent, and physical defect
- Rejects unclear or non-gadget photos using a confidence threshold
- Resizes images before sending to AI for faster processing

### Market Intelligence
- Fetches live prices from Amazon, Flipkart, OLX, and Cashify via SerpAPI
- Falls back to Gemini AI estimates when live data is unavailable
- Uses user-provided device model directly in search queries for higher accuracy
- Calculates a normalised deal score from 0 to 100

### Negotiation Engine
- Generates three ready-to-use scripts: Polite, Aggressive, and Smart
- One-click copy for each script
- Scripts include specific price anchors pulled from live market data

### Additional
- Budget deal finder with direct links to OLX, Amazon, Flipkart, Cashify, Quikr, and 2GUD
- Full analysis history stored in SQLite
- Rate limiting at 5 requests per minute per IP

---

## How It Works

```
User uploads photos + enters asking price
          │
          ▼
Vision AI (Groq / Llama 4 Scout 17B)
  ├── Identifies device model and specs
  └── Detects physical condition and damage
          │
          ▼
Market Research (SerpAPI → Gemini fallback)
  ├── Amazon new price
  ├── Flipkart new price
  ├── OLX average for this model
  └── Cashify resale estimate
          │
          ▼
Deal Score Engine
  └── Normalised 0–100 score based on condition + market gap
          │
          ▼
Negotiation Script Generator
  └── Three scripts with price anchors from live data
```

---

## Demo

**Scenario:** Buying a used Vivo V23 5G for Rs 12,000. Seller claims barely used, six months old. You upload two photos.

**BargainAI output:**

| Field | Result |
|---|---|
| Product identified | Vivo V23 5G 128GB |
| Condition score | 68 / 100 — scratch on back panel near camera |
| OLX average | Rs 10,500 |
| Amazon new price | Rs 21,999 |
| Deal score | 42 / 100 — overpriced |

**Generated negotiation script (Smart):**

> "I found 3 OLX listings for this model between Rs 9,500 and Rs 11,000. There is also a scratch near the camera. Best I can do is Rs 10,000 cash today."

**Result:** Rs 2,000 saved in under 30 seconds.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Flask, Python |
| Vision AI | Groq — Llama 4 Scout 17B |
| Market Research | SerpAPI, Gemini 2.0 Flash Lite |
| Image Processing | Pillow |
| Database | SQLite |
| Frontend | React, TypeScript, Tailwind CSS |
| Build Tool | Vite |
| Deployment — Backend | Railway |
| Deployment — Frontend | Vercel |

---

## Project Structure

```
BargainAI/
├── app.py                  # Flask backend, REST API, rate limiting, SQLite
├── vision_analysis.py      # Groq Vision, per-image analysis, confidence validation
├── market_research.py      # SerpAPI live prices, Gemini fallback
├── deal_score.py           # Normalised deal score calculator
├── requirements.txt        # Python dependencies
├── Procfile                # Railway deployment config
├── .env                    # API keys — never commit
├── bargainai.db            # SQLite database, auto-created on first run
└── uploads/                # Temporary image storage, auto-cleaned

bargainai-frontend/
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx
│   │   ├── AnalysisPage.tsx
│   │   ├── ResultsPage.tsx
│   │   └── BudgetPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- API keys for Groq, Gemini, and SerpAPI (see [Environment Variables](#environment-variables))

### Backend

```bash
# Clone the repository
git clone https://github.com/aimlwithbobbybalyan/bargainai
cd BargainAI

# Install dependencies
pip install -r requirements.txt

# Add your API keys (see Environment Variables section)
cp .env.example .env

# Start the backend
python app.py
```

Backend runs at `http://localhost:8000`

### Frontend

```bash
cd bargainai-frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Reference

### Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/api/gadgets` | Supported gadget categories |
| `POST` | `/api/analyse` | Run a full analysis |
| `GET` | `/api/history` | Retrieve all past analyses |
| `GET` | `/api/analysis/:id` | Retrieve a specific analysis by ID |
| `GET` | `/api/stats` | Usage statistics |

### POST `/api/analyse`

Accepts `multipart/form-data`.

| Field | Required | Type | Description |
|---|---|---|---|
| `images` | Yes | File(s) | Up to 4 photo files |
| `seller_price` | Yes | Number | Asking price in Indian Rupees |
| `gadget_type` | Yes | String | `smartphone`, `laptop`, `tablet`, `earbuds`, `bt_speaker` |
| `usage_period` | No | String | e.g. `8 months` |
| `device_model` | No | String | e.g. `Samsung Galaxy S22` — improves accuracy |
| `user_issues` | No | String | Comma-separated known issues |

### Example Response

```json
{
  "product": {
    "brand": "Vivo",
    "model": "V23 5G",
    "storage": "128GB",
    "colour": "Sunshine Gold"
  },
  "condition": {
    "score": 68,
    "issues": ["Scratch on back panel near camera"]
  },
  "market": {
    "olx_average": 10500,
    "amazon_new": 21999,
    "cashify_estimate": 9800
  },
  "deal": {
    "score": 42,
    "verdict": "Overpriced"
  },
  "scripts": {
    "polite": "...",
    "aggressive": "...",
    "smart": "I found 3 OLX listings for this model between Rs 9,500 and Rs 11,000..."
  }
}
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
GROQ_KEY=your_key_from_console.groq.com
GEMINI_KEY_1=your_key_from_aistudio.google.com
GEMINI_KEY_2=optional_second_key
GEMINI_KEY_3=optional_third_key
SERPAPI_KEY=your_key_from_serpapi.com
```

| Variable | Required | Source |
|---|---|---|
| `GROQ_KEY` | Yes | https://console.groq.com |
| `GEMINI_KEY_1` | Yes | https://aistudio.google.com |
| `GEMINI_KEY_2` | No | Fallback key for rate limiting |
| `GEMINI_KEY_3` | No | Fallback key for rate limiting |
| `SERPAPI_KEY` | Yes | https://serpapi.com |

Multiple Gemini keys are recommended to handle rate limits gracefully. The application cycles through them automatically.

---

## Deployment

### Backend — Railway

The `Procfile` is pre-configured for Railway deployment.

```
web: python app.py
```

Set all environment variables in the Railway dashboard under **Settings → Variables**.

### Frontend — Vercel

```bash
cd bargainai-frontend
vercel --prod
```

Update the API base URL in your frontend config to point to your Railway backend URL before deploying.

---

## Who Is This For

- Anyone buying a second-hand phone, laptop, or gadget in India
- Non-technical buyers who cannot judge fair pricing by sight
- First-time buyers — students picking up a budget laptop or phone
- Anyone who dislikes negotiating and wants an exact script to follow

---

## Authors

**Bobby Balyan & Navneet**
B.Tech CSE (AI and ML) — CT Group of Institutions, Ludhiana

- GitHub: [@aimlwithbobbybalyan](https://github.com/aimlwithbobbybalyan)
- Email: bobby.2301385@stu.ctgroup.in

---

## License

This project is currently unlicensed. All rights reserved by the authors.
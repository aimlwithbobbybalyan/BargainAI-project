# BargainAI

Live at: https://bargain-ai-project.vercel.app

---

## Bhai ye phone lu kya? Second hand hai...

That one question. You are standing in front of a seller. He is showing you a used iPhone 13 for Rs 28,000. Looks okay. Maybe a small scratch. He says barely used, 6 months old. You have no idea if this is a good price or if he is taking you for a ride.

You open OLX. Some listings say Rs 24,000. Some say Rs 32,000. You do not know which ones are genuine. You do not know what that scratch does to the value. You do not know what to say to bring the price down without sounding desperate.

So you either overpay by thousands of rupees or walk away from a deal that was actually fine.

This happens to everyone. Every single day. In every city in India.

BargainAI fixes this. Upload a photo, enter the price, get a verdict in 30 seconds.

---

## What it does

You upload photos of the gadget. You enter the asking price. That is it.

BargainAI does everything else:

- Identifies the exact product from the photo, brand, model, storage, color
- Examines each photo separately and finds every visible scratch, dent, or damage
- Fetches live prices from Amazon, Flipkart, OLX, and Cashify in real time
- Calculates a deal score from 0 to 100
- Gives you the exact words to say to the seller to bring the price down

---

## Real example

You are buying a used Vivo V23 5G for Rs 12,000. Seller says barely used, 6 months old. You upload 2 photos.

BargainAI tells you:

- Product confirmed: Vivo V23 5G 128GB
- Condition score: 68 out of 100, scratch on back panel near camera
- OLX average for this model: Rs 10,500
- Amazon new price: Rs 21,999
- Deal score: 42 out of 100, overpriced
- Say this to the seller: "I found 3 OLX listings for this model between Rs 9,500 and Rs 11,000. There is also a scratch near the camera. Best I can do is Rs 10,000 cash today."

You just saved Rs 2,000 in 30 seconds.

---

## Who is this for

- Anyone buying a second hand phone, laptop, or gadget in India
- People who are not technical and cannot judge a fair price just by looking
- Anyone who hates negotiating and wants a script to follow
- Students buying a budget laptop or phone for the first time

---

## Features

- Vision AI identifies the exact product from photos
- Analyses each uploaded photo separately and merges all damage findings
- Images are resized before sending to AI for faster processing
- Rejects unclear or non-gadget photos with a confidence check
- Fetches live market prices via SerpAPI, falls back to Gemini AI estimates
- If user provides the device model, search uses that directly for better accuracy
- Normalized deal score from 0 to 100
- Three negotiation scripts, Polite, Aggressive, and Smart, with one click copy
- Budget deal finder with links to OLX, Amazon, Flipkart, Cashify, Quikr, and 2GUD
- Rate limiting at 5 requests per minute per IP
- Full analysis history stored in SQLite

---

## Project structure

```
BargainAI/
├── app.py                  Flask backend, REST API, rate limiting, SQLite
├── vision_analysis.py      Groq Vision, per-image analysis, confidence validation
├── market_research.py      SerpAPI live prices, Gemini fallback
├── deal_score.py           Normalized deal score calculator
├── requirements.txt        Python dependencies
├── Procfile                For Railway deployment
├── .env                    API keys, never commit this
├── bargainai.db            SQLite database, auto-created on first run
└── uploads/                Temporary image storage, auto-cleaned

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

## Setup

### Backend

Create a `.env` file in the root:

```
GROQ_KEY=your_key_from_console.groq.com
GEMINI_KEY_1=your_key_from_aistudio.google.com
GEMINI_KEY_2=optional
GEMINI_KEY_3=optional
SERPAPI_KEY=your_key_from_serpapi.com
```

```bash
pip install -r requirements.txt
python app.py
```

Backend runs at http://localhost:8000

### Frontend

```bash
cd bargainai-frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

---

## API reference

| Method | Route | Description |
|--------|-------|-------------|
| GET | / | Health check |
| GET | /api/gadgets | Supported gadget categories |
| POST | /api/analyse | Main endpoint |
| GET | /api/history | Past analyses |
| GET | /api/analysis/id | Specific analysis by ID |
| GET | /api/stats | Usage statistics |

POST /api/analyse accepts multipart form data:

| Field | Required | Description |
|-------|----------|-------------|
| images | yes | Up to 4 photo files |
| seller_price | yes | Asking price in rupees |
| gadget_type | yes | smartphone, laptop, tablet, earbuds, bt_speaker |
| usage_period | no | e.g. 8 months |
| device_model | no | e.g. Samsung Galaxy S22 |
| user_issues | no | Comma separated known issues |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Backend | Flask, Python |
| Vision AI | Groq, Llama 4 Scout 17B |
| Market Research | SerpAPI, Gemini 2.0 Flash Lite |
| Image Processing | Pillow |
| Database | SQLite |
| Frontend | React, TypeScript, Tailwind CSS |
| Build tool | Vite |
| Deployment | Railway (backend), Vercel (frontend) |

---

## Author

Bobby Balyan & Navneet (contributer partner)
B.Tech CSE (AI and ML), CT Group of Institutions, Ludhiana

GitHub: https://github.com/aimlwithbobbybalyan
Email: bobby.2301385@stu.ctgroup.in
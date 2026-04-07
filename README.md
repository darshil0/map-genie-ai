# Map-Genie 🗺️

An AI-powered place explorer that highlights locations on an interactive map, accepts both **voice and text input**, and surfaces a curated list of nearby places to visit. Powered by a robust FastAPI backend.

---

## Features

- **Text search** — type any query like *"coffee shops in Amsterdam"* or *"temples near Kyoto"*
- **Voice search** — tap the mic button and speak your query; live transcription fills the search box automatically
- **AI-generated place list** — Gemini interprets your query, identifies the best-known places, and renders them as cards in the sidebar
- **Interactive map** — custom emoji markers are placed on a dark CartoDB map; clicking a card flies the camera to that place; clicking a marker highlights its card
- **Rich place cards** — each card shows name, category, a short description, distance estimate, and topic tags
- **Self-Healing Architecture** — Both the frontend and backend utilize robust networking with exponential backoff on API calls, dynamic fallback rendering options on connection drops, and automatic JSON repair heuristics so simple glitches never break your map.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Map rendering | [Leaflet.js](https://leafletjs.com/) 1.9.4 |
| Map tiles | [CartoDB Dark Matter](https://carto.com/basemaps/) (OpenStreetMap data) |
| Geocoding | [Nominatim](https://nominatim.org/) (OpenStreetMap) |
| AI / place generation | [Google Gemini](https://ai.google.dev/) (`gemini-2.0-flash`) via backend |
| Voice input | [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) |
| Typography | [Syne](https://fonts.google.com/specimen/Syne) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) (Google Fonts) |
| Python backend | [FastAPI](https://fastapi.tiangolo.com/), [google-genai](https://pypi.org/project/google-genai/) + [python-dotenv](https://pypi.org/project/python-dotenv/) |
| Testing | [pytest](https://docs.pytest.org/) |

---

## Quick Start

### 1 — API Key Configuration

```bash
cp .env.example .env          # insert your GEMINI_API_KEY
```

### 2 — Run the App

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Navigate to `http://127.0.0.1:8000` gently in your web browser!

---

## Running Tests (Python backend)

```bash
pytest
```

All three test cases should pass:

- `test_explore_endpoint_success` — happy path testing structured Gemini JSON output and 200 OK wrapper
- `test_explore_endpoint_no_messages` — empty chat history correctly rejects with 400 Bad Request
- `test_explore_endpoint_empty_response` — handles falsy API breaks via 503 Service Unavailable

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Map + search | ✅ | ✅ | ✅ | ✅ |
| Voice input (Web Speech API) | ✅ | ❌ | ✅ (iOS 14.5+) | ✅ |

Voice search relies on the [Web Speech API](https://caniuse.com/speech-recognition),
which is not supported in Firefox. The app falls back gracefully — text search works
in all browsers.

---

## Project Structure

```
map-genie/
├── main.py             # FastAPI backend & Gemini integrations
├── static/
│   └── index.html      # Main web app 
├── requirements.txt    # Python dependencies
├── .env.example        # API key template
├── tests/
│   └── test_main.py    # Pytest suite
├── CHANGELOG.md
└── README.md
```

---

## Known Limitations

- **Lazy Geocoding fallback.** Rather than blocking operations for 8-seconds upfront while Nominatim rate-limits sequentially, the map immediately spins up radial placeholder points, which are automatically corrected and snapped to proper streets asynchronously one-by-one.
- **Nominatim rate limits.** The geocoding step calls the public Nominatim endpoint,
  which enforces a 1 request/second limit. Back-to-back searches may occasionally
  return no geocoding result. Adding a short delay between searches or self-hosting
  a Nominatim instance resolves this.
- **Voice search requires microphone permission.** Browsers prompt for permission on
  first use. HTTPS or `localhost` is strictly required for the Web Speech API in Chrome and Edge.

---

## Bug Fixes (cumulative)

| Version | File | Issue | Fix |
|---------|------|-------|-----|
| 0.4.1 | `map-genie.html` | Missing Self-Healing parameters and invalid API strings | Built auto-retry wrapper logic spanning Anthropic and geocoding fetch APIs, and corrected Claude target model parsing |
| 0.4.1 | `main.py` | Raised generic exception catching due to outdated SDK types | Refactored `errors` capture array to strictly handle active V0.1+ SDK instances (like `APIError`), sidestepping runtime TypeErrors |
| 0.4.0 | `map-genie.html` | Missing `anthropic-version` header caused API 400 errors | Added `anthropic-version: 2023-06-01` header |
| 0.4.0 | `map-genie.html` | Missing `anthropic-dangerous-direct-browser-access` header blocked CORS preflight | Added required header for direct browser API access |
| 0.4.0 | `map-genie.html` | HTTP error responses (401, 429, 500) crashed silently at `JSON.parse` | Added `response.ok` guard that surfaces the real error message |
| 0.4.0 | `map-genie.html` | Double jitter — coordinates scattered in `searchWithClaude` then jittered again in `renderPlaces` | Removed redundant jitter from `renderPlaces`; scatter applied once only |
| 0.4.0 | `map-genie.html` | Inconsistent model string across project files | Aligned to `claude-3-5-sonnet-20241022` everywhere |
| 0.4.0 | `tests/test_main.py` | `from main import` inside each test re-imported with stale module cache | Moved import to module level |
| 0.2.0 | `tests/test_main.py` | `@patch` decorator order was reversed — `mock_getenv` and `mock_load_dotenv` args were swapped | Corrected to match bottom-up decorator → argument order |
| 0.2.0 | `tests/test_main.py` | `load_dotenv` was patched inside the test function, but it runs at module-import time — patch was ineffective | Removed ineffective `load_dotenv` patch; test now only patches `os.getenv` |
| 0.2.0 | `main.py` | `response.text` could be `None` (empty API response) — unhandled | Added `RuntimeError` guard when `response.text` is falsy |
| 0.2.0 | `tests/test_main.py` | No test for empty/`None` API response | Added `test_get_gemini_response_empty_text` |

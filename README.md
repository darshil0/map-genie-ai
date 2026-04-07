# Map-Genie 🗺️

An AI-powered place explorer that highlights locations on an interactive map, accepts both **voice and text input**, and surfaces a curated list of nearby places to visit — all in a single HTML file.

---

## Features

- **Text search** — type any query like *"coffee shops in Amsterdam"* or *"temples near Kyoto"*
- **Voice search** — tap the mic button and speak your query; live transcription fills the search box automatically
- **AI-generated place list** — Claude interprets your query, identifies the best-known places, and renders them as cards in the sidebar
- **Interactive map** — custom emoji markers are placed on a dark CartoDB map; clicking a card flies the camera to that place; clicking a marker highlights its card
- **Rich place cards** — each card shows name, category, a short description, distance estimate, and topic tags

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Map rendering | [Leaflet.js](https://leafletjs.com/) 1.9.4 |
| Map tiles | [CartoDB Dark Matter](https://carto.com/basemaps/) (OpenStreetMap data) |
| Geocoding | [Nominatim](https://nominatim.org/) (OpenStreetMap) |
| AI / place generation | [Anthropic Claude](https://docs.anthropic.com/) (`claude-sonnet-4-5`) |
| Voice input | [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) |
| Typography | [Syne](https://fonts.google.com/specimen/Syne) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) (Google Fonts) |
| Python backend (optional) | [google-genai](https://pypi.org/project/google-genai/) + [python-dotenv](https://pypi.org/project/python-dotenv/) |
| Testing | [pytest](https://docs.pytest.org/) |

---

## Quick Start

### 1 — Map-Genie web app (no server required)

Just open `map-genie.html` in any modern browser.

The app calls the Anthropic API directly from the browser using `claude-sonnet-4-5`.

> **Note on API key:** The Anthropic API key is handled automatically by the
> claude.ai artifact runtime. If you run this file outside claude.ai, add your
> key as an `x-api-key` header inside the `fetch` call in `map-genie.html`.

### 2 — Python backend (optional, for Gemini API experiments)

```bash
pip3 install -r requirements.txt
cp .env.example .env          # add your GEMINI_API_KEY
python3 main.py
```

---

## Running Tests (Python backend)

```bash
pytest
```

All three test cases should pass:

- `test_get_gemini_response` — happy path with mocked API response
- `test_get_gemini_response_no_api_key` — missing key raises `ValueError`
- `test_get_gemini_response_empty_text` — empty response raises `RuntimeError`

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
├── map-genie.html      # Main web app (standalone, no build step)
├── main.py             # Python / Gemini API starter
├── requirements.txt    # Python dependencies
├── .env.example        # API key template
├── tests/
│   └── test_main.py    # Pytest suite
├── CHANGELOG.md
└── README.md
```

---

## Known Limitations

- **Marker positions are approximated.** The Claude API returns place names without
  coordinates. Coordinates are derived by scattering points radially around the
  geocoded city/neighborhood center, not from a places database. For well-known
  landmarks the positions are visually reasonable; for niche locations they may be
  slightly off.
- **Nominatim rate limits.** The geocoding step calls the public Nominatim endpoint,
  which enforces a 1 request/second limit. Back-to-back searches may occasionally
  return no geocoding result. Adding a short delay between searches or self-hosting
  a Nominatim instance resolves this.
- **Voice search requires microphone permission.** Browsers prompt for permission on
  first use. HTTPS is required for the Web Speech API in Chrome and Edge; opening
  the file via `file://` may be blocked.

---

## Bug Fixes (cumulative)

| Version | File | Issue | Fix |
|---------|------|-------|-----|
| 0.4.0 | `map-genie.html` | Missing `anthropic-version` header caused API 400 errors | Added `anthropic-version: 2023-06-01` header |
| 0.4.0 | `map-genie.html` | Missing `anthropic-dangerous-direct-browser-access` header blocked CORS preflight | Added required header for direct browser API access |
| 0.4.0 | `map-genie.html` | HTTP error responses (401, 429, 500) crashed silently at `JSON.parse` | Added `response.ok` guard that surfaces the real error message |
| 0.4.0 | `map-genie.html` | Double jitter — coordinates scattered in `searchWithClaude` then jittered again in `renderPlaces` | Removed redundant jitter from `renderPlaces`; scatter applied once only |
| 0.4.0 | `map-genie.html` | Inconsistent model string across project files | Aligned to `claude-sonnet-4-5` everywhere |
| 0.4.0 | `tests/test_main.py` | `from main import` inside each test re-imported with stale module cache | Moved import to module level |
| 0.2.0 | `tests/test_main.py` | `@patch` decorator order was reversed — `mock_getenv` and `mock_load_dotenv` args were swapped | Corrected to match bottom-up decorator → argument order |
| 0.2.0 | `tests/test_main.py` | `load_dotenv` was patched inside the test function, but it runs at module-import time — patch was ineffective | Removed ineffective `load_dotenv` patch; test now only patches `os.getenv` |
| 0.2.0 | `main.py` | `response.text` could be `None` (empty API response) — unhandled | Added `RuntimeError` guard when `response.text` is falsy |
| 0.2.0 | `tests/test_main.py` | No test for empty/`None` API response | Added `test_get_gemini_response_empty_text` |

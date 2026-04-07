# Map-Genie 🗺️

An AI-powered place explorer that highlights locations on an interactive map, accepts both **voice and text input**, and surfaces a curated list of nearby places to visit — all in a single HTML file.

---

## Features

- **Text search** — type any query like *"coffee shops in Amsterdam"* or *"temples near Kyoto"*
- **Voice search** — tap the mic button and speak your query; transcription fills the search box automatically
- **AI-generated place list** — Claude interprets your query, identifies the best-known places, and renders them as cards in the sidebar
- **Interactive map** — custom emoji markers are placed on a dark CartoDB map; clicking a card flies the camera to that place; clicking a marker highlights its card
- **Rich place cards** — each card shows name, category, a short description, distance estimate, and topic tags

---

## Quick Start

### 1 — Python backend (optional, for API experiments)

```bash
pip3 install -r requirements.txt
cp .env.example .env          # add your GEMINI_API_KEY
python3 main.py
```

### 2 — Map-Genie web app

Just open `map-genie.html` in any modern browser.
The app calls the Anthropic API directly from the browser using `claude-sonnet-4-20250514`.
No server required.

> **Note:** The Anthropic API key is handled by the claude.ai artifact runtime.
> If you run this outside claude.ai, add your key to the fetch headers in `map-genie.html`.

---

## Running Tests (Python backend)

```bash
pytest
```

---

## Project Structure

```
map-genie/
├── map-genie.html      # Main web app (standalone)
├── main.py             # Python / Gemini API starter
├── requirements.txt    # Python dependencies
├── .env.example        # API key template
├── tests/
│   └── test_main.py    # Pytest suite
├── CHANGELOG.md
└── README.md
```

---

## Bug Fixes (from original codebase)

| File | Issue | Fix |
|------|-------|-----|
| `tests/test_main.py` | `@patch` decorator order was reversed — `mock_getenv` and `mock_load_dotenv` args were swapped | Corrected to match bottom-up decorator → argument order |
| `tests/test_main.py` | `load_dotenv` was patched inside the test function, but it runs at module-import time — patch was ineffective | Removed ineffective `load_dotenv` patch; test now only patches `os.getenv` |
| `main.py` | `response.text` could be `None` (empty API response) — unhandled | Added `RuntimeError` guard when `response.text` is falsy |
| `tests/test_main.py` | No test for empty/`None` API response | Added `test_get_gemini_response_empty_text` |

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2026-04-06

### Added
- **Premium Glassmorphic UI**: Completely overhauled the frontend architecture. Map-Genie now features an absolute full-viewport canvas with a floating, frosted-glass sidebar.
- **Micro-Animations**: Injected staggered CSS entry animations for search results and hover-reactive map icons using high-end Bezier transitions.
- **Decoupled Styling**: Migrated 500+ lines of inline CSS into a standalone `static/style.css` for cleaner code and performance.

### Changed
- **Color Theory & Typography**: Updated to a vibrant Neon Aqua and Purple gradient aesthetic with rich Syne headlines.
- **Custom Map Droplets**: Replaced generic rectangle markers with beautiful, semi-transparent droplet-shaped icons that react to user interaction.

## [0.5.1] - 2026-04-06

### Added
- **UI Reset**: Integrated a 'Clear Map' button inside the frontend interface to instantly wipe markers and history cache during multi-turn browsing sessions.
- **Test Integrity**: Injected `__init__.py` inside `/tests` to solidify absolute import path resolution across cross-platform OS environments.

### Fixed
- **Markdown Hallucinations**: Pre-emptively stripped Markdown code block wrappings (like \`\`\`json) directly off `response.text` payloads in `main.py` before passing to Pydantic validation, shielding the backend from 500 error loops.
- **Legacy Typography**: Fully phased out obsolete Claude syntax references from `README.md` and brought test names and descriptions strictly up to date with the V2 architecture.

## [0.5.0] - 2026-04-06

### Changed
- **Architectural Shift to Full-Stack**: Map-Genie's standalone browser iteration has been entirely migrated into a Full-Stack application powered by Python `FastAPI` and the Gemini API, bypassing CORS issues and ensuring secure backend LLM inferences.
- `map-genie.html`: Moved into a `static/` directory and refactored from calling Anthropic manually to leveraging the local `/api/explore` proxy endpoint.
- `main.py`: Fully replaced with a `uvicorn` and `fastapi` stack serving a secure endpoint that generates robust mapping variables through Gemini.
- **Lazy Geocoding**: Upgraded `index.html` to leverage an asynchronous auto-snapping Nominatim strategy. Dummy points are instantly scattered radially, while background requests geocode and transition points individually every 1.5s to circumvent blocking API throttles.

### Added
- **Multi-turn Refinement**: Enabled an array-based conversational history flow, allowing users to iteratively chat to filter and refine results without clearing maps.
- **Navigator Geolocation**: Injected browser hook `getCurrentPosition` on mount to natively fetch, focus, and query context using the user's explicit coordinates.
- **Gemini Structured Output**: The backend `/api/explore` now forces strictly formatted responses natively by supplying a `Pydantic` schema constraint to `google-genai`.

## [0.4.1] - 2026-04-06

### Added
- **Self-Healing Architecture**:
  - `map-genie.html`: Added a 3-retry fetch loop with exponential backoff for the Claude API networking call.
  - `map-genie.html`: Added a 3-retry loop for Nominatim geocoding rate-limits, including a gentle fallback view if it fully times out.
  - `map-genie.html`: Added a regex-based JSON extraction heuristic so unrecoverably malformed JSON text from Claude doesn't brutally crash parsing.
  - `main.py`: Created an organic Python loop encapsulating exponential backoff retries when encountering Gemini API drops and limits, returning generic fallbacks on terminal failures so the app remains perfectly robust.

### Fixed
- `map-genie.html` & `README.md`: Corrected the invalid Anthropic model string from `claude-sonnet-4-5` to `claude-3-5-sonnet-20241022` to ensure successful API requests.
- `main.py`: Updated Gemini API exception handler to only catch `errors.APIError`. Removed `errors.ClientError` and `errors.ServerError` to prevent runtime `AttributeError`s since they do not exist in the 0.1+ `google.genai` SDK.

## [0.4.0] - 2026-04-06

### Fixed
- `map-genie.html`: Added the required `anthropic-version: 2023-06-01` header to all
  Anthropic API fetch calls. Omitting this header causes the API to reject requests
  with a 400 error.
- `map-genie.html`: Added the required `anthropic-dangerous-direct-browser-access: true`
  header. Without it, direct browser-to-API calls fail at the CORS preflight stage,
  preventing the app from working outside the claude.ai artifact runtime.
- `map-genie.html`: Added `response.ok` check before parsing the API response body.
  Previously, HTTP error responses (401 Unauthorized, 429 Rate Limited, 500 Server
  Error) would silently crash at `JSON.parse` with a misleading "Unexpected token"
  message instead of surfacing the real API error.
- `map-genie.html`: Removed the second layer of random coordinate jitter inside
  `renderPlaces`. Marker positions were already scattered in `searchWithClaude`, so
  the additional `(Math.random() - 0.5) * 0.0003` offset in `renderPlaces` caused
  markers to drift further from their intended positions on every render.
- `map-genie.html`: Aligned the Claude model string to `claude-sonnet-4-5` for
  consistency across all project files and to use the correct Sonnet 4 model
  identifier.
- `tests/test_main.py`: Moved `from main import get_gemini_response` to module level.
  Importing inside each test function re-imported the module on every call, which
  could return a cached module object with attributes bound before patching took
  effect, producing unreliable test results under certain import-order conditions.

## [0.3.0] - 2026-04-06

### Added
- Specific error handling for Gemini API calls in `main.py` using `google.genai.errors`.
- `User-Agent` header to Nominatim fetch requests in `map-genie.html` to comply with
  usage policies.

### Changed
- Updated all Python dependencies in `requirements.txt` to their latest stable versions:
    - `google-genai` to `1.70.0`
    - `python-dotenv` to `1.2.2`
    - `pytest` to `9.0.2`
- Updated Claude model in `map-genie.html` from `claude-sonnet-4-20250514` to
  `claude-3-5-sonnet-latest`.

## [0.2.0] - 2026-04-06

### Added
- `map-genie.html` — full AI-powered place explorer web app (voice + text input,
  interactive map, place cards).
- Custom emoji map markers with color-cycling and pop-up tooltips.
- Sidebar place cards with name, type, description, tags, and distance.
- Voice search via Web Speech API with live transcription.
- AI query parsing (Claude claude-sonnet-4-20250514) extracts location + category
  and generates 8 nearby places.
- Geocoding via Nominatim (OpenStreetMap) to position the returned places on the map.
- Dark CartoDB tile layer for a sleek, high-contrast map aesthetic.
- Query chip overlay on the map showing the active search.
- Toast notification system for errors and tips.

### Fixed
- `tests/test_main.py`: `@patch` decorator argument order was reversed (bottom-up
  rule violated).
- `tests/test_main.py`: `load_dotenv` mock was ineffective because it runs at
  module-import time; removed the unnecessary patch.
- `main.py`: Unhandled `None` response from the Gemini API now raises `RuntimeError`
  with a clear message.
- `tests/test_main.py`: Added `test_get_gemini_response_empty_text` to cover the new
  `RuntimeError` guard.

## [0.1.0] - 2026-04-06

### Added
- Initial project structure for Python-based Gemini API integration.
- `main.py` with basic Gemini API usage example.
- `requirements.txt` with necessary dependencies.
- `tests/test_main.py` for verifying project functionality with mocked API calls.
- `README.md` with setup and usage instructions.
- `.env.example` for environment variable configuration.
- `.gitignore` to exclude environment variables and build artifacts.

### Changed
- Refactored `main.py` to load environment variables at module level for better
  performance.

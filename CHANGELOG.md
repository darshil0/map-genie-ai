# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-04-06

### Added
- `map-genie.html` — full AI-powered place explorer web app (voice + text input, interactive map, place cards).
- Custom emoji map markers with color-cycling and pop-up tooltips.
- Sidebar place cards with name, type, description, tags, and distance.
- Voice search via Web Speech API with live transcription.
- AI query parsing (Claude claude-sonnet-4-20250514) extracts location + category and generates 8 nearby places.
- Geocoding via Nominatim (OpenStreetMap) to position the returned places on the map.
- Dark CartoDB tile layer for a sleek, high-contrast map aesthetic.
- Query chip overlay on the map showing the active search.
- Toast notification system for errors and tips.

### Fixed
- `tests/test_main.py`: `@patch` decorator argument order was reversed (bottom-up rule violated).
- `tests/test_main.py`: `load_dotenv` mock was ineffective because it runs at module-import time; removed the unnecessary patch.
- `main.py`: Unhandled `None` response from the Gemini API now raises `RuntimeError` with a clear message.
- `tests/test_main.py`: Added `test_get_gemini_response_empty_text` to cover the new `RuntimeError` guard.

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
- Refactored `main.py` to load environment variables at module level for better performance.

# 📜 Changelog

All notable changes to Map-Genie are documented below. This project follows the [Keep a Changelog](https://keepachangelog.com/) format and uses semantic versioning where applicable.

## [Unreleased]

### Added
- Updated the project dependency set to current stable package versions for the app, Vite toolchain, and TypeScript support.

### Fixed
- Hardened the Nominatim geocoder to gracefully handle empty input, failed fetches, malformed JSON, and invalid coordinate values.
- Improved backend request validation to reject malformed chat payloads before Gemini calls are attempted.
- Prevented server startup from crashing when `GEMINI_API_KEY` is missing during local development or test runs.
- Added the missing React TypeScript packages required for the project to compile cleanly.

### Documentation
- Refreshed `README.md` to match the current Node/Express + React app structure and local setup workflow.

---

## [1.8.2] - 2026-09-14

### Added
- Production `Dockerfile` for containerized deployments.
- CI/CD step for the Python unit test suite with `pytest`.

### Fixed
- Updated the GitHub Actions workflow to validate `dist/server.cjs` and handle API secrets more safely.
- Replaced deprecated `datetime.utcnow()` usage with `datetime.now(timezone.utc)` in the Python backend.

### Changed
- Cleaned up the project structure by moving `legacy-prototype.html` to `docs/archive/legacy-prototype.html`.
- Removed the empty `.aistudio` assets folder.

---

## [1.8.1] - 2026-06-17

### Fixed
- Fixed TrustedHostMiddleware allowed-host configuration in the Python backend for test and HTTP origin scenarios.
- Relaxed overly strict dependency pins in `backend_python/requirements.txt`.
- Removed the redundant duplicate `backend_python/mapgenie_fastapi.py` file.

---

## [1.8.0] - 2026-06-16

### Added
- Introduced the FastAPI-based Python backend in `backend_python/`.
- Added the weather widget for live Open-Meteo forecasts.
- Added itinerary analytics for trip insights and category distribution.

### Documentation
- Updated `README.md` with the Python backend setup and frontend feature list.
- Expanded `CHANGELOG.md` for the 1.8.0 release.

---

## [1.7.0] - 2026-06-15

### Features
- Refactored large JSX blocks into modular components:
  - `ControlPanel.tsx`
  - `MapPanel.tsx`
  - `AssistantPanel.tsx`
  - `PlaceForm.tsx`
  - `MobileNav.tsx`
- Reorganized the codebase by moving backend logic to `src/server/` and tests to `tests/`.

### Documentation
- Updated `README.md` with clearer installation instructions and project structure.
- Refreshed `CHANGELOG.md` for the refactor.

### Refactoring
- Improved maintainability by decoupling UI logic into dedicated components.
- Updated `package.json` scripts to match the new structure.

---

## [1.6.0] - 2026-04-15

### Added
- Introduced the high-contrast paper accent theme and CSS custom property system.
- Overhauled the typography system for readability.

### Fixed
- Fixed JSX compilation issues in `SearchBar.tsx` and `MapContainer.tsx`.
- Restored clean production builds.

---

## [1.5.0] - 2026-03-10

### Added
- Added the adaptive mobile sidebar.
- Added the glassmorphic overlay form for custom itinerary editing.

---

## [1.1.0] - 2026-01-15

### Added
- Initial release with Gemini chat support and speech input.
- Added Leaflet map integration with Nominatim geocoding.

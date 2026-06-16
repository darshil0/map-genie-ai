# 📜 Changelog

All notable changes to **Map-Genie** are documented below. This project adheres to [Semantic Versioning](https://semver.org/) and uses the [Keep a Changelog](https://keepachangelog.com/) format.

## [1.7.0] - 2026-06-15

### Features

- **Major Codebase Refactoring**: Extracted large JSX blocks from `App.tsx` into modular components:
  - `ControlPanel.tsx`
  - `MapPanel.tsx`
  - `AssistantPanel.tsx`
  - `PlaceForm.tsx`
  - `MobileNav.tsx`
- **Project Structure Reorganization**:
  - Moved backend server to `src/server/`.
  - Moved tests to a dedicated root `tests/` directory.

### Documentation

- Completely updated `README.md` with modern formatting, clear installation steps, and project structure overview.
- Updated `CHANGELOG.md` to reflect recent major structural changes.

### Refactoring

- Improved project maintainability by decoupling UI components.
- Updated `package.json` scripts to align with the new project structure.

---

## [1.6.0] - 2026-04-15

### Added

- **High-Contrast Paper Accent Theme**: Introduced CSS Custom Property system for accessible, themeable design.
- **Typography System Overhaul**: Updated font stacks for improved readability.

### Fixed

- Fixed JSX compilation failures in `SearchBar.tsx` and `MapContainer.tsx`.
- Restored clean production builds.

---

## [1.5.0] - 2026-03-10

### Added

- **Adaptive Mobile Sidebar**: Dynamic height transitions for mobile viewports.
- **Glassmorphic Overlay Curation Form**: Improved form accessibility on mobile.

---

## [1.1.0] - 2026-01-15

### Added

- Initial Release with Gemini Chat & Speech Input.
- Leaflet Map integration with Nominatim geocoding.

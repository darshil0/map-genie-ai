# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-06

### Added
- Initial project structure for Python-based Gemini API integration.
- `main.py` with basic Gemini API usage example.
- `requirements.txt` with necessary dependencies (`google-genai`, `python-dotenv`, `pytest`).
- `tests/test_main.py` for verifying project functionality with mocked API calls.
- `README.md` with setup and usage instructions.
- `.env.example` for environment variable configuration.
- `.gitignore` file to exclude environment variables and build artifacts.

### Changed
- Refactored `main.py` to load environment variables at the module level for better performance.

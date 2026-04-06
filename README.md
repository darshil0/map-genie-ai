# Gemini API Python Starter

A simple Python-based starter kit for using the Gemini API via the `google-genai` SDK.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install dependencies:**
    ```bash
    pip3 install -r requirements.txt
    ```

3.  **Configure API Key:**
    - Copy `.env.example` to `.env`.
    - Replace `your_api_key_here` with your actual Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    ```bash
    cp .env.example .env
    ```

## Usage

Run the example script:
```bash
python3 main.py
```

## Running Tests

Run the test suite using `pytest`:
```bash
pytest
```

## Project Structure

- `main.py`: A simple script demonstrating basic Gemini API interaction.
- `requirements.txt`: Python dependencies.
- `.env.example`: Template for environment variables.
- `tests/`: Directory containing test files.

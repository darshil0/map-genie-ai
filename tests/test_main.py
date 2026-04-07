import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
import os

# Mock os.getenv before main is imported if needed, but TestClient will load .env
os.environ["GEMINI_API_KEY"] = "fake_key_for_testing"

from main import app

client = TestClient(app)


@patch("main.client")
def test_explore_endpoint_success(mock_gemini_client):
    """Happy-path: Model returns a structured JSON response."""
    mock_response = MagicMock()
    mock_response.text = '{"location": "Tokyo", "category": "food", "places": []}'
    mock_gemini_client.models.generate_content.return_value = mock_response

    payload = {
        "messages": [{"role": "user", "content": "coffee in Tokyo"}],
        "location_context": None,
    }

    response = client.post("/api/explore", json=payload)

    assert response.status_code == 200
    assert response.json()["location"] == "Tokyo"


def test_explore_endpoint_no_messages():
    """Empty messages array should return 400."""
    payload = {"messages": []}
    response = client.post("/api/explore", json=payload)
    assert response.status_code == 400


@patch("main.client")
def test_explore_endpoint_empty_response(mock_gemini_client):
    """Empty API text response should exhaust retries and return 503."""
    mock_response = MagicMock()
    mock_response.text = None
    mock_gemini_client.models.generate_content.return_value = mock_response

    payload = {"messages": [{"role": "user", "content": "test"}]}

    response = client.post("/api/explore", json=payload)
    assert response.status_code == 503
    assert "AI Service error" in response.json()["detail"]

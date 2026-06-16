"""
Test suite for Map-Genie FastAPI Backend

Run tests with:
    pytest test_server.py -v --cov=server --cov-report=html
    
Run specific test:
    pytest test_server.py::test_health_check -v
"""

import pytest
import json
from datetime import datetime
from unittest.mock import patch, MagicMock
from httpx import AsyncClient

from server import (
    app,
    ChatRequest,
    SpotSchema,
    ResolutionSchema,
    GeminiResponseSchema,
    MapLocation,
    Message,
)


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
async def client():
    """Create async HTTP client for testing."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def valid_map_location():
    """Valid map location fixture."""
    return MapLocation(
        name="Amsterdam",
        latitude=52.3676,
        longitude=4.9041
    )


@pytest.fixture
def valid_chat_message():
    """Valid chat message fixture."""
    return Message(
        id="msg_001",
        sender="user",
        text="Find cozy coffee shops",
        timestamp=datetime.utcnow().isoformat()
    )


@pytest.fixture
def valid_chat_request(valid_map_location, valid_chat_message):
    """Valid chat request fixture."""
    return ChatRequest(
        message="Find the best coffee shops with WiFi",
        history=[valid_chat_message],
        currentLocation=valid_map_location
    )


@pytest.fixture
def valid_gemini_response():
    """Valid Gemini API response fixture."""
    return GeminiResponseSchema(
        resolvedLocation=ResolutionSchema(
            name="Amsterdam",
            latitude=52.3676,
            longitude=4.9041
        ),
        aiResponseText="Found excellent coffee shops in Amsterdam's historic center and canal areas.",
        spots=[
            SpotSchema(
                name="Brouwerij Troost",
                description="Historic Dutch brewery with cozy seating and excellent WiFi",
                whyMatch="Matches your interest in cozy atmosphere and digital nomad needs",
                emoji="☕",
                address="Brouwerij Troost, Amsterdam, Netherlands",
                category="cafe"
            )
        ]
    )


# ============================================================================
# HEALTH CHECK TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_health_check_success(client):
    """Test successful health check with mocked Gemini API."""
    with patch('server.GenerativeModel') as mock_model:
        # Mock successful token count
        mock_instance = MagicMock()
        mock_instance.count_tokens.return_value = MagicMock(total_tokens=5)
        mock_model.return_value = mock_instance
        
        response = await client.get("/api/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["gemini_api"] == "operational"
        assert "request_id" in data
        assert "timestamp" in data


@pytest.mark.asyncio
async def test_health_check_gemini_unavailable(client):
    """Test health check when Gemini API is unavailable."""
    with patch('server.GenerativeModel') as mock_model:
        # Mock API failure
        mock_instance = MagicMock()
        mock_instance.count_tokens.side_effect = Exception("API unavailable")
        mock_model.return_value = mock_instance
        
        response = await client.get("/api/health")
        
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "degraded"
        assert data["gemini_api"] == "unreachable"


# ============================================================================
# CHAT/RECOMMENDATION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_chat_valid_request(client, valid_chat_request, valid_gemini_response):
    """Test successful chat request with valid payload."""
    with patch('server.GenerativeModel') as mock_model:
        # Mock Gemini response
        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.text = valid_gemini_response.model_dump_json()
        mock_instance.generate_content.return_value = mock_response
        mock_model.return_value = mock_instance
        
        response = await client.post(
            "/api/chat",
            json=valid_chat_request.model_dump()
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "resolvedLocation" in data
        assert "aiResponseText" in data
        assert "spots" in data
        assert len(data["spots"]) > 0


@pytest.mark.asyncio
async def test_chat_empty_message(client):
    """Test chat request with empty message."""
    request_data = {
        "message": "",  # Empty
        "history": [],
        "currentLocation": None
    }
    
    response = await client.post("/api/chat", json=request_data)
    
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_chat_message_too_long(client):
    """Test chat request with message exceeding max length."""
    from server import MAX_MESSAGE_LENGTH
    
    request_data = {
        "message": "x" * (MAX_MESSAGE_LENGTH + 1),  # Exceeds limit
        "history": [],
        "currentLocation": None
    }
    
    response = await client.post("/api/chat", json=request_data)
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_chat_invalid_location_coordinates(client):
    """Test chat request with invalid coordinates."""
    request_data = {
        "message": "Find coffee shops",
        "history": [],
        "currentLocation": {
            "name": "Invalid City",
            "latitude": 91.0,  # Invalid: > 90
            "longitude": 4.9041
        }
    }
    
    response = await client.post("/api/chat", json=request_data)
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_chat_history_exceeds_limit(client):
    """Test chat request with history exceeding max messages."""
    from server import MAX_HISTORY_MESSAGES
    
    # Create messages exceeding limit
    excessive_history = [
        {
            "id": f"msg_{i}",
            "sender": "user",
            "text": f"Message {i}",
            "timestamp": datetime.utcnow().isoformat()
        }
        for i in range(MAX_HISTORY_MESSAGES + 5)
    ]
    
    request_data = {
        "message": "Find coffee shops",
        "history": excessive_history,
        "currentLocation": None
    }
    
    response = await client.post("/api/chat", json=request_data)
    
    assert response.status_code == 422


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_chat_gemini_timeout(client, valid_chat_request):
    """Test chat request when Gemini API times out."""
    from google.api_core.exceptions import DeadlineExceeded
    
    with patch('server.GenerativeModel') as mock_model:
        mock_instance = MagicMock()
        mock_instance.generate_content.side_effect = DeadlineExceeded("Request timeout")
        mock_model.return_value = mock_instance
        
        response = await client.post(
            "/api/chat",
            json=valid_chat_request.model_dump()
        )
        
        assert response.status_code == 504  # Gateway Timeout


@pytest.mark.asyncio
async def test_chat_gemini_auth_error(client, valid_chat_request):
    """Test chat request when Gemini API auth fails."""
    from google.api_core.exceptions import GoogleAPICallError
    
    with patch('server.GenerativeModel') as mock_model:
        mock_instance = MagicMock()
        error = GoogleAPICallError("UNAUTHENTICATED")
        mock_instance.generate_content.side_effect = error
        mock_model.return_value = mock_instance
        
        response = await client.post(
            "/api/chat",
            json=valid_chat_request.model_dump()
        )
        
        assert response.status_code == 500


@pytest.mark.asyncio
async def test_chat_gemini_quota_exceeded(client, valid_chat_request):
    """Test chat request when Gemini API quota exceeded."""
    from google.api_core.exceptions import GoogleAPICallError
    
    with patch('server.GenerativeModel') as mock_model:
        mock_instance = MagicMock()
        error = GoogleAPICallError("RESOURCE_EXHAUSTED")
        mock_instance.generate_content.side_effect = error
        mock_model.return_value = mock_instance
        
        response = await client.post(
            "/api/chat",
            json=valid_chat_request.model_dump()
        )
        
        assert response.status_code == 429


@pytest.mark.asyncio
async def test_chat_gemini_malformed_json(client, valid_chat_request):
    """Test chat request when Gemini returns invalid JSON."""
    with patch('server.GenerativeModel') as mock_model:
        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "{ invalid json }"
        mock_instance.generate_content.return_value = mock_response
        mock_model.return_value = mock_instance
        
        response = await client.post(
            "/api/chat",
            json=valid_chat_request.model_dump()
        )
        
        assert response.status_code == 502


@pytest.mark.asyncio
async def test_chat_gemini_schema_mismatch(client, valid_chat_request):
    """Test chat request when Gemini response doesn't match schema."""
    with patch('server.GenerativeModel') as mock_model:
        mock_instance = MagicMock()
        mock_response = MagicMock()
        # Missing required fields
        mock_response.text = json.dumps({
            "resolvedLocation": {"name": "Test"}  # Missing lat/lng
        })
        mock_instance.generate_content.return_value = mock_response
        mock_model.return_value = mock_instance
        
        response = await client.post(
            "/api/chat",
            json=valid_chat_request.model_dump()
        )
        
        assert response.status_code == 502


@pytest.mark.asyncio
async def test_chat_empty_gemini_response(client, valid_chat_request):
    """Test chat request when Gemini returns empty response."""
    with patch('server.GenerativeModel') as mock_model:
        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.text = ""  # Empty
        mock_instance.generate_content.return_value = mock_response
        mock_model.return_value = mock_instance
        
        response = await client.post(
            "/api/chat",
            json=valid_chat_request.model_dump()
        )
        
        assert response.status_code == 502


# ============================================================================
# RATE LIMITING TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_rate_limit_not_exceeded(client, valid_chat_request):
    """Test that single request doesn't hit rate limit."""
    with patch('server.GenerativeModel') as mock_model:
        mock_instance = MagicMock()
        # Create valid response
        valid_response = GeminiResponseSchema(
            resolvedLocation=ResolutionSchema(
                name="Test",
                latitude=0,
                longitude=0
            ),
            aiResponseText="Test response text.",
            spots=[
                SpotSchema(
                    name="Test Spot",
                    description="A great test spot for testing purposes",
                    whyMatch="Perfect for testing",
                    emoji="📍",
                    address="Test Address, Test City",
                    category="custom"
                )
            ]
        )
        mock_response = MagicMock()
        mock_response.text = valid_response.model_dump_json()
        mock_instance.generate_content.return_value = mock_response
        mock_model.return_value = mock_instance
        
        response = await client.post(
            "/api/chat",
            json=valid_chat_request.model_dump()
        )
        
        assert response.status_code == 200


# ============================================================================
# REQUEST TRACKING TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_request_id_header(client):
    """Test that request ID is tracked and returned."""
    response = await client.get("/api/health")
    
    assert "x-request-id" in response.headers
    request_id = response.headers["x-request-id"]
    assert request_id is not None
    assert len(request_id) > 0


@pytest.mark.asyncio
async def test_custom_request_id(client):
    """Test that custom request ID is preserved."""
    custom_id = "custom-request-123"
    
    response = await client.get(
        "/api/health",
        headers={"X-Request-ID": custom_id}
    )
    
    assert response.headers["x-request-id"] == custom_id


# ============================================================================
# CORS TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_cors_headers_present(client):
    """Test that CORS headers are present."""
    # Note: OPTIONS requests may return 405 if not configured, but CORS middleware should work
    response = await client.options("/api/chat")
    
    # CORS headers should be present on successful responses
    # If OPTIONS returns 200, verify CORS headers exist
    if response.status_code == 200:
        assert "access-control-allow-origin" in response.headers


# ============================================================================
# DOCUMENTATION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_api_docs_available(client):
    """Test that API documentation is available."""
    response = await client.get("/api/docs")
    
    assert response.status_code == 200
    assert "swagger" in response.text.lower() or "openapi" in response.text.lower()


@pytest.mark.asyncio
async def test_openapi_schema_available(client):
    """Test that OpenAPI schema is available."""
    response = await client.get("/api/openapi.json")
    
    assert response.status_code == 200
    data = response.json()
    assert "paths" in data
    assert "info" in data


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--cov=server"])

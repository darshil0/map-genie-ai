import pytest
from unittest.mock import MagicMock, patch
from main import get_gemini_response

@patch("main.genai.Client")
@patch("main.load_dotenv")
@patch("os.getenv")
def test_get_gemini_response(mock_getenv, mock_load_dotenv, mock_client_class):
    # Setup mocks
    mock_getenv.return_value = "fake_api_key"
    mock_client_instance = MagicMock()
    mock_client_class.return_value = mock_client_instance

    mock_response = MagicMock()
    mock_response.text = "This is a mocked response."
    mock_client_instance.models.generate_content.return_value = mock_response

    # Execute
    response = get_gemini_response("Hello")

    # Assert
    assert response == "This is a mocked response."
    mock_client_class.assert_called_once_with(api_key="fake_api_key")
    mock_client_instance.models.generate_content.assert_called_once_with(
        model="gemini-2.0-flash",
        contents="Hello"
    )

@patch("os.getenv")
def test_get_gemini_response_no_api_key(mock_getenv):
    mock_getenv.return_value = None

    with pytest.raises(ValueError, match="GEMINI_API_KEY not found in environment variables."):
        get_gemini_response("Hello")

import pytest
from unittest.mock import MagicMock, patch


# ---------------------------------------------------------------------------
# FIX 1: load_dotenv is called at *module* level in main.py, so patching it
#         inside the test function has no effect.  We patch os.getenv directly
#         which is what the code actually reads at call-time.
#
# FIX 2: @patch decorators are applied bottom-up, so the argument order was
#         previously inverted (mock_getenv ↔ mock_load_dotenv were swapped).
#         The corrected order is: outermost decorator → last argument.
# ---------------------------------------------------------------------------


@patch("main.genai.Client")
@patch("os.getenv")
def test_get_gemini_response(mock_getenv, mock_client_class):
    """Happy-path: API key present, model returns a mocked response."""
    from main import get_gemini_response

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
        contents="Hello",
    )


@patch("os.getenv")
def test_get_gemini_response_no_api_key(mock_getenv):
    """Missing API key should raise ValueError."""
    from main import get_gemini_response

    mock_getenv.return_value = None

    with pytest.raises(ValueError, match="GEMINI_API_KEY not found in environment variables."):
        get_gemini_response("Hello")


@patch("main.genai.Client")
@patch("os.getenv")
def test_get_gemini_response_empty_text(mock_getenv, mock_client_class):
    """Empty/None response.text should raise RuntimeError."""
    from main import get_gemini_response

    mock_getenv.return_value = "fake_api_key"

    mock_client_instance = MagicMock()
    mock_client_class.return_value = mock_client_instance

    mock_response = MagicMock()
    mock_response.text = None  # simulate empty API response
    mock_client_instance.models.generate_content.return_value = mock_response

    with pytest.raises(RuntimeError, match="Received an empty response"):
        get_gemini_response("Hello")

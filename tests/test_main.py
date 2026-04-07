import pytest
from unittest.mock import MagicMock, patch

# ---------------------------------------------------------------------------
# FIX: Import get_gemini_response at module level so that the function object
#      is resolved once, before any patches are applied.  Importing inside
#      each test function forces a re-import on every call, which can return
#      a cached module whose attributes were already bound before patching
#      took effect — leading to tests that pass locally but fail under
#      certain import-order conditions.
#
# Note on decorator order (preserved from v0.2.0):
#   @patch decorators are applied bottom-up, so the argument order matches
#   the innermost → outermost decorator top-to-bottom as written.
#   e.g. @patch("A") over @patch("B") → def test(mock_b, mock_a)
# ---------------------------------------------------------------------------

from main import get_gemini_response  # noqa: E402  (after comment block)


@patch("main.genai.Client")
@patch("os.getenv")
def test_get_gemini_response(mock_getenv, mock_client_class):
    """Happy-path: API key present, model returns a mocked response."""
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
    mock_getenv.return_value = None

    with pytest.raises(ValueError, match="GEMINI_API_KEY not found in environment variables."):
        get_gemini_response("Hello")


@patch("main.genai.Client")
@patch("os.getenv")
def test_get_gemini_response_empty_text(mock_getenv, mock_client_class):
    """Empty/None response.text should raise RuntimeError."""
    mock_getenv.return_value = "fake_api_key"

    mock_client_instance = MagicMock()
    mock_client_class.return_value = mock_client_instance

    mock_response = MagicMock()
    mock_response.text = None  # simulate empty API response
    mock_client_instance.models.generate_content.return_value = mock_response

    with pytest.raises(RuntimeError, match="Received an empty response"):
        get_gemini_response("Hello")

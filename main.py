import os
from dotenv import load_dotenv
from google import genai
from google.genai import errors

# Load environment variables at module level
load_dotenv()


def get_gemini_response(prompt: str) -> str:
    """
    Send a prompt to the Gemini API and return the text response.

    Args:
        prompt: The text prompt to send to the model.

    Returns:
        The model's text response.

    Raises:
        ValueError: If GEMINI_API_KEY is not set.
        RuntimeError: If the API returns an empty or invalid response.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")

    client = genai.Client(api_key=api_key)
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
    except (errors.APIError, errors.ClientError, errors.ServerError) as e:
        raise RuntimeError(f"Error calling Gemini API: {e}")

    # FIX: guard against None response.text (was previously unhandled)
    if not response or not response.text:
        raise RuntimeError("Received an empty response from the Gemini API.")

    return response.text


def main() -> None:
    try:
        prompt = "Explain quantum computing in simple terms."
        print(f"Prompt: {prompt}")
        response = get_gemini_response(prompt)
        print(f"Response: {response}")
    except (ValueError, RuntimeError) as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()

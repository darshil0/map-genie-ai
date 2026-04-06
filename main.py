import os
from dotenv import load_dotenv
from google import genai

# Load environment variables at module level
load_dotenv()

def get_gemini_response(prompt):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    return response.text

def main():
    try:
        prompt = "Explain quantum computing in simple terms."
        print(f"Prompt: {prompt}")
        response = get_gemini_response(prompt)
        print(f"Response: {response}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()

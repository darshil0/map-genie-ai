import os
import time
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import errors, types

# Load environment variables at module level
load_dotenv()

app = FastAPI(title="Map-Genie API")

# Setup Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("WARNING: GEMINI_API_KEY not set. API calls will fail.")
    client = None
else:
    client = genai.Client(api_key=api_key)


# --- Pydantic Schemas for Structured Output ---
class Place(BaseModel):
    name: str = Field(description="Name of the place")
    type: str = Field(description="Specific type or category of the place")
    description: str = Field(description="1-2 sentence description")
    tags: List[str] = Field(description="List of relevant tags like 'food', 'art', etc.")
    distance: str = Field(description="Approximate distance (e.g. '0.5 km')")

class ExploreResponse(BaseModel):
    location: str = Field(description="Canonical location name suitable for geocoding")
    category: str = Field(description="The general category label")
    places: List[Place] = Field(description="List of 8 places matching the query")


# --- Frontend Request Models ---
class ChatMessage(BaseModel):
    role: str
    content: str

class ExploreRequest(BaseModel):
    messages: List[ChatMessage]
    location_context: Optional[dict] = None  # {lat: float, lng: float}


@app.post("/api/explore", response_model=ExploreResponse)
def explore_endpoint(req: ExploreRequest):
    if not client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured.")

    if not req.messages:
        raise HTTPException(status_code=400, detail="Messages array cannot be empty.")

    system_instruction = (
        "You are Map-Genie, an AI travel assistant. Analyze the user's conversation to determine "
        "their desired locations or refinements. "
        "Provide exactly 8 realistic, well-known places. Return data strictly fulfilling the requested schema."
    )
    
    if req.location_context:
        system_instruction += f"\nThe user is currently near coordinates {req.location_context['lat']}, {req.location_context['lng']}."

    # Convert frontend messages to Gemini format
    gemini_contents = []
    for msg in req.messages:
        role = "user" if msg.role == "user" else "model"
        gemini_contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))

    max_retries = 3
    base_delay = 2

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=gemini_contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=ExploreResponse,
                )
            )
            
            if not response.text:
                 raise RuntimeError("Empty response received.")
                 
            # Strip markdown block occasionally appended by LLMs
            raw_json = response.text.replace("```json", "").replace("```", "").strip()
            
            # Note: With response_schema, Gemini returns a literal JSON object string
            return ExploreResponse.model_validate_json(raw_json)
            
        except (errors.APIError, Exception) as e:
            if attempt == max_retries - 1:
                print(f"Warning: Gemini API call failed after {max_retries} attempts: {e}")
                raise HTTPException(status_code=503, detail=f"AI Service error: {str(e)}")
            time.sleep(base_delay * (2 ** attempt))


# Mount the static directory to serve index.html
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def serve_index():
    return FileResponse("static/index.html")

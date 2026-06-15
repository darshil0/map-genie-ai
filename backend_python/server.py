# SPDX-License-Identifier: Apache-2.0
"""
Map Genie - Optional Python Microservice Backend Reference
To run locally:
  pip install -r requirements.txt
  python server.py
"""

import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(
    title="Map Genie Python Microservice",
    description="Microservice pattern demonstrating Map Genie backend travel querying",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MapLocation(BaseModel):
    name: str
    latitude: float
    longitude: float

class Message(BaseModel):
    id: str
    sender: str  # "user" or "assistant"
    text: str
    timestamp: str

class ChatRequest(BaseModel):
    message: str
    history: List[Message]
    currentLocation: Optional[MapLocation] = None

class SpotSchema(BaseModel):
    name: str = Field(description="Official name of the tourist interest/café spot")
    description: str = Field(description="Unique description and travel highlight of this spot")
    whyMatch: str = Field(description="Reasoning of why this venue vibes with user's prompt request")
    emoji: str = Field(description="Perfect emoji marker representation (e.g. 🏮, ☕, 🏰)")
    address: str = Field(description="Specific geocodable target address query (Name, Street, City, Country)")
    category: str = Field(description="Venue key category: cafe, restaurant, museum, park, outlook, historic")

class ResolutionSchema(BaseModel):
    name: str = Field(description="Name of the city/general vicinity parsed")
    latitude: float = Field(description="Latitude coordinates centroid of the vicinage")
    longitude: float = Field(description="Longitude coordinates centroid of the vicinage")

class GeminiResponseSchema(BaseModel):
    resolvedLocation: ResolutionSchema
    aiResponseText: str
    spots: List[SpotSchema]

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not defined in environment variables.")
    # Initialize the Gemini Client with proper SDK standards
    return genai.Client(api_key=api_key)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "microservice": "python-fastapi"}

@app.post("/api/chat", response_model=GeminiResponseSchema)
def generate_travel_spots(payload: ChatRequest):
    try:
        client = get_gemini_client()
        
        # Structure the conversation history
        formatted_history = ""
        for item in payload.history:
            sender_tag = "User" if item.sender == "user" else "Assistant"
            formatted_history += f"{sender_tag}: {item.text}\n"

        prompt_text = f"""
User Location Hint: {payload.currentLocation.model_dump() if payload.currentLocation else "Not provided"}

Previous Refined Chat History:
{formatted_history}

New User Prompt: "{payload.message}"

Identify 4 to 6 incredibly matching local spots for this prompt. Return standard JSON. Ensure addresses are precise. Keep the location centroid centered on the same city unless they explicitly switch geographical zones.
"""

        # Generate structured content using Gemini Flash
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=prompt_text,
            config=types.GenerateContentConfig(
                system_instruction=(
                    "You are Map Genie, an AI Travel Sidekick. "
                    "Analyze user requests, compile beautiful places and cafes, and output highly "
                    "re-queryable addresses formatted cleanly as JSON matching the given schema models."
                ),
                response_mime_type="application/json",
                response_schema=GeminiResponseSchema,
                temperature=0.7,
            ),
        )
        
        if not response.text:
            raise HTTPException(status_code=500, detail="Gemini backend response text was empty.")
            
        return GeminiResponseSchema.model_validate_json(response.text.strip())
        
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"LLM Processing Error: {str(err)}")

if __name__ == "__main__":
    import uvicorn
    # Standard Microservice Port Configuration
    uvicorn.run(app, host="0.0.0.0", port=8000)

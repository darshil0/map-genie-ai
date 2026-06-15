# SPDX-License-Identifier: Apache-2.0
"""
Map-Genie Python FastAPI Backend Microservice

A production-grade travel recommendation API using Google Gemini.

To run locally:
    pip install -r requirements.txt
    python -m uvicorn server:app --reload --port 8000

Environment Variables:
    GEMINI_API_KEY (required): Google Gemini API key
    ALLOWED_ORIGINS (optional): Comma-separated CORS origins (default: localhost:3000,localhost:5173)
    REQUEST_TIMEOUT_SECONDS (optional): API timeout in seconds (default: 30)
    MAX_HISTORY_MESSAGES (optional): Max chat history messages (default: 20)
    LOG_LEVEL (optional): Logging level (default: INFO)
    ENABLE_METRICS (optional): Enable Prometheus metrics (default: false)
"""

import os
import sys
import json
import logging
import time
from typing import List, Optional
from datetime import datetime
from functools import wraps
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZIPMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator, constr, conlist
from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai import GenerativeModel
from google.api_core.exceptions import GoogleAPICallError, DeadlineExceeded
import uvicorn

# ============================================================================
# SETUP & CONFIGURATION
# ============================================================================

load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format='%(asctime)s - %(name)s - %(levelname)s - [%(funcName)s:%(lineno)d] - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('map_genie.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# Configuration from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
REQUEST_TIMEOUT_SECONDS = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "30"))
MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES", "20"))
MAX_MESSAGE_LENGTH = 2000  # Characters
MAX_REQUEST_SIZE = 50000  # Bytes
ENABLE_METRICS = os.getenv("ENABLE_METRICS", "false").lower() == "true"

# ============================================================================
# STARTUP VALIDATION
# ============================================================================

def validate_startup():
    """Validate critical environment variables and API connectivity at startup."""
    if not GEMINI_API_KEY:
        logger.error("❌ GEMINI_API_KEY environment variable is not set")
        raise ValueError("GEMINI_API_KEY is required. Set via environment variable or .env file.")
    
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        logger.info("✅ Gemini API configured successfully")
    except Exception as e:
        logger.error(f"❌ Failed to configure Gemini API: {e}")
        raise RuntimeError(f"Gemini API configuration failed: {e}")

    logger.info(f"✅ Server configured: timeout={REQUEST_TIMEOUT_SECONDS}s, max_history={MAX_HISTORY_MESSAGES}")

# Validate on import
validate_startup()

# ============================================================================
# MODELS & SCHEMAS
# ============================================================================

class MapLocation(BaseModel):
    """User's current map location context."""
    name: str = Field(..., min_length=1, max_length=100, description="City or location name")
    latitude: float = Field(..., ge=-90, le=90, description="Latitude (-90 to 90)")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude (-180 to 180)")

    @validator('latitude', 'longitude')
    def validate_coordinates(cls, v):
        """Ensure coordinates are valid numbers."""
        if not isinstance(v, (int, float)):
            raise ValueError("Coordinates must be numeric")
        return v


class Message(BaseModel):
    """Chat history message."""
    id: str = Field(..., min_length=1, max_length=50)
    sender: str = Field(..., regex="^(user|assistant)$", description="Message sender role")
    text: constr(min_length=1, max_length=MAX_MESSAGE_LENGTH) = Field(...)
    timestamp: str = Field(..., description="ISO 8601 timestamp")

    @validator('timestamp')
    def validate_timestamp(cls, v):
        """Ensure timestamp is valid ISO 8601."""
        try:
            datetime.fromisoformat(v.replace('Z', '+00:00'))
        except ValueError:
            raise ValueError("Timestamp must be ISO 8601 format")
        return v


class ChatRequest(BaseModel):
    """Request to generate travel spot recommendations."""
    message: constr(min_length=1, max_length=MAX_MESSAGE_LENGTH) = Field(..., description="User query")
    history: conlist(Message, max_items=MAX_HISTORY_MESSAGES) = Field(default=[], description="Chat history")
    currentLocation: Optional[MapLocation] = Field(None, description="User's current location context")

    @validator('history')
    def validate_history_size(cls, v):
        """Prevent excessive chat history."""
        if len(v) > MAX_HISTORY_MESSAGES:
            raise ValueError(f"Chat history exceeds {MAX_HISTORY_MESSAGES} messages")
        return v

    class Config:
        schema_extra = {
            "example": {
                "message": "Find cozy coffee shops near me",
                "history": [],
                "currentLocation": {
                    "name": "Amsterdam",
                    "latitude": 52.3676,
                    "longitude": 4.9041
                }
            }
        }


class SpotSchema(BaseModel):
    """Individual point of interest."""
    name: str = Field(..., min_length=1, max_length=200, description="Official POI name")
    description: str = Field(..., min_length=10, max_length=500, description="Why this spot is recommended")
    whyMatch: str = Field(..., min_length=5, max_length=300, description="Reasoning for recommendation")
    emoji: str = Field(..., regex="^[\\U0001F300-\\U0001F9FF]|[☀-♿]$", description="Valid emoji marker")
    address: str = Field(..., min_length=5, max_length=300, description="Geocodable address")
    category: str = Field(..., regex="^(cafe|restaurant|museum|park|outlook|historic|hotel|art|food|nature)$")

    @validator('emoji')
    def validate_emoji_length(cls, v):
        """Ensure emoji is single character."""
        if len(v) != 1:
            raise ValueError("Emoji must be a single character")
        return v


class ResolutionSchema(BaseModel):
    """Resolved location context."""
    name: str = Field(..., min_length=1, max_length=100, description="City/region name")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

    @validator('latitude', 'longitude')
    def validate_coordinates(cls, v):
        """Ensure valid coordinate ranges."""
        if not isinstance(v, (int, float)):
            raise ValueError("Coordinates must be numeric")
        return v


class GeminiResponseSchema(BaseModel):
    """Complete API response with recommendations."""
    resolvedLocation: ResolutionSchema
    aiResponseText: str = Field(..., min_length=10, max_length=1000, description="AI's explanation")
    spots: conlist(SpotSchema, min_items=1, max_items=10) = Field(...)

    class Config:
        schema_extra = {
            "example": {
                "resolvedLocation": {
                    "name": "Amsterdam",
                    "latitude": 52.3676,
                    "longitude": 4.9041
                },
                "aiResponseText": "Found excellent coffee spots in Amsterdam's historic center...",
                "spots": [
                    {
                        "name": "Brouwerij Troost",
                        "description": "Historic Dutch brewery with cozy seating",
                        "whyMatch": "Matches your interest in local culture and beverages",
                        "emoji": "🍺",
                        "address": "Brouwerij Troost, Amsterdam, Netherlands",
                        "category": "cafe"
                    }
                ]
            }
        }


class ErrorDetail(BaseModel):
    """Standardized error response."""
    error: str
    error_code: str
    detail: str
    request_id: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ============================================================================
# MIDDLEWARE & CONTEXT
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage app lifecycle (startup/shutdown)."""
    logger.info("🚀 Map-Genie API server starting...")
    yield
    logger.info("🛑 Map-Genie API server shutting down...")


# ============================================================================
# FASTAPI APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title="Map-Genie Python Backend",
    description="Travel recommendation microservice powered by Google Gemini",
    version="1.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Add security middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1"] + ALLOWED_ORIGINS)

# Add CORS middleware (restricted origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
    max_age=600,
)

# Add compression
app.add_middleware(GZIPMiddleware, minimum_size=1000)


# ============================================================================
# REQUEST TRACKING & MIDDLEWARE
# ============================================================================

async def get_request_id(request: Request) -> str:
    """Extract or generate request ID for tracing."""
    request_id = request.headers.get("X-Request-ID", f"{int(time.time() * 1000)}")
    request.state.request_id = request_id
    return request_id


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all HTTP requests and responses."""
    request_id = await get_request_id(request)
    
    # Check request size
    if request.method == "POST":
        body = await request.body()
        if len(body) > MAX_REQUEST_SIZE:
            logger.warning(f"[{request_id}] Request exceeds size limit: {len(body)} bytes")
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={
                    "error": "Request too large",
                    "error_code": "PAYLOAD_TOO_LARGE",
                    "detail": f"Request size exceeds {MAX_REQUEST_SIZE} bytes",
                    "request_id": request_id
                }
            )
        # Re-attach body for processing
        async def receive():
            return {"type": "http.request", "body": body}
        request._receive = receive

    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = str(process_time)
        
        logger.info(
            f"[{request_id}] {request.method} {request.url.path} "
            f"-> {response.status_code} ({process_time:.2f}s)"
        )
        return response
    except Exception as e:
        logger.error(f"[{request_id}] Request processing error: {e}")
        raise


# ============================================================================
# RATE LIMITING (Simple in-memory)
# ============================================================================

from collections import defaultdict
from threading import Lock

_rate_limit_store = defaultdict(list)
_rate_limit_lock = Lock()

RATE_LIMIT_REQUESTS = 10  # Requests
RATE_LIMIT_WINDOW = 60    # Seconds


def check_rate_limit(request: Request) -> bool:
    """Simple token bucket rate limiter per IP."""
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    with _rate_limit_lock:
        # Clean old entries
        _rate_limit_store[client_ip] = [
            req_time for req_time in _rate_limit_store[client_ip]
            if now - req_time < RATE_LIMIT_WINDOW
        ]
        
        if len(_rate_limit_store[client_ip]) >= RATE_LIMIT_REQUESTS:
            return False
        
        _rate_limit_store[client_ip].append(now)
        return True


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get(
    "/api/health",
    tags=["Health"],
    response_model=dict,
    summary="Health check endpoint",
    responses={
        200: {"description": "Service is healthy and Gemini API is reachable"},
        503: {"description": "Service degraded or API unreachable"}
    }
)
async def health_check(request: Request):
    """
    Check API health and Gemini API connectivity.
    
    **Response fields:**
    - `status`: "healthy" or "degraded"
    - `timestamp`: ISO 8601 timestamp
    - `gemini_api`: "operational" or "unreachable"
    - `version`: API version
    - `request_id`: Request tracking ID
    """
    request_id = request.state.request_id
    
    try:
        # Quick Gemini API connectivity check (count tokens only, no cost)
        test_model = GenerativeModel("gemini-2.0-flash")
        test_model.count_tokens("test")
        gemini_status = "operational"
        http_status = 200
    except Exception as e:
        logger.warning(f"[{request_id}] Gemini API check failed: {e}")
        gemini_status = "unreachable"
        http_status = 503

    response_body = {
        "status": "healthy" if gemini_status == "operational" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "gemini_api": gemini_status,
        "version": "1.1.0",
        "request_id": request_id
    }

    return JSONResponse(
        status_code=http_status,
        content=response_body
    )


@app.post(
    "/api/chat",
    tags=["Travel Recommendations"],
    response_model=GeminiResponseSchema,
    status_code=200,
    summary="Generate travel spot recommendations",
    responses={
        200: {"description": "Successfully generated recommendations"},
        400: {"description": "Invalid request payload"},
        429: {"description": "Rate limit exceeded"},
        500: {"description": "Internal server error"},
        503: {"description": "Gemini API unavailable"}
    }
)
async def generate_travel_spots(
    request: Request,
    payload: ChatRequest
) -> GeminiResponseSchema:
    """
    Generate personalized travel spot recommendations using Gemini AI.
    
    **Request Body:**
    - `message`: User query (e.g., "Find cozy coffee shops")
    - `history`: Previous chat messages (optional, max 20)
    - `currentLocation`: User's current location context (optional)
    
    **Response:**
    - `resolvedLocation`: Where recommendations are centered
    - `aiResponseText`: AI explanation
    - `spots`: List of 1-10 recommended POIs with details
    
    **Errors:**
    - 400: Invalid input (bad coordinates, empty message, etc.)
    - 429: Too many requests (rate limited)
    - 500: AI processing error
    - 503: Gemini API unavailable
    
    **Example Request:**
    ```json
    {
        "message": "Best coffee shops with WiFi",
        "currentLocation": {
            "name": "Amsterdam",
            "latitude": 52.3676,
            "longitude": 4.9041
        }
    }
    ```
    """
    request_id = request.state.request_id
    
    # ---- Rate Limiting ----
    if not check_rate_limit(request):
        logger.warning(f"[{request_id}] Rate limit exceeded for {request.client.host}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: max {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW} seconds"
        )
    
    try:
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"[{request_id}] Chat request from {client_ip}: '{payload.message[:50]}...'")
        
        # ---- Build Conversation History ----
        formatted_history = ""
        for msg in payload.history:
            sender = "User" if msg.sender == "user" else "Assistant"
            formatted_history += f"{sender}: {msg.text}\n"
        
        # ---- Build Prompt ----
        location_context = ""
        if payload.currentLocation:
            location_context = f"Current Location: {payload.currentLocation.name} ({payload.currentLocation.latitude}, {payload.currentLocation.longitude})\n"
        
        system_prompt = (
            "You are Map-Genie, an expert AI Travel Sidekick. "
            "Analyze user travel requests and recommend 4-6 highly relevant local spots. "
            "Return responses ONLY as valid JSON matching the provided schema. "
            "Ensure all addresses are precise and geocodable. "
            "Maintain location context (don't switch cities unless explicitly requested). "
            "Prioritize safety, accessibility, and cultural authenticity."
        )
        
        user_prompt = f"""{location_context}Chat History:
{formatted_history}

User Request: "{payload.message}"

Analyze the request and return exactly matching JSON with resolvedLocation, aiResponseText, and spots array."""
        
        # ---- Call Gemini API ----
        try:
            model = GenerativeModel(
                model_name="gemini-2.0-flash",
                system_instruction=system_prompt
            )
            
            response = model.generate_content(
                user_prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=GeminiResponseSchema,
                    temperature=0.7,
                    max_output_tokens=2048,
                    top_p=0.95,
                    top_k=40
                ),
                request_options={"timeout": REQUEST_TIMEOUT_SECONDS}
            )
            
            if not response or not response.text:
                logger.error(f"[{request_id}] Gemini returned empty response")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Gemini API returned empty response"
                )
            
            # ---- Parse & Validate Response ----
            try:
                result = GeminiResponseSchema.model_validate_json(response.text.strip())
                logger.info(f"[{request_id}] Successfully generated {len(result.spots)} recommendations")
                return result
                
            except json.JSONDecodeError as je:
                logger.error(f"[{request_id}] Invalid JSON from Gemini: {je}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Gemini API returned malformed JSON"
                )
                
            except ValueError as ve:
                logger.error(f"[{request_id}] Schema validation failed: {ve}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Gemini response doesn't match expected schema"
                )
        
        except DeadlineExceeded:
            logger.error(f"[{request_id}] Gemini API timeout after {REQUEST_TIMEOUT_SECONDS}s")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail=f"Gemini API request timed out after {REQUEST_TIMEOUT_SECONDS}s"
            )
        
        except GoogleAPICallError as gae:
            logger.error(f"[{request_id}] Gemini API error: {gae}")
            
            if "INVALID_ARGUMENT" in str(gae):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid request to Gemini API"
                )
            elif "RESOURCE_EXHAUSTED" in str(gae):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Gemini API quota exceeded"
                )
            elif "UNAUTHENTICATED" in str(gae):
                logger.critical(f"[{request_id}] Gemini API authentication failed")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="API authentication error"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Gemini API is temporarily unavailable"
                )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during request processing"
        )


# ============================================================================
# EXCEPTION HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Standardize HTTP exception responses."""
    request_id = getattr(request.state, "request_id", "unknown")
    
    error_code_map = {
        400: "INVALID_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        429: "RATE_LIMITED",
        500: "INTERNAL_ERROR",
        502: "BAD_GATEWAY",
        503: "SERVICE_UNAVAILABLE",
        504: "GATEWAY_TIMEOUT",
    }
    
    error_code = error_code_map.get(exc.status_code, "UNKNOWN_ERROR")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": error_code,
            "detail": exc.detail,
            "request_id": request_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions."""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error(f"[{request_id}] Unhandled exception: {type(exc).__name__}: {exc}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "INTERNAL_ERROR",
            "detail": "An unexpected error occurred. Please contact support.",
            "request_id": request_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


# ============================================================================
# STARTUP EVENT
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize app on startup."""
    logger.info(f"✅ Map-Genie API v1.1.0 started")
    logger.info(f"   CORS Origins: {ALLOWED_ORIGINS}")
    logger.info(f"   Request Timeout: {REQUEST_TIMEOUT_SECONDS}s")
    logger.info(f"   Max History: {MAX_HISTORY_MESSAGES} messages")
    logger.info(f"   Rate Limit: {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW}s")
    logger.info(f"   Docs available at http://localhost:8000/api/docs")


# ============================================================================
# CLI RUNNER
# ============================================================================

if __name__ == "__main__":
    logger.info("Starting Map-Genie FastAPI server...")
    
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        log_level=os.getenv("LOG_LEVEL", "info").lower(),
        access_log=True,
        reload=os.getenv("NODE_ENV", "development") == "development"
    )

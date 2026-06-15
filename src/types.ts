/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Place {
  id: string;
  name: string;
  description: string;
  whyMatch: string;
  emoji: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  geocodingStatus: "idle" | "loading" | "success" | "error";
  category: string;
}

export interface MapLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  places?: Place[];
  location?: MapLocation | null;
}

/**
 * Request payload structure expected by the server's /api/chat endpoint.
 */
export interface ChatRequest {
  message: string;
  history: Message[];
  currentLocation?: MapLocation | null;
}

/**
 * Structured output schema for the Gemini Flash model.
 */
export interface GeminiSuggestion {
  name: string;
  description: string;
  whyMatch: string;
  emoji: string;
  address: string;
  category: string;
}

export interface GeminiChatResponse {
  resolvedLocation: {
    name: string;
    latitude: number;
    longitude: number;
  };
  aiResponseText: string;
  spots: GeminiSuggestion[];
}

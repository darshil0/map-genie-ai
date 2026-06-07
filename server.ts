/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Lazy loader for GoogleGenAI to prevent crashing at startup if the API key is not present
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it to your environment secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Define JSON Schema for Gemini travel companion suggestion formatting
const ResponseSchema = {
  type: Type.OBJECT,
  properties: {
    resolvedLocation: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Detailed visual location name, city, and optional region (e.g. Kyoto, Japan)" },
        latitude: { type: Type.NUMBER, description: "Approximate latitude centroid of this city (neutral backup value)" },
        longitude: { type: Type.NUMBER, description: "Approximate longitude centroid of this city" }
      },
      required: ["name", "latitude", "longitude"]
    },
    aiResponseText: {
      type: Type.STRING,
      description: "Local expert narrative explaining choices, answering user context, adding friendly insider recommendations."
    },
    spots: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Official place name" },
          description: { type: Type.STRING, description: "Fascinating local tidbit, opening hours recommendation, or context" },
          whyMatch: { type: Type.STRING, description: "Explains precisely why it connects to the requested vibe or theme" },
          emoji: { type: Type.STRING, description: "Single descriptive emoji representing this specific place category (e.g. 🏮, ☕, 🏰, 🌳, 🍣)" },
          address: { type: Type.STRING, description: "Highly specific geocodable location query including name, street address or cross street, city, country" },
          category: { type: Type.STRING, description: "Place category such as cafe, restaurant, museum, temple, park, scenic-overlook, historic" }
        },
        required: ["name", "description", "whyMatch", "emoji", "address", "category"]
      }
    }
  },
  required: ["resolvedLocation", "aiResponseText", "spots"]
};

// API: Health probe
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API: Core geocoding request to chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, currentLocation } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Missing required parameter 'message'." });
      return;
    }

    const ai = getGeminiClient();

    // Format chat history for prompt framing
    const formattedHistory = (history || [])
      .map((h: any) => `${h.sender === "user" ? "User" : "Assistant"}: ${h.text}`)
      .join("\n");

    const promptText = `
User Location Hint: ${currentLocation ? JSON.stringify(currentLocation) : "Not provided."}

Previous Conversation History:
${formattedHistory ? formattedHistory : "No previous conversation."}

New User Prompt: "${message}"

As Map Genie, parse this input. If it is a follow-up refinement query (like adding 'places to sit' after a search for cozy cafes, or 'parks nearby'), keep the location region centered on the same city and return additional matching places.
Analyze this request, identify 4 to 6 incredibly matching real-world spots, and return a clean JSON structured response. Make sure the addresses are precise so that Nominatim OpenStreetMap search geocodes them perfectly.
`;

    const modelResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: `You are Map Genie, an AI Travel Sidekick. You specialize in receiving chat inputs (e.g., 'cozy coffee shops in Amsterdam', 'hidden temples near Kyoto') and extracting outstanding, highly localized places and cafes.
Maintain the local geographic context if the user follows up on previous suggestions (e.g., asking for parks nearby after restaurants). Do not switch locations unless the user specifically asks to search in a different city or region.
Always output standard JSON compliance according to the required schema. Ensure the address properties are descriptive query terms designed for geocoders (e.g. 'Ramen Sen No Kaze, Nakagyo Ward, Kyoto, Japan').`,
        responseMimeType: "application/json",
        responseSchema: ResponseSchema,
        temperature: 0.7,
      }
    });

    const textOutput = modelResponse.text;
    if (!textOutput) {
      throw new Error("No textual output was returned from Gemini Flash.");
    }

    const dataObj = JSON.parse(textOutput.trim());
    res.json(dataObj);
  } catch (err: any) {
    console.error("Error in Map Genie /api/chat:", err);
    res.status(500).json({
      error: err.message || "An error occurred while generating suggestions.",
      details: err.toString()
    });
  }
});

// Start integration with Vite/Production static files
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    console.log("Starting server in development mode with Vite HMR middleware.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode. Serving static files.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Map Genie is listening on http://localhost:${PORT}`);
  });
}

startServer();

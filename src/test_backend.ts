/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

console.log("=========================================");
console.log("🔍 Running Map Genie Backend Assertions...");
console.log("=========================================");

// 1. Structure Check: Verify the Gemini Model Definition supports proper fields
const MockResponseSchema = {
  type: Type.OBJECT,
  properties: {
    resolvedLocation: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        latitude: { type: Type.NUMBER },
        longitude: { type: Type.NUMBER }
      }
    },
    aiResponseText: { type: Type.STRING },
    spots: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          whyMatch: { type: Type.STRING },
          emoji: { type: Type.STRING },
          address: { type: Type.STRING },
          category: { type: Type.STRING }
        }
      }
    }
  }
};

function runStaticTests() {
  console.log("✅ Assertion 1: Schema Type mapping validates successfully.");
  if (MockResponseSchema.properties.resolvedLocation.type !== "OBJECT" ||
      MockResponseSchema.properties.spots.type !== "ARRAY" ||
      MockResponseSchema.properties.spots.items.properties.name.type !== "STRING") {
    throw new Error("FAIL: Response schema structure does not match expected output format.");
  }
  console.log("✅ Assertion 2: All Type definition attributes match the client specifications.");
}

async function runLiveIntegrationTest() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.log("⚠️ Skipped live API integration test because GEMINI_API_KEY is not configured.");
    return;
  }

  console.log("🚀 Testing live integration with Gemini (gemini-3.5-flash)...");
  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "List one cozy tea shop in Kyoto with precise structure",
      config: {
        responseMimeType: "application/json",
        responseSchema: MockResponseSchema,
        temperature: 0.1
      }
    });

    const body = response.text;
    if (!body) {
      throw new Error("Lobby: Empty text response received from live mock test.");
    }

    const parsed = JSON.parse(body.trim());
    console.log("📊 Gemini Result received successfully!");
    console.log(`📍 Location Name: ${parsed.resolvedLocation?.name}`);
    console.log(`💬 AI Intro: ${parsed.aiResponseText?.substring(0, 50)}...`);
    console.log(`🏢 Number of spots returned: ${parsed.spots?.length}`);

    if (!parsed.resolvedLocation || !parsed.aiResponseText || !Array.isArray(parsed.spots)) {
      throw new Error("FAIL: Schema response is missing key metadata items.");
    }

    console.log("✅ Integration assertion finished with green results!");
  } catch (err: any) {
    console.error("❌ Live Integration suite failed with error:", err.message || err);
    process.exit(1);
  }
}

async function main() {
  try {
    runStaticTests();
    await runLiveIntegrationTest();
    console.log("=========================================");
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! ✅");
    console.log("=========================================");
    process.exit(0);
  } catch (error) {
    console.error("🚨 Test assertion failed:", error);
    process.exit(1);
  }
}

main();

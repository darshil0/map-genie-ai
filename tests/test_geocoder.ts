/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { geocodeAddress } from "../src/utils/geocoder";

console.log("=========================================");
console.log("🔍 Running Geocoder Utility Tests...");
console.log("=========================================");

// Mock global fetch
const originalFetch = global.fetch;

async function testEmptyInput() {
  console.log("🧪 Test: Empty Input");
  const result = await geocodeAddress("");
  if (result === null) {
    console.log("✅ Passed: Empty input returned null.");
  } else {
    throw new Error("FAIL: Empty input should return null.");
  }
}

async function testFetchFailure() {
  console.log("🧪 Test: Fetch Failure (Network Error)");
  global.fetch = async () => {
    throw new Error("Network error");
  };

  const result = await geocodeAddress("Amsterdam");
  if (result === null) {
    console.log("✅ Passed: Fetch failure handled gracefully (returned null).");
  } else {
    throw new Error("FAIL: Fetch failure should return null.");
  }
}

async function testMalformedJson() {
  console.log("🧪 Test: Malformed JSON Response");
  global.fetch = (async () => ({
    ok: true,
    json: async () => ({ invalid: "json" }),
  })) as any;

  const result = await geocodeAddress("Amsterdam");
  if (result === null) {
    console.log("✅ Passed: Malformed JSON handled gracefully.");
  } else {
    throw new Error("FAIL: Malformed JSON should return null.");
  }
}

async function testApiErrorStatus() {
  console.log("🧪 Test: API Error Status (404)");
  global.fetch = (async () => ({
    ok: false,
    status: 404,
  })) as any;

  const result = await geocodeAddress("Amsterdam");
  if (result === null) {
    console.log("✅ Passed: 404 error handled gracefully.");
  } else {
    throw new Error("FAIL: 404 error should return null.");
  }
}

async function testSuccessfulGeocoding() {
  console.log("🧪 Test: Successful Geocoding");
  global.fetch = (async () => ({
    ok: true,
    json: async () => [
      {
        lat: "52.3676",
        lon: "4.9041",
      },
    ],
  })) as any;

  const result = await geocodeAddress("Amsterdam");
  if (result && result.lat === 52.3676 && result.lng === 4.9041) {
    console.log("✅ Passed: Correctly parsed latitude and longitude.");
  } else {
    throw new Error(`FAIL: Unexpected result: ${JSON.stringify(result)}`);
  }
}

async function runTests() {
  try {
    await testEmptyInput();
    await testFetchFailure();
    await testMalformedJson();
    await testApiErrorStatus();
    await testSuccessfulGeocoding();

    console.log("=========================================");
    console.log("🎉 ALL GEOCODER TESTS PASSED! ✅");
    console.log("=========================================");
  } catch (error) {
    console.error("🚨 Geocoder Test failed:", error);
    process.exit(1);
  } finally {
    global.fetch = originalFetch;
  }
}

runTests();

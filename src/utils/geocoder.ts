/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Interface representing resolved geocoded coordinates.
 */
export interface GeocodeResult {
  lat: number;
  lng: number;
}

/**
 * Geocodes a text address or venue query using OSM's free Nominatim API.
 * Adheres to open-use guidelines by supplying a distinct User-Agent.
 * Fallbacks are handled gracefully by callers if null is returned.
 */
export async function geocodeAddress(
  address: string,
): Promise<GeocodeResult | null> {
  const normalizedAddress = typeof address === "string" ? address.trim() : "";
  if (!normalizedAddress) {
    return null;
  }

  // Respect Nominatim's guidelines by waiting slightly to distribute queries if triggered consecutively.
  await new Promise((resolve) => setTimeout(resolve, 600));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const queryUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(normalizedAddress)}&limit=1`;

    const response = await fetch(queryUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "MapGenieTravelApp/1.0 (darshils99@gmail.com)",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(
        `OSM Nominatim geocoding request rejected with status: ${response.status}`,
      );
      return null;
    }

    const json = await response.json();
    if (!Array.isArray(json) || json.length === 0) {
      return null;
    }

    const firstResult = json[0];
    const lat = Number(firstResult?.lat);
    const lng = Number(firstResult?.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return { lat, lng };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      console.warn("Geocoding request timed out for address:", normalizedAddress);
    } else {
      console.error("Failed executing geocoding query against OSM:", err);
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

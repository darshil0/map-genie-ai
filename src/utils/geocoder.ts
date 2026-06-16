/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Interface representing resolved geocoded coordinates.
 */
interface GeocodeResult {
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
  // Respect Nominatim's guidelines by waiting slightly to distribute queries if triggered consecutively
  await new Promise((resolve) => setTimeout(resolve, 600));

  try {
    const queryUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;

    const response = await fetch(queryUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "MapGenieTravelApp/1.0 (darshils99@gmail.com)",
      },
    });

    if (!response.ok) {
      console.warn(
        `OSM Nominatim geocoding request rejected with status: ${response.status}`,
      );
      return null;
    }

    const json = await response.json();
    if (Array.isArray(json) && json.length > 0) {
      const firstResult = json[0];
      return {
        lat: parseFloat(firstResult.lat),
        lng: parseFloat(firstResult.lon),
      };
    }
  } catch (err) {
    console.error("Failed executing geocoding query against OSM:", err);
  }

  return null;
}

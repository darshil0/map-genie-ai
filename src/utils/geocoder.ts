/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Geocodes an address using OpenStreetMap's Nominatim API.
 * @param address The address string to geocode.
 * @returns An object with lat and lng or null if not found.
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address) return null;

  try {
    // Nominatim usage policy requires a descriptive User-Agent
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'MapGenie/1.0 (Travel Planner Application)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }

  return null;
}

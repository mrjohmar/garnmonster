import { SMHILocation } from '@/types';

// OpenStreetMap Nominatim API for geocoding
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

export async function searchLocation(query: string): Promise<SMHILocation[]> {
  if (query.length < 2) return [];

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      countrycodes: 'se',
      limit: '10',
      addressdetails: '1',
    });

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'Accept-Language': 'sv',
        'User-Agent': 'Garnmonster/1.0 (temperature-blanket-app)',
      },
    });

    if (!response.ok) {
      console.error('Geocoding failed:', response.status);
      return [];
    }

    const results: NominatimResult[] = await response.json();

    return results
      .filter(r =>
        r.type === 'city' ||
        r.type === 'town' ||
        r.type === 'village' ||
        r.type === 'municipality' ||
        r.type === 'administrative'
      )
      .map(r => ({
        name: extractLocationName(r.display_name),
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
      }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

function extractLocationName(displayName: string): string {
  // Display name is like "Visby, Gotlands kommun, Gotlands län, Sverige"
  // We want just the first part
  const parts = displayName.split(',');
  return parts[0].trim();
}

// Debounce helper for search
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

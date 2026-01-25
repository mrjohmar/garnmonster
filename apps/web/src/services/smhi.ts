import { TemperatureData, SMHILocation, TemperatureMode } from '@/types';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

// SMHI Open Data API for historical observations
const SMHI_BASE_URL = 'https://opendata-download-metobs.smhi.se/api';

// Parameter 1 = Lufttemperatur momentanvärde, 1 gång/tim
const TEMPERATURE_PARAMETER = 1;

// Swedish weather stations with coordinates
export const SWEDISH_LOCATIONS: SMHILocation[] = [
  { name: 'Stockholm', latitude: 59.3293, longitude: 18.0686 },
  { name: 'Göteborg', latitude: 57.7089, longitude: 11.9746 },
  { name: 'Malmö', latitude: 55.6050, longitude: 13.0038 },
  { name: 'Borås', latitude: 57.7210, longitude: 12.9401 },
  { name: 'Gävle', latitude: 60.6749, longitude: 17.1413 },
  { name: 'Halmstad', latitude: 56.6745, longitude: 12.8578 },
  { name: 'Helsingborg', latitude: 56.0465, longitude: 12.6945 },
  { name: 'Jönköping', latitude: 57.7826, longitude: 14.1618 },
  { name: 'Kalmar', latitude: 56.6634, longitude: 16.3566 },
  { name: 'Karlstad', latitude: 59.3793, longitude: 13.5036 },
  { name: 'Kiruna', latitude: 67.8558, longitude: 20.2253 },
  { name: 'Linköping', latitude: 58.4108, longitude: 15.6214 },
  { name: 'Luleå', latitude: 65.5848, longitude: 22.1547 },
  { name: 'Lund', latitude: 55.7047, longitude: 13.1910 },
  { name: 'Norrköping', latitude: 58.5877, longitude: 16.1924 },
  { name: 'Sundsvall', latitude: 62.3908, longitude: 17.3069 },
  { name: 'Uddevalla', latitude: 58.3489, longitude: 11.9383 },
  { name: 'Umeå', latitude: 63.8258, longitude: 20.2630 },
  { name: 'Uppsala', latitude: 59.8586, longitude: 17.6389 },
  { name: 'Visby', latitude: 57.6348, longitude: 18.2948 },
  { name: 'Västerås', latitude: 59.6099, longitude: 16.5448 },
  { name: 'Växjö', latitude: 56.8777, longitude: 14.8091 },
  { name: 'Örebro', latitude: 59.2753, longitude: 15.2134 },
  { name: 'Östersund', latitude: 63.1792, longitude: 14.6357 },
].sort((a, b) => a.name.localeCompare(b.name, 'sv'));

interface SMHIStation {
  key: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface SMHIValue {
  date: number;
  value: number;
}

let stationsCache: SMHIStation[] | null = null;

async function fetchStations(): Promise<SMHIStation[]> {
  if (stationsCache) return stationsCache;

  try {
    const response = await fetch(
      `${SMHI_BASE_URL}/version/1.0/parameter/${TEMPERATURE_PARAMETER}.json`
    );

    if (!response.ok) return [];

    const data = await response.json();
    const stations: SMHIStation[] = (data.station || []).map((s: SMHIStation) => ({
      key: s.key,
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude,
    }));
    stationsCache = stations;

    return stations;
  } catch (error) {
    console.error('Error fetching stations:', error);
    return [];
  }
}

async function findNearestStation(lat: number, lon: number): Promise<SMHIStation | null> {
  const stations = await fetchStations();

  let nearestStation: SMHIStation | null = null;
  let minDistance = Infinity;

  for (const station of stations) {
    const distance = Math.sqrt(
      Math.pow(station.latitude - lat, 2) +
      Math.pow(station.longitude - lon, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestStation = station;
    }
  }

  return nearestStation;
}

// Main function to fetch temperature data
export async function fetchTemperatureData(
  location: SMHILocation,
  startDate: string,
  endDate: string,
  mode: TemperatureMode,
  hour: number = 12
): Promise<TemperatureData[]> {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = eachDayOfInterval({ start, end });

  try {
    const station = await findNearestStation(location.latitude, location.longitude);

    if (!station) {
      console.log('No station found, using simulated data');
      return generateSimulatedData(days, mode, hour, location.latitude);
    }

    console.log(`Using station: ${station.name} (${station.key})`);

    // Try corrected-archive first, then latest-months
    let data: { value?: SMHIValue[] } | null = null;

    const archiveResponse = await fetch(
      `${SMHI_BASE_URL}/version/1.0/parameter/${TEMPERATURE_PARAMETER}/station/${station.key}/period/corrected-archive/data.json`
    );

    if (archiveResponse.ok) {
      data = await archiveResponse.json();
    } else {
      const latestResponse = await fetch(
        `${SMHI_BASE_URL}/version/1.0/parameter/${TEMPERATURE_PARAMETER}/station/${station.key}/period/latest-months/data.json`
      );
      if (latestResponse.ok) {
        data = await latestResponse.json();
      }
    }

    if (!data || !data.value || data.value.length === 0) {
      console.log('No SMHI data available, using simulated data');
      return generateSimulatedData(days, mode, hour, location.latitude);
    }

    return parseSmhiData(data.value, days, mode, hour, location.latitude);
  } catch (error) {
    console.error('Error fetching temperature data:', error);
    return generateSimulatedData(days, mode, hour, location.latitude);
  }
}

// Parse SMHI data and calculate temperatures based on mode
function parseSmhiData(
  values: SMHIValue[],
  days: Date[],
  mode: TemperatureMode,
  hour: number,
  latitude: number
): TemperatureData[] {
  console.log(`Parsing ${values.length} SMHI values for mode: ${mode}`);

  // Group values by date
  const dailyTemps = new Map<string, number[]>();

  for (const item of values) {
    const date = new Date(item.date);
    const dateStr = format(date, 'yyyy-MM-dd');

    if (!dailyTemps.has(dateStr)) {
      dailyTemps.set(dateStr, []);
    }
    dailyTemps.get(dateStr)!.push(item.value);
  }

  // For hour mode, also create hour-specific map
  const hourlyTemps = new Map<string, number>();
  if (mode === 'hour') {
    for (const item of values) {
      const date = new Date(item.date);
      const dateStr = format(date, 'yyyy-MM-dd');
      const itemHour = date.getHours();
      hourlyTemps.set(`${dateStr}-${itemHour}`, item.value);
    }
  }

  const temperatures: TemperatureData[] = [];
  let realDataCount = 0;

  for (const day of days) {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayTemps = dailyTemps.get(dateStr);

    let temp: number | undefined;

    if (dayTemps && dayTemps.length > 0) {
      switch (mode) {
        case 'average':
          temp = dayTemps.reduce((a, b) => a + b, 0) / dayTemps.length;
          break;
        case 'max':
          temp = Math.max(...dayTemps);
          break;
        case 'min':
          temp = Math.min(...dayTemps);
          break;
        case 'hour':
          // Try exact hour, then nearby hours
          temp = hourlyTemps.get(`${dateStr}-${hour}`);
          if (temp === undefined) {
            for (let offset = 1; offset <= 3; offset++) {
              temp = hourlyTemps.get(`${dateStr}-${hour - offset}`) ||
                     hourlyTemps.get(`${dateStr}-${hour + offset}`);
              if (temp !== undefined) break;
            }
          }
          // If still no hourly data, use day average
          if (temp === undefined) {
            temp = dayTemps.reduce((a, b) => a + b, 0) / dayTemps.length;
          }
          break;
      }
      realDataCount++;
    }

    // Generate simulated if no real data
    if (temp === undefined) {
      temp = generateTemperatureForDate(day, latitude, mode);
    }

    temperatures.push({
      date: dateStr,
      temperature: Math.round(temp * 10) / 10,
      hour: mode === 'hour' ? hour : undefined,
      mode,
    });
  }

  console.log(`Real data for ${realDataCount}/${days.length} days`);
  return temperatures;
}

// Generate simulated data
function generateSimulatedData(
  days: Date[],
  mode: TemperatureMode,
  hour: number,
  latitude: number
): TemperatureData[] {
  console.log('Generating simulated temperature data');

  return days.map(day => ({
    date: format(day, 'yyyy-MM-dd'),
    temperature: generateTemperatureForDate(day, latitude, mode),
    hour: mode === 'hour' ? hour : undefined,
    mode,
  }));
}

// Generate realistic temperature based on date, latitude, and mode
function generateTemperatureForDate(date: Date, latitude: number, mode: TemperatureMode): number {
  const dayOfYear = getDayOfYear(date);

  // Seasonal curve
  const seasonalPhase = (dayOfYear - 20) * 2 * Math.PI / 365;
  const seasonalBase = -Math.cos(seasonalPhase);

  // Latitude adjustment
  const latitudeAdjustment = (latitude - 59) * -0.7;

  const summerMax = 20 + latitudeAdjustment;
  const winterMin = -5 + latitudeAdjustment;

  const midpoint = (summerMax + winterMin) / 2;
  const amplitude = (summerMax - winterMin) / 2;

  let baseTemp = midpoint + amplitude * seasonalBase;

  // Add daily variation
  const dateHash = date.getFullYear() * 1000 + dayOfYear;
  const pseudoRandom = Math.sin(dateHash * 12.9898) * 43758.5453;
  const randomFactor = pseudoRandom - Math.floor(pseudoRandom) - 0.5;

  // Adjust based on mode
  switch (mode) {
    case 'max':
      baseTemp += 5 + randomFactor * 4; // Higher temps
      break;
    case 'min':
      baseTemp -= 5 + randomFactor * 4; // Lower temps
      break;
    case 'average':
      baseTemp += randomFactor * 4; // Medium variation
      break;
    case 'hour':
      baseTemp += randomFactor * 6; // Normal variation
      break;
  }

  return Math.round(baseTemp * 10) / 10;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatTemperature(temp: number): string {
  return `${temp > 0 ? '+' : ''}${temp.toFixed(1)}°C`;
}

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
  from: number;
  to: number;
  active: boolean;
}

interface ParsedTemperature {
  date: string; // yyyy-MM-dd
  hour: number;
  temperature: number;
}

// Result type that includes metadata about the data source
export interface TemperatureResult {
  data: TemperatureData[];
  stationName: string;
  stationKey: string;
  isSimulated: boolean;
  realDataDays: number;
  totalDays: number;
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
    const stations: SMHIStation[] = (data.station || []).map((s: {
      key: string;
      name: string;
      latitude: number;
      longitude: number;
      from: number;
      to: number;
      active: boolean;
    }) => ({
      key: s.key,
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude,
      from: s.from,
      to: s.to,
      active: s.active,
    }));
    stationsCache = stations;

    return stations;
  } catch (error) {
    console.error('Error fetching stations:', error);
    return [];
  }
}

async function findNearestStation(
  lat: number,
  lon: number,
  startDate: Date,
  endDate: Date
): Promise<SMHIStation | null> {
  const stations = await fetchStations();

  // Filter stations that have data covering the requested period
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  const eligibleStations = stations.filter(s => {
    return s.from <= startTime && s.to >= endTime;
  });

  console.log(`Found ${eligibleStations.length} stations with data for the requested period`);

  if (eligibleStations.length === 0) {
    // Fall back to any station with data overlapping the period
    const partialStations = stations.filter(s => {
      return s.to >= startTime && s.from <= endTime;
    });
    console.log(`Found ${partialStations.length} stations with partial data`);

    if (partialStations.length === 0) return null;

    // Find nearest among partial stations
    let nearestStation: SMHIStation | null = null;
    let minDistance = Infinity;

    for (const station of partialStations) {
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

  // Find nearest station among eligible ones
  let nearestStation: SMHIStation | null = null;
  let minDistance = Infinity;

  for (const station of eligibleStations) {
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

// Parse CSV data from SMHI
function parseCSVData(csvText: string): ParsedTemperature[] {
  const lines = csvText.split('\n');
  const temperatures: ParsedTemperature[] = [];

  // Find the data start line (after "Datum;Tid (UTC);...")
  let dataStartIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('Datum;Tid')) {
      dataStartIndex = i + 1;
      break;
    }
  }

  // Parse data lines
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Format: Datum;Tid (UTC);Lufttemperatur;Kvalitet;;...
    const parts = line.split(';');
    if (parts.length < 3) continue;

    const dateStr = parts[0]; // yyyy-MM-dd
    const timeStr = parts[1]; // HH:mm:ss
    const tempStr = parts[2];

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue;

    const temperature = parseFloat(tempStr);
    if (isNaN(temperature)) continue;

    // Extract hour from time
    const hourMatch = timeStr.match(/^(\d{2}):/);
    const hour = hourMatch ? parseInt(hourMatch[1], 10) : 0;

    temperatures.push({
      date: dateStr,
      hour,
      temperature,
    });
  }

  return temperatures;
}

// Main function to fetch temperature data
export async function fetchTemperatureData(
  location: SMHILocation,
  startDate: string,
  endDate: string,
  mode: TemperatureMode,
  hour: number = 12
): Promise<TemperatureResult> {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = eachDayOfInterval({ start, end });

  try {
    const station = await findNearestStation(
      location.latitude,
      location.longitude,
      start,
      end
    );

    if (!station) {
      console.log('No station found, using simulated data');
      return {
        data: generateSimulatedData(days, mode, hour, location.latitude),
        stationName: 'Simulerad data',
        stationKey: '',
        isSimulated: true,
        realDataDays: 0,
        totalDays: days.length,
      };
    }

    console.log(`Using station: ${station.name} (${station.key})`);

    // Fetch CSV data from corrected-archive (historical data)
    const csvUrl = `${SMHI_BASE_URL}/version/1.0/parameter/${TEMPERATURE_PARAMETER}/station/${station.key}/period/corrected-archive/data.csv`;

    const response = await fetch(csvUrl);

    if (!response.ok) {
      console.log(`Failed to fetch CSV data: ${response.status}, using simulated data`);
      return {
        data: generateSimulatedData(days, mode, hour, location.latitude),
        stationName: station.name,
        stationKey: station.key,
        isSimulated: true,
        realDataDays: 0,
        totalDays: days.length,
      };
    }

    const csvText = await response.text();
    const parsedData = parseCSVData(csvText);

    console.log(`Parsed ${parsedData.length} temperature readings from CSV`);

    if (parsedData.length === 0) {
      console.log('No data in CSV, using simulated data');
      return {
        data: generateSimulatedData(days, mode, hour, location.latitude),
        stationName: station.name,
        stationKey: station.key,
        isSimulated: true,
        realDataDays: 0,
        totalDays: days.length,
      };
    }

    const result = processTemperatureData(parsedData, days, mode, hour, location.latitude);

    return {
      data: result.temperatures,
      stationName: station.name,
      stationKey: station.key,
      isSimulated: false,
      realDataDays: result.realDataCount,
      totalDays: days.length,
    };
  } catch (error) {
    console.error('Error fetching temperature data:', error);
    return {
      data: generateSimulatedData(days, mode, hour, location.latitude),
      stationName: 'Simulerad data (fel)',
      stationKey: '',
      isSimulated: true,
      realDataDays: 0,
      totalDays: days.length,
    };
  }
}

// Process parsed data and calculate temperatures based on mode
function processTemperatureData(
  values: ParsedTemperature[],
  days: Date[],
  mode: TemperatureMode,
  hour: number,
  latitude: number
): { temperatures: TemperatureData[]; realDataCount: number } {
  console.log(`Processing ${values.length} temperature readings for mode: ${mode}`);

  // Group values by date
  const dailyTemps = new Map<string, number[]>();
  const hourlyTemps = new Map<string, number>();

  for (const item of values) {
    if (!dailyTemps.has(item.date)) {
      dailyTemps.set(item.date, []);
    }
    dailyTemps.get(item.date)!.push(item.temperature);

    // Store hourly values
    hourlyTemps.set(`${item.date}-${item.hour}`, item.temperature);
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
              temp = hourlyTemps.get(`${dateStr}-${hour - offset}`) ??
                     hourlyTemps.get(`${dateStr}-${hour + offset}`);
              if (temp !== undefined) break;
            }
          }
          // If still no hourly data, use day average
          if (temp === undefined && dayTemps.length > 0) {
            temp = dayTemps.reduce((a, b) => a + b, 0) / dayTemps.length;
          }
          break;
      }
      realDataCount++;
    }

    // Generate simulated if no real data for this day
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
  return { temperatures, realDataCount };
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
      baseTemp += 5 + randomFactor * 4;
      break;
    case 'min':
      baseTemp -= 5 + randomFactor * 4;
      break;
    case 'average':
      baseTemp += randomFactor * 4;
      break;
    case 'hour':
      baseTemp += randomFactor * 6;
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

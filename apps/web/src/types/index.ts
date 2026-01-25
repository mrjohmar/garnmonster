// Temperature mode options
export type TemperatureMode = 'hour' | 'average' | 'max' | 'min';

export const TEMPERATURE_MODES: { value: TemperatureMode; label: string; description: string }[] = [
  { value: 'hour', label: 'Vid klockslag', description: 'Temperatur vid ett specifikt klockslag varje dag' },
  { value: 'average', label: 'Dygnsmedel', description: 'Medeltemperatur för hela dygnet' },
  { value: 'max', label: 'Högsta', description: 'Dagens högsta temperatur' },
  { value: 'min', label: 'Lägsta', description: 'Dagens lägsta temperatur' },
];

// Temperature data types
export interface TemperatureData {
  date: string;
  temperature: number;
  hour?: number; // Only used for 'hour' mode
  mode: TemperatureMode;
}

export interface TemperatureRange {
  min: number;
  max: number;
  color: string;
  colorName: string;
}

// Yarn and color types
export interface YarnColor {
  id: string;
  name: string;
  hex: string;
  brand?: string;
  productName?: string;
  articleNumber?: string;
}

export interface YarnBrand {
  id: string;
  name: string;
  colors: YarnColor[];
}

// Pattern types
export interface PatternRow {
  date: string;
  temperature: number;
  color: string;
  colorName: string;
}

export interface PatternSettings {
  startDate: string;
  endDate: string;
  hour: number;
  location: SMHILocation;
  colorRanges: TemperatureRange[];
  stitchesPerRow: number;
  rowHeight: number; // in mm
  yarnWeight: string; // fingering, sport, dk, worsted, etc.
}

export interface PatternResult {
  rows: PatternRow[];
  totalRows: number;
  totalLength: number; // in cm
  yarnNeeded: YarnUsage[];
  temperatureStats: TemperatureStats;
}

export interface YarnUsage {
  color: string;
  colorName: string;
  rows: number;
  metersNeeded: number;
  gramsNeeded: number;
}

export interface TemperatureStats {
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  mostCommonRange: string;
}

// SMHI API types
export interface SMHILocation {
  name: string;
  latitude: number;
  longitude: number;
}

export interface SMHIParameter {
  name: string;
  levelType: string;
  level: number;
  values: number[];
}

export interface SMHITimeSeries {
  validTime: string;
  parameters: SMHIParameter[];
}

export interface SMHIResponse {
  approvedTime: string;
  referenceTime: string;
  geometry: {
    type: string;
    coordinates: number[][];
  };
  timeSeries: SMHITimeSeries[];
}

// Preset color palettes
export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

// App state
export interface AppState {
  currentStep: 'location' | 'dates' | 'colors' | 'preview' | 'export';
  settings: Partial<PatternSettings>;
  result: PatternResult | null;
  isLoading: boolean;
  error: string | null;
}

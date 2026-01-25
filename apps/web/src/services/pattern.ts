import {
  TemperatureData,
  TemperatureRange,
  PatternRow,
  PatternResult,
  PatternSettings,
  YarnUsage,
  ColorPalette
} from '@/types';

// Preset color palettes for temperature blankets
export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'classic-warm',
    name: 'Klassisk Värme',
    description: 'Från isblått till eldigt rött',
    colors: ['#1e3a5f', '#2d5a87', '#4a90a4', '#7eb8c9', '#a8d4dd', '#f5e6a3', '#f4c542', '#e88c30', '#d64545', '#8b1538']
  },
  {
    id: 'nordic',
    name: 'Nordisk',
    description: 'Dämpade naturliga toner',
    colors: ['#2c3e50', '#34495e', '#5d6d7e', '#85929e', '#aeb6bf', '#d5dbdb', '#f7dc6f', '#f5b041', '#dc7633', '#c0392b']
  },
  {
    id: 'sunset',
    name: 'Solnedgång',
    description: 'Varma solnedgångsfärger',
    colors: ['#4a148c', '#6a1b9a', '#8e24aa', '#ab47bc', '#e91e63', '#f44336', '#ff5722', '#ff9800', '#ffc107', '#ffeb3b']
  },
  {
    id: 'ocean',
    name: 'Havsbris',
    description: 'Lugna blå och gröna toner',
    colors: ['#0d47a1', '#1565c0', '#1976d2', '#2196f3', '#42a5f5', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#dce775']
  },
  {
    id: 'forest',
    name: 'Skogsglänta',
    description: 'Naturnära gröna nyanser',
    colors: ['#1b5e20', '#2e7d32', '#388e3c', '#43a047', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9', '#f1f8e9', '#fff9c4']
  },
  {
    id: 'berry',
    name: 'Bärplockning',
    description: 'Bärtoner från blåbär till hallon',
    colors: ['#311b92', '#4527a0', '#512da8', '#673ab7', '#7c4dff', '#e040fb', '#f50057', '#ff1744', '#ff5252', '#ff8a80']
  },
  {
    id: 'pastel',
    name: 'Pastell',
    description: 'Mjuka pastellfärger',
    colors: ['#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c9', '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2', '#ffccbc']
  },
  {
    id: 'monochrome',
    name: 'Svartvit',
    description: 'Elegant gråskala',
    colors: ['#212121', '#424242', '#616161', '#757575', '#9e9e9e', '#bdbdbd', '#e0e0e0', '#eeeeee', '#f5f5f5', '#fafafa']
  }
];

// Popular yarn brands with common colors
export const YARN_BRANDS = [
  {
    id: 'drops',
    name: 'Drops',
    colors: [
      { id: 'd1', name: 'Natur', hex: '#f5f5dc', productName: 'Baby Merino' },
      { id: 'd2', name: 'Ljusrosa', hex: '#ffb6c1', productName: 'Baby Merino' },
      { id: 'd3', name: 'Ljusblå', hex: '#add8e6', productName: 'Baby Merino' },
      { id: 'd4', name: 'Mintgrön', hex: '#98ff98', productName: 'Baby Merino' },
      { id: 'd5', name: 'Lavendel', hex: '#e6e6fa', productName: 'Baby Merino' },
      { id: 'd6', name: 'Gul', hex: '#ffff00', productName: 'Baby Merino' },
      { id: 'd7', name: 'Orange', hex: '#ffa500', productName: 'Baby Merino' },
      { id: 'd8', name: 'Röd', hex: '#ff0000', productName: 'Baby Merino' },
      { id: 'd9', name: 'Marinblå', hex: '#000080', productName: 'Baby Merino' },
      { id: 'd10', name: 'Mörkgrå', hex: '#696969', productName: 'Baby Merino' },
    ]
  },
  {
    id: 'sandnes',
    name: 'Sandnes Garn',
    colors: [
      { id: 's1', name: 'Hvit', hex: '#ffffff', productName: 'Sisu' },
      { id: 's2', name: 'Rosa', hex: '#ffc0cb', productName: 'Sisu' },
      { id: 's3', name: 'Lys blå', hex: '#87ceeb', productName: 'Sisu' },
      { id: 's4', name: 'Grønn', hex: '#90ee90', productName: 'Sisu' },
      { id: 's5', name: 'Gul', hex: '#ffd700', productName: 'Sisu' },
      { id: 's6', name: 'Oransje', hex: '#ff8c00', productName: 'Sisu' },
      { id: 's7', name: 'Rød', hex: '#dc143c', productName: 'Sisu' },
      { id: 's8', name: 'Blå', hex: '#4169e1', productName: 'Sisu' },
      { id: 's9', name: 'Lilla', hex: '#9370db', productName: 'Sisu' },
      { id: 's10', name: 'Brun', hex: '#8b4513', productName: 'Sisu' },
    ]
  },
  {
    id: 'favoritgarner',
    name: 'Favoritgarner',
    colors: [
      { id: 'f1', name: 'Vit', hex: '#fffef0', productName: 'Cotton 8/4' },
      { id: 'f2', name: 'Ljusrosa', hex: '#fab1c4', productName: 'Cotton 8/4' },
      { id: 'f3', name: 'Babyblå', hex: '#9fd5e1', productName: 'Cotton 8/4' },
      { id: 'f4', name: 'Pistagegrön', hex: '#c1d9a4', productName: 'Cotton 8/4' },
      { id: 'f5', name: 'Solrosgul', hex: '#f9d71c', productName: 'Cotton 8/4' },
      { id: 'f6', name: 'Korall', hex: '#ff7f50', productName: 'Cotton 8/4' },
      { id: 'f7', name: 'Hallonröd', hex: '#e30b5c', productName: 'Cotton 8/4' },
      { id: 'f8', name: 'Havsblå', hex: '#006994', productName: 'Cotton 8/4' },
      { id: 'f9', name: 'Syren', hex: '#c8a2c8', productName: 'Cotton 8/4' },
      { id: 'f10', name: 'Antracit', hex: '#2f4f4f', productName: 'Cotton 8/4' },
    ]
  }
];

// Generate temperature ranges from colors
export function generateTemperatureRanges(
  colors: string[],
  minTemp: number = -20,
  maxTemp: number = 35
): TemperatureRange[] {
  const rangeSize = (maxTemp - minTemp) / colors.length;

  return colors.map((color, index) => ({
    min: Math.round((minTemp + index * rangeSize) * 10) / 10,
    max: Math.round((minTemp + (index + 1) * rangeSize) * 10) / 10,
    color,
    colorName: getColorName(index, colors.length)
  }));
}

function getColorName(index: number, total: number): string {
  const names = [
    'Isig', 'Mycket kall', 'Kall', 'Kylig', 'Sval',
    'Mild', 'Behaglig', 'Varm', 'Het', 'Tropisk'
  ];

  if (total <= names.length) {
    const step = Math.floor(names.length / total);
    return names[Math.min(index * step, names.length - 1)];
  }

  return `Färg ${index + 1}`;
}

// Find color for a temperature
export function getColorForTemperature(
  temp: number,
  ranges: TemperatureRange[]
): { color: string; colorName: string } {
  for (const range of ranges) {
    if (temp >= range.min && temp < range.max) {
      return { color: range.color, colorName: range.colorName };
    }
  }

  // Handle edge cases
  if (temp < ranges[0].min) {
    return { color: ranges[0].color, colorName: ranges[0].colorName };
  }

  const lastRange = ranges[ranges.length - 1];
  return { color: lastRange.color, colorName: lastRange.colorName };
}

// Generate pattern from temperature data
export function generatePattern(
  temperatureData: TemperatureData[],
  settings: PatternSettings
): PatternResult {
  const rows: PatternRow[] = temperatureData.map(data => {
    const { color, colorName } = getColorForTemperature(data.temperature, settings.colorRanges);
    return {
      date: data.date,
      temperature: data.temperature,
      color,
      colorName
    };
  });

  // Calculate statistics
  const temps = rows.map(r => r.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

  // Count colors
  const colorCounts = new Map<string, number>();
  rows.forEach(row => {
    colorCounts.set(row.color, (colorCounts.get(row.color) || 0) + 1);
  });

  // Find most common
  let mostCommonColor = '';
  let maxCount = 0;
  colorCounts.forEach((count, color) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonColor = color;
    }
  });

  const mostCommonRange = rows.find(r => r.color === mostCommonColor)?.colorName || '';

  // Calculate yarn usage
  const yarnUsage: YarnUsage[] = [];
  const metersPerRow = calculateMetersPerRow(settings.stitchesPerRow, settings.yarnWeight);
  const gramsPerMeter = getGramsPerMeter(settings.yarnWeight);

  colorCounts.forEach((count, color) => {
    const row = rows.find(r => r.color === color);
    const meters = count * metersPerRow;
    yarnUsage.push({
      color,
      colorName: row?.colorName || '',
      rows: count,
      metersNeeded: Math.ceil(meters),
      gramsNeeded: Math.ceil(meters * gramsPerMeter)
    });
  });

  // Sort by most used
  yarnUsage.sort((a, b) => b.rows - a.rows);

  const totalLength = rows.length * settings.rowHeight / 10; // Convert mm to cm

  return {
    rows,
    totalRows: rows.length,
    totalLength,
    yarnNeeded: yarnUsage,
    temperatureStats: {
      minTemp,
      maxTemp,
      avgTemp: Math.round(avgTemp * 10) / 10,
      mostCommonRange
    }
  };
}

// Calculate meters of yarn per row based on stitches and yarn weight
function calculateMetersPerRow(stitches: number, yarnWeight: string): number {
  // Approximate meters per stitch for different yarn weights
  const metersPerStitch: Record<string, number> = {
    lace: 0.015,
    fingering: 0.02,
    sport: 0.025,
    dk: 0.03,
    worsted: 0.035,
    aran: 0.04,
    bulky: 0.05,
    super_bulky: 0.06
  };

  return stitches * (metersPerStitch[yarnWeight] || 0.03);
}

// Get grams per meter for different yarn weights
function getGramsPerMeter(yarnWeight: string): number {
  const gramsPerMeter: Record<string, number> = {
    lace: 0.2,
    fingering: 0.25,
    sport: 0.35,
    dk: 0.45,
    worsted: 0.55,
    aran: 0.7,
    bulky: 1.0,
    super_bulky: 1.5
  };

  return gramsPerMeter[yarnWeight] || 0.45;
}

// Generate pattern description text
export function generatePatternDescription(result: PatternResult, settings: PatternSettings): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════');
  lines.push('     TEMPERATURMÖNSTER - VIRKNING');
  lines.push('═══════════════════════════════════════');
  lines.push('');
  lines.push(`Plats: ${settings.location.name}`);
  lines.push(`Period: ${settings.startDate} till ${settings.endDate}`);
  lines.push(`Mätningstid: kl ${settings.hour}:00`);
  lines.push('');
  lines.push('───────────────────────────────────────');
  lines.push('MÅTT OCH MATERIAL');
  lines.push('───────────────────────────────────────');
  lines.push(`Antal rader: ${result.totalRows}`);
  lines.push(`Maskor per rad: ${settings.stitchesPerRow}`);
  lines.push(`Radhöjd: ${settings.rowHeight} mm`);
  lines.push(`Total längd: ca ${Math.round(result.totalLength)} cm`);
  lines.push(`Garnvikt: ${getYarnWeightName(settings.yarnWeight)}`);
  lines.push('');
  lines.push('───────────────────────────────────────');
  lines.push('TEMPERATURSTATISTIK');
  lines.push('───────────────────────────────────────');
  lines.push(`Lägsta temperatur: ${result.temperatureStats.minTemp}°C`);
  lines.push(`Högsta temperatur: ${result.temperatureStats.maxTemp}°C`);
  lines.push(`Medeltemperatur: ${result.temperatureStats.avgTemp}°C`);
  lines.push(`Vanligaste intervall: ${result.temperatureStats.mostCommonRange}`);
  lines.push('');
  lines.push('───────────────────────────────────────');
  lines.push('GARNÅTGÅNG PER FÄRG');
  lines.push('───────────────────────────────────────');

  result.yarnNeeded.forEach(yarn => {
    lines.push(`${yarn.colorName}: ${yarn.rows} rader = ${yarn.metersNeeded} m (${yarn.gramsNeeded} g)`);
  });

  const totalMeters = result.yarnNeeded.reduce((sum, y) => sum + y.metersNeeded, 0);
  const totalGrams = result.yarnNeeded.reduce((sum, y) => sum + y.gramsNeeded, 0);

  lines.push('');
  lines.push(`TOTALT: ${totalMeters} meter (${totalGrams} gram)`);
  lines.push('');
  lines.push('───────────────────────────────────────');
  lines.push('FÄRGSKALA');
  lines.push('───────────────────────────────────────');

  settings.colorRanges.forEach(range => {
    lines.push(`${range.min}°C till ${range.max}°C: ${range.colorName}`);
  });

  lines.push('');
  lines.push('═══════════════════════════════════════');

  return lines.join('\n');
}

function getYarnWeightName(weight: string): string {
  const names: Record<string, string> = {
    lace: 'Spetsgarn',
    fingering: 'Fingering / Sockgarn',
    sport: 'Sport',
    dk: 'DK / 8 ply',
    worsted: 'Worsted',
    aran: 'Aran',
    bulky: 'Tjockt garn',
    super_bulky: 'Supertjockt garn'
  };
  return names[weight] || weight;
}

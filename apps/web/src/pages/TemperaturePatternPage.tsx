import { useState, useEffect, useCallback } from 'react';
import { MapPin, Calendar, Palette, Eye, Download, Loader2, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { SMHILocation, TemperatureRange, PatternResult, PatternSettings } from '@/types';
import { SWEDISH_LOCATIONS, fetchTemperatureData } from '@/services/smhi';
import { COLOR_PALETTES, generateTemperatureRanges, generatePattern, generatePatternDescription } from '@/services/pattern';
import { searchLocation } from '@/services/geocoding';
import PatternPreview from '@/components/PatternPreview';
import ColorRangeEditor from '@/components/ColorRangeEditor';

type Step = 'location' | 'dates' | 'colors' | 'preview';

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'location', label: 'Plats', icon: <MapPin className="w-4 h-4" /> },
  { id: 'dates', label: 'Datum', icon: <Calendar className="w-4 h-4" /> },
  { id: 'colors', label: 'Färger', icon: <Palette className="w-4 h-4" /> },
  { id: 'preview', label: 'Förhandsvisa', icon: <Eye className="w-4 h-4" /> },
];

export default function TemperaturePatternPage() {
  const [currentStep, setCurrentStep] = useState<Step>('location');
  const [location, setLocation] = useState<SMHILocation | null>(null);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [hour, setHour] = useState(12);
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0]);
  const [colorRanges, setColorRanges] = useState<TemperatureRange[]>([]);
  const [stitchesPerRow, setStitchesPerRow] = useState(200);
  const [rowHeight, setRowHeight] = useState(5);
  const [yarnWeight, setYarnWeight] = useState('dk');
  const [isLoading, setIsLoading] = useState(false);
  const [patternResult, setPatternResult] = useState<PatternResult | null>(null);

  useEffect(() => {
    setColorRanges(generateTemperatureRanges(selectedPalette.colors));
  }, [selectedPalette]);

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 'location': return location !== null;
      case 'dates': return startDate && endDate && new Date(startDate) < new Date(endDate);
      case 'colors': return colorRanges.length > 0;
      default: return true;
    }
  };

  const goNext = async () => {
    if (currentStep === 'colors') {
      await loadTemperatureData();
    }
    const nextIndex = Math.min(currentStepIndex + 1, STEPS.length - 1);
    setCurrentStep(STEPS[nextIndex].id);
  };

  const goBack = () => {
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    setCurrentStep(STEPS[prevIndex].id);
  };

  const loadTemperatureData = async () => {
    if (!location) return;

    setIsLoading(true);
    try {
      const data = await fetchTemperatureData(location, startDate, endDate, hour);

      const settings: PatternSettings = {
        startDate,
        endDate,
        hour,
        location,
        colorRanges,
        stitchesPerRow,
        rowHeight,
        yarnWeight
      };

      const result = generatePattern(data, settings);
      setPatternResult(result);
    } catch (error) {
      console.error('Failed to load temperature data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!patternResult || !location) return;

    const settings: PatternSettings = {
      startDate,
      endDate,
      hour,
      location,
      colorRanges,
      stitchesPerRow,
      rowHeight,
      yarnWeight
    };

    const description = generatePatternDescription(patternResult, settings);
    const blob = new Blob([description], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `temperaturmonster-${location.name}-${startDate}-${endDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Skapa Temperaturmönster
        </h1>
        <p className="text-gray-600">
          Följ stegen för att skapa ditt unika virkningsmönster baserat på verklig temperaturdata.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-4 shadow-soft">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
              disabled={index > currentStepIndex}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                step.id === currentStep
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : index < currentStepIndex
                  ? 'text-primary-600 hover:bg-primary-50 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.id === currentStep
                  ? 'bg-primary-500 text-white'
                  : index < currentStepIndex
                  ? 'bg-primary-200 text-primary-700'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step.icon}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {index < STEPS.length - 1 && (
              <ChevronRight className="w-5 h-5 text-gray-300 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="card mb-6 min-h-[400px]">
        {currentStep === 'location' && (
          <LocationStep
            location={location}
            onSelect={setLocation}
          />
        )}

        {currentStep === 'dates' && (
          <DatesStep
            startDate={startDate}
            endDate={endDate}
            hour={hour}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onHourChange={setHour}
          />
        )}

        {currentStep === 'colors' && (
          <ColorsStep
            selectedPalette={selectedPalette}
            colorRanges={colorRanges}
            stitchesPerRow={stitchesPerRow}
            rowHeight={rowHeight}
            yarnWeight={yarnWeight}
            onPaletteChange={setSelectedPalette}
            onColorRangesChange={setColorRanges}
            onStitchesChange={setStitchesPerRow}
            onRowHeightChange={setRowHeight}
            onYarnWeightChange={setYarnWeight}
          />
        )}

        {currentStep === 'preview' && (
          <PreviewStep
            isLoading={isLoading}
            patternResult={patternResult}
            colorRanges={colorRanges}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={goBack}
          disabled={currentStepIndex === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Tillbaka
        </button>

        {currentStep !== 'preview' ? (
          <button
            onClick={goNext}
            disabled={!canProceed() || isLoading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Laddar...
              </>
            ) : (
              <>
                Nästa
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleExport}
            disabled={!patternResult}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportera mönster
          </button>
        )}
      </div>
    </div>
  );
}

// Step Components
interface LocationStepProps {
  location: SMHILocation | null;
  onSelect: (loc: SMHILocation) => void;
}

function LocationStep({ location, onSelect }: LocationStepProps) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SMHILocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeout: ReturnType<typeof setTimeout>;
      return (query: string) => {
        clearTimeout(timeout);
        if (query.length < 2) {
          setSearchResults([]);
          setHasSearched(false);
          return;
        }
        timeout = setTimeout(async () => {
          setIsSearching(true);
          const results = await searchLocation(query);
          setSearchResults(results);
          setIsSearching(false);
          setHasSearched(true);
        }, 300);
      };
    })(),
    []
  );

  useEffect(() => {
    debouncedSearch(search);
  }, [search, debouncedSearch]);

  // Show search results if searching, otherwise show filtered preset locations
  const filteredLocations = search.length >= 2
    ? searchResults
    : SWEDISH_LOCATIONS.filter(loc =>
        loc.name.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 20);

  const showingSearchResults = search.length >= 2 && hasSearched;

  return (
    <div>
      <h2 className="text-xl font-display font-semibold text-gray-800 mb-4">
        Välj plats för temperaturdata
      </h2>
      <p className="text-gray-600 mb-6">
        Sök efter valfri ort i Sverige eller välj från listan nedan.
      </p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Sök ort i Sverige..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {showingSearchResults && searchResults.length === 0 && !isSearching && (
        <p className="text-gray-500 text-center py-4 mb-4 bg-gray-50 rounded-lg">
          Inga resultat för "{search}". Prova en annan stavning.
        </p>
      )}

      {showingSearchResults && searchResults.length > 0 && (
        <p className="text-sm text-gray-500 mb-2">
          Sökresultat för "{search}":
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
        {filteredLocations.map((loc) => (
          <button
            key={`${loc.name}-${loc.latitude}-${loc.longitude}`}
            onClick={() => onSelect(loc)}
            className={`p-3 rounded-lg text-left transition-all ${
              location?.name === loc.name && location?.latitude === loc.latitude
                ? 'bg-primary-100 border-2 border-primary-500 text-primary-700'
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{loc.name}</span>
            </div>
          </button>
        ))}
      </div>

      {!showingSearchResults && (
        <p className="text-xs text-gray-400 mt-3">
          Visar populära orter. Skriv minst 2 tecken för att söka efter fler.
        </p>
      )}
    </div>
  );
}

interface DatesStepProps {
  startDate: string;
  endDate: string;
  hour: number;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onHourChange: (hour: number) => void;
}

function DatesStep({ startDate, endDate, hour, onStartDateChange, onEndDateChange, onHourChange }: DatesStepProps) {
  return (
    <div>
      <h2 className="text-xl font-display font-semibold text-gray-800 mb-4">
        Välj datumintervall
      </h2>
      <p className="text-gray-600 mb-6">
        Bestäm vilken period du vill skapa mönster för. En typisk temperaturfilt omfattar ett helt år.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="label">Startdatum</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Slutdatum</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label">Klockslag för temperaturavläsning</label>
        <select
          value={hour}
          onChange={(e) => onHourChange(Number(e.target.value))}
          className="input"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>
              {i.toString().padStart(2, '0')}:00
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-2">
          Temperaturen vid denna tid varje dag används för att bestämma radens färg.
        </p>
      </div>

      <div className="mt-6 p-4 bg-primary-50 rounded-lg">
        <p className="text-sm text-primary-700">
          <strong>Tips:</strong> Kl 12:00-14:00 ger ofta dagens högsta temperatur,
          medan kl 06:00-08:00 ger en mer dämperad bild av vädret.
        </p>
      </div>
    </div>
  );
}

interface ColorsStepProps {
  selectedPalette: typeof COLOR_PALETTES[0];
  colorRanges: TemperatureRange[];
  stitchesPerRow: number;
  rowHeight: number;
  yarnWeight: string;
  onPaletteChange: (palette: typeof COLOR_PALETTES[0]) => void;
  onColorRangesChange: (ranges: TemperatureRange[]) => void;
  onStitchesChange: (stitches: number) => void;
  onRowHeightChange: (height: number) => void;
  onYarnWeightChange: (weight: string) => void;
}

function ColorsStep({
  selectedPalette,
  colorRanges,
  stitchesPerRow,
  rowHeight,
  yarnWeight,
  onPaletteChange,
  onColorRangesChange,
  onStitchesChange,
  onRowHeightChange,
  onYarnWeightChange
}: ColorsStepProps) {
  return (
    <div>
      <h2 className="text-xl font-display font-semibold text-gray-800 mb-4">
        Välj färgskala och inställningar
      </h2>

      <div className="mb-6">
        <label className="label">Färgpalett</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COLOR_PALETTES.map((palette) => (
            <button
              key={palette.id}
              onClick={() => onPaletteChange(palette)}
              className={`p-3 rounded-lg text-left transition-all ${
                selectedPalette.id === palette.id
                  ? 'ring-2 ring-primary-500 bg-white shadow-soft'
                  : 'bg-gray-50 hover:bg-white'
              }`}
            >
              <div className="flex gap-0.5 mb-2 h-6 rounded overflow-hidden">
                {palette.colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-gray-800">{palette.name}</p>
              <p className="text-xs text-gray-500">{palette.description}</p>
            </button>
          ))}
        </div>
      </div>

      <ColorRangeEditor
        ranges={colorRanges}
        onChange={onColorRangesChange}
      />

      <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t">
        <div>
          <label className="label">Maskor per rad</label>
          <input
            type="number"
            value={stitchesPerRow}
            onChange={(e) => onStitchesChange(Number(e.target.value))}
            min={50}
            max={500}
            className="input"
          />
        </div>
        <div>
          <label className="label">Radhöjd (mm)</label>
          <input
            type="number"
            value={rowHeight}
            onChange={(e) => onRowHeightChange(Number(e.target.value))}
            min={3}
            max={20}
            className="input"
          />
        </div>
        <div>
          <label className="label">Garnvikt</label>
          <select
            value={yarnWeight}
            onChange={(e) => onYarnWeightChange(e.target.value)}
            className="input"
          >
            <option value="lace">Spetsgarn</option>
            <option value="fingering">Fingering / Sockgarn</option>
            <option value="sport">Sport</option>
            <option value="dk">DK / 8 ply</option>
            <option value="worsted">Worsted</option>
            <option value="aran">Aran</option>
            <option value="bulky">Tjockt garn</option>
            <option value="super_bulky">Supertjockt garn</option>
          </select>
        </div>
      </div>
    </div>
  );
}

interface PreviewStepProps {
  isLoading: boolean;
  patternResult: PatternResult | null;
  colorRanges: TemperatureRange[];
}

function PreviewStep({ isLoading, patternResult, colorRanges }: PreviewStepProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p className="text-gray-600">Hämtar temperaturdata och skapar mönster...</p>
      </div>
    );
  }

  if (!patternResult) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-gray-600">Kunde inte skapa mönster. Försök igen.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-display font-semibold text-gray-800 mb-4">
        Ditt temperaturmönster
      </h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <PatternPreview rows={patternResult.rows} />
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Sammanfattning</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Antal rader:</dt>
                <dd className="font-medium">{patternResult.totalRows}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Total längd:</dt>
                <dd className="font-medium">ca {Math.round(patternResult.totalLength)} cm</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Lägsta temp:</dt>
                <dd className="font-medium">{patternResult.temperatureStats.minTemp}°C</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Högsta temp:</dt>
                <dd className="font-medium">{patternResult.temperatureStats.maxTemp}°C</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Medeltemp:</dt>
                <dd className="font-medium">{patternResult.temperatureStats.avgTemp}°C</dd>
              </div>
            </dl>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Garnåtgång</h3>
            <div className="space-y-2">
              {patternResult.yarnNeeded.slice(0, 5).map((yarn) => (
                <div key={yarn.color} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: yarn.color }}
                  />
                  <span className="flex-1 text-gray-600">{yarn.colorName}</span>
                  <span className="font-medium">{yarn.metersNeeded} m</span>
                </div>
              ))}
              {patternResult.yarnNeeded.length > 5 && (
                <p className="text-sm text-gray-500">
                  + {patternResult.yarnNeeded.length - 5} fler färger
                </p>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between font-medium">
                <span>Totalt:</span>
                <span>
                  {patternResult.yarnNeeded.reduce((sum, y) => sum + y.metersNeeded, 0)} m
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Färgskala</h3>
            <div className="space-y-1">
              {colorRanges.map((range) => (
                <div key={range.min} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: range.color }}
                  />
                  <span className="text-gray-600">
                    {range.min}°C – {range.max}°C
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { TemperatureRange } from '@/types';
import { Plus, Minus, Palette } from 'lucide-react';

interface ColorRangeEditorProps {
  ranges: TemperatureRange[];
  onChange: (ranges: TemperatureRange[]) => void;
}

export default function ColorRangeEditor({ ranges, onChange }: ColorRangeEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleColorChange = (index: number, color: string) => {
    const newRanges = [...ranges];
    newRanges[index] = { ...newRanges[index], color };
    onChange(newRanges);
  };

  const handleRangeChange = (index: number, field: 'min' | 'max', value: number) => {
    const newRanges = [...ranges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    onChange(newRanges);
  };

  const addRange = () => {
    if (ranges.length >= 15) return;

    const lastRange = ranges[ranges.length - 1];
    const newMax = lastRange.max + 5;

    onChange([
      ...ranges,
      {
        min: lastRange.max,
        max: newMax,
        color: '#888888',
        colorName: `Färg ${ranges.length + 1}`
      }
    ]);
  };

  const removeRange = (index: number) => {
    if (ranges.length <= 3) return;

    const newRanges = ranges.filter((_, i) => i !== index);

    // Adjust ranges to fill gaps
    for (let i = 0; i < newRanges.length - 1; i++) {
      newRanges[i + 1] = {
        ...newRanges[i + 1],
        min: newRanges[i].max
      };
    }

    onChange(newRanges);
  };

  const adjustAllRanges = (minTemp: number, maxTemp: number) => {
    const rangeSize = (maxTemp - minTemp) / ranges.length;

    const newRanges = ranges.map((range, index) => ({
      ...range,
      min: Math.round((minTemp + index * rangeSize) * 10) / 10,
      max: Math.round((minTemp + (index + 1) * rangeSize) * 10) / 10
    }));

    onChange(newRanges);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="label mb-0">Temperaturintervall</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustAllRanges(-25, 35)}
            className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50"
          >
            Svensk standard (-25° till +35°)
          </button>
          <button
            onClick={addRange}
            disabled={ranges.length >= 15}
            className="p-1.5 rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Lägg till färg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Color bar preview */}
      <div className="flex h-8 rounded-lg overflow-hidden shadow-inner">
        {ranges.map((range, index) => (
          <div
            key={index}
            className="flex-1 cursor-pointer hover:opacity-80 transition-opacity relative group"
            style={{ backgroundColor: range.color }}
            onClick={() => setEditingIndex(editingIndex === index ? null : index)}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Palette className="w-4 h-4 text-white drop-shadow" />
            </div>
          </div>
        ))}
      </div>

      {/* Range labels */}
      <div className="flex text-xs text-gray-500">
        <span>{ranges[0]?.min}°C</span>
        <span className="flex-1" />
        <span>{ranges[ranges.length - 1]?.max}°C</span>
      </div>

      {/* Detailed editor */}
      <div className="max-h-[200px] overflow-y-auto space-y-2">
        {ranges.map((range, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
              editingIndex === index ? 'bg-primary-50 ring-1 ring-primary-200' : 'bg-gray-50'
            }`}
          >
            <input
              type="color"
              value={range.color}
              onChange={(e) => handleColorChange(index, e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />

            <div className="flex items-center gap-1 flex-1">
              <input
                type="number"
                value={range.min}
                onChange={(e) => handleRangeChange(index, 'min', Number(e.target.value))}
                className="w-16 px-2 py-1 text-sm border rounded"
                step={0.5}
              />
              <span className="text-gray-400">–</span>
              <input
                type="number"
                value={range.max}
                onChange={(e) => handleRangeChange(index, 'max', Number(e.target.value))}
                className="w-16 px-2 py-1 text-sm border rounded"
                step={0.5}
              />
              <span className="text-xs text-gray-500">°C</span>
            </div>

            <span className="text-sm text-gray-600 w-20 truncate">{range.colorName}</span>

            <button
              onClick={() => removeRange(index)}
              disabled={ranges.length <= 3}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Ta bort"
            >
              <Minus className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Klicka på färgfältet ovan för att redigera. Du kan ha 3-15 färgintervall.
      </p>
    </div>
  );
}

import { useState } from 'react';
import { PatternRow } from '@/types';
import { ZoomIn, ZoomOut, Download, RotateCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';

interface PatternPreviewProps {
  rows: PatternRow[];
}

export default function PatternPreview({ rows }: PatternPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [hoveredRow, setHoveredRow] = useState<PatternRow | null>(null);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
  const toggleViewMode = () => setViewMode(v => v === 'vertical' ? 'horizontal' : 'vertical');

  const handleExportImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rowHeight = 4;
    const rowWidth = 300;

    if (viewMode === 'vertical') {
      canvas.width = rowWidth;
      canvas.height = rows.length * rowHeight;
    } else {
      canvas.width = rows.length * rowHeight;
      canvas.height = rowWidth;
    }

    rows.forEach((row, index) => {
      ctx.fillStyle = row.color;
      if (viewMode === 'vertical') {
        ctx.fillRect(0, index * rowHeight, rowWidth, rowHeight);
      } else {
        ctx.fillRect(index * rowHeight, 0, rowHeight, rowWidth);
      }
    });

    const link = document.createElement('a');
    link.download = 'temperaturmonster.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Zooma ut"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Zooma in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleViewMode}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2"
            title="Växla vy"
          >
            <RotateCw className="w-4 h-4" />
            <span className="text-sm">{viewMode === 'vertical' ? 'Vertikal' : 'Horisontell'}</span>
          </button>
          <button
            onClick={handleExportImage}
            className="p-2 rounded-lg bg-primary-100 hover:bg-primary-200 text-primary-700 transition-colors flex items-center gap-2"
            title="Exportera som bild"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Spara bild</span>
          </button>
        </div>
      </div>

      {/* Hover info */}
      {hoveredRow && (
        <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg">
          <span className="font-medium">
            {format(parseISO(hoveredRow.date), 'd MMM yyyy', { locale: sv })}
          </span>
          <span className="mx-2">•</span>
          <span>{hoveredRow.temperature}°C</span>
          <span className="mx-2">•</span>
          <span>{hoveredRow.colorName}</span>
        </div>
      )}

      {/* Pattern visualization */}
      <div
        className="overflow-auto bg-white rounded-lg border border-gray-200 p-4"
        style={{ maxHeight: '500px' }}
      >
        <div
          className={`flex ${viewMode === 'vertical' ? 'flex-col' : 'flex-row'}`}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: viewMode === 'vertical' ? '100%' : undefined,
            height: viewMode === 'horizontal' ? '200px' : undefined,
          }}
        >
          {rows.map((row) => (
            <div
              key={row.date}
              className={`cursor-pointer transition-opacity hover:opacity-80 ${
                viewMode === 'vertical' ? 'h-1 w-full' : 'w-1 h-full'
              }`}
              style={{ backgroundColor: row.color }}
              onMouseEnter={() => setHoveredRow(row)}
              onMouseLeave={() => setHoveredRow(null)}
              title={`${row.date}: ${row.temperature}°C`}
            />
          ))}
        </div>
      </div>

      {/* Month markers */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        {getMonthMarkers(rows).map(marker => (
          <span key={marker.month} className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: marker.color }}
            />
            {marker.month}
          </span>
        ))}
      </div>
    </div>
  );
}

function getMonthMarkers(rows: PatternRow[]): { month: string; color: string }[] {
  const markers: { month: string; color: string }[] = [];
  let lastMonth = '';

  for (const row of rows) {
    const month = format(parseISO(row.date), 'MMM', { locale: sv });
    if (month !== lastMonth) {
      markers.push({ month, color: row.color });
      lastMonth = month;
    }
  }

  return markers;
}

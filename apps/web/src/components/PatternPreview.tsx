import { useState, useRef } from 'react';
import { PatternRow } from '@/types';
import { ZoomIn, ZoomOut, Download, List, Grid3X3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import { adjustBrightness } from '@/utils/color';
import BlanketPreview, { PreviewRow } from './BlanketPreview';

interface PatternPreviewProps {
  rows: PatternRow[];
}

type ViewMode = 'blanket' | 'list';

export default function PatternPreview({ rows }: PatternPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('blanket');
  const [hoveredRow, setHoveredRow] = useState<PatternRow | null>(null);
  const [selectedRow, setSelectedRow] = useState<PatternRow | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));

  const handleExportImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rowHeight = 8;
    const rowWidth = 400;
    const padding = 20;

    canvas.width = rowWidth + padding * 2;
    canvas.height = rows.length * rowHeight + padding * 2;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw rows with yarn texture effect
    rows.forEach((row, index) => {
      const y = padding + index * rowHeight;

      // Main color
      ctx.fillStyle = row.color;
      ctx.fillRect(padding, y, rowWidth, rowHeight);

      // Subtle texture lines to simulate yarn
      ctx.strokeStyle = adjustBrightness(row.color, -15);
      ctx.lineWidth = 0.5;
      for (let x = padding; x < padding + rowWidth; x += 3) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + rowHeight);
        ctx.stroke();
      }
    });

    // Border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, rowWidth, rows.length * rowHeight);

    const link = document.createElement('a');
    link.download = 'temperaturmonster.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const displayedRow = selectedRow || hoveredRow;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
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
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => setViewMode('blanket')}
              className={`p-2 flex items-center gap-1 text-sm ${
                viewMode === 'blanket'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-white hover:bg-gray-50'
              }`}
              title="Filtvy"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">Filt</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 flex items-center gap-1 text-sm ${
                viewMode === 'list'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-white hover:bg-gray-50'
              }`}
              title="Listvy"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>
          <button
            onClick={handleExportImage}
            className="p-2 rounded-lg bg-primary-100 hover:bg-primary-200 text-primary-700 transition-colors flex items-center gap-2"
            title="Exportera som bild"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Spara bild</span>
          </button>
        </div>
      </div>

      {/* Info panel for selected/hovered row */}
      <div className={`text-sm px-3 py-2 rounded-lg transition-all ${
        displayedRow ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'
      }`}>
        {displayedRow ? (
          <>
            <span className="font-medium">
              Rad {rows.findIndex(r => r.date === displayedRow.date) + 1}:
            </span>
            <span className="mx-2">
              {format(parseISO(displayedRow.date), 'd MMMM yyyy', { locale: sv })}
            </span>
            <span className="mx-1">•</span>
            <span className="font-medium">{displayedRow.temperature}°C</span>
            <span className="mx-1">•</span>
            <span
              className="inline-block w-3 h-3 rounded mr-1 align-middle"
              style={{ backgroundColor: displayedRow.color }}
            />
            <span>{displayedRow.colorName}</span>
          </>
        ) : (
          <span>Håll muspekaren över en rad för att se detaljer</span>
        )}
      </div>

      {/* Pattern visualization */}
      {viewMode === 'blanket' ? (
        <BlanketPreview
          zoom={zoom}
          rows={rows.map<PreviewRow>((row) => ({
            key: row.date,
            hex: row.color,
            vanster: rows.findIndex((r) => r.date === row.date) + 1,
            mitten: format(parseISO(row.date), 'd MMM', { locale: sv }),
            hoger: `${row.temperature > 0 ? '+' : ''}${row.temperature}°C`,
          }))}
          selectedKey={selectedRow?.date ?? null}
          onRowClick={(key) => {
            const row = rows.find((r) => r.date === key) ?? null;
            setSelectedRow((prev) => (prev?.date === key ? null : row));
          }}
          onRowHover={(key) => setHoveredRow(key ? rows.find((r) => r.date === key) ?? null : null)}
        />
      ) : (
        /* List view */
        <div
          className="overflow-auto bg-white rounded-lg border border-gray-200"
          style={{ maxHeight: '500px' }}
        >
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Rad</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Datum</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Temp</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Färg</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.date}
                  className={`border-t hover:bg-gray-50 cursor-pointer ${
                    selectedRow?.date === row.date ? 'bg-primary-50' : ''
                  }`}
                  onMouseEnter={() => setHoveredRow(row)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => setSelectedRow(selectedRow?.date === row.date ? null : row)}
                >
                  <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                  <td className="px-3 py-2">
                    {format(parseISO(row.date), 'd MMM yyyy', { locale: sv })}
                  </td>
                  <td className="px-3 py-2 font-medium">
                    {row.temperature > 0 ? '+' : ''}{row.temperature}°C
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-4 rounded border border-gray-200"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="text-gray-600">{row.colorName}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Month summary */}
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Månadsöversikt</h4>
        <div className="flex flex-wrap gap-1">
          {getMonthSummary(rows).map(month => (
            <div
              key={month.name}
              className="flex items-center gap-1 bg-white rounded px-2 py-1 text-xs border border-gray-200"
            >
              <div className="flex gap-px">
                {month.colors.slice(0, 5).map((color, i) => (
                  <div
                    key={i}
                    className="w-2 h-3 first:rounded-l last:rounded-r"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-gray-600 ml-1">{month.name}</span>
              <span className="text-gray-400">({month.count})</span>
            </div>
          ))}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// Get month summary with sample colors
function getMonthSummary(rows: PatternRow[]): { name: string; count: number; colors: string[] }[] {
  const months: Map<string, { count: number; colors: string[] }> = new Map();

  for (const row of rows) {
    const monthName = format(parseISO(row.date), 'MMM', { locale: sv });
    const existing = months.get(monthName);
    if (existing) {
      existing.count++;
      if (existing.colors.length < 10) {
        existing.colors.push(row.color);
      }
    } else {
      months.set(monthName, { count: 1, colors: [row.color] });
    }
  }

  return Array.from(months.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    colors: data.colors,
  }));
}
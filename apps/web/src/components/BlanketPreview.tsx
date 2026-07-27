import { ReactNode } from 'react';
import { getContrastColor } from '@/utils/color';

/** Ett varv i provlappen. Etiketterna läggs som overlay i vänster/mitten/höger. */
export interface PreviewRow {
  key: string;
  hex: string;
  vanster?: ReactNode;
  mitten?: ReactNode;
  hoger?: ReactNode;
  /** Ram runt varvet (t.ex. markerat/valt). */
  markerad?: boolean;
  /** Liten prick som visar att varvet är handlagt (avviker från regeln). */
  avvikelse?: boolean;
}

interface BlanketPreviewProps {
  rows: PreviewRow[];
  zoom?: number;
  rowHeightPx?: number;
  rowWidthPx?: number;
  visaTextur?: boolean;
  visaEtiketter?: boolean;
  selectedKey?: string | null;
  onRowClick?: (key: string, index: number) => void;
  onRowHover?: (key: string | null) => void;
  maxHeight?: number;
  className?: string;
}

/**
 * Den återanvändbara varvstapel-renderaren (provlappen). Staplar varv som divar med
 * en lätt stickad textur. Används av både temperaturvirkningen (PatternPreview) och
 * mönsterbyggaren.
 */
export default function BlanketPreview({
  rows,
  zoom = 1,
  rowHeightPx = 24,
  rowWidthPx = 350,
  visaTextur = true,
  visaEtiketter = true,
  selectedKey = null,
  onRowClick,
  onRowHover,
  maxHeight = 500,
  className = '',
}: BlanketPreviewProps) {
  return (
    <div
      className={`overflow-auto bg-neutral-100 rounded-lg border border-neutral-200 ${className}`}
      style={{ maxHeight }}
    >
      <div className="p-4">
        <div
          className="bg-white rounded shadow-sm overflow-hidden"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: 'fit-content' }}
        >
          {rows.map((row, index) => {
            const text = getContrastColor(row.hex);
            return (
              <div
                key={row.key}
                className={`flex items-center relative transition-[filter] hover:brightness-105 ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${row.markerad ? 'ring-2 ring-inset ring-neutral-900/60 z-10' : ''}`}
                style={{ backgroundColor: row.hex, height: rowHeightPx, minWidth: rowWidthPx }}
                onMouseEnter={() => onRowHover?.(row.key)}
                onMouseLeave={() => onRowHover?.(null)}
                onClick={() => onRowClick?.(row.key, index)}
              >
                {visaTextur && (
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 2px,
                        rgba(0,0,0,0.15) 2px,
                        rgba(0,0,0,0.15) 3px
                      )`,
                    }}
                  />
                )}
                {row.avvikelse && (
                  <span
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white ring-1 ring-black/40 pointer-events-none"
                    title="Handlagt varv"
                  />
                )}
                {visaEtiketter && (row.vanster || row.mitten || row.hoger) && (
                  <div
                    className="absolute inset-0 flex items-center justify-between px-2 text-[11px] font-mono pointer-events-none"
                    style={{ color: text, textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}
                  >
                    <span className="opacity-70">{row.vanster}</span>
                    <span className="truncate">{row.mitten}</span>
                    <span className="font-semibold">{row.hoger}</span>
                  </div>
                )}
                {selectedKey === row.key && (
                  <div className="absolute inset-0 ring-2 ring-inset ring-primary-500 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Export: CSV (Excel), JSON (spara/öppna mönster) och PNG (provlapp).
import { BuilderRow, Monster } from '@/types/builder';
import { adjustBrightness } from './color';

/** Startar en nedladdning av en Blob i webbläsaren. */
function laddaNer(blob: Blob, filnamn: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filnamn;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Escapar ett fält för CSV med semikolon-avgränsare. */
function csvFalt(v: string | number): string {
  const s = String(v);
  if (/[";\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * CSV för Excel: semikolon som avgränsare och BOM först, annars blir svenska tecken fel.
 * En rad per varv: Varv;Block;Segment;Typ;Färg;Hex;Maskor.
 */
export function exporteraCsv(rows: BuilderRow[], maskor: number, filnamn = 'monster.csv'): void {
  const rubrik = ['Varv', 'Block', 'Segment', 'Typ', 'Färg', 'Hex', 'Maskor'];
  const rader = rows.map((r) =>
    [
      r.varv,
      r.blockNamn,
      r.segmentId ?? '',
      r.rand ? 'Rand' : r.overskriven ? 'Handlagt' : 'Varv',
      r.fargNamn,
      r.hex,
      maskor,
    ]
      .map(csvFalt)
      .join(';')
  );
  const innehall = '﻿' + [rubrik.join(';'), ...rader].join('\r\n');
  laddaNer(new Blob([innehall], { type: 'text/csv;charset=utf-8' }), filnamn);
}

/** Sparar hela mönstret som JSON-fil. */
export function sparaJson(m: Monster, filnamn = 'monster.json'): void {
  const innehall = JSON.stringify(m, null, 2);
  laddaNer(new Blob([innehall], { type: 'application/json' }), filnamn);
}

/** Läser ett mönster ur en uppladdad JSON-fil. Kastar om det inte går att tolka. */
export function laddaJson(file: File): Promise<Monster> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const m = JSON.parse(String(reader.result)) as Monster;
        if (!m || !Array.isArray(m.block) || !Array.isArray(m.palett)) {
          throw new Error('Filen ser inte ut som ett sparat mönster.');
        }
        resolve(m);
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Kunde inte läsa filen.'));
      }
    };
    reader.onerror = () => reject(new Error('Kunde inte läsa filen.'));
    reader.readAsText(file);
  });
}

/**
 * Ritar provlappen på en offscreen-canvas och laddar ner som PNG.
 * Varje varv får en lätt stickad textur (samma idé som PatternPreview).
 */
export function exporteraPng(rows: BuilderRow[], filnamn = 'provlapp.png'): void {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rowHeight = 8;
  const rowWidth = 400;
  const padding = 20;
  canvas.width = rowWidth + padding * 2;
  canvas.height = rows.length * rowHeight + padding * 2;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  rows.forEach((row, index) => {
    const y = padding + index * rowHeight;
    ctx.fillStyle = row.hex;
    ctx.fillRect(padding, y, rowWidth, rowHeight);
    // stickad textur: fina vertikala streck
    ctx.strokeStyle = adjustBrightness(row.hex, -15);
    ctx.lineWidth = 0.5;
    for (let x = padding; x < padding + rowWidth; x += 3) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + rowHeight);
      ctx.stroke();
    }
  });

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  ctx.strokeRect(padding, padding, rowWidth, rows.length * rowHeight);

  canvas.toBlob((blob) => {
    if (blob) laddaNer(blob, filnamn);
  }, 'image/png');
}

/** Öppnar utskriftsdialogen — användaren kan spara provlappen som PDF. */
export function skrivUt(): void {
  window.print();
}

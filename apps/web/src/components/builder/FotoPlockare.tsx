import { useEffect, useRef, useState } from 'react';
import { Camera, Wand2, Pipette, Droplet, X } from 'lucide-react';
import { YarnColor } from '@/types';
import {
  kvantiseraFarger,
  medianAvOmrade,
  skapaVitbalans,
  narmasteFarg,
} from '@/utils/color';
import { nyId } from '@/services/builder';

interface FotoPlockareProps {
  /** Leverantörens färgkarta för deltaE-matchning (valfri). */
  fargkarta?: YarnColor[];
  onLaggTill: (farger: YarnColor[]) => void;
  onStang: () => void;
}

const VISNING_MAX = 360; // px, canvas-bredd på skärmen
const PROV_MAX = 100; // px, nedskalad bild för kvantisering

interface Plock {
  hex: string;
  namn: string;
}

/**
 * Plockar färger ur ett foto av garnnystanen. Allt sker i webbläsaren med canvas —
 * ingen server, ingen uppladdning. Punktplock (median av område), förstoringsglas,
 * vitbalans mot vitt papper och deltaE-matchning mot leverantörens karta.
 */
export default function FotoPlockare({ fargkarta, onLaggTill, onStang }: FotoPlockareProps) {
  const [bild, setBild] = useState<HTMLImageElement | null>(null);
  const [plockade, setPlockade] = useState<Plock[]>([]);
  const [forslag, setForslag] = useState<string[]>([]);
  const [vitbalansHex, setVitbalansHex] = useState<string | null>(null);
  const [lage, setLage] = useState<'plocka' | 'vitbalans'>('plocka');
  const [lupp, setLupp] = useState<{ x: number; y: number; hex: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullDataRef = useRef<ImageData | null>(null); // originalskala för punktplock
  const skalaRef = useRef(1); // visnings-px -> original-px

  // Rita upp bilden och läs ut ImageData när en ny bild laddas.
  useEffect(() => {
    if (!bild || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const skala = Math.min(1, VISNING_MAX / bild.width);
    canvas.width = Math.round(bild.width * skala);
    canvas.height = Math.round(bild.height * skala);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(bild, 0, 0, canvas.width, canvas.height);

    // originalskala i minnet (för median-plock)
    const full = document.createElement('canvas');
    full.width = bild.width;
    full.height = bild.height;
    const fctx = full.getContext('2d', { willReadFrequently: true });
    if (fctx) {
      fctx.drawImage(bild, 0, 0);
      fullDataRef.current = fctx.getImageData(0, 0, bild.width, bild.height);
      skalaRef.current = bild.width / canvas.width;
    }

    // auto-förslag från nedskalad bild
    const liten = document.createElement('canvas');
    const ps = Math.min(1, PROV_MAX / bild.width);
    liten.width = Math.max(1, Math.round(bild.width * ps));
    liten.height = Math.max(1, Math.round(bild.height * ps));
    const lctx = liten.getContext('2d', { willReadFrequently: true });
    if (lctx) {
      lctx.drawImage(bild, 0, 0, liten.width, liten.height);
      const data = lctx.getImageData(0, 0, liten.width, liten.height);
      setForslag(kvantiseraFarger(data, 6));
    }
  }, [bild]);

  const laddaBild = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setBild(img);
      setPlockade([]);
      setVitbalansHex(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const korrigera = (hex: string): string =>
    vitbalansHex ? skapaVitbalans(vitbalansHex)(hex) : hex;

  // Räkna ut hex vid en canvas-position (median i originalskala).
  const hexVid = (klientX: number, klientY: number): { hex: string; x: number; y: number } | null => {
    const canvas = canvasRef.current;
    const full = fullDataRef.current;
    if (!canvas || !full) return null;
    const rect = canvas.getBoundingClientRect();
    const cx = ((klientX - rect.left) / rect.width) * canvas.width;
    const cy = ((klientY - rect.top) / rect.height) * canvas.height;
    const ox = Math.round(cx * skalaRef.current);
    const oy = Math.round(cy * skalaRef.current);
    const hex = medianAvOmrade(full, ox, oy, 7);
    return { hex, x: cx, y: cy };
  };

  const handlePekare = (e: React.PointerEvent) => {
    const träff = hexVid(e.clientX, e.clientY);
    if (träff) setLupp({ x: träff.x, y: träff.y, hex: korrigera(träff.hex) });
  };

  const handleKlick = (e: React.PointerEvent) => {
    const träff = hexVid(e.clientX, e.clientY);
    if (!träff) return;
    if (lage === 'vitbalans') {
      setVitbalansHex(träff.hex); // referensvit = råvärdet på pappret
      setLage('plocka');
      return;
    }
    laggTillPlock(korrigera(träff.hex));
  };

  const laggTillPlock = (hex: string) =>
    setPlockade((p) => [...p, { hex, namn: `Garn ${p.length + 1}` }]);

  const spara = () => {
    const färger: YarnColor[] = plockade.map((p) => ({ id: nyId('f'), name: p.namn, hex: p.hex }));
    onLaggTill(färger);
    onStang();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-semibold text-neutral-800">Plocka färger ur foto</h4>
        <button type="button" onClick={onStang} className="text-neutral-400 hover:text-neutral-800 p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {!bild ? (
        <label className="flex flex-col items-center justify-center gap-2 py-10 rounded-xl border-2 border-dashed border-neutral-300 cursor-pointer hover:border-neutral-400 hover:bg-neutral-50 transition-colors">
          <Camera className="w-8 h-8 text-neutral-400" />
          <span className="text-sm text-neutral-600">Ta ett foto av nystanen eller välj en bild</span>
          <span className="text-xs text-neutral-400">Lägg gärna ett vitt papper bredvid för rätt färg</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && laddaBild(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="space-y-4">
          {/* Verktygsrad */}
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <button
              type="button"
              onClick={() => setLage('vitbalans')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                lage === 'vitbalans'
                  ? 'bg-neutral-800 text-white border-neutral-800'
                  : 'border-neutral-300 hover:bg-neutral-100'
              }`}
            >
              <Droplet className="w-4 h-4" /> Peka på vitt papper
            </button>
            {vitbalansHex ? (
              <span className="text-xs text-green-700 flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: vitbalansHex }} />
                Vitbalans satt
                <button onClick={() => setVitbalansHex(null)} className="underline ml-1">
                  ångra
                </button>
              </span>
            ) : (
              <span className="text-xs text-amber-700">Utan vitbalans är färgerna ungefärliga</span>
            )}
            <label className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 cursor-pointer">
              <Camera className="w-4 h-4" /> Ny bild
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && laddaBild(e.target.files[0])}
              />
            </label>
          </div>

          <p className="text-xs text-neutral-500 flex items-center gap-1">
            <Pipette className="w-3.5 h-3.5" />
            {lage === 'vitbalans'
              ? 'Tryck på det vita pappret i bilden.'
              : 'Tryck på ett nystan för att plocka just den färgen.'}
          </p>

          {/* Canvas med förstoringsglas */}
          <div className="relative inline-block touch-none select-none">
            <canvas
              ref={canvasRef}
              className="rounded-lg border border-neutral-200 max-w-full cursor-crosshair"
              onPointerMove={handlePekare}
              onPointerDown={handleKlick}
              onPointerLeave={() => setLupp(null)}
            />
            {lupp && (
              <div
                className="absolute pointer-events-none rounded-full border-2 border-white shadow-lg overflow-hidden"
                style={{
                  width: 56,
                  height: 56,
                  left: lupp.x - 28,
                  top: lupp.y - 72, // ovanför fingret så det inte skyms
                  backgroundColor: lupp.hex,
                }}
              >
                <span className="absolute inset-x-0 bottom-0 text-[9px] font-mono text-center bg-black/50 text-white">
                  {lupp.hex}
                </span>
              </div>
            )}
          </div>

          {/* Auto-förslag */}
          {forslag.length > 0 && (
            <div>
              <span className="text-xs text-neutral-500 flex items-center gap-1 mb-1.5">
                <Wand2 className="w-3.5 h-3.5" /> Förslag (automatik tar med bord och skuggor — punktplock är säkrare)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {forslag.map((hex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => laggTillPlock(korrigera(hex))}
                    className="w-8 h-8 rounded-lg border border-neutral-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: korrigera(hex) }}
                    title={`Lägg till ${korrigera(hex)}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Plockade färger */}
          {plockade.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-neutral-700">Plockade färger</span>
              {plockade.map((p, i) => {
                const match = fargkarta && fargkarta.length ? narmasteFarg(p.hex, fargkarta) : null;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={p.hex}
                      onChange={(e) =>
                        setPlockade((arr) => arr.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))
                      }
                      className="w-9 h-9 rounded border border-neutral-300 cursor-pointer bg-white"
                      title="Justera tonen"
                    />
                    <input
                      value={p.namn}
                      onChange={(e) =>
                        setPlockade((arr) => arr.map((x, j) => (j === i ? { ...x, namn: e.target.value } : x)))
                      }
                      className="flex-1 min-w-0 text-sm rounded border border-neutral-300 px-2 py-1.5 focus:ring-2 focus:ring-neutral-400 focus:outline-none"
                    />
                    {match && (
                      <button
                        type="button"
                        onClick={() =>
                          setPlockade((arr) =>
                            arr.map((x, j) => (j === i ? { hex: match.farg.hex, namn: match.farg.name } : x))
                          )
                        }
                        className="flex items-center gap-1.5 text-xs rounded-lg border border-neutral-200 px-2 py-1 hover:bg-neutral-100"
                        title="Använd leverantörens färg i stället"
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-neutral-300"
                          style={{ backgroundColor: match.farg.hex }}
                        />
                        <span className="max-w-[7rem] truncate">{match.farg.name}</span>
                        <span className="text-neutral-400 tabular-nums">{match.sakerhet}%</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPlockade((arr) => arr.filter((_, j) => j !== i))}
                      className="text-neutral-400 hover:text-red-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onStang}
              className="px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={spara}
              disabled={plockade.length === 0}
              className="px-4 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-900 disabled:opacity-40"
            >
              Lägg till {plockade.length || ''} i paletten
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Shuffle,
  ArrowLeftRight,
  Wand2,
  Hand,
  Globe,
  Camera,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Monster } from '@/types/builder';
import { YarnColor } from '@/types';
import { nyId, uppdateraFarg, bytPlatsPaFarger, slumpaOrdning } from '@/services/builder';
import { genereraOmbre, genereraKomplement, randForsvinner } from '@/utils/color';
import { hamtaFargerFranUrl, fargerFranText } from '@/services/farghamtning';
import FotoPlockare from './FotoPlockare';

interface PalettProps {
  monster: Monster;
  /** Leverantörens fullständiga färgkarta för fotomatchning. */
  fargkarta?: YarnColor[];
  onChange: (monster: Monster) => void;
}

type Flik = 'egna' | 'leverantor' | 'foto';

export default function Palett({ monster, fargkarta, onChange }: PalettProps) {
  const [flik, setFlik] = useState<Flik>('egna');
  const [bytA, setBytA] = useState<string | null>(null);
  const palett = monster.palett;

  const setPalett = (p: YarnColor[]) => onChange({ ...monster, palett: p });

  const laggTill = (farger: YarnColor[]) => setPalett([...palett, ...farger]);

  const taBort = (id: string) => {
    if (palett.length <= 1) return;
    setPalett(palett.filter((f) => f.id !== id));
  };

  const klickaForByte = (id: string) => {
    if (bytA === null) {
      setBytA(id);
    } else if (bytA === id) {
      setBytA(null);
    } else {
      onChange(bytPlatsPaFarger(monster, bytA, id));
      setBytA(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Flikar — tre likvärdiga sätt att fylla paletten */}
      <div className="flex gap-1 rounded-lg bg-neutral-100 p-1">
        <FlikKnapp aktiv={flik === 'egna'} onClick={() => setFlik('egna')} icon={<Hand className="w-4 h-4" />}>
          Egna
        </FlikKnapp>
        <FlikKnapp aktiv={flik === 'leverantor'} onClick={() => setFlik('leverantor')} icon={<Globe className="w-4 h-4" />}>
          Leverantör
        </FlikKnapp>
        <FlikKnapp aktiv={flik === 'foto'} onClick={() => setFlik('foto')} icon={<Camera className="w-4 h-4" />}>
          Foto
        </FlikKnapp>
      </div>

      {flik === 'foto' ? (
        <FotoPlockare fargkarta={fargkarta} onLaggTill={laggTill} onStang={() => setFlik('egna')} />
      ) : flik === 'leverantor' ? (
        <LeverantorsFlik onLaggTill={laggTill} />
      ) : (
        <EgnaFlik onLaggTill={laggTill} />
      )}

      {/* Palettlistan (alltid synlig) */}
      <div className="space-y-1.5">
        {bytA && (
          <p className="text-xs text-neutral-500 flex items-center gap-1">
            <ArrowLeftRight className="w-3.5 h-3.5" /> Välj en färg till att byta plats med — eller klicka igen för att avbryta.
          </p>
        )}
        {palett.map((f, i) => {
          const nästa = palett[i + 1];
          const näraNästa = nästa && randForsvinner(f.hex, nästa.hex);
          return (
            <div key={f.id}>
              <div
                className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 bg-white ${
                  bytA === f.id ? 'border-neutral-800 ring-1 ring-neutral-800' : 'border-neutral-200'
                }`}
              >
                <input
                  type="color"
                  value={f.hex}
                  onChange={(e) => onChange(uppdateraFarg(monster, f.id, { hex: e.target.value }))}
                  className="w-8 h-8 rounded border border-neutral-300 cursor-pointer bg-white shrink-0"
                  title="Byt ton"
                />
                <input
                  value={f.name}
                  onChange={(e) => onChange(uppdateraFarg(monster, f.id, { name: e.target.value }))}
                  className="flex-1 min-w-0 text-sm rounded border border-transparent hover:border-neutral-200 focus:border-neutral-300 px-1.5 py-1 focus:ring-1 focus:ring-neutral-300 focus:outline-none"
                />
                <span className="text-[10px] font-mono text-neutral-400 uppercase hidden sm:block">{f.hex}</span>
                <button
                  type="button"
                  onClick={() => klickaForByte(f.id)}
                  className={`p-1.5 rounded hover:bg-neutral-100 ${bytA === f.id ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-700'}`}
                  title="Byt plats med en annan färg"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => taBort(f.id)}
                  className="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-neutral-100"
                  title="Ta bort"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {näraNästa && (
                <p className="flex items-center gap-1 text-[11px] text-amber-600 pl-2 pt-0.5">
                  <AlertTriangle className="w-3 h-3" />
                  Ligger nära "{nästa!.name}" i ljushet — randen kan försvinna i stickat.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Palett-verktyg */}
      <div className="flex flex-wrap gap-2 pt-1">
        <VerktygsKnapp
          onClick={() => laggTill([{ id: nyId('f'), name: `Färg ${palett.length + 1}`, hex: '#cccccc' }])}
          icon={<Plus className="w-4 h-4" />}
        >
          Lägg till färg
        </VerktygsKnapp>
        <VerktygsKnapp onClick={() => onChange(slumpaOrdning(monster))} icon={<Shuffle className="w-4 h-4" />}>
          Slumpa ordning
        </VerktygsKnapp>
        <GenereraKnapp onGenerera={setPalett} />
      </div>
    </div>
  );
}

// --- Flik: egna färger ---
function EgnaFlik({ onLaggTill }: { onLaggTill: (f: YarnColor[]) => void }) {
  const [hex, setHex] = useState('#8ca9c4');
  const [namn, setNamn] = useState('');
  return (
    <div className="flex items-end gap-2 rounded-lg bg-neutral-50 border border-neutral-200 p-3">
      <input
        type="color"
        value={hex}
        onChange={(e) => setHex(e.target.value)}
        className="w-10 h-10 rounded border border-neutral-300 cursor-pointer bg-white"
      />
      <label className="flex-1 min-w-0">
        <span className="text-xs text-neutral-500 block mb-0.5">Namn</span>
        <input
          value={namn}
          onChange={(e) => setNamn(e.target.value)}
          placeholder="t.ex. Dimblå"
          className="w-full text-sm rounded border border-neutral-300 px-2 py-1.5 focus:ring-2 focus:ring-neutral-400 focus:outline-none"
        />
      </label>
      <button
        type="button"
        onClick={() => {
          onLaggTill([{ id: nyId('f'), name: namn.trim() || hex, hex }]);
          setNamn('');
        }}
        className="px-3 py-2 rounded-lg bg-neutral-800 text-white text-sm hover:bg-neutral-900"
      >
        Lägg till
      </button>
    </div>
  );
}

// --- Flik: hämta från leverantör ---
function LeverantorsFlik({ onLaggTill }: { onLaggTill: (f: YarnColor[]) => void }) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [laddar, setLaddar] = useState(false);
  const [fel, setFel] = useState<string | null>(null);

  const hamta = async () => {
    setFel(null);
    setLaddar(true);
    try {
      const { farger } = await hamtaFargerFranUrl(url);
      if (farger.length === 0) setFel('Hittade inga färgkoder på sidan. Prova att klistra in texten i stället.');
      else onLaggTill(farger);
    } catch (e) {
      setFel(e instanceof Error ? e.message : 'Något gick fel.');
    } finally {
      setLaddar(false);
    }
  };

  const franText = () => {
    const farger = fargerFranText(text);
    if (farger.length === 0) setFel('Hittade inga hexkoder i texten (t.ex. #a1b2c3).');
    else {
      onLaggTill(farger);
      setText('');
      setFel(null);
    }
  };

  return (
    <div className="space-y-3 rounded-lg bg-neutral-50 border border-neutral-200 p-3">
      <div>
        <span className="text-xs text-neutral-500 block mb-0.5">Länk till leverantörens färgkarta (Fika Gicona)</span>
        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 min-w-0 text-sm rounded border border-neutral-300 px-2 py-1.5 focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={hamta}
            disabled={!url || laddar}
            className="px-3 py-2 rounded-lg bg-neutral-800 text-white text-sm hover:bg-neutral-900 disabled:opacity-40 flex items-center gap-1.5"
          >
            {laddar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />} Hämta
          </button>
        </div>
      </div>

      <div>
        <span className="text-xs text-neutral-500 block mb-0.5">Eller klistra in text med färgkoder</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Klistra in text som innehåller #hexkoder…"
          className="w-full text-sm rounded border border-neutral-300 px-2 py-1.5 focus:ring-2 focus:ring-neutral-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={franText}
          disabled={!text.trim()}
          className="mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 text-sm hover:bg-neutral-100 disabled:opacity-40"
        >
          Plocka hexkoder ur texten
        </button>
      </div>

      {fel && <p className="text-xs text-red-600">{fel}</p>}
    </div>
  );
}

// --- Palettgenerering (ombré / komplement) ---
function GenereraKnapp({ onGenerera }: { onGenerera: (p: YarnColor[]) => void }) {
  const [oppen, setOppen] = useState(false);
  const [a, setA] = useState('#7c98b3');
  const [b, setB] = useState('#c06b52');
  const [antal, setAntal] = useState(5);

  const applicera = (hexar: string[]) =>
    onGenerera(hexar.map((hex, i) => ({ id: nyId('f'), name: `Ton ${i + 1}`, hex })));

  return (
    <div className="relative">
      <VerktygsKnapp onClick={() => setOppen((o) => !o)} icon={<Wand2 className="w-4 h-4" />}>
        Generera palett
      </VerktygsKnapp>
      {oppen && (
        <div className="absolute z-20 mt-2 w-72 rounded-xl border border-neutral-200 bg-white shadow-lg p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-neutral-700">Ombré mellan två toner</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="color" value={a} onChange={(e) => setA(e.target.value)} className="w-9 h-9 rounded border border-neutral-300 bg-white" />
            <span className="text-neutral-400">→</span>
            <input type="color" value={b} onChange={(e) => setB(e.target.value)} className="w-9 h-9 rounded border border-neutral-300 bg-white" />
            <label className="ml-auto text-sm text-neutral-600 flex items-center gap-1">
              Antal
              <input
                type="number"
                min={2}
                max={12}
                value={antal}
                onChange={(e) => setAntal(Math.max(2, Math.min(12, Number(e.target.value) || 2)))}
                className="w-14 px-2 py-1 text-sm font-mono rounded border border-neutral-300"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                applicera(genereraOmbre(a, b, antal));
                setOppen(false);
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-neutral-800 text-white text-sm hover:bg-neutral-900"
            >
              Skapa ombré
            </button>
            <button
              type="button"
              onClick={() => {
                applicera(genereraKomplement(a, antal));
                setOppen(false);
              }}
              className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 text-sm hover:bg-neutral-100"
              title="Jämnt fördelade nyanser runt färghjulet utifrån första tonen"
            >
              Komplement
            </button>
          </div>
          <p className="text-[11px] text-neutral-400">Ersätter nuvarande palett.</p>
        </div>
      )}
    </div>
  );
}

function FlikKnapp({ aktiv, onClick, icon, children }: { aktiv: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm transition-colors ${
        aktiv ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function VerktygsKnapp({ onClick, icon, children }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
    >
      {icon}
      {children}
    </button>
  );
}

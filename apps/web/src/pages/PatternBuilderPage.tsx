import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Ruler,
  Download,
  Save,
  FolderOpen,
  Printer,
  Image as ImageIcon,
  Eraser,
} from 'lucide-react';
import { Monster } from '@/types/builder';
import { YARN_BRANDS } from '@/services/pattern';
import {
  expanderaMonster,
  faktiskHojd,
  fyllForslag,
  exempelMonster,
  slappOverskrivningar,
} from '@/services/builder';
import { useUndoable } from '@/hooks/useUndoable';
import { lasLocalStorage } from '@/hooks/useLocalStorage';
import { exporteraCsv, exporteraPng, sparaJson, laddaJson } from '@/utils/export';
import BlanketPreview, { PreviewRow } from '@/components/BlanketPreview';
import Palett from '@/components/builder/Palett';
import BlockLista from '@/components/builder/BlockLista';

const LAGRINGSNYCKEL = 'garnmonster:builder';

/** Fika Gicona-kartan används för fotomatchning (deltaE). */
const fikaKarta = YARN_BRANDS.find((b) => b.id === 'fika-gicona')?.colors ?? [];

export default function PatternBuilderPage() {
  // Seeda från localStorage om det finns, annars exempelmönstret (aldrig tom sida).
  const {
    state: monster,
    set,
    reset,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoable<Monster>(lasLocalStorage(LAGRINGSNYCKEL, exempelMonster()));

  const [zoom, setZoom] = useState(1);
  const [proportion, setProportion] = useState(false);
  const [valtVarv, setValtVarv] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Auto-spara i webbläsaren utan spara-knapp.
  useEffect(() => {
    try {
      localStorage.setItem(LAGRINGSNYCKEL, JSON.stringify(monster));
    } catch {
      /* persistens är en bonus */
    }
  }, [monster]);

  // Kortkommandon för ångra/gör om.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const rader = useMemo(() => expanderaMonster(monster), [monster]);
  const hojd = faktiskHojd(monster);
  const forslag = fyllForslag(monster);
  const antalHandlagt = Object.keys(monster.overskrivningar).length;

  // Provlappens radmått — normalt eller i verklig proportion via maskprovet.
  const { rowHeightPx, rowWidthPx } = useMemo(() => {
    if (!proportion || !monster.maskprov) return { rowHeightPx: 22, rowWidthPx: 340 };
    const { maskor: mpM, varv: mpV } = monster.maskprov;
    const bredd = 320;
    const stygnBreddCm = 10 / Math.max(1, mpM);
    const varvHojdCm = 10 / Math.max(1, mpV);
    const totalBreddCm = monster.maskor * stygnBreddCm;
    const pxPerCm = bredd / Math.max(0.1, totalBreddCm);
    return { rowHeightPx: Math.max(2, varvHojdCm * pxPerCm), rowWidthPx: bredd };
  }, [proportion, monster.maskprov, monster.maskor]);

  const previewRows = useMemo<PreviewRow[]>(
    () =>
      rader.map((r) => ({
        key: `v${r.varv}`,
        hex: r.hex,
        vanster: r.varv,
        mitten: r.rand ? 'rand' : r.fargNamn,
        hoger: r.overskriven ? '✎' : '',
        avvikelse: r.overskriven,
      })),
    [rader]
  );

  const hoppaTillVarv = (varv: number) => {
    setValtVarv(varv);
    const rad = rader.find((r) => r.varv === varv);
    if (rad) document.getElementById(`block-${rad.blockId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const oppnaJson = async (file: File) => {
    try {
      const m = await laddaJson(file);
      reset(m);
      setValtVarv(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Kunde inte öppna filen.');
    }
  };

  const overskrivVarv = (varv: number, fargId: string | null) => {
    const over = { ...monster.overskrivningar };
    if (fargId === null) delete over[varv];
    else over[varv] = fargId;
    set({ ...monster, overskrivningar: over });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-neutral-900">Mönsterbyggare</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Bygg mönstret själv med färger och regler. Allt du ändrar syns direkt i provlappen.
        </p>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        {/* Vänster: kontroller */}
        <div className="space-y-5 min-w-0">
          <Grundinstallningar monster={monster} onChange={set} />

          <Panel titel="Palett">
            <Palett monster={monster} fargkarta={fikaKarta} onChange={set} />
          </Panel>

          <Panel titel="Block">
            <BlockLista monster={monster} onChange={set} />
          </Panel>
        </div>

        {/* Höger: provlappen (sidans huvudperson) */}
        <div className="lg:sticky lg:top-20 space-y-3">
          {/* Verktygsrad */}
          <div className="flex items-center gap-1 flex-wrap">
            <ToolbarKnapp title="Ångra (Ctrl+Z)" onClick={undo} disabled={!canUndo}>
              <Undo2 className="w-4 h-4" />
            </ToolbarKnapp>
            <ToolbarKnapp title="Gör om (Ctrl+Y)" onClick={redo} disabled={!canRedo}>
              <Redo2 className="w-4 h-4" />
            </ToolbarKnapp>
            <span className="w-px h-6 bg-neutral-200 mx-1" />
            <ToolbarKnapp title="Zooma ut" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
              <ZoomOut className="w-4 h-4" />
            </ToolbarKnapp>
            <span className="text-xs font-mono text-neutral-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
            <ToolbarKnapp title="Zooma in" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
              <ZoomIn className="w-4 h-4" />
            </ToolbarKnapp>
            <ToolbarKnapp
              title="Verklig proportion (maskprov)"
              onClick={() => setProportion((p) => !p)}
              aktiv={proportion}
            >
              <Ruler className="w-4 h-4" />
            </ToolbarKnapp>
          </div>

          {/* Höjd mot mål */}
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              forslag.passar ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'
            }`}
          >
            <div className="flex items-center justify-between font-medium">
              <span>
                Höjd: <span className="font-mono">{hojd}</span> / {monster.malVarv} varv
              </span>
              {!forslag.passar && <span className="font-mono">{forslag.kvar > 0 ? `−${forslag.kvar}` : `+${-forslag.kvar}`}</span>}
            </div>
            {!forslag.passar && <p className="mt-1 text-xs leading-snug">{forslag.forslag}</p>}
          </div>

          {/* Provlappen */}
          <div id="provlapp-utskrift">
            <BlanketPreview
              rows={previewRows}
              zoom={zoom}
              rowHeightPx={rowHeightPx}
              rowWidthPx={rowWidthPx}
              visaEtiketter={!proportion}
              selectedKey={valtVarv ? `v${valtVarv}` : null}
              onRowClick={(key) => hoppaTillVarv(Number(key.slice(1)))}
              maxHeight={560}
            />
          </div>

          {/* Handpåläggning på valt varv */}
          {valtVarv && (
            <div className="rounded-lg border border-neutral-200 bg-white p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">Varv {valtVarv} — måla för hand</span>
                <button onClick={() => setValtVarv(null)} className="text-xs text-neutral-400 hover:text-neutral-700">
                  stäng
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {monster.palett.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => overskrivVarv(valtVarv, f.id)}
                    className="w-7 h-7 rounded-full border border-neutral-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: f.hex }}
                    title={f.name}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => overskrivVarv(valtVarv, null)}
                  className="text-xs text-neutral-500 underline ml-1"
                >
                  Återställ till regeln
                </button>
              </div>
            </div>
          )}

          {antalHandlagt > 0 && (
            <button
              type="button"
              onClick={() => set(slappOverskrivningar(monster))}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800"
            >
              <Eraser className="w-3.5 h-3.5" /> Släpp alla {antalHandlagt} handlagda varv
            </button>
          )}

          {/* Export / spara */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <ExportKnapp onClick={() => exporteraCsv(rader, monster.maskor)} icon={<Download className="w-4 h-4" />}>
              CSV
            </ExportKnapp>
            <ExportKnapp onClick={() => exporteraPng(rader)} icon={<ImageIcon className="w-4 h-4" />}>
              PNG
            </ExportKnapp>
            <ExportKnapp onClick={() => sparaJson(monster)} icon={<Save className="w-4 h-4" />}>
              Spara JSON
            </ExportKnapp>
            <ExportKnapp onClick={() => fileInput.current?.click()} icon={<FolderOpen className="w-4 h-4" />}>
              Öppna JSON
            </ExportKnapp>
            <ExportKnapp onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
              Skriv ut / PDF
            </ExportKnapp>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && oppnaJson(e.target.files[0])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Grundinställningar (maskor, målhöjd, riktning, maskprov) ---
function Grundinstallningar({ monster, onChange }: { monster: Monster; onChange: (m: Monster) => void }) {
  const set = (patch: Partial<Monster>) => onChange({ ...monster, ...patch });
  return (
    <Panel titel="Grundmått">
      <div className="grid grid-cols-2 gap-3">
        <TalFalt label="Maskor (bredd)" varde={monster.maskor} onChange={(v) => set({ maskor: v })} />
        <TalFalt label="Målhöjd (varv)" varde={monster.malVarv} onChange={(v) => set({ malVarv: v })} />
      </div>
      <div className="flex items-center gap-4 flex-wrap mt-3">
        <div>
          <span className="text-xs text-neutral-500 block mb-1">Riktning</span>
          <div className="flex rounded-lg border border-neutral-300 overflow-hidden text-sm">
            {(['uppifran', 'nerifran'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => set({ riktning: r })}
                className={`px-3 py-1.5 ${
                  monster.riktning === r ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {r === 'uppifran' ? 'Uppifrån' : 'Nerifrån'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <span className="text-xs text-neutral-500 block mb-1">Maskprov / 10 cm</span>
            <div className="flex items-center gap-1 text-sm">
              <input
                type="number"
                min={1}
                value={monster.maskprov?.maskor ?? 22}
                onChange={(e) =>
                  set({ maskprov: { maskor: Number(e.target.value) || 1, varv: monster.maskprov?.varv ?? 30 } })
                }
                className="w-14 px-2 py-1 font-mono rounded border border-neutral-300"
                aria-label="Maskor per 10 cm"
              />
              <span className="text-neutral-400">m</span>
              <span className="text-neutral-300">×</span>
              <input
                type="number"
                min={1}
                value={monster.maskprov?.varv ?? 30}
                onChange={(e) =>
                  set({ maskprov: { maskor: monster.maskprov?.maskor ?? 22, varv: Number(e.target.value) || 1 } })
                }
                className="w-14 px-2 py-1 font-mono rounded border border-neutral-300"
                aria-label="Varv per 10 cm"
              />
              <span className="text-neutral-400">v</span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function TalFalt({ label, varde, onChange }: { label: string; varde: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-neutral-500 block mb-1">{label}</span>
      <input
        type="number"
        min={1}
        value={varde}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
        className="w-full px-2 py-1.5 text-sm font-mono rounded-lg border border-neutral-300 focus:ring-2 focus:ring-neutral-400 focus:outline-none"
      />
    </label>
  );
}

function Panel({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white/70 p-4">
      <h2 className="font-display font-semibold text-neutral-800 mb-3">{titel}</h2>
      {children}
    </section>
  );
}

function ToolbarKnapp({
  children,
  title,
  onClick,
  disabled,
  aktiv,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  aktiv?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
        aktiv ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
      }`}
    >
      {children}
    </button>
  );
}

function ExportKnapp({ children, icon, onClick }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
    >
      {icon}
      {children}
    </button>
  );
}

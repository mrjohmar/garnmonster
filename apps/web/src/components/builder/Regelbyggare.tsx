import { Regel } from '@/types/builder';
import { YarnColor } from '@/types';

interface RegelbyggareProps {
  regel: Regel;
  palett: YarnColor[];
  onChange: (regel: Regel) => void;
}

/** Standardregel att utgå från när ett nytt block skapas. */
export function standardRegel(): Regel {
  return {
    antalFarger: 5,
    varvPerFarg: 2,
    randPa: true,
    randVarje: 5,
    randBredd: 1,
    randFargIndex: 0,
  };
}

/**
 * Reglage som direkt formar ett block: antal färger, varv per färg, ränder och riktning.
 * Ändringar skickas uppåt som en ny Regel — blocket byggs om av föräldern.
 */
export default function Regelbyggare({ regel, palett, onChange }: RegelbyggareProps) {
  const set = (patch: Partial<Regel>) => onChange({ ...regel, ...patch });

  const antalFargerFörRand = Math.min(regel.antalFarger, Math.max(1, palett.length));

  return (
    <div className="space-y-4">
      <Reglage
        label="Antal färger i rotationen"
        varde={regel.antalFarger}
        min={2}
        max={12}
        onChange={(v) => set({ antalFarger: v })}
      />
      <Reglage
        label="Varv per färg"
        varde={regel.varvPerFarg}
        min={1}
        max={20}
        enhet="varv"
        onChange={(v) => set({ varvPerFarg: v })}
      />

      {/* Individuellt antal varv per färg */}
      <div>
        <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-neutral-300"
            checked={!!regel.varvPerFargIndividuell}
            onChange={(e) =>
              set({
                varvPerFargIndividuell: e.target.checked
                  ? Array.from({ length: regel.antalFarger }, () => regel.varvPerFarg)
                  : undefined,
              })
            }
          />
          Eget antal varv per färg
        </label>
        {regel.varvPerFargIndividuell && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from({ length: regel.antalFarger }).map((_, i) => {
              const farg = palett[i % Math.max(1, palett.length)];
              const värden = regel.varvPerFargIndividuell ?? [];
              return (
                <div key={i} className="flex items-center gap-1">
                  <span
                    className="w-4 h-4 rounded-full border border-neutral-300"
                    style={{ backgroundColor: farg?.hex ?? '#ccc' }}
                    title={farg?.name}
                  />
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={värden[i] ?? regel.varvPerFarg}
                    onChange={(e) => {
                      const kopia = [...(regel.varvPerFargIndividuell ?? [])];
                      kopia[i] = Math.max(1, Math.min(20, Number(e.target.value) || 1));
                      set({ varvPerFargIndividuell: kopia });
                    }}
                    className="w-14 px-2 py-1 text-sm font-mono rounded border border-neutral-300 focus:ring-2 focus:ring-neutral-400 focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rand */}
      <div className="rounded-lg border border-neutral-200 p-3 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-800 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-neutral-300"
            checked={regel.randPa}
            onChange={(e) => set({ randPa: e.target.checked })}
          />
          Rand
        </label>
        {regel.randPa && (
          <div className="space-y-3 pl-6">
            <Reglage
              label="Rand efter var n:te färg"
              varde={regel.randVarje}
              min={1}
              max={Math.max(1, antalFargerFörRand)}
              onChange={(v) => set({ randVarje: v })}
            />
            <Reglage
              label="Randbredd"
              varde={regel.randBredd}
              min={1}
              max={10}
              enhet="varv"
              onChange={(v) => set({ randBredd: v })}
            />
            <div>
              <span className="text-sm text-neutral-700 block mb-1">Randfärg</span>
              <div className="flex flex-wrap gap-1.5">
                {palett.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => set({ randFargIndex: i })}
                    className={`w-7 h-7 rounded-full border transition-transform ${
                      regel.randFargIndex === i
                        ? 'ring-2 ring-neutral-800 ring-offset-1 scale-110'
                        : 'border-neutral-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: f.hex }}
                    title={f.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ReglageProps {
  label: string;
  varde: number;
  min: number;
  max: number;
  enhet?: string;
  onChange: (v: number) => void;
}

/** En reglage-rad: etikett, stort slider (tummvänligt) och en talruta. */
function Reglage({ label, varde, min, max, enhet, onChange }: ReglageProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-neutral-700">{label}</span>
        <span className="text-sm font-mono text-neutral-900 tabular-nums">
          {varde}
          {enhet ? ` ${enhet}` : ''}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          value={varde}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-6 accent-neutral-700 cursor-pointer"
        />
        <input
          type="number"
          min={min}
          max={max}
          value={varde}
          onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
          className="w-16 px-2 py-1 text-sm font-mono rounded border border-neutral-300 focus:ring-2 focus:ring-neutral-400 focus:outline-none"
        />
      </div>
    </div>
  );
}

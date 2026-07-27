import {
  ChevronDown,
  ChevronRight,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { Block, Monster, Regel } from '@/types/builder';
import { blockHojd, nyId, regelTillBlock } from '@/services/builder';
import Regelbyggare, { standardRegel } from './Regelbyggare';
import VarvLista from './VarvLista';

interface BlockListaProps {
  monster: Monster;
  onChange: (monster: Monster) => void;
}

/** Startvarv (1-baserat) för varje block, så varvintervallen stämmer med provlappen. */
function blockStartVarv(monster: Monster): number[] {
  const start: number[] = [];
  let löpande = 1;
  for (const b of monster.block) {
    start.push(löpande);
    const upprep = b.fyllTillMal ? 1 : Math.max(0, b.upprepningar); // för etikett; faktisk höjd beräknas i modellen
    löpande += blockHojd(b) * Math.max(1, upprep);
  }
  return start;
}

export default function BlockLista({ monster, onChange }: BlockListaProps) {
  const setBlock = (id: string, patch: Partial<Block>) =>
    onChange({ ...monster, block: monster.block.map((b) => (b.id === id ? { ...b, ...patch } : b)) });

  const laggTillBlock = () => {
    const regel = standardRegel();
    const ny = regelTillBlock(regel, monster.palett, `Block ${monster.block.length + 1}`);
    ny.regel = regel;
    onChange({ ...monster, block: [...monster.block, ny] });
  };

  const dubblera = (id: string) => {
    const original = monster.block.find((b) => b.id === id);
    if (!original) return;
    const kopia: Block = {
      ...original,
      id: nyId('block'),
      namn: `${original.namn} (kopia)`,
      segment: original.segment.map((s) => ({ ...s, id: nyId('seg') })),
    };
    const index = monster.block.findIndex((b) => b.id === id);
    const block = [...monster.block];
    block.splice(index + 1, 0, kopia);
    onChange({ ...monster, block });
  };

  const flytta = (id: string, riktning: -1 | 1) => {
    const index = monster.block.findIndex((b) => b.id === id);
    const nytt = index + riktning;
    if (nytt < 0 || nytt >= monster.block.length) return;
    const block = [...monster.block];
    [block[index], block[nytt]] = [block[nytt], block[index]];
    onChange({ ...monster, block });
  };

  const taBort = (id: string) => {
    if (monster.block.length <= 1) return; // behåll minst ett block
    onChange({ ...monster, block: monster.block.filter((b) => b.id !== id) });
  };

  const startVarv = blockStartVarv(monster);

  return (
    <div className="space-y-3">
      {monster.block.map((block, i) => (
        <BlockKort
          key={block.id}
          block={block}
          palett={monster.palett}
          startVarv={startVarv[i]}
          forst={i === 0}
          sist={i === monster.block.length - 1}
          enda={monster.block.length === 1}
          onSet={(patch) => setBlock(block.id, patch)}
          onDubblera={() => dubblera(block.id)}
          onFlytta={(r) => flytta(block.id, r)}
          onTaBort={() => taBort(block.id)}
        />
      ))}

      <button
        type="button"
        onClick={laggTillBlock}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-neutral-300 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
      >
        <Plus className="w-4 h-4" /> Lägg till block
      </button>
    </div>
  );
}

interface BlockKortProps {
  block: Block;
  palett: Monster['palett'];
  startVarv: number;
  forst: boolean;
  sist: boolean;
  enda: boolean;
  onSet: (patch: Partial<Block>) => void;
  onDubblera: () => void;
  onFlytta: (r: -1 | 1) => void;
  onTaBort: () => void;
}

function BlockKort({
  block,
  palett,
  startVarv,
  forst,
  sist,
  enda,
  onSet,
  onDubblera,
  onFlytta,
  onTaBort,
}: BlockKortProps) {
  const hopfalld = !!block.hopfalld;
  const höjd = blockHojd(block);

  // När regeln ändras bygger vi om segmenten men behåller blockets id/namn/upprepningar.
  const onRegelChange = (regel: Regel) => {
    const nytt = regelTillBlock(regel, palett);
    onSet({ regel, segment: nytt.segment });
  };

  return (
    <div id={`block-${block.id}`} className="rounded-xl border border-neutral-200 bg-white overflow-hidden scroll-mt-20">
      {/* Rubrikrad */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border-b border-neutral-200">
        <button
          type="button"
          onClick={() => onSet({ hopfalld: !hopfalld })}
          className="text-neutral-500 hover:text-neutral-800 p-0.5"
          aria-label={hopfalld ? 'Fäll ut' : 'Fäll ihop'}
        >
          {hopfalld ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <input
          value={block.namn}
          onChange={(e) => onSet({ namn: e.target.value })}
          className="flex-1 min-w-0 bg-transparent font-display font-semibold text-neutral-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-neutral-300 rounded px-1"
        />
        <span className="text-xs font-mono text-neutral-400 tabular-nums whitespace-nowrap">
          {höjd} varv{block.fyllTillMal ? ' × auto' : block.upprepningar > 1 ? ` × ${block.upprepningar}` : ''}
        </span>
        <div className="flex items-center">
          <IconKnapp title="Flytta upp" disabled={forst} onClick={() => onFlytta(-1)}>
            <ArrowUp className="w-4 h-4" />
          </IconKnapp>
          <IconKnapp title="Flytta ner" disabled={sist} onClick={() => onFlytta(1)}>
            <ArrowDown className="w-4 h-4" />
          </IconKnapp>
          <IconKnapp title="Duplicera" onClick={onDubblera}>
            <Copy className="w-4 h-4" />
          </IconKnapp>
          <IconKnapp title="Ta bort" disabled={enda} onClick={onTaBort}>
            <Trash2 className="w-4 h-4" />
          </IconKnapp>
        </div>
      </div>

      {!hopfalld && (
        <div className="p-3 space-y-4">
          {/* Regelbyggaren */}
          <details className="group" open>
            <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-neutral-700 list-none">
              <SlidersHorizontal className="w-4 h-4" />
              Regel
            </summary>
            <div className="mt-3">
              <Regelbyggare regel={block.regel ?? standardRegel()} palett={palett} onChange={onRegelChange} />
            </div>
          </details>

          {/* Segmenten (varvlistan) */}
          <div>
            <span className="text-sm font-medium text-neutral-700 block mb-2">Varvgrupper</span>
            <VarvLista
              segment={block.segment}
              palett={palett}
              startVarv={startVarv}
              onChange={(segment) => onSet({ segment })}
            />
          </div>

          {/* Upprepningar / fyll till mål */}
          <div className="flex items-center gap-4 flex-wrap pt-1 border-t border-neutral-100">
            <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-neutral-300"
                checked={!!block.fyllTillMal}
                onChange={(e) => onSet({ fyllTillMal: e.target.checked })}
              />
              Fyll till målhöjden
            </label>
            {!block.fyllTillMal && (
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                Upprepningar
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={block.upprepningar}
                  onChange={(e) => onSet({ upprepningar: Math.max(1, Number(e.target.value) || 1) })}
                  className="w-16 px-2 py-1 text-sm font-mono rounded border border-neutral-300 focus:ring-2 focus:ring-neutral-400 focus:outline-none"
                />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function IconKnapp({
  children,
  title,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
    >
      {children}
    </button>
  );
}

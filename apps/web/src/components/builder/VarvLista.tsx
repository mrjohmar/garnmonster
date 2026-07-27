import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { Segment } from '@/types/builder';
import { YarnColor } from '@/types';
import { nyId } from '@/services/builder';

interface VarvListaProps {
  segment: Segment[];
  palett: YarnColor[];
  startVarv: number; // första varvnumret för detta block (för intervall-etikett)
  onChange: (segment: Segment[]) => void;
}

/**
 * Dragbar lista av segment (varvgrupper). Fungerar med både mus och finger (pointer/touch).
 * Markera flera segment och färglägg dem samtidigt.
 */
export default function VarvLista({ segment, palett, startVarv, onChange }: VarvListaProps) {
  const [markerade, setMarkerade] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    // Kort fördröjning/avstånd så att klick och drag inte krockar (även på touch).
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const från = segment.findIndex((s) => s.id === active.id);
    const till = segment.findIndex((s) => s.id === over.id);
    if (från === -1 || till === -1) return;
    onChange(arrayMove(segment, från, till));
  };

  const uppdatera = (id: string, patch: Partial<Segment>) =>
    onChange(segment.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const taBort = (id: string) => {
    onChange(segment.filter((s) => s.id !== id));
    setMarkerade((m) => {
      const n = new Set(m);
      n.delete(id);
      return n;
    });
  };

  const laggTill = () => {
    const sista = segment[segment.length - 1];
    onChange([
      ...segment,
      { id: nyId('seg'), fargId: sista?.fargId ?? palett[0]?.id ?? '', varv: 2, rand: false },
    ]);
  };

  const togglaMarkering = (id: string) =>
    setMarkerade((m) => {
      const n = new Set(m);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const fargläggMarkerade = (fargId: string) => {
    onChange(segment.map((s) => (markerade.has(s.id) ? { ...s, fargId } : s)));
  };

  // Räkna ut varvintervall per segment.
  let löpande = startVarv;
  const intervall = segment.map((s) => {
    const från = löpande;
    const till = löpande + Math.max(1, s.varv) - 1;
    löpande = till + 1;
    return { från, till };
  });

  return (
    <div className="space-y-2">
      {markerade.size > 0 && (
        <div className="flex items-center gap-2 flex-wrap bg-neutral-100 rounded-lg px-3 py-2 text-sm">
          <span className="text-neutral-700">{markerade.size} markerade — färglägg:</span>
          {palett.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => fargläggMarkerade(f.id)}
              className="w-6 h-6 rounded-full border border-neutral-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: f.hex }}
              title={f.name}
            />
          ))}
          <button
            type="button"
            onClick={() => setMarkerade(new Set())}
            className="ml-auto text-neutral-500 hover:text-neutral-800 underline"
          >
            Avmarkera
          </button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={segment.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-1.5">
            {segment.map((s, i) => (
              <SegmentRad
                key={s.id}
                segment={s}
                palett={palett}
                intervall={intervall[i]}
                markerad={markerade.has(s.id)}
                onToggleMarkering={() => togglaMarkering(s.id)}
                onChange={(patch) => uppdatera(s.id, patch)}
                onTaBort={() => taBort(s.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={laggTill}
        className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 px-2 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
      >
        <Plus className="w-4 h-4" /> Lägg till varvgrupp
      </button>
    </div>
  );
}

interface SegmentRadProps {
  segment: Segment;
  palett: YarnColor[];
  intervall: { från: number; till: number };
  markerad: boolean;
  onToggleMarkering: () => void;
  onChange: (patch: Partial<Segment>) => void;
  onTaBort: () => void;
}

function SegmentRad({
  segment,
  palett,
  intervall,
  markerad,
  onToggleMarkering,
  onChange,
  onTaBort,
}: SegmentRadProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: segment.id,
  });
  const farg = palett.find((f) => f.id === segment.fargId);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const varvText =
    intervall.från === intervall.till ? `Varv ${intervall.från}` : `Varv ${intervall.från}–${intervall.till}`;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border bg-white px-2 py-2 ${
        markerad ? 'border-neutral-800 ring-1 ring-neutral-800' : 'border-neutral-200'
      }`}
    >
      <button
        type="button"
        className="touch-none cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-700 p-1"
        aria-label="Dra för att flytta"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <input
        type="checkbox"
        checked={markerad}
        onChange={onToggleMarkering}
        className="rounded border-neutral-300"
        aria-label="Markera varvgrupp"
      />

      <span className="w-24 text-xs font-mono text-neutral-500 tabular-nums">{varvText}</span>

      {/* Färgväljare */}
      <select
        value={segment.fargId}
        onChange={(e) => onChange({ fargId: e.target.value })}
        className="flex-1 min-w-0 text-sm rounded border border-neutral-300 px-2 py-1 bg-white focus:ring-2 focus:ring-neutral-400 focus:outline-none"
        style={{ borderLeft: `10px solid ${farg?.hex ?? '#ccc'}` }}
      >
        {palett.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      {/* Antal varv */}
      <input
        type="number"
        min={1}
        max={99}
        value={segment.varv}
        onChange={(e) => onChange({ varv: Math.max(1, Math.min(99, Number(e.target.value) || 1)) })}
        className="w-14 px-2 py-1 text-sm font-mono rounded border border-neutral-300 focus:ring-2 focus:ring-neutral-400 focus:outline-none"
        aria-label="Antal varv"
      />

      {/* Rand-flagga */}
      <label className="flex items-center gap-1 text-xs text-neutral-600 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={segment.rand}
          onChange={(e) => onChange({ rand: e.target.checked })}
          className="rounded border-neutral-300"
        />
        rand
      </label>

      <button
        type="button"
        onClick={onTaBort}
        className="text-neutral-400 hover:text-red-600 p-1"
        aria-label="Ta bort varvgrupp"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </li>
  );
}

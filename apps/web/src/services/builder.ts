// Modell-logik för mönsterbyggaren. Rena funktioner — inget React, inga sidoeffekter.
//
// Grundprincip: varvnummer HÄRLEDS av expanderaMonster(). Flyttar man ett segment
// eller ändrar regeln räknas allt om. Överskrivningar (handpåläggning) läggs ovanpå.

import { YarnColor } from '@/types';
import { Block, BuilderRow, Monster, Regel, Segment } from '@/types/builder';

/** Genererar ett kort unikt id. */
export function nyId(prefix = 'id'): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rnd}`;
}

/** Höjden (antal varv) för EN upprepning av ett block. */
export function blockHojd(block: Block): number {
  return block.segment.reduce((sum, s) => sum + Math.max(0, s.varv), 0);
}

/** Antal upprepningar ett block faktiskt bidrar med (fyllTillMal räknas ut mot återstående höjd). */
function effektivaUpprepningar(block: Block, kvarTillMal: number): number {
  const h = blockHojd(block);
  if (block.fyllTillMal) {
    if (h <= 0) return 0;
    return Math.max(0, Math.floor(kvarTillMal / h));
  }
  return Math.max(0, block.upprepningar);
}

/**
 * Expanderar mönstret till en lista varv (1-baserad numrering, uppifrån och ned i provlappen).
 * Överskrivningar appliceras sist och markeras.
 */
export function expanderaMonster(m: Monster): BuilderRow[] {
  const fargById = new Map(m.palett.map((f) => [f.id, f]));
  const rader: Omit<BuilderRow, 'varv' | 'overskriven'>[] = [];

  let producerat = 0;
  for (const block of m.block) {
    const upprep = effektivaUpprepningar(block, Math.max(0, m.malVarv - producerat));
    for (let u = 0; u < upprep; u++) {
      for (const seg of block.segment) {
        const farg = fargById.get(seg.fargId);
        for (let v = 0; v < Math.max(0, seg.varv); v++) {
          rader.push({
            blockId: block.id,
            blockNamn: block.namn,
            segmentId: seg.id,
            fargId: seg.fargId,
            hex: farg?.hex ?? '#cccccc',
            fargNamn: farg?.name ?? 'Okänd färg',
            rand: seg.rand,
          });
          producerat++;
        }
      }
    }
  }

  // Riktning: nerifrån bygger sekvensen från botten -> vänd färgföljden.
  if (m.riktning === 'nerifran') rader.reverse();

  // Numrera och applicera överskrivningar ovanpå.
  return rader.map((r, i) => {
    const varv = i + 1;
    const overId = m.overskrivningar[varv];
    if (overId && overId !== r.fargId) {
      const farg = fargById.get(overId);
      return {
        ...r,
        varv,
        fargId: overId,
        hex: farg?.hex ?? r.hex,
        fargNamn: farg?.name ?? r.fargNamn,
        overskriven: true,
      };
    }
    return { ...r, varv, overskriven: false };
  });
}

/** Faktisk höjd (antal varv) som mönstret ger just nu. */
export function faktiskHojd(m: Monster): number {
  let producerat = 0;
  for (const block of m.block) {
    producerat += effektivaUpprepningar(block, Math.max(0, m.malVarv - producerat)) * blockHojd(block);
  }
  return producerat;
}

/** Skillnad mot målhöjden. Positivt = det saknas varv, negativt = det är för många. */
export function aterstar(m: Monster): number {
  return m.malVarv - faktiskHojd(m);
}

export interface FyllForslag {
  kvar: number; // hur många varv som saknas (kan vara negativt)
  passar: boolean; // sant om faktisk höjd == mål
  forslag: string; // konkret åtgärd på svenska
}

/**
 * Ger ett konkret förslag på hur man fyller sista biten till målhöjden —
 * i stället för att bara visa en siffra i rött.
 */
export function fyllForslag(m: Monster): FyllForslag {
  const kvar = aterstar(m);
  if (kvar === 0) return { kvar, passar: true, forslag: 'Mönstret når exakt målhöjden.' };
  if (kvar > 0) {
    const sistaBlock = m.block[m.block.length - 1];
    const h = sistaBlock ? blockHojd(sistaBlock) : 0;
    if (sistaBlock && h > 0 && kvar % h === 0) {
      const extra = kvar / h;
      return {
        kvar,
        passar: false,
        forslag: `Lägg ${extra} upprepning${extra === 1 ? '' : 'ar'} till av "${sistaBlock.namn}" så når du ${m.malVarv} varv.`,
      };
    }
    return {
      kvar,
      passar: false,
      forslag: `Det saknas ${kvar} varv. Lägg t.ex. ett avslutande block på ${kvar} varv (gärna ett randvarv) för att nå ${m.malVarv}.`,
    };
  }
  return {
    kvar,
    passar: false,
    forslag: `Mönstret är ${-kvar} varv för högt. Minska upprepningarna i sista blocket eller sänk antalet varv per färg.`,
  };
}

/** Bygger ett block ur regelbyggarens inställningar och den aktuella paletten. */
export function regelTillBlock(regel: Regel, palett: YarnColor[], namn = 'Block'): Block {
  const segment: Segment[] = [];
  const antal = Math.max(1, Math.min(regel.antalFarger, palett.length || regel.antalFarger));
  for (let i = 0; i < antal; i++) {
    const farg = palett[i % Math.max(1, palett.length)];
    const varv = regel.varvPerFargIndividuell?.[i] ?? regel.varvPerFarg;
    segment.push({ id: nyId('seg'), fargId: farg?.id ?? '', varv: Math.max(1, varv), rand: false });

    // Rand efter var n:te färg i rotationen (randVarje = antal färger mellan ränder).
    if (regel.randPa && regel.randVarje > 0 && (i + 1) % regel.randVarje === 0) {
      const randFarg = palett[regel.randFargIndex % Math.max(1, palett.length)];
      segment.push({
        id: nyId('seg'),
        fargId: randFarg?.id ?? '',
        varv: Math.max(1, regel.randBredd),
        rand: true,
      });
    }
  }
  return { id: nyId('block'), namn, segment, upprepningar: 1 };
}

// ---------------------------------------------------------------------------
// Palett-operationer. Returnerar alltid ett nytt Monster (immutabelt).
// ---------------------------------------------------------------------------

/** Byter en färg i paletten (namn/hex) — alla varv som använder den uppdateras automatiskt. */
export function uppdateraFarg(m: Monster, fargId: string, patch: Partial<YarnColor>): Monster {
  return { ...m, palett: m.palett.map((f) => (f.id === fargId ? { ...f, ...patch } : f)) };
}

/** Byter plats på två färger i hela mönstret (segment + överskrivningar följer med). */
export function bytPlatsPaFarger(m: Monster, idA: string, idB: string): Monster {
  const swap = (id: string) => (id === idA ? idB : id === idB ? idA : id);
  return {
    ...m,
    block: m.block.map((b) => ({
      ...b,
      segment: b.segment.map((s) => ({ ...s, fargId: swap(s.fargId) })),
    })),
    overskrivningar: Object.fromEntries(
      Object.entries(m.overskrivningar).map(([v, id]) => [v, swap(id)])
    ),
  };
}

/** Slumpar om ordningen på färgerna i paletten. seed via extern slump (Fisher–Yates). */
export function slumpaOrdning(m: Monster): Monster {
  const p = [...m.palett];
  for (let i = p.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return { ...m, palett: p };
}

/** Släpper alla överskrivningar (går tillbaka till ren regel). */
export function slappOverskrivningar(m: Monster): Monster {
  return { ...m, overskrivningar: {} };
}

// ---------------------------------------------------------------------------
// Exempelmönster — laddas vid start så sidan aldrig är tom.
// Talen nedan är STARTVÄRDEN, inte hårdkodad logik.
// ---------------------------------------------------------------------------

const EXEMPEL_FARGER: YarnColor[] = [
  { id: nyId('f'), name: 'Dimblå', hex: '#7c98b3' },
  { id: nyId('f'), name: 'Salvia', hex: '#9dc183' },
  { id: nyId('f'), name: 'Sand', hex: '#e6d5b8' },
  { id: nyId('f'), name: 'Terrakotta', hex: '#c06b52' },
  { id: nyId('f'), name: 'Plommon', hex: '#7d5a6b' },
  { id: nyId('f'), name: 'Antracit', hex: '#2f2a33' }, // randfärg
];

/**
 * Bygger exempelmönstret: fem tvåvarvspar + ett randvarv = ett block på 11 varv,
 * upprepat till målhöjden. Alla mått är parametrar med startvärden.
 */
export function exempelMonster(opts?: {
  maskor?: number;
  malVarv?: number;
  varvPerFarg?: number;
  parPerBlock?: number;
}): Monster {
  const maskor = opts?.maskor ?? 325;
  const malVarv = opts?.malVarv ?? 210;
  const varvPerFarg = opts?.varvPerFarg ?? 2;
  const parPerBlock = opts?.parPerBlock ?? 5;

  const palett = EXEMPEL_FARGER.map((f) => ({ ...f }));
  const randFargId = palett[palett.length - 1].id;

  const segment: Segment[] = [];
  for (let i = 0; i < parPerBlock; i++) {
    segment.push({ id: nyId('seg'), fargId: palett[i % (palett.length - 1)].id, varv: varvPerFarg, rand: false });
  }
  segment.push({ id: nyId('seg'), fargId: randFargId, varv: 1, rand: true });

  const block: Block = {
    id: nyId('block'),
    namn: 'Grundblock',
    segment,
    upprepningar: 1,
    fyllTillMal: true,
  };

  return {
    maskor,
    malVarv,
    palett,
    block: [block],
    overskrivningar: {},
    riktning: 'uppifran',
    maskprov: { maskor: 22, varv: 30 },
  };
}

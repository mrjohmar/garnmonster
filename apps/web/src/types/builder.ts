// Datamodell för mönsterbyggaren.
//
// Kärnan är en *regel* som genererar varv, plus *överskrivningar* (handpåläggning) ovanpå.
// Två principer:
//   1. Varvnummer är ALLTID härledda av expanderaMonster() — de lagras aldrig.
//   2. Regel och undantag lever sida vid sida: ändrar man regeln finns överskrivningarna kvar
//      och markeras som avvikelser.
//
// Färg återanvänder appens befintliga YarnColor (hex-modell), se types/index.ts.
import { YarnColor } from './index';

/** Ett segment är en sammanhängande grupp varv i EN färg, t.ex. "2 varv rosa". */
export interface Segment {
  id: string;
  fargId: string; // pekar på en färg i paletten (YarnColor.id)
  varv: number; // hur många varv detta segment är
  rand: boolean; // markerar randvarv — används för snabbval, statistik och rand-varningar
}

/** Ett block är en följd av segment som kan upprepas, t.ex. "fem tvåvarvspar + en rand". */
export interface Block {
  id: string;
  namn: string;
  segment: Segment[];
  upprepningar: number;
  /** Om sant räknas upprepningar ut automatiskt för att fylla till målhöjden. */
  fyllTillMal?: boolean;
  /** Hopfälld i listan (påverkar bara UI, inte mönstret). */
  hopfalld?: boolean;
  /** Regelbyggarens senaste inställningar för blocket (om det byggts via regel). */
  regel?: Regel;
}

/**
 * Regelbyggarens inställningar. Genererar ett block via regelTillBlock().
 * Regeln är en bekväm ingång — det som faktiskt lagras är blockets segment.
 */
export interface Regel {
  antalFarger: number; // 2–12 färger i rotationen
  varvPerFarg: number; // gemensamt antal varv per färg (1–20)
  /** Valfritt: eget antal varv per färg. Index följer rotationen. */
  varvPerFargIndividuell?: number[];
  randPa: boolean;
  /** Rand efter var n:te varv (0 = efter varje varv i rotationen). */
  randVarje: number;
  randBredd: number; // hur många varv randen är
  /** Vilken färg i paletten randen tar (index). */
  randFargIndex: number;
}

/** Maskprov per 10 cm — låter provlappen visas i verklig proportion. */
export interface Maskprov {
  maskor: number; // maskor per 10 cm
  varv: number; // varv per 10 cm
}

export type Riktning = 'uppifran' | 'nerifran';

/** Hela mönstret. Allt annat härleds från detta. */
export interface Monster {
  maskor: number;
  malVarv: number; // önskad höjd, används som facit mot faktiskt antal
  palett: YarnColor[];
  block: Block[];
  /** varvnummer (1-baserat) -> fargId. Handpåläggning ovanpå regeln. */
  overskrivningar: Record<number, string>;
  riktning: Riktning;
  maskprov?: Maskprov;
}

/**
 * Ett expanderat varv — resultatet av expanderaMonster(). Aldrig lagrat.
 * segmentId är null när varvet kommer från en överskrivning som inte hör till något segment.
 */
export interface BuilderRow {
  varv: number; // 1-baserat varvnummer
  blockId: string;
  blockNamn: string;
  segmentId: string | null;
  fargId: string;
  hex: string;
  fargNamn: string;
  rand: boolean;
  overskriven: boolean; // sant om en överskrivning ändrat färgen från regelns
}

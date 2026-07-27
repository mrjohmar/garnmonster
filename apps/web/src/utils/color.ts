// Färghjälpare för hela appen.
//
// adjustBrightness och getContrastColor är lyfta ur PatternPreview.tsx så att både
// temperaturvirkningen och mönsterbyggaren använder samma logik. Resten är nytt för
// mönsterbyggaren: CIELAB/deltaE för fotomatchning, luminans för rand-varningen, samt
// palettgenerering och bildkvantisering.

export interface Rgb {
  r: number;
  g: number;
  b: number;
}
export interface Lab {
  L: number;
  a: number;
  b: number;
}

/** Normaliserar en hexsträng till "#rrggbb" (gemener). Returnerar null om ogiltig. */
export function normaliseraHex(hex: string): string | null {
  let h = hex.trim().toLowerCase();
  if (!h.startsWith('#')) h = '#' + h;
  // kort form #abc -> #aabbcc
  if (/^#[0-9a-f]{3}$/.test(h)) {
    h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  return /^#[0-9a-f]{6}$/.test(h) ? h : null;
}

export function hexTillRgb(hex: string): Rgb {
  const h = normaliseraHex(hex) ?? '#000000';
  const num = parseInt(h.slice(1), 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function rgbTillHex({ r, g, b }: Rgb): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Justerar ljusheten på en hexfärg med ±percent (−100..100). Lyft ur PatternPreview. */
export function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexTillRgb(hex);
  const amt = Math.round(2.55 * percent);
  return rgbTillHex({ r: r + amt, g: g + amt, b: b + amt });
}

/**
 * Relativ luminans (WCAG, gammakorrigerad) 0–1. Används både för kontrasttext
 * och för rand-varningen (jämför ljushet, inte hex-avstånd).
 */
export function relativLuminans(hex: string): number {
  const { r, g, b } = hexTillRgb(hex);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Returnerar '#1f2937' eller '#ffffff' beroende på vad som syns bäst mot hex. */
export function getContrastColor(hex: string): string {
  // Enkel snabb luminans (samma som gamla PatternPreview), räcker för textkontrast.
  const { r, g, b } = hexTillRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1f2937' : '#ffffff';
}

/**
 * Sant om två intilliggande färger ligger så nära i ljushet att randen försvinner i stickat.
 * Jämför relativ luminans, inte hex-avstånd.
 */
export function randForsvinner(hexA: string, hexB: string, troskel = 0.12): boolean {
  return Math.abs(relativLuminans(hexA) - relativLuminans(hexB)) < troskel;
}

// ---------------------------------------------------------------------------
// CIELAB + deltaE (CIEDE2000) för fotomatchning mot leverantörens färgkarta.
// ---------------------------------------------------------------------------

export function rgbTillLab({ r, g, b }: Rgb): Lab {
  // sRGB -> linjär
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const rl = lin(r);
  const gl = lin(g);
  const bl = lin(b);
  // linjär RGB -> XYZ (D65)
  let x = rl * 0.4124 + gl * 0.3576 + bl * 0.1805;
  let y = rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
  let z = rl * 0.0193 + gl * 0.1192 + bl * 0.9505;
  // normalisera mot D65 vitpunkt
  x /= 0.95047;
  y /= 1.0;
  z /= 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function hexTillLab(hex: string): Lab {
  return rgbTillLab(hexTillRgb(hex));
}

/** CIEDE2000 färgskillnad mellan två Lab-färger. Lägre = mer lika. */
export function deltaE(lab1: Lab, lab2: Lab): number {
  const { L: L1, a: a1, b: b1 } = lab1;
  const { L: L2, a: a2, b: b2 } = lab2;
  const kL = 1;
  const kC = 1;
  const kH = 1;
  const deg2rad = (d: number) => (d * Math.PI) / 180;
  const rad2deg = (r: number) => (r * 180) / Math.PI;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cbar = (C1 + C2) / 2;
  const Cbar7 = Math.pow(Cbar, 7);
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + Math.pow(25, 7))));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);
  const h1p = Math.atan2(b1, a1p) === 0 ? 0 : (rad2deg(Math.atan2(b1, a1p)) + 360) % 360;
  const h2p = Math.atan2(b2, a2p) === 0 ? 0 : (rad2deg(Math.atan2(b2, a2p)) + 360) % 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    const diff = h2p - h1p;
    if (Math.abs(diff) <= 180) dhp = diff;
    else if (diff > 180) dhp = diff - 360;
    else dhp = diff + 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(deg2rad(dhp) / 2);

  const Lbarp = (L1 + L2) / 2;
  const Cbarp = (C1p + C2p) / 2;
  let hbarp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) > 180) {
      if (h1p + h2p < 360) hbarp = (h1p + h2p + 360) / 2;
      else hbarp = (h1p + h2p - 360) / 2;
    } else {
      hbarp = (h1p + h2p) / 2;
    }
  }
  const T =
    1 -
    0.17 * Math.cos(deg2rad(hbarp - 30)) +
    0.24 * Math.cos(deg2rad(2 * hbarp)) +
    0.32 * Math.cos(deg2rad(3 * hbarp + 6)) -
    0.2 * Math.cos(deg2rad(4 * hbarp - 63));
  const dTheta = 30 * Math.exp(-Math.pow((hbarp - 275) / 25, 2));
  const Cbarp7 = Math.pow(Cbarp, 7);
  const Rc = 2 * Math.sqrt(Cbarp7 / (Cbarp7 + Math.pow(25, 7)));
  const Sl = 1 + (0.015 * Math.pow(Lbarp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbarp - 50, 2));
  const Sc = 1 + 0.045 * Cbarp;
  const Sh = 1 + 0.015 * Cbarp * T;
  const Rt = -Math.sin(deg2rad(2 * dTheta)) * Rc;

  return Math.sqrt(
    Math.pow(dLp / (kL * Sl), 2) +
      Math.pow(dCp / (kC * Sc), 2) +
      Math.pow(dHp / (kH * Sh), 2) +
      Rt * (dCp / (kC * Sc)) * (dHp / (kH * Sh))
  );
}

export interface Matchning<T> {
  farg: T;
  avstand: number; // deltaE
  /** 0–100, ungefärlig säkerhet. deltaE < ~2 = mycket säker, > ~10 = osäker. */
  sakerhet: number;
}

/** Hittar närmaste färg i en lista via deltaE (CIEDE2000). */
export function narmasteFarg<T extends { hex: string }>(hex: string, palett: T[]): Matchning<T> | null {
  if (palett.length === 0) return null;
  const mål = hexTillLab(hex);
  let bäst = palett[0];
  let bästAvstånd = Infinity;
  for (const f of palett) {
    const d = deltaE(mål, hexTillLab(f.hex));
    if (d < bästAvstånd) {
      bästAvstånd = d;
      bäst = f;
    }
  }
  // deltaE 0 -> 100 %, deltaE 12+ -> ~0 %
  const sakerhet = Math.max(0, Math.min(100, Math.round(100 - (bästAvstånd / 12) * 100)));
  return { farg: bäst, avstand: bästAvstånd, sakerhet };
}

// ---------------------------------------------------------------------------
// Palettgenerering — designhjälpen.
// ---------------------------------------------------------------------------

/** Skala mellan två toner (ombré) i n steg, inklusive ändpunkterna. */
export function genereraOmbre(hexA: string, hexB: string, n: number): string[] {
  if (n < 1) return [];
  if (n === 1) return [hexA];
  const a = hexTillLab(hexA);
  const b = hexTillLab(hexB);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const lab: Lab = { L: a.L + (b.L - a.L) * t, a: a.a + (b.a - a.a) * t, b: a.b + (b.b - a.b) * t };
    out.push(labTillHex(lab));
  }
  return out;
}

/**
 * Komplementpalett utifrån en bas: basfärgen plus toner runt hjulet (jämnt fördelade nyanser).
 * n=2 ger bas + komplement (180°), n=3 ger triad, osv.
 */
export function genereraKomplement(hexBas: string, n: number): string[] {
  const { h, s, l } = hexTillHsl(hexBas);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const nyH = (h + (360 / n) * i) % 360;
    out.push(hslTillHex({ h: nyH, s, l }));
  }
  return out;
}

// Lab -> hex (via XYZ -> sRGB)
export function labTillHex(lab: Lab): string {
  const fy = (lab.L + 16) / 116;
  const fx = lab.a / 500 + fy;
  const fz = fy - lab.b / 200;
  const f3 = (t: number) => {
    const t3 = t * t * t;
    return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
  };
  let x = f3(fx) * 0.95047;
  let y = f3(fy) * 1.0;
  let z = f3(fz) * 1.08883;
  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let b = x * 0.0557 + y * -0.204 + z * 1.057;
  const gam = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
  return rgbTillHex({ r: gam(r) * 255, g: gam(g) * 255, b: gam(b) * 255 });
}

interface Hsl {
  h: number;
  s: number;
  l: number;
}
export function hexTillHsl(hex: string): Hsl {
  const { r, g, b } = hexTillRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}
export function hslTillHex({ h, s, l }: Hsl): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  return rgbTillHex({ r: (rp + m) * 255, g: (gp + m) * 255, b: (bp + m) * 255 });
}

// ---------------------------------------------------------------------------
// Bildplock — kvantisering och punktplock ur foto (canvas ImageData).
// ---------------------------------------------------------------------------

/**
 * Föreslår de dominerande färgerna i en bild med median cut på nedskalade pixlar.
 * imageData bör vara en nedskalad bild (~100×100). Returnerar upp till k hexfärger.
 */
export function kvantiseraFarger(imageData: ImageData, k: number): string[] {
  const pixlar: Rgb[] = [];
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue; // hoppa över transparenta
    pixlar.push({ r: d[i], g: d[i + 1], b: d[i + 2] });
  }
  if (pixlar.length === 0) return [];

  // median cut: dela lådan längs den kanal med störst spridning tills vi har k lådor
  let lådor: Rgb[][] = [pixlar];
  while (lådor.length < k) {
    // hitta lådan med störst spridning
    let bästIndex = -1;
    let bästSpridning = -1;
    for (let i = 0; i < lådor.length; i++) {
      if (lådor[i].length < 2) continue;
      const spridning = kanalSpridning(lådor[i]);
      if (spridning.max > bästSpridning) {
        bästSpridning = spridning.max;
        bästIndex = i;
      }
    }
    if (bästIndex === -1) break;
    const låda = lådor[bästIndex];
    const kanal = kanalSpridning(låda).kanal;
    låda.sort((p1, p2) => p1[kanal] - p2[kanal]);
    const mitt = Math.floor(låda.length / 2);
    lådor.splice(bästIndex, 1, låda.slice(0, mitt), låda.slice(mitt));
  }

  return lådor
    .filter((l) => l.length > 0)
    .map((l) => {
      const medel = l.reduce(
        (acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }),
        { r: 0, g: 0, b: 0 }
      );
      return rgbTillHex({ r: medel.r / l.length, g: medel.g / l.length, b: medel.b / l.length });
    });
}

function kanalSpridning(pixlar: Rgb[]): { kanal: keyof Rgb; max: number } {
  const kanaler: (keyof Rgb)[] = ['r', 'g', 'b'];
  let bästKanal: keyof Rgb = 'r';
  let bästMax = -1;
  for (const kanal of kanaler) {
    let min = 255;
    let max = 0;
    for (const p of pixlar) {
      if (p[kanal] < min) min = p[kanal];
      if (p[kanal] > max) max = p[kanal];
    }
    const spridning = max - min;
    if (spridning > bästMax) {
      bästMax = spridning;
      bästKanal = kanal;
    }
  }
  return { kanal: bästKanal, max: bästMax };
}

/**
 * Median av ett kvadratiskt område (radie r) runt (x, y) i originalskala.
 * Garn är texturerat — en enskild pixel kan träffa en högdager eller skugga.
 */
export function medianAvOmrade(imageData: ImageData, x: number, y: number, r = 7): string {
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (px < 0 || py < 0 || px >= imageData.width || py >= imageData.height) continue;
      const i = (py * imageData.width + px) * 4;
      if (imageData.data[i + 3] < 128) continue;
      rs.push(imageData.data[i]);
      gs.push(imageData.data[i + 1]);
      bs.push(imageData.data[i + 2]);
    }
  }
  if (rs.length === 0) return '#000000';
  const median = (arr: number[]) => {
    arr.sort((a, b) => a - b);
    return arr[Math.floor(arr.length / 2)];
  };
  return rgbTillHex({ r: median(rs), g: median(gs), b: median(bs) });
}

/**
 * Vitbalans: skala varje kanal så att referenspunkten blir neutralt grå.
 * Returnerar en funktion som korrigerar en hexfärg med samma faktorer.
 */
export function skapaVitbalans(referensHex: string): (hex: string) => string {
  const ref = hexTillRgb(referensHex);
  // undvik division med noll; sikta på grått = medelvärdet av referensens kanaler
  const mål = (ref.r + ref.g + ref.b) / 3;
  const fr = ref.r === 0 ? 1 : mål / ref.r;
  const fg = ref.g === 0 ? 1 : mål / ref.g;
  const fb = ref.b === 0 ? 1 : mål / ref.b;
  return (hex: string) => {
    const c = hexTillRgb(hex);
    return rgbTillHex({ r: c.r * fr, g: c.g * fg, b: c.b * fb });
  };
}

/** Plockar alla hexkoder ur fritext (fallback för leverantörshämtning). */
export function extraheraHex(text: string): string[] {
  const träffar = text.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
  const unika = new Set(träffar.map((h) => h.toLowerCase()));
  return Array.from(unika);
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Serverside-endpoint som hämtar en leverantörssida och plockar ut färgnamn + hexkoder.
// Görs på servern eftersom CORS hindrar webbläsaren från att hämta främmande sidor direkt.
//
// Parsern är generell först (regex över hela sidan). Domän-specifika parsers läggs i
// DOMAN_PARSERS — Fika Gicona har en tydlig plats nedan att fylla i när sajtens struktur
// bekräftats.

interface Farg {
  name: string;
  hex: string;
}

/** Plats för sajtspecifik parsning. Nyckeln matchas mot värdnamnet (utan www.). */
const DOMAN_PARSERS: Record<string, (html: string) => Farg[]> = {
  // TODO(Fika Gicona): fyll i när sajtens HTML bekräftats. Exempel på struktur:
  //   'fikagicona.se': (html) => { ...plocka färgnamn + hex ur produktkorten... },
};

/**
 * Generell parser: hittar alla hexkoder och gissar ett namn ur närliggande text.
 * Fungerar hyfsat på färgkarts-sidor där varje färg står nära sin hexkod.
 */
function generellParser(html: string): Farg[] {
  const utanScript = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');

  const farger: Farg[] = [];
  const sedda = new Set<string>();

  // 1) hex i text/attribut, med ev. föregående ord som namn
  const hexRe = /(?:([A-Za-zÅÄÖåäö0-9 '/-]{2,40})\s*[:#-]?\s*)?#([0-9a-fA-F]{6})\b/g;
  let m: RegExpExecArray | null;
  while ((m = hexRe.exec(utanScript)) !== null) {
    const hex = `#${m[2].toLowerCase()}`;
    if (sedda.has(hex)) continue;
    sedda.add(hex);
    const namn = (m[1] || '').trim().replace(/\s+/g, ' ');
    farger.push({ name: namn || hex, hex });
  }

  // 2) fallback: rgb(...) i css
  const rgbRe = /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/g;
  while ((m = rgbRe.exec(utanScript)) !== null) {
    const hex = rgbTillHex(Number(m[1]), Number(m[2]), Number(m[3]));
    if (sedda.has(hex)) continue;
    sedda.add(hex);
    farger.push({ name: hex, hex });
  }

  return farger;
}

function rgbTillHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = typeof req.query.url === 'string' ? req.query.url : '';
  if (!url) {
    res.status(400).json({ error: 'Ange en URL med ?url=' });
    return;
  }

  let värd: string;
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('fel protokoll');
    värd = u.hostname.replace(/^www\./, '');
  } catch {
    res.status(400).json({ error: 'Ogiltig URL.' });
    return;
  }

  try {
    const svar = await fetch(url, {
      headers: {
        // en vanlig user-agent så att sidor inte blockar oss direkt
        'User-Agent':
          'Mozilla/5.0 (compatible; GarnmonsterBot/1.0; +https://garnmonster.vercel.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!svar.ok) {
      res.status(502).json({ error: `Leverantörssidan svarade med ${svar.status}.` });
      return;
    }
    const html = await svar.text();
    const parser = DOMAN_PARSERS[värd] ?? generellParser;
    const colors = parser(html);

    // korta cachen så vi inte spammar leverantören
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json({ source: url, count: colors.length, colors });
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? `Kunde inte hämta sidan: ${e.message}` : 'Kunde inte hämta sidan.',
    });
  }
}

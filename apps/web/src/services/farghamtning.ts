// Klientsidan av färghämtningen. Servern (api/hamta-farger) gör själva HTTP-anropet
// eftersom CORS hindrar webbläsaren från att hämta leverantörens sida direkt.
import { YarnColor } from '@/types';
import { extraheraHex } from '@/utils/color';
import { nyId } from './builder';

export interface HamtatResultat {
  farger: YarnColor[];
  kalla: string;
}

/** Hämtar färger via serverside-endpointen. Kastar med ett läsbart felmeddelande. */
export async function hamtaFargerFranUrl(url: string): Promise<HamtatResultat> {
  const svar = await fetch(`/api/hamta-farger?url=${encodeURIComponent(url)}`);
  if (!svar.ok) {
    let meddelande = `Kunde inte hämta färger (${svar.status}).`;
    try {
      const data = await svar.json();
      if (data?.error) meddelande = data.error;
    } catch {
      // behåll standardmeddelandet
    }
    throw new Error(meddelande);
  }
  const data = await svar.json();
  const farger: YarnColor[] = (data.colors ?? []).map((c: { name?: string; hex: string }) => ({
    id: nyId('f'),
    name: c.name ?? c.hex,
    hex: c.hex,
  }));
  return { farger, kalla: url };
}

/** Fallback: plocka hexkoder ur inklistrad text, helt på klienten. */
export function fargerFranText(text: string): YarnColor[] {
  return extraheraHex(text).map((hex) => ({ id: nyId('f'), name: hex, hex }));
}

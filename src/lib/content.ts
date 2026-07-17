import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

// Reader Keystatic : lit le contenu (src/content/*.yaml) au moment du build.
// Aucune intégration serveur nécessaire — le site reste 100 % statique.
export const reader = createReader(process.cwd(), keystaticConfig);

/** Réglages du site (coordonnées) — utilisés par l'en-tête, le pied de page, etc. */
export async function getParametres() {
  const p = await reader.singletons.parametres.read();
  if (!p) throw new Error('Contenu manquant : src/content/parametres.yaml');
  return p;
}

/** Transforme un téléphone affiché ("06 95 34 10 70") en lien tel: ("+33695341070"). */
export function telHref(telephone: string): string {
  const digits = telephone.replace(/\D/g, '');
  return '+33' + digits.replace(/^0/, '');
}

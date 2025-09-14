import type { QualInputs, Dim } from './types';

// Mots vides français étendus
const STOP_WORDS = new Set([
  'le',
  'la',
  'les',
  'un',
  'une',
  'des',
  'de',
  'du',
  'dans',
  'et',
  'ou',
  'que',
  'qui',
  'pour',
  'par',
  'avec',
  'en',
  'au',
  'aux',
  'sur',
  'se',
  'ce',
  'cela',
  'ça',
  'je',
  'tu',
  'il',
  'elle',
  'on',
  'nous',
  'vous',
  'ils',
  'elles',
  'mon',
  'ma',
  'mes',
  'ton',
  'ta',
  'tes',
  'son',
  'sa',
  'ses',
  'notre',
  'votre',
  'leur',
  'leurs',
  'me',
  'te',
  'lui',
  'nous',
  'vous',
  'leur',
  'où',
  'dont',
  'quand',
  'comme',
  'si',
  'mais',
  'car',
  'donc',
  'très',
  'trop',
  'plus',
  'moins',
  'aussi',
  'encore',
  'déjà',
  'toujours',
  'jamais',
  'parfois',
  'souvent',
  'bien',
  'mal',
  'mieux',
  'beaucoup',
  'peu',
  'assez',
  'quelque',
  'quelques',
  'chaque',
  'tout',
  'tous',
  'toute',
  'toutes',
  'autre',
  'autres',
  'même',
  'mêmes',
  'tel',
  'telle',
  'tels',
  'telles',
  'quel',
  'quelle',
  'quels',
  'quelles',
  'lequel',
  'laquelle',
  'lesquels',
  'lesquelles',
  'celui',
  'celle',
  'ceux',
  'celles',
  'ceci',
  'cela',
  'être',
  'avoir',
  'faire',
  'aller',
  'venir',
  'voir',
  'savoir',
  'pouvoir',
  'vouloir',
  'devoir',
  'dire',
  'prendre',
  'vraiment',
  'plutôt',
  'surtout',
  'depuis',
  'pendant',
  'avant',
  'après',
  'toujours',
  'jamais',
  'aime',
  'aimer',
  'adore',
  'adorer',
  'préfère',
  'préférer',
  'pense',
  'penser',
  'crois',
  'croire',
  'trouve',
  'trouver',
]);

// Normalisation française robuste
const normalizeFr = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, ''); // enlève diacritiques (é→e, à→a, etc.)

// Segmentation robuste avec fallback
function segmentFr(text: string): string[] {
  try {
    // Segmente proprement les mots (FR) y compris apostrophes
    const segmenter = new Intl.Segmenter('fr', { granularity: 'word' });
    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  } catch {
    // Fallback pour navigateurs sans support Intl.Segmenter
    return text.split(/[\s-]+/g);
  }
}

// Tokenisation française améliorée
function tokenize(text: string): string[] {
  const normalized = normalizeFr(text).replace(/[^\p{L}\s'-]/gu, ' ');
  const raw = segmentFr(normalized);

  return raw
    .map((word) => word.replace(/^[^a-z]+|[^a-z]+$/g, '')) // trim non-letters
    .filter(Boolean)
    .map((word) => (word.endsWith('eaux') ? word.slice(0, -1) : word)) // eaux → eau
    .map((word) => (word.length > 2 && word.endsWith('s') ? word.slice(0, -1) : word)) // pluriel simple
    .filter(
      (word) =>
        word.length > 2 && !STOP_WORDS.has(word) && /[a-z]/.test(word) && !/^\d+$/.test(word), // évite les nombres purs
    );
}

// Extraction avec bigrams et boost des substantifs
function extractDomainKeywords(text: string, maxKeywords: number = 8): string[] {
  const unigrams = tokenize(text);
  const bigrams: string[] = [];

  // Génère les bigrams (expressions comme "experience utilisateur")
  for (let i = 0; i < unigrams.length - 1; i++) {
    bigrams.push(`${unigrams[i]} ${unigrams[i + 1]}`);
  }

  const frequency: Record<string, number> = {};

  // Compte les unigrams
  for (const token of unigrams) {
    frequency[token] = (frequency[token] || 0) + 1;

    // Boost léger pour les substantifs typiques français
    if (token.match(/(?:tion|ment|té|age|isme|eur|ance|ence)$/)) {
      frequency[token] += 0.3;
    }
  }

  // Compte les bigrams avec boost
  for (const token of bigrams) {
    frequency[token] = (frequency[token] || 0) + 1.5; // boost léger bigrams
  }

  // Trie par fréquence décroissante puis par longueur décroissante
  const sortedTokens = Object.entries(frequency)
    .sort(([a, freqA], [b, freqB]) => {
      if (freqB !== freqA) return freqB - freqA;
      return b.length - a.length;
    })
    .map(([token]) => token);

  // Dédoublonne et prend les N premiers
  return Array.from(new Set(sortedTokens)).slice(0, maxKeywords);
}

export function extractKeywords(qual: QualInputs): Partial<Record<Dim, string[]>> {
  const keywords: Partial<Record<Dim, string[]>> = {};

  if (qual.dimancheMatin?.trim()) {
    keywords.plaisir = extractDomainKeywords(qual.dimancheMatin, 8);
  }

  if (qual.talentReconnu?.trim()) {
    keywords.competence = extractDomainKeywords(qual.talentReconnu, 8);
  }

  if (qual.indignationMax?.trim()) {
    keywords.utilite = extractDomainKeywords(qual.indignationMax, 8);
  }

  if (qual.algoPersonnel?.trim()) {
    keywords.viabilite = extractDomainKeywords(qual.algoPersonnel, 8);
  }

  return keywords;
}

// Analyse de qualité robuste avec comptage Unicode
export function analyzeQualityInputs(qual: QualInputs): {
  totalWords: number;
  avgWordsPerQuestion: number;
  emptyResponses: string[];
  tooShortResponses: string[];
  richness: 'poor' | 'fair' | 'good' | 'excellent';
  details: Record<string, { words: number; chars: number }>;
} {
  const entries = Object.entries(qual);
  const wordCounts = entries.map(([key, value]) => {
    const s = (value ?? '').trim(); // Fix: fallback sûr pour undefined
    const words = s ? (s.match(/\p{L}+/gu)?.length ?? 0) : 0; // Compte Unicode
    const chars = s.length;
    return { key, words, chars };
  });

  const totalWords = wordCounts.reduce((sum, item) => sum + item.words, 0);
  const avgWords = entries.length ? totalWords / entries.length : 0;

  const emptyResponses = wordCounts.filter((item) => item.words === 0).map((item) => item.key);

  const tooShortResponses = wordCounts
    .filter((item) => item.words > 0 && item.words < 5)
    .map((item) => item.key);

  let richness: 'poor' | 'fair' | 'good' | 'excellent';
  if (avgWords < 10) richness = 'poor';
  else if (avgWords < 20) richness = 'fair';
  else if (avgWords < 35) richness = 'good';
  else richness = 'excellent';

  // Détails pour debug/UI
  const details = wordCounts.reduce(
    (acc, item) => {
      acc[item.key] = { words: item.words, chars: item.chars };
      return acc;
    },
    {} as Record<string, { words: number; chars: number }>,
  );

  return {
    totalWords,
    avgWordsPerQuestion: Math.round(avgWords * 10) / 10,
    emptyResponses,
    tooShortResponses,
    richness,
    details,
  };
}

// Export des constantes pour les tests
export { STOP_WORDS, tokenize, normalizeFr };

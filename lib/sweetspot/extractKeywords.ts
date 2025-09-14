// lib/sweetspot/extractKeywords.ts
type Qual = {
  dimancheMatin?: string;
  algoPersonnel?: string;
  talentReconnu?: string;
  indignationMax?: string;
};

const dict = {
  plaisir: [
    'aime',
    'ador',
    'passion',
    'musique',
    'créa',
    'écrire',
    'dessin',
    'sport',
    'projet',
    'montage',
    'vidéo',
  ],
  competence: [
    'code',
    'excel',
    'math',
    'orga',
    'rigueur',
    'design',
    'présenter',
    'analyser',
    'expérience',
    'stage',
  ],
  utilite: [
    'aider',
    'impact',
    'changer',
    'société',
    'écolo',
    'santé',
    'justice',
    'égalité',
    'accès',
  ],
  viabilite: ['alternance', 'freelance', 'emploi', 'offre', 'salaire', 'débouchés'],
} as const;

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function extractKeywords(qual: Qual) {
  const text = normalize(
    [qual?.dimancheMatin, qual?.algoPersonnel, qual?.talentReconnu, qual?.indignationMax]
      .filter(Boolean)
      .join(' '),
  );

  const out: Record<keyof typeof dict, string[]> = {
    plaisir: [],
    competence: [],
    utilite: [],
    viabilite: [],
  };

  (Object.keys(dict) as Array<keyof typeof dict>).forEach((k) => {
    const found = dict[k].filter((w) => text.includes(normalize(w)));
    out[k] = Array.from(new Set(found)).slice(0, 8);
  });

  return out;
}

import type { Dim } from '@/lib/sweetspot/types';

export type SJTOption = {
  id: string;
  text: string;
  scores: Record<Dim, number>; // 0..1 par dimension
  confidence: 1 | 2 | 3 | 4 | 5; // Typage strict
};

export type SJTScenario = {
  id: string;
  scenario: string;
  dimensions: Dim[];
  options: SJTOption[];
};

// Questions harmonisées à la 2e personne ("Tu...")
export const QCM: SJTScenario[] = [
  {
    id: 'sjt_01',
    scenario: "Tu découvres un nouveau domaine qui t'intrigue. Quelle est ta première réaction ?",
    dimensions: ['plaisir', 'competence'],
    options: [
      {
        id: 'opt_01_a',
        text: 'Tu plonges immédiatement et tu expérimentes par toi-même',
        scores: { plaisir: 0.9, competence: 0.7, utilite: 0.3, viabilite: 0.4 },
        confidence: 4,
      },
      {
        id: 'opt_01_b',
        text: "Tu lis d'abord tout ce que tu peux trouver sur le sujet",
        scores: { plaisir: 0.6, competence: 0.9, utilite: 0.5, viabilite: 0.6 },
        confidence: 5,
      },
      {
        id: 'opt_01_c',
        text: "Tu cherches quelqu'un d'expérimenté pour t'expliquer",
        scores: { plaisir: 0.5, competence: 0.8, utilite: 0.7, viabilite: 0.8 },
        confidence: 4,
      },
      {
        id: 'opt_01_d',
        text: "Tu évalues d'abord si ça peut t'être utile plus tard",
        scores: { plaisir: 0.2, competence: 0.4, utilite: 0.9, viabilite: 0.9 },
        confidence: 4,
      },
    ],
  },
  {
    id: 'sjt_02',
    scenario: 'En groupe projet, tu te retrouves naturellement à...',
    dimensions: ['competence', 'utilite'],
    options: [
      {
        id: 'opt_02_a',
        text: "Coordonner et t'assurer que tout le monde avance",
        scores: { plaisir: 0.6, competence: 0.8, utilite: 0.9, viabilite: 0.7 },
        confidence: 5,
      },
      {
        id: 'opt_02_b',
        text: 'Creuser la partie technique la plus complexe',
        scores: { plaisir: 0.8, competence: 0.9, utilite: 0.6, viabilite: 0.5 },
        confidence: 4,
      },
      {
        id: 'opt_02_c',
        text: 'Proposer des idées créatives et originales',
        scores: { plaisir: 0.9, competence: 0.7, utilite: 0.7, viabilite: 0.4 },
        confidence: 4,
      },
      {
        id: 'opt_02_d',
        text: 'Vérifier la faisabilité et les ressources nécessaires',
        scores: { plaisir: 0.3, competence: 0.6, utilite: 0.8, viabilite: 0.9 },
        confidence: 5,
      },
    ],
  },
  {
    id: 'sjt_03',
    scenario: 'Face à un problème compliqué, tu commences par...',
    dimensions: ['competence', 'plaisir'],
    options: [
      {
        id: 'opt_03_a',
        text: 'Décomposer le problème en sous-parties plus simples',
        scores: { plaisir: 0.5, competence: 0.9, utilite: 0.8, viabilite: 0.7 },
        confidence: 5,
      },
      {
        id: 'opt_03_b',
        text: 'Chercher des solutions qui ont déjà fonctionné ailleurs',
        scores: { plaisir: 0.4, competence: 0.7, utilite: 0.8, viabilite: 0.9 },
        confidence: 4,
      },
      {
        id: 'opt_03_c',
        text: 'Brainstormer toutes les approches possibles, même folles',
        scores: { plaisir: 0.9, competence: 0.6, utilite: 0.5, viabilite: 0.3 },
        confidence: 3,
      },
      {
        id: 'opt_03_d',
        text: "T'interroger sur l'importance réelle de résoudre ce problème",
        scores: { plaisir: 0.3, competence: 0.5, utilite: 0.9, viabilite: 0.8 },
        confidence: 4,
      },
    ],
  },
  {
    id: 'sjt_04',
    scenario: "Quand tu réussis quelque chose de difficile, ce qui te satisfait le plus c'est...",
    dimensions: ['plaisir', 'utilite'],
    options: [
      {
        id: 'opt_04_a',
        text: "L'intensité du défi relevé et la fierté personnelle",
        scores: { plaisir: 0.9, competence: 0.8, utilite: 0.4, viabilite: 0.5 },
        confidence: 5,
      },
      {
        id: 'opt_04_b',
        text: 'Les nouvelles compétences développées en chemin',
        scores: { plaisir: 0.7, competence: 0.9, utilite: 0.6, viabilite: 0.7 },
        confidence: 4,
      },
      {
        id: 'opt_04_c',
        text: "L'impact positif sur les autres ou la société",
        scores: { plaisir: 0.6, competence: 0.5, utilite: 0.9, viabilite: 0.6 },
        confidence: 5,
      },
      {
        id: 'opt_04_d',
        text: 'Les opportunités que ça ouvre pour la suite',
        scores: { plaisir: 0.4, competence: 0.6, utilite: 0.7, viabilite: 0.9 },
        confidence: 4,
      },
    ],
  },
  {
    id: 'sjt_05',
    scenario: 'Tu as 3h libres un weekend. Tu choisis de...',
    dimensions: ['plaisir', 'viabilite'],
    options: [
      {
        id: 'opt_05_a',
        text: "Faire quelque chose que tu adores, même si c'est 'inutile'",
        scores: { plaisir: 0.9, competence: 0.5, utilite: 0.2, viabilite: 0.3 },
        confidence: 5,
      },
      {
        id: 'opt_05_b',
        text: 'Apprendre une compétence qui pourrait servir plus tard',
        scores: { plaisir: 0.6, competence: 0.8, utilite: 0.7, viabilite: 0.8 },
        confidence: 4,
      },
      {
        id: 'opt_05_c',
        text: "Aider quelqu'un ou contribuer à une cause importante",
        scores: { plaisir: 0.7, competence: 0.6, utilite: 0.9, viabilite: 0.5 },
        confidence: 4,
      },
      {
        id: 'opt_05_d',
        text: 'Développer un projet personnel avec un potentiel économique',
        scores: { plaisir: 0.8, competence: 0.7, utilite: 0.6, viabilite: 0.9 },
        confidence: 3,
      },
    ],
  },
  {
    id: 'sjt_06',
    scenario: 'Dans un débat, tu es plus convaincant quand tu...',
    dimensions: ['competence', 'utilite'],
    options: [
      {
        id: 'opt_06_a',
        text: "T'appuies sur des données et des faits précis",
        scores: { plaisir: 0.5, competence: 0.9, utilite: 0.7, viabilite: 0.8 },
        confidence: 5,
      },
      {
        id: 'opt_06_b',
        text: 'Racontes des histoires qui touchent émotionnellement',
        scores: { plaisir: 0.8, competence: 0.6, utilite: 0.8, viabilite: 0.6 },
        confidence: 4,
      },
      {
        id: 'opt_06_c',
        text: 'Montres les enjeux éthiques et les conséquences sociales',
        scores: { plaisir: 0.6, competence: 0.7, utilite: 0.9, viabilite: 0.5 },
        confidence: 4,
      },
      {
        id: 'opt_06_d',
        text: 'Démontres la faisabilité et les bénéfices concrets',
        scores: { plaisir: 0.4, competence: 0.8, utilite: 0.6, viabilite: 0.9 },
        confidence: 5,
      },
    ],
  },
  {
    id: 'sjt_07',
    scenario: 'Ton entourage dit que tu es doué pour...',
    dimensions: ['competence', 'viabilite'],
    options: [
      {
        id: 'opt_07_a',
        text: 'Comprendre des concepts complexes rapidement',
        scores: { plaisir: 0.7, competence: 0.9, utilite: 0.6, viabilite: 0.7 },
        confidence: 5,
      },
      {
        id: 'opt_07_b',
        text: 'Créer une ambiance positive et motiver les autres',
        scores: { plaisir: 0.8, competence: 0.7, utilite: 0.8, viabilite: 0.8 },
        confidence: 4,
      },
      {
        id: 'opt_07_c',
        text: 'Identifier les vrais problèmes et les priorités',
        scores: { plaisir: 0.5, competence: 0.8, utilite: 0.9, viabilite: 0.8 },
        confidence: 5,
      },
      {
        id: 'opt_07_d',
        text: 'Transformer les idées en projets concrets et réalisables',
        scores: { plaisir: 0.6, competence: 0.8, utilite: 0.7, viabilite: 0.9 },
        confidence: 4,
      },
    ],
  },
  {
    id: 'sjt_08',
    scenario: "Tu es le plus à l'aise dans un environnement...",
    dimensions: ['plaisir', 'viabilite'],
    options: [
      {
        id: 'opt_08_a',
        text: "Créatif et stimulant, même si c'est parfois instable",
        scores: { plaisir: 0.9, competence: 0.6, utilite: 0.5, viabilite: 0.3 },
        confidence: 4,
      },
      {
        id: 'opt_08_b',
        text: 'Intellectuellement exigeant avec des défis techniques',
        scores: { plaisir: 0.8, competence: 0.9, utilite: 0.6, viabilite: 0.6 },
        confidence: 5,
      },
      {
        id: 'opt_08_c',
        text: "Orienté vers l'impact social et l'amélioration du monde",
        scores: { plaisir: 0.7, competence: 0.6, utilite: 0.9, viabilite: 0.5 },
        confidence: 4,
      },
      {
        id: 'opt_08_d',
        text: "Structuré avec des perspectives d'évolution claires",
        scores: { plaisir: 0.4, competence: 0.7, utilite: 0.6, viabilite: 0.9 },
        confidence: 5,
      },
    ],
  },
  {
    id: 'sjt_09',
    scenario: 'Quand quelque chose te passionne vraiment, tu...',
    dimensions: ['plaisir', 'competence'],
    options: [
      {
        id: 'opt_09_a',
        text: "Perds complètement la notion du temps à t'y consacrer",
        scores: { plaisir: 0.9, competence: 0.8, utilite: 0.4, viabilite: 0.3 },
        confidence: 5,
      },
      {
        id: 'opt_09_b',
        text: 'Lis et apprends tout ce que tu peux sur le sujet',
        scores: { plaisir: 0.8, competence: 0.9, utilite: 0.6, viabilite: 0.6 },
        confidence: 4,
      },
      {
        id: 'opt_09_c',
        text: "Cherches comment l'utiliser pour aider les autres",
        scores: { plaisir: 0.7, competence: 0.6, utilite: 0.9, viabilite: 0.6 },
        confidence: 4,
      },
      {
        id: 'opt_09_d',
        text: 'Explores les opportunités professionnelles dans ce domaine',
        scores: { plaisir: 0.6, competence: 0.7, utilite: 0.7, viabilite: 0.9 },
        confidence: 4,
      },
    ],
  },
  {
    id: 'sjt_10',
    scenario: "Face à l'incertitude de l'avenir, tu...",
    dimensions: ['utilite', 'viabilite'],
    options: [
      {
        id: 'opt_10_a',
        text: 'Fais confiance à ton intuition et tes passions',
        scores: { plaisir: 0.9, competence: 0.5, utilite: 0.4, viabilite: 0.2 },
        confidence: 3,
      },
      {
        id: 'opt_10_b',
        text: 'Développes un maximum de compétences polyvalentes',
        scores: { plaisir: 0.6, competence: 0.9, utilite: 0.7, viabilite: 0.8 },
        confidence: 4,
      },
      {
        id: 'opt_10_c',
        text: 'Choisis un domaine où tu peux vraiment faire la différence',
        scores: { plaisir: 0.7, competence: 0.6, utilite: 0.9, viabilite: 0.6 },
        confidence: 4,
      },
      {
        id: 'opt_10_d',
        text: 'Privilégies la sécurité et les secteurs porteurs',
        scores: { plaisir: 0.3, competence: 0.6, utilite: 0.6, viabilite: 0.9 },
        confidence: 5,
      },
    ],
  },
  {
    id: 'sjt_11',
    scenario: 'Tu définis le succès comme...',
    dimensions: ['utilite', 'viabilite'],
    options: [
      {
        id: 'opt_11_a',
        text: 'Faire ce que tu aimes tous les jours',
        scores: { plaisir: 0.9, competence: 0.5, utilite: 0.3, viabilite: 0.4 },
        confidence: 4,
      },
      {
        id: 'opt_11_b',
        text: 'Devenir expert reconnu dans ton domaine',
        scores: { plaisir: 0.7, competence: 0.9, utilite: 0.6, viabilite: 0.7 },
        confidence: 5,
      },
      {
        id: 'opt_11_c',
        text: 'Avoir un impact positif mesurable sur la société',
        scores: { plaisir: 0.6, competence: 0.7, utilite: 0.9, viabilite: 0.6 },
        confidence: 5,
      },
      {
        id: 'opt_11_d',
        text: "Atteindre l'indépendance financière et la liberté",
        scores: { plaisir: 0.5, competence: 0.6, utilite: 0.5, viabilite: 0.9 },
        confidence: 4,
      },
    ],
  },
  {
    id: 'sjt_12',
    scenario: "Ton plus grand frein actuellement, c'est...",
    dimensions: ['competence', 'viabilite'],
    options: [
      {
        id: 'opt_12_a',
        text: 'Le manque de clarté sur tes vraies passions',
        scores: { plaisir: 0.3, competence: 0.4, utilite: 0.5, viabilite: 0.6 },
        confidence: 3,
      },
      {
        id: 'opt_12_b',
        text: "L'impression de ne pas être assez bon dans ce qui t'intéresse",
        scores: { plaisir: 0.7, competence: 0.3, utilite: 0.6, viabilite: 0.7 },
        confidence: 4,
      },
      {
        id: 'opt_12_c',
        text: "La difficulté à trouver un sens à tes choix d'orientation",
        scores: { plaisir: 0.5, competence: 0.6, utilite: 0.3, viabilite: 0.7 },
        confidence: 4,
      },
      {
        id: 'opt_12_d',
        text: "L'angoisse face aux débouchés et à la réalité du marché",
        scores: { plaisir: 0.6, competence: 0.7, utilite: 0.7, viabilite: 0.3 },
        confidence: 5,
      },
    ],
  },
];

export const QUAL_IDS = {
  dimancheMatin: 'qual_01',
  algoPersonnel: 'qual_02',
  talentReconnu: 'qual_03',
  indignationMax: 'qual_04',
} as const;

type QualId = (typeof QUAL_IDS)[keyof typeof QUAL_IDS];

export const QUAL_LABELS = {
  [QUAL_IDS.dimancheMatin]:
    'Test du Dimanche Matin : Dimanche 10h, aucune obligation. Que fais-tu naturellement pendant 2-3h ?',
  [QUAL_IDS.algoPersonnel]:
    "Algorithme Personnel : Dans tes flux (YouTube/TikTok/articles), quels contenus t'absorbent vraiment ?",
  [QUAL_IDS.talentReconnu]:
    "Talent Reconnu : Qu'est-ce que les autres disent que tu fais particulièrement bien ?",
  [QUAL_IDS.indignationMax]:
    "Indignation Max : Qu'est-ce qui t'indigne vraiment dans le monde et que tu voudrais améliorer ?",
} satisfies Record<QualId, string>;

export const QUAL_PLACEHOLDERS = {
  [QUAL_IDS.dimancheMatin]:
    "Ex: je code des petits projets, je dessine, je lis sur l'espace, je joue de la musique...",
  [QUAL_IDS.algoPersonnel]:
    'Ex: les vidéos de vulgarisation scientifique, les tutoriels créatifs, les débats politiques...',
  [QUAL_IDS.talentReconnu]:
    'Ex: expliquer les choses simplement, organiser des événements, résoudre les conflits...',
  [QUAL_IDS.indignationMax]:
    'Ex: les inégalités éducatives, la pollution des océans, la désinformation...',
} satisfies Record<QualId, string>;

// Types utiles pour l'autocomplétion et la robustesse
export type ScenarioId = (typeof QCM)[number]['id'];
export type OptionId = (typeof QCM)[number]['options'][number]['id'];

// Validation au chargement en mode développement
if (process.env.NODE_ENV !== 'production') {
  for (const scenario of QCM) {
    for (const option of scenario.options) {
      // Vérification des scores
      for (const dim of ['plaisir', 'competence', 'utilite', 'viabilite'] as const) {
        const score = option.scores[dim];
        if (score < 0 || score > 1) {
          console.warn(`Score hors plage [0,1] - ${scenario.id}/${option.id}/${dim}: ${score}`);
        }
      }

      // Vérification de la confidence
      if (option.confidence < 1 || option.confidence > 5) {
        console.warn(
          `Confidence hors plage [1,5] - ${scenario.id}/${option.id}: ${option.confidence}`,
        );
      }
    }

    // Vérification des dimensions déclarées
    for (const dim of scenario.dimensions) {
      if (!(dim in scenario.options[0].scores)) {
        console.warn(`Dimension déclarée mais absente des scores - ${scenario.id}: ${dim}`);
      }
    }
  }
}

// data/emerging-careers-batch3.ts
// B3: 6 métiers prioritaires — version normalisée (clés enum + durées/difficultés compatibles)

import type { FormationKey, AttenduKey } from '@/data/controlled-vocab';

export type EmergingCareerMiniProjectLycee = {
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  competences: string[];
  livrables: string[];
  long_run?: boolean;
};

interface EmergingCareerBatch3Source {
  id: string;
  title: string;
  description: string;
  category: string;
  emoji?: string;
  formations: FormationKey[];
  attendus: AttenduKey[];
  prerequisLycee?: string[];
  miniProjets: EmergingCareerMiniProjectLycee[];
  pitchEleve?: string;
  parcoursupReady?: boolean;
  salaireDebut?: string;
  horizonMetier?: string;
  entreprisesCibles?: string[];
}

export interface EmergingCareerBatch3 extends EmergingCareerBatch3Source {
  formationsParcoursup: FormationKey[];
  attendusParcoursup: AttenduKey[];
  miniProjetsLycee: EmergingCareerMiniProjectLycee[];
  pitchEleve: string;
}

const RAW_EMERGING_CAREERS: EmergingCareerBatch3Source[] = 
[
  // 1) Spécialiste Green IT
  {
    id: 'green-it-specialist',
    title: 'Spécialiste Green IT',
    category: 'tech_durable',
    emoji: '🌱',
    description: 'Expert en optimisation énergétique des SI et en numérique responsable',
    formations: ['BUT_INFO', 'BUT_GEII', 'LICENCE_SI', 'BTS_SIO', 'CPGE_MPSI'],
    attendus: [
      'curiosite_scientifique',
      'rigueur',
      'capacite_analyse',
      'autonomie',
      'sensibilite_environnementale',
    ],
    prerequisLycee: ['NSI', 'Mathématiques', 'Sciences de l’ingénieur', 'SVT'],
    miniProjets: [
      {
        title: 'Audit énergétique du site du lycée',
        description: 'Analyser la conso (EcoIndex), proposer un plan d’action chiffré et priorisé',
        duration: '3 semaines',
        difficulty: 'medium',
        competences: ['analyse données', 'rapport technique', 'sensibilisation', 'mesure impact'],
        livrables: ['Rapport d’audit', 'Présentation', 'Plan d’optimisation'],
      },
      {
        title: 'Calculateur CO₂ numérique personnel',
        description:
          'App web qui estime l’empreinte carbone des usages digitaux (streaming, cloud, RS)',
        duration: '1 mois', // source: ~6 semaines
        difficulty: 'ambitieux', // source: avancé
        competences: ['développement web', 'data viz', 'UX', 'recherche'],
        livrables: ['Application', 'Documentation', 'Étude comparative'],
        long_run: true,
      },
      {
        title: 'Challenge “Lycée Zéro Déchet Numérique”',
        description:
          'Événement de sensibilisation avec collecte, repair café et ateliers reconditionnement',
        duration: '1 mois', // source: 2 mois
        difficulty: 'facile',
        competences: ['gestion projet', 'communication', 'logistique', 'animation'],
        livrables: ['Plan événementiel', 'Bilan carbone évité', 'REX'],
        long_run: true,
      },
    ],
    pitchEleve:
      'Passionné par le code et engagé pour l’écologie, je veux réduire l’empreinte du numérique…',
    parcoursupReady: true,
    salaireDebut: '32k-38k€',
    horizonMetier: '2025-2030',
    entreprisesCibles: ['Greenspector', 'Fruggr', 'Ademe', 'GreenTech'],
  },

  // 2) Product Builder No-Code
  {
    id: 'no-code-product-builder',
    title: 'Product Builder No-Code',
    category: 'tech_creative',
    emoji: '🔧',
    description: 'Créateur d’applications et d’automatisations sans code, expert d’outils visuels',
    formations: ['BUT_MMI', 'BUT_TC', 'BACHELOR_MARKETING_DIGITAL', 'LICENCE_INFO_COM', 'BTS_COM'],
    attendus: [
      'creativite',
      'sens_relationnel',
      'organisation',
      'autonomie',
      'esprit_entrepreneurial',
    ],
    prerequisLycee: ['SES', 'NSI (optionnel)', 'Arts', 'Langues vivantes (outils internationaux)'],
    miniProjets: [
      {
        title: 'App de gestion MDL/CVL (Bubble)',
        description: 'Application pour gérer événements, budgets et votes de la Maison des Lycéens',
        duration: '4 semaines',
        difficulty: 'medium',
        competences: [
          'design interface',
          'logique métier',
          'base de données',
          'tests utilisateurs',
        ],
        livrables: ['App déployée', 'Guide utilisateur', 'Retours 50 users'],
      },
      {
        title: 'Automatisation Instagram du lycée',
        description: 'Workflows Make/Zapier pour publier multi-plateformes et suivre les stats',
        duration: '2 semaines',
        difficulty: 'facile',
        competences: ['workflows', 'API', 'analytics', 'content planning'],
        livrables: ['10 automatisations', 'Dashboard', 'Kit formation com’'],
      },
      {
        title: 'Marketplace projets lycéens (Glide)',
        description:
          'Plateforme d’échange de services entre élèves (cours, covoiturage, prêt matériel)',
        duration: '1 mois', // source: 2 mois
        difficulty: 'ambitieux',
        competences: ['UX research', 'monétisation', 'modération', 'growth'],
        livrables: ['MVP 100 utilisateurs', 'Business model canvas', 'Pitch deck'],
        long_run: true,
      },
    ],
    pitchEleve:
      'J’ai découvert le no-code pour prototyper vite : apps Webflow/Bubble et automatisations Make…',
    parcoursupReady: true,
    salaireDebut: '30k-45k€ (ou freelance 400-800€/j)',
    horizonMetier: '2024-2028',
    entreprisesCibles: ['Agences no-code', 'Ottho', 'Cube', 'Start-ups', 'Freelance'],
  },

  // 3) Coordinateur d’intimité numérique (privacy/RGPD)
  {
    id: 'coordinateur-intimite-numerique',
    title: 'Coordinateur d’intimité numérique',
    category: 'ethique_tech',
    emoji: '🔒',
    description: 'Protecteur de la vie privée, expert RGPD et cybersécurité individuelle',
    formations: ['BUT_INFO', 'LICENCE_DROIT', 'BUT_CJ', 'MASTER_DROIT_NUM', 'BTS_SIO'],
    attendus: ['rigueur', 'esprit_critique', 'capacite_analyse', 'expression_ecrite', 'ethique'],
    prerequisLycee: ['NSI', 'HGGSP', 'SES', 'Philosophie (terminale)'],
    miniProjets: [
      {
        title: 'Audit RGPD du lycée',
        description:
          'Analyser la conformité des traitements (Pronote, ENT, cantine) et proposer un plan d’action',
        duration: '1 mois',
        difficulty: 'ambitieux',
        competences: ['analyse juridique', 'audit', 'rédaction', 'vulgarisation'],
        livrables: ['Rapport conformité', 'Guide RGPD lycéen', 'Plan de mise en œuvre'],
      },
      {
        title: 'Atelier “Reprends le contrôle”',
        description:
          'Sensibiliser aux réglages de vie privée sur réseaux sociaux (10 ateliers animés)',
        duration: '1 mois', // source: 3 mois
        difficulty: 'medium',
        competences: ['pédagogie', 'veille tech', 'animation', 'création contenu'],
        livrables: ['Kit pédagogique', 'Calendrier ateliers', 'Chaîne YouTube tutos'],
        long_run: true,
      },
      {
        title: 'Escape Game “Data Leak”',
        description: 'Jeu immersif pour sensibiliser aux risques de fuite de données',
        duration: '1 mois', // source: 2 mois
        difficulty: 'medium',
        competences: ['game design', 'scénarisation', 'technique', 'tests'],
        livrables: ['Jeu 45 min', 'Guide animation', 'Feedback 200 participants'],
        long_run: true,
      },
    ],
    pitchEleve:
      'Le scandale Cambridge Analytica m’a fait comprendre l’enjeu de nos données. DPO junior CNIL…',
    parcoursupReady: true,
    salaireDebut: '35k-42k€',
    horizonMetier: '2024-2035',
    entreprisesCibles: ['CNIL', 'Cabinets conseil', 'ONG privacy', 'DPO entreprises'],
  },

  // 4) Valoriste Réemploi Créatif
  {
    id: 'valoriste-reemploi-creatif',
    title: 'Valoriste Réemploi Créatif',
    category: 'economie_circulaire',
    emoji: '♻️',
    description:
      'Transforme des objets abandonnés en ressources — upcycling et économie circulaire créative',
    formations: [
      'DNMADE',
      'BUT_TC',
      'LICENCE_ARTS',
      'BACHELOR_DESIGN_PRODUIT',
      'BTS_DESIGN_PRODUITS',
    ],
    attendus: [
      'creativite',
      'sens_esthetique',
      'esprit_entrepreneurial',
      'sensibilite_environnementale',
      'travail_manuel',
    ],
    prerequisLycee: ['Arts Plastiques', 'SES', 'STD2A (idéal)', 'SVT (économie circulaire)'],
    miniProjets: [
      {
        title: 'Pop-up store “Lycée Upcyclé”',
        description: 'Transformer mobilier scolaire usagé en objets design, vente au profit du FSE',
        duration: '1 mois', // source: 3 mois
        difficulty: 'medium',
        competences: ['design', 'fabrication', 'marketing', 'gestion'],
        livrables: ['20 pièces', 'Catalogue photo', 'Bilan financier'],
        long_run: true,
      },
      {
        title: 'Repair Café mensuel',
        description:
          'Organisation de sessions de réparation (électronique/textile), communauté de pratique',
        duration: '1 mois', // source: année scolaire
        difficulty: 'facile',
        competences: ['organisation', 'technique', 'transmission', 'communication'],
        livrables: ['8 sessions planifiées', '200 objets réparés', 'Charte & tutoriels'],
        long_run: true,
      },
      {
        title: 'Collection “Fast Fashion Détournée”',
        description: 'Mini-collection de 5 pièces à partir de vêtements destinés à la poubelle',
        duration: '1 mois', // source: 2 mois
        difficulty: 'ambitieux',
        competences: ['couture', 'patronage', 'storytelling', 'photo'],
        livrables: ['Collection complète', 'Défilé', 'Dossier presse'],
        long_run: true,
      },
    ],
    pitchEleve:
      'Je fais de l’upcycling depuis 2 ans (12k€ sur Etsy) et anime @UpcycleGenZ (8k). Je veux prouver que durable = stylé.',
    parcoursupReady: true,
    salaireDebut: '28k-35k€ (ou auto-entreprise)',
    horizonMetier: '2024-2040',
    entreprisesCibles: ['Ressourceries', 'La Réserve des Arts', 'Emmaüs', 'Indépendant'],
  },

  // 5) Architecte Jumeaux Numériques
  {
    id: 'architecte-jumeaux-numeriques',
    title: 'Architecte Jumeaux Numériques',
    category: 'industrie_4.0',
    emoji: '🏭',
    description:
      'Crée des répliques virtuelles pour simuler et optimiser produits, robots, bâtiments',
    formations: ['CPGE_MPSI', 'BUT_GEII', 'BUT_GMP', 'ECOLE_INGENIEUR_POSTBAC', 'LICENCE_SI'],
    attendus: [
      'rigueur',
      'abstraction',
      'curiosite_scientifique',
      'capacite_analyse',
      'vision_spatiale',
    ],
    prerequisLycee: ['Mathématiques (spé)', 'Physique-Chimie', 'SI', 'NSI (complémentaire)'],
    miniProjets: [
      {
        title: 'Jumeau numérique d’un bâtiment du lycée',
        description:
          'Modélisation 3D + capteurs IoT pour simuler consommations et proposer optimisations',
        duration: '1 mois', // source: 3 mois
        difficulty: 'ambitieux',
        competences: ['modélisation 3D', 'IoT', 'data analysis', 'simulation'],
        livrables: ['Modèle 3D', 'Dashboard temps réel', 'Rapport optimisations'],
        long_run: true,
      },
      {
        title: 'Digital Twin du robot du fablab',
        description:
          'Créer le jumeau numérique du robot pour prédire les pannes (maintenance prédictive)',
        duration: '4 semaines', // source: 6 semaines
        difficulty: 'medium',
        competences: ['CAO', 'capteurs', 'ML', 'maintenance'],
        livrables: ['Modèle fonctionnel', 'Algo de prédiction', 'Docs'],
      },
      {
        title: 'Simulation des flux d’élèves',
        description: 'Modéliser les circulations pour réduire bousculades et temps d’attente',
        duration: '1 mois',
        difficulty: 'medium',
        competences: ['simulation', 'data collection', 'optimisation', 'visualisation'],
        livrables: ['Simulation (Unity)', 'Recommandations', 'Présentation direction'],
      },
    ],
    pitchEleve:
      'Fan de SimCity, j’ai modélisé notre maison pour optimiser l’isolation. Je veux virtualiser le monde physique.',
    parcoursupReady: true,
    salaireDebut: '38k-45k€',
    horizonMetier: '2025-2035',
    entreprisesCibles: ['Dassault Systèmes', 'Siemens', 'Ansys', 'Industries 4.0'],
  },

  // 6) Pilote Économie des Batteries
  {
    id: 'pilote-economie-batteries',
    title: 'Pilote Économie des Batteries',
    category: 'energie_mobilite',
    emoji: '🔋',
    description: 'Gère le cycle de vie des batteries : production, seconde vie, recyclage',
    formations: ['BUT_GEII', 'BUT_CHIMIE', 'BTS_ELECTROTECH', 'LICENCE_CHIMIE', 'CPGE_PCSI'],
    attendus: [
      'rigueur',
      'curiosite_scientifique',
      'sensibilite_environnementale',
      'capacite_analyse',
      'esprit_pratique',
    ],
    prerequisLycee: [
      'Physique-Chimie (spé)',
      'Mathématiques',
      'Sciences de l’ingénieur',
      'SVT (cycles de la matière)',
    ],
    miniProjets: [
      {
        title: 'Station powerbank solaire pour la cour',
        description: 'Concevoir une station USB avec batteries recyclées de trottinettes',
        duration: '1 mois', // source: 2 mois
        difficulty: 'medium',
        competences: ['électronique', 'soudure', 'dimensionnement', 'sécurité'],
        livrables: ['Station fonctionnelle', 'Guide sécurité', 'Calcul ROI'],
        long_run: true,
      },
      {
        title: 'Diagnostic/reconditionnement batteries VAE',
        description: 'Service de test et reconditionnement pour vélos des profs/parents',
        duration: '1 mois', // source: 3 mois
        difficulty: 'ambitieux',
        competences: ['diagnostic', 'électrochimie', 'business', 'SAV'],
        livrables: ['30 batteries testées', 'Protocole', 'Micro-entreprise amorcée'],
        long_run: true,
      },
      {
        title: 'Collecte “Piles au Lycée”',
        description: 'Mettre en place une filière de collecte et valorisation des piles usagées',
        duration: '1 mois', // source: 1 an
        difficulty: 'facile',
        competences: ['logistique', 'sensibilisation', 'partenariats', 'reporting'],
        livrables: ['500 kg collectés (objectif)', 'Partenariat Corepile', 'Trophée éco-lycée'],
        long_run: true,
      },
    ],
    pitchEleve:
      'Je récupère des batteries de trottinettes pour créer des systèmes de stockage. Je veux développer la seconde vie.',
    parcoursupReady: true,
    salaireDebut: '34k-40k€',
    horizonMetier: '2024-2040',
    entreprisesCibles: ['SNAM', 'Veolia', 'Tesla', 'Northvolt', 'Start-ups recyclage'],
  },
];

export const EMERGING_CAREERS_BATCH3: EmergingCareerBatch3[] = RAW_EMERGING_CAREERS.map((career) => ({
  ...career,
  formationsParcoursup: [...career.formations],
  attendusParcoursup: [...career.attendus],
  miniProjetsLycee: career.miniProjets.map((mini) => ({ ...mini })),
  miniProjets: career.miniProjets.map((mini) => ({ ...mini })),
  formations: [...career.formations],
  attendus: [...career.attendus],
  prerequisLycee: career.prerequisLycee ? [...career.prerequisLycee] : undefined,
  pitchEleve: career.pitchEleve ?? '',
}));

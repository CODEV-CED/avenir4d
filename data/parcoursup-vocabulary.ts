// B3: data/parcoursup-vocabulary.ts

// ============================================
// LABELS FORMATIONS - Descriptions complètes
// ============================================
export const FORMATION_LABELS: Record<string, string> = {
  // BUT - Bachelors Universitaires de Technologie (3 ans)
  'BUT Informatique':
    'BUT Informatique - Développement web/mobile, cybersécurité, data science et IA',
  'BUT GEA - Gestion des Entreprises':
    'BUT GEA - Comptabilité, contrôle de gestion, finance et ressources humaines',
  'BUT MMI - Métiers du Multimédia':
    'BUT MMI - Création numérique, développement web, audiovisuel et communication digitale',
  'BUT TC - Techniques de Commercialisation':
    'BUT TC - Marketing digital, e-commerce, négociation et management commercial',
  'BUT GEII - Génie Électrique':
    'BUT GEII - Électronique, automatismes, informatique industrielle et énergies renouvelables',
  'BUT GMP - Génie Mécanique et Productique':
    'BUT GMP - Conception mécanique, robotique, production et industrie 4.0',
  'BUT Chimie': 'BUT Chimie - Analyse, synthèse, matériaux innovants et chimie verte',
  'BUT Carrières Juridiques':
    'BUT Carrières Juridiques - Droit des affaires, droit social et administration publique',

  // LICENCES - Formations universitaires (3 ans)
  "Licence Sciences pour l'ingénieur":
    "Licence Sciences pour l'ingénieur - Mécanique, électronique, robotique et technologies innovantes",
  'Licence Information-Communication':
    'Licence Info-Com - Journalisme, communication digitale, médias et publicité',
  'Licence Économie-Gestion':
    'Licence Éco-Gestion - Analyse économique, finance, management et économie internationale',
  'Licence Droit':
    'Licence Droit - Droit privé, droit public, droit des affaires et droit international',
  'Licence Psychologie':
    'Licence Psychologie - Psychologie clinique, cognitive, sociale et du développement',
  'Licence Chimie': 'Licence Chimie - Chimie organique, analytique, matériaux et environnement',
  'Licence Arts Plastiques':
    "Licence Arts Plastiques - Création artistique, histoire de l'art et médiation culturelle",
  'Licence STAPS':
    'Licence STAPS - Sciences du sport, éducation physique, management sportif et santé',

  // BTS - Brevets de Technicien Supérieur (2 ans)
  'BTS SIO - Services Informatiques':
    'BTS SIO - Solutions logicielles (SLAM) ou infrastructure réseau (SISR)',
  'BTS Communication':
    'BTS Communication - Stratégie de communication, création publicitaire et relations presse',
  'BTS MCO - Management Commercial':
    "BTS MCO - Management d'équipe, développement commercial et relation client omnicanale",
  'BTS Électrotechnique':
    'BTS Électrotechnique - Installations électriques, maintenance industrielle et énergies renouvelables',
  'BTS Design de Produits':
    "BTS Design de Produits - Conception d'objets, design industriel et éco-conception",

  // CPGE - Classes Préparatoires aux Grandes Écoles (2 ans)
  'CPGE MPSI - Maths-Physique':
    "Prépa MPSI/MP - Maths, physique et sciences de l'ingénieur pour écoles d'ingénieurs",
  'CPGE PCSI - Physique-Chimie':
    "Prépa PCSI/PC - Physique, chimie et mathématiques pour écoles d'ingénieurs et ENS",
  'CPGE ECG - Économique et Commerciale':
    'Prépa ECG - Économie, mathématiques et géopolitique pour écoles de commerce',

  // BACHELORS - Formations privées ou consulaires (3-4 ans)
  'Bachelor Design Graphique':
    'Bachelor Design Graphique - Direction artistique, UX/UI design et motion design',
  'Bachelor Marketing Digital':
    'Bachelor Marketing Digital - Social media, SEO/SEA, data marketing et e-commerce',
  'Bachelor Design Produit':
    'Bachelor Design Produit - Design thinking, prototypage et innovation industrielle',

  // ÉCOLES SPÉCIALISÉES
  "École d'ingénieurs post-bac":
    "École d'ingénieurs en 5 ans - Sciences, technologies et management de projets innovants",
  "DNMADE - Diplôme des Métiers d'Art":
    "DNMADE - Design d'espace, d'objet, graphique ou mode (grade licence)",
  'Master Droit du numérique':
    'Master Droit du numérique - RGPD, cybersécurité juridique et propriété intellectuelle',
  'PASS - Parcours Santé':
    'PASS - Première année commune aux études de santé (médecine, pharmacie, dentaire, kiné)',
};

// ============================================
// LABELS ATTENDUS - Descriptions détaillées
// ============================================
export const ATTENDU_LABELS: Record<string, string> = {
  // === COMPÉTENCES ACADÉMIQUES ===
  expression_ecrite:
    "Maîtrise de l'expression écrite - Rédiger de manière claire, structurée et argumentée",
  expression_orale:
    "Aisance à l'oral - S'exprimer avec clarté, conviction et adapter son discours au public",
  argumentation:
    "Capacité d'argumentation - Construire un raisonnement logique et défendre ses idées",
  capacite_analyse:
    "Esprit d'analyse - Décortiquer des problèmes complexes et identifier les enjeux clés",
  rigueur: 'Rigueur intellectuelle - Travailler avec méthode, précision et souci du détail',
  abstraction:
    "Capacité d'abstraction - Conceptualiser, modéliser et manipuler des idées complexes",
  curiosite_scientifique:
    "Curiosité scientifique - S'intéresser aux sciences, technologies et innovations",

  // === COMPÉTENCES PERSONNELLES ===
  autonomie: 'Autonomie - Organiser son travail, prendre des initiatives et gérer ses priorités',
  organisation:
    "Sens de l'organisation - Planifier, structurer et optimiser son temps et ses ressources",
  perseverance: 'Persévérance - Maintenir ses efforts dans la durée malgré les difficultés',
  creativite: 'Créativité - Proposer des solutions originales et penser "hors du cadre"',
  esprit_critique:
    'Esprit critique - Questionner, analyser et évaluer les informations avec discernement',
  vision_spatiale:
    'Vision spatiale - Se représenter mentalement des objets en 3D et leurs transformations',

  // === COMPÉTENCES SOCIALES ===
  travail_equipe:
    'Travail en équipe - Collaborer efficacement, écouter et contribuer à la dynamique de groupe',
  sens_relationnel:
    'Sens relationnel - Créer du lien, communiquer avec empathie et gérer les relations',
  leadership: 'Leadership - Mobiliser, inspirer et guider une équipe vers un objectif commun',
  ouverture_culturelle:
    "Ouverture culturelle - S'intéresser à d'autres cultures, arts et modes de pensée",

  // === VALEURS ET SENSIBILITÉS ===
  sensibilite_environnementale:
    "Sensibilité environnementale - Conscience des enjeux écologiques et volonté d'agir durablement",
  ethique: 'Sens éthique - Intégrité, respect des valeurs morales et responsabilité sociale',
  esprit_entrepreneurial:
    'Esprit entrepreneurial - Initiative, prise de risque calculée et vision business',
  sens_esthetique:
    'Sens esthétique - Sensibilité artistique, goût pour le beau et culture visuelle',
  travail_manuel:
    'Habileté manuelle - Dextérité, précision gestuelle et goût pour la réalisation concrète',
  esprit_pratique:
    'Esprit pratique - Pragmatisme, bon sens et orientation vers des solutions concrètes',
};

// ============================================
// LABELS SPÉCIALITÉS LYCÉE (pour les prérequis)
// ============================================
export const SPECIALITES_LYCEE_LABELS: Record<string, string> = {
  // Spécialités scientifiques
  Mathématiques: 'Mathématiques - Analyse, algèbre, probabilités et raisonnement logique',
  'Physique-Chimie':
    'Physique-Chimie - Sciences expérimentales, modélisation et phénomènes naturels',
  SVT: 'SVT - Sciences de la vie et de la Terre, biologie, géologie et environnement',
  NSI: 'NSI - Numérique et Sciences Informatiques, programmation et algorithmique',
  "Sciences de l'ingénieur": 'SI - Conception, innovation technologique et systèmes automatisés',

  // Spécialités économiques et sociales
  SES: 'SES - Sciences Économiques et Sociales, économie, sociologie et sciences politiques',
  HGGSP: 'HGGSP - Histoire-Géo, Géopolitique et Sciences Politiques',

  // Spécialités littéraires et artistiques
  HLP: 'HLP - Humanités, Littérature et Philosophie',
  LLCER: 'LLCER - Langues, Littératures et Cultures Étrangères et Régionales',
  LLCA: "LLCA - Langues et Cultures de l'Antiquité (Latin/Grec)",
  Arts: 'Arts - Arts plastiques, musique, théâtre, cinéma-audiovisuel ou danse',

  // Spécialités technologiques (séries technos)
  STD2A: 'STD2A - Sciences et Technologies du Design et des Arts Appliqués',
  STI2D: "STI2D - Sciences et Technologies de l'Industrie et du Développement Durable",
  STL: 'STL - Sciences et Technologies de Laboratoire',
  STMG: 'STMG - Sciences et Technologies du Management et de la Gestion',
  ST2S: 'ST2S - Sciences et Technologies de la Santé et du Social',
  STAV: "STAV - Sciences et Technologies de l'Agronomie et du Vivant",
  STHR: "STHR - Sciences et Technologies de l'Hôtellerie et de la Restauration",
  TMD: 'TMD - Techniques de la Musique et de la Danse',
};

// ============================================
// HELPERS pour l'affichage
// ============================================

// Obtenir le label court d'une formation (sans la description)
export const getFormationShortLabel = (formation: string): string => {
  const label = FORMATION_LABELS[formation] || formation;
  return label.split(' - ')[0];
};

// Obtenir uniquement la description d'une formation
export const getFormationDescription = (formation: string): string => {
  const label = FORMATION_LABELS[formation] || '';
  const parts = label.split(' - ');
  return parts[1] || '';
};

// Obtenir le type de formation (BUT, Licence, BTS, etc.)
export const getFormationType = (formation: string): string => {
  if (formation.startsWith('BUT')) return 'BUT (3 ans)';
  if (formation.startsWith('Licence')) return 'Licence (3 ans)';
  if (formation.startsWith('BTS')) return 'BTS (2 ans)';
  if (formation.startsWith('CPGE')) return 'Prépa (2 ans)';
  if (formation.startsWith('Bachelor')) return 'Bachelor (3-4 ans)';
  if (formation.includes('École')) return 'École (3-5 ans)';
  if (formation.startsWith('DNMADE')) return 'DNMADE (3 ans)';
  if (formation.startsWith('Master')) return 'Master (5 ans)';
  if (formation.startsWith('PASS')) return 'PASS (1 an)';
  return 'Formation';
};

// Grouper les attendus par catégorie
export const ATTENDUS_BY_CATEGORY = {
  academiques: [
    'expression_ecrite',
    'expression_orale',
    'argumentation',
    'capacite_analyse',
    'rigueur',
    'abstraction',
    'curiosite_scientifique',
  ],
  personnelles: [
    'autonomie',
    'organisation',
    'perseverance',
    'creativite',
    'esprit_critique',
    'vision_spatiale',
  ],
  sociales: ['travail_equipe', 'sens_relationnel', 'leadership', 'ouverture_culturelle'],
  valeurs: [
    'sensibilite_environnementale',
    'ethique',
    'esprit_entrepreneurial',
    'sens_esthetique',
    'travail_manuel',
    'esprit_pratique',
  ],
};

// Labels des catégories d'attendus
export const ATTENDU_CATEGORY_LABELS = {
  academiques: '📚 Compétences académiques',
  personnelles: '💪 Compétences personnelles',
  sociales: '🤝 Compétences sociales',
  valeurs: '💚 Valeurs et sensibilités',
};

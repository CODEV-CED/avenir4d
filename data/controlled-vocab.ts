// B3: Controlled vocab (FORMATIONS / ATTENDUS) + LABELS
// B3: clés contrôlées + pont vers les labels "humains"
import {
  FORMATION_LABELS as HUMAN_FORMATION_LABELS,
  ATTENDU_LABELS as HUMAN_ATTENDU_LABELS,
} from '@/data/parcoursup-vocabulary';

// --- FORMATIONS: clés "machine" (enum) ---

export const FORMATIONS = [
  'BUT_INFO',
  'BUT_GEA',
  'BUT_MMI',
  'BUT_TC',
  'BUT_GEII',
  'BUT_GMP',
  'BUT_CHIMIE',
  'BUT_CJ',
  'BUT_GIM',
  'BTS_SIO',
  'BTS_SN',
  'BTS_CIEL',
  'LICENCE_SI',
  'LICENCE_INFO',
  'LICENCE_MATHS',
  'LICENCE_INFO_COM',
  'LICENCE_ECO_GEST',
  'LICENCE_DROIT',
  'LICENCE_PSYCHO',
  'LICENCE_CHIMIE',
  'LICENCE_ARTS',
  'LICENCE_STAPS',
  'CPGE_MP2I',
  'CPGE_MPSI',
  'CPGE_ECG',
  'BACHELOR_DESIGN',
  'BACHELOR_DESIGN_GRAPH',
  'BACHELOR_MARKETING_DIGITAL',
  'BACHELOR_DESIGN_PRODUIT',
  'ECOLE_INGENIEUR_POSTBAC',
  'DNMADE',
  'MASTER_DROIT_NUM',
  'PASS',
  'BTS_SIO',
  'BTS_COM',
  'BTS_MCO',
  'BTS_ELECTROTECH',
  'BTS_DESIGN_PRODUITS',
  'DN_MADE',
  'BUT_GMP',
  'BTS_ELECTROTECHNIQUE',
  'LICENCE_SI',
  'LICENCE_CHIMIE',
  'CPGE_PCSI',
  'CPGE_MPSI',
  'CPGE_ECG',
] as const;

export type FormationKey = (typeof FORMATIONS)[number];

// Map "clé → label humain" (court + descriptif)
export const FORMATION_LABELS: Record<string, string> = {
  BUT_INFO: 'BUT Informatique - Développement web/mobile, cybersécurité, data science et IA',
  BUT_GEA: 'BUT GEA - Comptabilité, contrôle de gestion, finance et ressources humaines',
  BUT_MMI: 'BUT MMI - Création numérique, développement web, audiovisuel et communication digitale',
  BUT_TC: 'BUT TC - Marketing digital, e-commerce, négociation et management commercial',
  BUT_GEII:
    'BUT GEII - Électronique, automatismes, informatique industrielle et énergies renouvelables',
  BUT_GMP: 'BUT GMP - Conception mécanique, robotique, production et industrie 4.0',
  BUT_CHIMIE: 'BUT Chimie - Analyse, synthèse, matériaux innovants et chimie verte',
  BUT_CJ: 'BUT Carrières Juridiques - Droit des affaires, droit social et administration publique',

  LICENCE_SI:
    'Licence Sciences pour l’ingénieur - Mécanique, électronique, robotique et technologies innovantes',
  LICENCE_INFO_COM: 'Licence Info-Com - Journalisme, communication digitale, médias et publicité',
  LICENCE_ECO_GEST:
    'Licence Éco-Gestion - Analyse économique, finance, management et économie internationale',
  LICENCE_DROIT: 'Licence Droit - Droit privé, public, affaires et international',
  LICENCE_PSYCHO: 'Licence Psychologie - Clinique, cognitive, sociale et du développement',
  LICENCE_CHIMIE: 'Licence Chimie - Organique, analytique, matériaux et environnement',
  LICENCE_ARTS:
    'Licence Arts Plastiques - Création artistique, histoire de l’art et médiation culturelle',
  LICENCE_STAPS: 'Licence STAPS - Sciences du sport, EPS, management sportif et santé',

  BTS_SIO: 'BTS SIO - Solutions logicielles (SLAM) ou infrastructures (SISR)',
  BTS_COM: 'BTS Communication - Stratégie, création et relations presse',
  BTS_MCO: 'BTS MCO - Management d’équipe, développement commercial et omnicanal',
  BTS_ELECTROTECH: 'BTS Électrotechnique - Installations, maintenance et énergies',
  BTS_DESIGN_PRODUITS: 'BTS Design de Produits - Conception d’objets, industriel et éco-conception',

  CPGE_MPSI: 'Prépa MPSI/MP - Maths, physique, sciences de l’ingénieur',
  CPGE_PCSI: 'Prépa PCSI/PC - Physique, chimie, mathématiques, ENS',
  CPGE_ECG: 'Prépa ECG - Économie, maths et géopolitique',

  BACHELOR_DESIGN_GRAPH: 'Bachelor Design Graphique - Direction artistique, UX/UI, motion',
  BACHELOR_MARKETING_DIGITAL:
    'Bachelor Marketing Digital - Social, SEO/SEA, data marketing, e-commerce',
  BACHELOR_DESIGN_PRODUIT: 'Bachelor Design Produit - Design thinking, prototypage, innovation',

  ECOLE_INGENIEUR_POSTBAC: 'École d’ingénieurs (post-bac) - Sciences, techno, gestion de projets',
  DNMADE: 'DNMADE - Design d’espace, d’objet, graphique ou mode',
  MASTER_DROIT_NUM: 'Master Droit du numérique - RGPD, cybersécurité, propriété intellectuelle',
  PASS: 'PASS - Première année de santé',
};

// --- Pont "libellé humain → clé enum" pour normaliser l’existant ---
export const FORMATION_HUMAN_TO_KEY: Record<string, FormationKey> = {
  'BUT Informatique': 'BUT_INFO',
  'BUT GEA - Gestion des Entreprises': 'BUT_GEA',
  'BUT MMI - Métiers du Multimédia': 'BUT_MMI',
  'BUT TC - Techniques de Commercialisation': 'BUT_TC',
  'BUT GEII - Génie Électrique': 'BUT_GEII',
  'BUT GMP - Génie Mécanique et Productique': 'BUT_GMP',
  'BUT Chimie': 'BUT_CHIMIE',
  'BUT Carrières Juridiques': 'BUT_CJ',

  "Licence Sciences pour l'ingénieur": 'LICENCE_SI',
  'Licence Information-Communication': 'LICENCE_INFO_COM',
  'Licence Économie-Gestion': 'LICENCE_ECO_GEST',
  'Licence Droit': 'LICENCE_DROIT',
  'Licence Psychologie': 'LICENCE_PSYCHO',
  'Licence Chimie': 'LICENCE_CHIMIE',
  'Licence Arts Plastiques': 'LICENCE_ARTS',
  'Licence STAPS': 'LICENCE_STAPS',

  'BTS SIO - Services Informatiques': 'BTS_SIO',
  'BTS Communication': 'BTS_COM',
  'BTS MCO - Management Commercial': 'BTS_MCO',
  'BTS Électrotechnique': 'BTS_ELECTROTECH',
  'BTS Design de Produits': 'BTS_DESIGN_PRODUITS',

  'CPGE MPSI - Maths-Physique': 'CPGE_MPSI',
  'CPGE PCSI - Physique-Chimie': 'CPGE_PCSI',
  'CPGE ECG - Économique et Commerciale': 'CPGE_ECG',

  'Bachelor Design Graphique': 'BACHELOR_DESIGN_GRAPH',
  'Bachelor Marketing Digital': 'BACHELOR_MARKETING_DIGITAL',
  'Bachelor Design Produit': 'BACHELOR_DESIGN_PRODUIT',

  "École d'ingénieurs post-bac": 'ECOLE_INGENIEUR_POSTBAC',
  "DNMADE - Diplôme des Métiers d'Art": 'DNMADE',
  'Master Droit du numérique': 'MASTER_DROIT_NUM',
  'PASS - Parcours Santé': 'PASS',
};
// Base attendus (existants) + compléments fournis
export const ATTENDUS = [
  'SPE_MATHS',
  'SPE_NSI',
  'SPE_PHYSIQUE',
  'SPE_SVT',
  'SPE_SES',
  'SPE_LLCE',
  'SPE_HGGSP',
  'SPE_ARTS',
  'PROJET_PERSO',
  'CLUB_LYCEE',
  'STAGE_3EME',
  'OPTION_MATHS_COMPLEMENTAIRES',
  'OPTION_MATHS_EXPERTES',
  // B3: compléments
  'curiosite_scientifique',
  'rigueur',
  'capacite_analyse',
  'autonomie',
  'sensibilite_environnementale',
  'creativite',
  'sens_relationnel',
  'organisation',
  'esprit_entrepreneurial',
  'expression_ecrite',
  'ethique',
  'sens_esthetique',
  'travail_manuel',
  'abstraction',
  'vision_spatiale',
  'esprit_pratique',
  'expression_orale',
  'argumentation',
  'rigueur',
  'abstraction',
  'perseverance',
  'esprit_critique',
  'travail_equipe',
  'sens_relationnel',
  'leadership',
  'ouverture_culturelle',
  'sensibilite_environnementale',
  'ethique',
  'esprit_entrepreneurial',
  'sens_esthetique',
  'travail_manuel',
] as const;

export type AttenduKey = (typeof ATTENDUS)[number];

export const ATTENDU_LABELS: Record<AttenduKey, string> = HUMAN_ATTENDU_LABELS as Record<
  AttenduKey,
  string
>;

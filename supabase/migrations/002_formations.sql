-- 002_formations.sql — Table "formations" + seed démo
-- Prérequis
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum optionnel pour typer proprement
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'formation_type') THEN
    CREATE TYPE formation_type AS ENUM (
      'BUT','BTS','CPGE','LICENCE','ECOLE_COM','ECOLE_ING','SANTE','ARTS'
    );
  END IF;
END$$;

-- Table principale
CREATE TABLE IF NOT EXISTS formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  type formation_type NOT NULL,
  duree INT NOT NULL CHECK (duree BETWEEN 1 AND 6),
  etablissement TEXT NOT NULL,
  ville TEXT NOT NULL,
  code_postal TEXT,

  -- Tags (arrays)
  plaisir_tags TEXT[],
  competence_tags TEXT[],
  utilite_tags TEXT[],

  -- Données viabilité (JSONB: { taux_acces: number, cout: 'gratuit'|'modere'|'eleve' })
  viabilite_data JSONB,

  -- Score de confiance (0..1)
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),

  image_url TEXT,
  website   TEXT,

  -- { source, position, score, year }
  ranking JSONB,
  metiers TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index utiles
CREATE INDEX IF NOT EXISTS idx_formations_type ON formations(type);
CREATE INDEX IF NOT EXISTS idx_formations_ville ON formations(ville);
CREATE INDEX IF NOT EXISTS idx_formations_duree ON formations(duree);
CREATE INDEX IF NOT EXISTS idx_formations_confidence ON formations(confidence DESC);
-- (option) recherche tags rapides
CREATE INDEX IF NOT EXISTS idx_formations_plaisir_tags_gin ON formations USING GIN (plaisir_tags);
CREATE INDEX IF NOT EXISTS idx_formations_competence_tags_gin ON formations USING GIN (competence_tags);
CREATE INDEX IF NOT EXISTS idx_formations_utilite_tags_gin ON formations USING GIN (utilite_tags);

-- RLS (lecture publique)
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'formations' AND policyname = 'Public read formations'
  ) THEN
    CREATE POLICY "Public read formations" ON formations FOR SELECT USING (true);
  END IF;
END$$;

-- ====== SEED DÉMO (à adapter/supprimer en prod) ======
-- Nettoyage doux (optionnel)
-- TRUNCATE formations RESTART IDENTITY;

INSERT INTO formations
  (nom, type, duree, etablissement, ville, code_postal,
   plaisir_tags, competence_tags, utilite_tags, viabilite_data,
   confidence, image_url, website, ranking, metiers)
VALUES
  -- BUT Informatique (x3)
  ('BUT Informatique', 'BUT', 3, 'IUT Paris Rives de Seine', 'Paris', '75013',
   ARRAY['algorithmique','projets','code'],
   ARRAY['algo','programmation','debug'],
   ARRAY['éducation','numérique'],
   '{"taux_acces":0.62,"cout":"gratuit"}',
   0.86, NULL, NULL, '{"source":"L\'Etudiant","position":12,"year":2024}', ARRAY['Développeur','Data analyst']),
  ('BUT Informatique', 'BUT', 3, 'IUT Lyon 1', 'Villeurbanne', '69100',
   ARRAY['algorithmique','projets','code'],
   ARRAY['algo','programmation','bases de données'],
   ARRAY['innovation','numérique'],
   '{"taux_acces":0.58,"cout":"gratuit"}',
   0.83, NULL, NULL, '{"source":"L\'Etudiant","position":18,"year":2024}', ARRAY['Développeur','DevOps']),
  ('BUT Informatique', 'BUT', 3, 'IUT Bordeaux', 'Bordeaux', '33000',
   ARRAY['projets','code'],
   ARRAY['programmation','web'],
   ARRAY['services','éducation'],
   '{"taux_acces":0.55,"cout":"gratuit"}',
   0.8, NULL, NULL, '{"source":"L\'Etudiant","position":25,"year":2024}', ARRAY['Développeur web','Testeur QA']),

  -- BTS SIO
  ('BTS SIO', 'BTS', 2, 'Lycée Turgot', 'Paris', '75003',
   ARRAY['code','projets'],
   ARRAY['admin systèmes','réseaux','support'],
   ARRAY['services','TPE/PME'],
   '{"taux_acces":0.72,"cout":"gratuit"}',
   0.74, NULL, NULL, NULL, ARRAY['Technicien support','Admin système']),

  -- BTS Communication
  ('BTS Communication', 'BTS', 2, 'Lycée Édouard Herriot', 'Lyon', '69006',
   ARRAY['créa','groupe'],
   ARRAY['rédaction','PAO'],
   ARRAY['communication','associations'],
   '{"taux_acces":0.65,"cout":"gratuit"}',
   0.69, NULL, NULL, NULL, ARRAY['Chargé de comm','Community manager']),

  -- BTS Commerce International
  ('BTS Commerce International', 'BTS', 2, 'Lycée Montaigne', 'Bordeaux', '33000',
   ARRAY['relationnel','langues'],
   ARRAY['négociation','import-export'],
   ARRAY['commerce','international'],
   '{"taux_acces":0.6,"cout":"gratuit"}',
   0.66, NULL, NULL, NULL, ARRAY['Assistant export','Acheteur junior']),

  -- Licences
  ('Licence Lettres', 'LICENCE', 3, 'Univ. Bordeaux Montaigne', 'Pessac', '33600',
   ARRAY['écriture','lecture'],
   ARRAY['analyse','argumentation'],
   ARRAY['médiation','culture'],
   '{"taux_acces":0.7,"cout":"gratuit"}',
   0.62, NULL, NULL, NULL, ARRAY['Rédacteur','Médiateur culturel']),
  ('Licence Économie', 'LICENCE', 3, 'Université Paris Nanterre', 'Nanterre', '92000',
   ARRAY['analyse','lecture'],
   ARRAY['statistiques','microéconomie'],
   ARRAY['politiques publiques','banque'],
   '{"taux_acces":0.55,"cout":"gratuit"}',
   0.64, NULL, NULL, NULL, ARRAY['Analyste junior','Assistant étude']),

  -- SANTÉ
  ('IFSI Infirmier(ère)', 'SANTE', 3, 'AP-HP IFSI', 'Paris', '75019',
   ARRAY['aide','soin'],
   ARRAY['biologie','protocoles'],
   ARRAY['santé','hôpital'],
   '{"taux_acces":0.48,"cout":"gratuit"}',
   0.71, NULL, NULL, NULL, ARRAY['Infirmier','Cadre de santé']),

  -- CPGE
  ('CPGE ECG', 'CPGE', 2, 'Lycée du Parc', 'Lyon', '69006',
   ARRAY['éco','gestion'],
   ARRAY['maths','ESH'],
   ARRAY['écoles de commerce'],
   '{"taux_acces":0.35,"cout":"gratuit"}',
   0.6, NULL, NULL, '{"source":"Classement CPGE","position":8,"year":2024}', ARRAY['École de commerce']),
  ('CPGE PC', 'CPGE', 2, 'Lycée Camille Jullian', 'Bordeaux', '33000',
   ARRAY['physique','labo'],
   ARRAY['maths','physique'],
   ARRAY['écoles d’ingénieurs'],
   '{"taux_acces":0.4,"cout":"gratuit"}',
   0.61, NULL, NULL, '{"source":"Classement CPGE","position":22,"year":2024}', ARRAY['Ingénieur']),

  -- École d’ingénieurs (prépa intégrée)
  ('École d’Ingénieurs (prépa intégrée)', 'ECOLE_ING', 5, 'INSA Lyon', 'Villeurbanne', '69100',
   ARRAY['projets','tech'],
   ARRAY['maths','info','élec'],
   ARRAY['industrie','R&D'],
   '{"taux_acces":0.32,"cout":"modere"}',
   0.68, NULL, NULL, '{"source":"Usine Nouvelle","position":5,"year":2024}', ARRAY['Ingénieur R&D','Chef de projet'])
;

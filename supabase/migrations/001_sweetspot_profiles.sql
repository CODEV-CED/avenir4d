-- === SweetSpot Profiles Schema - Version optimisée ===
-- Extension UUID unifiée
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- === Table principale ===
CREATE TABLE sweetspot_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile4d JSONB NOT NULL,
  keywords JSONB NOT NULL DEFAULT '{}',
  qual JSONB NOT NULL,
  raw_choices JSONB,
  survey_version TEXT NOT NULL DEFAULT 'sjt_v2',
  user_agent TEXT,
  completion_time_ms INTEGER,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_survey_version CHECK (survey_version IN ('sjt_v2', 'import', 'manual')),
  CONSTRAINT positive_completion_time CHECK (completion_time_ms IS NULL OR completion_time_ms > 0)
);

-- === Indexes ===
CREATE INDEX idx_sweetspot_profiles_created_at ON sweetspot_profiles (created_at DESC);
CREATE INDEX idx_sweetspot_profiles_survey_version ON sweetspot_profiles (survey_version);

-- GIN pour JSONB
CREATE INDEX idx_sweetspot_profiles_profile4d_gin ON sweetspot_profiles USING GIN (profile4d);
CREATE INDEX idx_sweetspot_profiles_keywords_gin ON sweetspot_profiles USING GIN (keywords);

-- Indexes d'expression (optionnels - décommente si nécessaire)
-- CREATE INDEX idx_profile4d_conf ON sweetspot_profiles (((profile4d->>'confidence_avg')::float));
-- CREATE INDEX idx_profile4d_plaisir ON sweetspot_profiles (((profile4d->>'plaisir')::float));

-- === Trigger updated_at ===
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sweetspot_profiles_updated_at
  BEFORE UPDATE ON sweetspot_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- === Vue stats ===
CREATE VIEW sweetspot_stats AS
SELECT 
  COUNT(*) AS total_profiles,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS last_7d,
  AVG((profile4d->>'confidence_avg')::FLOAT) AS avg_confidence,
  survey_version,
  DATE_TRUNC('day', created_at) AS date
FROM sweetspot_profiles
GROUP BY survey_version, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Documentation de la vue
COMMENT ON VIEW sweetspot_stats IS 'KPIs quotidiens par version de questionnaire';

-- === Table erreurs ===
CREATE TABLE sweetspot_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES sweetspot_profiles(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT,
  error_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sweetspot_errors_created_at ON sweetspot_errors (created_at DESC);
CREATE INDEX idx_sweetspot_errors_type ON sweetspot_errors (error_type);

-- === Fonction nettoyage ===
CREATE OR REPLACE FUNCTION cleanup_old_errors()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sweetspot_errors WHERE created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- === RLS ===
ALTER TABLE sweetspot_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sweetspot_errors ENABLE ROW LEVEL SECURITY;

-- Lecture publique (ok si data non sensible)
CREATE POLICY "Public read access" ON sweetspot_profiles FOR SELECT USING (true);

-- Insert via service role UNIQUEMENT (pas de policy INSERT)
-- => Insère depuis une route server avec supabaseAdmin (service role), qui bypass RLS.

-- Logs erreurs: admin only
CREATE POLICY "Admin only errors" ON sweetspot_errors
FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'email' IN ('admin@example.com'));

-- === Commentaires documentation ===
COMMENT ON TABLE sweetspot_profiles IS 'Profils SweetSpot générés par le questionnaire SJT';
COMMENT ON COLUMN sweetspot_profiles.profile4d IS 'Scores 4D: plaisir, competence, utilite, viabilite (0-1) + confidence_avg (1-5)';
COMMENT ON COLUMN sweetspot_profiles.keywords IS 'Mots-clés extraits par dimension: {plaisir: [..], competence: [..], ...}';
COMMENT ON COLUMN sweetspot_profiles.qual IS 'Réponses qualitatives: dimancheMatin, algoPersonnel, talentReconnu, indignationMax';
COMMENT ON COLUMN sweetspot_profiles.raw_choices IS 'Choix SJT bruts pour re-calculs: [{questionId, optionId, confidence}, ...]';
COMMENT ON COLUMN sweetspot_profiles.idempotency_key IS 'Clé unique pour éviter doublons (optionnel)';

-- === Seed dev (à retirer en prod) ===
INSERT INTO sweetspot_profiles (profile4d, keywords, qual, survey_version, completion_time_ms) VALUES
(
  '{"plaisir": 0.74, "competence": 0.82, "utilite": 0.68, "viabilite": 0.71, "confidence_avg": 4.2, "version": 1, "source": "sjt_v2"}',
  '{"plaisir": ["créativité", "musique", "projets"], "competence": ["code", "debug", "architecture"], "utilite": ["éducation", "open source"], "viabilite": ["freelance", "remote"]}',
  '{"dimancheMatin": "Je code des petits projets perso et j''explore des nouvelles libs", "algoPersonnel": "Vidéos de vulgarisation tech, design patterns", "talentReconnu": "Expliquer simplement, structurer le code", "indignationMax": "Inégalités d''accès à l''éducation numérique"}',
  'sjt_v2',
  1247000
);
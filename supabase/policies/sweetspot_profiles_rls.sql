-- Active la sécurité au niveau des lignes (RLS) pour la table des profils.
-- Toutes les requêtes (SELECT, INSERT, UPDATE, DELETE) seront bloquées par défaut,
-- sauf si une "policy" autorise explicitement l'opération.
alter table public.sweetspot_profiles enable row level security;

-- Crée une policy nommée "sjt_profiles_select_dev".
-- Cette policy s'applique uniquement aux opérations de LECTURE (SELECT).
-- Elle autorise les utilisateurs anonymes ("to anon") à lire les lignes
-- si la condition "using (true)" est remplie.
-- "true" signifie que la condition est toujours vraie, donc toutes les lignes sont lisibles.
create policy "sjt_profiles_select_dev"
on public.sweetspot_profiles
for select
to anon
using (true);

-- NOTE POUR LA PRODUCTION :
-- Si vous aviez une colonne `user_id` dans la table `sweetspot_profiles`
-- et que seuls les utilisateurs connectés pouvaient voir leur propre profil,
-- la policy ressemblerait à ceci :
/*
create policy "sjt_profiles_select_prod_owner_only"
on public.sweetspot_profiles
for select
to authenticated -- La policy s'applique aux utilisateurs connectés
using (auth.uid() = user_id); -- La condition est que l'ID de l'utilisateur authentifié corresponde à celui de la ligne
*/

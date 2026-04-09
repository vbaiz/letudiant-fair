-- ═══════════════════════════════════════════════════════════════════════════
-- L'ÉTUDIANT SALONS — Comprehensive Seed Data
-- Run AFTER schema.sql AND migrations/002_appointments_consent.sql
-- Contains: 5 events · 30 schools · ~100 formations · stands · sessions
-- Simulated data — see DELIVERABLE_STUDENT_PROFILES.html for assumptions
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── EVENTS (5 total — 3 already in schema.sql, 2 new) ────────────────────────
insert into public.events (id, name, city, event_date, address, description) values
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Salon de l''Étudiant Paris',    'Paris',     '2026-04-18', 'Palais des Congrès, Porte Maillot',       'Le plus grand salon d''orientation de France — 280+ établissements'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Salon de l''Étudiant Lyon',     'Lyon',      '2026-05-09', 'Centre de Congrès de Lyon, Cité Internationale', 'Rencontrez 180 établissements du supérieur'),
  ('a1b2c3d4-0000-0000-0000-000000000003', 'Salon de l''Étudiant Bordeaux', 'Bordeaux',  '2026-05-23', 'Parc des Expositions de Bordeaux',        'Orientation et formations dans le Sud-Ouest'),
  ('a1b2c3d4-0000-0000-0000-000000000004', 'Salon de l''Étudiant Nantes',   'Nantes',    '2026-06-06', 'Exponantes, Parc des Expositions',        '150 établissements, focus Pays de la Loire et Grand Ouest'),
  ('a1b2c3d4-0000-0000-0000-000000000005', 'Salon de l''Étudiant Marseille','Marseille', '2026-06-20', 'Parc Chanot, Rond-Point du Prado',        'Orientation et grandes écoles en région PACA')
on conflict (id) do update set
  name = excluded.name,
  address = excluded.address,
  description = excluded.description;

-- ─── SCHOOLS (30 total — 12 already in schema.sql, 18 new) ───────────────────

-- Existing 12 re-inserted with on conflict do nothing
insert into public.schools (id, name, type, city, website, description, target_levels, target_fields, target_regions, nb_accepted_bac_g, nb_accepted_bac_t, nb_accepted_bac_p, rate_professional_insertion, tuition_fee, apprenticeship, parcoursup, scholarship_allowed) values
  ('b1b2c3d4-0000-0000-0000-000000000001', 'Sciences Po Paris',   'Grande École',       'Paris',           'https://sciencespo.fr',            'École de sciences politiques et de gouvernance mondiale',                ARRAY['terminale','post-bac'],              ARRAY['Droit et Sciences Politiques','Économie et Gestion'],                   ARRAY['Île-de-France'],               180, 20, 15,  94.5, 14200, false, true,  true),
  ('b1b2c3d4-0000-0000-0000-000000000002', 'HEC Paris',           'Grande École',       'Jouy-en-Josas',   'https://hec.fr',                   'L''une des meilleures écoles de management au monde',                    ARRAY['post-bac','bac+2'],                 ARRAY['Économie et Gestion','Commerce et Marketing'],                          ARRAY['Île-de-France'],               150, 10,  5,  98.0, 16500, false, false, false),
  ('b1b2c3d4-0000-0000-0000-000000000003', 'CentraleSupélec',     'École d''Ingénieurs','Gif-sur-Yvette',  'https://centralesupelec.fr',       'Grande école d''ingénieurs généralistes de référence',                   ARRAY['post-bac','bac+2'],                 ARRAY['Sciences et Technologies','Informatique et Numérique'],                 ARRAY['Île-de-France'],               200, 50, 10,  97.0,  3770, false, false, false),
  ('b1b2c3d4-0000-0000-0000-000000000004', 'ESSEC Business School','Grande École',      'Cergy',           'https://essec.edu',                'École de management internationale reconnue mondialement',               ARRAY['post-bac','bac+2'],                 ARRAY['Commerce et Marketing','Économie et Gestion'],                          ARRAY['Île-de-France','International'],120, 15,  8,  96.0, 15800, true,  false, false),
  ('b1b2c3d4-0000-0000-0000-000000000005', 'Université Paris-Saclay','Université',      'Gif-sur-Yvette',  'https://universite-paris-saclay.fr','Première université française selon les classements mondiaux',           ARRAY['terminale','post-bac','bac+2','bac+3'], ARRAY['Sciences et Technologies','Santé','Informatique et Numérique'],      ARRAY['Île-de-France'],               350, 80, 60,  89.0,   170, false, true,  true),
  ('b1b2c3d4-0000-0000-0000-000000000006', 'EPITECH',             'École Spécialisée',  'Paris',           'https://epitech.eu',               'École de l''innovation et de l''expertise informatique',                 ARRAY['terminale','post-bac'],             ARRAY['Informatique et Numérique'],                                            ARRAY['National'],                    400,100, 50,  95.0,  8350, true,  false, false),
  ('b1b2c3d4-0000-0000-0000-000000000007', 'IUT Paris-Rives de Seine','IUT',            'Paris',           'https://iut.parisdescartes.fr',    'Institut Universitaire de Technologie pluridisciplinaire',               ARRAY['terminale','post-bac'],             ARRAY['Informatique et Numérique','Commerce et Marketing','Sciences et Technologies'], ARRAY['Île-de-France'],          200,150,100,  87.0,   170, true,  true,  true),
  ('b1b2c3d4-0000-0000-0000-000000000008', 'INSEAD',              'Grande École',       'Fontainebleau',   'https://insead.edu',               'L''école de business la plus internationale au monde',                   ARRAY['bac+5'],                            ARRAY['Économie et Gestion','Commerce et Marketing'],                          ARRAY['International'],                50,  5,  5,  99.0, 92000, false, false, false),
  ('b1b2c3d4-0000-0000-0000-000000000009', 'École Normale Supérieure','Grande École',   'Paris',           'https://ens.fr',                   'Former les chercheurs et enseignants de demain',                         ARRAY['post-bac','bac+2'],                 ARRAY['Lettres et Sciences Humaines','Sciences et Technologies'],               ARRAY['Île-de-France'],                80, 10,  5,  92.0,     0, false, false, false),
  ('b1b2c3d4-0000-0000-0000-000000000010', 'ESCP Business School','Grande École',       'Paris',           'https://escp.eu',                  'La plus ancienne école de commerce du monde',                            ARRAY['post-bac','bac+2'],                 ARRAY['Commerce et Marketing','Économie et Gestion'],                          ARRAY['Île-de-France','International'],130, 12,  6,  95.5, 14900, true,  false, false),
  ('b1b2c3d4-0000-0000-0000-000000000011', 'Université de Bordeaux','Université',       'Bordeaux',        'https://u-bordeaux.fr',            'Grande université pluridisciplinaire du Sud-Ouest',                      ARRAY['terminale','post-bac','bac+2','bac+3'], ARRAY['Santé','Droit et Sciences Politiques','Sciences et Technologies'],   ARRAY['Nouvelle-Aquitaine'],          400,100, 80,  85.0,   170, false, true,  true),
  ('b1b2c3d4-0000-0000-0000-000000000012', 'emlyon business school','Grande École',     'Lyon',            'https://em-lyon.com',              'École de management entrepreneuriale et internationale',                 ARRAY['post-bac','bac+2'],                 ARRAY['Commerce et Marketing','Économie et Gestion'],                          ARRAY['Auvergne-Rhône-Alpes'],        110, 15, 10,  93.0, 14500, true,  false, false)
on conflict (id) do nothing;

-- New 18 schools
insert into public.schools (id, name, type, city, website, description, target_levels, target_fields, target_regions, nb_accepted_bac_g, nb_accepted_bac_t, nb_accepted_bac_p, rate_professional_insertion, tuition_fee, apprenticeship, parcoursup, scholarship_allowed) values
  -- Design schools (for Léa Moreau persona)
  ('b1b2c3d4-0000-0000-0000-000000000013', 'ENSAD — École Nationale Supérieure des Arts Décoratifs', 'École d''Art', 'Paris', 'https://ensad.fr',
   'École nationale de référence en arts appliqués et design',
   ARRAY['post-bac','bac+2'], ARRAY['Art et Design','Architecture'], ARRAY['Île-de-France'],
   80, 10, 5, 91.0, 500, false, false, true),

  ('b1b2c3d4-0000-0000-0000-000000000014', 'École Boulle', 'École d''Art', 'Paris', 'https://ecole-boulle.org',
   'École nationale des arts de l''ameublement et des métiers d''art',
   ARRAY['terminale','post-bac'], ARRAY['Art et Design','Architecture'], ARRAY['Île-de-France'],
   120, 30, 15, 89.0, 400, false, true, true),

  ('b1b2c3d4-0000-0000-0000-000000000015', 'ENSA Paris-Belleville', 'École d''Architecture', 'Paris', 'https://paris-belleville.archi.fr',
   'École nationale supérieure d''architecture, reconnue pour son ancrage urbain',
   ARRAY['post-bac','bac+2'], ARRAY['Architecture','Art et Design'], ARRAY['Île-de-France'],
   100, 5, 5, 88.0, 800, false, false, true),

  ('b1b2c3d4-0000-0000-0000-000000000016', 'ESAD Reims', 'École d''Art', 'Reims', 'https://esad-reims.fr',
   'École supérieure d''art et de design de Reims, DNA et DNSEP',
   ARRAY['post-bac','bac+2'], ARRAY['Art et Design'], ARRAY['Grand Est'],
   60, 10, 5, 85.0, 450, false, false, true),

  ('b1b2c3d4-0000-0000-0000-000000000017', 'STRATE École de Design', 'École Spécialisée', 'Sèvres', 'https://strate.design',
   'École de design produit et d''expérience utilisateur',
   ARRAY['post-bac','bac+2'], ARRAY['Art et Design','Informatique et Numérique'], ARRAY['Île-de-France'],
   80, 20, 10, 92.0, 10200, false, false, false),

  ('b1b2c3d4-0000-0000-0000-000000000018', 'ENSBA — École Nationale Supérieure des Beaux-Arts', 'École d''Art', 'Paris', 'https://beauxartsparis.fr',
   'La plus ancienne école nationale des beaux-arts de France',
   ARRAY['post-bac','bac+2'], ARRAY['Art et Design'], ARRAY['Île-de-France'],
   70, 5, 5, 82.0, 400, false, false, true),

  -- Engineering & Science
  ('b1b2c3d4-0000-0000-0000-000000000019', 'École Polytechnique', 'Grande École', 'Palaiseau', 'https://polytechnique.edu',
   'L''X — ingénieurs et scientifiques d''excellence au service de la nation',
   ARRAY['post-bac','bac+2'], ARRAY['Sciences et Technologies','Informatique et Numérique'], ARRAY['Île-de-France'],
   150, 20, 5, 98.5, 12000, false, false, false),

  ('b1b2c3d4-0000-0000-0000-000000000020', 'INSA Lyon', 'École d''Ingénieurs', 'Lyon', 'https://insa-lyon.fr',
   'Institut National des Sciences Appliquées, pluridisciplinaire et accessible post-bac',
   ARRAY['terminale','post-bac'], ARRAY['Sciences et Technologies','Informatique et Numérique'], ARRAY['Auvergne-Rhône-Alpes'],
   320, 80, 30, 96.0, 3770, true, true, true),

  ('b1b2c3d4-0000-0000-0000-000000000021', 'École des Mines de Paris — PSL', 'Grande École', 'Paris', 'https://minesparis.psl.eu',
   'Grande école d''ingénieurs, excellence en sciences et technologie',
   ARRAY['post-bac','bac+2'], ARRAY['Sciences et Technologies','Économie et Gestion'], ARRAY['Île-de-France'],
   100, 15, 5, 97.5, 3770, false, false, false),

  -- Law, Political Science
  ('b1b2c3d4-0000-0000-0000-000000000022', 'Sciences Po Lyon', 'Grande École', 'Lyon', 'https://sciencespo-lyon.fr',
   'Institut d''Études Politiques de Lyon, formation aux sciences sociales',
   ARRAY['terminale','post-bac'], ARRAY['Droit et Sciences Politiques','Économie et Gestion'], ARRAY['Auvergne-Rhône-Alpes'],
   200, 15, 10, 92.0, 3770, false, true, true),

  ('b1b2c3d4-0000-0000-0000-000000000023', 'Université Paris 1 Panthéon-Sorbonne', 'Université', 'Paris', 'https://univ-paris1.fr',
   'Première université de droit et sciences humaines en France',
   ARRAY['terminale','post-bac','bac+2','bac+3'], ARRAY['Droit et Sciences Politiques','Lettres et Sciences Humaines','Économie et Gestion'], ARRAY['Île-de-France'],
   400, 50, 40, 86.0, 170, false, true, true),

  -- Business
  ('b1b2c3d4-0000-0000-0000-000000000024', 'SKEMA Business School', 'Grande École', 'Sophia Antipolis', 'https://skema.edu',
   'École de management internationale avec 7 campus mondiaux',
   ARRAY['post-bac','bac+2'], ARRAY['Commerce et Marketing','Économie et Gestion'], ARRAY['PACA','International'],
   200, 20, 10, 94.0, 13500, true, false, false),

  ('b1b2c3d4-0000-0000-0000-000000000025', 'Audencia Nantes', 'Grande École', 'Nantes', 'https://audencia.com',
   'Grande école de management triple accréditée (AACSB, EQUIS, AMBA)',
   ARRAY['post-bac','bac+2'], ARRAY['Commerce et Marketing','Économie et Gestion'], ARRAY['Pays de la Loire'],
   120, 15, 8, 93.5, 13800, true, false, false),

  ('b1b2c3d4-0000-0000-0000-000000000026', 'KEDGE Business School', 'Grande École', 'Bordeaux', 'https://kedge.edu',
   'École de management internationale, campus Bordeaux et Marseille',
   ARRAY['post-bac','bac+2'], ARRAY['Commerce et Marketing','Économie et Gestion'], ARRAY['Nouvelle-Aquitaine','PACA'],
   180, 20, 10, 93.0, 13200, true, false, false),

  -- Health
  ('b1b2c3d4-0000-0000-0000-000000000027', 'Université Claude Bernard Lyon 1', 'Université', 'Lyon', 'https://univ-lyon1.fr',
   'Université sciences, santé et technologies — PASS et licences scientifiques',
   ARRAY['terminale','post-bac','bac+2','bac+3'], ARRAY['Santé','Sciences et Technologies','Informatique et Numérique'], ARRAY['Auvergne-Rhône-Alpes'],
   350, 80, 60, 88.0, 170, false, true, true),

  ('b1b2c3d4-0000-0000-0000-000000000028', 'Université Aix-Marseille', 'Université', 'Marseille', 'https://univ-amu.fr',
   'Plus grande université francophone par ses effectifs',
   ARRAY['terminale','post-bac','bac+2','bac+3'], ARRAY['Droit et Sciences Politiques','Santé','Sciences et Technologies','Lettres et Sciences Humaines'], ARRAY['PACA'],
   500,120, 90, 84.0, 170, false, true, true),

  -- Regional & IUT
  ('b1b2c3d4-0000-0000-0000-000000000029', 'IUT de Nantes', 'IUT', 'Nantes', 'https://iut-nantes.univ-nantes.fr',
   'Institut Universitaire de Technologie de Nantes, 10 départements BUT',
   ARRAY['terminale','post-bac'], ARRAY['Informatique et Numérique','Sciences et Technologies','Commerce et Marketing'], ARRAY['Pays de la Loire'],
   300,200,100, 88.0, 170, true, true, true),

  ('b1b2c3d4-0000-0000-0000-000000000030', 'Université de Nantes', 'Université', 'Nantes', 'https://univ-nantes.fr',
   'Université pluridisciplinaire du Grand Ouest, forte en droit et lettres',
   ARRAY['terminale','post-bac','bac+2','bac+3'], ARRAY['Droit et Sciences Politiques','Lettres et Sciences Humaines','Santé'], ARRAY['Pays de la Loire'],
   400, 80, 70, 83.0, 170, false, true, true)
on conflict (id) do nothing;

-- ─── FORMATIONS (~100 total) ──────────────────────────────────────────────────

-- Sciences Po Paris (already has 2 in schema.sql)
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000001', 'Bachelor en Sciences Politiques',    '3 ans', 'Licence', ARRAY['Droit et Sciences Politiques'],                      'Concours d''entrée + dossier',               'RNCP35178', 'Présentiel', 14200),
  ('b1b2c3d4-0000-0000-0000-000000000001', 'Master Affaires Européennes',        '2 ans', 'Master',  ARRAY['Droit et Sciences Politiques','Économie et Gestion'], 'Bac+3 en sciences sociales',                 'RNCP35179', 'Présentiel', 14200),
  ('b1b2c3d4-0000-0000-0000-000000000001', 'Master Relations Internationales',   '2 ans', 'Master',  ARRAY['Droit et Sciences Politiques'],                      'Bac+3 + expérience internationale',          'RNCP35183', 'Présentiel', 14200),
  ('b1b2c3d4-0000-0000-0000-000000000001', 'Master Journalisme et Communication','2 ans', 'Master',  ARRAY['Lettres et Sciences Humaines'],                      'Concours interne + dossier',                 'RNCP35184', 'Présentiel', 14200)
on conflict do nothing;

-- HEC Paris
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000002', 'Grande École Programme (HEC)',       '3 ans', 'Master',  ARRAY['Économie et Gestion'],                               'Classe prépa ECG ou admissions parallèles',  'RNCP35180', 'Présentiel', 16500),
  ('b1b2c3d4-0000-0000-0000-000000000002', 'MBA HEC Paris',                      '16 mois','Master', ARRAY['Économie et Gestion','Commerce et Marketing'],       'Bac+4 minimum + GMAT/GRE',                   'RNCP35185', 'Présentiel', 68000),
  ('b1b2c3d4-0000-0000-0000-000000000002', 'MSc Strategic Management',           '1 an',  'Master',  ARRAY['Économie et Gestion'],                               'Bac+4 en gestion ou équivalent',             'RNCP35186', 'Présentiel', 19500)
on conflict do nothing;

-- CentraleSupélec
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000003', 'Diplôme d''Ingénieur CentraleSupélec','5 ans', 'Master', ARRAY['Sciences et Technologies','Informatique et Numérique'],'Classe prépa MP/PC/PSI',                      'RNCP35181', 'Présentiel', 3770),
  ('b1b2c3d4-0000-0000-0000-000000000003', 'Master of Science in Artificial Intelligence','1 an','Master',ARRAY['Informatique et Numérique','Sciences et Technologies'],'Bac+4 en informatique ou mathématiques',  'RNCP35187', 'Présentiel', 9500),
  ('b1b2c3d4-0000-0000-0000-000000000003', 'MSc Énergie et Développement Durable','1 an', 'Master',  ARRAY['Sciences et Technologies'],                          'Bac+4 en physique ou ingénierie',            'RNCP35188', 'Présentiel', 9500)
on conflict do nothing;

-- ESSEC
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000004', 'Grande École Programme (ESSEC)',     '4 ans', 'Master',  ARRAY['Commerce et Marketing','Économie et Gestion'],       'Classe prépa ECG ou CPGE scientifique',      'RNCP35189', 'Présentiel', 15800),
  ('b1b2c3d4-0000-0000-0000-000000000004', 'Bachelor in Business Administration','3 ans', 'Licence', ARRAY['Commerce et Marketing'],                             'Baccalauréat + dossier ESSEC',               'RNCP35190', 'Présentiel+En ligne', 14500),
  ('b1b2c3d4-0000-0000-0000-000000000004', 'MSc Data Science & Business Analytics','1 an','Master',  ARRAY['Informatique et Numérique','Économie et Gestion'],   'Bac+4 en maths/info/gestion',                'RNCP35191', 'Présentiel', 18000)
on conflict do nothing;

-- Université Paris-Saclay
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000005', 'Licence Sciences',                   '3 ans', 'Licence', ARRAY['Sciences et Technologies'],                          'Baccalauréat scientifique',                  'RNCP35030', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000005', 'Master Informatique',                '2 ans', 'Master',  ARRAY['Informatique et Numérique'],                         'Licence informatique ou équivalent',         'RNCP35031', 'Présentiel', 243),
  ('b1b2c3d4-0000-0000-0000-000000000005', 'PASS — Parcours Accès Santé',        '1 an',  'Licence', ARRAY['Santé'],                                             'Baccalauréat + Parcoursup',                  'RNCP35032', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000005', 'Master Mathématiques et Applications','2 ans', 'Master', ARRAY['Sciences et Technologies'],                          'Licence de mathématiques',                   'RNCP35192', 'Présentiel', 243),
  ('b1b2c3d4-0000-0000-0000-000000000005', 'Licence Physique-Chimie',            '3 ans', 'Licence', ARRAY['Sciences et Technologies'],                          'Baccalauréat scientifique spé physique-chimie','RNCP35193','Présentiel', 170)
on conflict do nothing;

-- EPITECH
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000006', 'Expert en Technologies de l''Information','5 ans','Master',ARRAY['Informatique et Numérique'],                       'Baccalauréat toutes séries',                 'RNCP31118', 'Présentiel + Projets', 8350),
  ('b1b2c3d4-0000-0000-0000-000000000006', 'Bachelor Développement Web & Mobile','3 ans','Licence',   ARRAY['Informatique et Numérique'],                         'Bac + tests de recrutement',                 'RNCP35194', 'Présentiel + Alternance', 7200),
  ('b1b2c3d4-0000-0000-0000-000000000006', 'MSc Cybersécurité',                  '2 ans', 'Master',  ARRAY['Informatique et Numérique'],                         'Bac+3 en informatique',                      'RNCP35195', 'Présentiel', 9500)
on conflict do nothing;

-- IUT Paris-Rives de Seine
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000007', 'BUT Informatique',                   '3 ans', 'BUT',     ARRAY['Informatique et Numérique'],                         'Baccalauréat + Parcoursup',                  'RNCP35028', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000007', 'BUT Techniques de Commercialisation','3 ans', 'BUT',     ARRAY['Commerce et Marketing'],                             'Baccalauréat + Parcoursup',                  'RNCP35029', 'Présentiel + Alternance', 170),
  ('b1b2c3d4-0000-0000-0000-000000000007', 'BUT Gestion des Entreprises et des Administrations','3 ans','BUT',ARRAY['Économie et Gestion'],                     'Baccalauréat + Parcoursup',                  'RNCP35196', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000007', 'BUT Métiers du Multimédia et de l''Internet','3 ans','BUT',ARRAY['Informatique et Numérique','Art et Design'],       'Baccalauréat + Parcoursup',                  'RNCP35197', 'Présentiel', 170)
on conflict do nothing;

-- ENS Paris
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000009', 'Diplôme ENS — Lettres',              '3 ans', 'Master',  ARRAY['Lettres et Sciences Humaines'],                      'Concours ENS Ulm (khâgne)',                  'RNCP35198', 'Présentiel', 0),
  ('b1b2c3d4-0000-0000-0000-000000000009', 'Diplôme ENS — Sciences',             '3 ans', 'Master',  ARRAY['Sciences et Technologies'],                          'Concours ENS Ulm (taupe)',                   'RNCP35199', 'Présentiel', 0),
  ('b1b2c3d4-0000-0000-0000-000000000009', 'Master Philosophie',                 '2 ans', 'Master',  ARRAY['Lettres et Sciences Humaines'],                      'Licence de philosophie',                     'RNCP35200', 'Présentiel', 0)
on conflict do nothing;

-- ESCP
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000010', 'Programme Grande École ESCP',        '3 ans', 'Master',  ARRAY['Commerce et Marketing','Économie et Gestion'],       'Classe prépa ECG ou admissions parallèles',  'RNCP35201', 'Présentiel', 14900),
  ('b1b2c3d4-0000-0000-0000-000000000010', 'Bachelor in Management',             '3 ans', 'Licence', ARRAY['Commerce et Marketing'],                             'Baccalauréat + dossier',                     'RNCP35202', 'Présentiel', 13500),
  ('b1b2c3d4-0000-0000-0000-000000000010', 'MSc International Management',       '1 an',  'Master',  ARRAY['Économie et Gestion'],                               'Bac+4 en gestion ou commerce',               'RNCP35203', 'Présentiel', 16000)
on conflict do nothing;

-- Université de Bordeaux
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000011', 'PACES / PASS Bordeaux',              '1 an',  'Licence', ARRAY['Santé'],                                             'Baccalauréat + Parcoursup',                  'RNCP35204', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000011', 'Licence Droit',                      '3 ans', 'Licence', ARRAY['Droit et Sciences Politiques'],                      'Baccalauréat + Parcoursup',                  'RNCP35205', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000011', 'Master Droit des Affaires',          '2 ans', 'Master',  ARRAY['Droit et Sciences Politiques'],                      'Licence de droit',                           'RNCP35206', 'Présentiel', 243),
  ('b1b2c3d4-0000-0000-0000-000000000011', 'Licence Sciences de la Vie',         '3 ans', 'Licence', ARRAY['Santé','Sciences et Technologies'],                  'Baccalauréat scientifique',                  'RNCP35207', 'Présentiel', 170)
on conflict do nothing;

-- emlyon
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000012', 'Programme Grande École emlyon',      '5 ans', 'Master',  ARRAY['Commerce et Marketing','Économie et Gestion'],       'Classe prépa ou admissions parallèles',      'RNCP35208', 'Présentiel', 14500),
  ('b1b2c3d4-0000-0000-0000-000000000012', 'Bachelor in Business',               '3 ans', 'Licence', ARRAY['Commerce et Marketing'],                             'Baccalauréat + concours',                    'RNCP35209', 'Présentiel + International', 13000),
  ('b1b2c3d4-0000-0000-0000-000000000012', 'MSc Entrepreneurship & Innovation',  '1 an',  'Master',  ARRAY['Économie et Gestion'],                               'Bac+4 en gestion',                           'RNCP35210', 'Présentiel', 15000)
on conflict do nothing;

-- ENSAD (Design — Léa's school)
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000013', 'DSAA Design — option Architecture Intérieure','5 ans','Master', ARRAY['Art et Design','Architecture'],               'Dossier artistique + entretien',             'RNCP35211', 'Atelier + Présentiel', 500),
  ('b1b2c3d4-0000-0000-0000-000000000013', 'DSAA Design — option Objet',         '5 ans', 'Master',  ARRAY['Art et Design'],                                     'Dossier artistique + entretien',             'RNCP35212', 'Atelier + Présentiel', 500),
  ('b1b2c3d4-0000-0000-0000-000000000013', 'DSAA Design — option Communication', '5 ans', 'Master',  ARRAY['Art et Design'],                                     'Dossier artistique + entretien',             'RNCP35213', 'Atelier + Présentiel', 500),
  ('b1b2c3d4-0000-0000-0000-000000000013', 'DSAA Design — option Textile et Matière','5 ans','Master',ARRAY['Art et Design'],                                    'Dossier artistique + entretien',             'RNCP35214', 'Atelier + Présentiel', 500)
on conflict do nothing;

-- École Boulle
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000014', 'BTS Design de Produits',             '2 ans', 'BTS',     ARRAY['Art et Design'],                                     'Bac + dossier + épreuves d''admission',      'RNCP35215', 'Présentiel + Atelier', 400),
  ('b1b2c3d4-0000-0000-0000-000000000014', 'BTS Design d''Espace',               '2 ans', 'BTS',     ARRAY['Art et Design','Architecture'],                      'Bac + dossier + épreuves d''admission',      'RNCP35216', 'Présentiel + Atelier', 400),
  ('b1b2c3d4-0000-0000-0000-000000000014', 'DSAA Design de Mobilier',            '5 ans', 'Master',  ARRAY['Art et Design'],                                     'BTS design ou MANAA + concours',             'RNCP35217', 'Atelier spécialisé', 400),
  ('b1b2c3d4-0000-0000-0000-000000000014', 'CAP Ébéniste',                       '2 ans', 'CAP',     ARRAY['Art et Design'],                                     'Brevet des collèges ou baccalauréat',        'RNCP35218', 'Alternance', 0)
on conflict do nothing;

-- ENSA Paris-Belleville
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000015', 'Licence Architecture (L3)',          '3 ans', 'Licence', ARRAY['Architecture'],                                      'Parcoursup + tests d''aptitude (APB)',        'RNCP35219', 'Atelier + Présentiel', 800),
  ('b1b2c3d4-0000-0000-0000-000000000015', 'Master Architecture HMNOP',         '2 ans', 'Master',  ARRAY['Architecture'],                                      'Licence Architecture (Bac+3)',               'RNCP35220', 'Atelier + Présentiel', 800),
  ('b1b2c3d4-0000-0000-0000-000000000015', 'DPEA Architecture et Philosophie',  '1 an',  'Master',  ARRAY['Architecture','Lettres et Sciences Humaines'],        'Master Architecture + dossier',              'RNCP35221', 'Présentiel', 800)
on conflict do nothing;

-- ESAD Reims
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000016', 'DNA — Diplôme National d''Art (Design Graphique)','3 ans','Licence',ARRAY['Art et Design'],                          'Classe prépa art ou bac + concours',         'RNCP35222', 'Atelier + Présentiel', 450),
  ('b1b2c3d4-0000-0000-0000-000000000016', 'DNSEP — Design Objet',              '5 ans', 'Master',  ARRAY['Art et Design'],                                     'DNA + concours d''entrée',                   'RNCP35223', 'Atelier + Présentiel', 450),
  ('b1b2c3d4-0000-0000-0000-000000000016', 'DNSEP — Communication Visuelle',    '5 ans', 'Master',  ARRAY['Art et Design'],                                     'DNA + concours d''entrée',                   'RNCP35224', 'Atelier + Présentiel', 450)
on conflict do nothing;

-- STRATE
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000017', 'Bachelor Design Produit & Mobilier', '3 ans', 'Licence', ARRAY['Art et Design'],                                     'Bac + portfolio + entretien',                'RNCP35225', 'Atelier + Présentiel', 10200),
  ('b1b2c3d4-0000-0000-0000-000000000017', 'Bachelor UX & Design d''Interaction','3 ans','Licence',  ARRAY['Art et Design','Informatique et Numérique'],          'Bac + portfolio + entretien',                'RNCP35226', 'Atelier + Présentiel', 10200),
  ('b1b2c3d4-0000-0000-0000-000000000017', 'Master Design Stratégique',          '2 ans', 'Master',  ARRAY['Art et Design','Commerce et Marketing'],             'Bac+3 en design ou équivalent',              'RNCP35227', 'Présentiel', 11500)
on conflict do nothing;

-- École Polytechnique
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000019', 'Cycle Ingénieur Polytechnicien',     '4 ans', 'Master',  ARRAY['Sciences et Technologies','Informatique et Numérique'],'Concours commun polytechnique (PC/MP/PSI/TSI)','RNCP35228','Présentiel', 12000),
  ('b1b2c3d4-0000-0000-0000-000000000019', 'Bachelor of Science (X-Bachelor)',   '3 ans', 'Licence', ARRAY['Sciences et Technologies'],                          'Baccalauréat international ou français',     'RNCP35229', 'Présentiel + International', 12000),
  ('b1b2c3d4-0000-0000-0000-000000000019', 'Master Artificial Intelligence',     '2 ans', 'Master',  ARRAY['Informatique et Numérique'],                         'Bac+4 en informatique ou mathématiques',     'RNCP35230', 'Présentiel', 12000)
on conflict do nothing;

-- INSA Lyon
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000020', 'Diplôme d''Ingénieur — Génie Informatique','5 ans','Master',ARRAY['Informatique et Numérique'],                      'Baccalauréat scientifique + Parcoursup',     'RNCP35231', 'Présentiel', 3770),
  ('b1b2c3d4-0000-0000-0000-000000000020', 'Diplôme d''Ingénieur — Génie Civil', '5 ans', 'Master',  ARRAY['Sciences et Technologies'],                          'Baccalauréat scientifique + Parcoursup',     'RNCP35232', 'Présentiel', 3770),
  ('b1b2c3d4-0000-0000-0000-000000000020', 'Diplôme d''Ingénieur — Biosciences', '5 ans', 'Master',  ARRAY['Sciences et Technologies','Santé'],                  'Baccalauréat scientifique + Parcoursup',     'RNCP35233', 'Présentiel', 3770),
  ('b1b2c3d4-0000-0000-0000-000000000020', 'Diplôme d''Ingénieur en alternance', '5 ans', 'Master',  ARRAY['Sciences et Technologies'],                          'Baccalauréat scientifique + Parcoursup',     'RNCP35234', 'Alternance', 0)
on conflict do nothing;

-- Sciences Po Lyon
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000022', 'Bachelor Sciences Politiques',       '3 ans', 'Licence', ARRAY['Droit et Sciences Politiques'],                      'Concours commun IEP ou Parcoursup',          'RNCP35235', 'Présentiel', 3770),
  ('b1b2c3d4-0000-0000-0000-000000000022', 'Master Politiques Publiques',        '2 ans', 'Master',  ARRAY['Droit et Sciences Politiques','Économie et Gestion'], 'Bac+3 en sciences humaines et sociales',     'RNCP35236', 'Présentiel', 3770),
  ('b1b2c3d4-0000-0000-0000-000000000022', 'Master Journalisme International',   '2 ans', 'Master',  ARRAY['Lettres et Sciences Humaines'],                      'Bac+3 + concours journalisme',               'RNCP35237', 'Présentiel', 3770)
on conflict do nothing;

-- Université Paris 1
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000023', 'Licence Droit',                      '3 ans', 'Licence', ARRAY['Droit et Sciences Politiques'],                      'Baccalauréat + Parcoursup',                  'RNCP35238', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000023', 'Licence Histoire de l''Art et Archéologie','3 ans','Licence',ARRAY['Lettres et Sciences Humaines','Art et Design'],  'Baccalauréat + Parcoursup',                  'RNCP35239', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000023', 'Master Droit International',         '2 ans', 'Master',  ARRAY['Droit et Sciences Politiques'],                      'Licence de droit',                           'RNCP35240', 'Présentiel', 243),
  ('b1b2c3d4-0000-0000-0000-000000000023', 'Master Économie Appliquée',          '2 ans', 'Master',  ARRAY['Économie et Gestion'],                               'Licence d''économie ou mathématiques',       'RNCP35241', 'Présentiel', 243)
on conflict do nothing;

-- SKEMA
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000024', 'Programme Grande École SKEMA',       '5 ans', 'Master',  ARRAY['Commerce et Marketing','Économie et Gestion'],       'Classe prépa ou concours SKEMA',             'RNCP35242', 'Présentiel + International', 13500),
  ('b1b2c3d4-0000-0000-0000-000000000024', 'MSc Digital Marketing & Analytics',  '1 an',  'Master',  ARRAY['Commerce et Marketing','Informatique et Numérique'], 'Bac+4 en marketing ou gestion',              'RNCP35243', 'Présentiel', 14000),
  ('b1b2c3d4-0000-0000-0000-000000000024', 'Bachelor Management International',  '3 ans', 'Licence', ARRAY['Commerce et Marketing'],                             'Baccalauréat + dossier',                     'RNCP35244', 'Présentiel + International', 12000)
on conflict do nothing;

-- Audencia
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000025', 'Programme Grande École Audencia',    '5 ans', 'Master',  ARRAY['Commerce et Marketing','Économie et Gestion'],       'Classe prépa ECG + concours ECRICOME',       'RNCP35245', 'Présentiel + International', 13800),
  ('b1b2c3d4-0000-0000-0000-000000000025', 'MSc Sustainable Finance',            '1 an',  'Master',  ARRAY['Économie et Gestion'],                               'Bac+4 en finance ou gestion',                'RNCP35246', 'Présentiel', 14500),
  ('b1b2c3d4-0000-0000-0000-000000000025', 'Bachelor Gestion de l''Entreprise',  '3 ans', 'Licence', ARRAY['Économie et Gestion'],                               'Baccalauréat + Parcoursup',                  'RNCP35247', 'Présentiel', 11500)
on conflict do nothing;

-- KEDGE
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000026', 'Programme Grande École KEDGE',       '5 ans', 'Master',  ARRAY['Commerce et Marketing','Économie et Gestion'],       'Classe prépa ou admissions parallèles',      'RNCP35248', 'Présentiel + International', 13200),
  ('b1b2c3d4-0000-0000-0000-000000000026', 'MSc Tourism & Hospitality Management','1 an', 'Master',  ARRAY['Commerce et Marketing'],                             'Bac+4 en tourisme, gestion ou marketing',    'RNCP35249', 'Présentiel', 12500),
  ('b1b2c3d4-0000-0000-0000-000000000026', 'Bachelor International Business',    '3 ans', 'Licence', ARRAY['Commerce et Marketing'],                             'Baccalauréat + concours ou dossier',         'RNCP35250', 'Présentiel + International', 11000)
on conflict do nothing;

-- Université Claude Bernard Lyon 1
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000027', 'PASS Lyon 1',                        '1 an',  'Licence', ARRAY['Santé'],                                             'Baccalauréat + Parcoursup',                  'RNCP35251', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000027', 'Licence Informatique',               '3 ans', 'Licence', ARRAY['Informatique et Numérique'],                         'Baccalauréat + Parcoursup',                  'RNCP35252', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000027', 'Master Bioinformatique',             '2 ans', 'Master',  ARRAY['Santé','Informatique et Numérique'],                 'Licence en biologie ou informatique',        'RNCP35253', 'Présentiel', 243),
  ('b1b2c3d4-0000-0000-0000-000000000027', 'Licence Physique-Chimie',            '3 ans', 'Licence', ARRAY['Sciences et Technologies'],                          'Baccalauréat scientifique',                  'RNCP35254', 'Présentiel', 170)
on conflict do nothing;

-- Université Aix-Marseille
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000028', 'Licence Droit',                      '3 ans', 'Licence', ARRAY['Droit et Sciences Politiques'],                      'Baccalauréat + Parcoursup',                  'RNCP35255', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000028', 'PASS Aix-Marseille',                 '1 an',  'Licence', ARRAY['Santé'],                                             'Baccalauréat + Parcoursup',                  'RNCP35256', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000028', 'Licence Langues Étrangères Appliquées','3 ans','Licence',ARRAY['Lettres et Sciences Humaines'],                       'Baccalauréat + Parcoursup',                  'RNCP35257', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000028', 'Master Management des Organisations','2 ans', 'Master',  ARRAY['Économie et Gestion'],                               'Licence en gestion ou équivalent',           'RNCP35258', 'Présentiel', 243)
on conflict do nothing;

-- IUT de Nantes
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000029', 'BUT Informatique Nantes',            '3 ans', 'BUT',     ARRAY['Informatique et Numérique'],                         'Baccalauréat + Parcoursup',                  'RNCP35259', 'Présentiel + Alternance', 170),
  ('b1b2c3d4-0000-0000-0000-000000000029', 'BUT Génie Électrique et Informatique Industrielle','3 ans','BUT',ARRAY['Sciences et Technologies','Informatique et Numérique'],'Baccalauréat scientifique + Parcoursup','RNCP35260','Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000029', 'BUT Chimie',                         '3 ans', 'BUT',     ARRAY['Sciences et Technologies'],                          'Baccalauréat scientifique + Parcoursup',     'RNCP35261', 'Présentiel', 170)
on conflict do nothing;

-- Université de Nantes
insert into public.formations (school_id, name, duration, level, fields, admission_requirements, rncp_code, study_modality, cost) values
  ('b1b2c3d4-0000-0000-0000-000000000030', 'Licence Droit',                      '3 ans', 'Licence', ARRAY['Droit et Sciences Politiques'],                      'Baccalauréat + Parcoursup',                  'RNCP35262', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000030', 'Licence LLCER Anglais',              '3 ans', 'Licence', ARRAY['Lettres et Sciences Humaines'],                      'Baccalauréat + Parcoursup',                  'RNCP35263', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000030', 'Licence Sciences et Techniques des Activités Physiques','3 ans','Licence',ARRAY['Santé'],                           'Baccalauréat + Parcoursup + tests sportifs','RNCP35264', 'Présentiel', 170),
  ('b1b2c3d4-0000-0000-0000-000000000030', 'Master MEEF — Enseignement',         '2 ans', 'Master',  ARRAY['Lettres et Sciences Humaines'],                      'Licence dans la discipline enseignée',       'RNCP35265', 'Présentiel', 243)
on conflict do nothing;

-- ─── STANDS ───────────────────────────────────────────────────────────────────

-- Paris event (already has 9 stands in schema.sql) — add design schools for Léa
insert into public.stands (event_id, school_id, location_x, location_y, category) values
  ('a1b2c3d4-0000-0000-0000-000000000001', 'b1b2c3d4-0000-0000-0000-000000000013', 100, 450, 'Écoles d''Art et Design'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'b1b2c3d4-0000-0000-0000-000000000014', 200, 450, 'Écoles d''Art et Design'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'b1b2c3d4-0000-0000-0000-000000000015', 300, 450, 'Écoles d''Architecture'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'b1b2c3d4-0000-0000-0000-000000000016', 400, 450, 'Écoles d''Art et Design'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'b1b2c3d4-0000-0000-0000-000000000017', 500, 450, 'Écoles d''Art et Design'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'b1b2c3d4-0000-0000-0000-000000000018', 100, 600, 'Écoles d''Art et Design'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'b1b2c3d4-0000-0000-0000-000000000019', 200, 600, 'Grandes Écoles'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'b1b2c3d4-0000-0000-0000-000000000021', 300, 600, 'Écoles d''Ingénieurs'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'b1b2c3d4-0000-0000-0000-000000000023', 400, 600, 'Universités'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'b1b2c3d4-0000-0000-0000-000000000024', 500, 600, 'Écoles de Commerce')
on conflict do nothing;

-- Lyon event
insert into public.stands (event_id, school_id, location_x, location_y, category) values
  ('a1b2c3d4-0000-0000-0000-000000000002', 'b1b2c3d4-0000-0000-0000-000000000012', 100, 150, 'Écoles de Commerce'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'b1b2c3d4-0000-0000-0000-000000000020', 200, 150, 'Écoles d''Ingénieurs'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'b1b2c3d4-0000-0000-0000-000000000022', 300, 150, 'Sciences Po & IEP'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'b1b2c3d4-0000-0000-0000-000000000027', 400, 150, 'Universités'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'b1b2c3d4-0000-0000-0000-000000000011', 200, 300, 'Universités')
on conflict do nothing;

-- Bordeaux event
insert into public.stands (event_id, school_id, location_x, location_y, category) values
  ('a1b2c3d4-0000-0000-0000-000000000003', 'b1b2c3d4-0000-0000-0000-000000000011', 100, 150, 'Universités'),
  ('a1b2c3d4-0000-0000-0000-000000000003', 'b1b2c3d4-0000-0000-0000-000000000026', 200, 150, 'Écoles de Commerce')
on conflict do nothing;

-- Nantes event
insert into public.stands (event_id, school_id, location_x, location_y, category) values
  ('a1b2c3d4-0000-0000-0000-000000000004', 'b1b2c3d4-0000-0000-0000-000000000025', 100, 150, 'Écoles de Commerce'),
  ('a1b2c3d4-0000-0000-0000-000000000004', 'b1b2c3d4-0000-0000-0000-000000000029', 200, 150, 'IUT & BTS'),
  ('a1b2c3d4-0000-0000-0000-000000000004', 'b1b2c3d4-0000-0000-0000-000000000030', 300, 150, 'Universités'),
  ('a1b2c3d4-0000-0000-0000-000000000004', 'b1b2c3d4-0000-0000-0000-000000000006', 400, 150, 'Écoles Spécialisées')
on conflict do nothing;

-- Marseille event
insert into public.stands (event_id, school_id, location_x, location_y, category) values
  ('a1b2c3d4-0000-0000-0000-000000000005', 'b1b2c3d4-0000-0000-0000-000000000028', 100, 150, 'Universités'),
  ('a1b2c3d4-0000-0000-0000-000000000005', 'b1b2c3d4-0000-0000-0000-000000000024', 200, 150, 'Écoles de Commerce'),
  ('a1b2c3d4-0000-0000-0000-000000000005', 'b1b2c3d4-0000-0000-0000-000000000001', 300, 150, 'Sciences Po & IEP')
on conflict do nothing;

-- ─── SESSIONS / CONFÉRENCES ───────────────────────────────────────────────────

-- Paris event (already has 5 in schema.sql) — add design-focused sessions for Léa
insert into public.sessions (event_id, title, speaker_school_id, room, start_time, end_time, description) values
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Comment choisir sa voie après le bac ?',         'b1b2c3d4-0000-0000-0000-000000000001', 'Salle A - Conférence',   '2026-04-18T10:00:00+02:00','2026-04-18T11:00:00+02:00','Les clés pour construire son projet d''orientation'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Intégrer une grande école de commerce',           'b1b2c3d4-0000-0000-0000-000000000002', 'Salle B - Amphithéâtre', '2026-04-18T11:30:00+02:00','2026-04-18T12:30:00+02:00','Prépas, admissions parallèles, BS : toutes les voies'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Les métiers du numérique : formations et débouchés','b1b2c3d4-0000-0000-0000-000000000006','Salle C - Digital',     '2026-04-18T14:00:00+02:00','2026-04-18T15:00:00+02:00','Dev, data, cybersécurité : le marché recrute'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Parcoursup : stratégie et vœux',                  NULL,                                   'Salle A - Conférence',   '2026-04-18T15:30:00+02:00','2026-04-18T16:30:00+02:00','Comment optimiser ses 10 vœux Parcoursup'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Financer ses études : bourses, prêts, alternance', NULL,                                   'Salle B - Amphithéâtre', '2026-04-18T16:30:00+02:00','2026-04-18T17:30:00+02:00','Toutes les solutions pour financer son parcours'),
  -- Design sessions (Léa would attend these)
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Métiers du design : de l''ENSAD à l''agence',     'b1b2c3d4-0000-0000-0000-000000000013', 'Salle D - Arts & Design','2026-04-18T10:30:00+02:00','2026-04-18T11:30:00+02:00','Parcours, concours et débouchés en design'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Architecture intérieure : métier et formations',  'b1b2c3d4-0000-0000-0000-000000000015', 'Salle D - Arts & Design','2026-04-18T12:00:00+02:00','2026-04-18T13:00:00+02:00','ENSA, ENSAD, écoles privées : quelle voie choisir ?'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Classes prépa art vs admissions directes',        NULL,                                   'Salle D - Arts & Design','2026-04-18T13:30:00+02:00','2026-04-18T14:30:00+02:00','MANAA, prépa art, DMA : les passerelles vers les grandes écoles d''art'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Ingénieur en 2030 : IA, énergie, espace',        'b1b2c3d4-0000-0000-0000-000000000003', 'Salle C - Digital',      '2026-04-18T11:00:00+02:00','2026-04-18T12:00:00+02:00','Les grandes tendances qui transforment le métier d''ingénieur'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Trouver sa voie en sciences humaines',            'b1b2c3d4-0000-0000-0000-000000000009', 'Salle A - Conférence',   '2026-04-18T13:00:00+02:00','2026-04-18T14:00:00+02:00','Socio, histoire, philo : des débouchés plus larges qu''on ne le croit')
on conflict do nothing;

-- Lyon sessions
insert into public.sessions (event_id, title, speaker_school_id, room, start_time, end_time, description) values
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Orientation en région Auvergne-Rhône-Alpes',     NULL,                                   'Salle A',                '2026-05-09T10:00:00+02:00','2026-05-09T11:00:00+02:00','Les spécificités du tissu économique lyonnais et ses formations'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Ingénieurs INSA : 5 ans pour changer le monde',  'b1b2c3d4-0000-0000-0000-000000000020', 'Salle B',                '2026-05-09T11:30:00+02:00','2026-05-09T12:30:00+02:00','Post-bac direct, 9 spécialités, double diplôme international'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Management et entrepreneuriat : emlyon vs HEC',  'b1b2c3d4-0000-0000-0000-000000000012', 'Salle A',                '2026-05-09T14:00:00+02:00','2026-05-09T15:00:00+02:00','Débat entre diplômés : quelle école de commerce pour quel profil ?')
on conflict do nothing;

-- Nantes sessions
insert into public.sessions (event_id, title, speaker_school_id, room, start_time, end_time, description) values
  ('a1b2c3d4-0000-0000-0000-000000000004', 'Le BUT : la voie courte qui ouvre sur tout',     NULL,                                   'Salle A',                '2026-06-06T10:00:00+02:00','2026-06-06T11:00:00+02:00','BUT, poursuite d''études, insertion : témoignages d''étudiants'),
  ('a1b2c3d4-0000-0000-0000-000000000004', 'Audencia : une école de commerce différente',    'b1b2c3d4-0000-0000-0000-000000000025', 'Salle B',                '2026-06-06T11:30:00+02:00','2026-06-06T12:30:00+02:00','Triple accréditation, campus Nantes-Paris-Rennes-Shanghai')
on conflict do nothing;

-- ─── SAMPLE APPOINTMENT (for demo / testing) ─────────────────────────────────
-- This is a placeholder appointment with a fake student UUID.
-- In production, student UUIDs come from auth.users.
-- Uncomment and replace {YOUR_TEST_USER_UUID} with a real UID after first login.
-- insert into public.appointments (student_id, school_id, event_id, slot_time, slot_duration, status, student_notes) values
--   ('{YOUR_TEST_USER_UUID}', 'b1b2c3d4-0000-0000-0000-000000000013', 'a1b2c3d4-0000-0000-0000-000000000001',
--    '2026-04-18T10:00:00+02:00', 15, 'confirmed', 'Je suis très intéressée par l''option architecture intérieure')
-- on conflict do nothing;

-- ═══════════════════════════════════════════════════════════════════════════
-- SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════
-- Events:     5  (Paris, Lyon, Bordeaux, Nantes, Marseille)
-- Schools:   30  (12 existing + 18 new incl. 6 design schools for Léa persona)
-- Formations: ~100 across all schools
-- Stands:    Paris(19) · Lyon(5+2existing) · Bordeaux(2) · Nantes(4) · Marseille(3)
-- Sessions:  Paris(10) · Lyon(3) · Nantes(2) + existing from schema.sql
-- ═══════════════════════════════════════════════════════════════════════════

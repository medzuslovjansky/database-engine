-- Base type tables and reference tables

-- Drop tables if they exist
DROP TABLE IF EXISTS translations;
DROP TABLE IF EXISTS literals;
DROP TABLE IF EXISTS intelligibility_ratings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS meaning_frames;
DROP TABLE IF EXISTS frames;
DROP TABLE IF EXISTS meanings;
DROP TABLE IF EXISTS lemma_relations;
DROP TABLE IF EXISTS synset_relations;
DROP TABLE IF EXISTS lit_relation_types;
DROP TABLE IF EXISTS lemma_features;
DROP TABLE IF EXISTS lemmas;
DROP TABLE IF EXISTS synsets;
DROP TABLE IF EXISTS domains;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS lit_roles;
DROP TABLE IF EXISTS lit_languages;
DROP TABLE IF EXISTS lit_upos;
DROP TABLE IF EXISTS lit_source_types;
DROP TABLE IF EXISTS lit_intelligibility_marks;
DROP TABLE IF EXISTS lit_features;
DROP TABLE IF EXISTS lit_feature_values;
DROP TABLE IF EXISTS legacy_words;

-- Literals table - for localization purposes
CREATE TABLE literals (
  id TEXT NOT NULL,      -- Identifier for the literal (e.g., "en", "biology")
  type TEXT NOT NULL,    -- Type of literal (e.g., language_name, domain_name, etc.)
  description TEXT,      -- Optional description
  PRIMARY KEY (id, type)
);

-- Grammatical features category table
CREATE TABLE lit_features (
  id TEXT PRIMARY KEY      -- Feature category identifier (e.g., "Case", "Number", "Aspect")
);

-- Grammatical feature values table
CREATE TABLE lit_feature_values (
  id TEXT NOT NULL,         -- Short feature code (e.g., "Nom", "Sing", "Perf")
  feature_id TEXT NOT NULL REFERENCES lit_features(id) ON DELETE CASCADE,
  PRIMARY KEY (id, feature_id)
);

-- Languages table
CREATE TABLE lit_languages (
  code TEXT PRIMARY KEY,  -- ISO code like en, fr, be, isv
  parent_code TEXT REFERENCES lit_languages(code)  -- Parent language code (for language variants)
);

-- Universal POS tags table - for marking the part of speech of a lemma
CREATE TABLE lit_upos (
  id TEXT PRIMARY KEY   -- Universal POS tag (NOUN, VERB, ADJ, etc.)
);

-- User roles table
CREATE TABLE lit_roles (
  id TEXT PRIMARY KEY          -- Role identifier (e.g., "admin", "editor", "contributor")
);

-- Sources table - for marking the source of some entity or attribute
CREATE TABLE lit_source_types (
  id TEXT PRIMARY KEY   -- Source code like "wordnet", "custom"
);

-- Intelligibility marks table
CREATE TABLE lit_intelligibility_marks (
  id TEXT PRIMARY KEY       -- Symbol used to mark intelligibility
);

-- Translations table - translates literals to different languages
CREATE TABLE translations (
  literal_id TEXT NOT NULL,
  literal_type TEXT NOT NULL,
  language_code TEXT NOT NULL REFERENCES lit_languages(code) ON DELETE CASCADE,
  translation TEXT NOT NULL,
  PRIMARY KEY (literal_id, literal_type, language_code),
  FOREIGN KEY (literal_id, literal_type) REFERENCES literals(id, type) ON DELETE CASCADE
);

-- Main domain tables

-- Domains table - for categorizing synsets
CREATE TABLE domains (
  id INTEGER PRIMARY KEY,        -- Domain identifier (numeric)
  name TEXT NOT NULL,            -- Name of the domain (e.g. "group", "location")
  upos TEXT REFERENCES lit_upos(id) ON DELETE SET NULL  -- Associated part of speech
);

-- Synsets table - groups of synonymous concepts
CREATE TABLE synsets (
  id TEXT PRIMARY KEY,           -- GUID
  source_type TEXT REFERENCES lit_source_types(id) ON DELETE SET NULL,  -- Source of the synset (e.g., "wordnet", "custom")
  source_id TEXT,                -- ID in the source system
  domain_id INTEGER REFERENCES domains(id) ON DELETE SET NULL,
  definition TEXT,               -- Definition of the concept
  UNIQUE(source_type, source_id)
);

-- Lemmas table - lexical units
CREATE TABLE lemmas (
  id TEXT PRIMARY KEY,           -- GUID or some other identifier
  source_type TEXT REFERENCES lit_source_types(id) ON DELETE SET NULL,  -- Source of the synset (e.g., "synset", "lexicon:isv")
  source_id TEXT,                -- ID in the source system
  value TEXT NOT NULL,           -- The canonical lemma text value
  pos TEXT NOT NULL REFERENCES lit_upos(id) ON DELETE RESTRICT,  -- Part of speech
  language_code TEXT NOT NULL REFERENCES lit_languages(code) ON DELETE CASCADE,
  metadata TEXT,                 -- For storing irregular forms, notations like "(+2)", "lěska", etc.
  UNIQUE(source_type, source_id)
);

-- Lemma features table - connects lemmas with their grammatical features
CREATE TABLE lemma_features (
  lemma_id TEXT NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  feature_value_id TEXT NOT NULL,
  PRIMARY KEY (lemma_id, feature_id, feature_value_id),
  FOREIGN KEY (feature_value_id, feature_id) REFERENCES lit_feature_values(id, feature_id) ON DELETE CASCADE
);

-- Meanings table - connects synsets and lemmas
CREATE TABLE meanings (
  id TEXT PRIMARY KEY,            -- GUID
  synset_id TEXT NOT NULL REFERENCES synsets(id) ON DELETE CASCADE,
  lemma_id TEXT NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
  sense_number INTEGER,           -- Optional ordering of senses
  annotation TEXT                 -- Optional annotation of the meaning
);

-- Frames table - stores semantic frames with JSON structure
CREATE TABLE frames (
  id TEXT PRIMARY KEY,              -- Frame identifier
  name TEXT NOT NULL,               -- Frame name (e.g., "Commerce_buy", "Motion")
  frame_data JSON NOT NULL,         -- JSON structure containing elements and their properties
  description TEXT                  -- Optional description
);

-- Meaning frames table - maps meanings to frames with realization data
CREATE TABLE meaning_frames (
  meaning_id TEXT REFERENCES meanings(id) ON DELETE CASCADE,
  frame_id TEXT REFERENCES frames(id) ON DELETE CASCADE,
  realization_data JSON NOT NULL,   -- How this meaning realizes the frame elements
  examples TEXT,                    -- Optional examples of usage
  PRIMARY KEY (meaning_id, frame_id)
);

-- Intelligibility ratings table - subjective ratings of word intelligibility
CREATE TABLE intelligibility_ratings (
  id TEXT PRIMARY KEY,          -- GUID
  meaning_id TEXT NOT NULL REFERENCES meanings(id) ON DELETE CASCADE,
  source_language_code TEXT NOT NULL REFERENCES lit_languages(code) ON DELETE CASCADE,
  target_language_code TEXT NOT NULL REFERENCES lit_languages(code) ON DELETE CASCADE,
  intelligibility_level TEXT NOT NULL,  -- References literals.id where type='intelligibility'
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,                   -- Optional notes about this rating
  CHECK (source_language_code != target_language_code),  -- Prevent self-referencing
  UNIQUE (meaning_id, source_language_code, target_language_code, user_id)
);

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,          -- User identifier
  display_name TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- User roles mapping table (many-to-many relationship)
CREATE TABLE user_roles (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES lit_roles(id) ON DELETE RESTRICT,
  language_code TEXT REFERENCES lit_languages(code) ON DELETE CASCADE DEFAULT 'mul',
  PRIMARY KEY (user_id, role_id)
);

-- Flat legacy import table for SteenEntryImported events
CREATE TABLE legacy_words (
  id INTEGER PRIMARY KEY, -- Use Math.abs(id) for upsert; sign indicates beta status if source = 'words'
  beta INTEGER DEFAULT 0, -- 1 if beta (id < 0 and source = 'words'), else 0
  source TEXT,
  isv TEXT,
  addition TEXT,
  partOfSpeech TEXT,
  type TEXT,
  en TEXT,
  sameInLanguages TEXT,
  genesis TEXT,
  ru TEXT,
  be TEXT,
  uk TEXT,
  pl TEXT,
  cs TEXT,
  sk TEXT,
  sl TEXT,
  hr TEXT,
  sr TEXT,
  mk TEXT,
  bg TEXT,
  cu TEXT,
  de TEXT,
  nl TEXT,
  eo TEXT,
  frequency TEXT,
  intelligibility TEXT,
  using_example TEXT,
  csb TEXT,
  dsb TEXT,
  hsb TEXT,
  ia TEXT,
  es TEXT,
  pt TEXT,
  fr TEXT,
  it TEXT,
  he TEXT,
  da TEXT
);

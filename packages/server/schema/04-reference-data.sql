-- Reference data (languages, features, etc.)

-- Insert languages
INSERT INTO lit_languages (code, parent_code) VALUES
  ('art-x-neolatin', NULL),  -- Neolatino Romance
  ('be', NULL),   -- Belarusian
  ('bg', NULL),   -- Bulgarian
  ('cs', NULL),   -- Czech
  ('csb', NULL),  -- Kashubian
  ('cu', NULL),   -- Church Slavonic
  ('da', NULL),   -- Danish
  ('de', NULL),   -- German
  ('dsb', NULL),  -- Lower Sorbian
  ('en', NULL),   -- English
  ('eo', NULL),   -- Esperanto
  ('es', NULL),   -- Spanish
  ('fr', NULL),   -- French
  ('he', NULL),   -- Hebrew
  ('hr', NULL),   -- Croatian
  ('hsb', NULL),  -- Upper Sorbian
  ('ia', NULL),   -- Interlingua
  ('isv', NULL),  -- Interslavic
  ('it', NULL),   -- Italian
  ('mk', NULL),   -- Macedonian
  ('mul', NULL),  -- Multiple languages
  ('nl', NULL),   -- Dutch
  ('pl', NULL),   -- Polish
  ('pt', NULL),   -- Portuguese
  ('rsk', NULL),  -- Rusyn (Kashubian)
  ('ru', NULL),   -- Russian
  ('rue', NULL),  -- Rusyn (Carpathian)
  ('tok', NULL),  -- Toki Pona
  ('sk', NULL),   -- Slovak
  ('sl', NULL),   -- Slovenian
  ('sr', NULL),   -- Serbian
  ('szl', NULL),  -- Silesian
  ('uk', NULL);   -- Ukrainian

-- Insert Universal POS tags
INSERT INTO lit_upos (id) VALUES
  ('ADJ'),    -- Adjective
  ('ADP'),    -- Adposition
  ('ADV'),    -- Adverb
  ('AUX'),    -- Auxiliary
  ('CCONJ'),  -- Coordinating conjunction
  ('DET'),    -- Determiner
  ('INTJ'),   -- Interjection
  ('NOUN'),   -- Noun
  ('NUM'),    -- Numeral
  ('PART'),   -- Particle
  ('PRON'),   -- Pronoun
  ('PROPN'),  -- Proper noun
  ('PUNCT'),  -- Punctuation
  ('SCONJ'),  -- Subordinating conjunction
  ('SYM'),    -- Symbol
  ('VERB'),   -- Verb
  ('X');      -- Other

-- Insert domains
INSERT INTO domains (id, name, upos) VALUES
  (0, 'adjs', 'ADJ'),
  (1, 'adjs.pert', 'ADJ'),
  (2, 'advs', 'ADV'),
  (3, 'tops', 'NOUN'),
  (4, 'act', 'NOUN'),
  (5, 'animal', 'NOUN'),
  (6, 'artifact', 'NOUN'),
  (7, 'attribute', 'NOUN'),
  (8, 'body', 'NOUN'),
  (9, 'cognition', 'NOUN'),
  (10, 'communication', 'NOUN'),
  (11, 'event', 'NOUN'),
  (12, 'feeling', 'NOUN'),
  (13, 'food', 'NOUN'),
  (14, 'group', 'NOUN'),
  (15, 'location', 'NOUN'),
  (16, 'motive', 'NOUN'),
  (17, 'object', 'NOUN'),
  (18, 'person', 'NOUN'),
  (19, 'phenomenon', 'NOUN'),
  (20, 'plant', 'NOUN'),
  (21, 'possession', 'NOUN'),
  (22, 'process', 'NOUN'),
  (23, 'quantity', 'NOUN'),
  (24, 'relation', 'NOUN'),
  (25, 'shape', 'NOUN'),
  (26, 'state', 'NOUN'),
  (27, 'substance', 'NOUN'),
  (28, 'time', 'NOUN'),
  (29, 'body', 'VERB'),
  (30, 'change', 'VERB'),
  (31, 'cognition', 'VERB'),
  (32, 'communication', 'VERB'),
  (33, 'competition', 'VERB'),
  (34, 'consumption', 'VERB'),
  (35, 'contact', 'VERB'),
  (36, 'creation', 'VERB'),
  (37, 'emotion', 'VERB'),
  (38, 'motion', 'VERB'),
  (39, 'perception', 'VERB'),
  (40, 'possession', 'VERB'),
  (41, 'social', 'VERB'),
  (42, 'stative', 'VERB'),
  (43, 'weather', 'VERB'),
  (44, 'adjs.ppl', 'ADJ');

-- Insert roles
INSERT INTO lit_roles (id) VALUES
  ('admin'),           -- Can do everything in the system
  ('language_curator'), -- Can assign roles to users for their language(s)
  ('synset_editor'),    -- Can modify synsets (merge, split, etc.)
  ('translator'),       -- Can add/edit translations for specific languages
  ('intelligibility_rater'); -- Can provide intelligibility ratings between languages

-- Insert source types
INSERT INTO lit_source_types (id) VALUES
  ('synset'),    -- Secondary source
  ('interslavic'); -- Interslavic lexicon

-- Insert intelligibility marks
INSERT INTO lit_intelligibility_marks (id) VALUES
  ('.'),  -- Fully intelligible (word is completely understandable in context)
  ('n'),  -- Not intelligible (word is incomprehensible to native speakers)
  ('t'),  -- Difficult (word may be unintelligible or hard to understand)
  ('r'),  -- Rare (rarely used word - slang, technical, historical - people with limited vocabulary may not know it)
  ('z'),  -- Obsolete (word is completely outdated/obsolete, incomprehensible)
  ('a'),  -- Archaic (archaic word - people with limited vocabulary may not understand it)
  ('f'),  -- False friend (similar word but with different meaning, which is confusing)
  ('k'),  -- Contextual (word has slightly different but related meaning - understanding depends on context)
  ('m'),  -- Intuitive (word doesn't exist in the language but is intuitively understandable in context for thinking persons)
  ('?');  -- Unmarked (intelligibility is not marked, e.g. errors in dictionary)

-- Insert grammatical feature categories
INSERT INTO lit_features (id) VALUES
  ('Animacy'), -- Indicates whether a noun represents something animate or inanimate
  ('Case'), -- Represents the syntactic and semantic roles of nouns, pronouns, and adjectives
  ('Number'), -- Specifies the count of entities represented by the noun or pronoun
  ('Poss'), -- Indicates possession or ownership
  ('Degree'), -- Specifies the intensity or comparison level of adjectives and adverbs
  ('Gender'), -- Specifies the gender of nouns and agreeing words
  ('Variant'), -- Indicates alternative forms of words, often related to length or style
  ('Polarity'), -- Indicates whether a statement or word is positive or negative
  ('Person'), -- Specifies the relationship between the speaker and the action
  ('Tense'), -- Specifies the time of the action described by the verb
  ('Aspect'), -- Indicates the nature of the action's completion or duration
  ('Voice'), -- Describes the relationship between the action and the participants
  ('Mood'), -- Indicates the attitude of the speaker toward the action or state
  ('VerbForm'), -- Specifies different verb forms and their syntactic uses
  ('Uninflect'); -- Indicates that a word does not change form based on grammatical features

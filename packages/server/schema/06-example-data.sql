-- Example data for testing

-- Insert example literals
INSERT INTO literals (id, type, description) VALUES
  ('en', 'language', 'English language'),
  ('pl', 'language', 'Polish language'),
  ('.', 'intelligibility_mark', 'Fully intelligible (word is completely understandable in context)'),
  ('n', 'intelligibility_mark', 'Not intelligible (word is incomprehensible to native speakers)'),
  ('t', 'intelligibility_mark', 'Difficult (word may be unintelligible or hard to understand)'),
  ('r', 'intelligibility_mark', 'Rare (rarely used word - slang, technical, historical - people with limited vocabulary may not know it)'),
  ('z', 'intelligibility_mark', 'Obsolete (word is completely outdated/obsolete, incomprehensible)'),
  ('a', 'intelligibility_mark', 'Archaic (archaic word - people with limited vocabulary may not understand it)'),
  ('f', 'intelligibility_mark', 'False friend (similar word but with different meaning, which is confusing)	'),
  ('k', 'intelligibility_mark', 'Contextual (word has slightly different but related meaning - understanding depends on context)'),
  ('m', 'intelligibility_mark', 'Intuitive (word doesn''t exist in the language but is intuitively understandable in context for thinking persons)'),
  ('?', 'intelligibility_mark', 'Unmarked (intelligibility is not marked, e.g. errors in dictionary)');

-- Insert example translations
INSERT INTO translations (literal_id, literal_type, language_code, translation) VALUES
  ('en', 'language', 'en', 'English'),
  ('en', 'language', 'isv', 'Anglijsky'),
  ('en', 'language', 'uk', 'Англійська'),
  ('pl', 'language', 'en', 'Polish'),
  ('pl', 'language', 'isv', 'Polski'),
  ('pl', 'language', 'uk', 'Польська'),
  ('.', 'intelligibility_mark', 'en', 'Fully intelligible');

-- Insert relationship types
INSERT INTO lit_relation_types (id) VALUES
  ('is_synset_part_of'),  -- Indicates that a synset is part of another synset, applies to synset
  ('is_synset_member'),   -- Indicates that a lemma is a member of a synset, applies to lemma
  ('related_action'), -- Indicates a relationship between two synsets, applies to synset
  ('related_object');  -- Indicates a relationship between two lemmas, applies to lemma

-- Insert example frames
INSERT INTO frames (id, name, frame_data, description) VALUES
  ('perception_visual', 'Perception_visual',
    json('{"elements": [
      {"name": "Perceiver", "core": true, "description": "The entity that perceives something through vision"},
      {"name": "Phenomenon", "core": true, "description": "The entity or event that is perceived"},
      {"name": "Direction", "core": false, "description": "The direction of perception"}
    ]}'),
    'Frame for visual perception events'),

  ('giving', 'Giving',
    json('{"elements": [
      {"name": "Donor", "core": true, "description": "The entity that initially possesses the Theme and causes it to be received by the Recipient"},
      {"name": "Recipient", "core": true, "description": "The entity that receives the Theme from the Donor"},
      {"name": "Theme", "core": true, "description": "The object that changes ownership from the Donor to the Recipient"}
    ]}'),
    'Frame for events where a Donor gives something to a Recipient');

-- -- Insert example meaning-frame connections with realization data
-- INSERT INTO meaning_frames (meaning_id, frame_id, realization_data, examples) VALUES
--   ('m1', 'perception_visual',
--     json('{"realizations": [
--       {"element": "Perceiver", "case": "Nom"},
--       {"element": "Phenomenon", "case": "Acc"}
--     ]}'),
--     'Ja vidžu tebe. (I see you.)'),

--   ('m2', 'giving',
--     json('{"realizations": [
--       {"element": "Donor", "case": "Nom"},
--       {"element": "Recipient", "case": "Dat"},
--       {"element": "Theme", "case": "Acc"}
--     ]}'),
--     'Bog viděl jemu světlo. (God gave him sight.)');

INSERT INTO Events (aggregate_id, seq, type, timestamp, actor, payload)
VALUES (
  'some-aggregate-id',         -- aggregate_id (string, can be any identifier)
  1,                           -- seq (sequence number, usually starts at 1)
  'SteenEntryImported',        -- type (must match your event name)
  strftime('%s','now')*1000,   -- timestamp (current time in ms)
  NULL,                        -- actor (can be null or a user id)
  '{"id": 123, "source": "words", "changes": {"en": "hello", "ru": "привет"}}' -- payload (as JSON string)
);
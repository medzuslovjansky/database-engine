-- Grammatical feature values

-- Insert grammatical feature values
INSERT INTO lit_feature_values (id, feature_id) VALUES
  -- Animacy values
  ('Inan', 'Animacy'),   -- Inanimate objects, concepts, or things
  ('Anim', 'Animacy'),   -- Living beings or entities with motion
  ('Hum', 'Animacy'),    -- Human beings specifically

  -- Case values
  ('Nom', 'Case'),       -- Nominative: Subject of the sentence
  ('Acc', 'Case'),       -- Accusative: Direct object of a verb
  ('Gen', 'Case'),       -- Genitive: Indicates possession or relation
  ('Dat', 'Case'),       -- Dative: Indirect object of a verb
  ('Ins', 'Case'),       -- Instrumental: Instrument or means of action
  ('Loc', 'Case'),       -- Locative: Location or position
  ('Voc', 'Case'),       -- Vocative: Used for direct address

  -- Number values
  ('Sing', 'Number'),    -- Singular: Single entity
  ('Dual', 'Number'),    -- Dual: Exactly two entities
  ('Plur', 'Number'),    -- Plural: More than one entity
  ('Coll', 'Number'),    -- Collective: Group as a single entity
  ('Pltm', 'Number'),    -- Pluralia Tantum: Nouns that appear only in plural form

  -- Poss values
  ('Poss', 'Poss'),      -- Possessive

  -- Degree values
  ('Pos', 'Degree'),     -- Positive: Basic form without comparison
  ('Cmp', 'Degree'),     -- Comparative: Comparison between two entities
  ('Sup', 'Degree'),     -- Superlative: Highest degree of comparison

  -- Gender values
  ('Masc', 'Gender'),    -- Masculine gender
  ('Fem', 'Gender'),     -- Feminine gender
  ('Neut', 'Gender'),    -- Neutral gender

  -- Variant values
  ('Long', 'Variant'),   -- Long form of the word
  ('Short', 'Variant'),  -- Short or reduced form of the word

  -- Polarity values
  ('Pos', 'Polarity'),   -- Positive polarity
  ('Neg', 'Polarity'),   -- Negative polarity

  -- Person values
  ('1', 'Person'),       -- First person (the speaker)
  ('2', 'Person'),       -- Second person (the addressee)
  ('3', 'Person'),       -- Third person (someone else)

  -- Tense values
  ('Pres', 'Tense'),     -- Present: Action occurring in the present
  ('Past', 'Tense'),     -- Past: Action that occurred in the past
  ('Imp', 'Tense'),      -- Imperfect: Actions happening during some past moment

  -- Aspect values
  ('Imp', 'Aspect'),     -- Imperfective: Ongoing or habitual action
  ('Iter', 'Aspect'),    -- Iterative: Iterative or habitual action
  ('Perf', 'Aspect'),    -- Perfective: Completed action

  -- Voice values
  ('Act', 'Voice'),      -- Active: The subject performs the action
  ('Pass', 'Voice'),     -- Passive: The subject receives the action

  -- Mood values
  ('Ind', 'Mood'),       -- Indicative: Statement of fact
  ('Imp', 'Mood'),       -- Imperative: Command or request
  ('Cond', 'Mood'),      -- Conditional: Hypothetical or conditional action

  -- VerbForm values
  ('Inf', 'VerbForm'),   -- Infinitive (e.g., "pisati", "napisati")
  ('Fin', 'VerbForm'),   -- Finite verb form (e.g., "piše", "pisahų")
  ('Conv', 'VerbForm'),  -- Converb/Transgressive (e.g., "pišući", "vidęći")
  ('Part', 'VerbForm'),  -- Participle (e.g., "pisal", "pišuća", "pisany")
  ('Vnoun', 'VerbForm'), -- Verbal noun (e.g., "pisanje", "vidėnje")

  -- Uninflect values
  ('Yes', 'Uninflect'),  -- Word is indeclinable
  ('No', 'Uninflect');   -- Word is declinable

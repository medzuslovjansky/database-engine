-- Relationship tables and indexes

-- Relationship types table - for defining possible relationship types
CREATE TABLE lit_relation_types (
  id TEXT PRIMARY KEY             -- Unique identifier for the relation type
);

-- Synset relations table - stores relationships between synsets
CREATE TABLE synset_relations (
  source_id TEXT NOT NULL REFERENCES synsets(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES synsets(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL REFERENCES lit_relation_types(id) ON DELETE CASCADE,
  PRIMARY KEY (source_id, target_id, relation_type),
  CHECK (source_id != target_id)
);

-- Lemma relations table - stores relationships between lemmas
CREATE TABLE lemma_relations (
  source_id TEXT NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL REFERENCES lit_relation_types(id) ON DELETE CASCADE,
  PRIMARY KEY (source_id, target_id, relation_type),
  CHECK (source_id != target_id)
);

-- Indexes for optimizing queries
CREATE INDEX idx_synsets_domain ON synsets(domain_id);
CREATE INDEX idx_lemmas_language ON lemmas(language_code);
CREATE INDEX idx_lemmas_value ON lemmas(value);
CREATE INDEX idx_meanings_synset ON meanings(synset_id);
CREATE INDEX idx_meanings_lemma ON meanings(lemma_id);
CREATE INDEX idx_translations_language ON translations(language_code);
CREATE INDEX idx_intelligibility_ratings_meaning ON intelligibility_ratings(meaning_id);
CREATE INDEX idx_intelligibility_ratings_languages ON intelligibility_ratings(source_language_code, target_language_code);
CREATE INDEX idx_intelligibility_ratings_user ON intelligibility_ratings(user_id);
CREATE INDEX idx_lemma_features_lemma ON lemma_features(lemma_id);
CREATE INDEX idx_lemma_features_feature ON lemma_features(feature_id, feature_value_id);
CREATE INDEX idx_meaning_frames_meaning ON meaning_frames(meaning_id);
CREATE INDEX idx_meaning_frames_frame ON meaning_frames(frame_id);
CREATE INDEX idx_synset_relations_source ON synset_relations(source_id);
CREATE INDEX idx_synset_relations_target ON synset_relations(target_id);
CREATE INDEX idx_synset_relations_type ON synset_relations(relation_type);
CREATE INDEX idx_lemma_relations_source ON lemma_relations(source_id);
CREATE INDEX idx_lemma_relations_target ON lemma_relations(target_id);
CREATE INDEX idx_lemma_relations_type ON lemma_relations(relation_type);

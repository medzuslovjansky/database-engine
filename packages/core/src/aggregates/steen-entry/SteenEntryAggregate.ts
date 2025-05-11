import { Language } from '@core/constants';
import { IntelligibilityVectorV1, IntelligibilityRecord, InterslavicLemma, MultilingualSynset, MultilingualSynsetJSON, SteenWordsRecord, Synset } from '@core/structures';

import { AggregateRoot } from '../AggregateRoot';
import { EventEnvelope } from '../EventEnvelope';
import type { SteenEntryEvent, SteenEntryEventRegistry, SteenEntryImportedEvent, SteenEntryRemovedEvent, IntelligibilityRatedEvent } from './events/types';

export class SteenEntryAggregate extends AggregateRoot<SteenEntryEventRegistry> {
  state = new MultilingualSynset();

  protected apply(e: EventEnvelope<SteenEntryEvent>): void {
    switch (e.type) {
      case 'SteenEntryImported': return this.applyImport(e.data as SteenEntryImportedEvent);
      case 'SteenEntryRemoved': return this.applyRemove(e.data as SteenEntryRemovedEvent);
      case 'IntelligibilityRated': return this.applyIntelligibility(e.data as IntelligibilityRatedEvent);
    }
  }

  protected applyImport(event: SteenEntryImportedEvent): void {
    this.state.id = Math.abs(event.id);
    this.state.beta = event.id < 0;

    const lemma0 = this.state.synsets.isv?.lemmas[0];
    const metadata = lemma0?.metadata;
    const intelligibility = event.intelligibility ? IntelligibilityVectorV1.fromString(event.intelligibility) : lemma0?.intelligibility;

    if (event.translations) {
      for (const [key, lemmas] of Object.entries(event.translations)) {
        const language = key as Language;
        this.state.synsets[language] = Synset.parse(lemmas);
      }
    }

    const isv = this.state.synsets.isv!;
    for (const lemma of isv.lemmas) {
      lemma.metadata = {
        id: event.id ?? metadata?.id,
        partOfSpeech: event.part_of_speech ?? metadata?.partOfSpeech ?? '',
        addition: event.additional_info ?? metadata?.addition,
        type: event.type != null ? event.type : metadata?.type,
        sameInLanguages: event.same_in_languages ?? metadata?.sameInLanguages,
        genesis: event.genesis ?? metadata?.genesis,
        frequency: event.frequency ?? metadata?.frequency,
        using_example: event.using_example ?? metadata?.using_example,
      }

      if (intelligibility) {
        lemma.intelligibility = intelligibility.clone();
      }
    }
  }

  protected applyRemove(_event: SteenEntryRemovedEvent): void {
    this.state.steen = undefined;
    for (const language of Object.keys(this.state.synsets)) {
      this.state.synsets[language as Language] = undefined;
    }
  }

  protected applyIntelligibility(event: IntelligibilityRatedEvent): void {
    if (event.source_language !== 'isv') return;
    const lemma = this.state.synsets.isv!.find(event.lemma);
    if (!lemma) return;

    lemma.intelligibility ??= IntelligibilityVectorV1.empty();
    lemma.intelligibility.update(event.target_language, event.mark);
  }

  protected getStreamName(): string {
    return `steen/${this.state.id}`;
  }

  public importChanges(record: SteenWordsRecord): void {
    const { id, addition, partOfSpeech, type, sameInLanguages, genesis, frequency, intelligibility, using_example, ...translations } = record;

    if (this.state.id && Math.abs(id) !== this.state.id) {
      throw new Error(`Cannot import changes for a different entry: |${id}| !== |${this.state.id}|`);
    }

    const event: SteenEntryImportedEvent = { id };

    if (!this.state.id) {
      this.state.id = id;
    }

    for (const [language, translation] of Object.entries(translations)) {
      if (!translation) continue;

      const t = String(translation);
      event.translations ??= {};
      const existingSynset = this.state.synsets[language as Language];
      if (!existingSynset) {
        if (t) {
          event.translations[language] = t;
        }
      } else {
        const newSynset = Synset.parse(t);
        if (language === 'isv') { debugger; }
        if (!existingSynset.equals(newSynset)) {
          event.translations[language] = t;
        }
      }
    }

    const isvLemma = this.state.synsets.isv?.lemmas[0] as (InterslavicLemma | undefined);
    const steen = isvLemma?.metadata;

    if (addition && steen?.addition !== addition) {
      event.additional_info = addition;
    }
    if (partOfSpeech && steen?.partOfSpeech !== partOfSpeech) {
      event.part_of_speech = partOfSpeech;
    }
    if (type && steen?.type !== type) {
      event.type = type;
    }
    if (sameInLanguages && steen?.sameInLanguages !== sameInLanguages) {
      event.same_in_languages = sameInLanguages;
    }
    if (genesis && steen?.genesis !== genesis) {
      event.genesis = genesis;
    }
    if (frequency && steen?.frequency !== frequency) {
      event.frequency = frequency;
    }
    if (using_example && steen?.using_example !== using_example) {
      event.using_example = using_example;
    }
    if (intelligibility && isvLemma?.intelligibility?.toString() !== intelligibility) {
      event.intelligibility = intelligibility;
    }

    this.raise('SteenEntryImported', event);
  }

  public remove(): void {
    this.raise('SteenEntryRemoved', { id: this.state.id });
  }

  public rateIntelligibility(record: IntelligibilityRecord): void {
    if (Math.abs(record.id) !== this.state.id) {
      throw new Error(`Cannot rate intelligibility for a different entry: |${record.id}| !== |${this.state.id}|`);
    }

    this.raise('IntelligibilityRated', {
      id: record.id,
      lemma: record.lemma,
      rated_by: record.ratedBy,
      source_language: 'isv',
      target_language: record.targetLanguage,
      mark: record.mark,
      cognates: record.cognates,
      helper_words: record.helperWords,
      false_friends: record.falseFriends,
      comment: record.comment,
    });
  }

  public toJSON(): MultilingualSynsetJSON {
    return this.state.toJSON();
  }
}


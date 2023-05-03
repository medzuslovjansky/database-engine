import { symlink, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import type {
  Language,
  SteenbergenLemmaMetadata,
} from '@interslavic/database-engine-core';
import { snakeCase } from 'lodash';
import { MultilingualSynset } from '@interslavic/database-engine-core';
import { Lemma, Synset } from '@interslavic/database-engine-core';

import { XmlSerializer } from '../../fs';
import type {
  LemmaXml,
  MultilingualSynsetXmlDocument,
  SynsetXml,
} from '../../dto';

// TODO: refactor parsing and formatting
export class MultilingualSynsetSerializer extends XmlSerializer<
  number,
  MultilingualSynset
> {
  constructor() {
    super({
      alwaysCreateTextNode: true,
      ignoreAttributes: false,
      isArray(eleName: string): boolean {
        return eleName === 'synset' || eleName === 'lemma';
      },
    });
  }

  protected mapToEntity(raw: unknown): MultilingualSynset {
    const document = raw as MultilingualSynsetXmlDocument;
    const multisynsetXml = document['multilingual-synset'];
    // eslint-disable-next-line unicorn/no-array-reduce
    const synsets = multisynsetXml.synset.reduce((accumulator, synsetXml) => {
      const lang: Language =
        synsetXml['@_lang'] === 'art-x-interslv'
          ? 'isv'
          : (synsetXml['@_lang'] as Language);

      accumulator[lang] = new Synset({
        verified: synsetXml['@_verified'] !== 'false',
        lemmas: synsetXml.lemma.map((lemmaXml) => {
          const lemma = new Lemma({
            value: lemmaXml['#text'],
            annotations: lemmaXml['@_annotation']?.split(/\s*;\s*/),
          });

          const steen: SteenbergenLemmaMetadata = (lemma.steen ??= {} as any);
          if (lemmaXml['@_steen:id']) {
            steen.id = Number(lemmaXml['@_steen:id']);
          }
          if (lemmaXml['@_steen:addition']) {
            steen.addition = lemmaXml['@_steen:addition'];
          }
          if (lemmaXml['@_steen:pos']) {
            steen.partOfSpeech = lemmaXml['@_steen:pos'];
          }
          if (lemmaXml['@_steen:type']) {
            steen.type = Number(lemmaXml['@_steen:type']);
          }
          if (lemmaXml['@_steen:same']) {
            steen.sameInLanguages = lemmaXml['@_steen:same'];
          }
          if (lemmaXml['@_steen:genesis']) {
            steen.genesis = lemmaXml['@_steen:genesis'];
          }
          return lemma;
        }),
      });

      return accumulator;
    }, {} as MultilingualSynset['synsets']);

    const result = new MultilingualSynset();
    result.id = Number(multisynsetXml['@_id']);
    result.synsets = synsets;
    return result;
  }

  protected mapToSerialized(entity: MultilingualSynset): unknown {
    const document: MultilingualSynsetXmlDocument = {
      '?xml': {
        '@_version': '1.0',
        // eslint-disable-next-line unicorn/text-encoding-identifier-case
        '@_encoding': 'UTF-8',
        '@_standalone': 'no',
      },
      'multilingual-synset': {
        '@_xmlns': 'https://interslavic.fun/schemas/zonal-wordnet.xsd',
        '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xmlns:steen': 'https://interslavic.fun/schemas/steenbergen.xsd',
        '@_xsi:schemaLocation': [
          'https://interslavic.fun/schemas/zonal-wordnet.xsd file://../../../../schemas/zonal-wordnet.xsd',
          'https://interslavic.fun/schemas/steenbergen.xsd file://../../../../schemas/steenbergen.xsd',
        ].join('\n'),
        '@_id': `${entity.id}`,
        // TODO: sort by language: isv, en, ru, be, uk, pl, cs, sk, sl, hr, sr, bg, mk
        synset: Object.entries(entity.synsets).map(
          ([lang, synset]) =>
            ({
              '@_lang': lang === 'isv' ? 'art-x-interslv' : lang,
              '@_verified': synset.verified ? undefined : 'false',
              lemma: synset.lemmas.map<LemmaXml>((lemma) => ({
                '#text': lemma.value,
                '@_annotation':
                  lemma.annotations.length > 0
                    ? lemma.annotations.join('; ')
                    : undefined,
                '@_steen:id': lemma.steen?.id?.toString(),
                '@_steen:addition': lemma.steen?.addition,
                '@_steen:pos': lemma.steen?.partOfSpeech,
                '@_steen:type': lemma.steen?.type?.toString(),
                '@_steen:same': lemma.steen?.sameInLanguages,
                '@_steen:genesis': lemma.steen?.genesis,
              })),
            } as SynsetXml),
        ),
      },
    };

    return document;
  }

  async serialize(
    entityPath: string,
    entity: MultilingualSynset,
  ): Promise<void> {
    const [realname, ...symlinks] = entity.synsets
      .isv!.lemmas.map((lemma) => snakeCase(lemma.value))
      .sort((a, b) => a.localeCompare(b));

    await super.serialize(join(entityPath, `${realname}.xml`), entity);
    await Promise.all(
      symlinks.map((symlinkName) =>
        symlink(`${realname}.xml`, join(entityPath, `${symlinkName}.xml`)),
      ),
    );
  }

  async deserialize(entityPath: string): Promise<MultilingualSynset> {
    const files = await readdir(entityPath);
    const file = files.find(isValidFilename);
    if (!file) {
      throw new Error(
        `No valid multilingual synset file found in ${entityPath}`,
      );
    }

    return super.deserialize(join(entityPath, file));
  }
}

function isValidFilename(filename: string): boolean {
  return !filename.startsWith('_') && filename.endsWith('.xml');
}

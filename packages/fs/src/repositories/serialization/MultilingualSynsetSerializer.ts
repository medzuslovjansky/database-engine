import { readdir, symlink, unlink } from 'node:fs/promises';
import path from 'node:path';

import type {
  Language,
  SteenbergenLemmaMetadata,
  InterslavicLemma,
  MultilingualSynset$Steen,
} from '@interslavic/database-engine-core';
import _ from 'lodash';
import { MultilingualSynset , Lemma, Synset } from '@interslavic/database-engine-core';

import type { XmlSerializerOptions } from '../../fs';
import { XmlSerializer } from '../../fs';
import type {
  LemmaXml,
  MultilingualSynsetXmlDocument,
  SynsetXml,
} from '../../dto';

export type MultilingualSynsetSerializerOptions = {
  prettier?: XmlSerializerOptions['prettier'];
};

// TODO: refactor parsing and formatting
export class MultilingualSynsetSerializer extends XmlSerializer<
  number,
  MultilingualSynset
> {
  constructor(options: MultilingualSynsetSerializerOptions = {}) {
    super({
      x2j: {
        alwaysCreateTextNode: true,
        ignoreAttributes: false,
        isArray(eleName: string): boolean {
          return eleName === 'synset' || eleName === 'lemma';
        },
      },
      prettier: {
        ...options.prettier,
        parser: 'xml',
      },
    });
  }

  protected mapToEntity(raw: unknown): MultilingualSynset {
    const document = raw as MultilingualSynsetXmlDocument;
    const multisynsetXml = document['multilingual-synset'];
    const debated = new Set(
      (multisynsetXml['@_steen:debated'] ?? '').split(','),
    ) as Required<MultilingualSynset$Steen>['debated'];

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
            value: String(lemmaXml['#text'] ?? ''),
            annotations: lemmaXml['@_annotation']?.split(/\s*;\s*/),
          });

          if (lang === 'isv') {
            const steen: SteenbergenLemmaMetadata = {} as any;

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

            (lemma as InterslavicLemma).steen = steen;
          }

          return lemma;
        }),
      });

      return accumulator;
    }, {} as MultilingualSynset['synsets']);

    const result = new MultilingualSynset();
    result.id = Number(multisynsetXml['@_id']);
    result.synsets = synsets;
    if (debated.size > 0) {
      result.steen = { debated };
    }

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
        '@_id': `${entity.id}`,
        '@_steen:debated': entity.steen?.debated?.size
          ? [...entity.steen!.debated!].sort().join(',')
          : undefined,
        '@_xmlns': 'https://interslavic.fun/schemas/zonal-wordnet.xsd',
        '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xmlns:steen': 'https://interslavic.fun/schemas/steenbergen.xsd',
        synset: Object.entries(entity.synsets)
          .filter(([, synset]) => synset)
          .sort(byLanguageCode)
          .map(
            ([lang, synset]) =>
              ({
                '@_lang': lang === 'isv' ? 'art-x-interslv' : lang,
                '@_verified': synset.verified ? undefined : 'false',
                lemma: synset.lemmas.map<LemmaXml>((lemma) => {
                  const steen = (lemma as InterslavicLemma).steen;

                  return {
                    '#text': lemma.value,
                    '@_annotation':
                      lemma.annotations.length > 0
                        ? lemma.annotations.join('; ')
                        : undefined,
                    '@_steen:id': steen?.id?.toString(),
                    '@_steen:addition': steen?.addition,
                    '@_steen:pos': steen?.partOfSpeech,
                    '@_steen:type': steen?.type?.toString(),
                    '@_steen:same': steen?.sameInLanguages,
                    '@_steen:genesis': steen?.genesis,
                  };
                }),
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
      .isv!.lemmas.map((lemma) => _.snakeCase(lemma.value.normalize('NFD')))
      .sort((a, b) => a.localeCompare(b));

    await super.serialize(path.join(entityPath, `${realname}.xml`), entity);

    const actualNames = await readdir(entityPath);
    const plannedNames = [realname, ...symlinks].map((n) => `${n}.xml`);
    const redundantNames = _.difference(actualNames, plannedNames);

    await Promise.all([
      ...redundantNames.map((redundantName) => {
        return unlink(path.join(entityPath, redundantName));
      }),
      ...symlinks.map((symlinkName) =>
        symlink(
          `${realname}.xml`,
          path.join(entityPath, `${symlinkName}.xml`),
        ).catch((error: any) =>
          error.code === 'EEXIST' ? undefined : Promise.reject(error),
        ),
      ),
    ]);
  }

  async deserialize(entityPath: string): Promise<MultilingualSynset> {
    const files = await readdir(entityPath);
    const file = files.find(isValidFilename);
    if (!file) {
      throw new Error(
        `No valid multilingual synset file found in ${entityPath}`,
      );
    }

    return super.deserialize(path.join(entityPath, file));
  }
}

function isValidFilename(filename: string): boolean {
  return !filename.startsWith('_') && filename.endsWith('.xml');
}

const LANGUAGE_ORDER: string[] = [
  'isv',
  'en',
  'be',
  'bg',
  'bs',
  'cnr',
  'cs',
  'csb',
  'cu',
  'dsb',
  'hr',
  'hsb',
  'mk',
  'pl',
  'qpm',
  'ru',
  'rue',
  'sk',
  'sl',
  'sr',
  'szl',
  'uk',
  'eo',
  'es',
  'fr',
  'ia',
  'it',
  'pt',
  'da',
  'de',
  'nl',
] as Language[];

function byLanguageCode<T>(a: [string, T], b: [string, T]): number {
  const indexA = LANGUAGE_ORDER.indexOf(a[0]);
  const indexB = LANGUAGE_ORDER.indexOf(b[0]);

  // If both keys are custom, sort them alphabetically
  if (indexA === -1 && indexB === -1) {

    return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
  }

  // If only one of the keys is custom, place it at the end
  if (indexA === -1) {
    return 1;
  }
  if (indexB === -1) {
    return -1;
  }

  // If both keys are in the language order array, sort based on their positions
  return indexA - indexB;
}

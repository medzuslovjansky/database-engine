import type { XmlMetadata } from '../xml';

export interface MultilingualSynsetXmlDocument {
  '?xml': XmlMetadata;
  'multilingual-synset': MultilingualSynsetXml;
}

export interface MultilingualSynsetXml {
  '@_id': string;
  synset: SynsetXml[];
  '@_steen:debated'?: string;

  '@_xmlns': 'https://interslavic.fun/schemas/zonal-wordnet.xsd';
  '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance';
  '@_xmlns:steen': 'https://interslavic.fun/schemas/steenbergen.xsd';
}

export interface SynsetXml {
  lemma: LemmaXml[];
  '@_lang': string;
  '@_verified'?: string;
}

export type LemmaXml = {
  '#text': string;
  '@_annotation'?: string;
} & Partial<LemmaXml$Steen>;

export type LemmaXml$Steen = {
  '@_steen:id': string;
  '@_steen:addition': string;
  '@_steen:pos': string;
  '@_steen:type': string;
  '@_steen:same': string;
  '@_steen:genesis': string;
  '@_steen:frequency': string;
  '@_steen:using_example': string;
};

import type { Language } from './misc';

export type UserID = string;

export type User = {
  id: string;
  email: string;
  languages?: Partial<Record<Language, LanguageRights>>;
  comment?: string;
};

export type LanguageRights = 'trusted' | 'supervised';

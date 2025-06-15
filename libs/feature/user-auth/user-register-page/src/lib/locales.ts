import enMessages from '../locales/en.json';
import viMessages from '../locales/vi.json';

export const registerPageLocales = {
  en: enMessages,
  vi: viMessages,
};

export type RegisterPageLocale = keyof typeof registerPageLocales;

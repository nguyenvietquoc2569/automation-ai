import enMessages from '../locales/en.json';
import viMessages from '../locales/vi.json';

export const forgetPageLocales = {
  en: enMessages,
  vi: viMessages,
};

export type ForgetPageLocale = keyof typeof forgetPageLocales;

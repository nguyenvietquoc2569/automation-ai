import enMessages from '../locales/en.json';
import viMessages from '../locales/vi.json';

export const loginPageLocales = {
  en: enMessages,
  vi: viMessages,
};

export type LoginPageLocale = keyof typeof loginPageLocales;

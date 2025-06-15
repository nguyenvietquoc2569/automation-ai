'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import enMessages from '../locales/en.json';
import viMessages from '../locales/vi.json';

export type SupportedLocale = 'en' | 'vi';

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  messages: Record<string, string>;
}

const messages = {
  en: enMessages,
  vi: viMessages,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');

  // Load saved locale from localStorage on component mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('workforce-locale') as SupportedLocale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'vi')) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('workforce-locale', newLocale);
  };

  const contextValue: LanguageContextType = {
    locale,
    setLocale,
    messages: messages[locale],
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      <IntlProvider locale={locale} messages={messages[locale]}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
};

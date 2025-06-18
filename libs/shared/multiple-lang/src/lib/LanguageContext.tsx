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
  isHydrated: boolean;
}

const coreMessages = {
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
  storageKey?: string; // Allow customization of sessionStorage key
  additionalMessages?: {
    en?: Record<string, string>;
    vi?: Record<string, string>;
  };
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  storageKey = 'app-locale', // Default storage key
  additionalMessages = {},
}) => {
  // Always start with English for SSR consistency
  const [locale, setLocaleState] = useState<SupportedLocale>('en');
  const [isHydrated, setIsHydrated] = useState(false);

  // Merge core messages with additional messages from libraries
  const mergedMessages = {
    en: { ...coreMessages.en, ...additionalMessages.en },
    vi: { ...coreMessages.vi, ...additionalMessages.vi },
  };

  // Load saved locale from sessionStorage on client-side hydration
  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);
    
    // Only access sessionStorage on the client side
    if (typeof window !== 'undefined') {
      try {
        const savedLocale = sessionStorage.getItem(storageKey) as SupportedLocale;
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'vi')) {
          setLocaleState(savedLocale);
        }
      } catch (error) {
        // Handle cases where sessionStorage might not be available
        console.warn('Failed to access sessionStorage:', error);
      }
    }
  }, [storageKey]);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    
    // Only save to sessionStorage on the client side
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(storageKey, newLocale);
      } catch (error) {
        console.warn('Failed to save to sessionStorage:', error);
      }
    }
  };

  const contextValue: LanguageContextType = {
    locale,
    setLocale,
    messages: mergedMessages[locale],
    isHydrated,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      <IntlProvider locale={locale} messages={mergedMessages[locale]}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
};

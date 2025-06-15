# Multi-Language Support Documentation

## Overview

The Workforce application now supports multi-language functionality with Vietnamese and English languages. The internationalization system is built using React Intl and provides a comprehensive translation system.

## Features

- ✅ **Language Context Provider**: Centralized language state management
- ✅ **Language Switcher Component**: Easy language switching in the UI
- ✅ **Translation Files**: Complete Vietnamese and English translations
- ✅ **Persistent Language Selection**: Language preference saved in localStorage
- ✅ **React Intl Integration**: Industry-standard internationalization library
- ✅ **TypeScript Support**: Fully typed translation system

## Implementation Details

### 1. Language Context Provider

Location: `src/app/contexts/LanguageContext.tsx`

The `LanguageProvider` component wraps the application and provides:
- Current locale state
- Language switching functionality  
- Translation messages for the selected language
- Persistent storage of language preference

```tsx
import { LanguageProvider } from './contexts/LanguageContext';

// Wrap your app
<LanguageProvider>
  {children}
</LanguageProvider>
```

### 2. Language Switcher Component

Location: `src/app/components/LanguageSwitcher.tsx`

A reusable component that provides language switching functionality:
- Dropdown with language options
- Globe icon for visual clarity
- Automatic UI update when language changes

```tsx
import { LanguageSwitcher } from './components/LanguageSwitcher';

// Use anywhere in your app
<LanguageSwitcher />
```

### 3. Translation Files

Locations:
- English: `src/app/locales/en.json`
- Vietnamese: `src/app/locales/vi.json`

Both files contain comprehensive translations for:
- Application branding and titles
- Navigation elements
- Dashboard content
- Authentication pages (login, register, forgot password)
- Common UI elements (buttons, forms, messages)

### 4. Using Translations in Components

#### Method 1: Direct React Intl Hook
```tsx
import { useIntl } from 'react-intl';

function MyComponent() {
  const intl = useIntl();
  
  return (
    <h1>{intl.formatMessage({ id: 'dashboard.welcome' })}</h1>
  );
}
```

#### Method 2: Custom Translation Hook
```tsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <h1>{t('dashboard.welcome')}</h1>
  );
}
```

## Supported Languages

### English (en)
- Default language
- Complete translations for all UI elements
- American English conventions

### Vietnamese (vi)
- Complete Vietnamese translations
- Proper Vietnamese typography and formatting
- Cultural appropriate translations

## Translation Keys Structure

Translation keys follow a hierarchical structure:

```
app.*          - Application-level (title, description, footer)
nav.*          - Navigation elements
dashboard.*    - Dashboard page content
auth.*         - Authentication pages
language.*     - Language switcher
common.*       - Common UI elements
```

## Adding New Languages

To add a new language:

1. Create a new translation file: `src/app/locales/[locale].json`
2. Add the locale to the `SupportedLocale` type in `LanguageContext.tsx`
3. Import and add the messages to the `messages` object
4. Add the new language option to `LanguageSwitcher.tsx`

Example for adding French:

```tsx
// 1. Create fr.json
{
  "dashboard.welcome": "Bienvenue au Tableau de Bord Workforce 🤖"
  // ... other translations
}

// 2. Update LanguageContext.tsx
export type SupportedLocale = 'en' | 'vi' | 'fr';

import frMessages from '../locales/fr.json';

const messages = {
  en: enMessages,
  vi: viMessages,
  fr: frMessages,
};

// 3. Update LanguageSwitcher.tsx
<Option value="fr">Français</Option>
```

## File Structure

```
src/app/
├── contexts/
│   └── LanguageContext.tsx      # Language context provider
├── components/
│   └── LanguageSwitcher.tsx     # Language switcher component
├── locales/
│   ├── en.json                  # English translations
│   └── vi.json                  # Vietnamese translations
├── hooks/
│   └── useTranslation.ts        # Custom translation hook
└── types/
    └── json.d.ts                # TypeScript JSON module declarations
```

## Configuration Files

### TypeScript Configuration
The `tsconfig.json` includes JSON files in the compilation:
```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*.json"
  ]
}
```

### Package Dependencies
```json
{
  "dependencies": {
    "react-intl": "latest"
  }
}
```

## Best Practices

1. **Consistent Key Naming**: Use dot notation for hierarchical organization
2. **Complete Coverage**: Ensure all user-facing text has translation keys
3. **Cultural Adaptation**: Consider cultural differences, not just language
4. **Testing**: Test all languages thoroughly in different screen sizes
5. **Performance**: Translation files are bundled, keep them reasonably sized

## Troubleshooting

### Common Issues

1. **Missing Translation Keys**: 
   - Check console for missing key warnings
   - Ensure key exists in all language files

2. **TypeScript Errors with JSON Imports**:
   - Verify `resolveJsonModule: true` in tsconfig.json
   - Check that JSON files are included in TypeScript compilation

3. **Language Not Persisting**:
   - Check browser localStorage for 'workforce-locale' key
   - Verify LanguageProvider wraps the entire application

4. **Language Switcher Not Updating**:
   - Ensure components use translation hooks
   - Check that context is properly provided

## Performance Considerations

- Translation files are loaded at build time
- Language switching is instant (no network requests)
- localStorage provides persistence across sessions
- Component re-renders are optimized by React Intl

## Future Enhancements

Potential improvements for the multi-language system:
- Right-to-left (RTL) language support
- Dynamic language loading for larger applications
- Translation management system integration
- Automatic language detection from browser settings
- Pluralization rules for different languages
- Date, time, and number formatting per locale

# Multilingual Support Migration to Nx Library

## Overview

The multilingual support components and utilities have been successfully migrated from the main workforce app to a dedicated Nx library `@automation-ai/multiple-lang`. This migration consolidates all internationalization (i18n) functionality into a reusable library that can be shared across multiple applications in the workspace.

## Migration Details

### What was moved:

1. **LanguageContext & Provider**:
   - **From**: `/apps/workforce/src/app/contexts/LanguageContext.tsx`
   - **To**: `/libs/shared/multiple-lang/src/lib/LanguageContext.tsx`

2. **LanguageSwitcher Component**:
   - **From**: `/apps/workforce/src/app/components/LanguageSwitcher.tsx` (reimplemented as wrapper)
   - **To**: `/libs/shared/multiple-lang/src/lib/LanguageSwitcher.tsx`

3. **useTranslation Hook**:
   - **From**: `/apps/workforce/src/app/hooks/useTranslation.ts` (reimplemented as wrapper)
   - **To**: `/libs/shared/multiple-lang/src/lib/useTranslation.ts`

4. **Locale Files**:
   - **From**: `/apps/workforce/src/app/locales/en.json` & `vi.json`
   - **To**: `/libs/shared/multiple-lang/src/locales/en.json` & `vi.json`

### Architecture Changes:

1. **Library Structure**:
   ```
   libs/shared/multiple-lang/
   ├── package.json           # Package configuration with dependencies
   ├── project.json           # Nx project configuration
   ├── tsconfig.json          # TypeScript project references
   ├── tsconfig.lib.json      # Library-specific TypeScript config
   └── src/
       ├── index.ts           # Library exports
       ├── lib/
       │   ├── multiple-lang.ts       # Original function (kept for backward compatibility)
       │   ├── LanguageContext.tsx    # React Context for language management
       │   ├── LanguageSwitcher.tsx   # Language switcher component
       │   └── useTranslation.ts      # Translation hook
       └── locales/
           ├── en.json        # English translations
           └── vi.json        # Vietnamese translations
   ```

2. **Enhanced LanguageProvider**:
   - Added configurable `storageKey` prop for localStorage customization
   - Improved TypeScript typing
   - Better error handling with context validation

3. **Workspace Configuration**:
   - Updated `tsconfig.base.json` with path mappings
   - Configured TypeScript project references
   - Added library build targets in Nx

## Usage

### In the Workforce App:

```tsx
// apps/workforce/src/app/layout.tsx
import { LanguageProvider } from '@automation-ai/multiple-lang';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <LanguageProvider storageKey="workforce-locale">
            {children}
          </LanguageProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
```

```tsx
// apps/workforce/src/app/components/LanguageSwitcher.tsx
import { LanguageSwitcher as LibLanguageSwitcher } from '@automation-ai/multiple-lang';

export const LanguageSwitcher = ({ style }) => {
  return <LibLanguageSwitcher style={style} />;
};
```

```tsx
// apps/workforce/src/app/hooks/useTranslation.ts
import { useTranslation as libUseTranslation } from '@automation-ai/multiple-lang';

export const useTranslation = libUseTranslation;
```

### In Other Apps:

```tsx
import { 
  LanguageProvider, 
  LanguageSwitcher, 
  useTranslation,
  useLanguage 
} from '@automation-ai/multiple-lang';

// Basic usage
function App() {
  return (
    <LanguageProvider storageKey="my-app-locale">
      <MyComponent />
    </LanguageProvider>
  );
}

// Using the translation hook
function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <LanguageSwitcher />
    </div>
  );
}

// Direct language management
function LanguageManager() {
  const { locale, setLocale } = useLanguage();
  
  return (
    <button onClick={() => setLocale(locale === 'en' ? 'vi' : 'en')}>
      Current: {locale}
    </button>
  );
}
```

## Features

### Supported Languages
- **English** (`en`): Default language
- **Vietnamese** (`vi`): Secondary language

### Components & Hooks

1. **LanguageProvider**:
   - Manages language state and localStorage persistence
   - Provides React Intl context
   - Configurable storage key
   - Automatic locale detection from localStorage

2. **LanguageSwitcher**:
   - Dropdown component for language selection
   - Ant Design Select component with global icon
   - Internationalized option labels
   - Customizable styling

3. **useTranslation**:
   - Simple translation hook
   - Returns `t` function for message formatting
   - Access to full React Intl instance
   - Type-safe message keys

4. **useLanguage**:
   - Direct access to language context
   - Get/set current locale
   - Access to current messages object

### Translation Keys

The library includes comprehensive translation keys for:
- **App Metadata**: Titles, descriptions, footer
- **Navigation**: Menu items, buttons, actions
- **Dashboard**: Welcome messages, statistics, quick actions
- **Authentication**: Login, register, forgot password forms
- **Common UI**: Buttons, labels, status messages
- **Language Options**: Language names and switcher labels

## Dependencies

The library includes these dependencies:
- `react` & `react-dom`: Core React dependencies
- `antd`: UI components (Select, Space, Icons)
- `react-intl`: Internationalization framework
- `tslib`: TypeScript utilities

## TypeScript Configuration

The migration uses TypeScript project references for proper dependency management:
- Library compiles independently with React/JSX support
- JSON module resolution for locale files
- Type-safe imports in consuming applications
- Supports incremental compilation

## Build Verification

✅ Library builds successfully: `npx nx build multiple-lang`
✅ Workforce app builds successfully with library integration
✅ TypeScript compilation passes with JSON locale imports
✅ No import or dependency errors
✅ Old files successfully removed from workforce app

## Benefits

1. **Reusability**: Multilingual support can be used across multiple applications
2. **Centralized Management**: Single source of truth for translations and language logic
3. **Consistency**: Standardized translation keys and language switching behavior
4. **Maintainability**: Easier to add new languages and update translations
5. **Framework Agnostic**: Core logic separated from app-specific implementation
6. **Type Safety**: Full TypeScript support with proper typing
7. **Performance**: Optimized builds with proper dependency management

## Migration Summary

This completes the multilingual support migration, establishing a robust foundation for internationalization across the entire workspace. The library follows the same architectural patterns as the authentication libraries:

- **Authentication Libraries**:
  - `@automation-ai/login-page`
  - `@automation-ai/user-register-page`  
  - `@automation-ai/forget-page`

- **Shared Libraries**:
  - `@automation-ai/multiple-lang` ✅ (New)

## Next Steps

With the multilingual library in place, future enhancements could include:

1. **Additional Languages**: Easy to add more locale files and language options
2. **Dynamic Loading**: Implement lazy loading of translation files
3. **Translation Management**: Integration with translation services or management tools
4. **RTL Support**: Right-to-left language support for Arabic, Hebrew, etc.
5. **Date/Number Formatting**: Extended internationalization for dates, numbers, currencies
6. **Pluralization**: Advanced plural rules for different languages

The multilingual migration establishes a solid foundation for international applications while maintaining code reusability and consistency across the workspace.

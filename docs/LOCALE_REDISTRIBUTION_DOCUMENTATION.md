# Locale Redistribution Documentation

## Overview
Successfully redistributed locale assets from the centralized `@automation-ai/multiple-lang` library to their respective auth libraries for better modularity.

## Completed Tasks

### ✅ 1. Created Individual Locale Files
- **Login Page Library** (`@automation-ai/login-page`):
  - `src/locales/en.json` and `src/locales/vi.json`
  - Contains: `auth.loginToAccount`, `auth.email`, `auth.password`, `auth.rememberMe`, `auth.forgotPasswordText`, `auth.loginButton`, `auth.noAccount`, `auth.register`

- **Register Page Library** (`@automation-ai/user-register-page`):
  - `src/locales/en.json` and `src/locales/vi.json`
  - Contains: `auth.createAccount`, `auth.email`, `auth.password`

- **Forget Page Library** (`@automation-ai/forget-page`):
  - `src/locales/en.json` and `src/locales/vi.json`
  - Contains: `auth.forgotPassword`, `auth.resetDescription`, `auth.email`, `auth.resetButton`, `auth.backToLogin`, `auth.emailSent`

### ✅ 2. Updated Central Locale Files
- Removed auth-specific keys from `@automation-ai/multiple-lang/src/locales/`
- Kept only shared keys: `app.*`, `nav.*`, `dashboard.*`, `language.*`, `common.*`

### ✅ 3. Created Locale Export Systems
- Added `src/lib/locales.ts` to each auth library
- Exported locale objects and types
- Updated library index files to export locales

### ✅ 4. Updated TypeScript Configuration
- Added `src/**/*.json` to `include` patterns in `tsconfig.lib.json` files
- Enabled JSON module resolution in all auth libraries

### ✅ 5. Enhanced LanguageContext
- Updated `LanguageProvider` to accept `additionalMessages` prop
- Implemented message merging system: `{ ...coreMessages[locale], ...additionalMessages[locale] }`
- Maintained backward compatibility

### ✅ 6. Updated Application Layout
- Modified `apps/workforce/src/app/layout.tsx` to aggregate locales from all auth libraries
- Imported locale objects from each auth library
- Passed merged messages to `LanguageProvider`

## Architecture Benefits

### 📦 **Modularity**
- Each auth library now contains its own locale files
- Libraries are self-contained with their translations
- Easier to maintain and update individual components

### 🔄 **Scalability**
- New auth libraries can easily add their own locales
- Central system automatically aggregates all locale messages
- No need to modify central locale files when adding new auth components

### 🎯 **Separation of Concerns**
- Auth-specific translations live with auth components
- Shared translations remain in the central library
- Clear ownership of translation keys

## File Structure
```
libs/
├── feature/user-auth/
│   ├── login-page/src/
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   └── vi.json
│   │   └── lib/locales.ts
│   ├── user-register-page/src/
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   └── vi.json
│   │   └── lib/locales.ts
│   └── forget-page/src/
│       ├── locales/
│       │   ├── en.json
│       │   └── vi.json
│       └── lib/locales.ts
└── shared/multiple-lang/src/
    ├── locales/
    │   ├── en.json (shared keys only)
    │   └── vi.json (shared keys only)
    └── lib/LanguageContext.tsx (updated)
```

## Usage Example

```tsx
// In apps/workforce/src/app/layout.tsx
import { loginPageLocales } from '@automation-ai/login-page';
import { registerPageLocales } from '@automation-ai/user-register-page';
import { forgetPageLocales } from '@automation-ai/forget-page';

const additionalMessages = {
  en: {
    ...loginPageLocales.en,
    ...registerPageLocales.en,
    ...forgetPageLocales.en,
  },
  vi: {
    ...loginPageLocales.vi,
    ...registerPageLocales.vi,
    ...forgetPageLocales.vi,
  },
};

<LanguageProvider additionalMessages={additionalMessages}>
  {children}
</LanguageProvider>
```

## Status: ✅ COMPLETED
The locale redistribution is complete and the system is ready for use. All auth libraries now manage their own translations while maintaining integration with the central multilingual system.

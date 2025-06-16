# Mongoose Model Overwrite Error Fix

## Issue
Getting `OverwriteModelError: Cannot overwrite 'User' model once compiled` in development with hot reloading or when models are imported multiple times.

## Root Cause
Mongoose throws this error when trying to register a model with a name that already exists. This commonly happens in:
- Next.js development with hot reloading
- Multiple imports of the same model
- Jest tests that import models multiple times

## Solution Applied
Used the safe model export pattern that checks if the model already exists before creating it:

### Before (Problematic)
```typescript
export const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);
```

### After (Safe Pattern)
```typescript
const _model = () => mongoose.model<IUserDocument, IUserModel>('User', userSchema);
export const User = (mongoose.models.User || _model()) as ReturnType<typeof _model>;
```

## How It Works
1. **`mongoose.models.User`** - Checks if the User model already exists in Mongoose's model registry
2. **`_model()`** - Creates the model only if it doesn't exist
3. **`ReturnType<typeof _model>`** - Ensures proper TypeScript typing

## Models Fixed
Applied this pattern to all database models:

### ✅ User Model
- File: `libs/database/src/lib/models/user.model.ts`
- Export: `export const User = (mongoose.models.User || _model()) as ReturnType<typeof _model>;`

### ✅ Organization Model  
- File: `libs/database/src/lib/models/organization.model.ts`
- Export: `export const Organization = (mongoose.models.Organization || _model()) as ReturnType<typeof _model>;`

### ✅ Service Model
- File: `libs/database/src/lib/models/service.model.ts` 
- Export: `export const Service = (mongoose.models.Service || _model()) as ReturnType<typeof _model>;`

### ✅ Session Model
- File: `libs/database/src/lib/models/session.model.ts`
- Export: `export const Session = (mongoose.models.Session || _model()) as ReturnType<typeof _model>;`

## Benefits
- ✅ **No more OverwriteModelError** in development
- ✅ **Safe for hot reloading** in Next.js development
- ✅ **Works with Jest tests** that import models multiple times
- ✅ **Maintains full TypeScript support** with proper typing
- ✅ **Clean and readable code** pattern

## Testing
After this fix:
1. Development server can restart without model errors
2. Hot reloading works smoothly
3. API routes can import models safely
4. Tests can run without model registration issues

## Usage
Models can be imported and used exactly the same way:
```typescript
import { User, Organization, Service, Session } from '@automation-ai/database';

// Use normally
const user = await User.findOne({ email: 'user@example.com' });
const org = await Organization.create({ name: 'my-org' });
```

The fix is transparent to consumers of the database library!

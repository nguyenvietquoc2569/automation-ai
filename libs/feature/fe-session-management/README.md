# Session Management Library (@automation-ai/fe-session-management)

A comprehensive session management solution for Next.js applications with server-side and client-side authentication handling.

## Features

- ✅ **Server-side session validation** for protected routes
- ✅ **Client-side session management** with React Context
- ✅ **Automatic redirects** for unauthenticated users
- ✅ **Permission-based access control**
- ✅ **Session expiration handling**
- ✅ **Hydration-safe** components
- ✅ **TypeScript** support with full type safety

## Quick Start

### 1. Add to your root layout

```tsx
// app/layout.tsx
import { SessionLayoutWrapper } from '@automation-ai/fe-session-management';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <SessionLayoutWrapper>
          {children}
        </SessionLayoutWrapper>
      </body>
    </html>
  );
}
```

### 2. Protect routes

```tsx
// app/dashboard/layout.tsx
import { SessionGuard } from '@automation-ai/fe-session-management';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard requireAuth={true}>
      {children}
    </SessionGuard>
  );
}
```

### 3. Use session in components

```tsx
'use client';
import { useSession } from '@automation-ai/fe-session-management';

export function UserProfile() {
  const { session, logout } = useSession();
  
  return (
    <div>
      <h1>Welcome {session?.user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

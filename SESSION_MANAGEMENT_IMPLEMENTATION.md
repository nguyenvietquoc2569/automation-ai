# Implementation Guide: Adding Session Management to Workforce App

## Step 1: Update the workforce app to use the new session management library

### Add dependency to workforce app

First, add the new library as a dependency to the workforce app by updating its `package.json`:

```json
{
  "dependencies": {
    "@automation-ai/fe-session-management": "*"
  }
}
```

### Update the root layout

Replace the current layout with session management:

```tsx
// apps/workforce/src/app/layout.tsx
import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import './global.css';
import { LanguageProvider } from '@automation-ai/multiple-lang';
import { SessionLayoutWrapper } from '@automation-ai/fe-session-management';
import { loginPageLocales } from '@automation-ai/login-page';
import { registerPageLocales } from '@automation-ai/user-register-page';
import { forgetPageLocales } from '@automation-ai/forget-page';

export const metadata = {
  title: 'Workforce Dashboard',
  description: 'Comprehensive workforce management platform built with Next.js and Ant Design',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Aggregate all locale messages from auth libraries
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

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AntdRegistry>
          <LanguageProvider 
            storageKey="workforce-locale"
            additionalMessages={additionalMessages}
          >
            <SessionLayoutWrapper loginPath="/login">
              {children}
            </SessionLayoutWrapper>
          </LanguageProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
```

### Create a protected dashboard layout

```tsx
// apps/workforce/src/app/dashboard/layout.tsx
import { SessionGuard } from '@automation-ai/fe-session-management';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionGuard 
      requireAuth={true}
      loginPath="/login"
      loadingComponent={
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div>Checking authentication...</div>
        </div>
      }
    >
      <div className="dashboard-layout">
        {children}
      </div>
    </SessionGuard>
  );
}
```

### Update the dashboard page to use session hooks

```tsx
// apps/workforce/src/app/dashboard/page.tsx
'use client';
import React from 'react';
import { useSession } from '@automation-ai/fe-session-management';
import { Card, Typography, Button, Space, Avatar, Tag } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { session, logout } = useSession();

  if (!session) {
    return null; // SessionGuard will handle redirect
  }

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar 
                size={64} 
                icon={<UserOutlined />} 
                src={session.user.avatar} 
              />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  Welcome back, {session.user.name}!
                </Title>
                <Text type="secondary">@{session.user.username}</Text>
                <br />
                <Text type="secondary">{session.user.emailid}</Text>
                {session.user.title && (
                  <>
                    <br />
                    <Tag color="blue">{session.user.title}</Tag>
                  </>
                )}
              </div>
            </div>
            <Button 
              type="primary" 
              danger 
              icon={<LogoutOutlined />}
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </Card>

        <Card title="Current Organization" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {session.currentOrg.logo && (
              <Avatar src={session.currentOrg.logo} />
            )}
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {session.currentOrg.displayName || session.currentOrg.name}
              </Title>
              <Text type="secondary">ID: {session.currentOrg.id}</Text>
              {session.currentOrg.subscription && (
                <>
                  <br />
                  {session.currentOrg.subscription.plan && (
                    <Tag color="green">
                      {session.currentOrg.subscription.plan.toUpperCase()} Plan
                    </Tag>
                  )}
                  {session.currentOrg.subscription.features && (
                    <Tag>
                      Features: {session.currentOrg.subscription.features.length}
                    </Tag>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>

        {session.availableOrgs.length > 1 && (
          <Card title="Available Organizations" style={{ marginBottom: '24px' }}>
            <Space wrap>
              {session.availableOrgs.map((org) => (
                <Card 
                  key={org.id} 
                  size="small" 
                  style={{ 
                    width: '200px',
                    cursor: org.id === session.currentOrg.id ? 'default' : 'pointer',
                    border: org.id === session.currentOrg.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    {org.logo && <Avatar src={org.logo} style={{ marginBottom: '8px' }} />}
                    <div>
                      <Text strong>{org.displayName || org.name}</Text>
                      {org.id === session.currentOrg.id && (
                        <div><Tag color="blue">Current</Tag></div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>
        )}

        <Card title="User Permissions">
          <Space wrap>
            {session.permissions.map((permission) => (
              <Tag key={permission} color="cyan">
                {permission}
              </Tag>
            ))}
          </Space>
          {session.roles.length > 0 && (
            <>
              <Title level={5} style={{ marginTop: '16px', marginBottom: '8px' }}>
                Roles
              </Title>
              <Space wrap>
                {session.roles.map((role) => (
                  <Tag key={role} color="purple">
                    {role}
                  </Tag>
                ))}
              </Space>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
```

### Update login page to use the improved approach

```tsx
// apps/workforce/src/app/login/page.tsx
'use client';
import React from 'react';
import { LoginPage } from '@automation-ai/login-page';
import { LanguageSwitcher } from '@automation-ai/multiple-lang';
import { useSession } from '@automation-ai/fe-session-management';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function LoginPageWrapper() {
  const router = useRouter();
  const { isAuthenticated, refreshSession } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLoginSuccess = async () => {
    // Refresh session to get updated data
    await refreshSession();
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <LoginPage 
      LanguageSwitcher={LanguageSwitcher}
      onLoginSuccess={handleLoginSuccess}
      LinkComponent={Link}
      registerPath="/register"
      forgotPasswordPath="/forgot-password"
    />
  );
}
```

## Step 2: Add permission-based features

### Create an admin-only page

```tsx
// apps/workforce/src/app/admin/page.tsx
import { requirePermission } from '@automation-ai/fe-session-management';

export default async function AdminPage() {
  // This will redirect to /unauthorized if user doesn't have admin permission
  await requirePermission('admin:access');
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Only users with admin:access permission can see this page.</p>
    </div>
  );
}
```

### Create a user menu component

```tsx
// apps/workforce/src/app/components/UserMenu.tsx
'use client';
import { useSession, usePermission } from '@automation-ai/fe-session-management';
import { Avatar, Dropdown, Button } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';

export function UserMenu() {
  const { session, logout } = useSession();
  const canAccessAdmin = usePermission('admin:access');

  if (!session) return null;

  const menuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
    },
    ...(canAccessAdmin ? [{
      key: 'admin',
      label: 'Admin Panel',
      icon: <SettingOutlined />,
    }] : []),
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: logout,
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
      <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar 
          size="small" 
          src={session.user.avatar} 
          icon={<UserOutlined />} 
        />
        {session.user.name}
      </Button>
    </Dropdown>
  );
}
```

## Benefits of the New Session Management System

### ✅ **Server-Side Protection**
- Routes are protected at the server level
- Immediate redirects without client-side flash
- SEO-friendly (search engines see proper redirects)

### ✅ **Client-Side Features**
- Rich user experience with loading states
- Real-time session management
- Permission-based UI rendering

### ✅ **Developer Experience**
- Simple, declarative API
- TypeScript support with full type safety
- Reusable hooks and components

### ✅ **Performance**
- Hydration-safe components
- Minimal re-renders
- Efficient session validation

### ✅ **Security**
- Multiple layers of protection
- Permission checking at server and client
- Automatic session expiration handling

This new session management system provides a robust, scalable solution for authentication and authorization in your workforce application! 🎉

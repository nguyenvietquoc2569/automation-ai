import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import './global.css';
import { LanguageProvider } from '@automation-ai/multiple-lang';
import { ClientSessionWrapper } from '../components/ClientSessionWrapper';
import { loginPageLocales } from '@automation-ai/login-page';
import { registerPageLocales } from '@automation-ai/user-register-page';
import { forgetPageLocales } from '@automation-ai/forget-page';

export const metadata = {
  title: 'Workforce Dashboard',
  description:
    'Comprehensive workforce management platform built with Next.js and Ant Design',
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
            <ClientSessionWrapper loginPath="/login">
              {children}
            </ClientSessionWrapper>
          </LanguageProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

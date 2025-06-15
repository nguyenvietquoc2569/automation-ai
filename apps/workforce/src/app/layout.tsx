import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import './global.css';
import { LanguageProvider } from './contexts/LanguageContext';

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
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AntdRegistry>
          <LanguageProvider>{children}</LanguageProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

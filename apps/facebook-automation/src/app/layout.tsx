import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import AntdLayout from './components/AntdLayout';
import './global.css';

export const metadata = {
  title: 'Facebook Automation Dashboard',
  description: 'Automated Facebook management system built with Next.js and Ant Design',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <AntdLayout>
            {children}
          </AntdLayout>
        </AntdRegistry>
      </body>
    </html>
  );
}

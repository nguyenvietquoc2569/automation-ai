import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import '../global.css';

export const metadata = {
  title: 'Login - Facebook Automation Dashboard',
  description: 'Sign in to your Facebook automation dashboard',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import '../global.css';

export const metadata = {
  title: 'Register - Facebook Automation Dashboard',
  description: 'Create your Facebook automation dashboard account',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          {children}
        </AntdRegistry>
      </body>
    </html>
  );
}

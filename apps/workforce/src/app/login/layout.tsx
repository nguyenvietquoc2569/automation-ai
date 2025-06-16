import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import '../global.css';

export const metadata = {
  title: 'Login - Workforce Dashboard',
  description: 'Sign in to your workforce platform',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AntdRegistry>{children}</AntdRegistry>
  );
}

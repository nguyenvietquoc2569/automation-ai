import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import '../global.css';

export const metadata = {
  title: 'Forgot Password - Workforce Dashboard',
  description: 'Reset your workforce platform password',
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AntdRegistry>{children}</AntdRegistry>
  );
}

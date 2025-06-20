import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import '../global.css';

export const metadata = {
  title: 'Register - Workforce Dashboard',
  description: 'Create your workforce platform account',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AntdRegistry>{children}</AntdRegistry>
  );
}

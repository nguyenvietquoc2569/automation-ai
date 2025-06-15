import React from 'react';
import AntdLayout from '../components/AntdLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AntdLayout>{children}</AntdLayout>;
}

'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import AntdLayout from './AntdLayout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const authPages = ['/login', '/register', '/forgot-password'];

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current page is an authentication page
  const isAuthPage = authPages.includes(pathname);
  
  // If it's an auth page, render children directly without the dashboard layout
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // Otherwise, wrap with the dashboard layout
  return <AntdLayout>{children}</AntdLayout>;
}

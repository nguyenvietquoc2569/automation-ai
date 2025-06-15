'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import AntdLayout from './AntdLayout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const authPages = ['/login', '/register', '/forgot-password'];

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by rendering a consistent initial state
  if (!isClient) {
    return <>{children}</>;
  }

  // Check if current page is an authentication page
  const isAuthPage = authPages.includes(pathname);

  // If it's an auth page, render children directly without the dashboard layout
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Otherwise, wrap with the dashboard layout
  return <AntdLayout>{children}</AntdLayout>;
}

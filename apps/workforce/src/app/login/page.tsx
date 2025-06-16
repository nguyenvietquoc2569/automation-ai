'use client';
import React, { useEffect } from 'react';
import { LoginPage } from '@automation-ai/login-page';
import { LanguageSwitcher } from '@automation-ai/multiple-lang';
import { useSession } from '@automation-ai/fe-session-management';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPageWrapper() {
  const router = useRouter();
  const { isAuthenticated, refreshSession } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLoginSuccess = async () => {
    // Refresh session to get updated data
    await refreshSession();
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <LoginPage 
      LanguageSwitcher={LanguageSwitcher}
      onLoginSuccess={handleLoginSuccess}
      LinkComponent={Link}
      registerPath="/register"
      forgotPasswordPath="/forgot-password"
    />
  );
}

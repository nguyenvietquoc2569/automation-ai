'use client';
import React from 'react';
import { LoginPage } from '@automation-ai/login-page';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginPageWrapper() {
  const router = useRouter();

  const handleLogin = async (values: LoginFormValues) => {
    try {
      // TODO: Implement actual login logic with your authentication service
      console.log('Login attempt:', values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Handle successful login (store token, etc.)
      // For now, redirect to dashboard
      router.push('/');
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw to let the LoginPage component handle the error display
    }
  };

  return (
    <LoginPage 
      LanguageSwitcher={LanguageSwitcher}
      onLogin={handleLogin}
      LinkComponent={Link}
    />
  );
}

'use client';
import React from 'react';
import { RegisterPage } from '@automation-ai/user-register-page';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export default function RegisterPageWrapper() {
  const router = useRouter();

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      // TODO: Implement actual registration logic with your authentication service
      console.log('Registration attempt:', values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Handle successful registration (store token, redirect, etc.)
      // For now, redirect to login or dashboard
      alert('Registration successful!');
      router.push('/login');
      
    } catch (error) {
      console.error('Registration failed:', error);
      throw error; // Re-throw to let the RegisterPage component handle the error display
    }
  };

  return (
    <RegisterPage 
      LanguageSwitcher={LanguageSwitcher}
      onRegister={handleRegister}
      LinkComponent={Link}
    />
  );
}

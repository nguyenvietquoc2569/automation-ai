'use client';
import React from 'react';
import { ForgotPasswordPage } from '@automation-ai/forget-page';
import { LanguageSwitcher } from '@automation-ai/multiple-lang';
import Link from 'next/link';

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordPageWrapper() {
  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    try {
      // TODO: Implement actual forgot password logic with your authentication service
      console.log('Forgot password attempt:', values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Handle successful forgot password request (send email, etc.)
      // The component will automatically show the success state after this resolves
      
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error; // Re-throw to let the ForgotPasswordPage component handle the error display
    }
  };

  return (
    <ForgotPasswordPage 
      LanguageSwitcher={LanguageSwitcher}
      onForgotPassword={handleForgotPassword}
      LinkComponent={Link}
    />
  );
}

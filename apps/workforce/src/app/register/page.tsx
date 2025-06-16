'use client';
import React, { useState } from 'react';
import { RegisterPage, AuthAPI, RegisterFormData, RegisterFormValues } from '@automation-ai/user-register-page';
import { LanguageSwitcher } from '@automation-ai/multiple-lang';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPageWrapper() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);
      
      // Validate passwords match
      if (values.password !== values.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Prepare registration data
      const registrationData: RegisterFormData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        terms: values.terms,
      };

      console.log('Registration attempt:', { email: values.email });

      // Call the registration API
      const response = await AuthAPI.register(registrationData);

      if (response.success) {
        console.log('Registration successful:', response.data);
        
        // Show success message
        alert(`Registration successful! Welcome ${response.data?.user.name}!\n\nYour personal organization "${response.data?.organization.displayName}" has been created.`);
        
        // TODO: Store authentication token if your system uses them
        // localStorage.setItem('authToken', response.data.token);
        
        // Redirect to login or dashboard
        router.push('/login');
      } else {
        throw new Error(response.error || 'Registration failed');
      }
      
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          alert('An account with this email already exists. Please use a different email or try logging in.');
        } else if (error.message.includes('Invalid email')) {
          alert('Please enter a valid email address.');
        } else if (error.message.includes('Password must be')) {
          alert('Password must be at least 8 characters long.');
        } else {
          alert(`Registration failed: ${error.message}`);
        }
      } else {
        alert('Registration failed. Please try again later.');
      }
      
      throw error; // Re-throw to let the RegisterPage component handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterPage 
      LanguageSwitcher={LanguageSwitcher}
      onRegister={handleRegister}
      LinkComponent={Link}
      loading={isLoading}
    />
  );
}

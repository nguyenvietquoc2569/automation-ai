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
      
      // Show user-friendly error message based on the specific error from backend
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('username already exists') || errorMessage.includes('username') && errorMessage.includes('exists')) {
          alert('A user with this username already exists. Please choose a different username.');
        } else if (errorMessage.includes('email already exists') || errorMessage.includes('email') && errorMessage.includes('exists')) {
          alert('A user with this email already exists. Please use a different email or try logging in.');
        } else if (errorMessage.includes('invalid email')) {
          alert('Please enter a valid email address.');
        } else if (errorMessage.includes('password must be') || errorMessage.includes('password') && errorMessage.includes('8 characters')) {
          alert('Password must be at least 8 characters long.');
        } else if (errorMessage.includes('passwords do not match')) {
          alert('The passwords you entered do not match. Please check and try again.');
        } else if (errorMessage.includes('terms')) {
          alert('Please accept the terms of service to continue.');
        } else if (errorMessage.includes('network error')) {
          alert('Network error. Please check your connection and try again.');
        } else {
          // Show the exact error message from the backend if it's user-friendly
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

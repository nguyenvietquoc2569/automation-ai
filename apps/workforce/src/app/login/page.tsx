'use client';
import React, { useState } from 'react';
import { LoginPage, AuthAPI, LoginFormValues, UserSession } from '@automation-ai/login-page';
import { LanguageSwitcher } from '@automation-ai/multiple-lang';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPageWrapper() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Use the AuthAPI to login
      const isEmail = values.emailOrUsername.includes('@');
      
      const loginData = {
        password: values.password,
        rememberMe: values.rememberMe,
        ...(isEmail 
          ? { emailid: values.emailOrUsername }
          : { username: values.emailOrUsername }
        )
      };

      const response = await AuthAPI.login(loginData);
      
      if (response.success && response.data) {
        // Login successful - redirect to dashboard
        router.push('/dashboard');
      }
      
    } catch (error) {
      console.error('Login failed:', error);
      
      // Show user-friendly error message based on the specific error from backend
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('invalid credentials') || 
            errorMessage.includes('invalid username') || 
            errorMessage.includes('invalid password')) {
          alert('Invalid username/email or password. Please check your credentials and try again.');
        } else if (errorMessage.includes('account suspended') || 
                   errorMessage.includes('inactive') || 
                   errorMessage.includes('suspended')) {
          alert('Your account is suspended or inactive. Please contact support for assistance.');
        } else if (errorMessage.includes('user not found')) {
          alert('No account found with this username/email. Please check your credentials or sign up for a new account.');
        } else if (errorMessage.includes('organization') && errorMessage.includes('access')) {
          alert('You do not have access to this organization. Please contact your administrator.');
        } else if (errorMessage.includes('network error')) {
          alert('Network error. Please check your connection and try again.');
        } else {
          // Show the exact error message from the backend if it's user-friendly
          alert(`Login failed: ${error.message}`);
        }
      } else {
        alert('Login failed. Please try again later.');
      }
      
      throw error; // Re-throw to let the LoginPage component handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (session: UserSession) => {
    // Handle successful login - store session info if needed
    console.log('Login successful:', session.user.name);
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <LoginPage 
      LanguageSwitcher={LanguageSwitcher}
      onLogin={handleLogin}
      onLoginSuccess={handleLoginSuccess}
      LinkComponent={Link}
      loading={isLoading}
      registerPath="/register"
      forgotPasswordPath="/forgot-password"
    />
  );
}

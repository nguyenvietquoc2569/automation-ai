// Test script to verify locale redistribution
import { loginPageLocales } from '@automation-ai/login-page';
import { registerPageLocales } from '@automation-ai/user-register-page';
import { forgetPageLocales } from '@automation-ai/forget-page';

console.log('Login Page Locales:', loginPageLocales);
console.log('Register Page Locales:', registerPageLocales);
console.log('Forget Page Locales:', forgetPageLocales);

// Verify keys exist
console.log('Login has auth.loginToAccount:', !!loginPageLocales.en['auth.loginToAccount']);
console.log('Register has auth.createAccount:', !!registerPageLocales.en['auth.createAccount']);
console.log('Forget has auth.forgotPassword:', !!forgetPageLocales.en['auth.forgotPassword']);

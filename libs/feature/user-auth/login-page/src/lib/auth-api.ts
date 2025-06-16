export interface LoginFormData {
  username?: string;
  emailid?: string;
  password: string;
  organizationId?: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    sessionToken: string;
    refreshToken?: string;
    expiresAt: Date;
    user: {
      id: string;
      name: string;
      username: string;
      ename: string;
      emailid: string;
      title?: string;
      avatar?: string;
      permissions: string[];
    };
    currentOrg: {
      id: string;
      name: string;
      displayName?: string;
      logo?: string;
      subscription?: {
        plan?: 'free' | 'basic' | 'premium' | 'enterprise';
        features?: string[];
      };
    };
    availableOrgs?: Array<{
      id: string;
      name: string;
      displayName?: string;
      logo?: string;
    }>;
    permissions: string[];
    roles?: string[];
  };
  error?: string;
}

export interface UserSession {
  sessionToken: string;
  user: {
    id: string;
    name: string;
    username: string;
    ename: string;
    emailid: string;
    title?: string;
    avatar?: string;
    permissions: string[];
  };
  currentOrg: {
    id: string;
    name: string;
    displayName?: string;
    logo?: string;
    subscription?: {
      plan?: 'free' | 'basic' | 'premium' | 'enterprise';
      features?: string[];
    };
  };
  availableOrgs: Array<{
    id: string;
    name: string;
    displayName?: string;
    logo?: string;
  }>;
  expiresAt: Date;
  permissions: string[];
  roles: string[];
}

/**
 * Authentication API client
 */
export class AuthAPI {
  private static baseUrl = '/api/auth';

  /**
   * Login user and create session
   */
  static async login(formData: LoginFormData): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login API error:', error);
      
      // If it's a fetch error (network issues, etc.), provide a user-friendly message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      // Re-throw the error as-is if it already has a message
      throw error;
    }
  }

  /**
   * Logout user and revoke session
   */
  static async logout(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Logout API error:', error);
      
      // Return success even if API fails (cookies will be cleared client-side)
      return { success: true, message: 'Logout completed' };
    }
  }

  /**
   * Get current user session
   */
  static async getCurrentUser(): Promise<UserSession | null> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'GET',
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Get current user API error:', error);
      return null;
    }
  }

  /**
   * Refresh session token
   */
  static async refreshToken(): Promise<UserSession | null> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'POST',
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Token refresh API error:', error);
      return null;
    }
  }

  /**
   * Check if the login API is available
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

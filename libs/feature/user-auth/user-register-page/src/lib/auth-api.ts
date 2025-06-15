export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  terms?: boolean;
  serviceName?: string;
  serviceDescription?: string;
  serviceCategory?: string;
  serviceTags?: string[];
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      username: string;
      emailid: string;
      title: string;
    };
    organization: {
      id: string;
      name: string;
      displayName: string;
    };
    service: {
      id: string;
      serviceName: string;
      serviceShortName: string;
    };
  };
  error?: string;
}

export class AuthAPI {
  private static baseUrl = '/api/auth';

  /**
   * Register a new user
   */
  static async register(formData: RegisterFormData): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration API error:', error);
      throw error;
    }
  }

  /**
   * Check if the registration API is available
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

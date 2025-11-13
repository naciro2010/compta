/**
 * API Client pour MizanPro Backend
 * Configuration centralisée des appels API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { requiresAuth = false, ...fetchConfig } = config;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchConfig.headers,
    };

    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchConfig,
        headers,
      });

      // Handle 401 - Token expired
      if (response.status === 401 && requiresAuth) {
        const refreshToken = this.getRefreshToken();
        if (refreshToken) {
          const refreshed = await this.refreshAccessToken(refreshToken);
          if (refreshed) {
            // Retry original request with new token
            headers['Authorization'] = `Bearer ${this.getToken()}`;
            const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
              ...fetchConfig,
              headers,
            });
            if (!retryResponse.ok) {
              throw new Error(`HTTP error! status: ${retryResponse.status}`);
            }
            return await retryResponse.json();
          }
        }
        // If refresh failed, clear tokens and throw
        this.clearTokens();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async refreshAccessToken(refreshToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.success && data.accessToken) {
        this.setToken(data.accessToken);
        if (data.refreshToken) {
          this.setRefreshToken(data.refreshToken);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Auth endpoints
  async login(email: string, password: string, rememberMe: boolean = false) {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });

    if (response.success && response.accessToken) {
      this.setToken(response.accessToken);
      if (response.refreshToken) {
        this.setRefreshToken(response.refreshToken);
      }
    }

    return response;
  }

  async register(data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    language?: string;
    timezone?: string;
  }) {
    const response = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.accessToken) {
      this.setToken(response.accessToken);
      if (response.refreshToken) {
        this.setRefreshToken(response.refreshToken);
      }
    }

    return response;
  }

  async logout() {
    const response = await this.request<any>('/auth/logout', {
      method: 'POST',
      requiresAuth: true,
    });
    this.clearTokens();
    return response;
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me', {
      method: 'GET',
      requiresAuth: true,
    });
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request<any>('/auth/change-password', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  // Integrations endpoints
  async getIntegrations() {
    return this.request<any>('/integrations', {
      method: 'GET',
      requiresAuth: true,
    });
  }

  async getIntegrationStatus(integrationId: string) {
    return this.request<any>(`/integrations/${integrationId}/status`, {
      method: 'GET',
      requiresAuth: true,
    });
  }

  async connectIntegration(integrationId: string, credentials: any) {
    return this.request<any>(`/integrations/${integrationId}/connect`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(credentials),
    });
  }

  async syncIntegration(integrationId: string) {
    return this.request<any>(`/integrations/${integrationId}/sync`, {
      method: 'POST',
      requiresAuth: true,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

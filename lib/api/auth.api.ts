import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    // Store token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminToken', token);
      
      // Set cookie synchronously for immediate availability
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      const isProduction = process.env.NODE_ENV === 'production';
      document.cookie = `adminToken=${token}; path=/; max-age=${maxAge}; ${isProduction ? 'secure; ' : ''}samesite=lax`;
      
      // Also set via API route as backup (async, non-blocking)
      fetch('/api/auth/set-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      }).catch(() => {
        // Ignore errors, cookie already set via document.cookie
      });
    }
    
    return {
      token,
      admin: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  logout: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      
      // Clear cookie synchronously
      document.cookie = 'adminToken=; path=/; max-age=0';
      
      // Also clear via API route (async, non-blocking)
      fetch('/api/auth/set-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: '' }),
      }).catch(() => {
        // Ignore errors
      });
    }
  },

  getCurrentUser: async (): Promise<AdminUser> => {
    const response = await api.get('/auth/me');
    
    // Check if response is HTML (ngrok warning page or error page)
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.error('getCurrentUser: Received HTML instead of JSON. This might be an ngrok warning page or error page.');
      throw new Error('Invalid response format: received HTML instead of JSON');
    }
    
    const user = response.data?.user || response.data;
    
    if (!user) {
      console.error('getCurrentUser: User data not found in response', response.data);
      throw new Error('User data not found in response');
    }
    
    if (!user._id && !user.id) {
      console.error('getCurrentUser: User ID not found', user);
      throw new Error('User ID not found in response');
    }
    
    return {
      id: user._id || user.id,
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'customer',
    };
  },
};

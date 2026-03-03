'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AdminUser } from '../api/auth.api';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        if (token) {
          // Set cookie synchronously for immediate availability
          // This ensures the cookie is available before any API calls
          if (typeof window !== 'undefined') {
            const maxAge = 60 * 60 * 24 * 7; // 7 days
            const isProduction = process.env.NODE_ENV === 'production';
            document.cookie = `adminToken=${token}; path=/; max-age=${maxAge}; ${isProduction ? 'secure; ' : ''}samesite=lax`;
          }
          
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
          
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error: any) {
        // Don't clear token for HTML/ngrok errors - these are configuration issues
        if (error?.message?.includes('HTML instead of JSON') || 
            error?.message?.includes('ngrok')) {
          console.error('Auth check failed due to ngrok/HTML response:', error);
          // Don't clear token, just log the error
          setLoading(false);
          return;
        }
        
        // Only clear token if it's an authentication error (401), not network errors
        const isAuthError = error?.response?.status === 401 || 
                           error?.response?.status === 403 ||
                           error?.message?.includes('token') ||
                           error?.message?.includes('unauthorized') ||
                           error?.message?.includes('User data not found') ||
                           error?.message?.includes('User ID not found');
        
        if (isAuthError) {
          // Token invalid or expired, clear it
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            // Clear cookie
            document.cookie = 'adminToken=; path=/; max-age=0';
            // Also clear via API route
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
        } else {
          // For other errors (network, etc.), log but don't clear token
          console.error('Auth check failed (non-auth error):', error);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setUser(response.admin);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

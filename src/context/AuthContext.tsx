import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IUser, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<void>;
  switchDemoAccount: (role: 'admin' | 'faculty' | 'student' | 'staff') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS = {
  admin: { email: 'admin@academic.edu', password: 'Admin@123' },
  faculty: { email: 'prof.sharma@academic.edu', password: 'Faculty@123' },
  student: { email: 'student.alex@academic.edu', password: 'Student@123' },
  staff: { email: 'staff.robert@academic.edu', password: 'Staff@123' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('academic_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
        localStorage.removeItem('academic_auth_token');
        setToken(null);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('academic_auth_token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [token, fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      localStorage.setItem('academic_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const register = async (userData: any) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.token) {
      localStorage.setItem('academic_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } else {
      throw new Error(res.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('academic_auth_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData: any) => {
    const res = await api.patch('/auth/profile', profileData);
    if (res.success && res.user) {
      setUser((prev) => (prev ? { ...prev, ...res.user } : res.user));
    }
  };

  const switchDemoAccount = async (role: 'admin' | 'faculty' | 'student' | 'staff') => {
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      await login(creds.email, creds.password);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        switchDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';
import { User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'student' | 'lecturer') => Promise<void>;
  logout: () => void;
  updateUserEnrolledCourses: (courseId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      console.log('Fetching user with token:', localStorage.getItem('token'));
      const response = await api.get('/auth/me');
      console.log('User fetch response:', response.data);
      const userData = response.data.data;
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { data } = response.data;
    
    console.log('Login response:', response.data);
    console.log('Setting user:', data.user);
    console.log('Setting token:', data.token);
    
    const userData = {
      ...data.user,
      _id: data.user._id || data.user.id 
    };
    
    setUser(userData);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const register = async (name: string, email: string, password: string, role: 'student' | 'lecturer') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { data } = response.data;
    
    console.log('Register response:', response.data);
    console.log('Setting user:', data.user);
    console.log('Setting token:', data.token);
    
    const userData = {
      ...data.user,
      _id: data.user._id || data.user.id 
    };
    
    setUser(userData);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const updateUserEnrolledCourses = (courseId: string) => {
    if (user) {
      setUser(prevUser => ({
        ...prevUser!,
        enrolledCourses: [...(prevUser?.enrolledCourses || []), courseId]
      }));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUserEnrolledCourses, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
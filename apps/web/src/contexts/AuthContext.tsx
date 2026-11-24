import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  username: string;
  email: string;
  mobile: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  fullName: string;
  registrationNumber?: string;
  teacherId?: string;
  grade?: number;
  preferredLanguage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, refreshToken: string, userData: User) => void;
  logout: () => Promise<void>;
  updateLanguage: (lang: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('educlick_access_token');
    const savedUser = localStorage.getItem('educlick_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (e) {
        console.error('Error parsing stored auth session', e);
      }
    }
    setLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('educlick_access_token', accessToken);
    localStorage.setItem('educlick_refresh_token', refreshToken);
    localStorage.setItem('educlick_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post('/api/v1/auth/logout');
      }
    } catch (e) {
      // Continue client cleanup even if network fails
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('educlick_access_token');
    localStorage.removeItem('educlick_refresh_token');
    localStorage.removeItem('educlick_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateLanguage = async (lang: string) => {
    if (user) {
      setUser({ ...user, preferredLanguage: lang });
      localStorage.setItem('educlick_user', JSON.stringify({ ...user, preferredLanguage: lang }));
      try {
        await axios.patch('/api/v1/auth/language', { language: lang });
      } catch (e) {
        console.warn('Failed to sync language to server', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateLanguage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

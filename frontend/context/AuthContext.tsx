"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  loading: true,
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would make an API call
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Sample login logic (replace with actual API call)
      if (email === 'user@example.com' && password === 'password') {
        const user = {
          id: '1',
          name: 'John Doe',
          email: 'user@example.com',
          role: 'user'
        };
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return true;
      } else if (email === 'admin@example.com' && password === 'admin') {
        const user = {
          id: '2',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin'
        };
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call to register the user
      // For now, we'll just simulate a successful registration
      const newUser = {
        id: Math.random().toString(36).substr(2, 9), // Generate a random ID
        name,
        email,
        role: 'user'
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
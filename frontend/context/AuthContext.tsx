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

  // Check for existing login on mount
  useEffect(() => {
    const checkLoggedIn = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          console.log("Found existing login, restoring session");
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        // Clear potentially corrupted storage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log(`AuthContext: Login attempt for ${email}`);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        cache: 'no-store',
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error(`AuthContext: Login failed - ${data.error || 'Unknown error'}`);
        return false;
      }
      
      if (!data.user || !data.token) {
        console.error('AuthContext: Invalid response format - missing user or token');
        return false;
      }
      
      console.log(`AuthContext: Login successful for ${data.user.email}`);
      
      // Store user data and token
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      return true;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return false;
    } finally {
      setLoading(false);
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
    console.log("Logging out user");
    // Clear auth state
    setUser(null);
    
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Force page refresh to reset all state
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
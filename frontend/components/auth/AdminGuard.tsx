"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertTriangle } from 'react-icons/fi';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is admin
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        router.push('/login');
        return;
      }
      
      try {
        const user = JSON.parse(storedUser);
        if (user.role === 'admin') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <div className="mb-4 flex justify-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
              <FiAlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You do not have permission to access this page. This area is restricted to administrators only.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
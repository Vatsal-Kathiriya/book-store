"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type RouteGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, redirects to login if not authenticated
  guestOnly?: boolean;   // If true, redirects to home if already authenticated
};

export default function RouteGuard({ 
  children, 
  requireAuth = false, 
  guestOnly = false 
}: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (loading) return;
    
    // If page requires authentication and user is not logged in
    if (requireAuth && !user) {
      console.log("Auth required but no user, redirecting to login");
      router.push('/login');
      return;
    }
    
    // If page is for guests only and user is logged in
    if (guestOnly && user) {
      console.log("Guest only page but user is logged in, redirecting to home");
      router.push('/');
      return;
    }
  }, [requireAuth, guestOnly, user, loading, router]);
  
  // Show nothing while checking authentication
  if ((requireAuth && !user && !loading) || (guestOnly && user && !loading)) {
    return null;
  }
  
  return <>{children}</>;
}

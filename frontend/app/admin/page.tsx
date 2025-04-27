"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';

const AdminPage = () => {
  const router = useRouter();

  // Redirect to dashboard on mount
  useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Admin Portal</h1>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPage;

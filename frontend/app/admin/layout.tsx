import AdminGuard from '@/components/auth/AdminGuard';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
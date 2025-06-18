'use client';
import { DashboardLayout } from '@automation-ai/fe-dashboard';

export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      title="Workbench"
      breadcrumbItems={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Workbench' }
      ]}
    >
      {children}
    </DashboardLayout>
  );
}

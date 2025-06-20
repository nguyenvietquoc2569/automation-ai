'use client';

import { ProtectedRoute } from '@automation-ai/fe-session-management';
import { DashboardLayout } from '@automation-ai/fe-dashboard';
import { FeTeamsManagement } from '@automation-ai/fe-teams-management';

export default function TeamsPage() {
  // Define breadcrumb items for the teams page
  const breadcrumbItems = [
    {
      title: 'Home',
      href: '/'
    },
    {
      title: 'Dashboard',
      href: '/dashboard'
    },
    {
      title: 'Teams'
    }
  ];

  // Footer configuration
  const footerProps = {
    companyName: 'Automation AI',
    links: [
      { key: 'privacy', label: 'Privacy Policy', href: '/privacy' },
      { key: 'terms', label: 'Terms of Service', href: '/terms' },
      { key: 'support', label: 'Support', href: '/support' }
    ]
  };

  return (
    <ProtectedRoute>
      <DashboardLayout 
        breadcrumbItems={breadcrumbItems}
        title="Teams Management"
        notificationCount={5}
        footerProps={footerProps}
      >
        <FeTeamsManagement />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

'use client';
import React from 'react';
import { ProtectedRoute } from '@automation-ai/fe-session-management';
import { DashboardLayout } from '@automation-ai/fe-dashboard';
import { ServiceList } from '@automation-ai/fe-services';

export default function ServicesPage() {
  // Define breadcrumb items for the services page
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
      title: 'Services'
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
        title="Service Management"
        notificationCount={5}
        footerProps={footerProps}
      >
        <ServiceList />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute, useSession } from '@automation-ai/fe-session-management';
import { DashboardLayout } from '@automation-ai/fe-dashboard';
import { FeServiceDetail } from '@automation-ai/fe-service-detail';

export default function ServiceDetailPage() {
  const params = useParams();
  const { session } = useSession();
  const serviceId = params.id as string;

  // Define breadcrumb items for the service detail page
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
      title: 'Services',
      href: '/services'
    },
    {
      title: serviceId
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

  const handleSubscriptionChange = (isSubscribed: boolean) => {
    console.log(`Subscription status changed: ${isSubscribed ? 'subscribed' : 'unsubscribed'}`);
    // You can add additional logic here, like updating global state or refetching data
  };

  return (
    <ProtectedRoute>
      <DashboardLayout 
        breadcrumbItems={breadcrumbItems}
        title="Service Details"
        notificationCount={5}
        footerProps={footerProps}
      >
        <FeServiceDetail 
          serviceId={serviceId}
          userId={session?.user?.id}
          onSubscriptionChange={handleSubscriptionChange}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

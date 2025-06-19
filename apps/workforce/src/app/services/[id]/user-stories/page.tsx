'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@automation-ai/fe-session-management';
import { DashboardLayout } from '@automation-ai/fe-dashboard';
import { Card, Typography, Timeline, Tag, Space } from 'antd';
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function UserStoriesPage() {
  const params = useParams();
  const serviceId = params.id as string;

  // Mock user stories data
  const userStories = [
    {
      id: 1,
      title: 'As a developer, I want to integrate the service API',
      description: 'I need to easily integrate the service API into my application so that I can automate workflows.',
      acceptanceCriteria: [
        'API documentation is available and clear',
        'Authentication is properly handled',
        'Error responses are standardized',
        'Rate limiting is documented'
      ],
      status: 'completed',
      priority: 'high',
      estimatedHours: 8
    },
    {
      id: 2,
      title: 'As a business user, I want to configure automation rules',
      description: 'I need a user-friendly interface to set up automation rules without technical knowledge.',
      acceptanceCriteria: [
        'Drag-and-drop rule builder',
        'Template library available',
        'Real-time validation',
        'Preview functionality'
      ],
      status: 'in-progress',
      priority: 'high',
      estimatedHours: 16
    },
    {
      id: 3,
      title: 'As an admin, I want to monitor service usage',
      description: 'I need comprehensive analytics to understand how the service is being used across the organization.',
      acceptanceCriteria: [
        'Usage dashboards',
        'Export functionality',
        'Real-time monitoring',
        'Alert configuration'
      ],
      status: 'planned',
      priority: 'medium',
      estimatedHours: 12
    },
    {
      id: 4,
      title: 'As a user, I want mobile access to the service',
      description: 'I need to access and control the service from mobile devices for on-the-go management.',
      acceptanceCriteria: [
        'Responsive web interface',
        'Mobile app availability',
        'Touch-friendly controls',
        'Offline capability'
      ],
      status: 'planned',
      priority: 'low',
      estimatedHours: 24
    }
  ];

  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Services', href: '/services' },
    { title: serviceId, href: `/services/${serviceId}` },
    { title: 'User Stories' }
  ];

  const footerProps = {
    companyName: 'Automation AI',
    links: [
      { key: 'privacy', label: 'Privacy Policy', href: '/privacy' },
      { key: 'terms', label: 'Terms of Service', href: '/terms' },
      { key: 'support', label: 'Support', href: '/support' }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in-progress': return 'blue';
      case 'planned': return 'orange';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'in-progress': return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'planned': return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      default: return <UserOutlined />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout
        breadcrumbItems={breadcrumbItems}
        title="User Stories"
        footerProps={footerProps}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Card>
            <Title level={2}>User Stories for {serviceId}</Title>
            <Paragraph>
              This page contains user stories that define the requirements and functionality 
              for this service from the end user perspective.
            </Paragraph>

            <Timeline
              mode="left"
              items={userStories.map(story => ({
                dot: getStatusIcon(story.status),
                children: (
                  <Card 
                    key={story.id}
                    style={{ marginBottom: '16px' }}
                    size="small"
                  >
                    <div style={{ marginBottom: '12px' }}>
                      <Title level={4} style={{ marginBottom: '8px' }}>
                        {story.title}
                      </Title>
                      <Space>
                        <Tag color={getStatusColor(story.status)}>
                          {story.status.toUpperCase()}
                        </Tag>
                        <Tag color={getPriorityColor(story.priority)}>
                          {story.priority.toUpperCase()} PRIORITY
                        </Tag>
                        <Tag>
                          {story.estimatedHours}h estimate
                        </Tag>
                      </Space>
                    </div>
                    
                    <Paragraph style={{ marginBottom: '16px' }}>
                      {story.description}
                    </Paragraph>

                    <div>
                      <Title level={5}>Acceptance Criteria:</Title>
                      <ul style={{ marginBottom: 0 }}>
                        {story.acceptanceCriteria.map((criteria, index) => (
                          <li key={index}>{criteria}</li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                )
              }))}
            />
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

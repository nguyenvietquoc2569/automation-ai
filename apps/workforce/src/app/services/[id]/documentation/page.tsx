'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@automation-ai/fe-session-management';
import { DashboardLayout } from '@automation-ai/fe-dashboard';
import { Card, Typography, Menu, Row, Col, Space, Tag } from 'antd';
import { 
  BookOutlined, 
  ApiOutlined, 
  SettingOutlined, 
  QuestionCircleOutlined,
  CodeOutlined,
  BugOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function DocumentationPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const [selectedSection, setSelectedSection] = useState('getting-started');

  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Services', href: '/services' },
    { title: serviceId, href: `/services/${serviceId}` },
    { title: 'Documentation' }
  ];

  const footerProps = {
    companyName: 'Automation AI',
    links: [
      { key: 'privacy', label: 'Privacy Policy', href: '/privacy' },
      { key: 'terms', label: 'Terms of Service', href: '/terms' },
      { key: 'support', label: 'Support', href: '/support' }
    ]
  };

  const menuItems = [
    {
      key: 'getting-started',
      icon: <BookOutlined />,
      label: 'Getting Started',
    },
    {
      key: 'api-reference',
      icon: <ApiOutlined />,
      label: 'API Reference',
    },
    {
      key: 'configuration',
      icon: <SettingOutlined />,
      label: 'Configuration',
    },
    {
      key: 'examples',
      icon: <CodeOutlined />,
      label: 'Code Examples',
    },
    {
      key: 'troubleshooting',
      icon: <BugOutlined />,
      label: 'Troubleshooting',
    },
    {
      key: 'faq',
      icon: <QuestionCircleOutlined />,
      label: 'FAQ',
    },
  ];

  const renderContent = () => {
    switch (selectedSection) {
      case 'getting-started':
        return (
          <div>
            <Title level={3}>Getting Started with {serviceId}</Title>
            <Paragraph>
              Welcome to the {serviceId} service documentation. This guide will help you get up and running quickly.
            </Paragraph>

            <Title level={4}>Prerequisites</Title>
            <ul>
              <li>Active subscription to the service</li>
              <li>API key for authentication</li>
              <li>Basic understanding of REST APIs</li>
            </ul>

            <Title level={4}>Quick Setup</Title>
            <Paragraph>
              <Text code>npm install @automation-ai/{serviceId}-sdk</Text>
            </Paragraph>

            <div style={{ background: '#f6f8fa', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <Text code>
{`import { AutomationClient } from '@automation-ai/${serviceId}-sdk';

const client = new AutomationClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.automation-ai.com'
});

// Initialize the service
await client.initialize();

// Start using the service
const result = await client.execute('your-automation-task');
console.log(result);`}
              </Text>
            </div>

            <Title level={4}>Next Steps</Title>
            <ul>
              <li>Explore the API Reference section</li>
              <li>Check out our code examples</li>
              <li>Join our community forum for support</li>
            </ul>
          </div>
        );

      case 'api-reference':
        return (
          <div>
            <Title level={3}>API Reference</Title>
            <Paragraph>
              Complete API documentation for {serviceId} service.
            </Paragraph>

            <Title level={4}>Authentication</Title>
            <Paragraph>
              All API requests require authentication using an API key in the header:
            </Paragraph>
            <div style={{ background: '#f6f8fa', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <Text code>Authorization: Bearer YOUR_API_KEY</Text>
            </div>

            <Title level={4}>Endpoints</Title>
            
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Space>
                <Tag color="green">GET</Tag>
                <Text code>/api/{serviceId}/status</Text>
              </Space>
              <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
                Get the current status of the service
              </Paragraph>
            </Card>

            <Card size="small" style={{ marginBottom: '16px' }}>
              <Space>
                <Tag color="blue">POST</Tag>
                <Text code>/api/{serviceId}/execute</Text>
              </Space>
              <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
                Execute an automation task
              </Paragraph>
            </Card>

            <Card size="small" style={{ marginBottom: '16px' }}>
              <Space>
                <Tag color="orange">PUT</Tag>
                <Text code>/api/{serviceId}/config</Text>
              </Space>
              <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
                Update service configuration
              </Paragraph>
            </Card>
          </div>
        );

      case 'configuration':
        return (
          <div>
            <Title level={3}>Configuration</Title>
            <Paragraph>
              Learn how to configure {serviceId} for your specific needs.
            </Paragraph>

            <Title level={4}>Environment Variables</Title>
            <div style={{ background: '#f6f8fa', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <Text code>
{`# Required
AUTOMATION_API_KEY=your-api-key
AUTOMATION_BASE_URL=https://api.automation-ai.com

# Optional
AUTOMATION_TIMEOUT=30000
AUTOMATION_RETRY_COUNT=3
AUTOMATION_LOG_LEVEL=info`}
              </Text>
            </div>

            <Title level={4}>Configuration File</Title>
            <Paragraph>
              You can also use a configuration file <Text code>automation.config.json</Text>:
            </Paragraph>
            <div style={{ background: '#f6f8fa', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <Text code>
{`{
  "apiKey": "your-api-key",
  "baseUrl": "https://api.automation-ai.com",
  "timeout": 30000,
  "retryCount": 3,
  "logLevel": "info",
  "features": {
    "enableCaching": true,
    "enableRetries": true,
    "enableMetrics": true
  }
}`}
              </Text>
            </div>
          </div>
        );

      case 'examples':
        return (
          <div>
            <Title level={3}>Code Examples</Title>
            <Paragraph>
              Practical examples of using {serviceId} in different scenarios.
            </Paragraph>

            <Title level={4}>Basic Usage</Title>
            <div style={{ background: '#f6f8fa', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <Text code>
{`// Basic automation task
const result = await client.execute({
  task: 'data-processing',
  input: {
    source: 'database',
    filters: { status: 'active' },
    output: 'csv'
  }
});

console.log('Task completed:', result.status);
console.log('Output location:', result.outputUrl);`}
              </Text>
            </div>

            <Title level={4}>Advanced Configuration</Title>
            <div style={{ background: '#f6f8fa', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <Text code>
{`// Advanced task with custom configuration
const result = await client.execute({
  task: 'workflow-automation',
  config: {
    parallel: true,
    maxConcurrency: 5,
    errorHandling: 'continue',
    notifications: {
      onComplete: 'email@example.com',
      onError: 'admin@example.com'
    }
  },
  input: {
    workflow: 'customer-onboarding',
    data: customerData
  }
});`}
              </Text>
            </div>
          </div>
        );

      case 'troubleshooting':
        return (
          <div>
            <Title level={3}>Troubleshooting</Title>
            <Paragraph>
              Common issues and their solutions when using {serviceId}.
            </Paragraph>

            <Title level={4}>Common Errors</Title>
            
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Title level={5}>Authentication Failed (401)</Title>
              <Paragraph>
                <strong>Cause:</strong> Invalid or missing API key<br/>
                <strong>Solution:</strong> Verify your API key is correct and has not expired
              </Paragraph>
            </Card>

            <Card size="small" style={{ marginBottom: '16px' }}>
              <Title level={5}>Rate Limit Exceeded (429)</Title>
              <Paragraph>
                <strong>Cause:</strong> Too many requests in a short period<br/>
                <strong>Solution:</strong> Implement exponential backoff and respect rate limits
              </Paragraph>
            </Card>

            <Card size="small" style={{ marginBottom: '16px' }}>
              <Title level={5}>Task Execution Failed (500)</Title>
              <Paragraph>
                <strong>Cause:</strong> Server error or invalid task configuration<br/>
                <strong>Solution:</strong> Check task parameters and try again, contact support if persists
              </Paragraph>
            </Card>
          </div>
        );

      case 'faq':
        return (
          <div>
            <Title level={3}>Frequently Asked Questions</Title>
            
            <Title level={4}>Q: How do I get an API key?</Title>
            <Paragraph>
              You can generate an API key from your dashboard under Settings &gt; API Keys.
            </Paragraph>

            <Title level={4}>Q: What are the rate limits?</Title>
            <Paragraph>
              Rate limits depend on your subscription plan:
              <ul>
                <li>Free: 100 requests/hour</li>
                <li>Professional: 1,000 requests/hour</li>
                <li>Enterprise: 10,000 requests/hour</li>
              </ul>
            </Paragraph>

            <Title level={4}>Q: Can I use this service offline?</Title>
            <Paragraph>
              No, {serviceId} requires an internet connection to function as it&apos;s a cloud-based service.
            </Paragraph>

            <Title level={4}>Q: How do I upgrade my plan?</Title>
            <Paragraph>
              You can upgrade your plan from the billing section in your dashboard.
            </Paragraph>
          </div>
        );

      default:
        return <div>Select a section from the menu</div>;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout
        breadcrumbItems={breadcrumbItems}
        title="Documentation"
        footerProps={footerProps}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={24}>
            <Col xs={24} md={6}>
              <Card size="small">
                <Menu
                  mode="vertical"
                  selectedKeys={[selectedSection]}
                  items={menuItems}
                  onClick={({ key }) => setSelectedSection(key)}
                  style={{ border: 'none' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={18}>
              <Card>
                {renderContent()}
              </Card>
            </Col>
          </Row>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

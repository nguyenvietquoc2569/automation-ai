'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@automation-ai/fe-session-management';
import { DashboardLayout } from '@automation-ai/fe-dashboard';
import { Card, Typography, Collapse, Tag, Space, Button, Tabs, Row, Col } from 'antd';
import { 
  ApiOutlined, 
  CopyOutlined, 
  PlayCircleOutlined,
  CheckOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

export default function ApiReferencePage() {
  const params = useParams();
  const serviceId = params.id as string;
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Services', href: '/services' },
    { title: serviceId, href: `/services/${serviceId}` },
    { title: 'API Reference' }
  ];

  const footerProps = {
    companyName: 'Automation AI',
    links: [
      { key: 'privacy', label: 'Privacy Policy', href: '/privacy' },
      { key: 'terms', label: 'Terms of Service', href: '/terms' },
      { key: 'support', label: 'Support', href: '/support' }
    ]
  };

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const apiEndpoints = [
    {
      method: 'GET',
      path: `/api/${serviceId}/status`,
      description: 'Get service status and health information',
      parameters: [],
      response: {
        status: 'success',
        data: {
          status: 'healthy',
          version: '1.0.0',
          uptime: '99.9%',
          lastUpdate: '2025-06-19T10:00:00Z'
        }
      },
      curl: `curl -X GET "https://api.automation-ai.com/api/${serviceId}/status" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
    },
    {
      method: 'POST',
      path: `/api/${serviceId}/execute`,
      description: 'Execute an automation task',
      parameters: [
        { name: 'task', type: 'string', required: true, description: 'Task type to execute' },
        { name: 'input', type: 'object', required: true, description: 'Input data for the task' },
        { name: 'config', type: 'object', required: false, description: 'Optional configuration' }
      ],
      response: {
        status: 'success',
        data: {
          taskId: 'task_123456789',
          status: 'completed',
          result: 'Task executed successfully',
          outputUrl: 'https://storage.automation-ai.com/output/task_123456789.json'
        }
      },
      curl: `curl -X POST "https://api.automation-ai.com/api/${serviceId}/execute" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "task": "data-processing",
    "input": {
      "source": "database",
      "filters": {"status": "active"}
    }
  }'`
    },
    {
      method: 'GET',
      path: `/api/${serviceId}/tasks/{taskId}`,
      description: 'Get task execution status and results',
      parameters: [
        { name: 'taskId', type: 'string', required: true, description: 'Task ID to query' }
      ],
      response: {
        status: 'success',
        data: {
          taskId: 'task_123456789',
          status: 'completed',
          progress: 100,
          startedAt: '2025-06-19T10:00:00Z',
          completedAt: '2025-06-19T10:05:00Z',
          result: 'Task completed successfully'
        }
      },
      curl: `curl -X GET "https://api.automation-ai.com/api/${serviceId}/tasks/task_123456789" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
    },
    {
      method: 'PUT',
      path: `/api/${serviceId}/config`,
      description: 'Update service configuration',
      parameters: [
        { name: 'timeout', type: 'number', required: false, description: 'Request timeout in milliseconds' },
        { name: 'retryCount', type: 'number', required: false, description: 'Number of retry attempts' },
        { name: 'features', type: 'object', required: false, description: 'Feature flags configuration' }
      ],
      response: {
        status: 'success',
        data: {
          message: 'Configuration updated successfully',
          config: {
            timeout: 30000,
            retryCount: 3,
            features: {
              enableCaching: true,
              enableRetries: true
            }
          }
        }
      },
      curl: `curl -X PUT "https://api.automation-ai.com/api/${serviceId}/config" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "timeout": 30000,
    "retryCount": 3,
    "features": {
      "enableCaching": true,
      "enableRetries": true
    }
  }'`
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'green';
      case 'POST': return 'blue';
      case 'PUT': return 'orange';
      case 'DELETE': return 'red';
      default: return 'default';
    }
  };

  interface ApiParameter {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }

  interface ApiEndpoint {
    method: string;
    path: string;
    description: string;
    parameters: ApiParameter[];
    response: object;
    curl: string;
  }

  const renderEndpoint = (endpoint: ApiEndpoint, index: number) => (
    <Panel
      key={index}
      header={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Tag color={getMethodColor(endpoint.method)}>{endpoint.method}</Tag>
          <Text code style={{ fontSize: '14px' }}>{endpoint.path}</Text>
          <Text type="secondary">{endpoint.description}</Text>
        </div>
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Title level={5}>Parameters</Title>
          {endpoint.parameters.length > 0 ? (
            <div style={{ marginBottom: '16px' }}>
              {endpoint.parameters.map((param: ApiParameter, idx: number) => (
                <Card key={idx} size="small" style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>{param.name}</Text>
                      <Tag color={param.required ? 'red' : 'default'} style={{ marginLeft: '8px' }}>
                        {param.type}
                      </Tag>
                      {param.required && <Tag color="red">Required</Tag>}
                    </div>
                  </div>
                  <Paragraph style={{ marginTop: '8px', marginBottom: 0, fontSize: '12px' }}>
                    {param.description}
                  </Paragraph>
                </Card>
              ))}
            </div>
          ) : (
            <Paragraph type="secondary">No parameters required</Paragraph>
          )}

          <Title level={5}>Example Response</Title>
          <div style={{ background: '#f6f8fa', padding: '16px', borderRadius: '6px' }}>
            <Text code>
              {JSON.stringify(endpoint.response, null, 2)}
            </Text>
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <Title level={5}>cURL Example</Title>
          <div style={{ background: '#f6f8fa', padding: '16px', borderRadius: '6px', position: 'relative' }}>
            <Button
              icon={copiedEndpoint === endpoint.path ? <CheckOutlined /> : <CopyOutlined />}
              size="small"
              style={{ position: 'absolute', top: '8px', right: '8px' }}
              onClick={() => copyToClipboard(endpoint.curl, endpoint.path)}
            >
              {copiedEndpoint === endpoint.path ? 'Copied!' : 'Copy'}
            </Button>
            <Text code style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
              {endpoint.curl}
            </Text>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Button type="primary" icon={<PlayCircleOutlined />} disabled>
              Try it out (Coming Soon)
            </Button>
          </div>
        </Col>
      </Row>
    </Panel>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout
        breadcrumbItems={breadcrumbItems}
        title="API Reference"
        footerProps={footerProps}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Card>
            <div style={{ marginBottom: '24px' }}>
              <Title level={2}>
                <Space>
                  <ApiOutlined />
                  API Reference for {serviceId}
                </Space>
              </Title>
              <Paragraph>
                Complete API documentation with examples, parameters, and response formats.
              </Paragraph>
            </div>

            <Tabs
              defaultActiveKey="endpoints"
              items={[
                {
                  key: 'endpoints',
                  label: 'Endpoints',
                  children: (
                    <Collapse size="large">
                      {apiEndpoints.map((endpoint, index) => renderEndpoint(endpoint, index))}
                    </Collapse>
                  )
                },
                {
                  key: 'authentication',
                  label: 'Authentication',
                  children: (
                    <div>
                      <Title level={3}>Authentication</Title>
                      <Paragraph>
                        All API requests must include an API key in the Authorization header.
                      </Paragraph>
                      
                      <Title level={4}>Header Format</Title>
                      <div style={{ background: '#f6f8fa', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
                        <Text code>Authorization: Bearer YOUR_API_KEY</Text>
                      </div>

                      <Title level={4}>Getting Your API Key</Title>
                      <ol>
                        <li>Navigate to your Dashboard</li>
                        <li>Go to Settings &gt; API Keys</li>
                        <li>Click &quot;Generate New Key&quot;</li>
                        <li>Copy and secure your API key</li>
                      </ol>

                      <Title level={4}>Security Best Practices</Title>
                      <ul>
                        <li>Never expose API keys in client-side code</li>
                        <li>Store API keys securely in environment variables</li>
                        <li>Rotate API keys regularly</li>
                        <li>Use different keys for different environments</li>
                      </ul>
                    </div>
                  )
                },
                {
                  key: 'errors',
                  label: 'Error Handling',
                  children: (
                    <div>
                      <Title level={3}>Error Handling</Title>
                      <Paragraph>
                        The API uses standard HTTP status codes to indicate success or failure.
                      </Paragraph>

                      <Title level={4}>Status Codes</Title>
                      <div style={{ marginBottom: '16px' }}>
                        <Card size="small" style={{ marginBottom: '8px' }}>
                          <Space>
                            <Tag color="green">200</Tag>
                            <Text strong>OK</Text>
                            <Text type="secondary">Request successful</Text>
                          </Space>
                        </Card>
                        <Card size="small" style={{ marginBottom: '8px' }}>
                          <Space>
                            <Tag color="orange">400</Tag>
                            <Text strong>Bad Request</Text>
                            <Text type="secondary">Invalid request parameters</Text>
                          </Space>
                        </Card>
                        <Card size="small" style={{ marginBottom: '8px' }}>
                          <Space>
                            <Tag color="red">401</Tag>
                            <Text strong>Unauthorized</Text>
                            <Text type="secondary">Invalid or missing API key</Text>
                          </Space>
                        </Card>
                        <Card size="small" style={{ marginBottom: '8px' }}>
                          <Space>
                            <Tag color="red">429</Tag>
                            <Text strong>Too Many Requests</Text>
                            <Text type="secondary">Rate limit exceeded</Text>
                          </Space>
                        </Card>
                        <Card size="small" style={{ marginBottom: '8px' }}>
                          <Space>
                            <Tag color="red">500</Tag>
                            <Text strong>Internal Server Error</Text>
                            <Text type="secondary">Server error occurred</Text>
                          </Space>
                        </Card>
                      </div>

                      <Title level={4}>Error Response Format</Title>
                      <div style={{ background: '#f6f8fa', padding: '16px', borderRadius: '6px' }}>
                        <Text code>
{`{
  "status": "error",
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The 'task' parameter is required",
    "details": {
      "parameter": "task",
      "expected": "string"
    }
  }
}`}
                        </Text>
                      </div>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

'use client';
import React from 'react';
import { ProtectedRoute, useSession } from '@automation-ai/fe-session-management';
import { Card, Typography, Button, Space, Avatar, Tag } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function DashboardContent() {
  const { session, logout } = useSession();

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar 
                size={64} 
                icon={<UserOutlined />} 
                src={session.user.avatar} 
              />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  Welcome back, {session.user.name}!
                </Title>
                <Text type="secondary">@{session.user.username}</Text>
                <br />
                <Text type="secondary">{session.user.emailid}</Text>
                {session.user.title && (
                  <>
                    <br />
                    <Tag color="blue">{session.user.title}</Tag>
                  </>
                )}
              </div>
            </div>
            <Button 
              type="primary" 
              danger 
              icon={<LogoutOutlined />}
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </Card>

        <Card title="Current Organization" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {session.currentOrg.logo && (
              <Avatar src={session.currentOrg.logo} />
            )}
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {session.currentOrg.displayName || session.currentOrg.name}
              </Title>
              <Text type="secondary">ID: {session.currentOrg.id}</Text>
              {session.currentOrg.subscription && (
                <>
                  <br />
                  {session.currentOrg.subscription.plan && (
                    <Tag color="green">
                      {session.currentOrg.subscription.plan.toUpperCase()} Plan
                    </Tag>
                  )}
                  {session.currentOrg.subscription.features && (
                    <Tag>
                      Features: {session.currentOrg.subscription.features.length}
                    </Tag>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>

        {session.availableOrgs.length > 1 && (
          <Card title="Available Organizations" style={{ marginBottom: '24px' }}>
            <Space wrap>
              {session.availableOrgs.map((org) => (
                <Card 
                  key={org.id} 
                  size="small" 
                  style={{ 
                    width: '200px',
                    cursor: org.id === session.currentOrg.id ? 'default' : 'pointer',
                    border: org.id === session.currentOrg.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    {org.logo && <Avatar src={org.logo} style={{ marginBottom: '8px' }} />}
                    <div>
                      <Text strong>{org.displayName || org.name}</Text>
                      {org.id === session.currentOrg.id && (
                        <div><Tag color="blue">Current</Tag></div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>
        )}

        <Card title="User Permissions">
          <Space wrap>
            {session.permissions.map((permission) => (
              <Tag key={permission} color="cyan">
                {permission}
              </Tag>
            ))}
          </Space>
          {session.roles.length > 0 && (
            <>
              <Title level={5} style={{ marginTop: '16px', marginBottom: '8px' }}>
                Roles
              </Title>
              <Space wrap>
                {session.roles.map((role) => (
                  <Tag key={role} color="purple">
                    {role}
                  </Tag>
                ))}
              </Space>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute 
      loginPath="/login"
      loadingComponent={
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Text>Loading...</Text>
        </div>
      }
    >
      <DashboardContent />
    </ProtectedRoute>
  );
}

'use client';
import React from 'react';
import { ProtectedRoute, useSession } from '@automation-ai/fe-session-management';
import { 
  Layout, 
  Card, 
  Typography, 
  Button, 
  Space, 
  Avatar, 
  Tag, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  List,
  Breadcrumb,
  Dropdown,
  Badge,
  Divider,
  Timeline
} from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  HomeOutlined,
  SettingOutlined,
  TeamOutlined,
  ProjectOutlined,
  DashboardOutlined,
  BellOutlined,
  DownOutlined,
  CrownOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

function DashboardContent() {
  const { session, logout } = useSession();

  // User menu items
  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile Settings',
      icon: <UserOutlined />
    },
    {
      key: 'settings',
      label: 'Account Settings',
      icon: <SettingOutlined />
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: logout
    }
  ];

  // Quick stats data
  const quickStats = [
    {
      title: 'Total Projects',
      value: session?.permissions?.includes('project:read') ? 12 : 'N/A',
      suffix: 'active',
      prefix: <ProjectOutlined style={{ color: '#1890ff' }} />
    },
    {
      title: 'Team Members',
      value: session?.permissions?.includes('team:read') ? 24 : 'N/A',
      suffix: 'members',
      prefix: <TeamOutlined style={{ color: '#52c41a' }} />
    },
    {
      title: 'Tasks Completed',
      value: session?.permissions?.includes('task:read') ? 168 : 'N/A',
      suffix: 'this month',
      prefix: <CheckCircleOutlined style={{ color: '#faad14' }} />
    },
    {
      title: 'System Uptime',
      value: 99.9,
      suffix: '%',
      prefix: <SafetyOutlined style={{ color: '#f5222d' }} />
    }
  ];

  // Recent activities
  const recentActivities = [
    {
      title: 'Project Alpha launched successfully',
      description: 'Deployment completed at 14:30',
      time: '2 hours ago',
      type: 'success'
    },
    {
      title: 'New team member joined',
      description: 'Sarah Connor added to development team',
      time: '4 hours ago',
      type: 'info'
    },
    {
      title: 'Weekly backup completed',
      description: 'All data backed up successfully',
      time: '6 hours ago',
      type: 'success'
    },
    {
      title: 'System maintenance scheduled',
      description: 'Planned maintenance window: 02:00-04:00',
      time: '1 day ago',
      type: 'warning'
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DashboardOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
          <Title level={4} style={{ margin: 0 }}>Workforce Dashboard</Title>
        </div>
        
        <Space size="large">
          <Breadcrumb>
            <Breadcrumb.Item href="#" onClick={(e) => e.preventDefault()}>
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
          </Breadcrumb>
          
          <Badge count={3}>
            <BellOutlined style={{ fontSize: '18px' }} />
          </Badge>
          
          <Dropdown 
            menu={{ 
              items: userMenuItems,
              onClick: ({ key }) => {
                if (key === 'logout') logout();
              }
            }}
            trigger={['click']}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar src={session?.user?.avatar} icon={<UserOutlined />} />
              <span>{session?.user?.name}</span>
              <DownOutlined />
            </Space>
          </Dropdown>
        </Space>
      </Header>

      <Layout>
        {/* Sidebar */}
        <Sider 
          width={250} 
          style={{ background: '#fff' }}
          breakpoint="lg"
          collapsedWidth="0"
        >
          <div style={{ padding: '24px' }}>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <Avatar 
                  size={64} 
                  src={session?.user?.avatar} 
                  icon={<UserOutlined />}
                  style={{ marginBottom: '12px' }}
                />
                <div>
                  <Text strong>{session?.user?.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {session?.user?.emailid}
                  </Text>
                  {session?.user?.title && (
                    <div style={{ marginTop: '8px' }}>
                      <Tag color="blue">{session?.user?.title}</Tag>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Organization Info */}
            <Card size="small" title="Current Organization">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {session?.currentOrg?.logo && (
                  <Avatar size="small" src={session?.currentOrg?.logo} />
                )}
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: '12px' }}>
                    {session?.currentOrg?.displayName || session?.currentOrg?.name}
                  </Text>
                  {session?.currentOrg?.subscription?.plan && (
                    <div>
                      <Tag 
                        color="green" 
                        icon={<CrownOutlined />}
                      >
                        {session?.currentOrg?.subscription?.plan?.toUpperCase()}
                      </Tag>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </Sider>

        {/* Main Content */}
        <Content style={{ padding: '24px', background: '#f5f5f5' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* Welcome Section */}
            <Card style={{ marginBottom: '24px' }}>
              <Row gutter={24} align="middle">
                <Col flex="auto">
                  <Title level={2} style={{ margin: 0 }}>
                    Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {session?.user?.name}! 👋
                  </Title>
                  <Paragraph style={{ fontSize: '16px', color: '#666', margin: '8px 0 0 0' }}>
                    Welcome to your workforce management dashboard. Here&apos;s what&apos;s happening today.
                  </Paragraph>
                </Col>
                <Col>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<SettingOutlined />}
                  >
                    Quick Actions
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Quick Stats */}
            <Row gutter={24} style={{ marginBottom: '24px' }}>
              {quickStats.map((stat, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card>
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                      valueStyle={{ fontSize: '24px' }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            <Row gutter={24}>
              {/* Recent Activity */}
              <Col xs={24} lg={14}>
                <Card 
                  title="Recent Activity" 
                  extra={<Button type="link">View All</Button>}
                  style={{ marginBottom: '24px' }}
                >
                  <Timeline>
                    {recentActivities.map((activity, index) => (
                      <Timeline.Item 
                        key={index}
                        color={activity.type === 'success' ? 'green' : 
                               activity.type === 'warning' ? 'orange' : 'blue'}
                        dot={<ClockCircleOutlined />}
                      >
                        <div>
                          <Text strong>{activity.title}</Text>
                          <div>
                            <Text type="secondary">{activity.description}</Text>
                          </div>
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {activity.time}
                            </Text>
                          </div>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>

              {/* Permissions & Roles */}
              <Col xs={24} lg={10}>
                <Card 
                  title="Your Access" 
                  style={{ marginBottom: '24px' }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Permissions ({session?.permissions?.length || 0})</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Space wrap>
                        {session?.permissions?.slice(0, 6).map((permission) => (
                          <Tag key={permission} color="cyan">
                            {permission}
                          </Tag>
                        ))}
                        {(session?.permissions?.length || 0) > 6 && (
                          <Tag color="default">
                            +{(session?.permissions?.length || 0) - 6} more
                          </Tag>
                        )}
                      </Space>
                    </div>
                  </div>

                  {(session?.roles?.length || 0) > 0 && (
                    <div>
                      <Text strong>Roles ({session?.roles?.length || 0})</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Space wrap>
                          {session?.roles?.map((role) => (
                            <Tag key={role} color="purple">
                              {role}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    </div>
                  )}

                  <Divider />

                  <div>
                    <Text strong>Organization Usage</Text>
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text>Storage Usage</Text>
                        <Progress percent={68} size="small" />
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text>API Calls</Text>
                        <Progress percent={45} size="small" status="active" />
                      </div>
                      <div>
                        <Text>Team Capacity</Text>
                        <Progress percent={82} size="small" strokeColor="#52c41a" />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Available Organizations */}
                {(session?.availableOrgs?.length || 0) > 1 && (
                  <Card title="Switch Organization">
                    <List
                      size="small"
                      dataSource={session?.availableOrgs || []}
                      renderItem={(org) => (
                        <List.Item
                          style={{ 
                            cursor: org.id === session?.currentOrg?.id ? 'default' : 'pointer',
                            background: org.id === session?.currentOrg?.id ? '#f6ffed' : 'transparent',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            marginBottom: '4px'
                          }}
                        >
                          <List.Item.Meta
                            avatar={<Avatar size="small" src={org.logo} />}
                            title={
                              <div>
                                <Text strong>{org.displayName || org.name}</Text>
                                {org.id === session?.currentOrg?.id && (
                                  <Tag color="green" style={{ marginLeft: '8px' }}>
                                    Current
                                  </Tag>
                                )}
                              </div>
                            }
                            description={<Text type="secondary" style={{ fontSize: '11px' }}>ID: {org.id}</Text>}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                )}
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
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

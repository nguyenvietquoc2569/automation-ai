'use client';
import Link from 'next/link';
import { useSession } from '@automation-ai/fe-session-management';
import { DashboardLayout } from '@automation-ai/fe-dashboard';
import { 
  Card, 
  Typography, 
  Row, 
  Col, 
  Statistic, 
  List,
  Tag,
  Space,
  Button,
  Timeline
} from 'antd';
import { 
  TeamOutlined,
  ProjectOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ToolOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

function DashboardContent() {
  const { session } = useSession();

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
    <div>
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
            <Link href="/services">
              <Button 
                type="primary" 
                size="large"
                icon={<ToolOutlined />}
              >
                Manage Services
              </Button>
            </Link>
          </Col>
        </Row>
      </Card>

      {/* Quick Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        {quickStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
                valueStyle={{ fontSize: '28px' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Services Quick Overview */}
      <Card title="Services Overview" style={{ marginBottom: '24px' }} 
            extra={<Link href="/services"><Button type="primary" icon={<ToolOutlined />}>Manage All Services</Button></Link>}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Active Services"
                value={12}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Pending Services"
                value={3}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Service Categories"
                value={5}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ProjectOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Main Content Grid */}
      <Row gutter={[24, 24]}>
        {/* Recent Activities */}
        <Col xs={24} lg={14}>
          <Card title="Recent Activities" extra={<Button type="link">View All</Button>}>
            <Timeline
              items={recentActivities.map((activity, index) => ({
                dot: activity.type === 'success' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                     activity.type === 'warning' ? <ExclamationCircleOutlined style={{ color: '#faad14' }} /> :
                     <ClockCircleOutlined style={{ color: '#1890ff' }} />,
                children: (
                  <div key={index}>
                    <Text strong>{activity.title}</Text>
                    <br />
                    <Text type="secondary">{activity.description}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>{activity.time}</Text>
                  </div>
                )
              }))}
            />
          </Card>
        </Col>

        {/* User Access Panel */}
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
          </Card>

          {/* Organization Switcher */}
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
  );
}

export default function DashboardPage() {
  // Define breadcrumb items for the dashboard
  const breadcrumbItems = [
    {
      title: 'Home',
      href: '/'
    },
    {
      title: 'Dashboard'
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
    <DashboardLayout 
      breadcrumbItems={breadcrumbItems}
      title="Workforce Dashboard"
      notificationCount={5}
      footerProps={footerProps}
    >
      <DashboardContent />
    </DashboardLayout>
  );
}

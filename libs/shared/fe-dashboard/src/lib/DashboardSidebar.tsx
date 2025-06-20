'use client';
import { Layout, Card, Avatar, Typography, Tag, Menu } from 'antd';
import { 
  UserOutlined, 
  CrownOutlined, 
  ToolOutlined,
  TeamOutlined,
  SettingOutlined,
  ProjectOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { useSession } from '@automation-ai/fe-session-management';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Sider } = Layout;
const { Text } = Typography;

interface DashboardSidebarProps {
  width?: number;
  collapsedWidth?: number;
  showUserProfile?: boolean;
  showOrganization?: boolean;
}

export function DashboardSidebar({
  width = 250,
  collapsedWidth = 0,
  showUserProfile = true,
  showOrganization = true,
}: DashboardSidebarProps) {
  const { session } = useSession();
  const pathname = usePathname();

  // Navigation menu items
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: '/services',
      icon: <ToolOutlined />,
      label: <Link href="/services">Services</Link>,
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: <Link href="/projects">Projects</Link>,
    },
    {
      key: '/dashboard/teams',
      icon: <TeamOutlined />,
      label: <Link href="/dashboard/teams">Teams</Link>,
    },
    {
      key: '/team',
      icon: <TeamOutlined />,
      label: <Link href="/team">Team</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">Settings</Link>,
    },
  ];

  return (
    <Sider
      width={width}
      style={{ background: '#fff' }}
      breakpoint="lg"
      collapsedWidth={collapsedWidth}
    >
      <div style={{ padding: '24px' }}>
        {showUserProfile && (
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
        )}

        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          style={{ border: 'none', marginBottom: '16px' }}
          items={menuItems}
        />

        {showOrganization && (
          <Card size="small" title="Current Organization">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {session?.currentOrg?.logo && (
                <Avatar size="small" src={session?.currentOrg?.logo} />
              )}
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: '12px' }}>
                  {session?.currentOrg?.displayName ||
                    session?.currentOrg?.name}
                </Text>
                {session?.currentOrg?.subscription?.plan && (
                  <div>
                    <Tag color="green" icon={<CrownOutlined />}>
                      {session?.currentOrg?.subscription?.plan?.toUpperCase()}
                    </Tag>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </Sider>
  );
}

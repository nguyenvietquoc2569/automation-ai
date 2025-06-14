'use client';
import React from 'react';
import { Layout, Menu, Breadcrumb, theme, Dropdown, Avatar, Space } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('Dashboard', '1', <PieChartOutlined />),
  getItem('Automation', '2', <DesktopOutlined />),
  getItem('Users', 'sub1', <UserOutlined />, [
    getItem('Manage Users', '3'),
    getItem('User Analytics', '4'),
    getItem('User Settings', '5'),
  ]),
  getItem('Teams', 'sub2', <TeamOutlined />, [
    getItem('Team Management', '6'),
    getItem('Team Analytics', '8'),
  ]),
  getItem('Files', '9', <FileOutlined />),
];

interface AntdLayoutProps {
  children: React.ReactNode;
}

export default function AntdLayout({ children }: AntdLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const router = useRouter();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    // TODO: Implement actual logout logic (clear tokens, etc.)
    router.push('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div
          style={{
            height: 64,
            margin: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: collapsed ? 'row' : 'column',
            transition: 'all 0.3s',
          }}
        >
          <RobotOutlined 
            style={{ 
              fontSize: collapsed ? '20px' : '24px', 
              color: '#1890ff',
              marginBottom: collapsed ? 0 : '4px',
            }} 
          />
          {!collapsed && (
            <div style={{ 
              color: 'white', 
              fontSize: '12px', 
              fontWeight: 'bold',
              textAlign: 'center' 
            }}>
              Automation Market
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={['1']}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{ padding: '0 24px', fontSize: '18px', fontWeight: 'bold' }}
          >
            Automation Market Dashboard
          </div>
          <div style={{ padding: '0 24px' }}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>John Doe</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb
            style={{ margin: '16px 0' }}
            items={[{ title: 'User' }, { title: 'Dashboard' }]}
          />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Automation Market ©{new Date().getFullYear()} Created with Ant
          Design
        </Footer>
      </Layout>
    </Layout>
  );
}

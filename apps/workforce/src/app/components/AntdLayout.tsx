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
import { useIntl } from 'react-intl';
import { LanguageSwitcher } from './LanguageSwitcher';

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

interface AntdLayoutProps {
  children: React.ReactNode;
}

export default function AntdLayout({ children }: AntdLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const router = useRouter();
  const intl = useIntl();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const items: MenuItem[] = [
    getItem(intl.formatMessage({ id: 'nav.dashboard' }), '1', <PieChartOutlined />),
    getItem('Automation', '2', <DesktopOutlined />),
    getItem(intl.formatMessage({ id: 'nav.users' }), 'sub1', <UserOutlined />, [
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
      label: intl.formatMessage({ id: 'nav.settings' }),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: intl.formatMessage({ id: 'nav.logout' }),
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
            <div
              style={{
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                textAlign: 'center',
              }}              >
                Workforce
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
            {intl.formatMessage({ id: 'app.title' })}
          </div>
          <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LanguageSwitcher />
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
            items={[
              { title: intl.formatMessage({ id: 'nav.users' }) }, 
              { title: intl.formatMessage({ id: 'nav.dashboard' }) }
            ]}
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
          {intl.formatMessage({ id: 'app.footer' })}
        </Footer>
      </Layout>
    </Layout>
  );
}

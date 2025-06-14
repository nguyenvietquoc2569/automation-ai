'use client';
import React from 'react';
import { Layout, Menu, Breadcrumb, theme } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
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
    getItem('Team Analytics', '8')
  ]),
  getItem('Files', '9', <FileOutlined />),
];

interface AntdLayoutProps {
  children: React.ReactNode;
}

export default function AntdLayout({ children }: AntdLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.3)' }} />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div style={{ padding: '0 24px', fontSize: '18px', fontWeight: 'bold' }}>
            Facebook Automation Dashboard
          </div>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb 
            style={{ margin: '16px 0' }}
            items={[
              { title: 'User' },
              { title: 'Dashboard' }
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
          Facebook Automation ©{new Date().getFullYear()} Created with Ant Design
        </Footer>
      </Layout>
    </Layout>
  );
}

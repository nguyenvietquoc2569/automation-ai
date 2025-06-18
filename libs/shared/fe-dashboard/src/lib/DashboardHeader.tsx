'use client';
import {
  Layout,
  Typography,
  Space,
  Breadcrumb,
  Badge,
  Dropdown,
  Avatar,
  type MenuProps,
} from 'antd';
import {
  DashboardOutlined,
  BellOutlined,
  DownOutlined,
  UserOutlined,
  HomeOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useSession } from '@automation-ai/fe-session-management';
import { LanguageSwitcher } from '@automation-ai/multiple-lang';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { BreadcrumbItem, UserMenuItem } from './types';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

interface DashboardHeaderProps {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  userMenuItems?: UserMenuItem[];
  notificationCount?: number;
}

export function DashboardHeader({
  title = 'Workforce Dashboard',
  breadcrumbs = [],
  userMenuItems = [],
  notificationCount = 0,
}: DashboardHeaderProps) {
  const { session, logout } = useSession();

  // Default user menu items if none provided
  const defaultUserMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Profile Settings',
      icon: <UserOutlined />,
      onClick: () => {
        // TODO: Navigate to profile page
        console.log('Navigate to profile');
      },
    },
    {
      key: 'settings',
      label: 'Account Settings',
      icon: <SettingOutlined />,
      onClick: () => {
        // TODO: Navigate to settings page
        console.log('Navigate to settings');
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {
        logout();
      },
    },
  ];

  // Convert user menu items to Ant Design format
  const convertedUserMenuItems: MenuProps['items'] = userMenuItems.map(item => {
    if (item.type === 'divider') {
      return { type: 'divider' };
    }
    return {
      key: item.key,
      label: item.label,
      icon: item.icon,
      danger: item.danger,
      onClick: item.onClick,
    };
  });

  const finalUserMenuItems = userMenuItems.length > 0 ? convertedUserMenuItems : defaultUserMenuItems;

  // Default breadcrumbs if none provided
  const defaultBreadcrumbs: BreadcrumbItem[] = [
    {
      key: 'home',
      title: 'Home',
      icon: <HomeOutlined />,
      href: '#',
      onClick: (e) => e.preventDefault(),
    },
    {
      key: 'dashboard',
      title: 'Dashboard',
    },
  ];

  const finalBreadcrumbs =
    breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs;

  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <DashboardOutlined
          style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }}
        />
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
      </div>

      <Space size="large">
        <Breadcrumb>
          {finalBreadcrumbs.map((item, index) => (
            <Breadcrumb.Item
              key={item.key || index}
              href={item.href}
              onClick={item.onClick}
            >
              {item.icon}
              {item.title}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>

        <Badge count={notificationCount}>
          <BellOutlined style={{ fontSize: '18px' }} />
        </Badge>

        <OrganizationSwitcher showLabel={false} />

        <LanguageSwitcher />

        <Dropdown
          menu={{
            items: finalUserMenuItems,
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
    </AntHeader>
  );
}

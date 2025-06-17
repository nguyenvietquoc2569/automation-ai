'use client';
import {
  Layout,
  Typography,
  Space,
  Breadcrumb,
  Badge,
  Dropdown,
  Avatar,
} from 'antd';
import {
  DashboardOutlined,
  BellOutlined,
  DownOutlined,
  UserOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useSession } from '@automation-ai/fe-session-management';
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
  const { session } = useSession();

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

        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: ({ key }) => {
              const item = userMenuItems.find((item) => item.key === key);
              item?.onClick?.();
            },
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

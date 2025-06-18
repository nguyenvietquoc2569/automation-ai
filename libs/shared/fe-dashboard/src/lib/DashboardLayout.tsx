'use client';
import { Layout } from 'antd';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardFooter } from './DashboardFooter';
import { LanguageProvider } from '@automation-ai/multiple-lang';
import { BreadcrumbItem } from './types';

const { Content } = Layout;

export interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  title?: string;
  showSidebar?: boolean;
  showUserProfile?: boolean;
  notificationCount?: number;
  footerProps?: {
    companyName?: string;
    year?: number;
    links?: Array<{
      key: string;
      label: string;
      href?: string;
      onClick?: () => void;
    }>;
    showCopyright?: boolean;
  };
}

export function DashboardLayout({
  children,
  breadcrumbItems = [],
  title = 'Workforce Dashboard',
  showSidebar = true,
  showUserProfile = true,
  notificationCount = 0,
  footerProps,
}: DashboardLayoutProps) {
  return (
    <LanguageProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <DashboardHeader
          title={title}
          breadcrumbs={breadcrumbItems}
          notificationCount={notificationCount}
        />

        <Layout>
          {showSidebar && (
            <DashboardSidebar
              showUserProfile={showUserProfile}
              showOrganization={true}
            />
          )}

          <Layout>
            <Content
              style={{
                margin: '24px 16px',
                padding: 24,
                minHeight: 'calc(100vh - 112px)',
                background: '#fff',
                borderRadius: 8,
              }}
            >
              {children}
            </Content>

            <DashboardFooter {...footerProps} />
          </Layout>
        </Layout>
      </Layout>
    </LanguageProvider>
  );
}

export default DashboardLayout;

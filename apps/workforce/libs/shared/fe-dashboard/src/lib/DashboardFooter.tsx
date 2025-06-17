'use client';
import { Layout, Typography, Space } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

interface DashboardFooterProps {
  companyName?: string;
  year?: number;
  links?: Array<{
    key: string;
    label: string;
    href?: string;
    onClick?: () => void;
  }>;
  showCopyright?: boolean;
}

export function DashboardFooter({ 
  companyName = 'workforce',
  year = new Date().getFullYear(),
  links = [],
  showCopyright = true 
}: DashboardFooterProps) {
  return (
    <AntFooter style={{ textAlign: 'center', background: '#f5f5f5', padding: '16px 24px' }}>
      <div style={{ marginBottom: '8px' }}>
        {links.length > 0 && (
          <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
            {links.map((link) => (
              <Text 
                key={link.key}
                style={{ cursor: 'pointer' }}
                onClick={link.onClick}
              >
                {link.href ? (
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                ) : (
                  link.label
                )}
              </Text>
            ))}
          </Space>
        )}
      </div>
      {showCopyright && (
        <Text type="secondary">
          © {year} {companyName}. All rights reserved.
        </Text>
      )}
    </AntFooter>
  );
}

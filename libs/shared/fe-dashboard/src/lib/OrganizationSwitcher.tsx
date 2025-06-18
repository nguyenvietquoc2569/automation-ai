'use client';
import React, { useState } from 'react';
import { Select, Avatar, Space, Typography, Spin } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { useSession } from '@automation-ai/fe-session-management';

const { Text } = Typography;

interface OrganizationSwitcherProps {
  style?: React.CSSProperties;
  placement?: 'header' | 'sidebar';
  showLabel?: boolean;
}

export const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  style,
  placement = 'header',
  showLabel = true,
}) => {
  const { session, switchOrganization, isLoading } = useSession();
  const [switching, setSwitching] = useState(false);

  const handleOrganizationChange = async (orgId: string) => {
    if (orgId === session?.currentOrg?.id) {
      return; // No change needed
    }

    setSwitching(true);
    try {
      await switchOrganization(orgId);
      // Optionally trigger a full page reload to refresh all org-related data
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to switch organization:', error);
    } finally {
      setSwitching(false);
    }
  };

  if (!session?.availableOrgs?.length || session.availableOrgs.length <= 1) {
    // Don't show switcher if user only has access to one org
    return null;
  }

  const options = session.availableOrgs.map((org) => ({
    value: org.id,
    label: (
      <Space size="small">
        {org.logo && <Avatar size="small" src={org.logo} />}
        <span>{org.displayName || org.name}</span>
      </Space>
    ),
  }));

  if (placement === 'sidebar') {
    return (
      <div style={style}>
        {showLabel && (
          <Text type="secondary" style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
            Switch Organization
          </Text>
        )}
        <Select
          value={session?.currentOrg?.id}
          onChange={handleOrganizationChange}
          options={options}
          style={{ width: '100%' }}
          loading={switching || isLoading}
          disabled={switching || isLoading}
          suffixIcon={switching ? <Spin size="small" /> : <SwapOutlined />}
          optionLabelProp="label"
        />
      </div>
    );
  }

  return (
    <Space style={style}>
      {showLabel && <SwapOutlined />}
      <Select
        value={session?.currentOrg?.id}
        onChange={handleOrganizationChange}
        style={{ minWidth: 180 }}
        loading={switching || isLoading}
        disabled={switching || isLoading}
        suffixIcon={switching ? <Spin size="small" /> : undefined}
        placeholder="Select Organization"
        optionLabelProp="label"
      >
        {session?.availableOrgs?.map((org) => (
          <Select.Option key={org.id} value={org.id} label={org.displayName || org.name}>
            <Space size="small">
              {org.logo && <Avatar size="small" src={org.logo} />}
              <span>{org.displayName || org.name}</span>
            </Space>
          </Select.Option>
        ))}
      </Select>
    </Space>
  );
};

'use client';

import React from 'react';
import { Select, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage, SupportedLocale } from './LanguageContext';
import { useIntl } from 'react-intl';

const { Option } = Select;

interface LanguageSwitcherProps {
  style?: React.CSSProperties;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ style }) => {
  const { locale, setLocale, isHydrated } = useLanguage();
  const intl = useIntl();

  const handleChange = (value: SupportedLocale) => {
    setLocale(value);
  };

  // Show a consistent state during SSR/hydration
  const displayLocale = isHydrated ? locale : 'en';

  return (
    <Space style={style}>
      <GlobalOutlined />
      <Select
        value={displayLocale}
        onChange={handleChange}
        style={{ width: 120 }}
        styles={{
          popup: {
            root: { zIndex: 9999 }
          }
        }}
        // Disable during hydration to prevent mismatch
        disabled={!isHydrated}
      >
        <Option value="en">
          {intl.formatMessage({ id: 'language.english' })}
        </Option>
        <Option value="vi">
          {intl.formatMessage({ id: 'language.vietnamese' })}
        </Option>
      </Select>
    </Space>
  );
};

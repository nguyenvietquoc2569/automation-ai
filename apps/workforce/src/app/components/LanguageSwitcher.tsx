'use client';

import React from 'react';
import { Select, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage, SupportedLocale } from '../contexts/LanguageContext';
import { useIntl } from 'react-intl';

const { Option } = Select;

interface LanguageSwitcherProps {
  style?: React.CSSProperties;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ style }) => {
  const { locale, setLocale } = useLanguage();
  const intl = useIntl();

  const handleChange = (value: SupportedLocale) => {
    setLocale(value);
  };

  return (
    <Space style={style}>
      <GlobalOutlined />
      <Select
        value={locale}
        onChange={handleChange}
        style={{ width: 120 }}
        styles={{
          popup: {
            root: { zIndex: 9999 }
          }
        }}
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

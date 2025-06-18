'use client';
import React from 'react';
import { Form, Input, Button, Card, Typography, Space, Result } from 'antd';
import {
  MailOutlined,
  RobotOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useIntl } from 'react-intl';

const { Title, Text } = Typography;

interface ForgotPasswordFormValues {
  email: string;
}

interface ForgotPasswordPageProps {
  LanguageSwitcher?: React.ComponentType<{ style?: React.CSSProperties }>;
  onForgotPassword?: (values: ForgotPasswordFormValues) => Promise<void>;
  LinkComponent?: React.ComponentType<{ href: string; children: React.ReactNode; style?: React.CSSProperties }>;
}

export function ForgotPasswordPage({ LanguageSwitcher, onForgotPassword, LinkComponent }: ForgotPasswordPageProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);
  const intl = useIntl();

  const handleFinish = async (values: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      if (onForgotPassword) {
        await onForgotPassword(values);
        setEmailSent(true);
      } else {
        // Default behavior
        console.log('Forgot password attempt:', values);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Forgot password failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Default Link component if none provided
  const Link = LinkComponent || (({ href, children, style }) => (
    <a href={href} style={style}>{children}</a>
  ));

  if (emailSent) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Result
              status="success"
              title={intl.formatMessage({ id: 'auth.emailSent' })}
              subTitle={intl.formatMessage({ id: 'auth.resetDescription' })}
              extra={[
                <Link key="login" href="/login">
                  <Button type="primary">{intl.formatMessage({ id: 'auth.backToLogin' })}</Button>
                </Link>,
              ]}
            />
            
            {LanguageSwitcher && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <LanguageSwitcher />
              </div>
            )}
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <RobotOutlined
              style={{
                fontSize: '48px',
                color: '#1890ff',
                marginBottom: '16px',
              }}
            />
            <Title level={2} style={{ margin: 0 }}>
              {intl.formatMessage({ id: 'auth.forgotPassword' })}
            </Title>
            <Text type="secondary">
              {intl.formatMessage({ id: 'auth.resetDescription' })}
            </Text>
          </div>

          <Form
            form={form}
            name="forgotPassword"
            onFinish={handleFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label={intl.formatMessage({ id: 'auth.email' })}
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder={intl.formatMessage({ id: 'auth.email' })}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: '40px' }}
              >
                {intl.formatMessage({ id: 'auth.resetButton' })}
              </Button>
            </Form.Item>
          </Form>

          {LanguageSwitcher && (
            <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '16px' }}>
              <LanguageSwitcher />
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link
              href="/login"
              style={{
                color: '#1890ff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ArrowLeftOutlined />
              {intl.formatMessage({ id: 'auth.backToLogin' })}
            </Link>
          </div>
        </Space>
      </Card>
    </div>
  );
}

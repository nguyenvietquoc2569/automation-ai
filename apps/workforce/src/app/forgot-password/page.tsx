'use client';
import React from 'react';
import { Form, Input, Button, Card, Typography, Space, Result } from 'antd';
import {
  MailOutlined,
  RobotOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useIntl } from 'react-intl';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

const { Title, Text } = Typography;

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);
  const intl = useIntl();

  const onFinish = async (values: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      // TODO: Implement actual forgot password logic
      console.log('Forgot password attempt:', values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEmailSent(true);
    } catch (error) {
      console.error('Forgot password failed:', error);
    } finally {
      setLoading(false);
    }
  };

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
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
          }}
        >
          <LanguageSwitcher style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '8px', borderRadius: '6px' }} />
        </div>
        
        <Card
          style={{
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
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
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
        }}
      >
        <LanguageSwitcher style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '8px', borderRadius: '6px' }} />
      </div>
      
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
            onFinish={onFinish}
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

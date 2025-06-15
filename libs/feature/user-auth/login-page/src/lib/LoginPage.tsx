'use client';
import React from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  Checkbox,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  RobotOutlined,
  GoogleOutlined,
  FacebookOutlined,
} from '@ant-design/icons';
import { useIntl } from 'react-intl';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

interface LoginPageProps {
  LanguageSwitcher?: React.ComponentType<{ style?: React.CSSProperties }>;
  onLogin?: (values: LoginFormValues) => Promise<void>;
  LinkComponent?: React.ComponentType<{ href: string; children: React.ReactNode; style?: React.CSSProperties }>;
}

export function LoginPage({ LanguageSwitcher, onLogin, LinkComponent }: LoginPageProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const intl = useIntl();

  const handleFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      if (onLogin) {
        await onLogin(values);
      } else {
        // Default behavior
        console.log('Login attempt:', values);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert('Login successful!');
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Default Link component if none provided
  const Link = LinkComponent || (({ href, children, style }) => (
    <a href={href} style={style}>{children}</a>
  ));

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
      {LanguageSwitcher && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
          }}
        >
          <LanguageSwitcher 
            style={{ 
              background: 'rgba(255, 255, 255, 0.9)', 
              padding: '8px', 
              borderRadius: '6px' 
            }} 
          />
        </div>
      )}
      
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
              Workforce
            </Title>
            <Text type="secondary">{intl.formatMessage({ id: 'auth.loginToAccount' })}</Text>
          </div>

          <Form
            form={form}
            name="login"
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
              <Input prefix={<UserOutlined />} placeholder={intl.formatMessage({ id: 'auth.email' })} />
            </Form.Item>

            <Form.Item
              name="password"
              label={intl.formatMessage({ id: 'auth.password' })}
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={intl.formatMessage({ id: 'auth.password' })}
              />
            </Form.Item>

            <Form.Item>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>{intl.formatMessage({ id: 'auth.rememberMe' })}</Checkbox>
                </Form.Item>
                <Link href="/forgot-password" style={{ color: '#1890ff' }}>
                  {intl.formatMessage({ id: 'auth.forgotPasswordText' })}
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: '40px' }}
              >
                {intl.formatMessage({ id: 'auth.loginButton' })}
              </Button>
            </Form.Item>
          </Form>

          <Divider>Or continue with</Divider>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Button icon={<GoogleOutlined />} block style={{ height: '40px' }}>
              Continue with Google
            </Button>
            <Button
              icon={<FacebookOutlined />}
              block
              style={{ height: '40px' }}
            >
              Continue with Facebook
            </Button>
          </Space>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              {intl.formatMessage({ id: 'auth.noAccount' })}{' '}
              <Link href="/register" style={{ color: '#1890ff' }}>
                {intl.formatMessage({ id: 'auth.register' })}
              </Link>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}

'use client';
import React from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Checkbox,
  Alert,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useIntl } from 'react-intl';
import { AuthAPI, LoginFormData, UserSession } from './auth-api';

const { Title, Text } = Typography;

export interface LoginFormValues {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

interface LoginPageProps {
  LanguageSwitcher?: React.ComponentType<{ style?: React.CSSProperties }>;
  onLogin?: (values: LoginFormValues) => Promise<void>;
  onLoginSuccess?: (session: UserSession) => void;
  LinkComponent?: React.ComponentType<{ href: string; children: React.ReactNode; style?: React.CSSProperties }>;
  loading?: boolean;
  registerPath?: string;
  forgotPasswordPath?: string;
}

export function LoginPage({ 
  LanguageSwitcher, 
  onLogin, 
  onLoginSuccess,
  LinkComponent, 
  loading: externalLoading,
  registerPath = '/register',
  forgotPasswordPath = '/forgot-password'
}: LoginPageProps) {
  const [form] = Form.useForm();
  const [internalLoading, setInternalLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const intl = useIntl();

  // Handle hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Use external loading if provided, otherwise use internal loading
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: 'white' }}>Loading...</div>
      </div>
    );
  }

  const handleFinish = async (values: LoginFormValues) => {
    // Clear previous error message
    setErrorMessage(null);
    
    // Only manage internal loading if external loading is not provided
    if (externalLoading === undefined) {
      setInternalLoading(true);
    }
    
    try {
      if (onLogin) {
        // Use custom onLogin handler if provided
        await onLogin(values);
      } else {
        // Default login logic using AuthAPI
        const isEmail = values.emailOrUsername.includes('@');
        
        const loginData: LoginFormData = {
          password: values.password,
          rememberMe: values.rememberMe,
          ...(isEmail 
            ? { emailid: values.emailOrUsername }
            : { username: values.emailOrUsername }
          )
        };

        const response = await AuthAPI.login(loginData);
        
        if (response.success && response.data) {
          // Convert response to UserSession format
          const session: UserSession = {
            sessionToken: response.data.sessionToken,
            user: response.data.user,
            currentOrg: response.data.currentOrg,
            availableOrgs: response.data.availableOrgs || [],
            expiresAt: response.data.expiresAt,
            permissions: response.data.permissions || [],
            roles: response.data.roles || []
          };
          
          if (onLoginSuccess) {
            onLoginSuccess(session);
          } else {
            // Default behavior - redirect to dashboard
            if (typeof window !== 'undefined') {
              window.location.href = '/dashboard';
            }
          }
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // Set error message for display
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    } finally {
      // Only manage internal loading if external loading is not provided
      if (externalLoading === undefined) {
        setInternalLoading(false);
      }
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
            {errorMessage && (
              <Alert
                message="Login Failed"
                description={errorMessage}
                type="error"
                showIcon
                closable
                onClose={() => setErrorMessage(null)}
                style={{ marginBottom: '16px' }}
              />
            )}

            <Form.Item
              name="emailOrUsername"
              label="Email or Username"
              rules={[
                { required: true, message: 'Please input your email or username!' },
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Email or username"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={intl.formatMessage({ id: 'auth.password' })}
              rules={[
                { required: true, message: 'Please input your password!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={intl.formatMessage({ id: 'auth.password' })}
                autoComplete="current-password"
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
                <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <Link href={forgotPasswordPath} style={{ color: '#1890ff' }}>
                  Forgot password?
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

          {LanguageSwitcher && (
            <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '16px' }}>
              <LanguageSwitcher />
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Don't have an account?{' '}
              <Link href={registerPath} style={{ color: '#1890ff', fontWeight: 500 }}>
                Sign up
              </Link>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}

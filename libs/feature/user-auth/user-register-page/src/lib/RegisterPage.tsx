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
  Alert,
} from 'antd';
import {
  LockOutlined,
  MailOutlined,
  RobotOutlined,
  GoogleOutlined,
  FacebookOutlined,
} from '@ant-design/icons';
import { useIntl } from 'react-intl';

const { Title, Text } = Typography;

export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface RegisterPageProps {
  LanguageSwitcher?: React.ComponentType<{ style?: React.CSSProperties }>;
  onRegister?: (values: RegisterFormValues) => Promise<void>;
  LinkComponent?: React.ComponentType<{ href: string; children: React.ReactNode; style?: React.CSSProperties }>;
  loading?: boolean;
}

export function RegisterPage({ LanguageSwitcher, onRegister, LinkComponent, loading: externalLoading }: RegisterPageProps) {
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

  const handleFinish = async (values: RegisterFormValues) => {
    // Clear previous error message
    setErrorMessage(null);
    
    // Only manage internal loading if external loading is not provided
    if (externalLoading === undefined) {
      setInternalLoading(true);
    }
    
    try {
      if (onRegister) {
        await onRegister(values);
      } else {
        // Default behavior
        console.log('Registration attempt:', values);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert('Registration successful!');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Set error message for display
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Registration failed. Please try again.');
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
          <LanguageSwitcher style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '8px', borderRadius: '6px' }} />
        </div>
      )}
      
      <Card
        style={{
          width: '100%',
          maxWidth: 450,
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
              {intl.formatMessage({ id: 'auth.createAccount' })}
            </Title>
            <Text type="secondary">Join Workforce Dashboard</Text>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={handleFinish}
            layout="vertical"
            size="large"
          >
            {errorMessage && (
              <Alert
                message="Registration Failed"
                description={errorMessage}
                type="error"
                showIcon
                closable
                onClose={() => setErrorMessage(null)}
                style={{ marginBottom: '16px' }}
              />
            )}
            
            <Space direction="horizontal" style={{ width: '100%' }}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[
                  { required: true, message: 'Please input your first name!' },
                ]}
                style={{ flex: 1 }}
              >
                <Input placeholder="First name" />
              </Form.Item>

              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[
                  { required: true, message: 'Please input your last name!' },
                ]}
                style={{ flex: 1 }}
              >
                <Input placeholder="Last name" />
              </Form.Item>
            </Space>

            <Form.Item
              name="email"
              label={intl.formatMessage({ id: 'auth.email' })}
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder={intl.formatMessage({ id: 'auth.email' })} />
            </Form.Item>

            <Form.Item
              name="password"
              label={intl.formatMessage({ id: 'auth.password' })}
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 8, message: 'Password must be at least 8 characters!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Create password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm password"
              />
            </Form.Item>

            <Form.Item
              name="terms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error('Please accept the terms and conditions!')
                        ),
                },
              ]}
            >
              <Checkbox>
                I agree to the{' '}
                <Link href="/terms" style={{ color: '#1890ff' }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" style={{ color: '#1890ff' }}>
                  Privacy Policy
                </Link>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: '40px' }}
              >
                Create Account
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
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#1890ff' }}>
                Sign in
              </Link>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}

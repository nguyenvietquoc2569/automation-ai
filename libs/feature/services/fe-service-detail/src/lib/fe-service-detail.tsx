'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Typography,
  Button,
  Tag,
  Row,
  Col,
  Space,
  Spin,
  Alert,
  Menu,
  Rate,
  Statistic,
  Divider,
  message
} from 'antd';
import {
  StarFilled,
  DownloadOutlined,
  UserOutlined,
  FileTextOutlined,
  BookOutlined,
  CheckOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { ServiceDetailAPI, ServiceDetail } from '@automation-ai/be-service-detail';

const { Title, Text } = Typography;

export interface ServiceDetailProps {
  serviceId: string;
  userId?: string;
  onSubscriptionChange?: (isSubscribed: boolean) => void;
}

export function FeServiceDetail({ 
  serviceId, 
  userId,
  onSubscriptionChange 
}: ServiceDetailProps) {
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceAPI = useMemo(() => new ServiceDetailAPI(), []);

  const loadServiceDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await serviceAPI.getServiceDetail(serviceId, userId);
      if (response.success && response.data) {
        setService(response.data);
      } else {
        setError(response.error || 'Failed to load service details');
      }
    } catch (err) {
      console.error('Service loading error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [serviceId, userId, serviceAPI]);

  useEffect(() => {
    loadServiceDetail();
  }, [loadServiceDetail]);

  const handleSubscription = async () => {
    if (!service || !userId) {
      message.warning('Please login to subscribe to this service');
      return;
    }

    setSubscribing(true);
    try {
      const response = service.isSubscribed 
        ? await serviceAPI.unsubscribeFromService(serviceId, userId)
        : await serviceAPI.subscribeToService(serviceId, userId);

      if (response.success) {
        const newSubscriptionStatus = !service.isSubscribed;
        setService({ ...service, isSubscribed: newSubscriptionStatus });
        onSubscriptionChange?.(newSubscriptionStatus);
        message.success(
          newSubscriptionStatus 
            ? 'Successfully subscribed to service!'
            : 'Successfully unsubscribed from service!'
        );
      } else {
        message.error(response.error || 'Failed to update subscription');
      }
    } catch {
      message.error('An unexpected error occurred');
    } finally {
      setSubscribing(false);
    }
  };

  const getServiceResources = () => [
    {
      key: 'user-stories',
      icon: <UserOutlined />,
      label: 'User Stories',
      href: `/services/${serviceId}/user-stories`
    },
    {
      key: 'documentation',
      icon: <BookOutlined />,
      label: 'Documentation',
      href: `/services/${serviceId}/documentation`
    },
    {
      key: 'api-reference',
      icon: <FileTextOutlined />,
      label: 'API Reference',
      href: `/services/${serviceId}/api-reference`
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading service details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={loadServiceDetail}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!service) {
    return (
      <Alert
        message="Service Not Found"
        description="The requested service could not be found."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Card>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={1} style={{ marginBottom: '8px' }}>
                {service.serviceName}
              </Title>
              
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Category and Tags */}
                <div>
                  <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {service.category}
                  </Tag>
                  <Space wrap style={{ marginLeft: '8px' }}>
                    {service.tags?.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    )) || []}
                  </Space>
                </div>

                {/* Subscribe Button */}
                {!service.isSubscribed && (
                  <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={service.isSubscribed ? <MinusOutlined /> : <CheckOutlined />}
                      loading={subscribing}
                      onClick={handleSubscription}
                      style={{
                        height: '48px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        paddingLeft: '24px',
                        paddingRight: '24px'
                      }}
                    >
                      {service.isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                    </Button>
                  </div>
                )}
              </Space>
            </div>

            <Divider />

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={3}>Description</Title>
              <div 
                dangerouslySetInnerHTML={{ __html: service.description }}
                style={{ 
                  fontSize: '16px', 
                  lineHeight: '1.6',
                  color: '#666'
                }}
              />
            </div>

            {/* Long Description if available */}
            {service.longDescription && (
              <div style={{ marginBottom: '24px' }}>
                <Title level={3}>Overview</Title>
                <div 
                  dangerouslySetInnerHTML={{ __html: service.longDescription }}
                  style={{ 
                    fontSize: '16px', 
                    lineHeight: '1.6',
                    color: '#666'
                  }}
                />
              </div>
            )}

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <Title level={3}>Key Features</Title>
                <ul style={{ fontSize: '16px', lineHeight: '1.8' }}>
                  {service.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Author Information */}
            {service.author && (
              <div style={{ marginBottom: '24px' }}>
                <Title level={3}>Author</Title>
                <Space>
                  {service.author.avatar && (
                    <img 
                      src={service.author.avatar} 
                      alt={service.author.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    />
                  )}
                  <div>
                    <Text strong>{service.author.name}</Text>
                    {service.author.company && (
                      <div>
                        <Text type="secondary">{service.author.company}</Text>
                      </div>
                    )}
                  </div>
                </Space>
              </div>
            )}

            {/* Pricing */}
            {service.pricing && (
              <div style={{ marginBottom: '24px' }}>
                <Title level={3}>Pricing</Title>
                <Card style={{ background: '#f6f8fa' }}>
                  <Statistic
                    title={service.pricing.plan}
                    value={service.pricing.price}
                    precision={2}
                    prefix={service.pricing.currency}
                    suffix={`/ ${service.pricing.period}`}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </div>
            )}
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Stats */}
            {service.stats && (
              <Card title="Statistics">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Statistic
                    title="Downloads"
                    value={service.stats.downloads}
                    prefix={<DownloadOutlined />}
                  />
                  <Statistic
                    title="Rating"
                    value={service.stats.rating}
                    precision={1}
                    prefix={<StarFilled style={{ color: '#fadb14' }} />}
                    suffix={`(${service.stats.reviews} reviews)`}
                  />
                  <Rate disabled defaultValue={service.stats.rating} />
                </Space>
              </Card>
            )}

            {/* Resources Menu */}
            <Card title="Resources">
              <Menu
                mode="vertical"
                style={{ border: 'none' }}
                items={getServiceResources().map(resource => ({
                  key: resource.key,
                  icon: resource.icon,
                  label: (
                    <a 
                      href={resource.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      {resource.label}
                    </a>
                  )
                }))}
              />
            </Card>

            {/* Subscribe Button in Sidebar for subscribed users */}
            {service.isSubscribed && (
              <Card>
                <Button
                  type="default"
                  size="large"
                  icon={<MinusOutlined />}
                  loading={subscribing}
                  onClick={handleSubscription}
                  style={{ width: '100%' }}
                  danger
                >
                  Unsubscribe
                </Button>
              </Card>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default FeServiceDetail;

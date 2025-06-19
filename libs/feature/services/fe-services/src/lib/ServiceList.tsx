'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Space,
  Pagination,
  Spin,
  Alert,
  Typography,
  Tag,
  Radio,
  Empty
} from 'antd';
import {
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  Service,
  ServiceListResponse,
  CategoryResponse,
  ViewMode,
  ServiceFilters,
  ServiceSort
} from './types';

const { Title } = Typography;
const { Option } = Select;

export interface ServiceListProps {
  onServiceClick?: (service: Service) => void;
}

export default function ServiceList({ onServiceClick }: ServiceListProps) {
  // State
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [filters, setFilters] = useState<ServiceFilters>({
    search: '',
    category: ''
  });
  const [sort, setSort] = useState<ServiceSort>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0
  });
  const [error, setError] = useState<string>('');

  // Fetch services
  const fetchServices = useCallback(async (page = 1, pageSize = 12) => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: filters.search,
        category: filters.category,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder
      });

      const response = await fetch(`/api/services?${params}`);
      const result = await response.json() as ServiceListResponse;

      if (result.success) {
        setServices(result.data);
        setPagination(result.pagination);
      } else {
        setError(result.error || 'Failed to fetch services');
        setServices([]);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Error fetching services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/services/categories');
      const result = await response.json() as CategoryResponse;

      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Initialize
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchServices(1, pagination.pageSize);
  }, [filters, sort, fetchServices, pagination.pageSize]);

  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Handle category filter
  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({ ...prev, category: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setSort({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
    fetchServices(page, pageSize);
  };

  // Handle service click
  const handleServiceClick = (service: Service) => {
    if (onServiceClick) {
      onServiceClick(service);
    } else {
      // Default behavior: navigate to service detail
      if (typeof window !== 'undefined') {
        window.location.href = `/dashboard/services/${service.serviceShortName}`;
      }
    }
  };

  // Render service card
  const renderServiceCard = (service: Service) => (
    <Col xs={24} sm={12} md={8} lg={6} key={service._id}>
      <Card
        hoverable
        onClick={() => handleServiceClick(service)}
        style={{ height: '100%', cursor: 'pointer' }}
        bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ flex: 1 }}>
          <Title level={5} style={{ marginBottom: 8 }}>
            {service.serviceName}
          </Title>
          <p style={{ 
            color: '#666', 
            marginBottom: 16,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {service.description}
          </p>
        </div>
        <div>
          <div style={{ marginBottom: 8 }}>
            <Tag color="blue">{service.category}</Tag>
          </div>
          <div>
            {service.tags.map(tag => (
              <Tag key={tag} style={{ fontSize: '12px' }}>
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      </Card>
    </Col>
  );

  // Render service list item
  const renderServiceListItem = (service: Service) => (
    <Col span={24} key={service._id}>
      <Card
        hoverable
        onClick={() => handleServiceClick(service)}
        style={{ cursor: 'pointer' }}
      >
        <Row gutter={16} align="middle">
          <Col span={18}>
            <Title level={5} style={{ marginBottom: 4 }}>
              {service.serviceName}
            </Title>
            <p style={{ color: '#666', marginBottom: 8 }}>
              {service.description}
            </p>
            <Space>
              <Tag color="blue">{service.category}</Tag>
              {service.tags.slice(0, 3).map(tag => (
                <Tag key={tag} style={{ fontSize: '12px' }}>
                  {tag}
                </Tag>
              ))}
              {service.tags.length > 3 && (
                <Tag style={{ fontSize: '12px' }}>
                  +{service.tags.length - 3} more
                </Tag>
              )}
            </Space>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Button type="primary">View Details</Button>
          </Col>
        </Row>
      </Card>
    </Col>
  );

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Services</Title>
        <p style={{ color: '#666' }}>
          Discover and explore our available services
        </p>
      </div>

      {/* Filters and Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Search services..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleSearch((e.target as HTMLInputElement).value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="All Categories"
              value={filters.category || undefined}
              onChange={handleCategoryChange}
              style={{ width: '100%' }}
              allowClear
            >
              {categories.map(category => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              value={`${sort.sortBy}-${sort.sortOrder}`}
              onChange={handleSortChange}
              style={{ width: '100%' }}
            >
              <Option value="createdAt-desc">Newest First</Option>
              <Option value="createdAt-asc">Oldest First</Option>
              <Option value="serviceName-asc">Name A-Z</Option>
              <Option value="serviceName-desc">Name Z-A</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Space style={{ float: 'right' }}>
              <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="card">
                  <AppstoreOutlined />
                </Radio.Button>
                <Radio.Button value="list">
                  <BarsOutlined />
                </Radio.Button>
              </Radio.Group>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchServices(pagination.current, pagination.pageSize)}
                loading={loading}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Loading and Content */}
      <Spin spinning={loading}>
        {services.length === 0 && !loading && !error ? (
          <Empty
            description="No services found"
            style={{ marginTop: '48px' }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {viewMode === 'card'
              ? services.map(renderServiceCard)
              : services.map(renderServiceListItem)
            }
          </Row>
        )}
      </Spin>

      {/* Pagination */}
      {services.length > 0 && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} services`
            }
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            pageSizeOptions={['12', '24', '36', '48']}
          />
        </div>
      )}
    </div>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  message,
  Card,
  Row,
  Col,
  Switch,
  Typography,
  Modal,
  Form,
  Tooltip,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// Local ServiceCategory enum to avoid import issues
enum ServiceCategory {
  AUTOMATION = 'automation',
  INTEGRATION = 'integration',
  ANALYTICS = 'analytics',
  MONITORING = 'monitoring',
  SECURITY = 'security',
  COMMUNICATION = 'communication',
  STORAGE = 'storage',
  COMPUTE = 'compute',
  NETWORKING = 'networking',
  DATABASE = 'database',
  OTHER = 'other'
}

// Types
interface Service {
  _id: string;
  serviceName: string;
  description: string;
  category: ServiceCategory;
  serviceShortName: string;
  tags: string[];
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API response interfaces
interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

// Service form values interface
interface ServiceFormValues {
  serviceName: string;
  serviceShortName: string;
  description: string;
  category: ServiceCategory;
  tags: string[];
}

interface ServiceListResponse extends ApiResponse {
  data: Service[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ServiceManagementProps {
  onCreateService?: () => void;
  onEditService?: (service: Service) => void;
}

export const ServiceManagement: React.FC<ServiceManagementProps> = ({
  onCreateService,
  onEditService
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    category: undefined as ServiceCategory | undefined,
    tags: [] as string[],
  });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();

  // Fetch services
  const fetchServices = React.useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.tags.length > 0 && { tags: filters.tags.join(',') }),
      });

      const response = await fetch(`/api/workbench/services?${params}`);
      const result = await response.json() as ServiceListResponse;

      if (result.success) {
        setServices(result.data);
        setPagination({
          current: result.pagination.page,
          pageSize: result.pagination.limit,
          total: result.pagination.total,
        });
      } else {
        message.error('Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      message.error('Error fetching services');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Toggle service status
  const toggleServiceStatus = async (serviceShortName: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/workbench/services/${serviceShortName}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      const result = await response.json() as ApiResponse;

      if (result.success) {
        message.success(result.message || 'Status updated successfully');
        fetchServices(pagination.current, pagination.pageSize);
      } else {
        message.error(result.error || 'Failed to toggle service status');
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
      message.error('Error toggling service status');
    }
  };

  // Handle edit service
  const handleEditService = (service: Service) => {
    setEditingService(service);
    form.setFieldsValue({
      serviceName: service.serviceName,
      description: service.description,
      category: service.category,
      serviceShortName: service.serviceShortName,
      tags: service.tags,
    });
    setEditModalVisible(true);
  };

  // Handle create/edit form submission
  const handleFormSubmit = async (values: ServiceFormValues) => {
    try {
      const isEditing = !!editingService;
      const url = isEditing 
        ? `/api/workbench/services/${editingService.serviceShortName}`
        : '/api/workbench/services';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json() as ApiResponse;

      if (result.success) {
        message.success(isEditing ? 'Service updated successfully' : 'Service created successfully');
        setCreateModalVisible(false);
        setEditModalVisible(false);
        setEditingService(null);
        form.resetFields();
        fetchServices(pagination.current, pagination.pageSize);
      } else {
        message.error(result.error || `Failed to ${isEditing ? 'update' : 'create'} service`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Error submitting form');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Service Name',
      dataIndex: 'serviceName',
      key: 'serviceName',
      render: (text: string, record: Service) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.serviceShortName}
          </Text>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text.length > 50 ? `${text.substring(0, 50)}...` : text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: ServiceCategory) => (
        <Tag color="blue">{category.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <div>
          {tags.slice(0, 3).map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          {tags.length > 3 && <Tag>+{tags.length - 3}</Tag>}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive = true, record: Service) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge 
            status={isActive ? 'success' : 'error'} 
            text={isActive ? 'Active' : 'Inactive'} 
          />
          <Switch
            size="small"
            checked={isActive}
            onChange={(checked) => toggleServiceStatus(record.serviceShortName, checked)}
          />
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_text: unknown, record: Service) => (
        <Space size="small">
          <Tooltip title="Edit Service">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditService(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                <SettingOutlined style={{ marginRight: '8px' }} />
                Service Management
              </Title>
              <Text type="secondary">
                Manage and configure automation services
              </Text>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchServices(pagination.current, pagination.pageSize)}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                >
                  Create Service
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Input
                placeholder="Search services..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="Filter by category"
                style={{ width: '100%' }}
                allowClear
                value={filters.category}
                onChange={(value) => setFilters({ ...filters, category: value })}
              >
                {Object.values(ServiceCategory).map(category => (
                  <Option key={category} value={category}>
                    {category.toUpperCase()}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        {/* Services Table */}
        <Table
          columns={columns}
          dataSource={services}
          loading={loading}
          rowKey="serviceShortName"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} services`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize: pageSize || 10 });
              fetchServices(page, pageSize);
            },
          }}
        />
      </Card>

      {/* Create Service Modal */}
      <Modal
        title="Create New Service"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="serviceName"
            label="Service Name"
            rules={[{ required: true, message: 'Please enter service name' }]}
          >
            <Input placeholder="Enter service name" />
          </Form.Item>
          
          <Form.Item
            name="serviceShortName"
            label="Service Short Name"
            rules={[
              { required: true, message: 'Please enter service short name' },
              { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Only letters, numbers, hyphens, and underscores allowed' }
            ]}
          >
            <Input placeholder="Enter service short name (e.g., facebook-auto-post)" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter service description" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category">
              {Object.values(ServiceCategory).map(category => (
                <Option key={category} value={category}>
                  {category.toUpperCase()}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Add tags"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Service
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        title="Edit Service"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingService(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="serviceName"
            label="Service Name"
            rules={[{ required: true, message: 'Please enter service name' }]}
          >
            <Input placeholder="Enter service name" />
          </Form.Item>
          
          <Form.Item
            name="serviceShortName"
            label="Service Short Name"
            rules={[
              { required: true, message: 'Please enter service short name' },
              { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Only letters, numbers, hyphens, and underscores allowed' }
            ]}
          >
            <Input placeholder="Enter service short name" disabled />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter service description" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category">
              {Object.values(ServiceCategory).map(category => (
                <Option key={category} value={category}>
                  {category.toUpperCase()}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Add tags"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setEditModalVisible(false);
                setEditingService(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Service
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

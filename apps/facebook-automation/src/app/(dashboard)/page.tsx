'use client';
import { Button, Card, Row, Col, Space, Typography } from 'antd';
import { PlusOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import styles from './page.module.scss';

const { Title, Paragraph } = Typography;

export default function Index() {
  return (
    <div className={styles.page}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2}>Welcome to Facebook Automation Dashboard 🤖</Title>
          <Paragraph>
            Manage your Facebook automation tasks efficiently with our comprehensive dashboard.
          </Paragraph>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card 
              title="Quick Actions" 
              extra={<SettingOutlined />}
              hoverable
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" icon={<PlusOutlined />} block>
                  Create New Campaign
                </Button>
                <Button icon={<UserOutlined />} block>
                  Manage Users
                </Button>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Card title="Recent Activity" hoverable>
              <Paragraph>No recent activities to display.</Paragraph>
              <Button type="link">View All Activities →</Button>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Card title="Statistics" hoverable>
              <Space direction="vertical">
                <div>Active Campaigns: <strong>0</strong></div>
                <div>Total Users: <strong>0</strong></div>
                <div>Success Rate: <strong>100%</strong></div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
}

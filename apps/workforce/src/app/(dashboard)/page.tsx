'use client';
import { Button, Card, Row, Col, Space, Typography } from 'antd';
import { PlusOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import styles from './page.module.scss';

const { Title, Paragraph } = Typography;

export default function Index() {
  const intl = useIntl();
  
  return (
    <div className={styles.page}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2}>{intl.formatMessage({ id: 'dashboard.welcome' })}</Title>
          <Paragraph>
            {intl.formatMessage({ id: 'dashboard.subtitle' })}
          </Paragraph>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card title={intl.formatMessage({ id: 'dashboard.quickActions' })} extra={<SettingOutlined />} hoverable>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" icon={<PlusOutlined />} block>
                  {intl.formatMessage({ id: 'dashboard.createCampaign' })}
                </Button>
                <Button icon={<UserOutlined />} block>
                  {intl.formatMessage({ id: 'dashboard.manageUsers' })}
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card title={intl.formatMessage({ id: 'dashboard.recentActivity' })} hoverable>
              <Paragraph>{intl.formatMessage({ id: 'dashboard.noActivity' })}</Paragraph>
              <Button type="link">{intl.formatMessage({ id: 'dashboard.viewAllActivities' })}</Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card title={intl.formatMessage({ id: 'dashboard.statistics' })} hoverable>
              <Space direction="vertical">
                <div>
                  {intl.formatMessage({ id: 'dashboard.activeCampaigns' })}: <strong>0</strong>
                </div>
                <div>
                  {intl.formatMessage({ id: 'dashboard.totalUsers' })}: <strong>0</strong>
                </div>
                <div>
                  {intl.formatMessage({ id: 'dashboard.successRate' })}: <strong>100%</strong>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
}

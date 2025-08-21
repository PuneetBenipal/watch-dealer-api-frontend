import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Tag,
  List,
  Divider,
  Space,
  Typography,
  Row,
  Col,
  Alert,
  Spin,
  Modal,
  Form,
  Select,
  Statistic
} from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  ReloadOutlined,
  LinkOutlined,
  DisconnectOutlined
} from '@ant-design/icons';
import API from '../../api';

const { Title, Text } = Typography;
const { Option } = Select;

const InvoiceIntegrations = () => {
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastSync, setLastSync] = useState(null);
  const [syncHistory, setSyncHistory] = useState([]);
  const [settingsModal, setSettingsModal] = useState(false);
  const [form] = Form.useForm();
  const [settings, setSettings] = useState({
    autoSync: false,
    syncInterval: 'daily',
    syncOnCreate: true,
    syncOnUpdate: true
  });

  useEffect(() => {
    loadIntegrationStatus();
    loadSyncHistory();
  }, []);

  const loadIntegrationStatus = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/integrations/quickbooks/status');
      setConnectionStatus(response.data.status || 'disconnected');
      setLastSync(response.data.lastSync ? new Date(response.data.lastSync) : null);
    } catch (error) {
      console.error('Failed to load integration status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSyncHistory = async () => {
    try {
      const response = await API.get('/api/integrations/quickbooks/sync-history');
      setSyncHistory(response.data.history || []);
    } catch (error) {
      console.error('Failed to load sync history:', error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await API.post('/api/integrations/quickbooks/connect');
      if (response.data.authUrl) {
        window.open(response.data.authUrl, '_blank');
        setAlert({ type: 'info', message: 'Please complete the QuickBooks authorization in the new window' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to initiate QuickBooks connection' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await API.post('/api/integrations/quickbooks/disconnect');
      setConnectionStatus('disconnected');
      setLastSync(null);
      setAlert({ type: 'success', message: 'Disconnected from QuickBooks successfully' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to disconnect from QuickBooks' });
    }
  };

  const handleManualSync = async () => {
    setSyncLoading(true);
    try {
      const response = await API.post('/api/integrations/quickbooks/sync');
      setAlert({ type: 'success', message: 'Sync completed successfully!' });
      loadIntegrationStatus();
      loadSyncHistory();
    } catch (error) {
      setAlert({ type: 'error', message: 'Sync failed. Please try again.' });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSettingsSave = async (values) => {
    try {
      await API.put('/api/integrations/quickbooks/settings', values);
      setSettings(values);
      setAlert({ type: 'success', message: 'Settings saved successfully!' });
      setSettingsModal(false);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to save settings' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'success';
      case 'connecting': return 'processing';
      case 'disconnected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <LinkOutlined />;
      case 'connecting': return <SyncOutlined spin />;
      case 'disconnected': return <DisconnectOutlined />;
      default: return <DisconnectOutlined />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getSyncStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default: return <SyncOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const openSettingsModal = () => {
    form.setFieldsValue(settings);
    setSettingsModal(true);
  };

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0, color: '#262626' }}>
          QuickBooks Integration
        </Title>
        <Button
          type="default"
          icon={<ReloadOutlined />}
          onClick={() => { loadIntegrationStatus(); loadSyncHistory(); }}
        >
          Refresh
        </Button>
      </div>

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          closable
          onClose={() => setAlert(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Connection Status */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0, color: '#262626' }}>
            Connection Status
          </Title>
          <Tag
            color={getStatusColor(connectionStatus)}
            icon={getStatusIcon(connectionStatus)}
            size="large"
          >
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </Tag>
        </div>

        <Row gutter={16} align="middle">
          <Col xs={24} md={16}>
            <Space size="large" align="start">
              <div style={{ fontSize: 40, color: '#52c41a' }}>
                <SyncOutlined />
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  QuickBooks Online
                </Title>
                <Text type="secondary">
                  {connectionStatus === 'connected' 
                    ? 'Connected and ready to sync invoices'
                    : connectionStatus === 'connecting'
                    ? 'Establishing connection...'
                    : 'Not connected. Connect to sync invoices with QuickBooks.'
                  }
                </Text>
                {lastSync && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">
                      Last sync: {formatDate(lastSync)}
                    </Text>
                  </div>
                )}
              </div>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {connectionStatus === 'connected' ? (
                <>
                  <Button
                    type="default"
                    icon={<SettingOutlined />}
                    onClick={openSettingsModal}
                    block
                  >
                    Settings
                  </Button>
                  <Button
                    type="default"
                    danger
                    icon={<DisconnectOutlined />}
                    onClick={handleDisconnect}
                    block
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  type="primary"
                  icon={<LinkOutlined />}
                  onClick={handleConnect}
                  loading={loading}
                  block
                  size="large"
                >
                  {loading ? 'Connecting...' : 'Connect to QuickBooks'}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Sync Actions */}
      {connectionStatus === 'connected' && (
        <Card style={{ marginBottom: 16 }}>
          <Title level={4} style={{ marginBottom: 16, color: '#262626' }}>
            Sync Actions
          </Title>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    Manual Sync
                  </Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Manually sync all pending invoices with QuickBooks
                  </Text>
                  <Button
                    type="primary"
                    icon={syncLoading ? <SyncOutlined spin /> : <SyncOutlined />}
                    onClick={handleManualSync}
                    loading={syncLoading}
                    block
                  >
                    {syncLoading ? 'Syncing...' : 'Sync Now'}
                  </Button>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    Auto Sync
                  </Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    {settings.autoSync ? 'Enabled' : 'Disabled'} - {settings.syncInterval} sync
                  </Text>
                  <Button
                    type="default"
                    icon={<SettingOutlined />}
                    onClick={openSettingsModal}
                    block
                  >
                    Configure Auto Sync
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* Sync History */}
      <Card>
        <Title level={4} style={{ marginBottom: 16, color: '#262626' }}>
          Sync History
        </Title>
        
        {syncHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
            <Text>No sync history available</Text>
          </div>
        ) : (
          <List
            dataSource={syncHistory.slice(0, 10)}
            renderItem={(sync, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={getSyncStatusIcon(sync.status)}
                  title={`${sync.type} sync - ${sync.status}`}
                  description={`${formatDate(sync.timestamp)} - ${sync.message || 'Sync completed'}`}
                />
                {sync.invoicesProcessed && (
                  <Tag size="small" variant="outlined">
                    {sync.invoicesProcessed} invoices
                  </Tag>
                )}
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Settings Modal */}
      <Modal
        title="QuickBooks Sync Settings"
        open={settingsModal}
        onCancel={() => setSettingsModal(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSettingsSave}
          initialValues={settings}
        >
          <Form.Item
            name="autoSync"
            label="Auto Sync"
            rules={[{ required: true, message: 'Please select auto sync option' }]}
          >
            <Select>
              <Option value={true}>Enabled</Option>
              <Option value={false}>Disabled</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="syncInterval"
            label="Sync Interval"
            rules={[{ required: true, message: 'Please select sync interval' }]}
          >
            <Select>
              <Option value="hourly">Hourly</Option>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="syncOnCreate"
            label="Sync on Invoice Create"
            rules={[{ required: true, message: 'Please select option' }]}
          >
            <Select>
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="syncOnUpdate"
            label="Sync on Invoice Update"
            rules={[{ required: true, message: 'Please select option' }]}
          >
            <Select>
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setSettingsModal(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Save Settings
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default InvoiceIntegrations;

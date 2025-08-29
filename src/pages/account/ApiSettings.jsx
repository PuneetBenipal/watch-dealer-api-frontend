import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Switch, Tag, Space, Typography, Row, Col, Alert, Divider, Tooltip, Popconfirm, message } from 'antd';
import { PlusOutlined, KeyOutlined, CopyOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ApiSettings = () => {
    const [apiKeys, setApiKeys] = useState([]);
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createKeyModal, setCreateKeyModal] = useState(false);
    const [createWebhookModal, setCreateWebhookModal] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null);
    const [form] = Form.useForm();
    const [webhookForm] = Form.useForm();

    useEffect(() => {
        // Mock data for API keys and webhooks
        setApiKeys([
            {
                id: 'key_1',
                name: 'Production API Key',
                key: 'wdh_live_1234567890abcdef',
                permissions: ['read', 'write'],
                lastUsed: '2024-01-22T10:30:00Z',
                createdAt: '2024-01-15T09:00:00Z',
                status: 'active',
                usage: { requests: 1250, limit: 10000 }
            },
            {
                id: 'key_2',
                name: 'Mobile App Key',
                key: 'wdh_test_abcdef1234567890',
                permissions: ['read'],
                lastUsed: '2024-01-21T15:45:00Z',
                createdAt: '2024-01-10T14:20:00Z',
                status: 'active',
                usage: { requests: 450, limit: 5000 }
            }
        ]);

        setWebhooks([
            {
                id: 'webhook_1',
                name: 'Inventory Updates',
                url: 'https://myapp.com/webhooks/inventory',
                events: ['inventory.created', 'inventory.updated'],
                status: 'active',
                lastDelivery: '2024-01-22T11:15:00Z',
                successRate: 98.5
            },
            {
                id: 'webhook_2',
                name: 'Invoice Notifications',
                url: 'https://accounting.mycompany.com/api/invoices',
                events: ['invoice.paid', 'invoice.overdue'],
                status: 'inactive',
                lastDelivery: '2024-01-20T09:30:00Z',
                successRate: 95.2
            }
        ]);
    }, []);

    const handleCreateApiKey = async (values) => {
        setLoading(true);
        try {
            const newKey = {
                id: `key_${Date.now()}`,
                name: values.name,
                key: `wdh_${values.environment}_${Math.random().toString(36).substring(2, 18)}`,
                permissions: values.permissions,
                createdAt: new Date().toISOString(),
                status: 'active',
                usage: { requests: 0, limit: values.environment === 'live' ? 10000 : 5000 }
            };
            
            setApiKeys(prev => [newKey, ...prev]);
            setCreateKeyModal(false);
            form.resetFields();
            message.success('API key created successfully');
        } catch (error) {
            message.error('Failed to create API key');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWebhook = async (values) => {
        setLoading(true);
        try {
            const newWebhook = {
                id: `webhook_${Date.now()}`,
                name: values.name,
                url: values.url,
                events: values.events,
                status: 'active',
                createdAt: new Date().toISOString(),
                successRate: 100
            };
            
            setWebhooks(prev => [newWebhook, ...prev]);
            setCreateWebhookModal(false);
            webhookForm.resetFields();
            message.success('Webhook created successfully');
        } catch (error) {
            message.error('Failed to create webhook');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteApiKey = (keyId) => {
        setApiKeys(prev => prev.filter(key => key.id !== keyId));
        message.success('API key deleted');
    };

    const handleDeleteWebhook = (webhookId) => {
        setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
        message.success('Webhook deleted');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        message.success('Copied to clipboard');
    };

    const regenerateApiKey = (keyId) => {
        setApiKeys(prev => prev.map(key => 
            key.id === keyId 
                ? { ...key, key: `wdh_live_${Math.random().toString(36).substring(2, 18)}` }
                : key
        ));
        message.success('API key regenerated');
    };

    const apiKeyColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <Text strong>{text}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        Created: {new Date(record.createdAt).toLocaleDateString()}
                    </Text>
                </div>
            )
        },
        {
            title: 'API Key',
            dataIndex: 'key',
            key: 'key',
            render: (key) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text code style={{ fontFamily: 'monospace' }}>
                        {key.substring(0, 20)}...
                    </Text>
                    <Button 
                        size="small" 
                        icon={<CopyOutlined />} 
                        onClick={() => copyToClipboard(key)}
                    />
                </div>
            )
        },
        {
            title: 'Permissions',
            dataIndex: 'permissions',
            key: 'permissions',
            render: (permissions) => (
                <Space>
                    {permissions.map(permission => (
                        <Tag key={permission} color={permission === 'write' ? 'orange' : 'blue'}>
                            {permission.toUpperCase()}
                        </Tag>
                    ))}
                </Space>
            )
        },
        {
            title: 'Usage',
            key: 'usage',
            render: (record) => (
                <div>
                    <Text>{record.usage.requests.toLocaleString()} / {record.usage.limit.toLocaleString()}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        Last used: {record.lastUsed ? new Date(record.lastUsed).toLocaleDateString() : 'Never'}
                    </Text>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record) => (
                <Space>
                    <Tooltip title="Regenerate Key">
                        <Button 
                            size="small" 
                            icon={<ReloadOutlined />}
                            onClick={() => regenerateApiKey(record.id)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete API Key"
                        description="Are you sure you want to delete this API key?"
                        onConfirm={() => handleDeleteApiKey(record.id)}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const webhookColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <Text strong>{text}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.url}
                    </Text>
                </div>
            )
        },
        {
            title: 'Events',
            dataIndex: 'events',
            key: 'events',
            render: (events) => (
                <Space wrap>
                    {events.map(event => (
                        <Tag key={event}>{event}</Tag>
                    ))}
                </Space>
            )
        },
        {
            title: 'Success Rate',
            key: 'successRate',
            render: (record) => (
                <div>
                    <Text>{record.successRate}%</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        Last: {record.lastDelivery ? new Date(record.lastDelivery).toLocaleDateString() : 'Never'}
                    </Text>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record) => (
                <Space>
                    <Button size="small">Test</Button>
                    <Popconfirm
                        title="Delete Webhook"
                        description="Are you sure you want to delete this webhook?"
                        onConfirm={() => handleDeleteWebhook(record.id)}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>API Settings</Title>
            <Paragraph>
                Manage your API keys and webhooks to integrate WatchDealerHub with your applications.
            </Paragraph>

            {/* API Keys Section */}
            <Card 
                title="API Keys" 
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => setCreateKeyModal(true)}
                    >
                        Create API Key
                    </Button>
                }
                style={{ marginBottom: '24px' }}
            >
                <Alert
                    message="API Key Security"
                    description="Keep your API keys secure and never share them publicly. Regenerate keys if you suspect they've been compromised."
                    type="info"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
                
                <Table
                    columns={apiKeyColumns}
                    dataSource={apiKeys}
                    rowKey="id"
                    pagination={false}
                />
            </Card>

            {/* Webhooks Section */}
            <Card 
                title="Webhooks" 
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => setCreateWebhookModal(true)}
                    >
                        Create Webhook
                    </Button>
                }
                style={{ marginBottom: '24px' }}
            >
                <Alert
                    message="Webhook Events"
                    description="Webhooks allow you to receive real-time notifications when events occur in your WatchDealerHub account."
                    type="info"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
                
                <Table
                    columns={webhookColumns}
                    dataSource={webhooks}
                    rowKey="id"
                    pagination={false}
                />
            </Card>

            {/* API Documentation */}
            <Card title="API Documentation">
                <Row gutter={16}>
                    <Col span={8}>
                        <Card size="small">
                            <Title level={4}>Getting Started</Title>
                            <Paragraph>
                                Learn how to authenticate and make your first API call.
                            </Paragraph>
                            <Button type="link">View Guide →</Button>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card size="small">
                            <Title level={4}>API Reference</Title>
                            <Paragraph>
                                Complete documentation of all available endpoints.
                            </Paragraph>
                            <Button type="link">Browse Docs →</Button>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card size="small">
                            <Title level={4}>Code Examples</Title>
                            <Paragraph>
                                Sample code in various programming languages.
                            </Paragraph>
                            <Button type="link">View Examples →</Button>
                        </Card>
                    </Col>
                </Row>
            </Card>

            {/* Create API Key Modal */}
            <Modal
                title="Create API Key"
                open={createKeyModal}
                onCancel={() => setCreateKeyModal(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateApiKey}
                >
                    <Form.Item
                        name="name"
                        label="Key Name"
                        rules={[{ required: true, message: 'Please enter a name for this API key' }]}
                    >
                        <Input placeholder="e.g., Production API Key" />
                    </Form.Item>

                    <Form.Item
                        name="environment"
                        label="Environment"
                        rules={[{ required: true, message: 'Please select an environment' }]}
                        initialValue="test"
                    >
                        <Select>
                            <Option value="test">Test (5,000 requests/month)</Option>
                            <Option value="live">Live (10,000 requests/month)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="permissions"
                        label="Permissions"
                        rules={[{ required: true, message: 'Please select at least one permission' }]}
                    >
                        <Select mode="multiple" placeholder="Select permissions">
                            <Option value="read">Read Access</Option>
                            <Option value="write">Write Access</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description (Optional)"
                    >
                        <TextArea rows={3} placeholder="Describe what this API key will be used for..." />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Create API Key
                            </Button>
                            <Button onClick={() => setCreateKeyModal(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Create Webhook Modal */}
            <Modal
                title="Create Webhook"
                open={createWebhookModal}
                onCancel={() => setCreateWebhookModal(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={webhookForm}
                    layout="vertical"
                    onFinish={handleCreateWebhook}
                >
                    <Form.Item
                        name="name"
                        label="Webhook Name"
                        rules={[{ required: true, message: 'Please enter a name for this webhook' }]}
                    >
                        <Input placeholder="e.g., Inventory Updates" />
                    </Form.Item>

                    <Form.Item
                        name="url"
                        label="Endpoint URL"
                        rules={[
                            { required: true, message: 'Please enter the webhook URL' },
                            { type: 'url', message: 'Please enter a valid URL' }
                        ]}
                    >
                        <Input placeholder="https://yourapp.com/webhooks/endpoint" />
                    </Form.Item>

                    <Form.Item
                        name="events"
                        label="Events to Subscribe"
                        rules={[{ required: true, message: 'Please select at least one event' }]}
                    >
                        <Select mode="multiple" placeholder="Select events">
                            <Option value="inventory.created">Inventory Created</Option>
                            <Option value="inventory.updated">Inventory Updated</Option>
                            <Option value="inventory.deleted">Inventory Deleted</Option>
                            <Option value="invoice.created">Invoice Created</Option>
                            <Option value="invoice.paid">Invoice Paid</Option>
                            <Option value="invoice.overdue">Invoice Overdue</Option>
                            <Option value="escrow.created">Escrow Created</Option>
                            <Option value="escrow.completed">Escrow Completed</Option>
                            <Option value="dispute.created">Dispute Created</Option>
                            <Option value="dispute.resolved">Dispute Resolved</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="secret"
                        label="Webhook Secret (Optional)"
                    >
                        <Input.Password placeholder="Enter a secret for webhook verification" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Create Webhook
                            </Button>
                            <Button onClick={() => setCreateWebhookModal(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ApiSettings;

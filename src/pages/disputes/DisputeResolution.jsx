import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Modal, Upload, Form, Input, Select, Timeline, Descriptions, Space, Divider, Alert, Typography, Row, Col, Avatar, Comment, List } from 'antd';
import { PlusOutlined, MessageOutlined, FileTextOutlined, ExclamationCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, UploadOutlined, SendOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DisputeResolution = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [form] = Form.useForm();

    // Mock data for disputes
    useEffect(() => {
        setDisputes([
            {
                id: 'DIS001',
                title: 'Watch Authenticity Dispute',
                escrowId: 'ESC001',
                watchModel: 'Rolex Submariner 116610LN',
                complainant: 'John Smith',
                respondent: 'Premium Watches Ltd',
                amount: 8500,
                status: 'under_review',
                priority: 'high',
                createdAt: '2024-01-20',
                lastActivity: '2024-01-22',
                category: 'authenticity',
                description: 'Buyer claims the watch received does not match the authenticity certificate provided.',
                messages: [
                    {
                        id: 1,
                        author: 'John Smith',
                        content: 'The serial number on the watch does not match the certificate.',
                        timestamp: '2024-01-20 10:30',
                        attachments: ['serial_photo.jpg']
                    },
                    {
                        id: 2,
                        author: 'Premium Watches Ltd',
                        content: 'We will investigate this matter and provide additional documentation.',
                        timestamp: '2024-01-20 14:15',
                        attachments: []
                    },
                    {
                        id: 3,
                        author: 'WatchDealerHub Mediator',
                        content: 'We have requested an independent authentication from our certified partner.',
                        timestamp: '2024-01-22 09:00',
                        attachments: []
                    }
                ]
            },
            {
                id: 'DIS002',
                title: 'Condition Mismatch',
                escrowId: 'ESC003',
                watchModel: 'Omega Speedmaster Professional',
                complainant: 'Sarah Johnson',
                respondent: 'TimeKeepers Inc',
                amount: 3200,
                status: 'resolved',
                priority: 'medium',
                createdAt: '2024-01-15',
                lastActivity: '2024-01-18',
                category: 'condition',
                description: 'Watch condition does not match the description provided in the listing.',
                messages: []
            },
            {
                id: 'DIS003',
                title: 'Delivery Delay Compensation',
                escrowId: 'ESC005',
                watchModel: 'Patek Philippe Calatrava',
                complainant: 'Michael Brown',
                respondent: 'Luxury Timepieces',
                amount: 25000,
                status: 'escalated',
                priority: 'high',
                createdAt: '2024-01-18',
                lastActivity: '2024-01-21',
                category: 'delivery',
                description: 'Significant delay in delivery causing financial loss to buyer.',
                messages: []
            }
        ]);
    }, []);

    const getStatusColor = (status) => {
        const colors = {
            'open': 'orange',
            'under_review': 'blue',
            'escalated': 'red',
            'resolved': 'green',
            'closed': 'gray'
        };
        return colors[status] || 'default';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'low': 'green',
            'medium': 'orange',
            'high': 'red',
            'urgent': 'magenta'
        };
        return colors[priority] || 'default';
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'authenticity': <ExclamationCircleOutlined />,
            'condition': <FileTextOutlined />,
            'delivery': <ClockCircleOutlined />,
            'payment': <CheckCircleOutlined />
        };
        return icons[category] || <ExclamationCircleOutlined />;
    };

    const columns = [
        {
            title: 'Dispute ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div>
                    <Text strong>{text}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.watchModel}
                    </Text>
                </div>
            )
        },
        {
            title: 'Parties',
            key: 'parties',
            render: (record) => (
                <div>
                    <div><Text type="secondary">Complainant:</Text> {record.complainant}</div>
                    <div><Text type="secondary">Respondent:</Text> {record.respondent}</div>
                </div>
            )
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category) => (
                <Tag icon={getCategoryIcon(category)}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                </Tag>
            )
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => (
                <Tag color={getPriorityColor(priority)}>
                    {priority.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status.replace('_', ' ').toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => <Text strong>${amount.toLocaleString()}</Text>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record) => (
                <Space>
                    <Button 
                        icon={<MessageOutlined />} 
                        onClick={() => {
                            setSelectedDispute(record);
                            setDetailModalVisible(true);
                        }}
                    >
                        View
                    </Button>
                </Space>
            )
        }
    ];

    const handleCreateDispute = (values) => {
        console.log('Creating dispute:', values);
        setCreateModalVisible(false);
        form.resetFields();
    };

    const handleSendMessage = () => {
        if (messageText.trim()) {
            const newMessage = {
                id: Date.now(),
                author: 'Current User',
                content: messageText,
                timestamp: new Date().toLocaleString(),
                attachments: []
            };
            
            setSelectedDispute(prev => ({
                ...prev,
                messages: [...prev.messages, newMessage]
            }));
            setMessageText('');
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>Dispute Resolution</Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                >
                    File New Dispute
                </Button>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#faad14' }}>8</Title>
                            <Text type="secondary">Open Disputes</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>3</Title>
                            <Text type="secondary">Under Review</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#52c41a' }}>24</Title>
                            <Text type="secondary">Resolved This Month</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#722ed1' }}>2.3 days</Title>
                            <Text type="secondary">Avg Resolution Time</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card>
                <Table
                    columns={columns}
                    dataSource={disputes}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                    }}
                />
            </Card>

            {/* Create Dispute Modal */}
            <Modal
                title="File New Dispute"
                open={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateDispute}
                >
                    <Form.Item
                        name="escrowId"
                        label="Related Escrow Transaction"
                        rules={[{ required: true, message: 'Please select escrow transaction' }]}
                    >
                        <Select placeholder="Select escrow transaction">
                            <Option value="ESC001">ESC001 - Rolex Submariner</Option>
                            <Option value="ESC002">ESC002 - Omega Speedmaster</Option>
                            <Option value="ESC003">ESC003 - Patek Philippe</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="Dispute Category"
                        rules={[{ required: true, message: 'Please select category' }]}
                    >
                        <Select placeholder="Select category">
                            <Option value="authenticity">Authenticity</Option>
                            <Option value="condition">Condition Mismatch</Option>
                            <Option value="delivery">Delivery Issues</Option>
                            <Option value="payment">Payment Issues</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label="Priority Level"
                        initialValue="medium"
                    >
                        <Select>
                            <Option value="low">Low</Option>
                            <Option value="medium">Medium</Option>
                            <Option value="high">High</Option>
                            <Option value="urgent">Urgent</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="title"
                        label="Dispute Title"
                        rules={[{ required: true, message: 'Please enter dispute title' }]}
                    >
                        <Input placeholder="Brief description of the issue" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Detailed Description"
                        rules={[{ required: true, message: 'Please provide detailed description' }]}
                    >
                        <TextArea 
                            rows={4} 
                            placeholder="Provide a detailed explanation of the dispute, including timeline and specific issues..."
                        />
                    </Form.Item>

                    <Form.Item
                        name="evidence"
                        label="Supporting Evidence"
                    >
                        <Upload.Dragger multiple>
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Upload evidence files</p>
                            <p className="ant-upload-hint">
                                Photos, documents, communications, etc.
                            </p>
                        </Upload.Dragger>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                File Dispute
                            </Button>
                            <Button onClick={() => setCreateModalVisible(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Dispute Detail Modal */}
            <Modal
                title={`Dispute ${selectedDispute?.id} - ${selectedDispute?.title}`}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={900}
            >
                {selectedDispute && (
                    <div>
                        <Row gutter={16}>
                            <Col span={16}>
                                <Alert
                                    message={`Status: ${selectedDispute.status.replace('_', ' ').toUpperCase()}`}
                                    type={selectedDispute.status === 'resolved' ? 'success' : 'warning'}
                                    style={{ marginBottom: '16px' }}
                                />

                                <Descriptions bordered size="small" column={2}>
                                    <Descriptions.Item label="Escrow ID">
                                        {selectedDispute.escrowId}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Watch Model">
                                        {selectedDispute.watchModel}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Complainant">
                                        {selectedDispute.complainant}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Respondent">
                                        {selectedDispute.respondent}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Amount">
                                        ${selectedDispute.amount.toLocaleString()}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Priority">
                                        <Tag color={getPriorityColor(selectedDispute.priority)}>
                                            {selectedDispute.priority.toUpperCase()}
                                        </Tag>
                                    </Descriptions.Item>
                                </Descriptions>

                                <Divider>Description</Divider>
                                <Paragraph>{selectedDispute.description}</Paragraph>

                                <Divider>Communication History</Divider>
                                <List
                                    dataSource={selectedDispute.messages}
                                    renderItem={item => (
                                        <Comment
                                            author={item.author}
                                            avatar={<Avatar>{item.author.charAt(0)}</Avatar>}
                                            content={item.content}
                                            datetime={item.timestamp}
                                        />
                                    )}
                                />

                                <Divider>Add Message</Divider>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <TextArea
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        placeholder="Type your message..."
                                        rows={3}
                                        style={{ flex: 1 }}
                                    />
                                    <Button 
                                        type="primary" 
                                        icon={<SendOutlined />}
                                        onClick={handleSendMessage}
                                    >
                                        Send
                                    </Button>
                                </div>
                            </Col>

                            <Col span={8}>
                                <Card title="Actions" size="small">
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Button block>Request Mediation</Button>
                                        <Button block>Upload Evidence</Button>
                                        <Button block>Schedule Call</Button>
                                        <Button block type="primary">Mark Resolved</Button>
                                        <Button block danger>Escalate</Button>
                                    </Space>
                                </Card>

                                <Card title="Timeline" size="small" style={{ marginTop: '16px' }}>
                                    <Timeline size="small">
                                        <Timeline.Item color="blue">
                                            Dispute filed - {selectedDispute.createdAt}
                                        </Timeline.Item>
                                        <Timeline.Item color="orange">
                                            Under review - {selectedDispute.lastActivity}
                                        </Timeline.Item>
                                        <Timeline.Item color="gray">
                                            Awaiting response
                                        </Timeline.Item>
                                    </Timeline>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DisputeResolution;

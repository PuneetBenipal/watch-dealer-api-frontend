import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Modal, Upload, Form, Input, Select, Steps, Progress, Descriptions, Space, Divider, Alert, Typography, Row, Col } from 'antd';
import { PlusOutlined, FileTextOutlined, SafetyOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

const EscrowServices = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [form] = Form.useForm();

    // Mock data for escrow transactions
    useEffect(() => {
        setTransactions([
            {
                id: 'ESC001',
                watchModel: 'Rolex Submariner 116610LN',
                buyer: 'John Smith',
                seller: 'Premium Watches Ltd',
                amount: 8500,
                currency: 'USD',
                status: 'funds_held',
                createdAt: '2024-01-15',
                expectedDelivery: '2024-01-22',
                progress: 60,
                documents: ['purchase_agreement.pdf', 'authenticity_cert.pdf']
            },
            {
                id: 'ESC002',
                watchModel: 'Omega Speedmaster Professional',
                buyer: 'Sarah Johnson',
                seller: 'TimeKeepers Inc',
                amount: 3200,
                currency: 'USD',
                status: 'completed',
                createdAt: '2024-01-10',
                expectedDelivery: '2024-01-17',
                progress: 100,
                documents: ['receipt.pdf', 'warranty.pdf']
            },
            {
                id: 'ESC003',
                watchModel: 'Patek Philippe Calatrava',
                buyer: 'Michael Brown',
                seller: 'Luxury Timepieces',
                amount: 25000,
                currency: 'USD',
                status: 'pending_inspection',
                createdAt: '2024-01-20',
                expectedDelivery: '2024-01-27',
                progress: 80,
                documents: ['appraisal.pdf']
            }
        ]);
    }, []);

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'orange',
            'funds_held': 'blue',
            'pending_inspection': 'purple',
            'completed': 'green',
            'disputed': 'red',
            'cancelled': 'gray'
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status) => {
        const texts = {
            'pending': 'Pending Setup',
            'funds_held': 'Funds Held',
            'pending_inspection': 'Pending Inspection',
            'completed': 'Completed',
            'disputed': 'Disputed',
            'cancelled': 'Cancelled'
        };
        return texts[status] || status;
    };

    const getTransactionSteps = (status) => {
        const steps = [
            { title: 'Agreement Created', icon: <FileTextOutlined /> },
            { title: 'Funds Deposited', icon: <DollarOutlined /> },
            { title: 'Item Shipped', icon: <SafetyOutlined /> },
            { title: 'Inspection Period', icon: <ClockCircleOutlined /> },
            { title: 'Funds Released', icon: <CheckCircleOutlined /> }
        ];

        let current = 0;
        switch (status) {
            case 'pending': current = 0; break;
            case 'funds_held': current = 1; break;
            case 'pending_inspection': current = 3; break;
            case 'completed': current = 4; break;
            default: current = 0;
        }

        return { steps, current };
    };

    const columns = [
        {
            title: 'Transaction ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Watch Model',
            dataIndex: 'watchModel',
            key: 'watchModel',
            render: (text) => <Text>{text}</Text>
        },
        {
            title: 'Parties',
            key: 'parties',
            render: (record) => (
                <div>
                    <div><Text type="secondary">Buyer:</Text> {record.buyer}</div>
                    <div><Text type="secondary">Seller:</Text> {record.seller}</div>
                </div>
            )
        },
        {
            title: 'Amount',
            key: 'amount',
            render: (record) => (
                <Text strong>${record.amount.toLocaleString()} {record.currency}</Text>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            )
        },
        {
            title: 'Progress',
            dataIndex: 'progress',
            key: 'progress',
            render: (progress) => (
                <Progress percent={progress} size="small" />
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record) => (
                <Space>
                    <Button 
                        icon={<EyeOutlined />} 
                        onClick={() => {
                            setSelectedTransaction(record);
                            setDetailModalVisible(true);
                        }}
                    >
                        View
                    </Button>
                </Space>
            )
        }
    ];

    const handleCreateTransaction = (values) => {
        console.log('Creating escrow transaction:', values);
        setCreateModalVisible(false);
        form.resetFields();
        // Here you would typically call an API to create the transaction
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>Escrow Services</Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                >
                    Create Escrow Transaction
                </Button>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>12</Title>
                            <Text type="secondary">Active Transactions</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#52c41a' }}>$156,000</Title>
                            <Text type="secondary">Funds in Escrow</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#faad14' }}>3</Title>
                            <Text type="secondary">Pending Inspection</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#722ed1' }}>98.5%</Title>
                            <Text type="secondary">Success Rate</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card>
                <Table
                    columns={columns}
                    dataSource={transactions}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                    }}
                />
            </Card>

            {/* Create Transaction Modal */}
            <Modal
                title="Create Escrow Transaction"
                open={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateTransaction}
                >
                    <Form.Item
                        name="watchModel"
                        label="Watch Model"
                        rules={[{ required: true, message: 'Please enter watch model' }]}
                    >
                        <Input placeholder="e.g., Rolex Submariner 116610LN" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="buyerEmail"
                                label="Buyer Email"
                                rules={[{ required: true, type: 'email' }]}
                            >
                                <Input placeholder="buyer@example.com" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="sellerEmail"
                                label="Seller Email"
                                rules={[{ required: true, type: 'email' }]}
                            >
                                <Input placeholder="seller@example.com" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                name="amount"
                                label="Transaction Amount"
                                rules={[{ required: true, message: 'Please enter amount' }]}
                            >
                                <Input type="number" placeholder="25000" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="currency"
                                label="Currency"
                                initialValue="USD"
                            >
                                <Select>
                                    <Option value="USD">USD</Option>
                                    <Option value="EUR">EUR</Option>
                                    <Option value="GBP">GBP</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="terms"
                        label="Special Terms"
                    >
                        <Input.TextArea rows={3} placeholder="Any special terms or conditions..." />
                    </Form.Item>

                    <Form.Item
                        name="documents"
                        label="Supporting Documents"
                    >
                        <Upload.Dragger multiple>
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag files to upload</p>
                            <p className="ant-upload-hint">
                                Upload purchase agreements, authenticity certificates, etc.
                            </p>
                        </Upload.Dragger>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Create Transaction
                            </Button>
                            <Button onClick={() => setCreateModalVisible(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Transaction Detail Modal */}
            <Modal
                title={`Escrow Transaction - ${selectedTransaction?.id}`}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedTransaction && (
                    <div>
                        <Alert
                            message={`Status: ${getStatusText(selectedTransaction.status)}`}
                            type={selectedTransaction.status === 'completed' ? 'success' : 'info'}
                            style={{ marginBottom: '16px' }}
                        />

                        <Steps 
                            {...getTransactionSteps(selectedTransaction.status)}
                            style={{ marginBottom: '24px' }}
                        />

                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Watch Model" span={2}>
                                {selectedTransaction.watchModel}
                            </Descriptions.Item>
                            <Descriptions.Item label="Buyer">
                                {selectedTransaction.buyer}
                            </Descriptions.Item>
                            <Descriptions.Item label="Seller">
                                {selectedTransaction.seller}
                            </Descriptions.Item>
                            <Descriptions.Item label="Amount">
                                ${selectedTransaction.amount.toLocaleString()} {selectedTransaction.currency}
                            </Descriptions.Item>
                            <Descriptions.Item label="Created">
                                {selectedTransaction.createdAt}
                            </Descriptions.Item>
                            <Descriptions.Item label="Expected Delivery">
                                {selectedTransaction.expectedDelivery}
                            </Descriptions.Item>
                            <Descriptions.Item label="Progress">
                                <Progress percent={selectedTransaction.progress} />
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider>Documents</Divider>
                        <Space wrap>
                            {selectedTransaction.documents.map((doc, index) => (
                                <Button key={index} icon={<FileTextOutlined />}>
                                    {doc}
                                </Button>
                            ))}
                        </Space>

                        <Divider>Actions</Divider>
                        <Space>
                            <Button type="primary">Release Funds</Button>
                            <Button>Request Inspection</Button>
                            <Button danger>Initiate Dispute</Button>
                        </Space>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EscrowServices;

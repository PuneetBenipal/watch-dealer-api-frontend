import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, Space, Typography, Row, Col, DatePicker, InputNumber, Divider, Upload, message, Tabs, Progress, Switch } from 'antd';
import { 
    PlusOutlined, 
    FileTextOutlined, 
    DownloadOutlined, 
    SendOutlined, 
    EditOutlined, 
    DeleteOutlined,
    EyeOutlined,
    DollarOutlined,
    CalendarOutlined,
    UserOutlined,
    SettingOutlined,
    SyncOutlined,
    UploadOutlined,
    FilePdfOutlined,
    MailOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const EnhancedInvoicing = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [settingsModal, setSettingsModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [form] = Form.useForm();
    const [settingsForm] = Form.useForm();

    useEffect(() => {
        // Mock invoice data
        setInvoices([
            {
                id: 'INV-2024-001',
                customerName: 'John Smith',
                customerEmail: 'john.smith@email.com',
                customerAddress: '123 Main St, New York, NY 10001',
                items: [
                    { description: 'Rolex Submariner 116610LN', quantity: 1, price: 8500, total: 8500 },
                    { description: 'Service & Authentication', quantity: 1, price: 200, total: 200 }
                ],
                subtotal: 8700,
                tax: 696,
                total: 9396,
                status: 'paid',
                dueDate: '2024-02-15',
                issueDate: '2024-01-15',
                paidDate: '2024-01-20',
                paymentMethod: 'Wire Transfer',
                notes: 'Thank you for your business!',
                quickbooksSync: true,
                emailSent: true
            },
            {
                id: 'INV-2024-002',
                customerName: 'Sarah Johnson',
                customerEmail: 'sarah.j@company.com',
                customerAddress: '456 Oak Ave, Los Angeles, CA 90210',
                items: [
                    { description: 'Omega Speedmaster Professional', quantity: 1, price: 3200, total: 3200 },
                    { description: 'Leather Strap', quantity: 1, price: 150, total: 150 }
                ],
                subtotal: 3350,
                tax: 268,
                total: 3618,
                status: 'pending',
                dueDate: '2024-02-10',
                issueDate: '2024-01-10',
                paidDate: null,
                paymentMethod: null,
                notes: 'Payment due within 30 days',
                quickbooksSync: false,
                emailSent: true
            },
            {
                id: 'INV-2024-003',
                customerName: 'Michael Brown',
                customerEmail: 'michael@premiumwatches.com',
                customerAddress: '789 Fifth Ave, New York, NY 10022',
                items: [
                    { description: 'Patek Philippe Calatrava 5196P', quantity: 1, price: 25000, total: 25000 }
                ],
                subtotal: 25000,
                tax: 2000,
                total: 27000,
                status: 'overdue',
                dueDate: '2024-01-25',
                issueDate: '2023-12-25',
                paidDate: null,
                paymentMethod: null,
                notes: 'High-value transaction - wire transfer preferred',
                quickbooksSync: true,
                emailSent: true
            }
        ]);
    }, []);

    const handleCreateInvoice = async (values) => {
        setLoading(true);
        try {
            const newInvoice = {
                id: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
                ...values,
                issueDate: values.issueDate.format('YYYY-MM-DD'),
                dueDate: values.dueDate.format('YYYY-MM-DD'),
                status: 'draft',
                quickbooksSync: false,
                emailSent: false,
                paidDate: null,
                paymentMethod: null
            };

            setInvoices(prev => [newInvoice, ...prev]);
            setCreateModal(false);
            form.resetFields();
            message.success('Invoice created successfully');
        } catch (error) {
            message.error('Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvoice = async (invoiceId) => {
        setLoading(true);
        try {
            setInvoices(prev => prev.map(inv => 
                inv.id === invoiceId 
                    ? { ...inv, emailSent: true, status: inv.status === 'draft' ? 'pending' : inv.status }
                    : inv
            ));
            message.success('Invoice sent successfully');
        } catch (error) {
            message.error('Failed to send invoice');
        } finally {
            setLoading(false);
        }
    };

    const handleSyncQuickBooks = async (invoiceId) => {
        setLoading(true);
        try {
            setInvoices(prev => prev.map(inv => 
                inv.id === invoiceId ? { ...inv, quickbooksSync: true } : inv
            ));
            message.success('Synced with QuickBooks successfully');
        } catch (error) {
            message.error('Failed to sync with QuickBooks');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (invoiceId) => {
        setLoading(true);
        try {
            setInvoices(prev => prev.map(inv => 
                inv.id === invoiceId 
                    ? { ...inv, status: 'paid', paidDate: dayjs().format('YYYY-MM-DD') }
                    : inv
            ));
            message.success('Invoice marked as paid');
        } catch (error) {
            message.error('Failed to update invoice');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'draft': 'default',
            'pending': 'processing',
            'paid': 'success',
            'overdue': 'error',
            'cancelled': 'default'
        };
        return colors[status] || 'default';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'draft': <EditOutlined />,
            'pending': <ClockCircleOutlined />,
            'paid': <CheckCircleOutlined />,
            'overdue': <ExclamationCircleOutlined />,
            'cancelled': <ExclamationCircleOutlined />
        };
        return icons[status] || <ClockCircleOutlined />;
    };

    const columns = [
        {
            title: 'Invoice #',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <Text strong>{id}</Text>
        },
        {
            title: 'Customer',
            key: 'customer',
            render: (record) => (
                <div>
                    <Text strong>{record.customerName}</Text>
                    <br />
                    <Text type="secondary">{record.customerEmail}</Text>
                </div>
            )
        },
        {
            title: 'Amount',
            dataIndex: 'total',
            key: 'total',
            render: (amount) => <Text strong>${amount.toLocaleString()}</Text>
        },
        {
            title: 'Issue Date',
            dataIndex: 'issueDate',
            key: 'issueDate'
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Sync Status',
            key: 'syncStatus',
            render: (record) => (
                <Space direction="vertical" size="small">
                    <Tag color={record.emailSent ? 'green' : 'default'}>
                        <MailOutlined /> {record.emailSent ? 'Sent' : 'Not Sent'}
                    </Tag>
                    <Tag color={record.quickbooksSync ? 'blue' : 'default'}>
                        <SyncOutlined /> {record.quickbooksSync ? 'Synced' : 'Not Synced'}
                    </Tag>
                </Space>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record) => (
                <Space>
                    <Button 
                        size="small" 
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedInvoice(record);
                            setDetailModal(true);
                        }}
                    />
                    <Button 
                        size="small" 
                        icon={<FilePdfOutlined />}
                        onClick={() => message.info('PDF download started')}
                    />
                    {!record.emailSent && (
                        <Button 
                            size="small" 
                            icon={<SendOutlined />}
                            onClick={() => handleSendInvoice(record.id)}
                        />
                    )}
                    {!record.quickbooksSync && (
                        <Button 
                            size="small" 
                            icon={<SyncOutlined />}
                            onClick={() => handleSyncQuickBooks(record.id)}
                        />
                    )}
                    {record.status === 'pending' && (
                        <Button 
                            size="small" 
                            type="primary"
                            onClick={() => handleMarkPaid(record.id)}
                        >
                            Mark Paid
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    const summaryStats = {
        totalInvoices: invoices.length,
        totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
        paidAmount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
        pendingAmount: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total, 0),
        overdueAmount: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0)
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>Invoicing & Reconciliation</Title>
                <Space>
                    <Button 
                        icon={<SettingOutlined />}
                        onClick={() => setSettingsModal(true)}
                    >
                        Settings
                    </Button>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => setCreateModal(true)}
                    >
                        Create Invoice
                    </Button>
                </Space>
            </div>

            {/* Summary Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                                {summaryStats.totalInvoices}
                            </Title>
                            <Text type="secondary">Total Invoices</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                                ${summaryStats.paidAmount.toLocaleString()}
                            </Title>
                            <Text type="secondary">Paid Amount</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#faad14' }}>
                                ${summaryStats.pendingAmount.toLocaleString()}
                            </Title>
                            <Text type="secondary">Pending Amount</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#ff4d4f' }}>
                                ${summaryStats.overdueAmount.toLocaleString()}
                            </Title>
                            <Text type="secondary">Overdue Amount</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Collection Rate Progress */}
            <Card style={{ marginBottom: '24px' }}>
                <Title level={4}>Collection Rate</Title>
                <Progress 
                    percent={Math.round((summaryStats.paidAmount / summaryStats.totalAmount) * 100)}
                    strokeColor="#52c41a"
                    format={(percent) => `${percent}% Collected`}
                />
                <div style={{ marginTop: '12px' }}>
                    <Text type="secondary">
                        ${summaryStats.paidAmount.toLocaleString()} of ${summaryStats.totalAmount.toLocaleString()} collected
                    </Text>
                </div>
            </Card>

            {/* Invoices Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={invoices}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} invoices`
                    }}
                />
            </Card>

            {/* Create Invoice Modal */}
            <Modal
                title="Create New Invoice"
                open={createModal}
                onCancel={() => setCreateModal(false)}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateInvoice}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="customerName"
                                label="Customer Name"
                                rules={[{ required: true, message: 'Please enter customer name' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="customerEmail"
                                label="Customer Email"
                                rules={[
                                    { required: true, message: 'Please enter email' },
                                    { type: 'email', message: 'Please enter valid email' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="customerAddress"
                        label="Customer Address"
                        rules={[{ required: true, message: 'Please enter address' }]}
                    >
                        <TextArea rows={2} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="issueDate"
                                label="Issue Date"
                                rules={[{ required: true, message: 'Please select issue date' }]}
                                initialValue={dayjs()}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="dueDate"
                                label="Due Date"
                                rules={[{ required: true, message: 'Please select due date' }]}
                                initialValue={dayjs().add(30, 'days')}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>Invoice Items</Divider>

                    <Form.List name="items" initialValue={[{}]}>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Row key={key} gutter={16} align="middle">
                                        <Col span={8}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'description']}
                                                label="Description"
                                                rules={[{ required: true, message: 'Please enter description' }]}
                                            >
                                                <Input placeholder="Item description" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'quantity']}
                                                label="Qty"
                                                rules={[{ required: true, message: 'Required' }]}
                                                initialValue={1}
                                            >
                                                <InputNumber min={1} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'price']}
                                                label="Price"
                                                rules={[{ required: true, message: 'Required' }]}
                                            >
                                                <InputNumber
                                                    min={0}
                                                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'total']}
                                                label="Total"
                                            >
                                                <InputNumber
                                                    disabled
                                                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={2}>
                                            <Button 
                                                type="text" 
                                                danger 
                                                icon={<DeleteOutlined />}
                                                onClick={() => remove(name)}
                                                style={{ marginTop: '30px' }}
                                            />
                                        </Col>
                                    </Row>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Add Item
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="subtotal"
                                label="Subtotal"
                            >
                                <InputNumber
                                    disabled
                                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="tax"
                                label="Tax"
                            >
                                <InputNumber
                                    min={0}
                                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="total"
                        label="Total Amount"
                    >
                        <InputNumber
                            disabled
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            style={{ width: '100%' }}
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <TextArea rows={3} placeholder="Additional notes or payment terms..." />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Create Invoice
                            </Button>
                            <Button onClick={() => setCreateModal(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Invoice Detail Modal */}
            <Modal
                title={`Invoice ${selectedInvoice?.id}`}
                open={detailModal}
                onCancel={() => setDetailModal(false)}
                footer={[
                    <Button key="pdf" icon={<FilePdfOutlined />}>
                        Download PDF
                    </Button>,
                    <Button key="send" icon={<SendOutlined />}>
                        Send Email
                    </Button>,
                    <Button key="close" onClick={() => setDetailModal(false)}>
                        Close
                    </Button>
                ]}
                width={800}
            >
                {selectedInvoice && (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Title level={4}>Bill To:</Title>
                                <Text strong>{selectedInvoice.customerName}</Text>
                                <br />
                                <Text>{selectedInvoice.customerEmail}</Text>
                                <br />
                                <Text>{selectedInvoice.customerAddress}</Text>
                            </Col>
                            <Col span={12}>
                                <Title level={4}>Invoice Details:</Title>
                                <Text>Issue Date: {selectedInvoice.issueDate}</Text>
                                <br />
                                <Text>Due Date: {selectedInvoice.dueDate}</Text>
                                <br />
                                <Text>Status: </Text>
                                <Tag color={getStatusColor(selectedInvoice.status)}>
                                    {selectedInvoice.status.toUpperCase()}
                                </Tag>
                            </Col>
                        </Row>

                        <Divider />

                        <Table
                            columns={[
                                { title: 'Description', dataIndex: 'description', key: 'description' },
                                { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 80 },
                                { title: 'Price', dataIndex: 'price', key: 'price', render: (price) => `$${price.toLocaleString()}` },
                                { title: 'Total', dataIndex: 'total', key: 'total', render: (total) => `$${total.toLocaleString()}` }
                            ]}
                            dataSource={selectedInvoice.items}
                            pagination={false}
                            size="small"
                        />

                        <div style={{ textAlign: 'right', marginTop: '16px' }}>
                            <Text>Subtotal: ${selectedInvoice.subtotal.toLocaleString()}</Text>
                            <br />
                            <Text>Tax: ${selectedInvoice.tax.toLocaleString()}</Text>
                            <br />
                            <Text strong style={{ fontSize: '16px' }}>
                                Total: ${selectedInvoice.total.toLocaleString()}
                            </Text>
                        </div>

                        {selectedInvoice.notes && (
                            <>
                                <Divider />
                                <Text strong>Notes:</Text>
                                <br />
                                <Text>{selectedInvoice.notes}</Text>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* Settings Modal */}
            <Modal
                title="Invoice Settings"
                open={settingsModal}
                onCancel={() => setSettingsModal(false)}
                footer={null}
                width={600}
            >
                <Tabs defaultActiveKey="general">
                    <TabPane tab="General" key="general">
                        <Form
                            settingsForm={settingsForm}
                            layout="vertical"
                        >
                            <Form.Item
                                name="companyName"
                                label="Company Name"
                                initialValue="WatchDealerHub"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="companyAddress"
                                label="Company Address"
                                initialValue="123 Business St, New York, NY 10001"
                            >
                                <TextArea rows={3} />
                            </Form.Item>

                            <Form.Item
                                name="taxRate"
                                label="Default Tax Rate (%)"
                                initialValue={8}
                            >
                                <InputNumber min={0} max={100} style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item
                                name="paymentTerms"
                                label="Default Payment Terms (Days)"
                                initialValue={30}
                            >
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Form>
                    </TabPane>

                    <TabPane tab="QuickBooks" key="quickbooks">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div>
                                <Text strong>QuickBooks Integration</Text>
                                <br />
                                <Text type="secondary">Connect your QuickBooks account to sync invoices automatically</Text>
                            </div>

                            <Form layout="vertical">
                                <Form.Item
                                    name="quickbooksEnabled"
                                    label="Enable QuickBooks Sync"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch />
                                </Form.Item>

                                <Form.Item
                                    name="autoSync"
                                    label="Auto-sync new invoices"
                                    valuePropName="checked"
                                    initialValue={true}
                                >
                                    <Switch />
                                </Form.Item>

                                <Button type="primary" icon={<SyncOutlined />}>
                                    Connect QuickBooks
                                </Button>
                            </Form>
                        </Space>
                    </TabPane>

                    <TabPane tab="Email" key="email">
                        <Form layout="vertical">
                            <Form.Item
                                name="emailTemplate"
                                label="Email Template"
                                initialValue="Dear {customerName},\n\nPlease find attached your invoice #{invoiceId}.\n\nThank you for your business!"
                            >
                                <TextArea rows={6} />
                            </Form.Item>

                            <Form.Item
                                name="autoSendEmail"
                                label="Auto-send email when invoice is created"
                                valuePropName="checked"
                                initialValue={false}
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item
                                name="reminderEmails"
                                label="Send payment reminder emails"
                                valuePropName="checked"
                                initialValue={true}
                            >
                                <Switch />
                            </Form.Item>
                        </Form>
                    </TabPane>
                </Tabs>

                <div style={{ textAlign: 'right', marginTop: '24px' }}>
                    <Space>
                        <Button onClick={() => setSettingsModal(false)}>
                            Cancel
                        </Button>
                        <Button type="primary">
                            Save Settings
                        </Button>
                    </Space>
                </div>
            </Modal>
        </div>
    );
};

export default EnhancedInvoicing;

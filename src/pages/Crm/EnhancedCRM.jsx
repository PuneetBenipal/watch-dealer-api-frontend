import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, Space, Typography, Row, Col, Avatar, Tabs, Divider, Timeline, Descriptions, Upload, message } from 'antd';
import { 
    PlusOutlined, 
    UserOutlined, 
    TeamOutlined, 
    PhoneOutlined, 
    MailOutlined, 
    EditOutlined, 
    DeleteOutlined,
    EyeOutlined,
    MessageOutlined,
    CalendarOutlined,
    DollarOutlined,
    ShopOutlined,
    StarOutlined,
    UploadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const EnhancedCRM = () => {
    const [customers, setCustomers] = useState([]);
    const [dealers, setDealers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [contactType, setContactType] = useState('customer');
    const [form] = Form.useForm();

    useEffect(() => {
        // Mock data for customers
        setCustomers([
            {
                id: 'cust_1',
                name: 'John Smith',
                email: 'john.smith@email.com',
                phone: '+1 (555) 123-4567',
                company: 'Smith Investments',
                type: 'VIP',
                status: 'active',
                totalPurchases: 45000,
                lastContact: '2024-01-22',
                preferredBrands: ['Rolex', 'Patek Philippe'],
                notes: 'Prefers vintage pieces, high-value customer',
                avatar: null,
                transactions: [
                    { date: '2024-01-15', item: 'Rolex Submariner', amount: 8500, type: 'purchase' },
                    { date: '2024-01-10', item: 'Omega Speedmaster', amount: 3200, type: 'inquiry' }
                ]
            },
            {
                id: 'cust_2',
                name: 'Sarah Johnson',
                email: 'sarah.j@company.com',
                phone: '+1 (555) 987-6543',
                company: 'Tech Solutions Inc',
                type: 'Regular',
                status: 'active',
                totalPurchases: 12000,
                lastContact: '2024-01-20',
                preferredBrands: ['Omega', 'Tudor'],
                notes: 'Corporate buyer, bulk purchases',
                avatar: null,
                transactions: [
                    { date: '2024-01-18', item: 'Tudor Black Bay', amount: 2800, type: 'purchase' }
                ]
            }
        ]);

        // Mock data for dealers
        setDealers([
            {
                id: 'dealer_1',
                name: 'Premium Watches Ltd',
                contactPerson: 'Michael Brown',
                email: 'michael@premiumwatches.com',
                phone: '+1 (555) 456-7890',
                location: 'New York, NY',
                type: 'Authorized Dealer',
                status: 'active',
                rating: 4.8,
                totalDeals: 25,
                lastContact: '2024-01-21',
                specialties: ['Luxury Watches', 'Vintage Pieces'],
                notes: 'Reliable partner, quick payments',
                avatar: null,
                transactions: [
                    { date: '2024-01-19', item: 'Patek Philippe Calatrava', amount: 25000, type: 'sale' },
                    { date: '2024-01-12', item: 'Rolex GMT-Master', amount: 12000, type: 'purchase' }
                ]
            },
            {
                id: 'dealer_2',
                name: 'TimeKeepers Inc',
                contactPerson: 'Lisa Chen',
                email: 'lisa@timekeepers.com',
                phone: '+1 (555) 321-0987',
                location: 'Los Angeles, CA',
                type: 'Independent Retailer',
                status: 'active',
                rating: 4.5,
                totalDeals: 18,
                lastContact: '2024-01-19',
                specialties: ['Sports Watches', 'Modern Pieces'],
                notes: 'Growing partnership, good communication',
                avatar: null,
                transactions: [
                    { date: '2024-01-16', item: 'Omega Seamaster', amount: 4200, type: 'sale' }
                ]
            }
        ]);
    }, []);

    const handleCreateContact = async (values) => {
        setLoading(true);
        try {
            const newContact = {
                id: `${contactType}_${Date.now()}`,
                ...values,
                status: 'active',
                totalPurchases: 0,
                totalDeals: 0,
                lastContact: new Date().toISOString().split('T')[0],
                transactions: []
            };

            if (contactType === 'customer') {
                setCustomers(prev => [newContact, ...prev]);
            } else {
                setDealers(prev => [newContact, ...prev]);
            }

            setCreateModal(false);
            form.resetFields();
            message.success(`${contactType === 'customer' ? 'Customer' : 'Dealer'} added successfully`);
        } catch (error) {
            message.error('Failed to add contact');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteContact = (id, type) => {
        if (type === 'customer') {
            setCustomers(prev => prev.filter(c => c.id !== id));
        } else {
            setDealers(prev => prev.filter(d => d.id !== id));
        }
        message.success('Contact deleted successfully');
    };

    const getStatusColor = (status) => {
        const colors = {
            'active': 'green',
            'inactive': 'red',
            'pending': 'orange',
            'blocked': 'gray'
        };
        return colors[status] || 'default';
    };

    const getTypeColor = (type) => {
        const colors = {
            'VIP': 'gold',
            'Regular': 'blue',
            'New': 'green',
            'Authorized Dealer': 'purple',
            'Independent Retailer': 'cyan',
            'Wholesale': 'orange'
        };
        return colors[type] || 'default';
    };

    const customerColumns = [
        {
            title: 'Customer',
            key: 'customer',
            render: (record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar size={40} icon={<UserOutlined />} />
                    <div>
                        <Text strong>{record.name}</Text>
                        <br />
                        <Text type="secondary">{record.email}</Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Company',
            dataIndex: 'company',
            key: 'company'
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color={getTypeColor(type)}>{type}</Tag>
        },
        {
            title: 'Total Purchases',
            dataIndex: 'totalPurchases',
            key: 'totalPurchases',
            render: (amount) => <Text strong>${amount.toLocaleString()}</Text>
        },
        {
            title: 'Last Contact',
            dataIndex: 'lastContact',
            key: 'lastContact'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
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
                            setSelectedContact(record);
                            setDetailModal(true);
                        }}
                    />
                    <Button size="small" icon={<MessageOutlined />} />
                    <Button size="small" icon={<EditOutlined />} />
                    <Button 
                        size="small" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteContact(record.id, 'customer')}
                    />
                </Space>
            )
        }
    ];

    const dealerColumns = [
        {
            title: 'Dealer',
            key: 'dealer',
            render: (record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar size={40} icon={<ShopOutlined />} />
                    <div>
                        <Text strong>{record.name}</Text>
                        <br />
                        <Text type="secondary">{record.contactPerson}</Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location'
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color={getTypeColor(type)}>{type}</Tag>
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => (
                <div>
                    <StarOutlined style={{ color: '#faad14' }} />
                    <Text style={{ marginLeft: '4px' }}>{rating}</Text>
                </div>
            )
        },
        {
            title: 'Total Deals',
            dataIndex: 'totalDeals',
            key: 'totalDeals'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
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
                            setSelectedContact(record);
                            setDetailModal(true);
                        }}
                    />
                    <Button size="small" icon={<MessageOutlined />} />
                    <Button size="small" icon={<EditOutlined />} />
                    <Button 
                        size="small" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteContact(record.id, 'dealer')}
                    />
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>CRM & Contacts</Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModal(true)}
                >
                    Add Contact
                </Button>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>{customers.length}</Title>
                            <Text type="secondary">Total Customers</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#52c41a' }}>{dealers.length}</Title>
                            <Text type="secondary">Active Dealers</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#faad14' }}>
                                ${customers.reduce((sum, c) => sum + c.totalPurchases, 0).toLocaleString()}
                            </Title>
                            <Text type="secondary">Total Revenue</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#722ed1' }}>
                                {dealers.reduce((sum, d) => sum + d.totalDeals, 0)}
                            </Title>
                            <Text type="secondary">Total Deals</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Tabs defaultActiveKey="customers">
                <TabPane tab={`Customers (${customers.length})`} key="customers">
                    <Card>
                        <Table
                            columns={customerColumns}
                            dataSource={customers}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                            }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab={`Dealers (${dealers.length})`} key="dealers">
                    <Card>
                        <Table
                            columns={dealerColumns}
                            dataSource={dealers}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                            }}
                        />
                    </Card>
                </TabPane>
            </Tabs>

            {/* Create Contact Modal */}
            <Modal
                title="Add New Contact"
                open={createModal}
                onCancel={() => setCreateModal(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateContact}
                >
                    <Form.Item
                        name="contactType"
                        label="Contact Type"
                        rules={[{ required: true, message: 'Please select contact type' }]}
                        initialValue="customer"
                    >
                        <Select onChange={setContactType}>
                            <Option value="customer">Customer</Option>
                            <Option value="dealer">Dealer</Option>
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label={contactType === 'customer' ? 'Customer Name' : 'Company Name'}
                                rules={[{ required: true, message: 'Please enter name' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            {contactType === 'dealer' && (
                                <Form.Item
                                    name="contactPerson"
                                    label="Contact Person"
                                    rules={[{ required: true, message: 'Please enter contact person' }]}
                                >
                                    <Input />
                                </Form.Item>
                            )}
                            {contactType === 'customer' && (
                                <Form.Item
                                    name="company"
                                    label="Company"
                                >
                                    <Input />
                                </Form.Item>
                            )}
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please enter email' },
                                    { type: 'email', message: 'Please enter valid email' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label="Phone"
                                rules={[{ required: true, message: 'Please enter phone' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="Type"
                                rules={[{ required: true, message: 'Please select type' }]}
                            >
                                <Select>
                                    {contactType === 'customer' ? (
                                        <>
                                            <Option value="VIP">VIP</Option>
                                            <Option value="Regular">Regular</Option>
                                            <Option value="New">New</Option>
                                        </>
                                    ) : (
                                        <>
                                            <Option value="Authorized Dealer">Authorized Dealer</Option>
                                            <Option value="Independent Retailer">Independent Retailer</Option>
                                            <Option value="Wholesale">Wholesale</Option>
                                        </>
                                    )}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            {contactType === 'dealer' && (
                                <Form.Item
                                    name="location"
                                    label="Location"
                                >
                                    <Input placeholder="City, State/Country" />
                                </Form.Item>
                            )}
                        </Col>
                    </Row>

                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <TextArea rows={3} placeholder="Additional notes..." />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Add Contact
                            </Button>
                            <Button onClick={() => setCreateModal(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Contact Detail Modal */}
            <Modal
                title={selectedContact?.name || 'Contact Details'}
                open={detailModal}
                onCancel={() => setDetailModal(false)}
                footer={null}
                width={800}
            >
                {selectedContact && (
                    <div>
                        <Row gutter={16}>
                            <Col span={16}>
                                <Descriptions bordered column={2}>
                                    <Descriptions.Item label="Name">
                                        {selectedContact.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">
                                        {selectedContact.email}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Phone">
                                        {selectedContact.phone}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Type">
                                        <Tag color={getTypeColor(selectedContact.type)}>
                                            {selectedContact.type}
                                        </Tag>
                                    </Descriptions.Item>
                                    {selectedContact.company && (
                                        <Descriptions.Item label="Company">
                                            {selectedContact.company}
                                        </Descriptions.Item>
                                    )}
                                    {selectedContact.location && (
                                        <Descriptions.Item label="Location">
                                            {selectedContact.location}
                                        </Descriptions.Item>
                                    )}
                                    <Descriptions.Item label="Status">
                                        <Tag color={getStatusColor(selectedContact.status)}>
                                            {selectedContact.status.toUpperCase()}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Last Contact">
                                        {selectedContact.lastContact}
                                    </Descriptions.Item>
                                </Descriptions>

                                {selectedContact.notes && (
                                    <>
                                        <Divider>Notes</Divider>
                                        <Text>{selectedContact.notes}</Text>
                                    </>
                                )}

                                <Divider>Transaction History</Divider>
                                <Timeline>
                                    {selectedContact.transactions?.map((transaction, index) => (
                                        <Timeline.Item 
                                            key={index}
                                            color={transaction.type === 'purchase' ? 'green' : 'blue'}
                                        >
                                            <div>
                                                <Text strong>{transaction.item}</Text>
                                                <br />
                                                <Text>${transaction.amount.toLocaleString()}</Text>
                                                <br />
                                                <Text type="secondary">{transaction.date}</Text>
                                            </div>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            </Col>

                            <Col span={8}>
                                <Card title="Quick Actions" size="small">
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Button block icon={<MessageOutlined />}>
                                            Send Message
                                        </Button>
                                        <Button block icon={<PhoneOutlined />}>
                                            Call Contact
                                        </Button>
                                        <Button block icon={<MailOutlined />}>
                                            Send Email
                                        </Button>
                                        <Button block icon={<CalendarOutlined />}>
                                            Schedule Meeting
                                        </Button>
                                        <Button block icon={<EditOutlined />}>
                                            Edit Contact
                                        </Button>
                                    </Space>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EnhancedCRM;

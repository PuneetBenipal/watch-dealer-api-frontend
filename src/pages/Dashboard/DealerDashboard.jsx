import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Progress, Tag, List, Avatar, Typography, Space, Alert, Timeline, Divider } from 'antd';
import { 
    DollarOutlined, 
    ShoppingOutlined, 
    MessageOutlined, 
    FileTextOutlined,
    RiseOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    EyeOutlined,
    PlusOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const DealerDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState({});

    useEffect(() => {
        // Mock dashboard data
        setDashboardData({
            stats: {
                totalRevenue: 156780,
                revenueChange: 12.5,
                totalListings: 247,
                listingsChange: -3.2,
                activeInvoices: 18,
                invoicesChange: 8.1,
                whatsappMessages: 342,
                messagesChange: 15.7
            },
            recentListings: [
                { id: 1, model: 'Rolex Submariner 116610LN', price: 8500, status: 'active', views: 45 },
                { id: 2, model: 'Omega Speedmaster Professional', price: 3200, status: 'sold', views: 32 },
                { id: 3, model: 'Patek Philippe Calatrava', price: 25000, status: 'pending', views: 67 },
                { id: 4, model: 'Tudor Black Bay 58', price: 2800, status: 'active', views: 28 }
            ],
            recentInvoices: [
                { id: 'INV-001', client: 'John Smith', amount: 8500, status: 'paid', date: '2024-01-22' },
                { id: 'INV-002', client: 'Sarah Johnson', amount: 3200, status: 'pending', date: '2024-01-21' },
                { id: 'INV-003', client: 'Michael Brown', amount: 25000, status: 'overdue', date: '2024-01-15' }
            ],
            alerts: [
                { type: 'warning', message: 'Low inventory alert: Only 3 Rolex models remaining', time: '2 hours ago' },
                { type: 'info', message: 'New WhatsApp message from Premium Watches Ltd', time: '4 hours ago' },
                { type: 'success', message: 'Invoice INV-001 has been paid', time: '1 day ago' }
            ],
            activities: [
                { action: 'Listed new watch', details: 'Rolex GMT-Master II', time: '2 hours ago', type: 'listing' },
                { action: 'Received payment', details: 'Invoice INV-001 - $8,500', time: '4 hours ago', type: 'payment' },
                { action: 'WhatsApp inquiry', details: 'Interest in Patek Philippe', time: '6 hours ago', type: 'message' },
                { action: 'Updated inventory', details: 'Bulk upload - 12 watches', time: '1 day ago', type: 'inventory' }
            ]
        });
    }, []);

    const getStatusColor = (status) => {
        const colors = {
            'active': 'green',
            'sold': 'blue',
            'pending': 'orange',
            'paid': 'green',
            'overdue': 'red'
        };
        return colors[status] || 'default';
    };

    const getActivityIcon = (type) => {
        const icons = {
            'listing': <ShoppingOutlined />,
            'payment': <DollarOutlined />,
            'message': <MessageOutlined />,
            'inventory': <FileTextOutlined />
        };
        return icons[type] || <ClockCircleOutlined />;
    };

    const listingColumns = [
        {
            title: 'Watch Model',
            dataIndex: 'model',
            key: 'model',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <Text>${price.toLocaleString()}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
        },
        {
            title: 'Views',
            dataIndex: 'views',
            key: 'views'
        }
    ];

    const invoiceColumns = [
        {
            title: 'Invoice ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Client',
            dataIndex: 'client',
            key: 'client'
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => <Text>${amount.toLocaleString()}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
        }
    ];

    return (
        <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ marginBottom: '24px' }}>
                <Title level={2}>Dashboard</Title>
                <Text type="secondary">Welcome back! Here's what's happening with your business today.</Text>
            </div>

            {/* Key Metrics */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={dashboardData.stats?.totalRevenue}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarOutlined />}
                            suffix={
                                <span style={{ fontSize: '14px', color: dashboardData.stats?.revenueChange > 0 ? '#3f8600' : '#cf1322' }}>
                                    {dashboardData.stats?.revenueChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                    {Math.abs(dashboardData.stats?.revenueChange || 0)}%
                                </span>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Listings"
                            value={dashboardData.stats?.totalListings}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<RiseOutlined />}
                            suffix={
                                <span style={{ fontSize: '14px', color: dashboardData.stats?.listingsChange > 0 ? '#3f8600' : '#cf1322' }}>
                                    {dashboardData.stats?.listingsChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                    {Math.abs(dashboardData.stats?.listingsChange || 0)}%
                                </span>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Pending Invoices"
                            value={dashboardData.stats?.activeInvoices}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<FileTextOutlined />}
                            suffix={
                                <span style={{ fontSize: '14px', color: dashboardData.stats?.invoicesChange > 0 ? '#3f8600' : '#cf1322' }}>
                                    {dashboardData.stats?.invoicesChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                    {Math.abs(dashboardData.stats?.invoicesChange || 0)}%
                                </span>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="WhatsApp Messages"
                            value={dashboardData.stats?.whatsappMessages}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<MessageOutlined />}
                            suffix={
                                <span style={{ fontSize: '14px', color: dashboardData.stats?.messagesChange > 0 ? '#3f8600' : '#cf1322' }}>
                                    {dashboardData.stats?.messagesChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                    {Math.abs(dashboardData.stats?.messagesChange || 0)}%
                                </span>
                            }
                        />
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Card style={{ marginBottom: '24px' }}>
                <Title level={4}>Quick Actions</Title>
                <Space wrap>
                    <Link to="/inventory/add">
                        <Button type="primary" icon={<PlusOutlined />}>Add New Watch</Button>
                    </Link>
                    <Link to="/invoices/create">
                        <Button icon={<FileTextOutlined />}>Create Invoice</Button>
                    </Link>
                    <Link to="/whatsapp">
                        <Button icon={<MessageOutlined />}>Check WhatsApp</Button>
                    </Link>
                    <Link to="/reports/sales">
                        <Button icon={<RiseOutlined />}>View Reports</Button>
                    </Link>
                </Space>
            </Card>

            <Row gutter={[16, 16]}>
                {/* Recent Listings */}
                <Col xs={24} lg={12}>
                    <Card 
                        title="Recent Listings" 
                        extra={<Link to="/inventory"><Button type="link">View All</Button></Link>}
                    >
                        <Table
                            columns={listingColumns}
                            dataSource={dashboardData.recentListings}
                            pagination={false}
                            size="small"
                            rowKey="id"
                        />
                    </Card>
                </Col>

                {/* Recent Invoices */}
                <Col xs={24} lg={12}>
                    <Card 
                        title="Recent Invoices" 
                        extra={<Link to="/invoices"><Button type="link">View All</Button></Link>}
                    >
                        <Table
                            columns={invoiceColumns}
                            dataSource={dashboardData.recentInvoices}
                            pagination={false}
                            size="small"
                            rowKey="id"
                        />
                    </Card>
                </Col>

                {/* Alerts & Notifications */}
                <Col xs={24} lg={12}>
                    <Card title="Alerts & Notifications">
                        <List
                            dataSource={dashboardData.alerts}
                            renderItem={item => (
                                <List.Item>
                                    <Alert
                                        message={item.message}
                                        type={item.type}
                                        showIcon
                                        style={{ width: '100%' }}
                                        description={<Text type="secondary">{item.time}</Text>}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* Recent Activity */}
                <Col xs={24} lg={12}>
                    <Card title="Recent Activity">
                        <Timeline>
                            {dashboardData.activities?.map((activity, index) => (
                                <Timeline.Item key={index} dot={getActivityIcon(activity.type)}>
                                    <div>
                                        <Text strong>{activity.action}</Text>
                                        <br />
                                        <Text type="secondary">{activity.details}</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>{activity.time}</Text>
                                    </div>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </Card>
                </Col>
            </Row>

            {/* Performance Overview */}
            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24} lg={8}>
                    <Card title="Inventory Performance">
                        <div style={{ marginBottom: '16px' }}>
                            <Text>Active Listings</Text>
                            <Progress percent={78} strokeColor="#52c41a" />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <Text>Sold This Month</Text>
                            <Progress percent={65} strokeColor="#1890ff" />
                        </div>
                        <div>
                            <Text>Conversion Rate</Text>
                            <Progress percent={23} strokeColor="#faad14" />
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Financial Overview">
                        <div style={{ marginBottom: '16px' }}>
                            <Text>Revenue Target</Text>
                            <Progress percent={82} strokeColor="#52c41a" />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <Text>Outstanding Invoices</Text>
                            <Progress percent={34} strokeColor="#faad14" />
                        </div>
                        <div>
                            <Text>Profit Margin</Text>
                            <Progress percent={67} strokeColor="#1890ff" />
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Customer Engagement">
                        <div style={{ marginBottom: '16px' }}>
                            <Text>WhatsApp Response Rate</Text>
                            <Progress percent={94} strokeColor="#52c41a" />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <Text>Customer Satisfaction</Text>
                            <Progress percent={88} strokeColor="#1890ff" />
                        </div>
                        <div>
                            <Text>Repeat Customers</Text>
                            <Progress percent={45} strokeColor="#722ed1" />
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DealerDashboard;

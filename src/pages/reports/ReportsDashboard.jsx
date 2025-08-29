import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Select, DatePicker, Button, Table, Space, Tag, Tabs, Statistic, Progress, Divider } from 'antd';
import { 
    DollarOutlined, 
    RiseOutlined, 
    ShoppingOutlined, 
    ClockCircleOutlined,
    DownloadOutlined,
    PrinterOutlined,
    BarChartOutlined,
    PieChartOutlined,
    LineChartOutlined,
    FileExcelOutlined
} from '@ant-design/icons';
// Charts will be implemented with basic components for now
// import { Line, Bar, Pie, Column } from '@ant-design/plots';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ReportsDashboard = () => {
    const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
    const [reportType, setReportType] = useState('sales');
    const [loading, setLoading] = useState(false);

    // Mock data for reports
    const salesData = [
        { month: '2024-01', revenue: 45000, transactions: 12, avgValue: 3750 },
        { month: '2024-02', revenue: 52000, transactions: 15, avgValue: 3467 },
        { month: '2024-03', revenue: 38000, transactions: 10, avgValue: 3800 },
        { month: '2024-04', revenue: 61000, transactions: 18, avgValue: 3389 },
        { month: '2024-05', revenue: 48000, transactions: 14, avgValue: 3429 },
        { month: '2024-06', revenue: 55000, transactions: 16, avgValue: 3438 }
    ];

    const inventoryAging = [
        { category: '0-30 days', count: 45, value: 180000, percentage: 60 },
        { category: '31-60 days', count: 20, value: 95000, percentage: 27 },
        { category: '61-90 days', count: 8, value: 32000, percentage: 10 },
        { category: '90+ days', count: 3, value: 18000, percentage: 3 }
    ];

    const profitLossData = [
        { category: 'Revenue', amount: 315000, type: 'income' },
        { category: 'Cost of Goods Sold', amount: -189000, type: 'expense' },
        { category: 'Gross Profit', amount: 126000, type: 'profit' },
        { category: 'Operating Expenses', amount: -45000, type: 'expense' },
        { category: 'Marketing', amount: -12000, type: 'expense' },
        { category: 'Insurance', amount: -8000, type: 'expense' },
        { category: 'Net Profit', amount: 61000, type: 'profit' }
    ];

    const topProducts = [
        { brand: 'Rolex', model: 'Submariner', sales: 8, revenue: 68000, margin: '28%' },
        { brand: 'Omega', model: 'Speedmaster', sales: 12, revenue: 38400, margin: '22%' },
        { brand: 'Patek Philippe', model: 'Calatrava', sales: 3, revenue: 75000, margin: '35%' },
        { brand: 'Tudor', model: 'Black Bay', sales: 15, revenue: 42000, margin: '25%' },
        { brand: 'Cartier', model: 'Santos', sales: 6, revenue: 30000, margin: '20%' }
    ];

    const customerSegments = [
        { segment: 'VIP Customers', count: 25, revenue: 180000, avgSpend: 7200 },
        { segment: 'Regular Customers', count: 85, revenue: 102000, avgSpend: 1200 },
        { segment: 'New Customers', count: 45, revenue: 33000, avgSpend: 733 }
    ];

    // Chart placeholder components
    const ChartPlaceholder = ({ title, height = 300 }) => (
        <div style={{ 
            height, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: '#fafafa', 
            border: '1px dashed #d9d9d9',
            borderRadius: '6px'
        }}>
            <div style={{ textAlign: 'center', color: '#999' }}>
                <BarChartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>{title} Chart</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                    Install @ant-design/plots for interactive charts
                </div>
            </div>
        </div>
    );

    const handleExportReport = (format) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            // Mock export functionality
            console.log(`Exporting ${reportType} report as ${format}`);
        }, 1000);
    };

    const summaryStats = {
        totalRevenue: salesData.reduce((sum, item) => sum + item.revenue, 0),
        totalTransactions: salesData.reduce((sum, item) => sum + item.transactions, 0),
        avgTransactionValue: salesData.reduce((sum, item) => sum + item.avgValue, 0) / salesData.length,
        inventoryValue: inventoryAging.reduce((sum, item) => sum + item.value, 0),
        netProfit: profitLossData.find(item => item.category === 'Net Profit')?.amount || 0,
        profitMargin: 19.4 // Calculated percentage
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>Reports & Analytics</Title>
                <Space>
                    <Select
                        value={reportType}
                        onChange={setReportType}
                        style={{ width: 150 }}
                    >
                        <Option value="sales">Sales Report</Option>
                        <Option value="inventory">Inventory Aging</Option>
                        <Option value="profit">P&L Report</Option>
                        <Option value="customer">Customer Analysis</Option>
                    </Select>
                    <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        style={{ width: 250 }}
                    />
                    <Button icon={<FileExcelOutlined />} onClick={() => handleExportReport('excel')}>
                        Export Excel
                    </Button>
                    <Button icon={<DownloadOutlined />} onClick={() => handleExportReport('pdf')}>
                        Export PDF
                    </Button>
                </Space>
            </div>

            {/* Summary Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={summaryStats.totalRevenue}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarOutlined />}
                            suffix="USD"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Transactions"
                            value={summaryStats.totalTransactions}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Avg Transaction"
                            value={summaryStats.avgTransactionValue}
                            precision={0}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Net Profit"
                            value={summaryStats.netProfit}
                            precision={0}
                            valueStyle={{ color: summaryStats.netProfit > 0 ? '#3f8600' : '#cf1322' }}
                            prefix={<RiseOutlined />}
                            suffix="USD"
                        />
                    </Card>
                </Col>
            </Row>

            <Tabs defaultActiveKey="overview">
                <TabPane tab="Overview" key="overview">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={16}>
                            <Card title="Revenue Trend" extra={<LineChartOutlined />}>
                                <ChartPlaceholder title="Revenue Trend" height={300} />
                            </Card>
                        </Col>
                        <Col xs={24} lg={8}>
                            <Card title="Profit Margin">
                                <div style={{ textAlign: 'center' }}>
                                    <Progress
                                        type="circle"
                                        percent={summaryStats.profitMargin}
                                        format={(percent) => `${percent}%`}
                                        strokeColor="#52c41a"
                                        size={120}
                                    />
                                    <div style={{ marginTop: '16px' }}>
                                        <Text type="secondary">Current profit margin</Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                        <Col xs={24} lg={12}>
                            <Card title="Top Performing Products" extra={<BarChartOutlined />}>
                                <Table
                                    dataSource={topProducts}
                                    pagination={false}
                                    size="small"
                                    columns={[
                                        {
                                            title: 'Product',
                                            key: 'product',
                                            render: (record) => `${record.brand} ${record.model}`
                                        },
                                        {
                                            title: 'Sales',
                                            dataIndex: 'sales',
                                            key: 'sales'
                                        },
                                        {
                                            title: 'Revenue',
                                            dataIndex: 'revenue',
                                            key: 'revenue',
                                            render: (value) => `$${value.toLocaleString()}`
                                        },
                                        {
                                            title: 'Margin',
                                            dataIndex: 'margin',
                                            key: 'margin',
                                            render: (margin) => <Tag color="green">{margin}</Tag>
                                        }
                                    ]}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card title="Customer Segments" extra={<PieChartOutlined />}>
                                <Table
                                    dataSource={customerSegments}
                                    pagination={false}
                                    size="small"
                                    columns={[
                                        {
                                            title: 'Segment',
                                            dataIndex: 'segment',
                                            key: 'segment'
                                        },
                                        {
                                            title: 'Count',
                                            dataIndex: 'count',
                                            key: 'count'
                                        },
                                        {
                                            title: 'Revenue',
                                            dataIndex: 'revenue',
                                            key: 'revenue',
                                            render: (value) => `$${value.toLocaleString()}`
                                        },
                                        {
                                            title: 'Avg Spend',
                                            dataIndex: 'avgSpend',
                                            key: 'avgSpend',
                                            render: (value) => `$${value.toLocaleString()}`
                                        }
                                    ]}
                                />
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                <TabPane tab="Sales Analysis" key="sales">
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card title="Monthly Sales Performance">
                                <Table
                                    dataSource={salesData}
                                    columns={[
                                        {
                                            title: 'Month',
                                            dataIndex: 'month',
                                            key: 'month',
                                            render: (month) => dayjs(month).format('MMMM YYYY')
                                        },
                                        {
                                            title: 'Revenue',
                                            dataIndex: 'revenue',
                                            key: 'revenue',
                                            render: (value) => `$${value.toLocaleString()}`,
                                            sorter: (a, b) => a.revenue - b.revenue
                                        },
                                        {
                                            title: 'Transactions',
                                            dataIndex: 'transactions',
                                            key: 'transactions',
                                            sorter: (a, b) => a.transactions - b.transactions
                                        },
                                        {
                                            title: 'Avg Value',
                                            dataIndex: 'avgValue',
                                            key: 'avgValue',
                                            render: (value) => `$${value.toLocaleString()}`,
                                            sorter: (a, b) => a.avgValue - b.avgValue
                                        },
                                        {
                                            title: 'Growth',
                                            key: 'growth',
                                            render: (record, _, index) => {
                                                if (index === 0) return '-';
                                                const prevRevenue = salesData[index - 1]?.revenue || 0;
                                                const growth = ((record.revenue - prevRevenue) / prevRevenue * 100).toFixed(1);
                                                return (
                                                    <Tag color={growth > 0 ? 'green' : 'red'}>
                                                        {growth > 0 ? '+' : ''}{growth}%
                                                    </Tag>
                                                );
                                            }
                                        }
                                    ]}
                                    pagination={false}
                                />
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                <TabPane tab="Inventory Aging" key="inventory">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <Card title="Inventory Age Distribution">
                                <ChartPlaceholder title="Inventory Age Distribution" height={300} />
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card title="Aging Details">
                                <Table
                                    dataSource={inventoryAging}
                                    pagination={false}
                                    columns={[
                                        {
                                            title: 'Age Category',
                                            dataIndex: 'category',
                                            key: 'category'
                                        },
                                        {
                                            title: 'Count',
                                            dataIndex: 'count',
                                            key: 'count'
                                        },
                                        {
                                            title: 'Value',
                                            dataIndex: 'value',
                                            key: 'value',
                                            render: (value) => `$${value.toLocaleString()}`
                                        },
                                        {
                                            title: 'Percentage',
                                            dataIndex: 'percentage',
                                            key: 'percentage',
                                            render: (percentage) => (
                                                <div>
                                                    <Progress 
                                                        percent={percentage} 
                                                        size="small" 
                                                        strokeColor={
                                                            percentage > 50 ? '#52c41a' : 
                                                            percentage > 20 ? '#faad14' : '#ff4d4f'
                                                        }
                                                    />
                                                </div>
                                            )
                                        }
                                    ]}
                                />
                                <Divider />
                                <div>
                                    <Text strong>Total Inventory Value: </Text>
                                    <Text>${summaryStats.inventoryValue.toLocaleString()}</Text>
                                </div>
                                <div style={{ marginTop: '8px' }}>
                                    <Text type="secondary">
                                        Items over 90 days old should be reviewed for pricing adjustments
                                    </Text>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                <TabPane tab="P&L Statement" key="profit">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={16}>
                            <Card title="Profit & Loss Breakdown">
                                <Table
                                    dataSource={profitLossData}
                                    pagination={false}
                                    columns={[
                                        {
                                            title: 'Category',
                                            dataIndex: 'category',
                                            key: 'category'
                                        },
                                        {
                                            title: 'Amount',
                                            dataIndex: 'amount',
                                            key: 'amount',
                                            render: (amount, record) => (
                                                <Text 
                                                    style={{ 
                                                        color: record.type === 'income' || record.type === 'profit' ? '#52c41a' : '#ff4d4f',
                                                        fontWeight: record.type === 'profit' ? 'bold' : 'normal'
                                                    }}
                                                >
                                                    ${Math.abs(amount).toLocaleString()}
                                                </Text>
                                            )
                                        },
                                        {
                                            title: 'Type',
                                            dataIndex: 'type',
                                            key: 'type',
                                            render: (type) => (
                                                <Tag color={
                                                    type === 'income' ? 'green' : 
                                                    type === 'profit' ? 'blue' : 'red'
                                                }>
                                                    {type.toUpperCase()}
                                                </Tag>
                                            )
                                        }
                                    ]}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} lg={8}>
                            <Card title="Key Metrics">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <div>
                                        <Text strong>Gross Profit Margin</Text>
                                        <br />
                                        <Text style={{ fontSize: '24px', color: '#52c41a' }}>40.0%</Text>
                                    </div>
                                    <Divider />
                                    <div>
                                        <Text strong>Net Profit Margin</Text>
                                        <br />
                                        <Text style={{ fontSize: '24px', color: '#52c41a' }}>19.4%</Text>
                                    </div>
                                    <Divider />
                                    <div>
                                        <Text strong>Operating Ratio</Text>
                                        <br />
                                        <Text style={{ fontSize: '24px', color: '#1890ff' }}>14.3%</Text>
                                    </div>
                                    <Divider />
                                    <div>
                                        <Text type="secondary">
                                            Your profit margins are healthy and above industry average.
                                        </Text>
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default ReportsDashboard;

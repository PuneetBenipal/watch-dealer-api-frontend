import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Radio,
    InputNumber,
    Button,
    Table,
    Space,
    Popconfirm,
    Card,
    Tag,
    Typography,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    SyncOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    RiseOutlined,
    FallOutlined
} from '@ant-design/icons';
import API from '../../../api';
import { Toast } from '../../../components/Alerts/CustomToast';

const { Title } = Typography;

const Wantbuy = () => {
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [dailyReports, setDailyReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    useEffect(() => {
        fetchDailyReports();
    }, []);

    const fetchDailyReports = async () => {
        try {
            setLoading(true);
            const response = await API.get('/api/company/dailyreports');
            setDailyReports(response.data.dailyReports || []);
        } catch (error) {
            console.error('Failed to fetch daily reports:', error);
            Toast.error('Failed to fetch daily reports');
        } finally {
            setLoading(false);
        }
    };

    // Calculate price statistics
    const getPriceStats = () => {
        if (!dailyReports.length) return { min: 0, max: 0, avg: 0, total: 0 };
        
        const prices = dailyReports
            .map(report => report.product_price)
            .filter(price => price !== undefined && price !== null);
        
        if (prices.length === 0) return { min: 0, max: 0, avg: 0, total: 0 };
        
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const total = prices.reduce((sum, price) => sum + price, 0);
        const avg = total / prices.length;
        
        return { min, max, avg, total };
    };

    const priceStats = getPriceStats();

    const handleFinish = async (values) => {
        try {
            setConfirmLoading(true);

            const processedValues = {
                status: values.status,
                product_name: values.product_name,
                product_name_type: values.product_name_type,
                product_price: values.product_price,
                min_price: values.min_price,
                max_price: values.max_price,
            };

            if (editingRecord) {
                await API.put(`/api/company/dailyreports/${editingRecord._id}`, processedValues);
                Toast.success('Daily report updated successfully');
            } else {
                await API.post('/api/company/dailyreports', processedValues);
                Toast.success('Daily report added successfully');
            }

            handleCancel();
            fetchDailyReports();
        } catch (error) {
            console.error('Failed to save daily report:', error);
            Toast.error('Failed to save daily report');
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleCancel = () => {
        setVisible(false);
        setEditingRecord(null);
        form.resetFields();
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            status: record.status,
            product_name: record.product_name,
            product_name_type: record.product_name_type,
            product_price: record.product_price,
            min_price: record.min_price,
            max_price: record.max_price,
        });
        setVisible(true);
    };

    const handleDelete = async (recordId) => {
        try {
            setLoading(true);
            await API.delete(`/api/company/dailyreports/${recordId}`);
            Toast.success('Daily report deleted successfully');
            fetchDailyReports();
        } catch (error) {
            console.error('Failed to delete daily report:', error);
            Toast.error('Failed to delete daily report');
        } finally {
            setLoading(false);
        }
    };

    const statusTag = (status) => {
        const statusConfig = {
            pending: {
                color: 'orange',
                icon: <SyncOutlined spin />,
                text: 'Pending'
            },
            forwarded: {
                color: 'green',
                icon: <CheckCircleOutlined />,
                text: 'Forwarded'
            }
        };

        const config = statusConfig[status] || { color: 'default', text: status };
        return (
            <Tag icon={config.icon} color={config.color}>
                {config.text}
            </Tag>
        );
    };

    const typeTag = (type) => {
        const typeConfig = {
            totally: {
                color: 'green',
                icon: <CheckCircleOutlined />,
                text: 'Totally'
            },
            some: {
                color: 'orange',
                icon: <ClockCircleOutlined />,
                text: 'Some'
            },
            never: {
                color: 'red',
                icon: <CloseCircleOutlined />,
                text: 'Never'
            }
        };

        const config = typeConfig[type] || { color: 'default', text: type };
        return (
            <Tag icon={config.icon} color={config.color}>
                {config.text}
            </Tag>
        );
    };

    const columns = [
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: statusTag,
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'Forwarded', value: 'forwarded' }
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Product Name',
            dataIndex: 'product_name',
            key: 'product_name',
            render: (text) => text || 'N/A',
            ellipsis: true,
        },
        {
            title: 'Product Type',
            dataIndex: 'product_name_type',
            key: 'product_name_type',
            render: typeTag,
            filters: [
                { text: 'Totally', value: 'totally' },
                { text: 'Some', value: 'some' },
                { text: 'Never', value: 'never' }
            ],
            onFilter: (value, record) => record.product_name_type === value,
        },
        // {
        //     title: 'Price',
        //     dataIndex: 'product_price',
        //     key: 'product_price',
        //     render: (price) => price ? `$${price.toLocaleString()}` : 'N/A',
        //     sorter: (a, b) => (a.product_price || 0) - (b.product_price || 0),
        //     align: 'right',
        // },
        {
            title: 'Min Price',
            dataIndex: 'min_price',
            key: 'min_price',
            render: (price) => price ? `$${price.toLocaleString()}` : 'N/A',
            align: 'right',
        },
        {
            title: 'Max Price',
            dataIndex: 'max_price',
            key: 'max_price',
            render: (price) => price ? `$${price.toLocaleString()}` : 'N/A',
            align: 'right',
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete this daily report?"
                        description="This action cannot be undone"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            {/* Price Statistics Cards */}
            {/* <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Reports"
                            value={dailyReports.length}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Min Price"
                            value={priceStats.min}
                            prefix={<FallOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                            suffix="$"
                            formatter={(value) => value.toLocaleString()}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Max Price"
                            value={priceStats.max}
                            prefix={<RiseOutlined />}
                            valueStyle={{ color: '#fa541c' }}
                            suffix="$"
                            formatter={(value) => value.toLocaleString()}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Avg Price"
                            value={priceStats.avg}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                            suffix="$"
                            precision={2}
                            formatter={(value) => value.toLocaleString()}
                        />
                    </Card>
                </Col>
            </Row> */}

            <Card
                bordered={false}
                title={<Title level={4} style={{ margin: 0 }}>Daily Reports Management</Title>}
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setVisible(true)}
                    >
                        Add Report
                    </Button>
                }
                style={{ marginBottom: 24 }}
            >
                <Table
                    columns={columns}
                    dataSource={dailyReports}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `${total} reports`,
                    }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>

            <Modal
                open={visible}
                title={editingRecord ? "Edit Daily Report" : "Add Daily Report"}
                onCancel={handleCancel}
                destroyOnClose
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={confirmLoading}
                        onClick={() => form.submit()}
                    >
                        {editingRecord ? 'Update' : 'Submit'}
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    initialValues={{ status: 'pending', product_name_type: 'some' }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Status"
                                rules={[{ required: true, Toast: 'Please select status' }]}
                            >
                                <Radio.Group>
                                    <Radio.Button value="pending">Pending</Radio.Button>
                                    <Radio.Button value="forwarded">Forwarded</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="product_name_type"
                                label="Product Type"
                                rules={[{ required: true, Toast: 'Please select type' }]}
                            >
                                <Radio.Group>
                                    <Radio.Button value="totally">Totally</Radio.Button>
                                    <Radio.Button value="some">Some</Radio.Button>
                                    <Radio.Button value="never">Never</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="product_name"
                        label="Product Name"
                        rules={[{
                            required: true,
                            Toast: 'Please input product name',
                            whitespace: true
                        }]}
                    >
                        <Input
                            placeholder="Enter product name"
                            allowClear
                        />
                    </Form.Item>

                    {/* <Form.Item
                        name="product_price"
                        label="Price"
                        rules={[
                            { required: true, Toast: 'Please input product price' },
                            { type: 'number', min: 0, Toast: 'Price must be positive' }
                        ]}
                    >
                        <InputNumber
                            min={0}
                            placeholder="Enter product price"
                            style={{ width: '100%' }}
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item> */}

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="min_price"
                                label="Min Price"
                                rules={[
                                    { type: 'number', min: 0, Toast: 'Min price must be positive' }
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    placeholder="Enter min price"
                                    style={{ width: '100%' }}
                                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="max_price"
                                label="Max Price"
                                rules={[
                                    { type: 'number', min: 0, Toast: 'Max price must be positive' }
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    placeholder="Enter max price"
                                    style={{ width: '100%' }}
                                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default Wantbuy;
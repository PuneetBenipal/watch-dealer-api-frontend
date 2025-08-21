import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  Table,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Alert,
  Spin,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import API from '../../api';
import { Toast } from '../../components/Alerts/CustomToast';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const debounceRef = useRef(null);

  useEffect(() => {
    loadInvoices();
    // Cleanup debounce on unmount
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [pagination.current, pagination.pageSize, statusFilter, paymentFilter, searchText]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.current,
        limit: pagination.pageSize
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (paymentFilter !== 'all') {
        params.append('paymentMethod', paymentFilter);
      }
      if (searchText) {
        params.append('search', searchText);
      }

      const response = await API.get(`/api/invoices?${params}`);
      console.log(response.data.invoices);
      setInvoices(response.data.invoices || []);
      setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load invoices' });
      Toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Debounce search input
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPagination(prev => ({ ...prev, current: 1 }));
    }, 500); // 500ms debounce
  };

  const handleTableChange = (paginationInfo) => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'error';
      case 'Overdue': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const columns = [
    {
      title: 'Invoice No',
      dataIndex: 'invoice_no',
      key: 'invoice_no',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.invoice_no.localeCompare(b.invoice_no),
    },
    {
      title: 'Buyer',
      key: 'buyer',
      render: (_, record) => (
        <Card style={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px' }} bordered={false}>
          <Space direction="vertical" size="small">
            <Space align="center">
              <UserOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ fontSize: '16px' }}>{record.customer_name}</Text>
            </Space>
            <Space align="center">
              <MailOutlined style={{ color: '#52c41a' }} />
              <Text style={{ fontSize: '14px' }}>{record.customer_email}</Text>
            </Space>
            <Space align="center">
              <PhoneOutlined style={{ color: '#fa8c16' }} />
              <Text style={{ fontSize: '14px' }}>{record.customer_phone}</Text>
            </Space>
          </Space>
        </Card>
      ),
    },
    {
      title: 'SubTotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (total, record) => (
        <Text strong>{formatCurrency(total, record.currency)}</Text>
      ),
      sorter: (a, b) => a.subtotal - b.subtotal,
    },
    {
      title: 'TaxAmount',
      dataIndex: 'tax_amount',
      key: 'tax_amount',
      render: (total, record) => (
        <Text strong>{formatCurrency(total, record.currency)}</Text>
      ),
      sorter: (a, b) => a.tax_amount - b.tax_amount,
    },
    {
      title: 'Tax Rate',
      dataIndex: 'tax_rate',
      key: 'tax_rate',
      render: (taxRate) => <Text strong>{`${(taxRate * 100).toFixed(2)}%`}</Text>,
      sorter: (a, b) => a.tax_rate - b.tax_rate,
    },
    {
      title: 'Amount',
      dataIndex: 'total',
      key: 'total',
      render: (total, record) => (
        <Text strong>{formatCurrency(total, record.currency)}</Text>
      ),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Paid', value: 'Paid' },
        { text: 'Pending', value: 'Pending' },
        { text: 'Cancelled', value: 'Cancelled' },
        { text: 'Overdue', value: 'Overdue' }
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => <Text>{method}</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Invoice">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/invoices/${record._id}`)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          {/* <Tooltip title="Edit Invoice">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/invoices/${record._id}/edit`)}
              style={{ color: '#52c41a' }}
            />
          </Tooltip> */}
          <Tooltip title="Download PDF">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => navigate(`/invoices/pdf/${record._id}`)}
              style={{ color: '#faad14' }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0, color: '#262626' }}>All Invoices</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/invoices/create')}
          size="large"
        >
          Create Invoice
        </Button>
      </div>

      {/* Alerts */}
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          closable
          onClose={() => setAlert(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Filters Section */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            {/* Search with debounce */}
            <Input
              placeholder="Search by invoice number or buyer name"
              allowClear
              size="large"
              onChange={handleSearchInputChange}
              suffix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              placeholder="Filter by Status"
              size="large"
            >
              <Option value="all">All Statuses</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Paid">Paid</Option>
              <Option value="Cancelled">Cancelled</Option>
              <Option value="Overdue">Overdue</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Select
              value={paymentFilter}
              onChange={setPaymentFilter}
              style={{ width: '100%' }}
              placeholder="Filter by Payment"
              size="large"
            >
              <Option value="all">All Methods</Option>
              <Option value="Bank Transfer">Bank Transfer</Option>
              <Option value="Credit Card">Credit Card</Option>
              <Option value="Cash">Cash</Option>
              <Option value="Check">Check</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={() => {
                  setStatusFilter('all');
                  setPaymentFilter('all');
                  setSearchText('');
                }}
              >
                Clear Filters
              </Button>
              <Text type="secondary">
                Showing {invoices.length} of {pagination.total} invoices
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Data Table */}
      <Card style={{ overflowX: 'auto' }}>
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default InvoiceList;
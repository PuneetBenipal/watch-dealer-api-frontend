import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Tag,
  Table,
  Alert,
  Spin,
  Select,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Empty
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import API from '../../api';
import { BACKEND_URL } from '../../config';
import { Toast } from '../../components/Alerts/CustomToast';

const { Title, Text } = Typography;
const { Option } = Select;

const InvoicePayments = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [filter, setFilter] = useState('all');
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    testConnection();
    loadInvoices();
    loadStats();
  }, [filter]);

  const testConnection = async () => {
    try {
      console.log('UI console Testing backend connection...');
      console.log('UI console API base URL:', API.defaults.baseURL);
      console.log('UI console Auth token:', localStorage.getItem('token'));

      // First test basic connectivity with a simple request
      try {
        const pingResponse = await fetch(`${BACKEND_URL}`);
        console.log('UI console Basic connectivity test:', pingResponse.status);
      } catch (pingError) {
        console.log('UI console Basic connectivity failed:', pingError.message);
      }

      const response = await API.get('/api/invoices');
      console.log('UI console Connection test successful:', response.status);
      setAlert({
        type: 'success',
        message: 'Backend connection successful!'
      });
      Toast.success("Backend connection successful!")
    } catch (error) {
      console.error('Connection test failed:', error);

      if (error.response?.status === 401) {
        setAlert({
          type: 'error',
          message: 'Authentication required. Please log in again.'
        });
        Toast.error("Authentication required. Please log in again.");
      } else if (error.response?.status === 403) {
        setAlert({
          type: 'error',
          message: 'Access denied. You need dealer permissions to view invoices.'
        });
        Toast.error("Access denied. You need dealer permissions to view invoices.");
      } else if (error.code === 'ERR_NETWORK') {
        setAlert({
          type: 'error',
          message: `Network error. Please check if the backend server is running on ${BACKEND_URL}`
        });
        Toast.error(`Network error. Please check if the backend server is running on ${BACKEND_URL}`);
      } else if (error.response?.status >= 500) {
        setAlert({
          type: 'error',
          message: `Server error: ${error.response.status}. Please check the backend logs.`
        });
        Toast.error(`Server error: ${error.response.status}. Please check the backend logs.`);
      } else {
        setAlert({
          type: 'error',
          message: `Connection failed: ${error.message}`
        });
        Toast.error(`Connection failed: ${error.message}`);
      }
    }
  };

  const loadInvoices = async () => {
    setLoading(true);
    setConnectionError(false);
    try {
      console.log('UI console Loading invoices with filter:', filter);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await API.get(`/api/invoices?${params}`);
      console.log('UI console Invoices response:', response);

      if (response.data && response.data.invoices) {
        setInvoices(response.data.invoices);
      } else if (response.data && Array.isArray(response.data)) {
        // Handle case where response.data is directly an array
        setInvoices(response.data);
      } else {
        console.warn('Unexpected invoices response format:', response.data);
        setInvoices([]);
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
      setConnectionError(true);

      if (error.response) {
        // Server responded with error status
        setAlert({
          type: 'error',
          message: `Server error: ${error.response.status} - ${error.response.data?.message || 'Failed to load invoices'}`
        });
        Toast.error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Failed to load invoices'}`);
      } else if (error.request) {
        // Request was made but no response received
        setAlert({
          type: 'error',
          message: 'No response from server. Please check if the backend is running.'
        });
        Toast.error("No response from server. Please check if the backend is running.")
      } else {
        // Something else happened
        setAlert({
          type: 'error',
          message: `Connection error: ${error.message}`
        });
        Toast.error(`Connection error: ${error.message}`)
      }

      // Set fallback data for demo purposes
      setInvoices([
        {
          _id: 'demo-1',
          invoiceNo: 'INV-001',
          buyer: { name: 'John Doe', email: 'john@example.com' },
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          total: 1500.00,
          currency: 'USD',
          status: 'Pending'
        },
        {
          _id: 'demo-2',
          invoiceNo: 'INV-002',
          buyer: { name: 'Jane Smith', email: 'jane@example.com' },
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          total: 2300.00,
          currency: 'USD',
          status: 'Paid'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('UI console Loading stats...');
      const response = await API.get('/api/invoices/stats/summary');
      console.log('UI console Stats response:', response);

      if (response.data) {
        const data = response.data;
        setStats({
          totalInvoices: data.totalInvoices || 0,
          totalAmount: data.totalAmount || 0,
          paidAmount: data.paidAmount || 0,
          pendingAmount: data.pendingAmount || 0
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);

      // Calculate stats from local invoices data as fallback
      if (invoices.length > 0) {
        const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const paidAmount = invoices
          .filter(inv => inv.status === 'Paid')
          .reduce((sum, inv) => sum + (inv.total || 0), 0);
        const pendingAmount = invoices
          .filter(inv => inv.status === 'Pending')
          .reduce((sum, inv) => sum + (inv.total || 0), 0);

        setStats({
          totalInvoices: invoices.length,
          totalAmount,
          paidAmount,
          pendingAmount
        });
      }
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      if (newStatus === 'Paid') {
        await API.put(`/api/invoices/${invoiceId}/paid`);
      } else {
        await API.put(`/api/invoices/${invoiceId}`, { status: newStatus });
      }

      setAlert({ type: 'success', message: 'Invoice status updated successfully!' });
      loadInvoices();
      loadStats();
    } catch (error) {
      console.error('Failed to update invoice status:', error);
      setAlert({
        type: 'error',
        message: `Failed to update invoice status: ${error.response?.data?.message || error.message}`
      });
      Toast.error(`Failed to update invoice status: ${error.response?.data?.message || error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const isOverdue = (invoice) => {
    if (invoice.status === 'Pending') {
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      return dueDate < today;
    }
    return false;
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
      title: 'Invoice #',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Buyer',
      key: 'buyer',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.buyer?.name}</Text>
          <Text type="secondary">{record.buyer?.email}</Text>
        </Space>
      )
    },
    {
      title: 'Due Date',
      key: 'dueDate',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>{formatDate(record.dueDate)}</Text>
          {isOverdue(record) && (
            <Tag color="error" icon={<ExclamationCircleOutlined />}>
              Overdue
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Amount',
      key: 'total',
      render: (_, record) => (
        <Text strong>{formatCurrency(record.total, record.currency)}</Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/invoices/${record._id}`)}
            style={{ color: '#1890ff' }}
          />
          {record.status === 'Pending' && (
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(record._id, 'Paid')}
              style={{ color: '#52c41a' }}
            />
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0, color: '#262626' }}>
          Payments & Status
        </Title>
        <Button
          type="default"
          icon={<ReloadOutlined />}
          onClick={() => { loadInvoices(); loadStats(); }}
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

      {/* Diagnostic Information */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={4}>Connection Diagnostics</Title>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Text strong>Backend URL:</Text>
            <br />
            <Text code>${BACKEND_URL}</Text>
          </Col>
          <Col xs={24} md={8}>
            <Text strong>API Base:</Text>
            <br />
            <Text code>{process.env.REACT_APP_API_URL || `${BACKEND_URL}`}</Text>
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Authentication:</Text>
            <br />
            <Text code>{localStorage.getItem('token') ? 'Token Present' : 'No Token'}</Text>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <Button
              type="primary"
              onClick={testConnection}
              icon={<ReloadOutlined />}
              block
            >
              Test Backend Connection
            </Button>
          </Col>
          <Col xs={24} md={12}>
            <Button
              type="dashed"
              onClick={() => window.open(`${BACKEND_URL}`, '_blank')}
              block
            >
              Open Backend in Browser
            </Button>
          </Col>
        </Row>

        {connectionError && (
          <Alert
            message="Backend Connection Troubleshooting"
            description={
              <div>
                <p><strong>Common issues and solutions:</strong></p>
                <ul>
                  <li><strong>Backend not running:</strong> Start the backend server with <code>cd backend && npm start</code></li>
                  <li><strong>Wrong port:</strong> Ensure backend is running on port 5000</li>
                  <li><strong>Authentication:</strong> Make sure you're logged in with dealer permissions</li>
                  <li><strong>CORS issues:</strong> Check backend CORS configuration</li>
                </ul>
                <p><strong>Current status:</strong> {connectionError ? 'Disconnected' : 'Connected'}</p>
              </div>
            }
            type="info"
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', border: '2px solid #1890ff' }}>
            <Statistic
              title="Total Invoices"
              value={stats.totalInvoices}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', border: '2px solid #52c41a' }}>
            <Statistic
              title="Total Amount"
              value={formatCurrency(stats.totalAmount)}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', border: '2px solid #52c41a' }}>
            <Statistic
              title="Paid Amount"
              value={formatCurrency(stats.paidAmount)}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', border: '2px solid #faad14' }}>
            <Statistic
              title="Pending Amount"
              value={formatCurrency(stats.pendingAmount)}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={6}>
            <Select
              value={filter}
              onChange={setFilter}
              style={{ width: '100%' }}
              placeholder="Filter by Status"
            >
              <Option value="all">All Invoices</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Paid">Paid</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Col>
          <Col xs={24} md={18}>
            <Text type="secondary">
              Showing {invoices.length} invoices
              {filter !== 'all' && ` with status: ${filter}`}
              {connectionError && ' (Demo Data)'}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Invoices Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
          scroll={{ x: "max-content" }}
          rowClassName={(record) => isOverdue(record) ? 'overdue-row' : ''}
          locale={{
            emptyText: connectionError ? (
              <Empty
                description="No invoices available"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Empty
                description="No invoices found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
        />
      </Card>

      <style jsx>{`
        .overdue-row {
          background-color: #fff7e6 !important;
        }
      `}</style>
    </div>
  );
};

export default InvoicePayments;
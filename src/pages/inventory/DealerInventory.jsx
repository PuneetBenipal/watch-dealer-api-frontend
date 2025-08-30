import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  Upload,
  Tag,
  Tooltip,
  Row,
  Col,
  Statistic,
  Drawer,
  Image,
  message,
  Popconfirm,
  Badge,
  Switch,
  Divider
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  DollarOutlined,
  GlobalOutlined,
  TagsOutlined,
  CameraOutlined
} from '@ant-design/icons';
// import { Line, Column } from '@ant-design/plots';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const DealerInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [stats, setStats] = useState({});
  const [exchangeRates, setExchangeRates] = useState({});
  const [userCurrency, setUserCurrency] = useState('USD');
  
  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [form] = Form.useForm();

  // Watch conditions and statuses
  const conditions = ['New', 'Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
  const statuses = ['Available', 'Reserved', 'Sold', 'On Hold', 'Under Service'];
  const visibilityOptions = ['Private', 'Shared', 'Public'];
  const currencies = ['USD', 'GBP', 'EUR', 'AED', 'HKD', 'CHF'];
  const countries = ['United States', 'United Kingdom', 'Switzerland', 'Germany', 'UAE', 'Hong Kong', 'Singapore'];

  useEffect(() => {
    fetchInventory();
    fetchStats();
    fetchExchangeRates();
  }, [pagination.current, filters]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      });
      
      const response = await fetch(`/api/inventory?${queryParams}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory);
        setPagination(prev => ({ ...prev, total: data.pagination.totalItems }));
      }
    } catch (error) {
      message.error('Failed to fetch inventory');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/inventory/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('/api/exchange-rates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExchangeRates(data.rates);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates');
    }
  };

  const handleAddItem = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'images' && values[key]) {
          values[key].fileList.forEach(file => {
            formData.append('images', file.originFileObj);
          });
        } else if (values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      if (response.ok) {
        message.success('Inventory item added successfully');
        setAddModalVisible(false);
        form.resetFields();
        fetchInventory();
        fetchStats();
      } else {
        message.error('Failed to add inventory item');
      }
    } catch (error) {
      message.error('Failed to add inventory item');
    }
  };

  const handleEditItem = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'images' && values[key]) {
          values[key].fileList.forEach(file => {
            formData.append('images', file.originFileObj);
          });
        } else if (values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      const response = await fetch(`/api/inventory/${selectedItem._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      if (response.ok) {
        message.success('Inventory item updated successfully');
        setEditModalVisible(false);
        form.resetFields();
        fetchInventory();
      } else {
        message.error('Failed to update inventory item');
      }
    } catch (error) {
      message.error('Failed to update inventory item');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        message.success('Inventory item deleted successfully');
        fetchInventory();
        fetchStats();
      } else {
        message.error('Failed to delete inventory item');
      }
    } catch (error) {
      message.error('Failed to delete inventory item');
    }
  };

  const convertPrice = (price, fromCurrency) => {
    if (fromCurrency === userCurrency) return price;
    const rateKey = `${fromCurrency}_${userCurrency}`;
    const rate = exchangeRates[rateKey] || 1;
    return (price * rate).toFixed(2);
  };

  const formatPrice = (amount, currency) => {
    const convertedAmount = convertPrice(amount, currency);
    return `${getCurrencySymbol(userCurrency)}${parseFloat(convertedAmount).toLocaleString()}`;
  };

  const getCurrencySymbol = (currency) => {
    const symbols = { USD: '$', GBP: '£', EUR: '€', AED: 'د.إ', HKD: 'HK$', CHF: 'CHF' };
    return symbols[currency] || currency;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Available': 'green',
      'Reserved': 'orange',
      'Sold': 'red',
      'On Hold': 'blue',
      'Under Service': 'purple'
    };
    return colors[status] || 'default';
  };

  const getVisibilityColor = (visibility) => {
    const colors = {
      'Private': 'red',
      'Shared': 'orange',
      'Public': 'green'
    };
    return colors[visibility] || 'default';
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (images) => (
        images && images.length > 0 ? (
          <Image
            width={60}
            height={60}
            src={images.find(img => img.isPrimary)?.url || images[0]?.url}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        ) : (
          <div style={{ width: 60, height: 60, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
            <CameraOutlined style={{ color: '#ccc' }} />
          </div>
        )
      )
    },
    {
      title: 'Watch Details',
      key: 'details',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.make} {record.model}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.year && `${record.year} • `}
            Ref: {record.refNo}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.condition} • {record.country}
          </div>
        </div>
      )
    },
    {
      title: 'Price',
      key: 'price',
      sorter: true,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {formatPrice(record.priceListed.amount, record.priceListed.currency)}
          </div>
          {record.pricePaid.amount > 0 && (
            <div style={{ color: '#666', fontSize: '12px' }}>
              Cost: {formatPrice(record.pricePaid.amount, record.pricePaid.currency)}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      )
    },
    {
      title: 'Visibility',
      dataIndex: 'visibility',
      key: 'visibility',
      render: (visibility) => (
        <Tag color={getVisibilityColor(visibility)}>{visibility}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedItem(record);
                setViewDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedItem(record);
                form.setFieldsValue({
                  ...record,
                  pricePaid: record.pricePaid.amount,
                  priceListed: record.priceListed.amount,
                  currency: record.priceListed.currency
                });
                setEditModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this item?"
              onConfirm={() => handleDeleteItem(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  const renderForm = () => (
    <Form form={form} layout="vertical" onFinish={addModalVisible ? handleAddItem : handleEditItem}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="make" label="Make" rules={[{ required: true }]}>
            <Input placeholder="e.g., Rolex, Omega, Patek Philippe" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="model" label="Model" rules={[{ required: true }]}>
            <Input placeholder="e.g., Submariner, Speedmaster" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="refNo" label="Reference Number" rules={[{ required: true }]}>
            <Input placeholder="e.g., 116610LN" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="year" label="Year">
            <InputNumber min={1800} max={new Date().getFullYear() + 1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="condition" label="Condition" rules={[{ required: true }]}>
            <Select>
              {conditions.map(condition => (
                <Option key={condition} value={condition}>{condition}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="pricePaid" label="Price Paid">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="priceListed" label="Listed Price" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
            <Select>
              {currencies.map(currency => (
                <Option key={currency} value={currency}>{currency}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="country" label="Country" rules={[{ required: true }]}>
            <Select>
              {countries.map(country => (
                <Option key={country} value={country}>{country}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="status" label="Status">
            <Select defaultValue="Available">
              {statuses.map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="visibility" label="Visibility">
            <Select defaultValue="Private">
              {visibilityOptions.map(option => (
                <Option key={option} value={option}>{option}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="serialNumber" label="Serial Number">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="caseMaterial" label="Case Material">
            <Input placeholder="e.g., Stainless Steel, Gold" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="caseSize" label="Case Size">
            <Input placeholder="e.g., 40mm" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="movement" label="Movement">
            <Input placeholder="e.g., Automatic, Quartz" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="dialColor" label="Dial Color">
            <Input placeholder="e.g., Black, White, Blue" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Description">
        <TextArea rows={3} placeholder="Additional details about the watch..." />
      </Form.Item>

      <Form.Item name="images" label="Images">
        <Upload
          listType="picture-card"
          multiple
          beforeUpload={() => false}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>
    </Form>
  );

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h1 style={{ margin: 0 }}>Dealer Inventory</h1>
            <p style={{ color: '#666', margin: 0 }}>Manage your watch inventory</p>
          </Col>
          <Col>
            <Space>
              <Select
                value={userCurrency}
                onChange={setUserCurrency}
                style={{ width: 100 }}
                prefix={<DollarOutlined />}
              >
                {currencies.map(currency => (
                  <Option key={currency} value={currency}>{currency}</Option>
                ))}
              </Select>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
                Add Watch
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Items"
              value={stats.totalItems || 0}
              prefix={<TagsOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Value"
              value={stats.totalValue || 0}
              prefix={getCurrencySymbol(userCurrency)}
              precision={0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Available"
              value={stats.byStatus?.Available || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sold"
              value={stats.byStatus?.Sold || 0}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="Search by make, model, or reference..."
              onSearch={(value) => setFilters(prev => ({ ...prev, search: value }))}
              style={{ width: '100%' }}
            />
          </Col>
          <Col>
            <Select
              placeholder="Status"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              {statuses.map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="Visibility"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => setFilters(prev => ({ ...prev, visibility: value }))}
            >
              {visibilityOptions.map(option => (
                <Option key={option} value={option}>{option}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Inventory Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={inventory}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
          onChange={(pag) => setPagination(pag)}
          rowSelection={{
            selectedRowKeys: selectedItems,
            onChange: setSelectedItems
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={addModalVisible ? "Add New Watch" : "Edit Watch"}
        open={addModalVisible || editModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          setEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        {renderForm()}
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Space>
            <Button onClick={() => {
              setAddModalVisible(false);
              setEditModalVisible(false);
              form.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              {addModalVisible ? 'Add Watch' : 'Update Watch'}
            </Button>
          </Space>
        </div>
      </Modal>

      {/* View Details Drawer */}
      <Drawer
        title="Watch Details"
        placement="right"
        width={600}
        open={viewDrawerVisible}
        onClose={() => setViewDrawerVisible(false)}
      >
        {selectedItem && (
          <div>
            {selectedItem.images && selectedItem.images.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Image.PreviewGroup>
                  {selectedItem.images.map((image, index) => (
                    <Image
                      key={index}
                      width={120}
                      height={120}
                      src={image.url}
                      style={{ marginRight: 8, marginBottom: 8, objectFit: 'cover' }}
                    />
                  ))}
                </Image.PreviewGroup>
              </div>
            )}
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <h3>{selectedItem.make} {selectedItem.model}</h3>
              </Col>
              <Col span={12}>
                <strong>Reference:</strong> {selectedItem.refNo}
              </Col>
              <Col span={12}>
                <strong>Year:</strong> {selectedItem.year || 'N/A'}
              </Col>
              <Col span={12}>
                <strong>Condition:</strong> <Tag>{selectedItem.condition}</Tag>
              </Col>
              <Col span={12}>
                <strong>Status:</strong> <Tag color={getStatusColor(selectedItem.status)}>{selectedItem.status}</Tag>
              </Col>
              <Col span={12}>
                <strong>Listed Price:</strong> {formatPrice(selectedItem.priceListed.amount, selectedItem.priceListed.currency)}
              </Col>
              {selectedItem.pricePaid.amount > 0 && (
                <Col span={12}>
                  <strong>Price Paid:</strong> {formatPrice(selectedItem.pricePaid.amount, selectedItem.pricePaid.currency)}
                </Col>
              )}
              <Col span={12}>
                <strong>Country:</strong> {selectedItem.country}
              </Col>
              <Col span={12}>
                <strong>Visibility:</strong> <Tag color={getVisibilityColor(selectedItem.visibility)}>{selectedItem.visibility}</Tag>
              </Col>
              {selectedItem.serialNumber && (
                <Col span={24}>
                  <strong>Serial Number:</strong> {selectedItem.serialNumber}
                </Col>
              )}
              {selectedItem.caseMaterial && (
                <Col span={12}>
                  <strong>Case Material:</strong> {selectedItem.caseMaterial}
                </Col>
              )}
              {selectedItem.caseSize && (
                <Col span={12}>
                  <strong>Case Size:</strong> {selectedItem.caseSize}
                </Col>
              )}
              {selectedItem.movement && (
                <Col span={12}>
                  <strong>Movement:</strong> {selectedItem.movement}
                </Col>
              )}
              {selectedItem.dialColor && (
                <Col span={12}>
                  <strong>Dial Color:</strong> {selectedItem.dialColor}
                </Col>
              )}
              {selectedItem.description && (
                <Col span={24}>
                  <strong>Description:</strong>
                  <p style={{ marginTop: 8 }}>{selectedItem.description}</p>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default DealerInventory;

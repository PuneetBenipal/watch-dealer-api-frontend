


import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Alert,
  Spin,
  Table,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import API from '../../api';
import { Toast } from '../../components/Alerts/CustomToast';
import useAuth from '../../hooks/useAuth';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const InvoiceCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [alert, setAlert] = useState(null);
  const [autoCreateMode, setAutoCreateMode] = useState(false);
  const [prefilledProduct, setPrefilledProduct] = useState(null);
  const [type, setType] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    loadInventory();
    // Check if we have pre-filled product data from navigation
    if (location.state?.productData) {
      setPrefilledProduct(location.state.productData);
      setAutoCreateMode(true);

      // Auto-add the product to selected items
      const product = location.state.productData;
      const newItem = {
        id: Date.now(),
        inventoryId: product._id,
        quantity: 1,
        price: product.priceListed || 0,
        description: `${product.brand} ${product.model} - ${product.year} - ${product.condition}`
      };
      setSelectedItems([newItem]);

      Toast.info(`Product "${product.brand} ${product.model}" pre-filled for invoice creation`);
    }
  }, [location.state]);

  // Load inventory when component mounts
  useEffect(() => {
    loadInventory();
  }, []);

  // Separate useEffect for form initialization to avoid timing issues
  useEffect(() => {
    if (autoCreateMode && prefilledProduct && form) {
      try {
        // Auto-fill the form with product data after form is ready
        const product = prefilledProduct;
        const dueDate = moment(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

        console.log('UI console Setting form values:', {
          'buyer.name': 'Customer',
          paymentMethod: 'Bank Transfer',
          dueDate: dueDate,
          notes: `Invoice for ${product.brand} ${product.model}`
        });

        form.setFieldsValue({
          'buyer.name': 'Customer',
          paymentMethod: 'Wire',
          dueDate: dueDate,
          notes: `Invoice for ${product.brand} ${product.model}`
        });
      } catch (error) {
        console.error('Error setting form values:', error);
      }
    }
  }, [autoCreateMode, prefilledProduct, form]);

  const loadInventory = async () => {
    try {
      setInventoryLoading(true);
      const response = await API.get('/api/inventory');
      console.log("UI console API Response:", response);
      console.log("UI console Response data:", response.data);
      setInventory(response.data || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      setAlert({
        type: 'error',
        Toast: 'Failed to load inventory items'
      });
      Toast.error("Failed to load inventory items");
    } finally {
      setInventoryLoading(false);
    }
  };
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      inventoryId: '',
      quantity: 1,
      price: 0,
      description: ''
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };


  const updateItem = (id, field, value) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // If inventoryId is being updated, auto-populate other fields
        if (field === 'inventoryId' && value) {
          console.log('UI console Updating inventoryId to:', value);
          const selectedInventory = inventory.find(inv => inv._id === value);
          console.log('UI console Found selected inventory:', selectedInventory);
          if (selectedInventory) {
            updatedItem.description = selectedInventory.description || `${selectedInventory.brand || ''} ${selectedInventory.model || ''}`.trim();
            updatedItem.price = selectedInventory.priceListed || 0;
            // Store additional inventory info for display
            updatedItem.inventoryInfo = {
              brand: selectedInventory.brand,
              model: selectedInventory.model,
              condition: selectedInventory.condition,
              refNo: selectedInventory.refNo,
              year: selectedInventory.year
            };
            console.log('UI console pdated item with inventory info:', updatedItem);
          }
        }

        return updatedItem;
      }
      return item;
    }));
  };

  // Helper function to get inventory details for display
  const getInventoryDetails = (inventoryId) => {
    const item = inventory.find(inv => inv._id === inventoryId);
    if (!item) return null;

    return {
      brand: item.brand || 'N/A',
      model: item.model || 'N/A',
      condition: item.condition || 'N/A',
      refNo: item.refNo || 'N/A',
      year: item.year || 'N/A',
      priceListed: item.priceListed || 0
    };
  };

  const calculateTotals = () => {
    let subtotal = 0;
    selectedItems.forEach(item => {
      if (item.price && item.quantity) {
        subtotal += item.price * item.quantity;
      }
    });
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };
  const handleSubmit = async (values) => {
    const paymentMethod = values.paymentMethod;
    const customerName = values.customer.name;
    const customerEmail = values.customer.email;
    const customerPhone = values.customer.phone;
    const customerAdress = values.customer.adress;
    const companyId = user.companyId;

    if (selectedItems.length === 0) {
      setAlert({ type: 'error', Toast: 'Please add at least one item to the invoice' });
      Toast.error("Please add at least one item to the invoice.")
      return;
    }

    // Check if all items have valid prices and quantities
    const invalidItems = selectedItems.filter(item => !item.price || !item.quantity || item.price <= 0 || item.quantity <= 0);
    if (invalidItems.length > 0) {
      setAlert({
        type: 'error',
        Toast: `Please enter valid prices and quantities for all items`
      });
      Toast.error("Please enter valid prices and quantities for all items");
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const { subtotal, tax, total } = calculateTotals();
      // Transform selectedItems to match backend schema
      const transformedItems = selectedItems.map(item => ({
        sku: item.inventoryId,
        description: item.description || '',
        unit_price: item.price,
        qty: item.quantity || 1,
        line_total: item.price * item.quantity
      }));
      const payment = type ? paymentMethod : "CASH";
      console.log(payment)
      console.log(type)
      // Filter out items without inventoryId
      const invoiceData = {
        companyId: companyId,
        items: transformedItems,
        subtotal: subtotal,
        tax_rate: 0.1,
        tax_amount: tax, // Backend expects 'tax', not 'taxes'
        total: total,
        currency: values.currency || 'USD',
        paymentMethod: payment.toLowerCase(),
        dueDate: values.dueDate?.toISOString ? values.dueDate.toISOString() : values.dueDate,
        notes: values.notes || '',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_adress: customerAdress,
      };

      console.log(invoiceData)

      console.log('UI console Sending invoice data to backend:', invoiceData);

      const response = await API.post('/api/invoices', invoiceData);

      if (response.data.message === "success"){
        Toast.success("Invoice create successfully");
      }
    } catch (error) {
      console.error('Invoice creation error:', error);

      let errorToast = 'Failed to create invoice';
      let errorDetails = '';

      if (error.response?.data?.error) {
        errorToast = error.response.data.error;
      } else if (error.response?.data?.Toast) {
        errorToast = error.response.data.Toast;
      }

      if (error.response?.data?.details) {
        errorDetails = Array.isArray(error.response.data.details)
          ? error.response.data.details.join(', ')
          : error.response.data.details;
      }

      // Check if it's a duplicate key error that can be retried
      if (error.response?.data?.error &&
        (error.response.data.error.includes('Invoice number conflict') ||
          error.response.data.error.includes('Invoice hash conflict'))) {
        setAlert({
          type: 'warning',
          Toast: 'Invoice conflict detected',
          description: 'The system will generate new unique identifiers. Please try creating the invoice again.',
          action: (
            <Button
              type="primary"
              size="small"
              onClick={() => handleSubmit(values)}
              style={{ marginTop: '8px' }}
            >
              Retry with New Identifiers
            </Button>
          )
        });
        Toast.warning("Invoice conflict detected");
      } else {
        setAlert({
          type: 'error',
          Toast: errorToast,
          description: errorDetails || undefined
        });
        Toast.error(errorToast)
      }
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  console.log("UI console These are Inventory:", inventory);
  console.log("UI console Inventory length:", inventory.length);
  if (inventory.length > 0) {
    console.log("UI console First inventory item:", inventory[0]);
  }

  const columns = [
    {
      title: (
        <div>
          Item
        </div>
      ),
      key: 'inventoryId',
      render: (_, record) => (
        <div>
          <Select
            value={record.inventoryId}
            onChange={(value) => updateItem(record.id, 'inventoryId', value)}
            style={{ width: '100%' }}
            placeholder={inventoryLoading ? "Loading inventory..." : "Select item"}
            loading={inventoryLoading}
            notFoundContent={
              inventoryLoading ? "Loading..." :
                inventory.length === 0 ? "No inventory items found" : "No matching items"
            }
            status={!record.inventoryId ? 'error' : undefined}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {inventory
              .filter(item => !selectedItems.map(item => { return item.inventoryId }).includes(item._id))
              .map(item => (
                <Option key={item._id} value={item._id}>
                  {item.brand || 'N/A'} {item.model || 'N/A'} - {item.condition || 'N/A'} - ${item.priceListed || 0}
                </Option>
              ))}
          </Select>
          {/* {!record.inventoryId && (
            <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
              ⚠️ Please select an inventory item
            </div>
          )} */}
        </div>
      )
    },
    {
      title: 'Inventory Details',
      key: 'inventoryDetails',
      render: (_, record) => {
        if (!record.inventoryId) return <Text type="secondary">Select an item first</Text>;

        const details = getInventoryDetails(record.inventoryId);
        if (!details) return <Text type="secondary">Item not found</Text>;

        return (
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            <div><strong>Brand:</strong> {details.brand}</div>
            <div><strong>Model:</strong> {details.model}</div>
            <div><strong>Condition:</strong> {details.condition}</div>
            {details.refNo && <div><strong>Ref No:</strong> {details.refNo}</div>}
            {details.year && <div><strong>Year:</strong> {details.year}</div>}
          </div>
        );
      }
    },
    {
      title: 'Description',
      key: 'description',
      render: (_, record) => (
        <Input
          value={record.description}
          onChange={(e) => updateItem(record.id, 'description', e.target.value)}
          placeholder="Item description"
        />
      )
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (_, record) => (
        <InputNumber
          value={record.quantity}
          onChange={(value) => updateItem(record.id, 'quantity', value)}
          min={1}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => (
        <InputNumber
          value={record.price}
          onChange={(value) => updateItem(record.id, 'price', value)}
          min={0}
          step={0.01}
          style={{ width: '100%' }}
          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
        />
      )
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => (
        <Text strong>
          ${((record.price || 0) * (record.quantity || 0)).toFixed(2)}
        </Text>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to remove this item?"
          onConfirm={() => removeItem(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      )
    }
  ];

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0, color: '#262626' }}>
          {autoCreateMode ? (
            <span>
              <FileTextOutlined style={{ marginRight: 8, color: '#52c41a' }} />
              Create Invoice for {prefilledProduct?.brand} {prefilledProduct?.model}
            </span>
          ) : (
            'Create New Invoice'
          )}
        </Title>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/invoices')}
        >
          Back to Invoices
        </Button>
      </div>

      {/* {alert && (
        <Alert
          Toast={alert.Toast}
          type={alert.type}
          closable
          onClose={() => setAlert(null)}
          style={{ marginBottom: 16 }}
        />
      )} */}

      <div>
        <Button onClick={() => setType(false)}>Cash</Button>
        <Button onClick={() => setType(true)}>Wire</Button>
      </div>

      {autoCreateMode && prefilledProduct && (
        <Card
          style={{ marginBottom: 16, border: '2px solid #52c41a', backgroundColor: '#f6ffed' }}
          title={
            <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
              📦 Pre-filled Product Information
            </span>
          }
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Text strong>Brand:</Text> {prefilledProduct.brand}
            </Col>
            <Col xs={24} md={8}>
              <Text strong>Model:</Text> {prefilledProduct.model}
            </Col>
            <Col xs={24} md={8}>
              <Text strong>Year:</Text> {prefilledProduct.year}
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col xs={24} md={8}>
              <Text strong>Condition:</Text> {prefilledProduct.condition}
            </Col>
            <Col xs={24} md={8}>
              <Text strong>Price:</Text> ${prefilledProduct.priceListed || 0}
            </Col>
            <Col xs={24} md={8}>
              <Text strong>Status:</Text> {prefilledProduct.status}
            </Col>
          </Row>
          {prefilledProduct.description && (
            <Row style={{ marginTop: 8 }}>
              <Col span={24}>
                <Text strong>Description:</Text> {prefilledProduct.description}
              </Col>
            </Row>
          )}
        </Card>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          currency: 'USD',
          paymentMethod: 'wire'
        }}
      >
        <Row gutter={16}>
          {/* Left Column - Invoice Details */}
          <Col xs={24} lg={16}>
            <Card title="Invoice Details" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="currency"
                    label="Currency"
                    rules={[{ required: true, Toast: 'Please select currency' }]}
                  >
                    <Select>
                      <Option value="USD">USD</Option>
                      <Option value="EUR">EUR</Option>
                      <Option value="GBP">GBP</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="dueDate"
                    label="Due Date"
                    rules={[{ required: true, message: 'Please select due date' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              {
                type ? <Row gutter={16}>
                  {/* <Col xs={24} md={12}>
                  <Form.Item
                    name="invoiceNo"
                    label="Invoice Number"
                    rules={[{ required: true, Toast: 'Please enter invoice number' }]}
                  >
                    <Input placeholder="INV-001" />
                  </Form.Item>
                </Col> */}

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="paymentMethod"
                      label="Payment Method"
                      rules={[{ required: true, Toast: 'Please select payment method' }]}
                    >
                      <Select>
                        <Option value="wire">Wire Transfer</Option>
                        <Option value="crypto">Crypto</Option>
                        <Option value="escrow">Escrow</Option>
                        <Option value="credit card">Credit Card</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row> : <></>
              }

            </Card>

            <Card title="Buyer Information" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name={['customer', 'name']}
                    label="Buyer Name"
                    rules={[{ required: true, Toast: 'Please enter buyer name' }]}
                  >
                    <Input placeholder="John Doe" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name={['customer', 'email']}
                    label="Email"
                    rules={[
                      { required: true, Toast: 'Please enter email' },
                      { type: 'email', Toast: 'Please enter valid email' }
                    ]}
                  >
                    <Input placeholder="john@example.com" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name={['customer', 'phone']}
                    label="Phone"
                    rules={[
                      { required: true, Toast: 'Please enter Phone' },
                    ]}
                  >
                    <Input placeholder="+1 234 567 8900" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name={['customer', 'adress']}
                    label="Adress"
                    rules={[
                      { required: true, Toast: 'Please enter adress' },
                    ]}
                  >
                    <Input placeholder="Enter full address" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Invoice Items">
              <div style={{ marginBottom: 16, display: 'flex', gap: '8px' }}>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addItem}
                  style={{ flex: 1 }}
                >
                  Add Item
                </Button>
                <Button
                  type="default"
                  icon={<ReloadOutlined />}
                  onClick={loadInventory}
                  loading={inventoryLoading}
                  title="Refresh inventory"
                >
                  Refresh
                </Button>
                {/* <Button
                  type="dashed"
                  size="small"
                  onClick={() => {
                    console.log('UI console Current inventory state:', inventory);
                    console.log('UI console Selected items:', selectedItems);
                  }}
                  title="Debug: Log current state"
                >
                  Debug
                </Button> */}
              </div>

              {/* Status Summary */}
              {selectedItems.length > 0 && (
                <div style={{
                  marginBottom: 16,
                  padding: '12px',
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>Invoice Items Status:</Text>
                    <Text type="secondary">
                      {selectedItems.filter(item => item.inventoryId).length} of {selectedItems.length} items configured
                    </Text>
                  </div>
                  {selectedItems.filter(item => !item.inventoryId).length > 0 && (
                    <div style={{ color: '#fa8c16', fontSize: '12px', marginTop: '8px' }}>
                      ⚠️ {selectedItems.filter(item => !item.inventoryId).length} item(s) need inventory selection
                    </div>
                  )}
                </div>
              )}

              {inventory.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  backgroundColor: '#fafafa',
                  border: '1px dashed #d9d9d9',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                  <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                    No Inventory Items Available
                  </Text>
                  <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                    You need to add inventory items before creating invoices
                  </Text>
                  <Button
                    type="primary"
                    onClick={loadInventory}
                    loading={inventoryLoading}
                  >
                    Refresh Inventory
                  </Button>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={selectedItems}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          </Col>

          {/* Right Column - Summary */}
          <Col xs={24} lg={8}>
            <Card title="Invoice Summary" style={{ position: 'sticky', top: 20 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Text strong>Subtotal:</Text>
                  <div style={{ float: 'right' }}>
                    <Text>${subtotal.toFixed(2)}</Text>
                  </div>
                </div>

                <div>
                  <Text strong>Tax (10%):</Text>
                  <div style={{ float: 'right' }}>
                    <Text>${tax.toFixed(2)}</Text>
                  </div>
                </div>

                <Divider />

                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    Total: ${total.toFixed(2)}
                  </Title>
                </div>

                <Form.Item
                  name="notes"
                  label="Notes"
                >
                  <TextArea rows={4} placeholder="Additional notes..." />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  icon={autoCreateMode ? <FileTextOutlined /> : <SaveOutlined />}
                  loading={loading}
                  size="large"
                  block
                  style={autoCreateMode ? { backgroundColor: '#52c41a', borderColor: '#52c41a' } : {}}
                >
                  {autoCreateMode ? 'Create Invoice Now' : 'Create Invoice'}
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default InvoiceCreate;

import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Modal,
  Descriptions,
  Typography
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import InvoiceFromInventory from './InvoiceFromInventory';
import { Toast } from '../../components/Alerts/CustomToast';

const { Title, Text } = Typography;

// This is a demo component showing how to integrate InvoiceFromInventory
// into your existing inventory page
const InventoryInvoiceDemo = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);

  // Sample inventory data
  const inventoryData = [
    {
      _id: '1',
      name: 'from whatsapp',
      model: 'sdf',
      brand: 'sdf',
      price: 1500,
      currency: 'USD',
      status: 'Available',
      condition: 'Excellent',
      year: '2023',
      referenceNumber: 'REF-001'
    },
    {
      _id: '2',
      name: 'ROLEX',
      model: 'Submariner',
      brand: 'Rolex',
      price: 8500,
      currency: 'USD',
      status: 'Available',
      condition: 'New',
      year: '2024',
      referenceNumber: 'REF-002'
    }
  ];

  const columns = [
    {
      title: 'Image',
      key: 'image',
      render: () => (
        <div style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">No Image</Text>
        </div>
      )
    },
    {
      title: 'Model',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand'
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => (
        <Text strong>{record.price} {record.currency}</Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Available' ? 'success' : 'warning'}>
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
            onClick={() => showProductDetails(record)}
            style={{ color: '#1890ff' }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: '#52c41a' }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            style={{ color: '#ff4d4f' }}
          />
        </Space>
      )
    }
  ];

  const showProductDetails = (item) => {
    setSelectedItem(item);
    setProductModalVisible(true);
  };

  const showInvoiceModal = () => {
    setProductModalVisible(false);
    setInvoiceModalVisible(true);
  };

  const handleInvoiceSuccess = (invoice) => {
    console.log('UI console Invoice created successfully:', invoice);
    Toast.success('Invoice created successfully');
    // You can add additional logic here, such as:
    // - Updating inventory status
    // - Showing success notification
    // - Redirecting to invoice page
  };

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2}>Inventory Management</Title>

      <Card>
        <Table
          columns={columns}
          dataSource={inventoryData}
          rowKey="_id"
          pagination={false}
        />
      </Card>

      {/* Product Details Modal */}
      <Modal
        title="Product Details"
        open={productModalVisible}
        onCancel={() => setProductModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setProductModalVisible(false)}>
            CLOSE
          </Button>,
          <Button key="edit" type="default">
            EDIT ITEM
          </Button>,
          <Button
            key="invoice"
            type="primary"
            icon={<FileTextOutlined />}
            onClick={showInvoiceModal}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            CREATE INVOICE
          </Button>
        ]}
        width={600}
      >
        {selectedItem && (
          <Descriptions column={1}>
            <Descriptions.Item label="Name/Model">
              <Text strong>{selectedItem.name}</Text>
              <br />
              <Text type="secondary">{selectedItem.model}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Availability">
              <Tag color="success">{selectedItem.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Price Listed">
              <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                {selectedItem.price} {selectedItem.currency}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Year">
              {selectedItem.year || 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Reference Number">
              {selectedItem.referenceNumber || 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Currency">
              {selectedItem.currency}
            </Descriptions.Item>
            <Descriptions.Item label="Condition">
              {selectedItem.condition || 'Not specified'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Invoice Creation Modal */}
      <InvoiceFromInventory
        visible={invoiceModalVisible}
        onCancel={() => setInvoiceModalVisible(false)}
        inventoryItem={selectedItem}
        onSuccess={handleInvoiceSuccess}
      />
    </div>
  );
};

export default InventoryInvoiceDemo;

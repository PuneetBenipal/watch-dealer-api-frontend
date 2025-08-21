import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Divider,
  Tag,
  Space,
  Alert,
  Spin,
  Image,
  Descriptions,
  Statistic
} from 'antd';
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  DownloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../../components/InvoicePDF';
import API from '../../api';
import { BACKEND_URL } from '../../config';
import "./invoice.css";
import useAuth from '../../hooks/useAuth';


const { Title, Text, Paragraph } = Typography;

const InvoiceDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  console.log("ID is", id)
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setdata] = useState(null);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const { user } = useAuth();

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/invoices/${id}`);
      const invoiceData = response.data.invoice;
      setInvoice(invoiceData);
      const somedata = await API.post("/api/invoices/somedata", { items: invoiceData.items });
      setdata(somedata.data.inventoryData)
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
      setError('Failed to fetch invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/invoices/list');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return 'Not specified';
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <Title level={4} style={{ marginTop: 16 }}>
          Loading invoice...
        </Title>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Alert
          message={error || 'Invoice not found'}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Button type="primary" onClick={handleBack}>
          Go Back to Invoice List
        </Button>
      </div>
    );
  }
console.log("llllloooooo")
console.log(data)
  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ backgroundColor: 'white' }}
          >
            Back to List
          </Button>
          <Title level={2} style={{ margin: 0, color: '#262626' }}>
            Invoice Details
          </Title>
        </div>
      </div>

      {/* Invoice Content */}
      <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}>
        {/* Invoice Header */}
        <Row gutter={24} style={{ marginBottom: 32 }}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 16 }}>
              <Title level={3} style={{ marginBottom: 8, color: '#262626' }}>
                {user.fullName}
              </Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                {user.email}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ textAlign: 'right' }}>
              <Title level={3} style={{ marginBottom: 16, color: '#262626' }}>
                INVOICE
              </Title>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">{invoice.invoice_no}</Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">Create Date:</Text>
                <br />
                <Text strong style={{ fontSize: 16 }}>
                  {formatDate(invoice.createdAt)}
                </Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">Due Date:</Text>
                <br />
                <Text strong style={{ fontSize: 16 }}>
                  {formatDate(invoice.dueDate)}
                </Text>
              </div>
            </div>
          </Col>
        </Row>

        <Divider />

        {/* Buyer Information */}
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16, color: '#262626' }}>
            Buyer Information
          </Title>
          <Card style={{ backgroundColor: '#fafafa', border: '1px solid #d9d9d9' }}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">Buyer Name:</Text>
                  <br />
                  <Text strong>
                    {invoice.customer_name || 'Not specified'}
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">Email:</Text>
                  <br />
                  <Text strong>
                    {invoice.customer_email || 'Not specified'}
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">Phone:</Text>
                  <br />
                  <Text strong>
                    {invoice.customer_phone || 'Not specified'}
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">Adress:</Text>
                  <br />
                  <Text strong>
                    {invoice.customer_adress || 'Not specified'}
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </div>

        <Divider />

        {/* Invoice Items */}
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16, color: '#262626' }}>
            Invoice Items
          </Title>

          {data && data.length > 0 ? (
            data.map((item, index) => (
              <Card key={index} style={{ marginBottom: 16, border: '1px solid #d9d9d9' }}>
                <Row gutter={24}>
                  {/* Item Image */}
                  <Col xs={24} md={6}>
                    <div style={{
                      backgroundColor: '#fafafa',
                      borderRadius: 8,
                      padding: 16,
                      minHeight: 150,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.inventoryInfo.images && item.inventoryInfo.images.length > 0 ? (
                        <Image
                          src={`${BACKEND_URL}/${item.inventoryInfo.images[0]}`}
                          
                          alt={item.brand}
                          style={{
                            maxWidth: '100%',
                            maxHeight: 120,
                            objectFit: 'contain',
                            borderRadius: 8
                          }}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                        />
                      ) : (
                        <div style={{ textAlign: 'center' }} data = {`${BACKEND_URL}/${item.inventoryInfo.images[0]}`}>
                          <Text type="secondary">No Image</Text>
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* Item Details */}
                  <Col xs={24} md={18}>
                    <Row gutter={[16, 8]}>
                      <Col xs={24}>
                        <Title level={4} style={{ marginBottom: 8, color: '#262626' }}>
                          {item.inventoryInfo.brand || 'Unknown Brand'}
                        </Title>
                        <Title level={5} style={{ marginBottom: 16, color: '#8c8c8c' }}>
                          {item.inventoryInfo.model || 'Unknown Model'}
                        </Title>
                      </Col>

                      <Col xs={12} md={8}>
                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">Reference Number</Text>
                          <br />
                          <Text strong>
                            {item.inventoryInfo.refNo || 'Not specified'}
                          </Text>
                        </div>
                      </Col>

                      <Col xs={12} md={8}>
                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">Year</Text>
                          <br />
                          <Text strong>
                            {item.year || 'Not specified'}
                          </Text>
                        </div>
                      </Col>

                      <Col xs={12} md={8}>
                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">Condition</Text>
                          <br />
                          <Text strong>
                            {item.inventoryInfo.condition || 'Not specified'}
                          </Text>
                        </div>
                      </Col>

                      <Col xs={12} md={8}>
                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">Status</Text>
                          <br />
                          <Tag color={item.status === 'Available' ? 'success' : 'warning'}>
                            {item.inventoryInfo.status || 'Available'}
                          </Tag>
                        </div>
                      </Col>

                      <Col xs={12} md={8}>
                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">Currency</Text>
                          <br />
                          <Text strong>
                            {item.inventoryInfo.currency || 'USD'}
                          </Text>
                        </div>
                      </Col>

                      <Col xs={12} md={8}>
                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">Description</Text>
                          <br />
                          <Text strong>
                            {item.inventoryInfo.description || 'No description available'}
                          </Text>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card>
            ))
          ) : (
            <Card style={{ backgroundColor: '#fafafa', border: '1px solid #d9d9d9' }}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">No items found in this invoice</Text>
              </div>
            </Card>
          )}
        </div>

        <Divider />

        {/* Financial Information */}
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16, color: '#262626' }}>
            Financial Information
          </Title>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Card style={{ backgroundColor: '#fafafa', border: '2px solid #d9d9d9' }}>
                <Title level={5} style={{ marginBottom: 16, color: '#262626' }}>
                  Price Information
                </Title>

                {invoice.items && invoice.items.length > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>Total Price</Text>
                      <Text strong>
                        {formatCurrency(invoice.total, invoice.currency)}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>Sub Total</Text>
                      <Text strong>
                        {formatCurrency(invoice.subtotal, invoice.currency)}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>Tax Amount</Text>
                      <Text strong>
                        {formatCurrency(invoice.tax_amount, invoice.currency)}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>Tax Rate</Text>
                      <Text strong>
                        {formatCurrency(invoice.tax_rate, invoice.currency)}
                      </Text>
                    </div>

                    {invoice.items[0]?.pricePaid && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text>Purchase Price:</Text>
                        <Text strong>
                          {formatCurrency(invoice.items[0].pricePaid, invoice.items[0].currency)}
                        </Text>
                      </div>
                    )}
                  </>
                )}
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card style={{ backgroundColor: '#fafafa', border: '2px solid #d9d9d9' }}>
                <Title level={5} style={{ marginBottom: 16, color: '#262626' }}>
                  Invoice Summary
                </Title>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Total Amount:</Text>
                  <Statistic
                    value={invoice.total}
                    precision={2}
                    valueStyle={{ color: '#3f8600', fontSize: 20, fontWeight: 'bold' }}
                    suffix="USD"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Status:</Text>
                  <Tag
                    color={invoice.status === 'paid' ? 'success' : invoice.status === 'SENT' ? 'warning' : 'default'}
                  >
                    {invoice.status || 'Unknown'}
                  </Tag>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Payment Method:</Text>
                  <Text strong>
                    {invoice.payment_method || 'Not specified'}
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #d9d9d9' }}>
          <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
            Thank you for your business. This invoice is valid for 30 days from the date of issue.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceDetail;

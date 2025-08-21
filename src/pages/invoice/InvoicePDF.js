import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Spin, Alert, Row, Col, Descriptions, Tag, Divider } from 'antd';
import { DownloadOutlined, EyeOutlined, ArrowLeftOutlined, FileTextOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import API from '../../api';

const { Title, Text: AntText } = Typography;

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1890ff',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#262626',
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  col: {
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 10,
    color: '#595959',
  },
  value: {
    color: '#262626',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderBottom: '1px solid #d9d9d9',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #f0f0f0',
  },
  tableCell: {
    flex: 1,
    padding: 4,
  },
  tableHeaderCell: {
    flex: 1,
    padding: 4,
    fontWeight: 'bold',
    color: '#262626',
  },
  totalSection: {
    marginTop: 20,
    borderTop: '2px solid #1890ff',
    paddingTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  grandTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1890ff',
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    color: '#8c8c8c',
    fontSize: 10,
  },
});

// PDF Document Component
const InvoicePDFDocument = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>INVOICE</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Invoice #:</Text>
            <Text style={styles.value}>{invoice.invoiceNo}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {new Date(invoice.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={styles.value}>
              {new Date(invoice.dueDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{invoice.status}</Text>
          </View>
        </View>
      </View>

      {/* Company & Buyer Info */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Company Information</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Company:</Text>
            <Text style={styles.value}>Watch Dealer Hub</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>123 Business Street, City, State 12345</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>+1 (555) 123-4567</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>info@watchdealerhub.com</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Bill To</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{invoice.buyer.name}</Text>
          </View>
        </View>
        {invoice.buyer.company && (
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Company:</Text>
              <Text style={styles.value}>{invoice.buyer.company}</Text>
            </View>
          </View>
        )}
        {invoice.buyer.email && (
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{invoice.buyer.email}</Text>
            </View>
          </View>
        )}
        {invoice.buyer.phone && (
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{invoice.buyer.phone}</Text>
            </View>
          </View>
        )}
        {invoice.buyer.address && (
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>
                {typeof invoice.buyer.address === 'string' 
                  ? invoice.buyer.address 
                  : invoice.buyer.address.street || 'N/A'
                }
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Invoice Items */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Invoice Items</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Description</Text>
            <Text style={styles.tableHeaderCell}>Quantity</Text>
            <Text style={styles.tableHeaderCell}>Price</Text>
            <Text style={styles.tableHeaderCell}>Total</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.description}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>${item.price}</Text>
              <Text style={styles.tableCell}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Totals */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.label}>Subtotal:</Text>
          <Text style={styles.value}>${invoice.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.label}>Tax:</Text>
          <Text style={styles.value}>${invoice.tax.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.label}>Total:</Text>
          <Text style={styles.grandTotal}>${invoice.total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Payment Info */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Payment Information</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{invoice.paymentMethod}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Currency:</Text>
            <Text style={styles.value}>{invoice.currency}</Text>
          </View>
        </View>
        {invoice.notes && (
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Notes:</Text>
              <Text style={styles.value}>{invoice.notes}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Thank you for your business!</Text>
        <Text>Invoice Hash: {invoice.invoiceHash}</Text>
      </View>
    </Page>
  </Document>
);

const InvoicePDF = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/invoices/${id}`);
      setInvoice(response.data.invoice);
      
      // Generate PDF blob for download
      if (response.data.invoice) {
        generatePDF(response.data.invoice);
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
      setError('Failed to fetch invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (invoiceData) => {
    try {
      const blob = await pdf(<InvoicePDFDocument invoice={invoiceData} />).toBlob();
      setPdfBlob(blob);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const downloadPDF = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice?.invoiceNo || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px' }}>Loading invoice...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchInvoice}>
              Retry
            </Button>
          }
        />
      </Card>
      );
  }

  if (!invoice) {
    return (
      <Card>
        <Alert
          message="Invoice Not Found"
          description="The requested invoice could not be found."
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0, color: '#262626' }}>
          <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Invoice PDF - {invoice.invoiceNo}
        </Title>
        <Space>
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/invoices')}
          >
            Back to Invoices
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={downloadPDF}
            disabled={!pdfBlob}
          >
            Download PDF
          </Button>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Invoice Preview" style={{ marginBottom: 24 }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Invoice Number" span={1}>
                {invoice.invoiceNo}
              </Descriptions.Item>
              <Descriptions.Item label="Invoice Hash" span={1}>
                <Tag color="blue">{invoice.invoiceHash}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created Date" span={1}>
                {new Date(invoice.createdAt).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Due Date" span={1}>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={1}>
                <Tag color={invoice.status === 'Paid' ? 'green' : 'orange'}>
                  {invoice.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method" span={1}>
                {invoice.paymentMethod}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Buyer Information" bordered column={2}>
              <Descriptions.Item label="Name" span={1}>
                {invoice.buyer.name}
              </Descriptions.Item>
              <Descriptions.Item label="Company" span={1}>
                {invoice.buyer.company || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={1}>
                {invoice.buyer.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone" span={1}>
                {invoice.buyer.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {typeof invoice.buyer.address === 'string' 
                  ? invoice.buyer.address 
                  : invoice.buyer.address?.street || 'N/A'
                }
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Invoice Items" bordered column={4}>
              <Descriptions.Item label="Description" span={2}>
                <strong>Item</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Quantity" span={1}>
                <strong>Qty</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Price" span={1}>
                <strong>Price</strong>
              </Descriptions.Item>
              {invoice.items.map((item, index) => (
                <React.Fragment key={index}>
                  <Descriptions.Item span={2}>{item.description}</Descriptions.Item>
                  <Descriptions.Item span={1}>{item.quantity}</Descriptions.Item>
                  <Descriptions.Item span={1}>${item.price}</Descriptions.Item>
                </React.Fragment>
              ))}
            </Descriptions>

            <Divider />

            <Descriptions title="Summary" bordered column={2}>
              <Descriptions.Item label="Subtotal" span={1}>
                ${invoice.subtotal.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Tax" span={1}>
                ${invoice.tax.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Total" span={2}>
                <strong style={{ fontSize: '18px', color: '#1890ff' }}>
                  ${invoice.total.toFixed(2)}
                </strong>
              </Descriptions.Item>
            </Descriptions>

            {invoice.notes && (
              <>
                <Divider />
                <Descriptions title="Notes" bordered>
                  <Descriptions.Item span={3}>{invoice.notes}</Descriptions.Item>
                </Descriptions>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="PDF Actions" style={{ position: 'sticky', top: 20 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="large"
                block
                onClick={downloadPDF}
                disabled={!pdfBlob}
              >
                Download PDF
              </Button>
              
              <Button
                type="default"
                icon={<EyeOutlined />}
                size="large"
                block
                onClick={() => {
                  if (pdfBlob) {
                    const url = URL.createObjectURL(pdfBlob);
                    window.open(url, '_blank');
                  }
                }}
                disabled={!pdfBlob}
              >
                View PDF
              </Button>

              <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
                <p>PDF is ready for download</p>
                <p style={{ fontSize: '12px' }}>
                  Generated on: {new Date().toLocaleString()}
                </p>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InvoicePDF;

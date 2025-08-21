import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf'
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: 20
  },
  companyInfo: {
    flex: 1
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8
  },
  companyDetails: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4
  },
  invoiceInfo: {
    flex: 1,
    alignItems: 'flex-end'
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'right'
  },
  invoiceDetails: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    textAlign: 'right'
  },
  section: {
    marginBottom: 25
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: 8
  },
  productGrid: {
    flexDirection: 'row',
    marginBottom: 20
  },
  productImage: {
    width: 120,
    height: 120,
    marginRight: 20,
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0'
  },
  productDetails: {
    flex: 1
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5
  },
  productModel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 15
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  detailLabel: {
    fontSize: 10,
    color: '#666',
    width: 100
  },
  detailValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1
  },
  priceCard: {
    backgroundColor: '#f8f9fa',
    border: '2px solid #e9ecef',
    padding: 15,
    marginBottom: 20
  },
  priceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  signatureSection: {
    marginTop: 30
  },
  signatureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  signatureBox: {
    width: '48%',
    border: '2px dashed #dee2e6',
    padding: 15,
    minHeight: 120
  },
  signatureTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8
  },
  signatureDescription: {
    fontSize: 9,
    color: '#666',
    marginBottom: 15
  },
  signatureLine: {
    borderBottom: '1px solid #dee2e6',
    marginBottom: 10,
    paddingBottom: 10
  },
  signatureLabel: {
    fontSize: 9,
    color: '#666',
    marginBottom: 5
  },
  signatureArea: {
    height: 50,
    border: '1px solid #dee2e6',
    backgroundColor: '#f8f9fa',
    marginBottom: 10
  },
  signatureDate: {
    fontSize: 9,
    color: '#666'
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1px solid #dee2e6',
    textAlign: 'center'
  },
  footerText: {
    fontSize: 9,
    color: '#666'
  }
});

const InvoicePDF = ({ productData, productImageBase64, invoiceNumber, invoiceDate, companyInfo, adminSignature, organizerSignature, adminDate, organizerDate }) => {
  console.log('UI console InvoicePDF render - productImageBase64:', productImageBase64 ? 'Present' : 'Missing');
  console.log('UI console InvoicePDF render - productData:', productData);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{companyInfo.name}</Text>
            <Text style={styles.companyDetails}>{companyInfo.address}</Text>
            <Text style={styles.companyDetails}>Phone: {companyInfo.phone}</Text>
            <Text style={styles.companyDetails}>Email: {companyInfo.email}</Text>
            <Text style={styles.companyDetails}>Website: {companyInfo.website}</Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceDetails}>Invoice Number: {invoiceNumber}</Text>
            <Text style={styles.invoiceDetails}>Date: {invoiceDate}</Text>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.productGrid}>
            <View style={styles.productImage}>
              {productImageBase64 ? (
                <Image 
                  src={productImageBase64}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <View style={{ 
                  flex: 1, 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  backgroundColor: '#f8f9fa'
                }}>
                  <Text style={{ fontSize: 8, color: '#999', textAlign: 'center' }}>
                    No Image Available
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{productData.brand || 'Unknown Brand'}</Text>
              <Text style={styles.productModel}>{productData.model || 'Unknown Model'}</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reference Number:</Text>
                <Text style={styles.detailValue}>{productData.refNo || 'Not specified'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Year:</Text>
                <Text style={styles.detailValue}>{productData.year || 'Not specified'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Condition:</Text>
                <Text style={styles.detailValue}>{productData.condition || 'Not specified'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>{productData.status || 'Available'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Currency:</Text>
                <Text style={styles.detailValue}>{productData.currency || 'USD'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.detailValue}>{productData.description || 'No description available'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Price Information */}
        <View style={styles.section}>
          <View style={styles.priceCard}>
            <Text style={styles.priceTitle}>Price Information</Text>
            <View style={styles.priceRow}>
              <Text style={styles.detailLabel}>Listed Price:</Text>
              <Text style={styles.detailValue}>
                {productData.priceListed ? `${productData.priceListed} ${productData.currency || 'USD'}` : 'Not set'}
              </Text>
            </View>
            {productData.pricePaid && (
              <View style={styles.priceRow}>
                <Text style={styles.detailLabel}>Purchase Price:</Text>
                <Text style={styles.detailValue}>
                  {productData.pricePaid} {productData.currency || 'USD'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Authorization</Text>
          <View style={styles.signatureGrid}>
            {/* Company Administrator */}
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>Company Administrator</Text>
              <Text style={styles.signatureDescription}>
                This invoice has been reviewed and approved by the company administrator.
              </Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Signature:</Text>
              <View style={styles.signatureArea}>
                {adminSignature && (
                  <Image 
                    src={adminSignature} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
              </View>
              <Text style={styles.signatureDate}>Date: {adminDate}</Text>
            </View>

            {/* Organizer */}
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>Organizer</Text>
              <Text style={styles.signatureDescription}>
                This invoice has been prepared and verified by the organizer.
              </Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Signature:</Text>
              <View style={styles.signatureArea}>
                {organizerSignature && (
                  <Image 
                    src={organizerSignature} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
              </View>
              <Text style={styles.signatureDate}>Date: {organizerDate}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business. This invoice is valid for 30 days from the date of issue.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF; 
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  TextField,
  Chip,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../../components/InvoicePDF';
import API from '../../api';
import { BACKEND_URL } from '../../config';
import { Toast } from '../../components/Alerts/CustomToast';

const Invoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [productData, setProductData] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [alert, setAlert] = useState(null);
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Your Company Name',
    address: '123 Business Street, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@yourcompany.com',
    website: 'www.yourcompany.com'
  });

  // Signature states
  const [adminSignature, setAdminSignature] = useState('');
  const [organizerSignature, setOrganizerSignature] = useState('');
  const [adminDate, setAdminDate] = useState('');
  const [organizerDate, setOrganizerDate] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeSignature, setActiveSignature] = useState(null);

  // Signature image states for PDF
  const [adminSignatureImage, setAdminSignatureImage] = useState('');
  const [organizerSignatureImage, setOrganizerSignatureImage] = useState('');

  // Product image for PDF
  const [productImageBase64, setProductImageBase64] = useState('');

  // Canvas refs
  const adminCanvasRef = useRef(null);
  const organizerCanvasRef = useRef(null);

  // Invoice content ref for PDF generation
  const invoiceContentRef = useRef(null);

  useEffect(() => {
    // Get product data from navigation state
    console.log('UI console Invoice page - location.state:', location.state);
    if (location.state?.productData) {
      console.log('UI console Invoice page - setting product data:', location.state.productData);
      setProductData(location.state.productData);

      // Convert product image to base64 for PDF
      if (location.state.productData.images && location.state.productData.images.length > 0) {
        const imageFilename = location.state.productData.images[0].split('/').pop();
        const imageUrl = `${BACKEND_URL}/uploads/${imageFilename}`;
        console.log('UI console Attempting to convert image:', imageUrl);
        convertImageToBase64(imageUrl);
      } else {
        console.log('UI console No images found in product data');
      }
    } else {
      console.log('UI console Invoice page - no product data found in location.state');
    }

    // Generate invoice number and date
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setInvoiceNumber(`INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    setInvoiceDate(formattedDate);

    // Set default dates for signatures
    setAdminDate(formattedDate);
    setOrganizerDate(formattedDate);
  }, [location.state]);

  // Convert image to base64 for PDF
  const convertImageToBase64 = (imageUrl) => {
    console.log('UI console Converting image to base64:', imageUrl);

    // First test if the image URL is accessible
    fetch(imageUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          console.log('UI conslole Image URL is accessible, proceeding with conversion');
          proceedWithConversion(imageUrl);
        } else {
          console.error('UI conslole Image URL returned status:', response.status);
          setProductImageBase64('');
        }
      })
      .catch(error => {
        console.error('UI conslole Error testing image URL:', error);
        // Try conversion anyway as a fallback
        proceedWithConversion(imageUrl);
      });
  };

  const proceedWithConversion = (imageUrl) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Add a timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.error('Image loading timeout');
      setProductImageBase64('');
    }, 10000); // 10 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/png');
        setProductImageBase64(base64);
        console.log('UI conslole Image converted to base64 successfully');
      } catch (error) {
        console.error('Error converting image to base64:', error);
        setProductImageBase64('');
      }
    };

    img.onerror = (error) => {
      clearTimeout(timeout);
      console.error('Failed to load image for PDF:', error);
      console.error('Image URL that failed:', imageUrl);
      setProductImageBase64('');
    };

    img.src = imageUrl;
  };

  // Monitor productImageBase64 changes
  useEffect(() => {
    console.log('UI conslole productImageBase64 changed:', productImageBase64 ? 'Has data' : 'Empty');
  }, [productImageBase64]);

  // Initialize canvases when component mounts
  useEffect(() => {
    const initializeCanvases = () => {
      if (adminCanvasRef.current) {
        initializeCanvas(adminCanvasRef);
      }
      if (organizerCanvasRef.current) {
        initializeCanvas(organizerCanvasRef);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeCanvases, 100);
    return () => clearTimeout(timer);
  }, []);

  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .no-print { display: none !important; }
        body { margin: 0; padding: 0; }
        .invoice-content { box-shadow: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Initialize canvas for drawing
  const initializeCanvas = (canvasRef) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Store existing canvas data if any
      let existingData = null;
      if (canvas.width > 0 && canvas.height > 0) {
        existingData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }

      // Set canvas size to match display size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Set drawing properties
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Restore existing data if available
      if (existingData) {
        ctx.putImageData(existingData, 0, 0);
      }
    }
  };

  // Handle mouse down on canvas
  const handleMouseDown = (e, signatureType) => {
    e.preventDefault();
    setIsDrawing(true);
    setActiveSignature(signatureType);
    const canvasRef = signatureType === 'admin' ? adminCanvasRef : organizerCanvasRef;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Calculate the scale factors
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Convert mouse coordinates to canvas coordinates
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // Handle mouse move on canvas
  const handleMouseMove = (e, signatureType) => {
    e.preventDefault();
    if (!isDrawing || activeSignature !== signatureType) return;
    const canvasRef = signatureType === 'admin' ? adminCanvasRef : organizerCanvasRef;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Calculate the scale factors
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Convert mouse coordinates to canvas coordinates
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Handle mouse up on canvas
  const handleMouseUp = (signatureType) => {
    setIsDrawing(false);
    setActiveSignature(null);

    // Capture signature image
    const canvasRef = signatureType === 'admin' ? adminCanvasRef : organizerCanvasRef;
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL('image/png');
      if (signatureType === 'admin') {
        setAdminSignatureImage(imageData);
      } else {
        setOrganizerSignatureImage(imageData);
      }
    }
  };

  // Handle touch events for mobile devices
  const handleTouchStart = (e, signatureType) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    handleMouseDown(mouseEvent, signatureType);
  };

  const handleTouchMove = (e, signatureType) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    handleMouseMove(mouseEvent, signatureType);
  };

  const handleTouchEnd = (signatureType) => {
    handleMouseUp(signatureType);
  };

  // Clear signature
  const clearSignature = (signatureType) => {
    const canvasRef = signatureType === 'admin' ? adminCanvasRef : organizerCanvasRef;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Reinitialize drawing properties
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    if (signatureType === 'admin') {
      setAdminSignature('');
      setAdminSignatureImage('');
    } else {
      setOrganizerSignature('');
      setOrganizerSignatureImage('');
    }
  };

  // Handle signature click
  const handleSignatureClick = (signatureType) => {
    setActiveSignature(signatureType);
    const canvasRef = signatureType === 'admin' ? adminCanvasRef : organizerCanvasRef;

    // Only initialize if canvas hasn't been set up yet
    if (canvasRef.current && (!canvasRef.current.width || !canvasRef.current.height)) {
      initializeCanvas(canvasRef);
    } else if (canvasRef.current) {
      // Just set up the drawing context without changing canvas size
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    // Focus the canvas for better interaction
    if (canvasRef.current) {
      canvasRef.current.focus();
    }
  };

  const handlePrint = () => {
    // Use the browser's print function with optimized styles
    const printStyles = `
      @media print {
        .no-print { display: none !important; }
        body { margin: 0; padding: 20px; }
        .invoice-content { 
          box-shadow: none !important; 
          border: none !important;
          background: white !important;
        }
        * { -webkit-print-color-adjust: exact !important; }
      }
    `;

    const style = document.createElement('style');
    style.textContent = printStyles;
    document.head.appendChild(style);

    window.print();

    // Remove the print styles after printing
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };

  const handleDownload = async () => {
    // Save invoice to database when PDF is downloaded
    try {
      console.log('PDF download initiated, saving to database...');

      const invoiceData = {
        invoiceNumber,
        productData,
        companyInfo,
        invoiceDate,
        pdfGenerated: true
      };

      const response = await API.post('/api/invoice-history', invoiceData);
      console.log('UI conslole Invoice saved to database:', response.data);

      setAlert({ type: 'success', message: 'Invoice saved to history successfully!' });
      Toast.success("Invoice saved to history successfully!");
    } catch (error) {
      console.error('Error saving invoice to database:', error);
      // Don't prevent PDF download if database save fails
      console.warn('Invoice history save failed, but continuing with PDF download');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!productData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No product data available
        </Typography>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} className="no-print">
          <IconButton onClick={handleBack} sx={{ bgcolor: 'white', boxShadow: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50' }}>
            Invoice
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }} className="no-print">

          <PDFDownloadLink
            document={
              <InvoicePDF
                productData={productData}
                productImageBase64={productImageBase64}
                invoiceNumber={invoiceNumber}
                invoiceDate={invoiceDate}
                companyInfo={companyInfo}
                adminSignature={adminSignatureImage}
                organizerSignature={organizerSignatureImage}
                adminDate={adminDate}
                organizerDate={organizerDate}
              />
            }
            fileName={`Invoice-${invoiceNumber}.pdf`}
          >
            {({ blob, url, loading, error }) => (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                disabled={loading}
                onClick={handleDownload}
                sx={{
                  bgcolor: '#28a745',
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#218838' }
                }}
              >
                {loading ? 'Generating PDF...' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </Box>
      </Box>

      {/* Alert Messages */}
      {alert && (
        <Box sx={{ mb: 2 }}>
          <Paper sx={{
            p: 2,
            bgcolor: alert.type === 'success' ? '#d4edda' : '#f8d7da',
            borderColor: alert.type === 'success' ? '#c3e6cb' : '#f5c6cb',
            color: alert.type === 'success' ? '#155724' : '#721c24',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="body2">{alert.message}</Typography>
            <IconButton size="small" onClick={() => setAlert(null)}>
              <CloseIcon />
            </IconButton>
          </Paper>
        </Box>
      )}

      {/* Invoice Content */}
      <Paper ref={invoiceContentRef} sx={{ p: 4, bgcolor: 'white', boxShadow: 3, borderRadius: 3 }}>
        {/* Invoice Header */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                  {companyInfo.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {companyInfo.address}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Phone: {companyInfo.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Email: {companyInfo.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Website: {companyInfo.website}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50', mb: 2 }}>
                  INVOICE
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Invoice Number:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {invoiceNumber}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Date:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {invoiceDate}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Product Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2c3e50' }}>
            Product Details
          </Typography>

          <Grid container spacing={3}>
            {/* Product Image */}
            <Grid item xs={12} md={4}>
              <Box sx={{
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                p: 2,
                minHeight: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {Array.isArray(productData.images) && productData.images.length > 0 ? (
                  <img
                    src={`${BACKEND_URL}/uploads/${productData.images[0].split('/').pop()}`}
                    alt={productData.brand}
                    style={{
                      maxWidth: '100%',
                      maxHeight: 180,
                      objectFit: 'contain',
                      borderRadius: 8
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No Image Available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Product Details */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                    {productData.brand || 'Unknown Brand'}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#6c757d', mb: 2 }}>
                    {productData.model || 'Unknown Model'}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Reference Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {productData.refNo || 'Not specified'}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Year
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {productData.year || 'Not specified'}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Condition
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {productData.condition || 'Not specified'}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={productData.status || 'Available'}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Grid>

                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Currency
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {productData.currency || 'USD'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {productData.description || 'No description available'}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Price Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: '#f8f9fa', border: '2px solid #e9ecef' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                    Price Information
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Listed Price:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {productData.priceListed ? `${productData.priceListed} ${productData.currency || 'USD'}` : 'Not set'}
                    </Typography>
                  </Box>
                  {productData.pricePaid && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Purchase Price:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {productData.pricePaid} {productData.currency || 'USD'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Signature Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2c3e50' }}>
            Authorization
          </Typography>

          <Grid container spacing={4}>
            {/* Company Administrator Signature */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                border: '2px dashed #dee2e6',
                borderRadius: 2,
                p: 3,
                minHeight: 150,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                    Company Administrator
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This invoice has been reviewed and approved by the company administrator.
                  </Typography>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Signature:
                  </Typography>
                  <Box sx={{
                    position: 'relative',
                    height: 80,
                    border: '1px solid #dee2e6',
                    borderRadius: 1,
                    bgcolor: '#f8f9fa',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '#3a8bfd'
                    }
                  }}
                    onClick={() => handleSignatureClick('admin')}
                  >
                    <canvas
                      ref={adminCanvasRef}
                      style={{
                        width: '100%',
                        height: '100%',
                        cursor: isDrawing && activeSignature === 'admin' ? 'crosshair' : 'pointer',
                        touchAction: 'none'
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'admin')}
                      onMouseMove={(e) => handleMouseMove(e, 'admin')}
                      onMouseUp={() => handleMouseUp('admin')}
                      onMouseLeave={() => handleMouseUp('admin')}
                      onTouchStart={(e) => handleTouchStart(e, 'admin')}
                      onTouchMove={(e) => handleTouchMove(e, 'admin')}
                      onTouchEnd={() => handleTouchEnd('admin')}
                    />
                    {activeSignature !== 'admin' && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          pointerEvents: 'none'
                        }}
                      >
                        Click to sign here
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <TextField
                      size="small"
                      label="Date"
                      value={adminDate}
                      onChange={(e) => setAdminDate(e.target.value)}
                      sx={{ width: '60%' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => clearSignature('admin')}
                      sx={{ color: '#dc3545' }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Organizer Signature */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                border: '2px dashed #dee2e6',
                borderRadius: 2,
                p: 3,
                minHeight: 150,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                    Organizer
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This invoice has been prepared and verified by the organizer.
                  </Typography>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Signature:
                  </Typography>
                  <Box sx={{
                    position: 'relative',
                    height: 80,
                    border: '1px solid #dee2e6',
                    borderRadius: 1,
                    bgcolor: '#f8f9fa',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '#3a8bfd'
                    }
                  }}
                    onClick={() => handleSignatureClick('organizer')}
                  >
                    <canvas
                      ref={organizerCanvasRef}
                      style={{
                        width: '100%',
                        height: '100%',
                        cursor: isDrawing && activeSignature === 'organizer' ? 'crosshair' : 'pointer',
                        touchAction: 'none'
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'organizer')}
                      onMouseMove={(e) => handleMouseMove(e, 'organizer')}
                      onMouseUp={() => handleMouseUp('organizer')}
                      onMouseLeave={() => handleMouseUp('organizer')}
                      onTouchStart={(e) => handleTouchStart(e, 'organizer')}
                      onTouchMove={(e) => handleTouchMove(e, 'organizer')}
                      onTouchEnd={() => handleTouchEnd('organizer')}
                    />
                    {activeSignature !== 'organizer' && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          pointerEvents: 'none'
                        }}
                      >
                        Click to sign here
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <TextField
                      size="small"
                      label="Date"
                      value={organizerDate}
                      onChange={(e) => setOrganizerDate(e.target.value)}
                      sx={{ width: '60%' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => clearSignature('organizer')}
                      sx={{ color: '#dc3545' }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #dee2e6' }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Thank you for your business. This invoice is valid for 30 days from the date of issue.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Invoice; 
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Pagination,
  Stack,
  Divider,
  Fade
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Forward as ForwardIcon,
  ShoppingCart as CartIcon,
  Lock as LockIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import API from '../../api';
import useAuth from '../../hooks/useAuth';
import { Toast } from '../../components/Alerts/CustomToast';

const AdminTradeDeals = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, dealId: null, dealName: '' });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const [formData, setFormData] = useState({
    sender_name: '',
    sender_number: '',
    product_name: '',
    product_price: '',
    currency: 'USD',
    product_image: '',
    status: 'Pending',
    dealer: '',
    customer: '',
    vehicle_in: '',
    vehicle_out: '',
    deal_value: 0,
    profit: 0,
    commission: 0,
    notes: ''
  });

  // Fetch trade deals from API
  const fetchTradeDeals = async (page = 1) => {
    try {
      setLoading(true);
      const response = await API.get(`/api/admin/trade-deals?page=${page}&limit=10`);
      setDeals(response.data.deals);
      setPagination(response.data.pagination);

      // Debug: Log image paths to help troubleshoot
      console.log('UI console Trade deals loaded:', response.data.deals.map(deal => ({
        id: deal._id,
        product_name: deal.product_name,
        product_image: deal.product_image
      })));
    } catch (error) {
      console.error('Error fetching trade deals:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load trade deals',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeDeals(currentPage);
  }, [currentPage]);

  // Search and filter functions
  const applyFilters = () => {
    let filtered = [...deals];

    // Text search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(deal => {
        switch (searchField) {
          case 'sender_name':
            return deal.sender_name?.toLowerCase().includes(searchLower);
          case 'product_name':
            return deal.product_name?.toLowerCase().includes(searchLower);
          case 'sender_number':
            return deal.sender_number?.toLowerCase().includes(searchLower);
          case 'dealer':
            return deal.dealer?.toLowerCase().includes(searchLower);
          case 'customer':
            return deal.customer?.toLowerCase().includes(searchLower);
          case 'all':
          default:
            return (
              deal.sender_name?.toLowerCase().includes(searchLower) ||
              deal.product_name?.toLowerCase().includes(searchLower) ||
              deal.sender_number?.toLowerCase().includes(searchLower) ||
              deal.dealer?.toLowerCase().includes(searchLower) ||
              deal.customer?.toLowerCase().includes(searchLower) ||
              deal.product_price?.toLowerCase().includes(searchLower)
            );
        }
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(deal => deal.status === statusFilter);
    }

    // Price range filter
    if (priceRange.min !== '' || priceRange.max !== '') {
      filtered = filtered.filter(deal => {
        const price = parseFloat(deal.product_price?.replace(/[^\d.]/g, '') || '0');
        const min = priceRange.min !== '' ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max !== '' ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(deal => {
        const dealDate = new Date(deal.createdAt);
        const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0);
        const endDate = dateRange.end ? new Date(dateRange.end) : new Date();
        return dealDate >= startDate && dealDate <= endDate;
      });
    }

    setFilteredDeals(filtered);
  };

  // Apply filters when search criteria or deals change
  useEffect(() => {
    applyFilters();
  }, [deals, searchTerm, searchField, statusFilter, priceRange, dateRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setSearchField('all');
    setStatusFilter('all');
    setPriceRange({ min: '', max: '' });
    setDateRange({ start: '', end: '' });
    setShowAdvancedSearch(false);
  };

  const getSearchStats = () => {
    const total = deals.length;
    const filtered = filteredDeals.length;
    const stats = {
      total,
      filtered,
      bySender: deals.filter(d => d.sender_name?.toLowerCase().includes(searchTerm.toLowerCase())).length,
      byProduct: deals.filter(d => d.product_name?.toLowerCase().includes(searchTerm.toLowerCase())).length,
      byStatus: deals.filter(d => d.status === statusFilter).length
    };
    return stats;
  };

  // Add some test data for development if no deals are loaded
  useEffect(() => {
    if (deals.length === 0 && !loading) {
      console.log('UI console No deals loaded, this might be due to API issues or empty database');
    }
  }, [deals, loading]);

  const getStatusChip = (status) => {
    const statusConfig = {
      Completed: { color: 'success', icon: <CheckCircleIcon />, label: 'Completed' },
      Pending: { color: 'warning', icon: <PendingIcon />, label: 'Pending' },
      Forwarded: { color: 'info', icon: <ForwardIcon />, label: 'Forwarded' },
      Direct: { color: 'primary', icon: <ScheduleIcon />, label: 'Direct' },
      Cancelled: { color: 'error', icon: <CancelIcon />, label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.Pending;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const handleAddDeal = () => {
    setDialogMode('add');
    setSelectedDeal(null);
    setFormData({
      sender_name: '',
      sender_number: '',
      product_name: '',
      product_price: '',
      currency: 'USD',
      product_image: '',
      status: 'Pending',
      dealer: '',
      customer: '',
      vehicle_in: '',
      vehicle_out: '',
      deal_value: 0,
      profit: 0,
      commission: 0,
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleEditDeal = (deal) => {
    setDialogMode('edit');
    setSelectedDeal(deal);
    setFormData({
      sender_name: deal.sender_name || '',
      sender_number: deal.sender_number || '',
      product_name: deal.product_name || '',
      product_price: deal.product_price || '',
      currency: deal.currency || 'USD',
      product_image: deal.product_image || '',
      status: deal.status || 'Pending',
      dealer: deal.dealer || '',
      customer: deal.customer || '',
      vehicle_in: deal.vehicle_in || '',
      vehicle_out: deal.vehicle_out || '',
      deal_value: deal.deal_value || 0,
      profit: deal.profit || 0,
      commission: deal.commission || 0,
      notes: deal.notes || ''
    });
    setOpenDialog(true);
  };

  const handleViewDeal = (deal) => {
    setDialogMode('view');
    setSelectedDeal(deal);
    setOpenDialog(true);
  };

  const handleDeleteDeal = async (dealId) => {
    try {
      await API.delete(`/api/admin/trade-deals/${dealId}`);
      fetchTradeDeals(currentPage);
      setSnackbar({
        open: true,
        message: 'Deal deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting deal:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete deal',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (deal) => {
    setDeleteConfirm({
      open: true,
      dealId: deal._id,
      dealName: deal.product_name
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.dealId) {
      await handleDeleteDeal(deleteConfirm.dealId);
      setDeleteConfirm({ open: false, dealId: null, dealName: '' });
    }
  };

  const handleSaveDeal = async () => {
    try {
      if (dialogMode === 'add') {
        await API.post('/api/admin/trade-deals', formData);
        fetchTradeDeals(currentPage);
        setSnackbar({
          open: true,
          message: 'Deal added successfully',
          severity: 'success'
        });
      } else {
        await API.put(`/api/admin/trade-deals/${selectedDeal._id}`, formData);
        fetchTradeDeals(currentPage);
        setSnackbar({
          open: true,
          message: 'Deal updated successfully',
          severity: 'success'
        });
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving deal:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save deal',
        severity: 'error'
      });
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Image upload handling
  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await API.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      setSnackbar({
        open: true,
        message: 'Failed to upload image',
        severity: 'error'
      });
      return null;
    }
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) {
      return imagePath;
    }

    // Handle different image path formats
    if (imagePath.startsWith('/')) {
      return imagePath;
    }

    // Try different possible paths for the image
    const possiblePaths = [
      `/uploads/${imagePath}`,
      `/public/uploads/${imagePath}`,
      `/${imagePath}`,
      imagePath
    ];

    console.log('UI console Trying image paths:', possiblePaths);
    return possiblePaths[0]; // Return the first path for now
  };

  // Helper function to render image with fallback
  const renderImage = (imagePath, alt, sx = {}) => {
    const imageUrl = getImageUrl(imagePath);

    if (!imageUrl) {
      return (
        <Box
          sx={{
            ...sx,
            bgcolor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #e0e0e0'
          }}
        >
          <Typography variant="caption" color="textSecondary">
            📷
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        component="img"
        src={imageUrl}
        alt={alt}
        sx={{
          ...sx,
          objectFit: 'cover',
          border: '2px solid #e0e0e0'
        }}
        onError={(e) => {
          console.log('UI console Image failed to load:', imagePath, 'UI console URL tried:', imageUrl);
          Toast.error('Image failed to load');

          e.target.style.display = 'none';
          // Show fallback
          const fallback = document.createElement('div');
          fallback.innerHTML = '📷';
          fallback.style.cssText = `
            width: ${sx.width || '60px'};
            height: ${sx.height || '60px'};
            background-color: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #e0e0e0;
            border-radius: ${sx.borderRadius || '8px'};
          `;
          e.target.parentNode.appendChild(fallback);
        }}
        onLoad={() => {
          console.log('Image loaded successfully:', imagePath, 'URL:', imageUrl);
        }}
      />
    );
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        handleFormChange('product_image', imageUrl);
        setSnackbar({
          open: true,
          message: 'Image uploaded successfully',
          severity: 'success'
        });
      }
    }
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
    fetchTradeDeals(newPage);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={40} />
        <Typography variant="h6" color="textSecondary" ml={2}>
          Loading trade deals...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <Box >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🚗 Trade Deals Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Manage and monitor all vehicle trade deals across dealerships
          </Typography>
          {user && (
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              👤 Logged in as: {user.fullName || user.email} ({user.role || 'User'})
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDeal}
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)',
              transform: 'scale(1.05)'
            },
            borderRadius: 2,
            px: 3,
            py: 1,
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Add New Deal
        </Button>
      </Box>

      {/* Search and Filter Interface */}
      <Paper elevation={2} sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        border: '1px solid #e2e8f0'
      }}>
        <Grid container spacing={3} alignItems="center">
          {/* Basic Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon />
                  </IconButton>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'white'
                }
              }}
            />
          </Grid>

          {/* Search Field Selector */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Search In</InputLabel>
              <Select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                label="Search In"
                sx={{ bgcolor: 'white', borderRadius: 2 }}
              >
                <MenuItem value="all">All Fields</MenuItem>
                <MenuItem value="sender_name">Sender Name</MenuItem>
                <MenuItem value="product_name">Product Name</MenuItem>
                <MenuItem value="sender_number">Phone Number</MenuItem>
                <MenuItem value="dealer">Dealer</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
                sx={{ bgcolor: 'white', borderRadius: 2 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Forwarded">Forwarded</MenuItem>
                <MenuItem value="Direct">Direct</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Advanced Search Toggle */}
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              startIcon={showAdvancedSearch ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              {showAdvancedSearch ? 'Hide Advanced' : 'Advanced'}
            </Button>
          </Grid>

          {/* Clear Filters */}
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
              fullWidth
              sx={{ borderRadius: 2, color: 'error.main' }}
            >
              Clear All
            </Button>
          </Grid>
        </Grid>

        {/* Advanced Search Options */}
        {showAdvancedSearch && (
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e2e8f0' }}>
            <Grid container spacing={3}>
              {/* Price Range */}
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" gutterBottom>Price Range</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      size="small"
                      sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      size="small"
                      sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Date Range */}
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" gutterBottom>Date Range</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      size="small"
                      sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      size="small"
                      sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Search Statistics */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" gutterBottom>Search Results</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Chip
                        label={`Total: ${getSearchStats().total}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Chip
                        label={`Found: ${getSearchStats().filtered}`}
                        color="success"
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Chip
                        label={`Filtered: ${getSearchStats().total - getSearchStats().filtered}`}
                        color="warning"
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Search Results Summary */}
        {(searchTerm || statusFilter !== 'all' || priceRange.min || priceRange.max || dateRange.start || dateRange.end) && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 2, color: 'white' }}>
            <Typography variant="body2">
              Showing {filteredDeals.length} of {deals.length} deals
              {searchTerm && ` matching "${searchTerm}"`}
              {statusFilter !== 'all' && ` with status "${statusFilter}"`}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Deals Table */}
      <Paper elevation={3} sx={{
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{

                '& th': {
                  fontWeight: 'bold',
                  color: '#7b7b7b',
                  fontSize: '0.95rem',
                  borderBottom: '2px solid #e0e0e0',
                  whiteSpace: 'nowrap',
                  padding: '12px 8px'
                }
              }}>
                <TableCell sx={{ minWidth: 80 }}>Image</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Sender</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Product</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Price & Currency</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Dealer</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Value</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Date</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDeals.map((deal, index) => (
                <TableRow
                  key={deal._id}
                  hover
                  sx={{
                    '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
                    '&:hover': {
                      bgcolor: '#f0f8ff',
                      transition: 'all 0.2s ease-in-out'
                    },
                    transition: 'all 0.2s ease-in-out',
                    '& td': {
                      padding: '12px 8px',
                      whiteSpace: 'nowrap'
                    }
                  }}
                >
                  <TableCell>
                    <Fade in={true} timeout={500 + index * 100}>
                      <Box
                        onClick={() => handleViewDeal(deal)}
                        sx={{ cursor: 'pointer' }}
                      >
                        {renderImage(deal.product_image, deal.product_name, {
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          }
                        })}
                      </Box>
                    </Fade>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600" color="primary">
                        {deal.sender_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        📞 {deal.sender_number}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500" color="secondary.main">
                      {deal.product_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary" fontWeight="600">
                      {deal.product_price} {deal.currency || 'USD'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(deal.status)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {deal.dealer || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" color="primary">
                      ${deal.deal_value ? deal.deal_value.toLocaleString() : '0'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(deal.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Deal Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDeal(deal)}
                          sx={{
                            color: '#3a8bfd',
                            '&:hover': {
                              bgcolor: '#e3f2fd',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Deal">
                        <IconButton
                          size="small"
                          onClick={() => handleEditDeal(deal)}
                          sx={{
                            color: '#ff9800',
                            '&:hover': {
                              bgcolor: '#fff3e0',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Deal">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(deal)}
                          sx={{
                            color: '#f44336',
                            '&:hover': {
                              bgcolor: '#ffebee',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Stack spacing={2}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
            <Typography variant="body2" color="textSecondary" textAlign="center">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} deals
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Deal Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          {dialogMode === 'add' ? (
            <>
              <AddIcon />
              Add New Trade Deal
            </>
          ) : dialogMode === 'edit' ? (
            <>
              <EditIcon />
              Edit Trade Deal
            </>
          ) : (
            <>
              <ViewIcon />
              View Deal Details
            </>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {dialogMode === 'view' && selectedDeal ? (
            <Box>
              <Grid container spacing={4}>
                {/* Product Image Section */}
                {selectedDeal.product_image && (
                  <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Product Image
                      </Typography>
                      {renderImage(selectedDeal.product_image, selectedDeal.product_name, {
                        width: '100%',
                        maxWidth: 300,
                        height: 250,
                        borderRadius: 2
                      })}
                    </Paper>
                  </Grid>
                )}

                {/* Details Section */}
                <Grid item xs={12} md={selectedDeal.product_image ? 8 : 12}>
                  <Grid container spacing={3}>
                    {/* Sender Information */}
                    <Grid item xs={12} md={6}>
                      <Paper elevation={1} sx={{ p: 3, bgcolor: '#f8f9fa' }}>
                        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                            <Typography variant="caption">S</Typography>
                          </Avatar>
                          Sender Information
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Name:</strong> {selectedDeal.sender_name}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Number:</strong> {selectedDeal.sender_number}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Status:</strong> {getStatusChip(selectedDeal.status)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Date:</strong> {new Date(selectedDeal.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Product Details */}
                    <Grid item xs={12} md={6}>
                      <Paper elevation={1} sx={{ p: 3, bgcolor: '#fff3e0' }}>
                        <Typography variant="h6" gutterBottom color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'warning.main' }}>
                            <Typography variant="caption">P</Typography>
                          </Avatar>
                          Product Details
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Product:</strong> {selectedDeal.product_name}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Price:</strong> {selectedDeal.product_price} {selectedDeal.currency || 'USD'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Deal Value:</strong> ${selectedDeal.deal_value ? selectedDeal.deal_value.toLocaleString() : '0'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Profit:</strong> ${selectedDeal.profit ? selectedDeal.profit.toLocaleString() : '0'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Commission:</strong> ${selectedDeal.commission ? selectedDeal.commission.toLocaleString() : '0'}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Deal Information */}
                    <Grid item xs={12} md={6}>
                      <Paper elevation={1} sx={{ p: 3, bgcolor: '#e8f5e8' }}>
                        <Typography variant="h6" gutterBottom color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'success.main' }}>
                            <Typography variant="caption">D</Typography>
                          </Avatar>
                          Deal Information
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Dealer:</strong> {selectedDeal.dealer || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Customer:</strong> {selectedDeal.customer || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Vehicle In:</strong> {selectedDeal.vehicle_in || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Vehicle Out:</strong> {selectedDeal.vehicle_out || 'N/A'}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Notes Section */}
                    {selectedDeal.notes && (
                      <Grid item xs={12} md={6}>
                        <Paper elevation={1} sx={{ p: 3, bgcolor: '#f3e5f5' }}>
                          <Typography variant="h6" gutterBottom color="secondary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
                              <Typography variant="caption">N</Typography>
                            </Avatar>
                            Notes
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              {selectedDeal.notes}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              {/* Progress Indicator */}
              <Box sx={{ mb: 4, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                    <Typography variant="caption">📝</Typography>
                  </Avatar>
                  {dialogMode === 'add' ? 'Create New Trade Deal' : 'Update Trade Deal'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Please fill in all required information below. Fields marked with * are required.
                </Typography>
              </Box>

              {/* Step 1: Sender Information */}
              <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                    <Typography variant="caption">👤</Typography>
                  </Avatar>
                  Step 1: Sender Information
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Enter the sender's contact information. Both fields are required.
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Sender Name *"
                      value={formData.sender_name}
                      onChange={(e) => handleFormChange('sender_name', e.target.value)}
                      variant="outlined"
                      required
                      placeholder="Enter sender's full name"
                      helperText="Enter the sender's complete name"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Sender Phone Number *"
                      value={formData.sender_number}
                      onChange={(e) => handleFormChange('sender_number', e.target.value)}
                      variant="outlined"
                      required
                      placeholder="+1 (555) 123-4567"
                      helperText="Include country code if applicable"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Step 2: Product Information */}
              <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#fff3e0', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'warning.main' }}>
                    <Typography variant="caption">🚗</Typography>
                  </Avatar>
                  Step 2: Product Information
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Provide details about the vehicle or product being traded.
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Product Name *"
                      value={formData.product_name}
                      onChange={(e) => handleFormChange('product_name', e.target.value)}
                      variant="outlined"
                      required
                      placeholder="e.g., BMW X5 2023, Mercedes C-Class 2022"
                      helperText="Enter the vehicle make, model, and year"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'warning.main',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Product Price *"
                      value={formData.product_price}
                      onChange={(e) => handleFormChange('product_price', e.target.value)}
                      variant="outlined"
                      required
                      placeholder="50000"
                      helperText="Enter the price without currency symbol"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'warning.main',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Currency *</InputLabel>
                      <Select
                        value={formData.currency}
                        onChange={(e) => handleFormChange('currency', e.target.value)}
                        label="Currency *"
                      >
                        <MenuItem value="USD">💵 USD</MenuItem>
                        <MenuItem value="USDT">₮ USDT</MenuItem>
                        <MenuItem value="EUR">€ EUR</MenuItem>
                        <MenuItem value="HKD">HK$ HKD</MenuItem>
                        <MenuItem value="GBP">£ GBP</MenuItem>
                      </Select>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                        Select the currency for the product price
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status *</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => handleFormChange('status', e.target.value)}
                        label="Status *"
                      >
                        <MenuItem value="Pending">⏳ Pending</MenuItem>
                        <MenuItem value="Forwarded">📤 Forwarded</MenuItem>
                        <MenuItem value="Direct">🎯 Direct</MenuItem>
                        <MenuItem value="Completed">✅ Completed</MenuItem>
                        <MenuItem value="Cancelled">❌ Cancelled</MenuItem>
                      </Select>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                        Current status of this trade deal
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        📷 Product Image
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Upload a clear image of the vehicle or product. Recommended: JPG, PNG format, max 5MB.
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        {formData.product_image ? (
                          renderImage(formData.product_image, "Product", {
                            width: 120,
                            height: 120,
                            borderRadius: 2
                          })
                        ) : (
                          <Box
                            sx={{
                              width: 120,
                              height: 120,
                              bgcolor: '#f5f5f5',
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid #e0e0e0',
                              flexDirection: 'column',
                              gap: 1
                            }}
                          >
                            <Typography variant="caption" color="textSecondary">
                              📷
                            </Typography>
                            <Typography variant="caption" color="textSecondary" textAlign="center">
                              No Image
                            </Typography>
                          </Box>
                        )}
                        <Box display="flex" flexDirection="column" gap={1}>
                          <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="image-upload"
                            type="file"
                            onChange={handleImageChange}
                          />
                          <label htmlFor="image-upload">
                            <Button
                              variant="outlined"
                              component="span"
                              size="small"
                              startIcon={<AddIcon />}
                              sx={{ minWidth: 120 }}
                            >
                              Upload Image
                            </Button>
                          </label>
                          {formData.product_image && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleFormChange('product_image', '')}
                              startIcon={<DeleteIcon />}
                              sx={{ minWidth: 120 }}
                            >
                              Remove Image
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Step 3: Deal Information */}
              <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: '#e8f5e8' }}>
                <Typography variant="h6" gutterBottom color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'success.main' }}>
                    <Typography variant="caption">D</Typography>
                  </Avatar>
                  Deal Information
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Additional details about the trade deal and parties involved (optional fields).
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Dealer"
                      value={formData.dealer}
                      onChange={(e) => handleFormChange('dealer', e.target.value)}
                      variant="outlined"
                      placeholder="Dealer name or company"
                      helperText="Name of the dealer handling this trade"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Customer"
                      value={formData.customer}
                      onChange={(e) => handleFormChange('customer', e.target.value)}
                      variant="outlined"
                      placeholder="Customer name"
                      helperText="Name of the customer making the trade"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Vehicle In"
                      value={formData.vehicle_in}
                      onChange={(e) => handleFormChange('vehicle_in', e.target.value)}
                      variant="outlined"
                      placeholder="e.g., BMW X5 2020"
                      helperText="Vehicle being traded in by customer"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Vehicle Out"
                      value={formData.vehicle_out}
                      onChange={(e) => handleFormChange('vehicle_out', e.target.value)}
                      variant="outlined"
                      placeholder="e.g., Mercedes C-Class 2023"
                      helperText="Vehicle being purchased by customer"
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Financial Information Section */}
              <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: '#f3e5f5' }}>
                <Typography variant="h6" gutterBottom color="secondary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
                    <Typography variant="caption">$</Typography>
                  </Avatar>
                  Financial Information
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Financial details of the trade deal (optional fields).
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Deal Value"
                      type="number"
                      value={formData.deal_value}
                      onChange={(e) => handleFormChange('deal_value', parseFloat(e.target.value) || 0)}
                      variant="outlined"
                      placeholder="0"
                      helperText="Total value of the deal"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Profit"
                      type="number"
                      value={formData.profit}
                      onChange={(e) => handleFormChange('profit', parseFloat(e.target.value) || 0)}
                      variant="outlined"
                      placeholder="0"
                      helperText="Profit from this deal"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Commission"
                      type="number"
                      value={formData.commission}
                      onChange={(e) => handleFormChange('commission', parseFloat(e.target.value) || 0)}
                      variant="outlined"
                      placeholder="0"
                      helperText="Commission earned on this deal"
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Notes Section */}
              <Paper elevation={1} sx={{ p: 3, bgcolor: '#fff8e1' }}>
                <Typography variant="h6" gutterBottom color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'warning.main' }}>
                    <Typography variant="caption">N</Typography>
                  </Avatar>
                  Additional Notes
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Add any additional information, special conditions, or notes about this trade deal.
                </Typography>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  variant="outlined"
                  placeholder="Enter any additional notes, special conditions, or important details about this trade deal..."
                  helperText="Optional: Add any relevant information that might be useful for tracking this deal"
                />
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            size="large"
            sx={{ minWidth: 120 }}
          >
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogMode !== 'view' && (
            <Button
              variant="contained"
              onClick={handleSaveDeal}
              size="large"
              startIcon={dialogMode === 'add' ? <AddIcon /> : <EditIcon />}
              sx={{
                bgcolor: '#3a8bfd',
                '&:hover': { bgcolor: '#2d6bc7' },
                px: 4,
                minWidth: 140
              }}
            >
              {dialogMode === 'add' ? 'Create Deal' : 'Update Deal'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, dealId: null, dealName: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          bgcolor: 'error.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <DeleteIcon />
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete the deal "{deleteConfirm.dealName}"?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setDeleteConfirm({ open: false, dealId: null, dealName: '' })}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            startIcon={<DeleteIcon />}
          >
            Delete Deal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminTradeDeals; 
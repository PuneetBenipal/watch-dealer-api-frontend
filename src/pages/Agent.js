import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import "../assets/css/agent.css"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  Chat,
  Category,
  Business,
  Close,
  ShoppingCart,
  Add,
  Remove,
} from '@mui/icons-material';
import api from '../api';
import { BACKEND_URL } from '../config';

const Agent = () => {
  const { user } = useContext(AuthContext);

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    currency: '',
    companyId: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showPublicBanner, setShowPublicBanner] = useState(true)

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Public path state
  const [isPublic, setIsPublic] = useState(false);
  const [publicPathLoading, setPublicPathLoading] = useState(false);

  // Fetch inventory items
  useEffect(() => {
    fetchInventory();
    fetchConversations();
    checkCurrentVisibility();
  }, []);

  const checkCurrentVisibility = async () => {
    try {
      // Get user's inventory to check if any items are public
      const response = await api.get('/api/inventory');
      const userInventory = response.data || [];
      const hasPublicItems = userInventory.some(item => item.visibility === 'public');
      setIsPublic(hasPublicItems);
      console.log('UI console Current visibility status:', hasPublicItems);
    } catch (err) {
      console.error('UI console Error checking visibility status:', err);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      console.log('UI console Fetching inventory from /api/inventory/public...');
      const response = await api.get('/api/inventory/public');
      console.log('UI console Inventory response:', response.data);
      setInventory(response.data || []);

      // Extract unique companies from inventory
      const uniqueCompanies = [...new Map(
        response.data
          .filter(item => item.companyId)
          .map(item => [item.companyId._id, item.companyId])
      ).values()];
      setCompanies(uniqueCompanies);

      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handlePublicPathToggle = async () => {
    try {
      setPublicPathLoading(true);
      const newVisibility = isPublic ? 'private' : 'public';
      console.log('UI console Toggling visibility to:', newVisibility);
      console.log('UI console User ID:', user?._id);

      const response = await api.post('/api/inventory/toggle-visibility', {
        visibility: newVisibility
      });

      console.log('UI console Toggle response:', response);

      setIsPublic(!isPublic);
      // Refresh inventory to show updated visibility
      await fetchInventory();

      // Show success message
      alert(`All items are now ${newVisibility}`);
    } catch (err) {
      console.error('Error toggling public path:', err);
      console.error('Error details:', err.response?.data || err.message);
      alert('Failed to update public path');
    } finally {
      setPublicPathLoading(false);
    }
  };

  const getPublicProfileUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/public/${user?._id}`;
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/api/conversations/user/conversations');
      setConversations(response.data || []);

      // Calculate total unread count
      const totalUnread = response.data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout
    console.log('UI console Logout clicked');
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation.adminId) return null;
    return conversation.adminId;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = (item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.refNo?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesCondition = !filters.condition || item.condition === filters.condition;
    const matchesCurrency = !filters.currency || item.currency === filters.currency;
    const matchesCompany = !filters.companyId || (item.companyId && item.companyId._id === filters.companyId);

    const price = parseFloat(item.priceListed);
    const matchesMinPrice = !filters.minPrice || price >= parseFloat(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || price <= parseFloat(filters.maxPrice);

    const year = parseInt(item.year);
    const matchesMinYear = !filters.minYear || year >= parseInt(filters.minYear);
    const matchesMaxYear = !filters.maxYear || year <= parseInt(filters.maxYear);

    return matchesSearch && matchesStatus && matchesCondition && matchesCurrency &&
      matchesMinPrice && matchesMaxPrice && matchesMinYear && matchesMaxYear && matchesCompany;
  });

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      currency: '',
      companyId: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '') || searchTerm !== '';
  };

  const handleOpenDetailModal = (item) => {
    setSelectedItem(item);
    setDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedItem(null);
    setDetailModal(false);
  };

  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Available': 'success',
      'On Hold': 'warning',
      'Sold': 'error',
      'Reserved': 'info',
      'In Transit': 'primary',
      'Under Repair': 'secondary'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        {/* Main Content */}
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>

          {/* Search and Filter Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box className='ui-user-filter-header'>
              <Typography variant="h6" sx={{ color: '#666' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="Search by name, brand, or model..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      InputProps={{
                        startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                      size='small'
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<FilterList />}
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        Filters
                      </Button>
                      {hasActiveFilters() && (
                        <Button variant="outlined" onClick={clearFilters}>
                          Clear
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Typography>
              <Box className='ui-user-filter-header-right'>
                <Button
                  variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('grid')}
                  startIcon={<Category />}
                >
                  All Products
                </Button>
                <Button
                  variant={viewMode === 'company' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('company')}
                  startIcon={<Business />}
                >
                  By Company
                </Button>
                <Button
                  variant={isPublic ? 'contained' : 'outlined'}
                  onClick={handlePublicPathToggle}
                  disabled={publicPathLoading}
                  startIcon={<Visibility />}
                  sx={{
                    ...(isPublic ? {
                      bgcolor: '#4caf50',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#45a049'
                      }
                    } : {})
                  }}
                >
                  {publicPathLoading ? 'Updating...' : (isPublic ? 'Public Path Active' : 'Make Public Path')}
                </Button>
              </Box>
            </Box>

            {/* Filter Options */}
            {showFilters && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={2} sx={{ width: '150px' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Company</InputLabel>
                    <Select
                      value={filters.companyId}
                      onChange={(e) => handleFilterChange('companyId', e.target.value)}
                      label="Company"
                    >
                      <MenuItem value="">All Companies</MenuItem>
                      {companies.map((company) => (
                        <MenuItem key={company._id} value={company._id}>
                          {company.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2} sx={{ width: '150px' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Available">Available</MenuItem>
                      <MenuItem value="On Hold">On Hold</MenuItem>
                      <MenuItem value="Sold">Sold</MenuItem>
                      <MenuItem value="Reserved">Reserved</MenuItem>
                      <MenuItem value="In Transit">In Transit</MenuItem>
                      <MenuItem value="Under Repair">Under Repair</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2} sx={{ width: '150px' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={filters.condition}
                      onChange={(e) => handleFilterChange('condition', e.target.value)}
                      label="Condition"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="New">New</MenuItem>
                      <MenuItem value="Like New">Like New</MenuItem>
                      <MenuItem value="Excellent">Excellent</MenuItem>
                      <MenuItem value="Good">Good</MenuItem>
                      <MenuItem value="Fair">Fair</MenuItem>
                      <MenuItem value="Poor">Poor</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Min Price"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Max Price"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Min Year"
                    type="number"
                    value={filters.minYear}
                    onChange={(e) => handleFilterChange('minYear', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Max Year"
                    type="number"
                    value={filters.maxYear}
                    onChange={(e) => handleFilterChange('maxYear', e.target.value)}
                  />
                </Grid>
              </Grid>
            )}
          </Paper>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Public Path Status */}
          {isPublic && showPublicBanner && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#e8f5e8', border: '1px solid #4caf50', position: 'relative' }}>
              <IconButton
                size="small"
                onClick={() => setShowPublicBanner(false)}
                sx={{ position: 'absolute', top: 8, right: 8, color: '#2e7d32' }}
              >
                <Close />
              </IconButton>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#2e7d32', mb: 1 }}>
                    🎉 Your Public Path is Active!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Share this link with others to show your inventory:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <TextField
                      value={getPublicProfileUrl()}
                      fullWidth
                      size="small"
                      InputProps={{
                        readOnly: true,
                        sx: { bgcolor: 'white' }
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(getPublicProfileUrl());
                        alert('Public URL copied to clipboard!');
                      }}
                    >
                      Copy
                    </Button>
                  </Box>
                </Box>
                <Visibility sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </Paper>
          )}

          {/* Inventory Display */}
          {viewMode === 'grid' ? (
            // Grid View - All Products
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {filteredInventory.length === 0 ? (
                <Grid item style={{ width: '100%' }}>
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      {hasActiveFilters() ? 'No items match your filters' : 'No inventory items available yet'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {hasActiveFilters()
                        ? 'Try adjusting your search criteria or clearing filters.'
                        : 'Company administrators will add inventory items here for you to browse.'
                      }
                    </Typography>
                    {hasActiveFilters() && (
                      <Button onClick={clearFilters} sx={{ mt: 2 }}>
                        Clear Filters
                      </Button>
                    )}
                  </Paper>
                </Grid>
              ) : (
                filteredInventory.map((item) => (
                  <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item._id}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                      onClick={() => handleOpenDetailModal(item)}
                    >
                      <Box sx={{ position: 'relative' }}>
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={`${BACKEND_URL }/${item.images[0]}`}
                            alt={`${item.brand} ${item.model}`}
                            style={{
                              width: '100%',
                              height: 200,
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: 200,
                              bgcolor: 'grey.200',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography color="text.secondary">No Image</Typography>
                          </Box>
                        )}
                        <Chip
                          label={item.status}
                          color={getStatusColor(item.status)}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8
                          }}
                        />
                      </Box>
                      <CardContent>
                        <Typography variant="h6" noWrap>
                          {item.brand} {item.model}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {item.refNo} • {item.year}
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                          {formatPrice(item.priceListed, item.currency)}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {item.condition}
                          </Typography>
                          <Chip
                            label={item.status}
                            color={getStatusColor(item.status)}
                            size="small"
                          />
                        </Box>
                        {item.companyId && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Business sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {item.companyId.name}
                            </Typography>
                          </Box>
                        )}

                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          ) : (
            // Company View - Products Grouped by Company
            <Box>
              {companies.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No companies available
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Company administrators will add inventory items here for you to browse.
                  </Typography>
                </Paper>
              ) : (
                companies.map((company) => {
                  const companyProducts = filteredInventory.filter(item =>
                    item.companyId && item.companyId._id === company._id
                  );

                  if (companyProducts.length === 0) return null;

                  return (
                    <Paper key={company._id} sx={{ mb: 4, p: 3 }}>
                      {/* Company Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                          src={company.logoUrl}
                          sx={{ width: 60, height: 60, mr: 3 }}
                        >
                          <Business sx={{ fontSize: 30 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {company.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {companyProducts.length} product{companyProducts.length !== 1 ? 's' : ''} available
                          </Typography>
                        </Box>
                      </Box>

                      {/* Company Products Grid */}
                      <Grid container spacing={{ xs: 2, md: 3 }}>
                        {companyProducts.map((item) => (
                          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item._id}>
                            <Card
                              sx={{
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: 4
                                }
                              }}
                              onClick={() => handleOpenDetailModal(item)}
                            >
                              <Box sx={{ position: 'relative' }}>
                                {item.images && item.images.length > 0 ? (
                                  <img
                                    src={`${BACKEND_URL}/${item.images[0]}`}
                                    alt={`${item.brand} ${item.model}`}
                                    style={{
                                      width: '100%',
                                      height: 200,
                                      objectFit: 'cover'
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: '100%',
                                      height: 200,
                                      bgcolor: 'grey.200',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Typography color="text.secondary">No Image</Typography>
                                  </Box>
                                )}
                                <Chip
                                  label={item.status}
                                  color={getStatusColor(item.status)}
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8
                                  }}
                                />
                              </Box>
                              <CardContent>
                                <Typography variant="h6" noWrap>
                                  {item.brand} {item.model}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {item.refNo} • {item.year}
                                </Typography>
                                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                                  {formatPrice(item.priceListed, item.currency)}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {item.condition}
                                  </Typography>
                                  <Chip
                                    label={item.status}
                                    color={getStatusColor(item.status)}
                                    size="small"
                                  />
                                </Box>

                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  );
                })
              )}
            </Box>
          )}

          {/* Item Count */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {viewMode === 'grid'
                ? `Showing ${filteredInventory.length} of ${inventory.length} items`
                : `Showing ${companies.filter(company =>
                  filteredInventory.some(item =>
                    item.companyId && item.companyId._id === company._id
                  )
                ).length} companies with ${filteredInventory.length} total items`
              }
            </Typography>
          </Box>

          <Dialog
            open={detailModal}
            onClose={handleCloseDetailModal}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                p: 2,
                bgcolor: '#fffefc',
              },
            }}
          >
            {selectedItem && (
              <>
                <DialogTitle>
                  <Typography variant="h5" fontWeight={600}>
                    {selectedItem.brand} {selectedItem.model}
                  </Typography>
                </DialogTitle>

                <DialogContent dividers>
                  <Grid container spacing={4}>
                    {/* Image Gallery */}
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          width: '100%',
                          height: 400,
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: 3,
                        }}
                      >
                        {selectedItem.images?.length === 1 ? (
                          <img
                            src={`${BACKEND_URL}/${selectedItem.images[0]}`}
                            alt={`${selectedItem.brand} ${selectedItem.model}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : selectedItem.images?.length > 1 ? (
                          <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={0}
                            slidesPerView={1}
                            navigation
                            loop
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 2500 }}
                            style={{ width: '100%', height: '100%' }}
                          >
                            {selectedItem.images.map((image, index) => (
                              <SwiperSlide key={index}>
                                <img
                                  src={`${BACKEND_URL}/${image}`}
                                  alt={`${selectedItem.brand} ${selectedItem.model} ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              bgcolor: 'grey.100',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography color="text.secondary">No Images Available</Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Company Avatar */}
                      {selectedItem.companyId && (
                        <Box
                          sx={{
                            mt: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1.5,
                            px: 2,
                            width: 'fit-content',
                            backgroundColor: '#fff8ef',
                            borderRadius: '12px',
                            border: '1px solid #c9a063',
                            boxShadow: '0 2px 10px rgba(201, 160, 99, 0.2)',
                          }}
                        >
                          <Tooltip
                            title={selectedItem.companyId.name}
                            placement="bottom"
                            arrow
                            componentsProps={{
                              tooltip: {
                                sx: {
                                  bgcolor: '#c9a063',
                                  color: '#fff',
                                  fontSize: 14,
                                  borderRadius: 1,
                                  px: 2,
                                  py: 1,
                                },
                              },
                              arrow: {
                                sx: {
                                  color: '#c9a063',
                                },
                              },
                            }}
                          >
                            <Avatar
                              src={selectedItem.companyId.logoUrl}
                              alt={selectedItem.companyId.name}
                              sx={{
                                width: 48,
                                height: 48,
                                cursor: 'pointer',
                                border: '2px solid #c9a063',
                                bgcolor: '#fff5e5d4',
                              }}
                            >
                              <Business sx={{ color: '#c9a063' }} />
                            </Avatar>
                          </Tooltip>
                        </Box>
                      )}
                    </Grid>

                    {/* Product Details */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Product Details
                        </Typography>
                        <Grid container spacing={2}>
                          {[
                            { label: 'Brand', value: selectedItem.brand },
                            { label: 'Model', value: selectedItem.model },
                            { label: 'Year', value: selectedItem.year },
                            { label: 'Condition', value: selectedItem.condition },
                          ].map((item, i) => (
                            <Grid item xs={6} key={i}>
                              <Typography variant="body2" color="text.secondary">
                                {item.label}
                              </Typography>
                              <Typography variant="body1">{item.value}</Typography>
                            </Grid>
                          ))}

                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Status
                            </Typography>
                            <Chip
                              label={selectedItem.status}
                              color={getStatusColor(selectedItem.status)}
                              size="small"
                            />
                          </Grid>

                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Price
                            </Typography>
                            <Typography variant="h6" color="primary">
                              {formatPrice(selectedItem.priceListed, selectedItem.currency)}
                            </Typography>
                          </Grid>

                          {selectedItem.refNo && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">
                                Reference Number
                              </Typography>
                              <Typography variant="body1">{selectedItem.refNo}</Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>

                      {/* Description */}
                      {selectedItem.description && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            Description
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedItem.description}
                          </Typography>
                        </Box>
                      )}

                      {/* Buttons */}
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          startIcon={<Chat />}
                          sx={{ bgcolor: '#c9a063', '&:hover': { bgcolor: '#b88b4e' } }}
                          onClick={async () => {
                            try {
                              const response = await api.post('/api/conversations/user/conversations', {
                                adminId: selectedItem.dealerId._id,
                                companyId: selectedItem.companyId._id,
                                initialMessage: `Hi, I'm interested in the ${selectedItem.brand} ${selectedItem.model} (${selectedItem.refNo})`
                              });
                              setChatOpen(true);
                              if (response.data) {
                                setConversations(response.data);
                              }
                            } catch (err) {
                              console.error('Error creating conversation:', err);
                              setChatOpen(true);
                            }
                          }}
                        >
                          Contact Seller
                        </Button>

                        <Button variant="outlined" startIcon={<Visibility />}>
                          View Details
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </DialogContent>

                <DialogActions>
                  <Button onClick={handleCloseDetailModal} sx={{ color: '#c9a063' }}>
                    Close
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </Box>
      </Box>
    </>
  )
};

export default Agent;
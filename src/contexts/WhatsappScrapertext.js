import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { Inventory } from '@mui/icons-material';
import { Toast } from '../components/Alerts/CustomToast';

export const WhatsappContext = createContext();

// Provider component
export const WhatsappProvider = ({ children }) => {
  const [tradeDeals, setTradeDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Fetch trade deals from database
  const fetchTradeDeals = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/admin/trade-deals?page=${page}&limit=${limit}`);
      const { deals, pagination: paginationData } = response.data;

      setTradeDeals(deals);
      setFilteredDeals(deals);
      setPagination(paginationData);

      console.log(`UI console Fetched ${deals.length} trade deals`);
      Toast.success(`Fetched ${deals.length} trade deals`)

    } catch (error) {
      console.error('UI console Error fetching trade deals:', error);
      Toast.error('Failed to fetch trade deals');
      setTradeDeals([]);
      setFilteredDeals([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new trade deal
  const createTradeDeal = async (dealData) => {
    try {
      setLoading(true);
      const response = await api.post('/api/admin/trade-deals', dealData);
      const newDeal = response.data;

      // Add to beginning of the list
      setTradeDeals(prev => [newDeal, ...prev]);
      setFilteredDeals(prev => [newDeal, ...prev]);

      Toast.success('Trade deal created successfully!');
      return newDeal;
    } catch (error) {
      console.error('UI console Error creating trade deal:', error);
      Toast.error('UI console Failed to create trade deal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update trade deal
  const updateTradeDeal = async (id, dealData) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/admin/trade-deals/${id}`, dealData);
      const updatedDeal = response.data;

      // Update in both arrays
      setTradeDeals(prev => prev.map(deal => deal._id === id ? updatedDeal : deal));
      setFilteredDeals(prev => prev.map(deal => deal._id === id ? updatedDeal : deal));

      Toast.success('Trade deal updated successfully!');
      return updatedDeal;
    } catch (error) {
      console.error('UI console Error updating trade deal:', error);
      Toast.error('UI console Failed to update trade deal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete trade deal
  const deleteTradeDeal = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/admin/trade-deals/${id}`);

      // Remove from both arrays
      setTradeDeals(prev => prev.filter(deal => deal._id !== id));
      setFilteredDeals(prev => prev.filter(deal => deal._id !== id));

      Toast.success('Trade deal deleted successfully!');
    } catch (error) {
      console.error('UI console Error deleting trade deal:', error);
      Toast.error('UI console Failed to delete trade deal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Search and filter functionality
  const searchDeals = (term) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter);
  };

  const filterByStatus = (status) => {
    setStatusFilter(status);
    applyFilters(searchTerm, status);
  };

  const applyFilters = (searchTerm, statusFilter) => {
    let filtered = [...tradeDeals];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(deal =>
        deal.sender_name?.toLowerCase().includes(term) ||
        deal.sender_number?.toLowerCase().includes(term) ||
        deal.product_name?.toLowerCase().includes(term) ||
        deal.dealer?.toLowerCase().includes(term) ||
        deal.customer?.toLowerCase().includes(term) ||
        deal.notes?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(deal => deal.status === statusFilter);
    }

    setFilteredDeals(filtered);
  };

  // Get analytics data
  const getAnalytics = async () => {
    try {
      const response = await api.get('/api/admin/trade-deals/analytics');
      return response.data;
    } catch (error) {
      console.error('UI console Error fetching analytics:', error);
      Toast.error('UI console Failed to fetch analytics');
      return null;
    }
  };

  // Count search
  const CountSearch = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log("UI console CountSearch",user);
      const response = await api.post('api/dealer/count', user);
      console.log("UI console CountSearch response",response);
    } catch (error) {
      console.log(); console.error('UI cosnole Error fetching analytics:', error);
    }
  }

  //Add Inventory
  const AddInventory = async (data) => {
    try {
      const dealer_data = JSON.parse(localStorage.getItem("user"));
      const sender_data = {
        ...data,
        ...dealer_data
      }
      const response = await api.post('/api/inventory/addinventory', sender_data);
      console.log("UI console AddInventory response:", response.data.success);

      if (response.data.success === true) {
        Toast.success('Inventory item added successfully!');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to add inventory');
      }
    }
    catch (err) {
      console.error("UI console Error from Inventory:", err);
      Toast.error(err.message || 'Failed to add inventory item');
      throw err;
    }
  }

  // Initialize data on mount
  useEffect(() => {
    fetchTradeDeals();
  }, []);

  // Update filtered data when trade deals change
  useEffect(() => {
    applyFilters(searchTerm, statusFilter);
  }, [tradeDeals]);

  const contextValue = {
    // Data
    tradeDeals,
    filteredDeals,
    loading,
    searchTerm,
    statusFilter,
    pagination,

    // Actions
    fetchTradeDeals,
    createTradeDeal,
    updateTradeDeal,
    deleteTradeDeal,
    searchDeals,
    filterByStatus,
    getAnalytics,
    CountSearch,
    AddInventory,
    // Setters
    setSearchTerm,
    setStatusFilter
  };

  return (
    <WhatsappContext.Provider value={contextValue}>
      {children}
    </WhatsappContext.Provider>
  );
};

// Custom hook to use the context
export const useWhatsappData = () => {
  const context = useContext(WhatsappContext);
  if (!context) {
    throw new Error('useWhatsappData must be used within a WhatsappProvider');
  }
  return context;
};

// Export both the context and the hook for backwards compatibility
export const Whatsappdata = WhatsappContext;


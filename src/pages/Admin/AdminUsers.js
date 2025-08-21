import React, { useState, useEffect, useCallback } from 'react';
import {
  SearchIcon,
  PencilIcon,
  TrashIcon,
  BanIcon as NoSymbolIcon,
  MinusCircleIcon as CircleIcon,
  CheckCircleIcon,
  CogIcon as Cog6ToothIcon,
  UserGroupIcon,
} from '@heroicons/react/outline';
import API from '../../api';
import { Toast } from '../../components/Alerts/CustomToast';
// import Toast from 'react-hot-Toast';


const AdminUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [searchField, setSearchField] = useState('all');
  const [searchResults, setSearchResults] = useState({
    total: 0,
    byName: 0,
    byEmail: 0,
    byRole: 0
  });



  // New state variables for enhanced functionality
  const [userDetails, setUserDetails] = useState(null);
  const [userSettings, setUserSettings] = useState({});
  const [activeTab, setActiveTab] = useState('details');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Assume authenticated by default for admin panel
  const [userRole, setUserRole] = useState('admin');

  // Fetch users from database
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/api/admin/users');
      // Handle the response structure: { users: [...], pagination: {...} }
      const users = response.data.users || response.data || [];

      // If no users found, add sample data for demonstration
      if (users.length === 0) {
        const sampleUsers = [
          {
            id: '1',
            email: 'john.doe@example.com',
            fullName: 'John Doe',
            name: 'John Doe',
            role: 'admin',
            status: 'online',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-03-20').toISOString(),
            lastLogin: new Date('2024-03-20').toISOString(),
            subscriptionStatus: 'active',
            usageCount: 150
          },
        ];
        setData(sampleUsers);
        setFilteredData(sampleUsers);
      } else {
        setData(users);
        setFilteredData(users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      // Fallback to empty array on error
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [data]);

  // Enhanced search and filter functionality with field classification
  const applyFilters = useCallback(() => {
    // Ensure data is always an array
    if (!Array.isArray(data)) {
      console.warn('Data is not an array:', data);
      setFilteredData([]);
      return;
    }

    let filtered = data;
    const searchLower = searchTerm.toLowerCase().trim();

    // Initialize search results tracking
    let searchResultsCount = {
      total: 0,
      byName: 0,
      byEmail: 0,
      byRole: 0
    };

    // Apply search filter with field classification
    if (searchLower) {
      const searchMatches = (Array.isArray(data) ? data : []).filter(user => {
        const nameMatch = (user.name?.toLowerCase().includes(searchLower) ||
          user.fullName?.toLowerCase().includes(searchLower));
        const emailMatch = user.email?.toLowerCase().includes(searchLower);
        const roleMatch = user.role?.toLowerCase().includes(searchLower);

        // Count matches by field type
        if (nameMatch) searchResultsCount.byName++;
        if (emailMatch) searchResultsCount.byEmail++;
        if (roleMatch) searchResultsCount.byRole++;

        // Apply field-specific filtering
        switch (searchField) {
          case 'name':
            return nameMatch;
          case 'email':
            return emailMatch;
          case 'role':
            return roleMatch;
          case 'all':
          default:
            return nameMatch || emailMatch || roleMatch;
        }
      });

      filtered = searchMatches;
      searchResultsCount.total = searchMatches.length;
    } else {
      // No search term, reset search results
      searchResultsCount = {
        total: Array.isArray(data) ? data.length : 0,
        byName: 0,
        byEmail: 0,
        byRole: 0
      };
    }

    // Update search results state
    setSearchResults(searchResultsCount);

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Apply visibility filter
    if (visibilityFilter !== 'all') {
      switch (visibilityFilter) {
        case 'active':
          // Show only active accounts (online + offline, not disabled)
          filtered = filtered.filter(user => user.status === 'online' || user.status === 'offline');
          break;
        case 'disabled':
          // Show only disabled accounts
          filtered = filtered.filter(user => user.status === 'disabled');
          break;
        case 'online-only':
          // Show only online accounts
          filtered = filtered.filter(user => user.status === 'online');
          break;
        case 'offline-only':
          // Show only offline accounts
          filtered = filtered.filter(user => user.status === 'offline');
          break;
        default:
          break;
      }
    }

    setFilteredData(filtered);

    // Enhanced logging with search classification
    const filterInfo = [];
    if (searchTerm.trim()) {
      filterInfo.push(`search: "${searchTerm}" in ${searchField}`);
      if (searchField === 'all') {
        filterInfo.push(`(${searchResultsCount.byName} by name, ${searchResultsCount.byEmail} by email, ${searchResultsCount.byRole} by role)`);
      }
    }
    if (statusFilter !== 'all') filterInfo.push(`status: ${statusFilter}`);
    if (visibilityFilter !== 'all') filterInfo.push(`visibility: ${visibilityFilter}`);

    if (filtered.length === 0) {
      console.log('No users found matching filters:', filterInfo.join(', '));
      Toast.warning('No users found matching filters')
    } else {
      console.log(`Found ${filtered.length} user(s) matching filters:`, filterInfo.join(', '));
      Toast.success('Found matching filters')
    }
  }, [data, searchTerm, searchField, statusFilter, visibilityFilter]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSearchFieldChange = (field) => {
    setSearchField(field);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleVisibilityFilter = (visibility) => {
    setVisibilityFilter(visibility);
  };

  // Real-time search on keyup
  const handleSearchKeyUp = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    // The useEffect with applyFilters will handle the real-time filtering
  };

  // Apply filters when search term, status filter, or data changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setLoading(true);
        // Make API call to delete user from database
        await API.delete(`/api/admin/users/${userId}`);

        // Update local data by removing the user
        const updatedData = data.filter(user => (user.id || user._id) !== userId);
        setData(updatedData);
        setFilteredData(updatedData);

        // // Show success message
        Toast.success('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        const errorMessage = error.response?.data?.message || 'Error deleting user. Please try again.';
        Toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (user) => {
    if (!isAuthenticated) {
      Toast.error('Please log in as an admin to perform this action.');
      return;
    }

    try {
      console.log('UI console Attempting to toggle status for user:', user);

      // Cycle through online -> offline -> disabled -> online
      let newStatus;
      switch (user.status) {
        case 'online':
          newStatus = 'offline';
          break;
        case 'offline':
          newStatus = 'disabled';
          break;
        case 'disabled':
          newStatus = 'online';
          break;
        default:
          newStatus = 'online'; // Default fallback
      }

      console.log('UI console Current status:', user.status, 'UI console New status:', newStatus);

      setLoading(true);

      // Make API call to update user status in database
      const response = await API.put(`/api/admin/users/${user.id || user._id}/status`, {
        status: newStatus
      });

      console.log('UI console API response:', response.data);

      // Update local data
      const updatedData = data.map(u =>
        (u.id || u._id) === (user.id || user._id)
          ? { ...u, status: newStatus }
          : u
      );
      setData(updatedData);
      setFilteredData(updatedData);

      // Show success message
      const statusMessages = {
        online: 'set to online',
        offline: 'set to offline',
        disabled: 'disabled'
      };
      Toast.success(`User ${user.name || user.fullName} ${statusMessages[newStatus]} successfully!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      console.error('Error response:', error.response);

      if (error.response?.status === 401) {
        Toast.error('Authentication failed. Please log in again.');
        setIsAuthenticated(false);
      } else if (error.response?.status === 403) {
        Toast.error('Access denied. Admin privileges required.');
        setIsAuthenticated(false);
      } else {
        const errorMessage = error.response?.data?.message || 'Error updating user status. Please try again.';
        Toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // New function specifically for activating/deactivating accounts
  const handleActivateDeactivateAccount = async (user, action) => {
    if (!isAuthenticated) {
      Toast.error('Please log in as an admin to perform this action.');
      return;
    }

    try {
      console.log('UI console Attempting to', action, 'UI console account for user:', user);

      setLoading(true);

      const newStatus = action === 'activate' ? 'online' : 'disabled';

      console.log('UI console Setting status to:', newStatus);

      // Make API call to update user status in database
      const response = await API.put(`/api/admin/users/${user.id || user._id}/status`, {
        status: newStatus
      });

      console.log('UI console API response:', response.data);

      // Update local data
      const updatedData = data.map(u =>
        (u.id || u._id) === (user.id || user._id)
          ? { ...u, status: newStatus }
          : u
      );
      setData(updatedData);
      setFilteredData(updatedData);

      // Show success message
      const actionMessage = action === 'activate' ? 'activated' : 'deactivated';
      Toast.success(`User ${user.name || user.fullName} has been ${actionMessage} successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing user account:`, error);
      console.error('Error response:', error.response);

      if (error.response?.status === 401) {
        Toast.error('Authentication failed. Please log in again.');
        setIsAuthenticated(false);
      } else if (error.response?.status === 403) {
        Toast.error('Access denied. Admin privileges required.');
        setIsAuthenticated(false);
      } else {
        const errorMessage = error.response?.data?.message || `Error ${action}ing user account. Please try again.`;
        Toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (updatedUser) => {
    try {
      setLoading(true);

      // Make API call to update user in database
      await API.put(`/api/admin/users/${updatedUser.id || updatedUser._id}`, {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status
      });

      // Update local data
      const updatedData = data.map(u =>
        (u.id || u._id) === (updatedUser.id || updatedUser._id)
          ? updatedUser
          : u
      );
      setData(updatedData);
      setFilteredData(updatedData);

      setEditDialogOpen(false);
      setSelectedUser(null);

      // Show success message
      Toast.success('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || 'Error updating user. Please try again.';
      Toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // New functions for enhanced functionality
  const fetchUserDetails = async (userId) => {
    try {
      const response = await API.get(`/api/admin/users/${userId}/details`);
      setUserDetails(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUserDetails(null);
      // Don't show alert for this as it's not critical
    }
  };

  const fetchUserSettings = async (userId) => {
    try {
      const response = await API.get(`/api/admin/users/${userId}/settings`);
      setUserSettings(response.data || {});
    } catch (error) {
      console.error('Error fetching user settings:', error);
      setUserSettings({});
      // Don't show alert for this as it's not critical
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
    setActiveTab('details');
    // Fetch additional data for the user
    fetchUserDetails(user.id || user._id);
    fetchUserSettings(user.id || user._id);
  };

  // Helper function to get user display name
  const getUserDisplayName = (user) => {
    return user?.name || user?.fullName || user?.firstName || user?.email || 'Unknown User';
  };

  // Helper function to get user email
  const getUserEmail = (user) => {
    return user?.email || 'No email';
  };

  // Additional functions for enhanced functionality
  const handleUpdateUserSettings = async (userId, settings) => {
    try {
      await API.put(`/api/admin/users/${userId}/settings`, settings);
      Toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      const errorMessage = error.response?.data?.message || 'Error updating settings. Please try again.';
      Toast.error(errorMessage);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <div className="text-lg text-blue-500">Loading...</div>
      </div>
    </div>
  );
  if (error) return (
    <div className="text-lg text-red-500 text-center p-5">
      {error}
      <br />
      <button
        onClick={fetchUsers}
        className="mt-2 px-4 py-2 bg-blue-500 text-white border-none rounded cursor-pointer hover:bg-blue-600 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  // Define fixed table headers for consistent display
  const headers = [
    'status',
    'subscription',
    'name',
    'email',
    'role',
    'defaultCurrency',
    'region',
    'created',
    'updated'
  ];

  // Helper function to format header names
  const formatHeaderName = (header) => {
    const headerMap = {
      'status': 'Status',
      'subscription': 'Subscription',
      'name': 'Name',
      'email': 'Email',
      'role': 'Role',
      'defaultCurrency': 'Currency',
      'region': 'Region',
      'created': 'Created',
      'updated': 'Updated'
    };
    return headerMap[header] || header.charAt(0).toUpperCase() + header.slice(1);
  };

  const paginatedData = Array.isArray(filteredData) && filteredData.length > 0
    ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : [];

  // Calculate statistics for admin visibility
  const stats = {
    total: Array.isArray(data) ? data.length : 0,
    online: Array.isArray(data) ? data.filter(user => user.status === 'online').length : 0,
    offline: Array.isArray(data) ? data.filter(user => user.status === 'offline').length : 0,
    disabled: Array.isArray(data) ? data.filter(user => user.status === 'disabled').length : 0,
    active: Array.isArray(data) ? data.filter(user => user.status === 'online' || user.status === 'offline').length : 0,
    filtered: filteredData.length
  };

  return (
    <>
      <div className="mb-6 flex gap-4 flex-wrap items-end">
        {/* Search Field Classification */}
        <div className="min-w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search In</label>
          <select
            value={searchField}
            onChange={(e) => handleSearchFieldChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:shadow-md transition-shadow"
          >
            <option value="all">All Fields</option>
            <option value="name">👤 Name</option>
            <option value="email">✉️ Email</option>
            <option value="role">🔰 Role</option>
          </select>
        </div>

        {/* Enhanced Search Input */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
            <input
              type="text"
              placeholder={
                searchField === 'all' ? "Search users by name, email, or role..." :
                  searchField === 'name' ? "Search by user name..." :
                    searchField === 'email' ? "Search by email address..." :
                      searchField === 'role' ? "Search by user role..." :
                        "Search users..."
              }
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyUp={handleSearchKeyUp}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Visibility Filter */}
        <div className="min-w-36">
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
          <select
            value={visibilityFilter}
            onChange={(e) => handleVisibilityFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:shadow-md transition-shadow"
          >
            <option value="all">All Accounts</option>
            <option value="active">🟢 Active Accounts</option>
            <option value="disabled">🚫 Disabled Accounts</option>
            <option value="online-only">🟢 Online Only</option>
            <option value="offline-only">🟡 Offline Only</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="min-w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:shadow-md transition-shadow"
          >
            <option value="all">All Status</option>
            <option value="online">🟢 Online</option>
            <option value="offline">🟡 Offline</option>
            <option value="disabled">🚫 Disabled</option>
          </select>
        </div>
      </div>

      {/* Search Results Classification */}
      {searchTerm && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex gap-4 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5 text-blue-500" />
            <span className="font-semibold text-blue-800 text-sm">
              Search Results for "{searchTerm}" {searchField !== 'all' && `in ${searchField}`}:
            </span>
          </div>

          {searchField === 'all' ? (
            <>
              <button
                onClick={() => handleSearchFieldChange('name')}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 ${searchResults.byName > 0
                  ? 'border-green-500 text-green-600 hover:bg-green-50'
                  : 'border-gray-300 text-gray-500'
                  }`}
              >
                👤 Names: {searchResults.byName}
              </button>

              <button
                onClick={() => handleSearchFieldChange('email')}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 ${searchResults.byEmail > 0
                  ? 'border-blue-500 text-blue-600 hover:bg-blue-50'
                  : 'border-gray-300 text-gray-500'
                  }`}
              >
                ✉️ Emails: {searchResults.byEmail}
              </button>

              <button
                onClick={() => handleSearchFieldChange('role')}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 ${searchResults.byRole > 0
                  ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                  : 'border-gray-300 text-gray-500'
                  }`}
              >
                🔰 Roles: {searchResults.byRole}
              </button>
            </>
          ) : (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${searchResults.total > 0
              ? 'border-green-500 text-green-600 bg-green-50'
              : 'border-red-500 text-red-600 bg-red-50'
              }`}>
              Found: {searchResults.total} users
            </span>
          )}

          <div className="ml-auto flex items-center gap-2">
            {searchField !== 'all' && (
              <button
                onClick={() => handleSearchFieldChange('all')}
                className="text-xs text-blue-500 hover:bg-blue-50 px-2 py-1 rounded"
              >
                Search All Fields
              </button>
            )}

            <button
              onClick={() => {
                setSearchTerm('');
                setSearchField('all');
              }}
              className="text-xs text-gray-500 hover:bg-gray-100 hover:text-red-500 px-2 py-1 rounded"
            >
              Clear Search
            </button>
          </div>
        </div>
      )}

      {/* Admin Visibility Statistics */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex gap-6 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 text-sm">
            Account Overview:
          </span>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-400 text-gray-600">
          Total: {stats.total}
        </span>

        <button
          onClick={() => {
            setVisibilityFilter('active');
            setStatusFilter('all');
          }}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 ${visibilityFilter === 'active'
            ? 'border-green-500 text-green-600 bg-green-50'
            : 'border-green-500 text-green-600 hover:bg-green-50'
            }`}
        >
          Active: {stats.active}
        </button>

        <button
          onClick={() => {
            setVisibilityFilter('online-only');
            setStatusFilter('all');
          }}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 flex items-center gap-1 ${visibilityFilter === 'online-only'
            ? 'border-green-500 text-green-600 bg-green-50'
            : 'border-green-500 text-green-600 hover:bg-green-50'
            }`}
        >
          <CheckCircleIcon className="h-3 w-3" />
          Online: {stats.online}
        </button>

        <button
          onClick={() => {
            setVisibilityFilter('offline-only');
            setStatusFilter('all');
          }}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 flex items-center gap-1 ${visibilityFilter === 'offline-only'
            ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
            : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
            }`}
        >
          <CircleIcon className="h-3 w-3" />
          Offline: {stats.offline}
        </button>

        <button
          onClick={() => {
            setVisibilityFilter('disabled');
            setStatusFilter('all');
          }}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 flex items-center gap-1 ${visibilityFilter === 'disabled'
            ? 'border-red-500 text-red-600 bg-red-50'
            : 'border-red-500 text-red-600 hover:bg-red-50'
            }`}
        >
          <NoSymbolIcon className="h-3 w-3" />
          Disabled: {stats.disabled}
        </button>

        {/* Quick Filter Actions */}
        <div className="ml-auto flex items-center gap-2">
          {(searchTerm || searchField !== 'all' || statusFilter !== 'all' || visibilityFilter !== 'all') && (
            <div className="flex items-center gap-1 text-blue-500 text-sm font-semibold mr-4">
              <SearchIcon className="h-4 w-4" />
              Showing: {stats.filtered} users
            </div>
          )}

          <button
            onClick={() => {
              setSearchTerm('');
              setSearchField('all');
              setStatusFilter('all');
              setVisibilityFilter('all');
            }}
            className="text-xs text-gray-500 border border-gray-300 px-3 py-1 rounded hover:border-blue-500 hover:text-blue-500 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              {headers.map(h => (
                <th key={h} className="px-6 py-4 text-left font-semibold text-gray-800 text-sm border-b-2 border-gray-200">
                  {formatHeaderName(h)}
                </th>
              ))}
              <th className="px-6 py-4 text-left font-semibold text-gray-800 text-sm border-b-2 border-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, i) => (
                <tr
                  key={row.id || row._id || i}
                  className="border-b border-gray-100 transition-all duration-200 hover:bg-blue-50 hover:shadow-sm"
                >
                  {headers.map(h => (
                    <td key={h} className="px-6 py-4 text-gray-600 text-sm border-b border-gray-100 cursor-pointer" onClick={() => handleEditUser(row)}>
                      {(() => {
                        switch (h) {
                          case 'status':
                            return (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${row[h] === 'online' ? 'bg-green-100 text-green-600 border border-green-200' :
                                row[h] === 'offline' ? 'bg-yellow-100 text-yellow-600 border border-yellow-200' :
                                  'bg-red-100 text-red-600 border border-red-200'
                                } ${row[h] === 'disabled' ? 'opacity-60' : ''}`}>
                                {row[h] === 'online' ? <CheckCircleIcon className="inline h-3 w-3 mr-1" /> :
                                  row[h] === 'offline' ? <CircleIcon className="inline h-3 w-3 mr-1" /> :
                                    <NoSymbolIcon className="inline h-3 w-3 mr-1" />}
                                {row[h]}
                              </span>
                            );
                          case 'subscription':
                            return (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${row.subscriptionStatus === 'active' ? 'bg-green-100 text-green-600 border border-green-200' :
                                'bg-yellow-100 text-yellow-600 border border-yellow-200'
                                }`}>
                                {row.subscriptionStatus || 'active'}
                              </span>
                            );
                          case 'name':
                            return (
                              <div className="font-medium text-gray-800 hover:text-blue-600 transition-colors">
                                {getUserDisplayName(row)}
                              </div>
                            );
                          case 'email':
                            return (
                              <div className="text-blue-600 hover:text-blue-800 transition-colors">
                                {getUserEmail(row)}
                              </div>
                            );
                          case 'role':
                            return (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${row[h] === 'admin' ? 'bg-purple-100 text-purple-600 border-purple-200' :
                                row[h] === 'user' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                  'bg-gray-100 text-gray-600 border-gray-200'
                                }`}>
                                {row[h] || 'user'}
                              </span>
                            );
                          case 'defaultCurrency':
                            return (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                {row[h] || 'USD'}
                              </span>
                            );
                          case 'region':
                            return (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600 border border-blue-200">
                                {row[h] || 'UAE'}
                              </span>
                            );
                          case 'created':
                            return (
                              <div className="text-gray-500 text-xs">
                                {row.created ? new Date(row.created).toLocaleDateString() :
                                  row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
                              </div>
                            );
                          case 'updated':
                            return (
                              <div className="text-gray-500 text-xs">
                                {row.updated ? new Date(row.updated).toLocaleDateString() :
                                  row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : 'N/A'}
                              </div>
                            );
                          default:
                            return (
                              <div className="text-gray-700">
                                {row[h] ? String(row[h]) : 'N/A'}
                              </div>
                            );
                        }
                      })()}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-gray-600 text-sm border-b border-gray-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditUser(row)}
                        disabled={loading}
                        className={`text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-all duration-200 hover:scale-110 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={loading ? 'Processing...' : 'Edit User'}
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <PencilIcon className="h-4 w-4" />
                        )}
                      </button>

                      {/* Toggle Status Button */}
                      <button
                        onClick={() => handleToggleStatus(row)}
                        disabled={loading}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${row.status === 'online' ? 'text-yellow-500 hover:bg-yellow-50' :
                          row.status === 'offline' ? 'text-red-500 hover:bg-red-50' :
                            'text-green-500 hover:bg-green-50'
                          }`}
                        title={
                          loading ? 'Processing...' :
                            row.status === 'online' ? 'Set to Offline' :
                              row.status === 'offline' ? 'Disable User' : 'Set to Online'
                        }
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          row.status === 'online' ? <CircleIcon className="h-4 w-4" /> :
                            row.status === 'offline' ? <NoSymbolIcon className="h-4 w-4" /> :
                              <CheckCircleIcon className="h-4 w-4" />
                        )}
                      </button>

                      {/* Activate/Deactivate Account Button */}
                      {row.status === 'disabled' ? (
                        <button
                          onClick={() => handleActivateDeactivateAccount(row, 'activate')}
                          disabled={loading}
                          className={`text-green-500 hover:bg-green-50 p-2 rounded-lg transition-all duration-200 hover:scale-110 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={loading ? 'Processing...' : 'Activate Account'}
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <CheckCircleIcon className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateDeactivateAccount(row, 'deactivate')}
                          disabled={loading}
                          className={`text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 hover:scale-110 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={loading ? 'Processing...' : 'Deactivate Account'}
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <NoSymbolIcon className="h-4 w-4" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteUser(row.id || row._id)}
                        disabled={loading}
                        className={`text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 hover:scale-110 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={loading ? 'Processing...' : 'Delete User'}
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers.length + 1}
                  className="px-6 py-12 text-center text-gray-500 text-base italic border-b border-gray-100"
                >
                  {data.length === 0 ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-6xl opacity-30">👥</div>
                      <div className="text-lg font-medium">No users found in the system.</div>
                      <div className="text-sm text-gray-400">
                        Users will appear here once they register.
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-6xl opacity-30">🔍</div>
                      <div className="text-lg font-medium">No users match your current filters.</div>
                      <div className="text-sm text-gray-400">
                        Try adjusting your search terms or clearing filters.
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-lg shadow-sm mt-2 px-2 py-1 flex justify-end">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-800">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={e => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            className="border border-gray-300 rounded px-2 py-1"
          >
            {[5, 10, 20].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <span className="text-gray-800">
            {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredData.length)} of {filteredData.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * rowsPerPage >= filteredData.length}
              className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced User Management Dialog */}
      {editDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-xl">
                User Management - {getUserDisplayName(selectedUser)}
              </h3>
              <button
                onClick={() => {
                  setEditDialogOpen(false);
                  setSelectedUser(null);
                  setActiveTab('details');
                  setUserDetails(null);
                  setUserSettings({});
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 py-2 border-b border-gray-200">
              <div className="flex space-x-1 overflow-x-auto">
                {[
                  { id: 'details', label: 'Account Details', icon: UserGroupIcon },
                  { id: 'settings', label: 'User Settings', icon: Cog6ToothIcon },
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="px-6 py-4">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* User Info Header */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {getUserDisplayName(selectedUser)?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">{getUserDisplayName(selectedUser)}</h4>
                        <p className="text-gray-600">{getUserEmail(selectedUser)}</p>
                        <p className="text-sm text-gray-500">User ID: {selectedUser?.id || selectedUser?._id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        defaultValue={getUserDisplayName(selectedUser)}
                        onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        defaultValue={getUserEmail(selectedUser)}
                        onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <input
                        type="text"
                        defaultValue={selectedUser?.role || 'user'}
                        onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={selectedUser?.status || 'online'}
                        onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="online">🟢 Online</option>
                        <option value="offline">🟡 Offline</option>
                        <option value="disabled">🚫 Disabled</option>
                      </select>
                    </div>
                  </div>

                  {/* User Details Summary */}
                  {userDetails && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-3">Account Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Member Since</p>
                          <p className="font-medium">{userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Last Login</p>
                          <p className="font-medium">{userDetails.lastLogin ? new Date(userDetails.lastLogin).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Subscription</p>
                          <p className="font-medium">{userDetails.subscriptionStatus || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Usage</p>
                          <p className="font-medium">{userDetails.usageCount || 0} actions</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-800">User Settings Override</h4>
                    <button
                      onClick={() => fetchUserSettings(selectedUser?.id || selectedUser?._id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                    >
                      Refresh
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Theme Mode</label>
                      <select
                        value={userSettings.theme || 'auto'}
                        onChange={(e) => setUserSettings({ ...userSettings, theme: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="auto">Auto</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notifications</label>
                      <select
                        value={userSettings.notifications || 'all'}
                        onChange={(e) => setUserSettings({ ...userSettings, notifications: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Notifications</option>
                        <option value="important">Important Only</option>
                        <option value="none">No Notifications</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                      <select
                        value={userSettings.language || 'en'}
                        onChange={(e) => setUserSettings({ ...userSettings, language: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                      <select
                        value={userSettings.timezone || 'UTC'}
                        onChange={(e) => setUserSettings({ ...userSettings, timezone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="GMT">GMT</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={async () => {
                        try {
                          await handleUpdateUserSettings(selectedUser?.id || selectedUser?._id, userSettings);
                        } catch (error) {
                          console.error('Error updating settings:', error);
                          Toast.error('Error updating settings');
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setEditDialogOpen(false);
                  setSelectedUser(null);
                  setActiveTab('details');
                  setUserDetails(null);
                  setUserSettings({});
                }}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
              {activeTab === 'details' && (
                <button
                  onClick={() => handleSaveUser(selectedUser)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers; 
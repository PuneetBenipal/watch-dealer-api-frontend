import React, { useState, useEffect, useCallback } from 'react';
import {
    SearchIcon,
    MinusCircleIcon as CircleIcon,
} from '@heroicons/react/outline';
import API from '../../api';
import toast from 'react-hot-toast';
import { Toast } from '../../components/Alerts/CustomToast';

const AdminRevenueAnalytics = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [error, setError] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [searchResults, setSearchResults] = useState({
        total: 0,
        byName: 0,
        byEmail: 0,
        byRole: 0
    });



    // New state variables for enhanced functionality
    const [revenueData, setRevenueData] = useState({});
    const [activeTab, setActiveTab] = useState('details');

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
                    {
                        id: '2',
                        email: 'jane.smith@example.com',
                        fullName: 'Jane Smith',
                        name: 'Jane Smith',
                        role: 'user',
                        status: 'offline',
                        createdAt: new Date('2024-02-10').toISOString(),
                        updatedAt: new Date('2024-03-19').toISOString(),
                        lastLogin: new Date('2024-03-19').toISOString(),
                        subscriptionStatus: 'active',
                        usageCount: 89
                    },
                    {
                        id: '3',
                        email: 'mike.wilson@example.com',
                        fullName: 'Mike Wilson',
                        name: 'Mike Wilson',
                        role: 'user',
                        status: 'disabled',
                        createdAt: new Date('2024-01-25').toISOString(),
                        updatedAt: new Date('2024-03-15').toISOString(),
                        lastLogin: new Date('2024-03-10').toISOString(),
                        subscriptionStatus: 'inactive',
                        usageCount: 45
                    }
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

    // Initial data load
    useEffect(() => {
        fetchUsers();
        fetchRevenueData();
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
        setFilteredData(filtered);

        // Enhanced logging with search classification
        const filterInfo = [];
        if (searchTerm.trim()) {
            filterInfo.push(`search: "${searchTerm}" in ${searchField}`);
            if (searchField === 'all') {
                filterInfo.push(`(${searchResultsCount.byName} by name, ${searchResultsCount.byEmail} by email, ${searchResultsCount.byRole} by role)`);
            }
        }

        if (filtered.length === 0) {
            console.log('UI console No users found matching filters:', filterInfo.join(', '));
            Toast.warning('No users found matching filters')
        } else {
            console.log(`UI console Found ${filtered.length} user(s) matching filters:`, filterInfo.join(', '));
            Toast.setRevenueData(`Found ${filtered.length} user(s) matching filters`);
        }
    }, [data, searchTerm, searchField]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleSearchFieldChange = (field) => {
        setSearchField(field);
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
            toast.success('User updated successfully!');
        } catch (error) {
            console.error('Error updating user:', error);
            const errorMessage = error.response?.data?.message || 'Error updating user. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchRevenueData = async () => {
        try {
            const response = await API.get('/api/admin/revenue');
            setRevenueData(response.data || {});
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            setRevenueData({});
            // Don't show alert for this as it's not critical
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
        setActiveTab('details');
    };

    // Helper function to get user display name
    const getUserDisplayName = (user) => {
        return user?.name || user?.fullName || user?.firstName || user?.email || 'Unknown User';
    };

    // Helper function to get user email
    const getUserEmail = (user) => {
        return user?.email || 'No email';
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
        'name',
        'email',
        'role',
        'defaultCurrency',
        'region',
    ];

    // Helper function to format header names
    const formatHeaderName = (header) => {
        const headerMap = {
            'name': 'Name',
            'email': 'Email',
            'role': 'Role',
            'defaultCurrency': 'Currency',
            'region': 'Region',
        };
        return headerMap[header] || header.charAt(0).toUpperCase() + header.slice(1);
    };

    const paginatedData = Array.isArray(filteredData) && filteredData.length > 0
        ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : [];

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

            <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                            {headers.map(h => (
                                <th key={h} className="px-6 py-4 text-left font-semibold text-gray-800 text-sm border-b-2 border-gray-200">
                                    {formatHeaderName(h)}
                                </th>
                            ))}
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
                                }}
                                className="text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="px-6 py-4">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-gray-800">Revenue Analytics</h4>
                                    <button
                                        onClick={() => fetchRevenueData()}
                                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                                    >
                                        Refresh
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h5 className="font-medium text-blue-800">Monthly Recurring Revenue</h5>
                                        <p className="text-2xl font-bold text-blue-900">${revenueData.mrr || 0}</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <h5 className="font-medium text-green-800">Total Revenue</h5>
                                        <p className="text-2xl font-bold text-green-900">${revenueData.total || 0}</p>
                                    </div>
                                    <div className="bg-yellow-50 rounded-lg p-4">
                                        <h5 className="font-medium text-yellow-800">Churn Rate</h5>
                                        <p className="text-2xl font-bold text-yellow-900">{revenueData.churnRate || 0}%</p>
                                    </div>
                                </div>
                                {revenueData.trends && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <h5 className="font-medium text-gray-800 mb-3">Revenue Trends</h5>
                                        <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                                            <p className="text-gray-500">Chart visualization would go here</p>
                                        </div>
                                    </div>
                                )}
                            </div>


                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setEditDialogOpen(false);
                                    setSelectedUser(null);
                                    setActiveTab('details');
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

export default AdminRevenueAnalytics; 
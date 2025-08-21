import React, { useState, useEffect } from 'react';
import {
  SearchIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ClipboardIcon as ClipboardDocumentIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationIcon as ExclamationTriangleIcon,
} from '@heroicons/react/outline';
import API from '../../api';
import { Toast } from '../../components/Alerts/CustomToast';

const AdminDiscountCodes = () => {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDiscountCode, setNewDiscountCode] = useState('');
  const [newDiscountPercent, setNewDiscountPercent] = useState('');
  const [newDiscountExpiry, setNewDiscountExpiry] = useState('');

  // Generate a 16-digit random code with numbers and letters
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Helper function to check if a code is expired
  const isCodeExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) <= new Date();
  };

  // Helper function to get code status
  const getCodeStatus = (code) => {
    if (isCodeExpired(code.expiresAt)) {
      return { status: 'Expired', className: 'bg-red-100 text-red-800' };
    }
    return code.active
      ? { status: 'Active', className: 'bg-green-100 text-green-800' }
      : { status: 'Inactive', className: 'bg-gray-100 text-gray-800' };
  };

  // Fetch discount codes from database
  const fetchDiscountCodes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/api/admin/discount-codes');
      const codes = response.data || [];

      // Process the codes to handle active status
      const processedCodes = codes.map(code => ({
        ...code,
        active: code.active && new Date(code.expiresAt) > new Date()
      }));

      setDiscountCodes(processedCodes);
      setFilteredData(processedCodes);
    } catch (err) {
      console.error('Error fetching discount codes:', err);
      setError('Failed to load discount codes. Please try again.');
      setDiscountCodes([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new discount code
  const handleCreateDiscountCode = async () => {
    if (!newDiscountPercent || !newDiscountExpiry) {
      Toast.error('Please fill in all required fields');
      return;
    }

    // Validate discount percentage
    const discountValue = parseInt(newDiscountPercent);
    if (discountValue < 1 || discountValue > 100) {
      Toast.error('Discount percentage must be between 1 and 100');
      return;
    }

    // Validate expiry date - must be in the future
    const selectedDate = new Date(newDiscountExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    if (selectedDate <= today) {
      Toast.error('Expiry date must be in the future');
      return;
    }

    try {
      setLoading(true);
      const code = newDiscountCode || generateRandomCode();
      const discountData = {
        code,
        discount: discountValue,
        expiresAt: newDiscountExpiry,
        active: true
      };

      await API.post('/api/admin/discount-codes', discountData);

      // Reset form
      setNewDiscountCode('');
      setNewDiscountPercent('');
      setNewDiscountExpiry('');
      setShowCreateModal(false);

      // Refresh the list
      await fetchDiscountCodes();
      Toast.success('Discount code created successfully!');
    } catch (error) {
      console.error('Error creating discount code:', error);
      const errorMessage = error.response?.data?.message || 'Error creating discount code. Please try again.';
      Toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete discount code
  const handleDeleteDiscountCode = async (codeId) => {
    if (window.confirm('Are you sure you want to delete this discount code? This action cannot be undone.')) {
      try {
        setLoading(true);
        await API.delete(`/api/admin/discount-codes/${codeId}`);
        await fetchDiscountCodes();
        Toast.success('Discount code deleted successfully!');
      } catch (error) {
        console.error('Error deleting discount code:', error);
        const errorMessage = error.response?.data?.message || 'Error deleting discount code. Please try again.';
        Toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Copy code to clipboard
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      Toast.success('Code copied to clipboard!');
    }).catch(() => {
      Toast.error('Failed to copy code');
    });
  };

  // Search and filter functionality
  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = discountCodes.filter(code =>
      code.code.toLowerCase().includes(term.toLowerCase()) ||
      code.discount.toString().includes(term)
    );
    setFilteredData(filtered);
  };

  // Initial data load
  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  // Pagination
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  if (loading && discountCodes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-blue-500">Loading discount codes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-lg text-red-500 text-center p-5">
        {error}
        <br />
        <button
          onClick={fetchDiscountCodes}
          className="mt-2 px-4 py-2 bg-blue-500 text-white border-none rounded cursor-pointer hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discount Codes Management</h1>
        <p className="text-gray-600">Create and manage discount codes for your platform</p>
      </div>

      {/* Search and Create Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search discount codes..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            <PlusIcon className="h-5 w-5" />
            Create Discount Code
          </button>
        </div>
      </div>

      {/* Discount Codes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {code.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy to clipboard"
                        >
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {code.discount}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const { status, className } = getCodeStatus(code);
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
                            {status}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {code.createdAt ? new Date(code.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'No expiry'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteDiscountCode(code.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete discount code"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No discount codes found</p>
                      <p className="text-gray-500">Get started by creating your first discount code.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min((page + 1) * rowsPerPage, filteredData.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredData.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === i
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page === totalPages - 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Discount Code Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Discount Code</h3>

              <div className="space-y-4">
                {/* Code Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDiscountCode}
                      onChange={(e) => setNewDiscountCode(e.target.value)}
                      placeholder="Leave empty for auto-generation"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setNewDiscountCode(generateRandomCode())}
                      className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {newDiscountCode ? `Generated code: ${newDiscountCode}` : 'Will generate a 16-digit random code'}
                  </p>
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newDiscountPercent}
                    onChange={(e) => setNewDiscountPercent(e.target.value)}
                    placeholder="e.g., 25"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newDiscountExpiry}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      if (selectedDate <= today) {
                        Toast.error('Please select a future date');
                        return;
                      }
                      setNewDiscountExpiry(e.target.value);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${newDiscountExpiry && new Date(newDiscountExpiry) <= new Date()
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                      }`}
                    required
                  />
                  <p className={`text-xs mt-1 ${newDiscountExpiry && new Date(newDiscountExpiry) <= new Date()
                      ? 'text-red-500'
                      : 'text-gray-500'
                    }`}>
                    {newDiscountExpiry && new Date(newDiscountExpiry) <= new Date()
                      ? '⚠️ Please select a future date'
                      : 'Must be a future date'
                    }
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewDiscountCode('');
                    setNewDiscountPercent('');
                    setNewDiscountExpiry('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDiscountCode}
                  disabled={loading || !newDiscountPercent || !newDiscountExpiry}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Code'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDiscountCodes; 
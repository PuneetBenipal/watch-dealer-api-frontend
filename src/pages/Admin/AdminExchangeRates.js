import React, { useState, useEffect } from 'react';
import {
    SearchIcon,
    RefreshIcon,
    TrashIcon,
    GlobeAltIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationIcon as ExclamationTriangleIcon,
} from '@heroicons/react/outline';
import API from '../../api';
import { Toast } from '../../components/Alerts/CustomToast';

const AdminExchangeRates = () => {
    const [exchangeRates, setExchangeRates] = useState({
        usdToEur: 0.85,
        usdToGbp: 0.73,
        usdToJpy: 110.0,
        globalTaxRate: 0,
        defaultCurrency: 'USD',
        lastUpdated: new Date(),
        autoUpdate: true,
        source: 'manual'
    });
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const fetchExchangeRates = async () => {
        setLoading(true);
        try {
            const response = await API.get('/api/admin/exchange-rates');
            setExchangeRates(response.data);
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            Toast.error('Failed to load exchange rates');
        } finally {
            setLoading(false);
        }
    };

    const updateFromAPI = async () => {
        setUpdating(true);
        try {
            const response = await API.post('/api/admin/exchange-rates/update-from-api');
            setExchangeRates(response.data.rates);
            Toast.success('Exchange rates updated from API successfully!');
        } catch (error) {
            console.error('Error updating exchange rates from API:', error);
            Toast.error('Failed to update exchange rates from API');
        } finally {
            setUpdating(false);
        }
    };

    const saveExchangeRates = async () => {
        setLoading(true);
        try {
            const response = await API.put('/api/admin/exchange-rates', exchangeRates);
            setExchangeRates(response.data.rates);
            Toast.success('Exchange rates saved successfully!');
        } catch (error) {
            console.error('Error saving exchange rates:', error);
            Toast.error('Failed to save exchange rates');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await API.get('/api/admin/exchange-rates/history');
            setHistory(response.data.rates);
        } catch (error) {
            console.error('Error fetching exchange rate history:', error);
            Toast.error('Failed to load exchange rate history');
        }
    };

    const clearHistory = async () => {
        // Create a more user-friendly confirmation dialog
        const confirmed = window.confirm(
            '🗑️ Clear Exchange Rate History\n\n' +
            'This action will:\n' +
            '• Delete all historical exchange rate entries\n' +
            '• Keep only the most recent rate entry\n' +
            '• This action cannot be undone\n\n' +
            'Are you sure you want to continue?'
        );

        if (!confirmed) {
            return;
        }

        setClearing(true);
        try {
            const response = await API.delete('/api/admin/exchange-rates/history');
            Toast.success(response.data.message);
            // Refresh the history
            if (showHistory) {
                fetchHistory();
            }
        } catch (error) {
            console.error('Error clearing exchange rate history:', error);
            Toast.error('Failed to clear exchange rate history');
        } finally {
            setClearing(false);
        }
    };

    useEffect(() => {
        fetchExchangeRates();
    }, []);

    useEffect(() => {
        if (showHistory) {
            fetchHistory();
        }
    }, [showHistory]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getSourceIcon = (source) => {
        switch (source) {
            case 'api':
                return <GlobeAltIcon className="h-4 w-4 text-blue-500" />;
            case 'scheduled':
                return <ClockIcon className="h-4 w-4 text-green-500" />;
            default:
                return <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <div className="text-lg text-blue-500">Loading exchange rates...</div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Exchange Rates Management</h2>
                        <p className="text-gray-600">Manage global exchange rates and currency settings</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={updateFromAPI}
                            disabled={updating}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshIcon className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
                            {updating ? 'Updating...' : 'Update from API'}
                        </button>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            {showHistory ? 'Hide History' : 'Show History'}
                        </button>
                    </div>
                </div>

                {/* Last Updated Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    <span>Last updated: {formatDate(exchangeRates.lastUpdated)}</span>
                    <span className="flex items-center gap-1">
                        {getSourceIcon(exchangeRates.source)}
                        {exchangeRates.source}
                    </span>
                </div>
            </div>

            {/* Exchange Rates Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Exchange Rates</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            USD to EUR Rate
                        </label>
                        <input
                            type="number"
                            step="0.0001"
                            value={exchangeRates.usdToEur}
                            onChange={(e) => setExchangeRates({ ...exchangeRates, usdToEur: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            USD to GBP Rate
                        </label>
                        <input
                            type="number"
                            step="0.0001"
                            value={exchangeRates.usdToGbp}
                            onChange={(e) => setExchangeRates({ ...exchangeRates, usdToGbp: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            USD to JPY Rate
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={exchangeRates.usdToJpy}
                            onChange={(e) => setExchangeRates({ ...exchangeRates, usdToJpy: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Global Tax Rate (%)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={exchangeRates.globalTaxRate}
                            onChange={(e) => setExchangeRates({ ...exchangeRates, globalTaxRate: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Default Currency
                        </label>
                        <select
                            value={exchangeRates.defaultCurrency}
                            onChange={(e) => setExchangeRates({ ...exchangeRates, defaultCurrency: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="JPY">JPY</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Auto Update
                        </label>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={exchangeRates.autoUpdate}
                                onChange={(e) => setExchangeRates({ ...exchangeRates, autoUpdate: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                                Automatically update rates daily
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={saveExchangeRates}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save Exchange Rates'}
                    </button>
                </div>
            </div>

            {/* Exchange Rate History */}
            {showHistory && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Exchange Rate History</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                View and manage historical exchange rate changes. Clear history will keep only the most recent rate entry.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={fetchHistory}
                                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                            >
                                Refresh
                            </button>
                            <button
                                onClick={clearHistory}
                                disabled={clearing}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {clearing ? 'Clearing...' : 'Clear History'}
                            </button>
                        </div>
                    </div>

                    {history.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="text-4xl mb-2">📊</div>
                            <div className="text-lg font-medium">No exchange rate history found</div>
                            <div className="text-sm">History will appear here once rates are updated</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                        <th className="px-4 py-2 text-left font-semibold text-gray-800">Date</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-800">USD/EUR</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-800">USD/GBP</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-800">USD/JPY</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-800">Tax Rate</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-800">Default Currency</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-800">Source</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((rate, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-2 text-gray-600">
                                                {formatDate(rate.lastUpdated)}
                                            </td>
                                            <td className="px-4 py-2 text-gray-600">
                                                {rate.usdToEur?.toFixed(4)}
                                            </td>
                                            <td className="px-4 py-2 text-gray-600">
                                                {rate.usdToGbp?.toFixed(4)}
                                            </td>
                                            <td className="px-4 py-2 text-gray-600">
                                                {rate.usdToJpy?.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2 text-gray-600">
                                                {rate.globalTaxRate}%
                                            </td>
                                            <td className="px-4 py-2 text-gray-600">
                                                {rate.defaultCurrency}
                                            </td>
                                            <td className="px-4 py-2 text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    {getSourceIcon(rate.source)}
                                                    {rate.source}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminExchangeRates; 
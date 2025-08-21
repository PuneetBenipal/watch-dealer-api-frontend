import React, { useState, useEffect, useContext } from "react";
import { SearchIcon, PlusIcon, FilterIcon, ClockIcon, CheckCircleIcon, XCircleIcon, RefreshIcon, DocumentTextIcon, TruckIcon, } from "@heroicons/react/outline";

import { WhatsappContext } from "../../contexts/WhatsappScrapertext";
import CreateEditModal from "./components/CreateEditModal";
import ViewModal from "./components/ViewModal";
import WhatsAppProductCard from "../../components/common/WhatsAppProductCard";
import { Card, notification } from "antd";
import ProductCard from "../../components/common/ProductCard";
import { Toast } from "../../components/Alerts/CustomToast";


const WhatsappData = () => {
    // console.log("useContext(WhatsappContext)", useContext(WhatsappContext))
    const { tradeDeals, loading, fetchTradeDeals, createTradeDeal, updateTradeDeal, deleteTradeDeal, getAnalytics, CountSearch, AddInventory } = useContext(WhatsappContext);

    // State management
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [analytics, setAnalytics] = useState(null);
    const [inputevalue, setInputevalue] = useState('');

    // Form state with all product fields
    const [formData, setFormData] = useState({
        sender_name: '',
        sender_number: '',
        sender_email: '',
        product_name: '',
        product_description: '',
        product_price: '',
        product_image: '',
        product_category: '',
        product_brand: '',
        product_model: '',
        product_condition: 'new',
        status: 'pending',
        deal_value: '',
        profit: '',
        commission: '',
        dealer: '',
        customer: '',
        customer_phone: '',
        customer_email: '',
        vehicle_in: '',
        vehicle_out: '',
        shipping_address: '',
        billing_address: '',
        payment_method: '',
        payment_status: 'pending',
        delivery_date: '',
        tracking_number: '',
        warranty_period: '',
        notes: '',
        tags: ''
    });

    const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'];
    const conditionOptions = ['new', 'used', 'refurbished', 'damaged'];
    const paymentStatusOptions = ['pending', 'paid', 'partial', 'refunded'];

    useEffect(() => {
        fetchTradeDeals();
        loadAnalytics();
    }, []);

    console.log("UI console tradeDeals===>", tradeDeals);

    const loadAnalytics = async () => {
        try {
            const analyticsData = await getAnalytics();
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    };

    // Reset form function
    const resetForm = () => {
        setFormData({
            sender_name: '',
            sender_number: '',
            sender_email: '',
            product_name: '',
            product_description: '',
            product_price: '',
            product_image: '',
            product_category: '',
            product_brand: '',
            product_model: '',
            product_condition: 'new',
            status: 'pending',
            deal_value: '',
            profit: '',
            commission: '',
            dealer: '',
            customer: '',
            customer_phone: '',
            customer_email: '',
            vehicle_in: '',
            vehicle_out: '',
            shipping_address: '',
            billing_address: '',
            payment_method: '',
            payment_status: 'pending',
            delivery_date: '',
            tracking_number: '',
            warranty_period: '',
            notes: '',
            tags: ''
        });
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle create deal
    const handleCreateDeal = async (e) => {
        e.preventDefault();
        try {
            await createTradeDeal(formData);
            setShowCreateModal(false);
            resetForm();
            Toast.success('Trade deal created successfully!');
            loadAnalytics();
        } catch (error) {
            Toast.error('Failed to create trade deal: ' + (error.message || 'Unknown error'));
        }
    };

    // Handle edit deal
    const handleEditDeal = async (e) => {
        e.preventDefault();
        try {
            await updateTradeDeal(selectedDeal._id, formData);
            setShowEditModal(false);
            setSelectedDeal(null);
            resetForm();
            Toast.success('Trade deal updated successfully!');
            loadAnalytics();
        } catch (error) {
            Toast.error('Failed to update trade deal: ' + (error.message || 'Unknown error'));
        }
    };

    // Handle delete deal
    const handleDeleteDeal = async (dealId) => {
        if (!window.confirm('Are you sure you want to delete this trade deal? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteTradeDeal(dealId);
            Toast.success('Trade deal deleted successfully!');
            loadAnalytics();
        } catch (error) {
            Toast.error('Failed to delete trade deal: ' + (error.message || 'Unknown error'));
        }
    };

    //Add Inventory

    const Add_Inventory = async (dealdata) => {
        try {
            console.log("UI console Adding inventory for deal:", dealdata);

            const result = await AddInventory(dealdata);
            console.log("UI console Inventory added successfully:", result);
            notification.success({
                message: 'Success',
                description: 'Inventory item added successfully!',
            });
            Toast.success('');

        } catch (error) {
            console.error("Error adding inventory:", error);
            Toast.error('Failed to add inventory item');
        }
    }

    const handleSearch = () => {
        // Your search logic here
        console.log('UI console Searching for:', searchTerm);
        // For example, trigger a search API call or update state
    };

    // Modal functions
    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const openEditModal = (deal) => {
        setSelectedDeal(deal);
        setFormData({
            sender_name: deal.sender_name || '',
            sender_number: deal.sender_number || '',
            sender_email: deal.sender_email || '',
            product_name: deal.product_name || '',
            product_description: deal.product_description || '',
            product_price: deal.product_price || '',
            product_image: deal.product_image || '',
            product_category: deal.product_category || '',
            product_brand: deal.product_brand || '',
            product_model: deal.product_model || '',
            product_condition: deal.product_condition || 'new',
            status: deal.status || 'pending',
            deal_value: deal.deal_value || '',
            profit: deal.profit || '',
            commission: deal.commission || '',
            dealer: deal.dealer || '',
            customer: deal.customer || '',
            customer_phone: deal.customer_phone || '',
            customer_email: deal.customer_email || '',
            vehicle_in: deal.vehicle_in || '',
            vehicle_out: deal.vehicle_out || '',
            shipping_address: deal.shipping_address || '',
            billing_address: deal.billing_address || '',
            payment_method: deal.payment_method || '',
            payment_status: deal.payment_status || 'pending',
            delivery_date: deal.delivery_date ? deal.delivery_date.split('T')[0] : '',
            tracking_number: deal.tracking_number || '',
            warranty_period: deal.warranty_period || '',
            notes: deal.notes || '',
            tags: deal.tags || ''
        });
        setShowEditModal(true);
    };

    const openViewModal = (deal) => {
        setSelectedDeal(deal);
        setShowViewModal(true);
    };

    // Utility functions
    const formatCurrency = (amount) => {
        return amount ? `$${parseFloat(amount).toLocaleString()}` : '-';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
            case 'delivered':
            case 'completed':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'processing':
            case 'shipped':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'cancelled':
            case 'refunded':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'pending':
            default:
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed':
            case 'delivered':
            case 'completed':
                return <CheckCircleIcon className="h-4 w-4" />;
            case 'cancelled':
            case 'refunded':
                return <XCircleIcon className="h-4 w-4" />;
            case 'processing':
            case 'shipped':
                return <TruckIcon className="h-4 w-4" />;
            case 'pending':
            default:
                return <ClockIcon className="h-4 w-4" />;
        }
    };

    // Filter and sort deals
    const filteredDeals = tradeDeals
        .filter(deal => {
            const matchesSearch = !searchTerm ||
                deal.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                deal.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                deal.product_brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                deal.sender_number?.includes(searchTerm) ||
                deal.dealer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                deal.customer?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ backgroundImage: "url('/background.svg')", backgroundAttachment: 'fixed' }}>
            {/* Header */}


            {/* Search and Filters */}
            <div className="px-6 py-4 border-b border-gray-200 bg-[rgba(225,225,255,0.5)]">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by sender, product, brand, dealer, or customer..."
                            value={inputevalue}
                            onChange={(e) => setInputevalue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setSearchTerm(e.target.value);
                                    CountSearch()
                                }
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* <div className="flex items-center gap-2">
                        <FilterIcon className="h-4 w-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            {statusOptions.map(status => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div> */}

                    <div className="flex items-center gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="createdAt">Date Created</option>
                            <option value="deal_value">Deal Value</option>
                            <option value="profit">Profit</option>
                            <option value="sender_name">Sender Name</option>
                            <option value="product_name">Product Name</option>
                            <option value="status">Status</option>
                        </select>

                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>

                        <button
                            onClick={() => {
                                fetchTradeDeals();
                                loadAnalytics();
                            }}
                            disabled={loading}
                            className="px-4 py-2 text-gray-700 bg-white rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>

                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-hidden p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <RefreshIcon className="h-10 w-10 animate-spin text-blue-500 mb-2" />
                        <p className="text-gray-600 text-lg font-medium">Loading trade deals...</p>
                    </div>
                ) : filteredDeals.length === 0 ? (
                    <div className="text-center py-16">
                        <DocumentTextIcon className="h-14 w-14 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-700 text-lg font-semibold">No trade deals found</p>
                        <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters to find more deals.'
                                : 'Get started by adding your first trade deal and watch them appear here.'}
                        </p>
                    </div>
                ) : (
                    // Render deals as cards in a responsive grid
                    <div className="p-6 max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredDeals.map((deal) => (
                                <div
                                    key={deal.id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                                >
                                    <ProductCard
                                        product={deal}
                                        data={{ openViewModal }}
                                        AddInventory={() => Add_Inventory(deal)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                    //     {filteredDeals.map((deal) => (
                    //         <ProductCard product={deal} data={{ openViewModal }} AddInventory={() => Add_Inventory(deal)}/>
                    // <WhatsAppProductCard
                    //     key={deal._id}
                    //     deal={deal}
                    //     onView={() => openViewModal(deal)}
                    //     onEdit={() => openEditModal(deal)}
                    //     onDelete={() => handleDeleteDeal(deal._id)}
                    //     formatCurrency={formatCurrency}
                    //     formatDate={formatDate}
                    //     getStatusColor={getStatusColor}
                    //     getStatusIcon={getStatusIcon}
                    //     AddInventory={() => Add_Inventory(deal)}
                    // />
                    // ))}
                    // </div>
                )}
            </div>


            {/* Results Summary */}
            {!loading && filteredDeals.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-0">
                        Showing {filteredDeals.length} of {tradeDeals.length} trade deals
                    </p>
                </div>
            )}

            {/* Create/Edit Modal */}
            {/* <CreateEditModal
                isOpen={showCreateModal || showEditModal}
                isEdit={showEditModal}
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={showCreateModal ? handleCreateDeal : handleEditDeal}
                onClose={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedDeal(null);
                    resetForm();
                }}
                loading={loading}
                statusOptions={statusOptions}
                conditionOptions={conditionOptions}
                paymentStatusOptions={paymentStatusOptions}
            /> */}

            {/* View Modal */}
            <ViewModal
                isOpen={showViewModal}
                deal={selectedDeal}
                onClose={() => setShowViewModal(false)}
                onEdit={openEditModal}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
            />
        </div>
    );
};

export default WhatsappData;
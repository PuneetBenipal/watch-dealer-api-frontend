import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminSettings from "./AdminSettings";
import AdminDiscountCodes from "./AdminDiscountCodes";
import AdminListings from "./AdminListings";
import AdminTradeDeals from "./Admintradedeals";
import AdminExchangeRates from "./AdminExchangeRates";
import AdminModules from "./AdminModules";
import AdminPaymentHistory from "./AdminPaymentHistory";
import AdminRevenueAnalytics from "./AdminRevenueAnalytics";
import AdminInvoice from "./AdminInvoice";

/**
 * Modern, clean, and user-friendly admin dashboard update
 */
import React, { useState } from 'react';
import {
    SearchIcon,
    MenuIcon,
    ViewGridIcon as DashboardIcon,
    UsersIcon as PeopleIcon,
    CogIcon as SettingsIcon,
    TagIcon as DiscountIcon,
    ViewListIcon as ListAltIcon,
    BellIcon as NotificationsIcon,
    LogoutIcon,
    UserIcon as PersonIcon,
    SwitchHorizontalIcon as SwapHorizIcon,
    MinusCircleIcon as CircleIcon,
    CreditCardIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    GlobeAltIcon
} from '@heroicons/react/outline';

const drawerWidth = 260;

const sidebarSections = [
    {
        items: [
            { label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" />, endpoint: '/api/admin/analytics', type: 'dashboard' }
        ]
    },
    {
        items: [
            { label: 'Users', icon: <PeopleIcon className="w-5 h-5" />, endpoint: '/api/admin/users', type: 'table' },
            { label: 'Settings', icon: <SettingsIcon className="w-5 h-5" />, endpoint: '/api/admin/settings', type: 'table' },
            { label: 'Discount Codes', icon: <CurrencyDollarIcon className="w-5 h-5" />, endpoint: '/api/admin/discounts', type: 'table' },
            { label: 'Listings', icon: <ListAltIcon className="w-5 h-5" />, endpoint: '/api/listings', type: 'table' },
            { label: 'Trade Deals', icon: <SwapHorizIcon className="w-5 h-5" />, endpoint: '/api/admin/trade-deals', type: 'table' },
            { label: 'Exchange Rates', icon: <GlobeAltIcon className="w-5 h-5" />, endpoint: '/api/admin/exchange-rates', type: 'table' },
            { label: 'Modules', icon: <DiscountIcon className="w-5 h-5" />, endpoint: '/api/admin/modules', type: 'table' },
            { label: 'Payment History', icon: <CreditCardIcon className="w-5 h-5" />, endpoint: '/api/admin/payment-history', type: 'table' },
            { label: 'Revenue Analytics', icon: <ChartBarIcon className="w-5 h-5" />, endpoint: '/api/admin/revenue-analytics', type: 'table' },
            { label: 'Invoice History', icon: <MenuIcon className="w-5 h-5" />, endpoint: '/api/admin/invoice-history', type: 'table' },
        ]
    },
];

export default function Admin() {
    const [selected, setSelected] = useState(sidebarSections[0].items[0]);
    const adminUser = { name: 'Joseph William', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' };
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Sidebar rendering
    const drawer = (
        <div className="h-full bg-white text-gray-800 flex flex-col border-r border-gray-200 shadow-sm">
            <div className="font-bold text-2xl px-6 py-6 tracking-wide flex items-center gap-2">
                {/* <img src="https://cdn-icons-png.flaticon.com/512/5968/5968705.png" alt="logo" className="w-9 h-9" /> */}
                <span className="text-blue-500 italic">Watch Deal Hub</span>
            </div>
            <div className="border-t border-gray-200"></div>
            <div className="flex-1 overflow-y-auto pt-2">
                {sidebarSections.map(section => (
                    <div key={section.header} className="mt-1">
                        <div className="px-6 mb-1 text-xs text-gray-500 font-bold tracking-wide">
                            {section.header}
                        </div>
                        <div className="px-2">
                            {section.items.map(item => (
                                <div
                                    key={item.label}
                                    onClick={() => item.endpoint ? setSelected(item) : null}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg mb-1 cursor-pointer transition-all duration-200
                    ${selected.label === item.label
                                            ? 'bg-blue-50 text-blue-600 font-bold'
                                            : 'text-gray-700 font-medium hover:bg-gray-50 hover:text-blue-600'
                                        }
                  `}
                                >
                                    <div className={`min-w-9 ${selected.label === item.label ? 'text-blue-600' : 'text-gray-500'}`}>
                                        {item.icon}
                                    </div>
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Main content rendering
    const renderContent = () => {
        switch (selected.label) {
            case 'Dashboard':
                return <AdminDashboard adminUser={adminUser} />;
            case 'Users':
                return <AdminUsers />;
            case 'Settings':
                return <AdminSettings />;
            case 'Discount Codes':
                return <AdminDiscountCodes />;
            case 'Listings':
                return <AdminListings />;
            case 'Trade Deals':
                return <AdminTradeDeals />;
            case 'Exchange Rates':
                return <AdminExchangeRates />;
            case 'Modules':
                return <AdminModules />;
            case 'Payment History':
                return <AdminPaymentHistory />;
            case 'Revenue Analytics':
                return <AdminRevenueAnalytics />;
            case 'Invoice History':
                return <AdminInvoice />
            default:
                return <AdminDashboard adminUser={adminUser} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
                {drawer}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <div className="bg-white border-b-2 border-blue-500 shadow-sm">
                    <div className="flex items-center justify-end px-4 py-4">
                        <div className="flex items-center gap-4 ">
                            <button className="relative text-gray-600 hover:text-gray-900 transition-colors duration-200 ease-in-out hover:scale-105 focus:outline-none">
                                <NotificationsIcon className="w-6 h-6 drop-shadow-sm" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-md">
                                    3
                                </span>
                            </button>
                            <div className="relative">
                                <img
                                    src={adminUser.avatar}
                                    alt={adminUser.name}
                                    className="w-10 h-10 rounded-full border-2 border-blue-500 cursor-pointer hover:border-blue-600 transition-colors"
                                    onClick={handleAvatarClick}
                                />

                                {/* Dropdown Menu */}
                                {open && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                        <div className="py-1">
                                            <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                <PersonIcon className="w-4 h-4" />
                                                Profile & account
                                            </button>
                                            <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                <SettingsIcon className="w-4 h-4" />
                                                Settings
                                            </button>
                                            <button
                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => {
                                                    localStorage.clear();
                                                    window.location.href = '/login';
                                                }}
                                            >
                                                <LogoutIcon className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <main className="flex-1 bg-white">
                    <div className="bg-white p-10 mb-8 min-h-80">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}
// components/AppHeader.jsx
import React, { useMemo, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Layout, Menu, Dropdown, Avatar } from "antd";
import {
    DashboardOutlined,
    SearchOutlined,
    DatabaseOutlined,
    FileTextOutlined,
    FileProtectOutlined,
    TeamOutlined,
    BarChartOutlined,
    SettingOutlined,
    QuestionCircleOutlined,
    LogoutOutlined,
    ApiOutlined,
    ProfileOutlined,
    CreditCardOutlined,
    UserAddOutlined,
    ChromeOutlined,
    SafetyOutlined,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth"; // <-- your hook

const { Header } = Layout;
const { SubMenu, Item: MenuItem } = Menu;

export default function AppHeader() {
    const [visiable, setVisiable] = useState(true);
    const auth = useAuth();
    // const { user, company, setAuth, isAuth } = auth || {};
    const { user, company, setAuth, isAuth, logout } = useAuth();

    // const handleLogout = auth?.logout;
    const location = useLocation();

    // Helpers to read entitlements/flags safely
    const hasEntitlement = (feature) => {
        const list = company?.entitlements || [];
        if (!Array.isArray(list) || list.length === 0) return true; // default visible if not configured
        const e = list.find((e) => e?.feature === feature);
        return e ? e.enabled !== false : false;
    };
    const flagEnabled = (flag) => !!company?.featureFlags?.[flag];

    const [visible, setVisible] = useState(true);
    useEffect(() => {
        const URL = location.pathname;
        console.log("UI console URL", URL)
        if (URL.includes("/share/")) {
            setVisible(false);
        }
    }, [])

    useEffect(() => {
        const token = localStorage.getItem("token");
        setAuth(token);
    }, [])

    useEffect(() => {
        const URL = location.pathname;
        if (URL.includes("/share/")) {
            setVisiable(false)
        }
        if (URL.includes("/admin")) {
            setVisiable(false);
        }
    }, [])

    useEffect(() => {
        console.log("User console app header user =>", user)
    }, [user])
    // Feature switches (adjust as needed)
    const canWhatsApp = hasEntitlement("whatsapp_search");
    const canInventory = hasEntitlement("inventory");
    const canInvoicing = true; // if you gate invoicing, add entitlement and flip here
    const canDisputes = flagEnabled("disputes");
    const canEscrow = flagEnabled("escrow"); // (sitemap has Escrow module)
    const canReports = true;
    const isOwner = user?.role === "owner" || user?.role === "dealer";

    const selectedKey = useMemo(() => {
        const p = location.pathname;
        if (p.startsWith("/dashboard")) return "dashboard";
        if (p.startsWith("/whatsapp")) return "whatsapp";
        if (p.startsWith("/inventory")) return "inventory";
        if (p.startsWith("/invoices")) return "invoices";
        if (p.startsWith("/disputes")) return "disputes";
        if (p.startsWith("/escrow")) return "escrow";
        if (p.startsWith("/crm")) return "crm";
        if (p.startsWith("/reports")) return "reports";
        if (p.startsWith("/account")) return "account";
        if (p.startsWith("/support")) return "help";
        return "dashboard";
    }, [location.pathname]);

    const userMenu = (
        <Menu>
            <MenuItem key="u-profile" icon={<ProfileOutlined />}>
                <Link to="/account/profile">Company Profile</Link>
            </MenuItem>
            <MenuItem key="u-plan" icon={<CreditCardOutlined />}>
                <Link to="/account/plan">Subscription Plan</Link>
            </MenuItem>
            {isOwner && (
                <MenuItem key="u-team" icon={<UserAddOutlined />}>
                    <Link to="/account/team">Team Members</Link>
                </MenuItem>
            )}
            {/* <MenuItem key="u-api" icon={<ApiOutlined />}>
                <Link to="/account/api">API Access</Link>
            </MenuItem> */}
            <MenuItem key="u-logout" icon={<LogoutOutlined />} onClick={logout}>
                Logout
            </MenuItem>
        </Menu>
    );
    useEffect(() => {
        console.log("UI console user = = = = = = = >>>", user, isAuth, company)

    }, [user])
    if (visible == false) return <></>
    return (
        <Header
            style={{
                position: "sticky",
                top: '0',
                zIndex: 100,
                width: "100%",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                padding: '20px 12px'
            }}
        >
            {
                !isAuth ? (
                    <>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                height: 64,
                                padding: "0 16px",
                                justifyContent: "space-between"
                            }}
                        >
                            {/* Logo */}
                            <Link className="navbar-brand" to="/">
                                <span className="logo-text">
                                    Watch
                                    <span style={{
                                        color: '#b48c51',
                                        background: 'none',
                                        WebkitBackgroundClip: 'initial',
                                        WebkitTextFillColor: 'initial'
                                    }}>
                                        Dealer
                                    </span>Hub
                                </span>
                            </Link>
                            <div className="mobile-header">
                                <div className="d-lg-flex align-items-center ms-lg-auto mt-3 mt-lg-0 justify-content-center ui-header-log" >
                                    <Link to="/login" className="modern-signin-btn me-2" style={{ lineHeight: '31px', padding: '5px 10px', minWidth: '100px', textAlign: 'center' }}>Sign In</Link>
                                    <Link to="/dealer-register" className="modern-getstarted-btn" style={{ lineHeight: '31px', padding: '5px 10px', minWidth: '100px', textAlign: 'center' }}>Get Started</Link>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                height: 64,
                                padding: "0 16px",
                                justifyContent: "space-evenly"
                            }}
                        >

                            {/* Logo */}
                            <Link className="navbar-brand" to="/">
                                <span className="logo-text">
                                    Watch
                                    <span style={{
                                        color: '#b48c51',
                                        background: 'none',
                                        WebkitBackgroundClip: 'initial',
                                        WebkitTextFillColor: 'initial'
                                    }}>
                                        Dealer
                                    </span>Hub
                                </span>
                            </Link>

                            {/* Main Nav */}
                            <div style={{ flex: 1, minWidth: 0, }}>
                                <Menu
                                    mode="horizontal"
                                    selectedKeys={[selectedKey]}
                                    style={{ lineHeight: "64px", borderBottom: "none", justifyContent: 'center' }}
                                >
                                    <MenuItem key="dashboard" icon={<DashboardOutlined />}>
                                        <Link to="/dashboard">Dashboard</Link>
                                    </MenuItem>

                                    {canWhatsApp && (

                                        <SubMenu key="whatsapp" icon={<SearchOutlined />} title="WhatsApp Engine">
                                            <MenuItem key="whatsapp-search">
                                                <Link to="/whatsapp/search">Search & Filters</Link>
                                            </MenuItem>
                                            {/* <MenuItem key="whatsapp-dealers">
                                                <Link to="/whatsapp/dealers">Dealer List</Link>
                                            </MenuItem> */}
                                            <MenuItem key="whatsapp-digest">
                                                <Link to="/whatsapp/daily-digest">Daily Digest</Link>
                                            </MenuItem>
                                            <MenuItem key="whatsapp-alerts">
                                                <Link to="/whatsapp/alerts">Alerts Setup</Link>
                                            </MenuItem>
                                        </SubMenu>
                                    )}

                                    {canInventory && (
                                        <SubMenu key="inventory" icon={<DatabaseOutlined />} title="Inventory">
                                            <MenuItem key="inventory-list">
                                                <Link to="/inventory/list">All Watches</Link>
                                            </MenuItem>
                                            <MenuItem key="inventory-wishlist">
                                                <Link to="/inventory/wishlist">WishList</Link>
                                            </MenuItem>
                                        </SubMenu>
                                    )}

                                    {canInvoicing && (
                                        <SubMenu key="invoices" icon={<FileTextOutlined />} title="Invoicing">
                                            <MenuItem key="invoices-create">
                                                <Link to="/invoices/create">Create Invoice</Link>
                                            </MenuItem>
                                            <MenuItem key="invoices-list">
                                                <Link to="/invoices/list">Invoice History</Link>
                                            </MenuItem>
                                            <MenuItem key="invoices-payments">
                                                <Link to="/invoices/payments">Payments & Status</Link>
                                            </MenuItem>
                                        </SubMenu>
                                    )}

                                    {canEscrow && (
                                        <SubMenu key="escrow" icon={<SafetyOutlined />} title="Escrow Services">
                                            <MenuItem key="escrow-transactions">
                                                <Link to="/escrow/transactions">All Transactions</Link>
                                            </MenuItem>
                                            <MenuItem key="escrow-create">
                                                <Link to="/escrow/create">Create Escrow</Link>
                                            </MenuItem>
                                        </SubMenu>
                                    )}

                                    {canDisputes && (
                                        <SubMenu key="disputes" icon={<ExclamationCircleOutlined />} title="Disputes">
                                            <MenuItem key="disputes-list">
                                                <Link to="/disputes">All Disputes</Link>
                                            </MenuItem>
                                            <MenuItem key="disputes-create">
                                                <Link to="/disputes/create">File Dispute</Link>
                                            </MenuItem>
                                        </SubMenu>
                                    )}

                                    <SubMenu key="crm" icon={<TeamOutlined />} title="CRM">
                                        <MenuItem key="crm-customers">
                                            <Link to="/crm/customers">Customers</Link>
                                        </MenuItem>
                                        <MenuItem key="crm-dealers">
                                            <Link to="/crm/dealers">Dealers</Link>
                                        </MenuItem>
                                        <MenuItem key="crm-add">
                                            <Link to="/crm/add">Add Contact</Link>
                                        </MenuItem>
                                    </SubMenu>

                                    {canReports && (
                                        <SubMenu key="reports" icon={<BarChartOutlined />} title="Reports">
                                            <MenuItem key="reports-sales">
                                                <Link to="/reports/sales">Sales Reports</Link>
                                            </MenuItem>
                                            <MenuItem key="reports-aging">
                                                <Link to="/reports/aging">Inventory Aging</Link>
                                            </MenuItem>
                                            <MenuItem key="reports-whatsapp">
                                                <Link to="/reports/whatsapp">Daily Listings</Link>
                                            </MenuItem>
                                            <MenuItem key="reports-profit">
                                                <Link to="/reports/profit">P&L Reports</Link>
                                            </MenuItem>
                                        </SubMenu>
                                    )}

                                    <SubMenu key="account" icon={<SettingOutlined />} title="Account">
                                        <MenuItem key="account-choosePlan">
                                            <Link to="/account">Choose Plan</Link>
                                        </MenuItem>
                                        <MenuItem key="account-profile">
                                            <Link to="/account/profile">Company Profile</Link>
                                        </MenuItem>
                                        <MenuItem key="account-plan">
                                            <Link to="/account/plan">Subscription Plan</Link>
                                        </MenuItem>
                                        <MenuItem key="account-team">
                                            <Link to="/account/team">Team Members</Link>
                                        </MenuItem>
                                        {isOwner && (
                                            <MenuItem key="account-billing">
                                                <Link to="/account/billing">Billing History</Link>
                                            </MenuItem>
                                        )}
                                        <MenuItem key="account-api">
                                            <Link to="/account/api">API Settings</Link>
                                        </MenuItem>

                                    </SubMenu>

                                    <SubMenu key="help" icon={<QuestionCircleOutlined />} title="Help">
                                        <MenuItem key="help-docs">
                                            <Link to="/support/docs">Tutorials & Docs</Link>
                                        </MenuItem>
                                        <MenuItem key="help-ticket">
                                            <Link to="/support/ticket">Submit Ticket</Link>
                                        </MenuItem>
                                    </SubMenu>
                                </Menu>
                            </div>

                            {/* User Section */}
                            <Dropdown overlay={userMenu} trigger={["click"]}>
                                <div style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 8 }}>
                                    <Avatar size="small">{(user?.fullName || user?.name || "U").slice(0, 1).toUpperCase()}</Avatar>
                                    <span style={{ maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {user?.fullName || user?.name || user?.email || "User"}
                                    </span>
                                </div>
                            </Dropdown>
                        </div>
                    </>
                )
            }

        </Header>
    );
}

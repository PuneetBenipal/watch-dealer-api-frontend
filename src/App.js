import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import "antd/dist/antd.min.css";

// Context Providers
import { GlobalContextProvider } from './contexts/GlobalContext';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { WhatsappProvider } from './contexts/WhatsappScrapertext';

// Layout components
import PrivateRoute from './components/private/PrivateRoute';
import { AuthGuard, OnwerGuard, MemberGuard } from './components/common/Guards.jsx';
// import Header from './components/layout/Header';

// // Page components
import Dashboard from './pages/Dashboard';
import DealerDashboard from './pages/Dashboard/DealerDashboard';
import AgentRegister from "./pages/auth/AgentRegister";
import DealerRegister from "./pages/auth/DealerRegister.jsx";
import Login from "./pages/auth/Login";
import ResetPassword from './pages/auth/ResetPassword';
// import AdminRegister from "./pages/auth/AdminRegister";

// Account Pages
import AccountLandingPage from './pages/account/AccountLandingPage';
import Profile from "./pages/account/Profile";
import TeamPage from "./pages/account/TeamPage";
import BillingPage from './pages/account/BillingPage';
import ChoosePlanPage from "./pages/account/ChoosePlanPage";

// import DealerManagement from "./pages/DealerManagement"
import Agent from "./pages/Agent";
import Invoice from "./pages/invoice/Invoice";
import InvoiceCreate from "./pages/invoice/InvoiceCreate";
import InvoiceList from "./pages/invoice/InvoiceList";
import InvoicePayments from "./pages/invoice/InvoicePayments";
import InvoicePDF from "./pages/invoice/InvoicePDF";
import InvoiceIntegrations from "./pages/invoice/InvoiceIntegrations";
import InvoiceDetail from "./pages/invoice/InvoiceDetail";
import EnhancedInvoicing from "./pages/invoice/EnhancedInvoicing";

import WhatsApp from "./pages/WhatsApp";
import Wantbuy from './pages/WhatsApp/components/Wantbuy';

import InventoryManagement from "./pages/InventoryManagement";

import CRMModule from './pages/Crm';
import EnhancedCRM from './pages/Crm/EnhancedCRM';

import SalesReport from './pages/reports/SalesReport';
import AgingReport from './pages/reports/AgingReport';
import ProfitReport from './pages/reports/ProfitReport'
import WhatsAppDailyReport from './pages/reports/WhatsAppDailyReport';
import ReportsDashboard from './pages/reports/ReportsDashboard';

// Escrow and Dispute modules
import EscrowServices from './pages/escrow/EscrowServices';
import DisputeResolution from './pages/disputes/DisputeResolution';
// import AdminSettingPanel from './pages/admin';


import SupportHome from "./pages/Support/SupportHome"
import DocsPage from './pages/Support/DocsPage';
import DocAdminEditor from './pages/Support/DocAdminEditor';
import DocArticlePage from './pages/Support/DocArticlePage';
import SubmitTicket from './pages/Support/SubmitTicket';
import Support from "./pages/Support/index.jsx";
import Onboarding from './pages/Onboarding';
import DealerOnboarding from './pages/Onboarding/DealerOnboarding';
import WishList from './pages/wishList/index.js'

import AppHeader from './components/layout/AppHeader';
import Share from "./pages/Share";
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

import WhatsAppSetup from "./pages/account/AccountWhatsApp.jsx"
import AlertsPage from './pages/AlertsPage.jsx';
import InsightsPage from './pages/InsightsPage.jsx';
import ApiSettings from './pages/account/ApiSettings';
import Account from './pages/account';
import DealerInventory from './pages/inventory/DealerInventory';


function DocArticleRoute() {
    const { slug } = useParams();
    return <DocArticlePage slug={slug} />;
}


function App() {
    return (
        <GlobalContextProvider>
            <AuthProvider>
                <SocketProvider>
                    <WhatsappProvider>
                        <Router>
                            <AppHeader />
                            <Routes>
                                {/* Public Routes (Login/Register) */}
                                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                                <Route path="/signup" element={<PublicRoute><DealerRegister /></PublicRoute>} />
                                <Route path="/dealer-register" element={<PublicRoute><DealerRegister /></PublicRoute>} />
                                <Route path="/forgot-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                                <Route path="/account/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                                
                                {/* Protected Routes - Require Authentication */}
                                <Route path="/" element={<ProtectedRoute><DealerDashboard /></ProtectedRoute>} />
                                <Route path="/dashboard" element={<ProtectedRoute><DealerDashboard /></ProtectedRoute>} />
                                <Route path="/marketing" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                                <Route path="/onboarding" element={<ProtectedRoute><DealerOnboarding /></ProtectedRoute>} />
                                <Route path="/onboarding/legacy" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

                                {/* WhatsApp Engine Module - Protected */}
                                <Route path="/whatsapp" element={<ProtectedRoute><WhatsApp /></ProtectedRoute>} />
                                <Route path="/whatsapp/search" element={<ProtectedRoute><WhatsApp /></ProtectedRoute>} />
                                <Route path="/whatsapp/dealers" element={<ProtectedRoute><WhatsApp /></ProtectedRoute>} />
                                <Route path="/whatsapp/daily-digest" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
                                <Route path="/whatsapp/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
                                <Route path="/whatsapp/want" element={<ProtectedRoute><Wantbuy /></ProtectedRoute>} />

                                {/* Inventory Manager Module - Protected */}
                                <Route path="/inventory" element={<ProtectedRoute><DealerInventory /></ProtectedRoute>} />
                                <Route path="/inventory/list" element={<ProtectedRoute><DealerInventory /></ProtectedRoute>} />
                                <Route path="/inventory/add" element={<ProtectedRoute><DealerInventory /></ProtectedRoute>} />
                                <Route path="/inventory/upload" element={<ProtectedRoute><DealerInventory /></ProtectedRoute>} />
                                <Route path="/inventory/images" element={<ProtectedRoute><DealerInventory /></ProtectedRoute>} />
                                <Route path="/inventory/share" element={<ProtectedRoute><DealerInventory /></ProtectedRoute>} />
                                <Route path="/inventory/watch/:id" element={<ProtectedRoute><DealerInventory /></ProtectedRoute>} />
                                <Route path="/inventory/wishlist" element={<ProtectedRoute><WishList /></ProtectedRoute>} />
                                <Route path="/inventory/share/:token" element={<Share />} />
                                <Route path="/share/:token" element={<Share />} />

                                {/* Invoicing & Reconciliation Module - Protected */}
                                <Route path="/invoice" element={<ProtectedRoute><EnhancedInvoicing /></ProtectedRoute>} />
                                <Route path="/invoice/create" element={<ProtectedRoute><InvoiceCreate /></ProtectedRoute>} />
                                <Route path="/invoice/list" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
                                <Route path="/invoice/payments" element={<ProtectedRoute><InvoicePayments /></ProtectedRoute>} />
                                <Route path="/invoice/pdf" element={<ProtectedRoute><InvoicePDF /></ProtectedRoute>} />
                                <Route path="/invoice/integrations" element={<ProtectedRoute><InvoiceIntegrations /></ProtectedRoute>} />
                                <Route path="/invoice/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />

                                {/* Escrow Services Module - Protected */}
                                <Route path="/escrow" element={<ProtectedRoute><EscrowServices /></ProtectedRoute>} />
                                <Route path="/escrow/transactions" element={<ProtectedRoute><EscrowServices /></ProtectedRoute>} />
                                <Route path="/escrow/create" element={<ProtectedRoute><EscrowServices /></ProtectedRoute>} />

                                {/* Dispute Resolution Module - Protected */}
                                <Route path="/disputes" element={<ProtectedRoute><DisputeResolution /></ProtectedRoute>} />
                                <Route path="/disputes/create" element={<ProtectedRoute><DisputeResolution /></ProtectedRoute>} />
                                <Route path="/disputes/:id" element={<ProtectedRoute><DisputeResolution /></ProtectedRoute>} />

                                {/* CRM & Contacts Module - Protected */}
                                <Route path="/crm" element={<ProtectedRoute><EnhancedCRM /></ProtectedRoute>} />
                                <Route path="/crm/*" element={<ProtectedRoute><CRMModule /></ProtectedRoute>} />

                                {/* Reports Module - Protected */}
                                <Route path="/reports" element={<ProtectedRoute><ReportsDashboard /></ProtectedRoute>} />
                                <Route path="/reports/sales" element={<ProtectedRoute><SalesReport /></ProtectedRoute>} />
                                <Route path="/reports/aging" element={<ProtectedRoute><AgingReport /></ProtectedRoute>} />
                                <Route path="/reports/whatsapp" element={<ProtectedRoute><WhatsAppDailyReport /></ProtectedRoute>} />
                                <Route path="/reports/profit" element={<ProtectedRoute><ProfitReport /></ProtectedRoute>} />

                                {/* Help & Support Module - Protected */}
                                <Route path="/support" element={<ProtectedRoute><SupportHome /></ProtectedRoute>} />
                                <Route path="/support/docs" element={<ProtectedRoute><DocsPage /></ProtectedRoute>} />
                                <Route path="/support/docs/:slug" element={<ProtectedRoute><DocArticleRoute /></ProtectedRoute>} />
                                <Route path="/support/ticket" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                                <Route path="/support/chat" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                                <Route path="/support/docs-admin" element={<ProtectedRoute><DocAdminEditor /></ProtectedRoute>} />

                                {/* Account & Settings Module - Protected */}
                                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                                <Route path="/account/profile" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                                <Route path="/account/billing" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                                <Route path="/account/team" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                                <Route path="/account/whatsapp" element={<ProtectedRoute><WhatsAppSetup /></ProtectedRoute>} />
                                <Route path="/account/api" element={<ProtectedRoute><ApiSettings /></ProtectedRoute>} />
                                <Route path="/agent" element={<ProtectedRoute><Agent /></ProtectedRoute>} />

                                {/* Protected Routes */}
                                <Route element={<AuthGuard />}>
                                    <Route element={<OnwerGuard />}>
                                        <Route path="/account" element={<ChoosePlanPage />} />
                                        <Route path="/account/plan" element={<AccountLandingPage />} />
                                        <Route path="/account/team" element={<TeamPage />} />
                                        <Route path="/account/billing" element={<BillingPage />} />
                                        <Route path="/account/whatsapp" element={<WhatsAppSetup />} />
                                        <Route path="/account/api" element={<ApiSettings />} />
                                    </Route>
                                </Route>

                            </Routes>
                        </Router>
                    </WhatsappProvider>
                </SocketProvider>
            </AuthProvider>
        </GlobalContextProvider>
    );
}

export default App;

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

import WhatsApp from "./pages/WhatsApp";
import Wantbuy from './pages/WhatsApp/components/Wantbuy';

import InventoryManagement from "./pages/InventoryManagement";

import CRMModule from './pages/Crm';

import SalesReport from './pages/reports/SalesReport';
import AgingReport from './pages/reports/AgingReport';
import ProfitReport from './pages/reports/ProfitReport'
import WhatsAppDailyReport from './pages/reports/WhatsAppDailyReport';
// import AdminSettingPanel from './pages/admin';


import SupportHome from "./pages/Support/SupportHome"
import DocsPage from './pages/Support/DocsPage';
import DocAdminEditor from './pages/Support/DocAdminEditor';
import DocArticlePage from './pages/Support/DocArticlePage';
import SubmitTicket from './pages/Support/SubmitTicket';
import Support from "./pages/Support/index.jsx";
import Onboarding from './pages/Onboarding';
import WishList from './pages/wishList/index.js'

import AppHeader from './components/layout/AppHeader';
import Share from "./pages/Share";

import WhatsAppSetup from "./pages/account/AccountWhatsApp.jsx"
import AlertsPage from './pages/AlertsPage.jsx';
import InsightsPage from './pages/InsightsPage.jsx';


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
                                <Route path="/whatsapp/alerts" element={<AlertsPage />} />
                                <Route path="/whatsapp/daily-digest" element={<InsightsPage />} />


                                <Route path={"/dashboard"} element={<Dashboard />} />
                                <Route path={"/"} element={<Dashboard />} />

                                <Route path="/login" element={<Login />} />
                                <Route path="/dealer-register" element={<DealerRegister />} />
                                <Route path="/account/reset-password" element={<ResetPassword />} />
                                {/* <Route path="/agent-register" element={<AgentRegister />} /> */}

                                <Route element={<AuthGuard />}>
                                    <Route path="/account/profile" element={<Profile />} />
                                    <Route path="/crm/*" element={<CRMModule />} />


                                    <Route element={<OnwerGuard />}>
                                        <Route path="/account/plan" element={<AccountLandingPage />} />
                                        <Route path="/account" element={<ChoosePlanPage />} />
                                        <Route path="/account/team" element={<TeamPage />} />
                                        <Route path="/account/billing" element={<BillingPage />} />
                                        <Route path="/account/whatsapp" element={<WhatsAppSetup />} />

                                    </Route>

                                    <Route element={<MemberGuard />}>

                                    </Route>
                                </Route>

                                <Route path="/inventory/wishlist" element={<WishList />} />

                                <Route path="/whatsapp/want" element={<Wantbuy />} />
                                <Route path="/whatsapp/*" element={<WhatsApp />} />


                                <Route path="/inventory" element={<InventoryManagement />} />
                                <Route path="/reports/sales" element={<SalesReport />} />
                                <Route path="/reports/aging" element={<AgingReport />} />
                                <Route path="/reports/whatsapp" element={<WhatsAppDailyReport />} />
                                <Route path="/reports/profit" element={<ProfitReport />} />

                                <Route path="/onboarding" element={<Onboarding />} />

                                <Route path="/support/test" element={<Support />} />
                                <Route path="/support" element={<SupportHome />} />
                                <Route path="/support/docs" element={<DocsPage />} />
                                <Route path="/support/docs/:slug" element={<DocArticleRoute />} />
                                <Route path="/support/ticket" element={<Support />} />
                                {/* Optional in-app CMS for owners */}
                                <Route path="/support/docs-admin" element={<DocAdminEditor />} />

                                {/* <Route path="/dealer" element={<DealerManagement />} /> */}
                                <Route path="/whatsapp" element={<WhatsApp />} />
                                <Route path="/inventory/list" element={<InventoryManagement />} />
                                <Route path="/inventory/share/:token" element={<Share />} />
                                <Route path="/share/:token" element={<Share />} />


                                {/* <Route path="/admin" element={<PrivateRoute allowedRoles={['user']}><AdminSettingPanel /></PrivateRoute>} /> */}
                                <Route path="/agent" element={<PrivateRoute allowedRoles={['user']}><Agent /></PrivateRoute>} />
                                <Route path="/invoice" element={<PrivateRoute allowedRoles={['admin']}><Invoice /></PrivateRoute>} />
                                <Route path="/invoices" element={<PrivateRoute allowedRoles={['admin']}><InvoiceList /></PrivateRoute>} />
                                <Route path="/invoices/create" element={<PrivateRoute allowedRoles={['admin']}><InvoiceCreate /></PrivateRoute>} />
                                <Route path="/invoices/list" element={<PrivateRoute allowedRoles={['admin']}><InvoiceList /></PrivateRoute>} />
                                <Route path="/invoices/payments" element={<PrivateRoute allowedRoles={['admin']}><InvoicePayments /></PrivateRoute>} />
                                <Route path="/invoices/pdf/:id" element={<PrivateRoute allowedRoles={['admin']}><InvoicePDF /></PrivateRoute>} />
                                <Route path="/invoices/integrations" element={<PrivateRoute allowedRoles={['admin']}><InvoiceIntegrations /></PrivateRoute>} />
                                <Route path="/invoices/:id" element={<PrivateRoute allowedRoles={['admin']}><InvoiceDetail /></PrivateRoute>} />

                            </Routes>
                        </Router>
                    </WhatsappProvider>
                </SocketProvider>
            </AuthProvider>
        </GlobalContextProvider>
    );
}

export default App;

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Layout, Menu, Typography, message, } from "antd";
import { DatabaseOutlined, } from "@ant-design/icons";

import WhatsAppQueries from "./WhatsAppQuery";
import PurchaseHistory from "./PurchaseHistory";
import AdditionalUsers from "./AdditionalUsers";
import InventoryModule from "./InventoryModule";
import Loading from "../../../components/common/Loading";
import useAuth from "../../../hooks/useAuth";


const { Header, Content } = Layout;



/** Header / Nav */
function AccountHeader({ onNav }) {
    return (
        <Header className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between h-14">
                    <div className="flex items-center gap-2">
                        <DatabaseOutlined className="text-xl" />
                        <span className="font-semibold">Account</span>
                    </div>
                    <Menu mode="horizontal" selectable={false} onClick={({ key }) => onNav(key)}>
                        <Menu.Item key="whatsapp">WhatsApp Queries</Menu.Item>
                        <Menu.Item key="users">Additional Users</Menu.Item>
                        <Menu.Item key="inventory">Inventory</Menu.Item>
                        <Menu.Item key="history">Purchase History</Menu.Item>
                    </Menu>
                </div>
            </div>
        </Header>
    );
}


export default function AccountLandingPage() {
    // const [company, setCompany] = useState(null);
    const [whatsapp, setWhatsapp] = useState(null)
    const [addtionalUser, setAddtionalUser] = useState(null)
    const [inventory, setInventory] = useState(null);
    const [paidHistory, setPaidHistory] = useState(null)
    const { user, company } = useAuth();


    useEffect(() => {
        company.entitlements.map((entitlement) => {
            switch (entitlement.feature) {
                case "inventory":
                    setInventory(entitlement);
                    break;
                case "whatsapp_search":
                    setWhatsapp(entitlement);
                    break;
                case "team_mate":
                    setAddtionalUser(entitlement);
                    break;
            }
        })

        setPaidHistory(company.purchaseHistory);
    }, [company])

    if (!company) return <Loading size="lg" />
    return (
        <Layout className="min-h-screen">
            <style>{`html { scroll-behavior: smooth; }`}</style>
            {/* <AccountHeader onNav={scrollTo} /> */}

            <Content className="bg-gray-50">
                <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
                    <WhatsAppQueries data={whatsapp} company={company} />
                    <AdditionalUsers data={addtionalUser} company={company} />
                    <InventoryModule data={inventory} company={company} />
                    <PurchaseHistory data={paidHistory} />
                    <div className="text-center text-gray-400 text-xs py-10">© {new Date().getFullYear()} WatchDealerHub</div>
                </div>
            </Content>
        </Layout>
    );
}

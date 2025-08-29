import React, { useState } from 'react';
import { Tabs } from 'antd';

import Profile from './Profile';
import TeamPage from './TeamPage';
import AccountPlanPage from './Plan';
import BillingPage from './BillingPage';

const Account = () => {
    return (
        <>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
                <Tabs defaultActiveKey="1" type='card' tabPosition="top">
                    <Tabs.TabPane tab="Profile" key="1">
                        <Profile />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Plan" key="2">
                        <AccountPlanPage />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Team" key="3">
                        <TeamPage />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Billing" key="4">
                        <BillingPage />
                    </Tabs.TabPane>
                </Tabs>
            </div>
        </>
    );
};

export default Account;
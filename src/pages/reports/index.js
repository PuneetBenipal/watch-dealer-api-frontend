import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, DatePicker, Select, Card, Statistic, Row, Col, Table, Tag, Space, Typography, Divider } from 'antd';
import moment, { Moment } from 'moment';
import API from '../../api';
import useAuth from '../../hooks/useAuth';
import Loading from '../../components/common/Loading';
import { Toast } from '../../components/Alerts/CustomToast';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const useRange = (days) => {
    const [range, setRange] = useState([moment().subtract(days, 'days'), moment()]);
    return { range, setRange };
};

const number = (v) => (v ?? 0).toLocaleString();


function WhatsAppDailyReport({ companyId }) {
    const { range, setRange } = useRange(7);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await API.get('/api/reports/whatsapp', {
                companyId,
                start: range[0].toISOString(),
                end: range[1].toISOString(),
            });
            setData(res.data);
        } catch (e) { Toast.error(e.Toast || 'Failed to load WhatsApp report'); }
        setLoading(false);
    };

    useEffect(() => {
        fetchData(); // eslint-disable-next-line
    }, [companyId, range[0]?.toISOString(), range[1]?.toISOString()]);

    const summary = data?.summary?.[0] || {};

    return (
        <Card bordered className="rounded-2xl shadow">
            <Row gutter={16} align="middle" justify="space-between">
                <Col>
                    <Space direction="vertical" size={0}>
                        <Title level={4} style={{ marginBottom: 0 }}>Daily Listings</Title>
                        <Text type="secondary">New WhatsApp listings</Text>
                    </Space>
                </Col>
                <Col>
                    <RangePicker value={range} onChange={(v) => v && setRange(v)} allowClear={false} />
                </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
                <Col xs={12} md={6}><Card><Statistic title="Listings" value={number(summary.listings)} /></Card></Col>
                <Col xs={12} md={6}><Card><Statistic title="Top Brands" value={number(data?.topBrands?.length)} /></Card></Col>
                <Col xs={12} md={6}><Card><Statistic title="Top Dealers" value={number(data?.topDealers?.length)} /></Card></Col>
                <Col xs={12} md={6}><Card><Statistic title="Countries" value={number(data?.byCountry?.length)} /></Card></Col>
            </Row>
            <Divider />
            <Title level={5}>By Country</Title>
            <Table size="small" loading={loading} rowKey={(r) => r.country || Math.random()}
                dataSource={data?.byCountry || []}
                columns={[
                    { title: 'Country', dataIndex: 'country' },
                    { title: 'Listings', dataIndex: 'listings' }
                ]}
            />
            <Divider />
            <Title level={5}>Top Brands</Title>
            <Table size="small" loading={loading} rowKey={(r) => r.brand}
                dataSource={data?.topBrands || []}
                columns={[{ title: 'Brand', dataIndex: 'brand' }, { title: 'Listings', dataIndex: 'listings' }]} />
        </Card>
    );
}

function ProfitReport({ companyId }) {
    const { range, setRange } = useRange(90);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await API.get('/api/reports/profit', {
                companyId,
                start: range[0].toISOString(),
                end: range[1].toISOString(),
            });
            setData(res.data);
        } catch (e) { Toast.error(e.Toast || 'Failed to load P&L'); }
        setLoading(false);
    };

    useEffect(() => {
        fetchData(); // eslint-disable-next-line
    }, [companyId, range[0]?.toISOString(), range[1]?.toISOString()]);

    const summary = data?.summary?.[0] || {};

    return (
        <Card bordered className="rounded-2xl shadow">
            <Row gutter={16} align="middle" justify="space-between">
                <Col>
                    <Space direction="vertical" size={0}>
                        <Title level={4} style={{ marginBottom: 0 }}>P&L</Title>
                        <Text type="secondary">Gross profit from invoices vs COGS</Text>
                    </Space>
                </Col>
                <Col>
                    <RangePicker value={range} onChange={(v) => v && setRange(v)} allowClear={false} />
                </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
                <Col xs={24} md={8}><Card><Statistic title="Revenue" value={`£ ${number(summary.revenue)}`} /></Card></Col>
                <Col xs={24} md={8}><Card><Statistic title="COGS" value={`£ ${number(summary.cogs)}`} /></Card></Col>
                <Col xs={24} md={8}><Card><Statistic title="Gross Profit" value={`£ ${number(summary.grossProfit)}`} /></Card></Col>
            </Row>
            <Divider />
            <Title level={5}>By Period</Title>
            <Table size="small" loading={loading} rowKey={(r) => r.period}
                dataSource={data?.byPeriod || []}
                columns={[
                    { title: 'Period', dataIndex: 'period' },
                    { title: 'Revenue', dataIndex: 'revenue', render: (v) => `£ ${number(v)}` },
                    { title: 'COGS', dataIndex: 'cogs', render: (v) => `£ ${number(v)}` },
                    { title: 'Gross Profit', dataIndex: 'grossProfit', render: (v) => `£ ${number(v)}` }
                ]}
            />
            <Divider />
            <Title level={5}>By Brand</Title>
            <Table size="small" loading={loading} rowKey={(r) => r.brand}
                dataSource={data?.byBrand || []}
                columns={[
                    { title: 'Brand', dataIndex: 'brand' },
                    { title: 'Revenue', dataIndex: 'revenue', render: (v) => `£ ${number(v)}` },
                    { title: 'COGS', dataIndex: 'cogs', render: (v) => `£ ${number(v)}` },
                    { title: 'Gross Profit', dataIndex: 'grossProfit', render: (v) => `£ ${number(v)}` }
                ]}
            />
        </Card>
    );
}

export default function ReportsPage() {
    // NOTE: plug your real companyId from auth context. For now, leave undefined to see global data.
    const { user } = useAuth();
    const [companyId, setCompanyId] = useState(null);
    useEffect(() => {
        if (!user) return;
        console.log("UI console user'<',", user)
        setCompanyId(user.companyId)
    }, [user])

    if (!companyId) return <Loading />
    return (
        <div className="p-4 max-w-7xl mx-auto space-y-16">
            <Title level={3}>Reports</Title>
            <Tabs defaultActiveKey="sales" size="large" type='card'>
                {/* <Tabs.TabPane tab="Sales" key="sales">
                    <SalesReport  />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Inventory Aging" key="aging">
                    <AgingReport  />
                </Tabs.TabPane> */}
                <Tabs.TabPane tab="Daily Listings" key="whatsapp">
                    <WhatsAppDailyReport  />
                </Tabs.TabPane>
                <Tabs.TabPane tab="P&L" key="profit">
                    <ProfitReport  />
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
}
import React, { use, useEffect, useMemo, useState } from 'react';
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


export default function ProfitReport() {
    const { user } = useAuth();
    const [companyId, setCompanyId] = useState('');
    const { range, setRange } = useRange(90);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        setCompanyId(user.companyId);
    }, [user])

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
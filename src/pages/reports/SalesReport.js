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

export default function SalesReport() {
    const { user } = useAuth();
    const { companyId } = user;

    const { range, setRange } = useRange(30);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await API.get('/api/reports/sales', {
                companyId,
                start: range[0].toISOString(),
                end: range[1].toISOString(),
            });
            setData(res.data);
        } catch (e) { Toast.error(e.message || 'Failed to load sales'); }
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
                        <Title level={4} style={{ marginBottom: 0 }}>Sales</Title>
                        <Text type="secondary">Revenue & deals</Text>
                    </Space>
                </Col>
                <Col>
                    <RangePicker value={range} onChange={(v) => v && setRange(v)} allowClear={false} />
                </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
                <Col xs={12} md={6}><Card><Statistic title="Revenue" value={`£ ${number(summary.revenue)}`} /></Card></Col>
                <Col xs={12} md={6}><Card><Statistic title="Deals" value={number(summary.deals)} /></Card></Col>
                <Col xs={12} md={6}><Card><Statistic title="Top Brands" value={number(data?.topBrands?.length)} /></Card></Col>
                <Col xs={12} md={6}><Card><Statistic title="Payments" value={number(data?.paymentBreakdown?.length)} /></Card></Col>
            </Row>
            <Divider />
            <Title level={5}>Top Brands</Title>
            <Table size="small" loading={loading} rowKey={(r) => r.brand}
                dataSource={data?.topBrands || []}
                columns={[
                    { title: 'Brand', dataIndex: 'brand' },
                    { title: 'Qty', dataIndex: 'qty' },
                    { title: 'Revenue', dataIndex: 'revenue', render: (v) => `£ ${number(v)}` },
                ]}
            />
            <Divider />
            <Title level={5}>Payment Breakdown</Title>
            <Table size="small" loading={loading} rowKey={(r) => r.paymentMethod}
                dataSource={data?.paymentBreakdown || []}
                columns={[
                    { title: 'Method', dataIndex: 'paymentMethod', render: (m) => <Tag color="blue">{m || 'unknown'}</Tag> },
                    { title: 'Deals', dataIndex: 'deals' },
                    { title: 'Revenue', dataIndex: 'revenue', render: (v) => `£ ${number(v)}` }
                ]}
            />
        </Card>
    );
}
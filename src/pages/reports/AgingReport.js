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

export default function AgingReport({ companyId }) {
    const [includeSold, setIncludeSold] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await API.get('/api/reports/aging', { companyId, includeSold: includeSold ? 1 : '' });
            setData(res.data);
        } catch (e) { Toast.error(e.Toast || 'Failed to load aging'); }
        setLoading(false);
    };

    useEffect(() => {
        fetchData(); // eslint-disable-next-line
    }, [companyId, includeSold]);

    const summary = data?.summary?.[0] || {};

    return (
        <Card bordered className="rounded-2xl shadow">
            <Row gutter={16} align="middle" justify="space-between">
                <Col>
                    <Space direction="vertical" size={0}>
                        <Title level={4} style={{ marginBottom: 0 }}>Inventory Aging</Title>
                        <Text type="secondary">Days in stock & tied-up capital</Text>
                    </Space>
                </Col>
                <Col>
                    <Space>
                        <Text>Include Sold</Text>
                        <Select value={includeSold ? 'yes' : 'no'} onChange={(v) => setIncludeSold(v === 'yes')} style={{ width: 120 }}
                            options={[{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }]} />
                    </Space>
                </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
                <Col xs={12} md={6}><Card><Statistic title="Items" value={number(summary.items)} /></Card></Col>
                <Col xs={12} md={6}><Card><Statistic title="Avg Age (days)" value={summary.avgAge || 0} /></Card></Col>
                <Col xs={12} md={6}><Card><Statistic title="Value Paid" value={`£ ${number(summary.valuePaid)}`} /></Card></Col>
                <Col xs={12} md={6}><Card><Statistic title="Brands" value={number(data?.byBrand?.length)} /></Card></Col>
            </Row>
            <Divider />
            <Title level={5}>Aging Buckets</Title>
            <Table size="small" loading={loading} rowKey={(r) => r.bucket}
                dataSource={data?.buckets || []}
                columns={[
                    { title: 'Bucket', dataIndex: 'bucket' },
                    { title: 'Count', dataIndex: 'count' },
                    { title: 'Value Paid', dataIndex: 'valuePaid', render: (v) => `£ ${number(v)}` }
                ]}
            />
            <Divider />
            <Title level={5}>By Brand</Title>
            <Table size="small" loading={loading} rowKey={(r) => r.brand}
                dataSource={data?.byBrand || []}
                columns={[
                    { title: 'Brand', dataIndex: 'brand' },
                    { title: 'Items', dataIndex: 'count' },
                    { title: 'Avg Age (d)', dataIndex: 'avgAge' },
                    { title: 'Value Paid', dataIndex: 'valuePaid', render: (v) => `£ ${number(v)}` }
                ]}
            />
        </Card>
    );
}
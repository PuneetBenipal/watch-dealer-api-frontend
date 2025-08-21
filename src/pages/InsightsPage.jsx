import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import { InsightsAPI } from '../api/alerts.api';

export default function InsightsPage() {
    const [summary, setSummary] = useState({ listings_24h: 0, underpriced_24h: 0 });
    const [under, setUnder] = useState([]);
    const [mm, setMM] = useState([]);

    useEffect(() => {
        InsightsAPI.summary().then(setSummary);
        InsightsAPI.underpriced().then(setUnder);
        InsightsAPI.matchmaking().then(setMM);
    }, []);

    return (
        <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={12} md={6}><Card><Statistic title="Listings (24h)" value={summary.listings_24h} /></Card></Col>
                <Col xs={12} md={6}><Card><Statistic title="Underpriced (24h)" value={summary.underpriced_24h} /></Card></Col>
            </Row>

            <Card title="Suggested Sales Actions — Underpriced Now">
                <Table
                    rowKey="_id"
                    dataSource={under}
                    columns={[
                        { title: 'Ref', dataIndex: 'ref' },
                        { title: 'Brand', dataIndex: 'brand' },
                        { title: 'Model', dataIndex: 'model' },
                        { title: 'Price', dataIndex: 'price', render: (v, r) => `${r.currency} ${Number(v).toLocaleString()}` },
                        { title: 'Median(30d)', dataIndex: 'median', render: (_, r) => r.median ? Number(r.median).toLocaleString() : '-' },
                        { title: 'Country', dataIndex: 'country' },
                        { title: 'Action', render: () => <Tag color="green">Buy / Contact Seller</Tag> }
                    ]}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Card title="Matchmaking — Buyer Requests vs Your Inventory" style={{ marginTop: 16 }}>
                <Table
                    rowKey={(r) => `${r.request_id}_${r.inventory_id}`}
                    dataSource={mm}
                    columns={[
                        { title: 'Request', render: (_, r) => `${r.brand || ''} ${r.model || ''} ${r.ref || ''}` },
                        { title: 'Inventory ID', dataIndex: 'inventory_id' },
                        { title: 'Price', dataIndex: 'price_listed', render: (v, r) => `${r.currency} ${Number(v).toLocaleString()}` },
                        { title: 'Country', dataIndex: 'country' },
                        { title: 'Suggested', render: () => <Tag color="blue">Propose Deal</Tag> }
                    ]}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
}
    
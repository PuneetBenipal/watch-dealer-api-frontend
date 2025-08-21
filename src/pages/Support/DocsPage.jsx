import React, { useEffect, useMemo, useState } from "react";
import { Input, Select, List, Card, Typography, Space, Tag, Empty, Skeleton, Row, Col, Button, Segmented } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOutlined } from "@ant-design/icons";
import { fetchDocs } from "../../api/support";
const { Title, Paragraph, Text } = Typography;

const CATEGORIES = [
    { value: "whatsapp", label: "WhatsApp Engine" },
    { value: "inventory", label: "Inventory" },
    { value: "invoices", label: "Invoicing" },
    { value: "account", label: "Account & Billing" },
    { value: "other", label: "Other" },
];

export default function DocsPage() {
    const [q, setQ] = useState("");
    const [category, setCategory] = useState();
    const [scope, setScope] = useState("all"); // all | platform | company
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const nav = useNavigate();

    // read query params once (deep links from SupportHome)
    useEffect(() => {
        const sp = new URLSearchParams(location.search);
        const cq = sp.get("q") || "";
        const cc = sp.get("category") || undefined;
        const sc = sp.get("scope") || "all";
        setQ(cq); setCategory(cc); setScope(sc);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchDocs({ q, category, scope }).then((r) => {
            if (r.ok) setRows(r.data || []);
            setLoading(false);
        });
    }, [q, category, scope]);

    const categoryChips = useMemo(() => (
        <Space size={[8, 8]} wrap>
            {CATEGORIES.map((c) => (
                <Tag
                    key={c.value}
                    color={category === c.value ? "blue" : undefined}
                    onClick={() => setCategory(category === c.value ? undefined : c.value)}
                    style={{ cursor: "pointer", padding: "6px 10px", borderRadius: 999 }}
                >
                    {c.label}
                </Tag>
            ))}
        </Space>
    ), [category]);

    return (
        <div style={{ backgroundImage: "    ", backgroundAttachment: 'fixed' }}>
            <div className="p-6 max-w-6xl mx-auto">
                <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
                    <Col>
                        <Space direction="vertical" size={4}>
                            <Title level={2} style={{ margin: 0 }}>Tutorials & Docs</Title>
                            <Text type="secondary">Filter by Platform-wide docs or your Company SOPs.</Text>
                        </Space>
                    </Col>
                    <Col>
                        <Button type="default" icon={<BookOutlined />} onClick={() => nav("/support")}>Back to Support</Button>
                    </Col>
                </Row>

                <Space size="middle" style={{ width: "100%", marginBottom: 16 }} wrap>
                    <Input.Search allowClear defaultValue={q} placeholder="Search articles" onSearch={setQ} style={{ width: 420 }} />
                    <Select allowClear placeholder="Filter by category" value={category} style={{ width: 260 }} options={CATEGORIES} onChange={setCategory} />
                    <Segmented
                        options={[{ label: "All", value: "all" }, { label: "Platform", value: "platform" }, { label: "Your Company", value: "company" }]}
                        value={scope}
                        onChange={setScope}
                    />
                </Space>

                <div className="mb-3">{categoryChips}</div>

                {loading ? (
                    <Skeleton active paragraph={{ rows: 6 }} />
                ) : rows?.length ? (
                    <List
                        grid={{ gutter: 16, column: 3 }}
                        dataSource={rows}
                        renderItem={(item) => (
                            <List.Item>
                                <Card hoverable onClick={() => (window.location.href = `/support/docs/${item.slug}`)} className="rounded-2xl">
                                    <Space direction="vertical" size={6} style={{ width: "100%" }}>
                                        <Title level={4} style={{ marginBottom: 0 }}>{item.title}</Title>
                                        <Paragraph type="secondary" ellipsis={{ rows: 2 }}>{item.summary || item.content?.slice(0, 160)}</Paragraph>
                                        <Space size="small" wrap>
                                            <Tag color={item.companyId ? "success" : "processing"}>{item.companyId ? "Company" : "Platform"}</Tag>
                                            {item.category && <Tag>{item.category}</Tag>}
                                            {item.tags?.slice(0, 3).map((t) => (<Tag key={t}>{t}</Tag>))}
                                            <Text type="secondary">Views: {item.views || 0}</Text>
                                        </Space>
                                    </Space>
                                </Card>
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty description="No docs found" />
                )}
            </div>
        </div>
    );
}
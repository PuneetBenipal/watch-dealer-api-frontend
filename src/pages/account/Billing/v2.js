// BillingPage.jsx (AntD v4)
import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Card, Button, Table, Tag, Progress, Tooltip, Typography, Space } from "antd";
import { ReloadOutlined, FileTextOutlined, CloudDownloadOutlined, CreditCardOutlined, ThunderboltOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Toast } from "../../../components/Alerts/CustomToast";
const { Title, Text } = Typography;

export default function BillingPage() {
    const [loading, setLoading] = useState(false);
    const [snapshot, setSnapshot] = useState(null);
    const [invPage, setInvPage] = useState(1);
    const pageSize = 10;

    const fetchSnapshot = async (page = 1) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/account/billing/snapshot?page=${page}&pageSize=${pageSize}`);
            const data = await res.json();
            setSnapshot(data);
        } catch (e) {
            Toast.error("Failed to load billing");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSnapshot(invPage); }, [invPage]);

    const pm = snapshot?.stripe?.paymentMethod;
    const sub = snapshot?.subscription;
    const usage = snapshot?.usage;

    const columns = useMemo(() => ([
        { title: "Invoice ID", dataIndex: "id", key: "id", render: (v) => <Tag>{v}</Tag> },
        { title: "Issued", dataIndex: "issuedAt", key: "issuedAt", render: v => dayjs(v).format("MMM D, YYYY") },
        { title: "Description", dataIndex: "description", key: "description" },
        { title: "Total", dataIndex: "total", key: "total", render: (c, r) => new Intl.NumberFormat(undefined, { style: "currency", currency: r.currency || "USD" }).format((c || 0) / 100) },
        { title: "Status", dataIndex: "status", key: "status", render: s => <Tag color={s === "paid" ? "green" : s === "open" ? "orange" : "default"}>{s}</Tag> },
        {
            title: "Actions", key: "actions", render: (_, r) => (
                <Space>
                    {r.pdfUrl && <Tooltip title="Download PDF">
                        <Button size="small" shape="circle" icon={<FileTextOutlined />} onClick={() => window.open(r.pdfUrl, "_blank")} />
                    </Tooltip>}
                    {r.hostedUrl && <Tooltip title="Open Invoice">
                        <Button size="small" shape="circle" icon={<CloudDownloadOutlined />} onClick={() => window.open(r.hostedUrl, "_blank")} />
                    </Tooltip>}
                </Space>
            )
        },
    ]), []);

    const openPortal = async () => {
        const res = await fetch("/api/billing/portal", { method: "POST" });
        const { url } = await res.json();
        if (url) window.location.href = url;
    };

    const exportCsv = async () => {
        const res = await fetch(`/api/billing/invoices/export?format=csv`);
        const blob = await res.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "billing_invoices.csv";
        link.click();
    };

    const ManageBtn = ({ onClick, children }) => (
        <Button size="small" onClick={onClick}>{children || "Manage"}</Button>
    );

    const UsageTile = ({ title, icon, used, limit, footer, percentColor }) => {
        const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
        return (
            <Card size="small" style={{ height: "100%" }}>
                <Space align="start">
                    {icon}
                    <div>
                        <Text strong>{title}</Text>
                        <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 18, fontWeight: 600 }}>{used}{limit ? `/${limit}` : ""}</div>
                            <div style={{ marginTop: 6 }}>
                                <Progress percent={pct} status="active" showInfo={false} strokeColor={percentColor} />
                                <Text type="secondary">{pct}% used</Text>
                            </div>
                        </div>
                        <div style={{ marginTop: 10 }}>{footer}</div>
                    </div>
                </Space>
            </Card>
        );
    };

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col><Title level={3} style={{ margin: 0 }}>Billing</Title></Col>
                <Col>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={() => fetchSnapshot(invPage)}>Refresh</Button>
                        <Button onClick={exportCsv}>Export CSV</Button>
                        <Button type="primary" onClick={openPortal}>Open Billing Portal</Button>
                    </Space>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} md={10}>
                    <Card loading={loading} title="Subscription">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ marginBottom: 6 }}>
                                    <Text strong>{(sub?.planId || "").toUpperCase()}</Text>{" "}
                                    <Tag color={sub?.planStatus === "active" ? "green" : "orange"}>{sub?.planStatus || "unknown"}</Tag>
                                </div>
                                <Text type="secondary">
                                    Renews {sub?.renewalDate ? dayjs(sub.renewalDate).format("MMM D, YYYY") : "—"}
                                </Text>
                                <div style={{ marginTop: 12 }}>
                                    <Text type="secondary">Payment Method</Text>
                                    <div>
                                        <CreditCardOutlined />{" "}
                                        {pm ? `${pm.brand?.toUpperCase()} •••• ${pm.last4} — exp ${String(pm.expMonth).padStart(2, "0")}/${pm.expYear}` : "—"}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Button onClick={openPortal}>Update Payment Method</Button>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={14}>
                    <Card loading={loading} title="Usage This Period">
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <UsageTile
                                title="WhatsApp Queries"
                                icon={<ThunderboltOutlined style={{ fontSize: 18 }} />}
                                used={usage?.whatsapp?.used || 0}
                                limit={usage?.whatsapp?.limit || 0}
                                percentColor="#1890ff"
                                footer={<Space>
                                    <Text type="secondary">Resets {usage?.whatsapp?.resetsAt ? dayjs(usage.whatsapp.resetsAt).fromNow() : "monthly"}</Text>
                                    <ManageBtn onClick={() => window.location.href = "/account/plan#queries"}>Manage</ManageBtn>
                                </Space>}
                            />
                            <UsageTile
                                title="Inventory Module"
                                icon={<ShoppingCartOutlined style={{ fontSize: 18 }} />}
                                used={usage?.inventory?.enabled ? 1 : 0}
                                limit={1}
                                percentColor="#fa541c"
                                footer={<Space>
                                    <Text type="secondary">
                                        {usage?.inventory?.enabled
                                            ? "Enabled"
                                            : usage?.inventory?.trialEndsAt
                                                ? `Trial ends ${dayjs(usage.inventory.trialEndsAt).format("MMM D")}`
                                                : "Not enabled"}
                                    </Text>
                                    <ManageBtn onClick={() => window.location.href = "/account/plan#inventory"}>Manage</ManageBtn>
                                </Space>}
                            />
                            <UsageTile
                                title="Agent Seats"
                                icon={<UserIcon />}
                                used={usage?.seats?.used || 0}
                                limit={usage?.seats?.purchased || 0}
                                percentColor="#52c41a"
                                footer={<Space>
                                    <Text type="secondary">Resets monthly</Text>
                                    <ManageBtn onClick={() => window.location.href = "/account/team"}>Manage</ManageBtn>
                                </Space>}
                            />
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Card style={{ marginTop: 16 }} title="Billing History" extra={<Text type="secondary">Receipts & invoices for this company</Text>}>
                <Table
                    loading={loading}
                    rowKey="id"
                    dataSource={snapshot?.invoices?.items || []}
                    columns={columns}
                    pagination={{
                        current: snapshot?.invoices?.page || invPage,
                        pageSize,
                        total: snapshot?.invoices?.total || 0,
                        onChange: (p) => setInvPage(p),
                    }}
                />
            </Card>
        </div>
    );
}

function UserIcon() {
    return <span className="anticon" role="img" aria-label="user" style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: "#52c41a" }} />;
}

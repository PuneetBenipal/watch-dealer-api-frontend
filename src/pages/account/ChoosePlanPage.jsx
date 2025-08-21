import React, { useEffect, useMemo, useState } from "react";
import {
    Row,
    Col,
    Card,
    Button,
    Tag,
    List,
    Space,
    Typography,
    Divider,
    Tooltip,
    Radio,
    Badge,
    Avatar,
    Collapse
} from "antd";
import {
    CheckOutlined,
    CloseOutlined,
    StarFilled,
    ThunderboltOutlined,
    ReloadOutlined,
    CrownFilled,
    RocketFilled,
    SmileTwoTone
} from "@ant-design/icons";
import { BACKEND_URL } from "../../config";
import API from "../../api";
import { Toast } from "../../components/Alerts/CustomToast";

export default function ChoosePlanPage() {
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState(defaultPlans);
    const [interval, setInterval] = useState("month"); // "month" | "year"

    const fetchPlans = async () => {
        try {
            setLoading(true);
            // const res = await API.get("/public/plans", { params: { interval } });
            // const list = res?.data?.plans || res?.data || [];
            // if (list.length) setPlans(list);
        } catch (e) {
            // keep fallback
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlans(); /* eslint-disable-next-line */ }, [interval]);

    const popularId = useMemo(() => plans.find(p => p.popular)?.id || "pro", [plans]);

    const checkout = async (planId) => {
        try {
            setLoading(true);
            let plan = plans.find(plan => plan.id === planId)
            const res = await API.post(`${BACKEND_URL}/api/stripe/create-checkout-session`, { items: [plan], plan: plan.id });
            console.log("UI console checkout",plan)

            // window.location.href = res.data.url;
        } catch (e) {
            Toast.error(e?.response?.data?.Toast || e.Toast);
        } finally { setLoading(false); }
    };

    return (
        <>
            <div style={{ background: "#fff", }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", }}>
                    {/* HERO */}
                    <div style={{ padding: "24px 24px 16px", marginTop: "24px" }}>
                        <Space direction="vertical" size={8} style={{ width: "100%" }}>
                            <Typography.Title level={2} style={{ marginBottom: 0 }}>Upgrade your plan</Typography.Title>
                            <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
                                Start with a plan and add seats or modules anytime. Upgrade, downgrade, or cancel whenever you like.
                            </Typography.Paragraph>
                            <Space style={{ justifyContent: "space-between", width: "100%" }}>
                                {/* <Tooltip title="Refresh plans"><Button icon={<ReloadOutlined />} onClick={fetchPlans} /></Tooltip> */}
                                <span></span>
                                <Radio.Group value={interval} onChange={(e) => setInterval(e.target.value)} buttonStyle="solid">
                                    <Radio.Button value="month">Monthly</Radio.Button>
                                    <Radio.Button value="year">Yearly <Tag color="gold" style={{ marginLeft: 8 }}>Save 2 months</Tag></Radio.Button>
                                </Radio.Group>
                            </Space>
                        </Space>
                    </div>

                    {/* CARDS */}
                    <div style={{ padding: "8px 24px" }}>
                        <Row gutter={[16, 16]}>
                            {plans.map((p) => (
                                <Col xs={24} md={12} lg={8} key={p.id}>
                                    <PlanCard
                                        loading={loading}
                                        plan={p}
                                        interval={interval}
                                        popular={p.id === popularId}
                                        onSelect={() => checkout(p.id)}
                                    />
                                </Col>
                            ))}
                        </Row>

                        {/* TRUST STRIP */}
                        <div style={{
                            marginTop: 28,
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                            gap: 16
                        }}>
                            <TrustTile icon={<RocketFilled />} title="Fast onboarding" desc="Be live in minutes with a guided setup." />
                            <TrustTile icon={<CrownFilled />} title="Dealer‑first features" desc="Built around real daily workflows." />
                            <TrustTile icon={<SmileTwoTone twoToneColor="#52c41a" />} title="Cancel anytime" desc="No lock‑in. Keep your data." />
                        </div>
                    </div>

                    {/* COMPARE */}
                    <div style={{ padding: "24px 24px" }}>
                        <Divider style={{ margin: "32px 0" }} />
                        <CompareTable plans={plans} />

                        {/* FAQ */}
                        <Divider style={{ margin: "32px 0" }} />
                        <Typography.Title level={4}>Frequently asked</Typography.Title>
                        <Collapse bordered={false}>
                            <Collapse.Panel header={<span>Can I add agent seats later?</span>} key="1">
                                <Typography.Paragraph>Yes. Seats are billed to your company and each seat includes 300 queries/month. Add or remove any time.</Typography.Paragraph>
                            </Collapse.Panel>
                            <Collapse.Panel header={<span>How do trials work?</span>} key="2">
                                <Typography.Paragraph>Inventory includes a 7‑day free trial on Pro and Premium. You can activate or cancel during the trial without charges.</Typography.Paragraph>
                            </Collapse.Panel>
                            <Collapse.Panel header={<span>Do you support multiple currencies?</span>} key="3">
                                <Typography.Paragraph>Yes. Prices display in GBP by default; within the app you can switch to USD, AED, or HKD.</Typography.Paragraph>
                            </Collapse.Panel>
                        </Collapse>
                    </div>
                </div>
            </div>
        </>
    );
}

function PlanCard({ plan, interval, onSelect, loading, popular }) {
    const priceLabel = plan.prices?.[interval]?.label || plan.priceLabel || "—";
    const cta = plan.ctaText || (plan.tier === "basic" ? "Get started" : "Upgrade Plan");

    const cardStyle = {
        borderRadius: 14,
        background: "#fff",
        boxShadow: popular ? "0 10px 26px rgba(24, 144, 255, 0.2)" : "0 8px 22px rgba(0,0,0,0.08)",
        border: "1px solid #f0f0f0",
        overflow: "hidden",
        transition: "transform .18s ease, box-shadow .18s ease",
        paddingTop: "15px"
    };

    return (
        <Badge.Ribbon text={popular ? "Most popular" : null} color={popular ? "gold" : "blue"} placement="start">
            <Card
                hoverable
                loading={loading}
                style={cardStyle}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                title={
                    <Space direction="vertical" size={0}>
                        <Typography.Title level={4} style={{ margin: 0 }}>{plan.name}</Typography.Title>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>{plan.subtitle}</Typography.Text>
                    </Space>
                }
                extra={<Tag color="processing" style={{ fontSize: 12, marginTop: "-5px" }}>{priceLabel}</Tag>}
            >
                <List
                    dataSource={plan.features}
                    renderItem={(f) => (
                        <List.Item style={{ padding: "6px 0" }}>
                            <Space>
                                {f.included ? <CheckOutlined style={{ color: "#52c41a" }} /> : <CloseOutlined style={{ opacity: 0.35 }} />}
                                <span>{f.text}</span>
                                {f.badge && <Tag icon={<ThunderboltOutlined />} color="geekblue">{f.badge}</Tag>}
                                {f.note && <Typography.Text type="secondary">{f.note}</Typography.Text>}
                            </Space>
                        </List.Item>
                    )}
                />

                <Button type={popular ? "primary" : "default"} block onClick={onSelect} disabled={loading} style={{ marginTop: 12 }}>
                    {popular ? <><StarFilled style={{ marginRight: 6 }} />{cta}</> : cta}
                </Button>
            </Card>
        </Badge.Ribbon>
    );
}

function CompareTable({ plans }) {
    const rows = [
        { key: "queries", label: "WhatsApp queries / mo" },
        { key: "seats", label: "Included agent seats" },
        { key: "inventory", label: "Inventory module" },
        { key: "alerts", label: "Alerts & matching" },
        { key: "support", label: "Support" },
    ];

    return (
        <div>
            <Typography.Title level={4}>Compare plans</Typography.Title>
            <div className="overflow-auto">
                <table className="ant-table" style={{ width: "100%", background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0" }}>
                    <thead className="ant-table-thead">
                        <tr>
                            <th style={{ width: 260 }}>Feature</th>
                            {plans.map(p => <th key={p.id}>{p.name}</th>)}
                        </tr>
                    </thead>
                    <tbody className="ant-table-tbody">
                        {rows.map(r => (
                            <tr key={r.key}>
                                <td><strong>{r.label}</strong></td>
                                {plans.map(p => (
                                    <td key={p.id + r.key}>
                                        {renderCompareCell(p.compare?.[r.key])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function renderCompareCell(v) {
    if (v === true) return <CheckOutlined style={{ color: "#52c41a" }} />;
    if (v === false || v == null) return <CloseOutlined style={{ opacity: 0.4 }} />;
    return <span>{v}</span>;
}

function TrustTile({ icon, title, desc }) {
    return (
        <Card bordered style={{ background: "#fff", borderRadius: 12 }}>
            <Space align="start">
                <Avatar size={40} style={{ background: "#1677ff" }} icon={icon} />
                <Space direction="vertical" size={2}>
                    <Typography.Text strong>{title}</Typography.Text>
                    <Typography.Text type="secondary">{desc}</Typography.Text>
                </Space>
            </Space>
        </Card>
    );
}

// --------------------
// Fallback data (edit freely)
// --------------------
const defaultPlans = [
    {
        id: "Basic",
        tier: "basic",
        name: "Basic",
        subtitle: "Kickstart your dealer workflow",
        priceLabel: "£39/mo",
        prices: { year: { label: "£390/yr" } },
        popular: false,
        features: [
            { included: true, text: "CRM & Contacts" },
            { included: true, text: "WhatsApp search", note: "100 queries/mo" },
            { included: true, text: "1 agent seat included" },
            { included: false, text: "Inventory module" },
            { included: false, text: "AI insights & pricing" },
            { included: false, text: "Priority support" }
        ],
        compare: { queries: "100", seats: "1", inventory: false, alerts: "Basic", support: "Community" }
    },
    {
        id: "Pro",
        tier: "pro",
        name: "Pro",
        subtitle: "For active dealers who need volume",
        priceLabel: "£95/mo",
        prices: { year: { label: "£950/yr" } },
        popular: true,
        features: [
            { included: true, text: "CRM & Contacts" },
            { included: true, text: "WhatsApp search", note: "500 queries/mo" },
            { included: true, text: "1 agent seat included" },
            { included: true, text: "Inventory module", badge: "7‑day trial" },
            { included: true, text: "Alerts & matching" },
            { included: false, text: "Priority support" }
        ],
        compare: { queries: "500", seats: "1", inventory: "Trial", alerts: "Yes", support: "Standard" }
    },
    {
        id: "Premium",
        tier: "premium",
        name: "Premium",
        subtitle: "Scale with team and advanced tools",
        priceLabel: "£145/mo",
        prices: { year: { label: "£1450/yr" } },
        popular: false,
        features: [
            { included: true, text: "CRM & Contacts" },
            { included: true, text: "WhatsApp search", note: "500 queries/mo" },
            { included: true, text: "3 agent seats included" },
            { included: true, text: "Inventory module" },
            { included: true, text: "AI insights & pricing" },
            { included: true, text: "Priority support" }
        ],
        compare: { queries: "500+", seats: "3", inventory: true, alerts: "Advanced", support: "Priority" }
    }
];

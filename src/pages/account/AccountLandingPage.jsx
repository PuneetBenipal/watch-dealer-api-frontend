import React, { useEffect, useMemo, useState } from "react";
import {
    Row,
    Col,
    Card,
    Progress,
    Button,
    Tag,
    Tooltip,
    Modal,
    Segmented,
    Divider,
    Typography,
    Space,
    Alert
} from "antd";
import { InfoCircleOutlined, PlusOutlined, UsergroupAddOutlined, CrownOutlined, DatabaseOutlined, ThunderboltOutlined, CalendarOutlined, ShoppingCartOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import API from "../../api";
import StripeCheckoutButton from "../../components/common/StripeCheckoutButton";

const { Title, Text, Paragraph, Link } = Typography;

export default function AccountPlanPage() {
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState(null);
    const [seats, setSeats] = useState({ purchased: 1, used: 1 });
    const [entitlements, setEntitlements] = useState([]);
    const [usage, setUsage] = useState({});
    const plan = {};

    const refresh = async () => {
        setLoading(true);
        try {
            const res = await API.get("/api/account/plan");
            const data = res.data;
            console.log('UI console data', data)
            setCompany(data.company || null);
            setSeats(data.seats || { purchased: 1, used: 1 });
            setEntitlements(data.entitlements || []);
            setUsage(data.usage || {});
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refresh(); }, []);


    const eWhatsapp = useMemo(() => entitlements.find(e => e.feature === "whatsapp_search") || {}, [entitlements]);
    const eInventory = useMemo(() => entitlements.find(e => e.feature === "inventory") || {}, [entitlements]);

    const dealerQueryLimit = eWhatsapp?.limits?.queriesPerMonth ?? usage?.dealer?.queriesLimit ?? 0;
    const dealerQueryUsed = eWhatsapp?.usedThisPeriod ?? usage?.dealer?.queriesUsed ?? 0;
    const dealerQueryPct = dealerQueryLimit > 0 ? Math.round((dealerQueryUsed / dealerQueryLimit) * 100) : 0;
    const dealerQueryLeft = Math.max(0, dealerQueryLimit - dealerQueryUsed);

    const seatsAvailable = Math.max(0, (seats?.purchased || 0) - (seats?.used || 0));
    const seatsPct = (seats?.purchased || 0) > 0 ? Math.round(((seats?.used || 0) / (seats?.purchased || 1)) * 100) : 0;

    const inventoryActive = !!eInventory?.enabled;
    const inventoryTrial = !!eInventory?.isTrial;
    const inventoryEndsAt = eInventory?.endsAt || company?.currentPeriodEnd || company?.renewalDate;

    const {
        now,
        totalMs,
        elapsedMs,
        remainingMs,
        percent,
        daysLeft,
        isExpired,
    } = useMemo(() => {
        const now = new Date();
        const start = new Date(eInventory.createdAt);
        const end = new Date(eInventory.endsAt);

        const totalMs = Math.max(end - start, 0);
        const elapsedRaw = now - start;
        const elapsedMs = Math.min(Math.max(elapsedRaw, 0), totalMs);
        const remainingMs = Math.max(end - now, 0);

        const percent = totalMs === 0 ? 0 : Math.round((elapsedMs / totalMs) * 100);
        const daysLeft = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
        const isExpired = now >= end;

        return { now, totalMs, elapsedMs, remainingMs, percent, daysLeft, isExpired };
    }, [entitlements]);

    const formatDate = (d) =>
        new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

    const barColor = (() => {
        if (isExpired) return "#ff4d4f";                     // red
        if (daysLeft <= 1) return "#ff4d4f";                 // red
        if (daysLeft <= 3) return "#faad14";                 // orange
        return "#52c41a";                                    // green
    })();



    return (
        <>
            <div className="primary-background" style={{ backgroundImage: "url('/background.svg')" }}></div>
            <div className="">
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24, }}>
                    <Card
                        style={{
                            marginBottom: 24,
                            background: "#fafafa",
                            borderRadius: 8,
                            border: "1px solid #f0f0f0",
                        }}
                        bodyStyle={{ padding: "16px 24px" }}
                    >
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                                <Space align="center">
                                    <CrownOutlined style={{ fontSize: 20, color: "#faad14" }} />
                                    <Title level={4} style={{ margin: 0 }}>
                                        Current Plan: {company?.planId}
                                    </Title>
                                </Space>
                                {company?.planStatus && (
                                    <Tag color={company?.planStatus === "active" ? "green" : "red"}>
                                        {company?.planStatus.toUpperCase()}
                                    </Tag>
                                )}
                            </Space>
                            <Text type="secondary">
                                {company?.priceLabel ? `Billed at ${company?.priceLabel}` : "No active subscription"}
                            </Text>
                            {company?.renewalAt && (
                                <Text>
                                    Renewal Date:{" "}
                                    {new Date(company.renewalAt).toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </Text>
                            )}
                        </Space>
                    </Card>

                    <Row gutter={[16, 16]}>
                        {/* Queries */}
                        <Col xs={24} lg={12}>
                            <Card
                                title={
                                    <Space>
                                        <ThunderboltOutlined /> <span>WhatsApp Queries</span>
                                    </Space>
                                }
                                extra={
                                    <StripeCheckoutButton icon={<PlusOutlined />} text={'100 query / $20'} priceId={"whatsapp"} />
                                }
                                loading={loading}
                                style={{ borderRadius: 16 }}
                            >
                                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                                    <Text type="secondary">{dealerQueryLimit ? `${dealerQueryUsed} / ${dealerQueryLimit} used` : "No query pack active"}</Text>
                                    <Progress percent={dealerQueryPct} status={dealerQueryPct >= 100 ? "exception" : "active"} showInfo />
                                    <Space size={6} align="center">
                                        <InfoCircleOutlined />
                                        <Text type="secondary">Resets monthly • {dealerQueryLeft} remaining</Text>
                                    </Space>
                                    <Link href="/account/billing">View billing history</Link>
                                </Space>
                            </Card>
                        </Col>

                        {/* Seats */}
                        <Col xs={24} lg={12}>
                            <Card
                                title={
                                    <Space>
                                        <UsergroupAddOutlined /> <span>Additional Users (Seats)</span>
                                    </Space>
                                }
                                extra={
                                    <StripeCheckoutButton icon={<PlusOutlined />} text={'Buy seat / $25'} priceId="twenty_five" />
                                }
                            >
                                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                                    <Text type="secondary">{seats?.used ?? 0} of {seats?.purchased ?? 0} seats used • {seatsAvailable} available</Text>
                                    <Progress percent={seatsPct} showInfo />
                                    <Alert type="info" showIcon message="Seats are one-time $25 each and permanent. Agent queries are billed separately." />
                                </Space>
                            </Card>
                        </Col>

                        {/* Inventory */}
                        <Col xs={24}>
                            <Card title={<Space><DatabaseOutlined /> <span>Inventory System</span></Space>} loading={loading} style={{ borderRadius: 16 }} extra={
                                <Space>
                                    {
                                        inventoryActive ?
                                            <Tag color="green" icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}>Active</Tag> : inventoryTrial ? <Tag color="blue">Trial</Tag>
                                                : <Tag>Inactive</Tag>}
                                    <StripeCheckoutButton text={"+ 30 days / $50"} priceId="price_3" />
                                </Space>
                            }>
                                {/* <Paragraph type="secondary" style={{ marginBottom: 12 }}>Manage your own stock. Share privately or to trade pool.</Paragraph>
                            <Space size={12} wrap>
                                <Tag>Search & Filters</Tag>
                                <Tag>Images</Tag>
                                <Tag>Private / Shared / Public</Tag>
                                <Tag>CSV Upload</Tag>
                            </Space> */}

                                <Row gutter={[16, 8]} align="middle" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Col xs={24} md={21}>
                                        <Tooltip
                                            title={
                                                isExpired
                                                    ? `Ended on ${formatDate(eInventory.endsAt)}`
                                                    : `From ${formatDate(eInventory.paidAt)} to ${formatDate(eInventory.endsAt)}`
                                            }
                                        >
                                            <Progress
                                                percent={percent}
                                                status={isExpired ? "exception" : "active"}
                                                strokeColor={barColor}
                                                showInfo={false}
                                            />
                                        </Tooltip>
                                    </Col>
                                    <Col xs={24} md={2} className="flex justify-end " style={{ display: 'flex' }}>
                                        {isExpired ? (
                                            <Tag color="red" className="text-sm">Ended {formatDate(eInventory.endsAt)}</Tag>
                                        ) : (
                                            <>
                                                {/* <Tag color="blue" className="text-sm">Trial ends {formatDate(eInventory.endsAt)}</Tag> */}
                                                <Tag color={daysLeft <= 3 ? "orange" : "green"} className="text-sm">
                                                    {daysLeft} day{daysLeft === 1 ? "" : "s"} left
                                                </Tag>
                                            </>
                                        )}
                                    </Col>
                                </Row>


                                <div className="mt-2 text-xs text-gray-400">
                                    <span>Ends At: {formatDate(eInventory.endsAt)}</span>
                                    <span className="mx-2">•</span>
                                    <span>
                                        {isExpired
                                            ? "Period complete"
                                            : `Progress: ${percent}% (${Math.floor((elapsedMs / (1000 * 60 * 60 * 24)) * 10) / 10} / ${Math.floor((totalMs / (1000 * 60 * 60 * 24)) * 10) / 10} days)`}
                                    </span>
                                </div>

                                {/* {inventoryEndsAt && (
                                <div style={{ marginTop: 12 }}>
                                    <Space size={6}><CalendarOutlined /><Text type="secondary">Renews {new Date(inventoryEndsAt).toLocaleDateString()}</Text></Space>
                                </div>
                            )} */}
                            </Card>
                        </Col>

                        {/* Tips */}
                        <Col xs={24} lg={8}>
                            <Card style={{ borderRadius: 16 }} title="How seats & queries work">
                                <Space direction="vertical" size={6}>
                                    <Text><b>Seats</b> are one‑time purchases to add teammates.</Text>
                                    <Text><b>Queries</b> renew monthly and control search usage.</Text>
                                    <Text>Assign per‑agent queries in <Link href="/account/team">Team</Link>.</Text>
                                </Space>
                            </Card>
                        </Col>
                        <Col xs={24} lg={8}>
                            <Card style={{ borderRadius: 16 }} title="Need more power?">
                                <Space direction="vertical" size={6}>
                                    <Text><ThunderboltOutlined /> Add +300 / +500 query packs anytime.</Text>
                                    <Text><ShoppingCartOutlined /> Premium add‑ons available in Docs.</Text>
                                </Space>
                            </Card>
                        </Col>
                        <Col xs={24} lg={8}>
                            <Card style={{ borderRadius: 16 }} title="Billing & Receipts">
                                <Space direction="vertical" size={6}>
                                    <Text>See all charges in <Link href="/account/billing">Billing History</Link>.</Text>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
}

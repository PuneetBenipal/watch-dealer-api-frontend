import React, { useEffect, useMemo, useState } from "react";
import {
    Badge,
    Button,
    Card,
    Empty,
    Grid,
    Space,
    Spin,
    Table,
    Tooltip,
    Typography,
    Input,
    message,
} from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import API from "../../api";

const { useBreakpoint } = Grid;
const { Text } = Typography;

// ---- Helpers ----
const fmtDate = (d) => d
    ? new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit", }).format(new Date(d))
    : "-";

export default function BillingPage() {
    const screens = useBreakpoint();
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await API.get("/api/account/payment-history");
            setHistory(Array.isArray(res?.data?.history) ? res.data.history : []);
        } catch (e) {
            setError("Failed to load billing data. Please retry.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = useMemo(() => {
        if (!Array.isArray(history)) return [];
        let rows = [...history]
            .sort((a, b) => (new Date(a.paidAt) > new Date(b.paidAt) ? -1 : 1))
            .map((p, idx) => ({
                key: p.id ?? p.feature ?? idx,
                ...p,
            }));

        if (search.trim()) {
            const q = search.toLowerCase();
            rows = rows.filter((r) =>
                [r.feature, r.amount, r.currency, r.method, fmtDate(r.paidAt)]
                    .join(" ")
                    .toLowerCase()
                    .includes(q)
            );
        }
        return rows;
    }, [history, search]);

    // ---- Columns (responsive) ----
    const columns = [
        {
            title: "Feature",
            dataIndex: "feature",
            key: "feature",
            ellipsis: true,
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (val, row) => `$${val}`,
        },
        // Combine currency + method in a compact column on small screens
        {
            title: "Details",
            key: "details",
            responsive: ["xs", "sm"],
            render: (_, r) => (
                <Space size={4} wrap>
                    <Badge color="#d9d9d9" text={(r.currency || "").toString().toUpperCase()} />
                    <Badge color="#d9d9d9" text={(r.method || "").toString().toUpperCase()} />
                </Space>
            ),
        },
        {
            title: "Currency",
            dataIndex: "currency",
            key: "currency",
            responsive: ["md", "lg", "xl", "xxl"],
            render: (val) => (val ? String(val).toUpperCase() : "-"),
        },
        {
            title: "Method",
            dataIndex: "method",
            key: "method",
            responsive: ["md", "lg", "xl", "xxl"],
            render: (val) => (val ? String(val).toUpperCase() : "-"),
        },
        {
            title: "Paid At",
            dataIndex: "paidAt",
            key: "paidAt",
            render: (val) => fmtDate(val),
        },
    ];

    const pagination = {
        current: page,
        pageSize,
        total: filtered.length,
        showSizeChanger: true,
        simple: screens.xs,
        onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
        },
    };

    return (
        <>
            <div
                className="primary-background"
                style={{ backgroundImage: "url('/background.svg')" }}
            />
            <Card
                title="Billing History"
                extra={<Text type="secondary">Receipts & invoices for this company</Text>}
                style={{ maxWidth: 1200, margin: "0 auto", marginTop: 24 }}
                bodyStyle={{ padding: screens.xs ? 12 : 24 }}
                headStyle={{ padding: screens.xs ? "0 12px" : "0 24px" }}
            >
                {loading ? (
                    <div style={{ padding: 24, textAlign: "center" }}>
                        <Spin />
                    </div>
                ) : error ? (
                    <Empty description={error} />
                ) : (
                    <div className="flex flex-col gap-3">
                        <div
                            className="flex items-center justify-between gap-3 flex-wrap"
                            style={{ rowGap: 8 }}
                        >
                            <Input.Search
                                placeholder="Search history… (feature, amount, currency, method)"
                                onSearch={setSearch}
                                onChange={(e) => setSearch(e.target.value)}
                                allowClear
                                style={{ width: screens.xs ? "100%" : 360 }}
                            />

                            {/* Optional export action placeholder */}
                            <Tooltip title="Export PDF">
                                <Button icon={<FilePdfOutlined />} disabled>
                                    Export
                                </Button>
                            </Tooltip>
                        </div>

                        <Table
                            rowKey="key"
                            dataSource={filtered}
                            columns={columns}
                            size={screens.xs ? "small" : "middle"}
                            pagination={pagination}
                            scroll={{ x: screens.xs ? 720 : undefined }}
                            locale={{ emptyText: <Empty description="No invoices yet" /> }}
                        />
                    </div>
                )}
            </Card>
        </>
    );
}

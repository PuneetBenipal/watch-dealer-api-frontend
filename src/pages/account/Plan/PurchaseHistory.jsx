import React, { useMemo, useState } from "react";
import SectionTitle from "./SectionTitle";

import { Menu, Card, Tag, Empty, Space, Table, Input, } from "antd";
import { HistoryOutlined } from "@ant-design/icons";

const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const currency = (v, ccy = "GBP") =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: ccy }).format(v);

export default function PurchaseHistory({ data }) {
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const onPageChange = (p, ps) => {
        setPage(p);
        setPageSize(ps);
    };


    const dataSource = useMemo(() => {
        let rows = data.sort((a, b) => {
            if (a.paidAt > b.paidAt) return -1;
            else if (a.paidAt < b.paidAt) return 1;
            return 0;
        }).map((p) => {
            let formatedDate = formatDate(p.paidAt)
            p.paidAt = formatedDate;
            return ({ key: p.feature, ...p })
        })

        if (filter !== "all") rows = rows.filter((r) => r.feature === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            rows = rows.filter((r) =>
                [r.item, r.status, r.amount, r.date].join(" ").toLowerCase().includes(q)
            );
        }
        return rows;
    }, [data, filter, search]);

    const columns = [
        { title: "Date", dataIndex: "paidAt" },
        { title: "Item", dataIndex: "key" },
        {
            title: "Amount",
            dataIndex: "amountPaid",
            render: (v, r) => currency(v, r.currency),
        }
    ];


    return (
        <Card id="history" className="shadow-sm">
            <SectionTitle icon={<HistoryOutlined />} title="Purchase History" />

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Menu mode="horizontal" selectedKeys={[filter]} onClick={({ key }) => setFilter(key)}>
                        <Menu.Item key="all">All</Menu.Item>
                        <Menu.Item key="whatsapp_search">Queries</Menu.Item>
                        <Menu.Item key="team_mate">Users</Menu.Item>
                        <Menu.Item key="inventory">Inventory</Menu.Item>
                    </Menu>
                    <Input.Search
                        placeholder="Search history… (item, status, amount)"
                        onSearch={setSearch}
                        allowClear
                        style={{ maxWidth: 360 }}
                    />
                </div>

                <Table
                    rowKey="_id"
                    dataSource={dataSource}                 // full list ONCE
                    columns={columns}
                    pagination={{
                        current: page,
                        pageSize,
                        total: dataSource.length,
                        showSizeChanger: true,
                        onChange: (p, ps) => { setPage(p); setPageSize(ps); }, // <-- DO NOT touch data here
                    }}
                    locale={{
                        emptyText: <Empty description="No invoices yet" />,
                    }}
                />
            </div>
        </Card>
    );
}
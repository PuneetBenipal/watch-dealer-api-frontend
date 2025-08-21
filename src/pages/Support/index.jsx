import React, { useEffect, useState } from "react";
import {
    Table, Space, Input, Select, Button, Badge, Typography, Drawer,
    Form, Input as AntInput, message
} from "antd";
import { PlusOutlined, SearchOutlined, SendOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchMyTickets, fetchMyTicket, createTicket, sendDealerReply,
    setFilters, setQuery, showNew, showView
} from "../../store/slices/dealerSupportSlice";

const { Text } = Typography;
const { Option } = Select;
const STATUS_BADGE = { open: "processing", pending: "warning", on_hold: "default", solved: "success", closed: "default" };

export default function DealerSupportPage() {
    const dispatch = useDispatch();
    const { items, total, loading, q, status, page, limit, ticket, ticketLoading, newVisible, viewVisible, creating, replying } =
        useSelector(s => s.dealerSupportReducer);

    const [localQ, setLocalQ] = useState(q);
    const [replyBody, setReplyBody] = useState("");

    useEffect(() => {
        dispatch(fetchMyTickets({ q, status, page, limit }));
    }, [q, status, page, limit, dispatch]);

    useEffect(() => {
        const t = setTimeout(() => dispatch(setQuery(localQ)), 350);
        return () => clearTimeout(t);
    }, [localQ, dispatch]);

    const columns = [
        { title: "ID", dataIndex: "_id", width: 140, render: (v) => <Text code ellipsis={{ tooltip: v }}>{v}</Text> },
        { title: "Subject", dataIndex: "subject", ellipsis: true },
        { title: "Status", dataIndex: "status", width: 120, render: (s) => <Badge status={STATUS_BADGE[s]} text={s} /> },
        { title: "Updated", dataIndex: "updatedAt", width: 170, render: (t) => new Date(t).toLocaleString() },
        {
            title: "", width: 90, fixed: "right", render: (_, r) =>
                <Button size="small" onClick={async () => { await dispatch(fetchMyTicket(r._id)); dispatch(showView(true)); setReplyBody(""); }}>
                    Open
                </Button>
        },
    ];

    // New ticket form handlers
    const [form] = Form.useForm();
    const submitNew = async () => {
        const { subject, category, priority, body } = await form.validateFields();
        const res = await dispatch(createTicket({ subject, category, priority, body })).unwrap().catch(() => null);
        if (!res) return;
        message.success("Ticket created");
        form.resetFields();
        dispatch(fetchMyTickets({ q, status, page: 1, limit }));
        // Optionally open the created ticket
        if (res.id) { await dispatch(fetchMyTicket(res.id)); dispatch(showView(true)); }
    };

    const sendReply = async () => {
        if (!replyBody.trim()) return;
        await dispatch(sendDealerReply({ id: ticket._id, body: replyBody })).unwrap().catch(() => null);
        setReplyBody("");
        await dispatch(fetchMyTicket(ticket._id));
        dispatch(fetchMyTickets({ q, status, page, limit }));
    };

    return (
        <div style={{ padding: 16 }}>
            <Space style={{ marginBottom: 12 }} wrap>
                <Input allowClear prefix={<SearchOutlined />} placeholder="Search my tickets…"
                    value={localQ} onChange={(e) => setLocalQ(e.target.value)} style={{ width: 280 }} />
                <Select allowClear placeholder="Status" value={status} onChange={(v) => dispatch(setFilters({ status: v }))} style={{ width: 160 }}>
                    {["open", "pending", "on_hold", "solved", "closed"].map(v => <Option key={v} value={v}>{v}</Option>)}
                </Select>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => dispatch(showNew(true))}>New Ticket</Button>
            </Space>

            <Table
                rowKey="_id"
                loading={loading}
                dataSource={items}
                columns={columns}
                pagination={{
                    current: page, pageSize: limit, total,
                    showSizeChanger: true,
                    onChange: (p, s) => dispatch(setFilters({ page: p, limit: s }))
                }}
                scroll={{ x: 800 }}
            />

            {/* New Ticket Drawer */}
            <Drawer
                title="Create Support Ticket"
                visible={newVisible}
                onClose={() => dispatch(showNew(false))}
                width="clamp(360px, 90vw, 720px)"
                destroyOnClose
            >
                <Form layout="vertical" form={form} initialValues={{ priority: "medium" }}>
                    <Form.Item label="Subject" name="subject" rules={[{ required: true, message: "Subject is required" }]}>
                        <AntInput />
                    </Form.Item>
                    <Form.Item label="Category" name="category" rules={[{ required: true, message: "Select a category" }]}>
                        <Select placeholder="Select">
                            {["Billing", "API", "Security", "Integrations", "General"].map(v => <Option key={v} value={v}>{v}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Priority" name="priority">
                        <Select>
                            {["low", "medium", "high", "urgent"].map(v => <Option key={v} value={v}>{v}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Description" name="body" rules={[{ required: true, message: "Describe the issue" }]}>
                        <AntInput.TextArea rows={6} placeholder="Steps to reproduce, expected/actual, screenshots links…" />
                    </Form.Item>
                    <Space>
                        <Button onClick={() => dispatch(showNew(false))}>Cancel</Button>
                        <Button type="primary" loading={creating} onClick={submitNew}>Submit</Button>
                    </Space>
                </Form>
            </Drawer>

            {/* View Ticket Drawer */}
            <Drawer
                title={ticket ? ticket.subject : "Ticket"}
                visible={viewVisible}
                onClose={() => dispatch(showView(false))}
                width="clamp(360px, 90vw, 860px)"
                destroyOnClose
            >
                {ticketLoading ? "Loading..." : ticket && (
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <Space split="•" wrap>
                            <Badge status={STATUS_BADGE[ticket.status]} text={ticket.status} />
                            <Text type="secondary">Updated: {new Date(ticket.updatedAt).toLocaleString()}</Text>
                        </Space>

                        <div style={{ maxHeight: 360, overflow: "auto", border: "1px solid #f0f0f0", borderRadius: 8, padding: 12 }}>
                            {(ticket.messages || []).map(m => (
                                <div key={m._id} style={{ marginBottom: 12 }}>
                                    <Space split="•" wrap>
                                        <Text strong>{m.author?.name || "Support"}</Text>
                                        <Text type="secondary">{new Date(m.createdAt).toLocaleString()}</Text>
                                    </Space>
                                    <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{m.body}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ position: "sticky", bottom: 0, background: "#fff", border: "1px solid #f0f0f0", borderRadius: 8, padding: 12 }}>
                            <AntInput.TextArea rows={4} placeholder="Write a reply to support…" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} />
                            <Space style={{ marginTop: 8 }}>
                                <Button type="primary" icon={<SendOutlined />} loading={replying} onClick={sendReply}>Send</Button>
                            </Space>
                        </div>
                    </Space>
                )}
            </Drawer>
        </div>
    );
}

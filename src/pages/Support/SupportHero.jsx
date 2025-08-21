import React from "react";
import { Card, Typography, Space, Input, Button } from "antd";
import { QuestionCircleOutlined, SearchOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;

export default function SupportHero({ onSearch, onDocs, onTicket }) {
    return (
        <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900" bodyStyle={{ padding: 24 }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <Space direction="vertical" size={4}>
                    <Title level={2} style={{ color: "#000", margin: 0 }}>Help & Support</Title>
                    <Text style={{ color: "#000" }}>Search the docs or reach out — we’re here to help.</Text>
                    <Space wrap>
                        <Button icon={<QuestionCircleOutlined />} onClick={onDocs}>Browse Docs</Button>
                        <Button type="primary" onClick={onTicket}>Submit Ticket</Button>
                    </Space>
                </Space>
                <Input.Search allowClear size="large" placeholder="Search: e.g. connect WhatsApp parser" onSearch={onSearch} enterButton={<SearchOutlined />} style={{ maxWidth: 460 }} />
            </div>
        </Card>
    );
}
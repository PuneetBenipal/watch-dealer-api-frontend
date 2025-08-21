import React, { useEffect, useState } from "react";
import { Card, Typography, Row, Col, Button, List, Space, Skeleton, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { FileTextOutlined, CustomerServiceOutlined, DatabaseOutlined, DollarCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { fetchDocs } from "../../api/support";
import SupportHero from "./SupportHero";
import CategoryCard from "./CategoryCard";

const { Title, Paragraph, Text } = Typography;

const CATS = [
  {
    key: "whatsapp",
    title: "WhatsApp Engine",
    desc: "Connect parser, set alerts, daily digest.",
    icon: <DatabaseOutlined />,
  },
  {
    key: "inventory",
    title: "Inventory",
    desc: "Add watches, bulk upload, visibility & status.",
    icon: <FileTextOutlined />,
  },
  {
    key: "invoices",
    title: "Invoicing",
    desc: "Create invoices, PDF, payments & reconciliation.",
    icon: <DollarCircleOutlined />,
  },
  {
    key: "account",
    title: "Account & Billing",
    desc: "Company profile, plan, team, WhatsApp setup.",
    icon: <SettingOutlined />,
  },
];

export default function SupportHome() {
  const nav = useNavigate();
  const [topDocs, setTopDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDocs({}).then((r) => {
      if (r.ok) setTopDocs((r.data || []).slice(0, 6));
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero / Search */}
      <SupportHero onSearch={(q) => nav(`/support/docs?q=${encodeURIComponent(q)}`)} onDocs={() => nav("/support/docs")} onTicket={() => nav("/support/ticket")} />

      {/* Categories */}
      <div className="mt-6">
        <Row gutter={[16, 16]}>
          {CATS.map((c) => (
            <Col xs={24} md={12} lg={6} key={c.key}>
              <CategoryCard title={c.title} description={c.desc} icon={c.icon} onClick={() => (window.location.href = `/support/docs?category=${c.key}`)} />
            </Col>
          ))}
        </Row>
      </div>

      {/* Top Articles & Ticket CTA */}
      <Row gutter={[16,16]} className="mt-8">
        <Col xs={24} lg={16}>
          <Card className="rounded-2xl" title={<Space><FileTextOutlined /><span>Popular Articles</span></Space>}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : topDocs.length ? (
              <List
                itemLayout="horizontal"
                dataSource={topDocs}
                renderItem={(item) => (
                  <List.Item onClick={() => (window.location.href = `/support/docs/${item.slug}`)} style={{ cursor: "pointer" }}>
                    <List.Item.Meta
                      title={<Space size="small"><Text strong>{item.title}</Text>{item.category && <Tag>{item.category}</Tag>}</Space>}
                      description={<Text type="secondary">{item.summary || (item.content || "").slice(0, 140)}...</Text>}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Paragraph type="secondary">No articles yet.</Paragraph>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600" bodyStyle={{ color: "#000" }}>
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <Title level={3} style={{ color: "#000", margin: 0 }}><CustomerServiceOutlined /> Need more help?</Title>
              <Paragraph style={{ color: "#000" }}>Open a ticket and our team will respond quickly. Attach screenshots for faster resolution.</Paragraph>
              <Button size="large" type="primary" onClick={() => nav("/support/ticket")}>
                Submit Ticket
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

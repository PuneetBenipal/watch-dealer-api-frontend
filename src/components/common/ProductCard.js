import React from "react";
import { Card, Tag, Button, Tooltip, Typography, Space, Popconfirm } from "antd";
import { EyeOutlined, FileAddOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ProductCard = ({ product, data, AddInventory }) => {
  const { openViewModal } = data;

  const brand = product.status;
  const model = product.product_name;
  const refNo = "";
  const dateObj = new Date(product.createdAt);
  const year = dateObj.getFullYear();
  const condition = "";
  const priceListed = product.product_price;
  const currency = "currency";
  const country = product.sender_number;
  const status = product.dealer;
  const images = product.images || [];

  const statusColor = {
    Available: "green",
    "On Hold": "orange",
    Sold: "red",
  }[status] || "blue";

  return (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
      }}
      cover={
        <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
          <img
            src={images?.[0]?.url || "./icon.png"}
            alt={images?.[0]?.alt || `${brand} ${model}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          <Tag
            color={statusColor}
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              borderRadius: "12px",
              fontWeight: 500,
              padding: "2px 10px",
            }}
          >
            {status}
          </Tag>
          {country && (
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "rgba(255,255,255,0.9)",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "500",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              {country}
            </div>
          )}
        </div>
      }
      actions={[
        <Tooltip title="View Details" key="view">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => openViewModal(product)}
          />
        </Tooltip>,
        <Popconfirm
          title="Do you want to add this to inventory?"
          onConfirm={() => AddInventory()}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="text"
            icon={<FileAddOutlined />}
          />
        </Popconfirm>,
      ]}
    >
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <Title level={5} ellipsis style={{ marginBottom: 0 }}>
          {brand}
        </Title>
        <Text type="secondary" ellipsis>
          {model}
        </Text>

        {(refNo || year || condition) && (
          <Space wrap size={4}>
            {refNo && <Tag color="blue">Ref: {refNo}</Tag>}
            {year && <Tag color="geekblue">{year}</Tag>}
            {condition && <Tag color="purple">{condition}</Tag>}
          </Space>
        )}

        <Title
          level={4}
          style={{
            marginTop: 8,
            color: "#1f1f1f",
            fontWeight: "bold",
          }}
        >
          {currency} {priceListed?.toLocaleString()}
        </Title>
      </Space>
    </Card>
  );
};

export default ProductCard;

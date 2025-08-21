import React from "react";
import { Card, Typography, Space } from "antd";
const { Text } = Typography;

export default function CategoryCard({ title, description, icon, onClick }) {
    return (
        <Card hoverable onClick={onClick} className="rounded-2xl h-full" bodyStyle={{ padding: 16 }}>
            <Space direction="vertical" size={4}>
                <div className="text-2xl">{icon}</div>
                <Text strong>{title}</Text>
                <Text type="secondary">{description}</Text>
            </Space>
        </Card>
    );
}

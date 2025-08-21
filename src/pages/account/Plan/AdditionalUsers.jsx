import React from "react";
import SectionTitle from "./SectionTitle";
import { Card, Progress, Button, Tag, Space, Typography } from "antd";

import { UserAddOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
export default function AdditionalUsers({ data, company }) {
    const { seats } = company;

    const pct = Math.round((seats.used / seats.purchased) * 100);
    const remaining = Math.max(0, seats.purchased - seats.used);
    return (
        <Card id="users" className="shadow-sm">
            <SectionTitle icon={<UserAddOutlined />} title="Additional Users" />

            <div className="flex flex-col gap-3">
                <Text type="secondary">Invite teammates to your workspace</Text>
                <div className="flex items-center justify-between mb-2">
                    <Text strong>Seats</Text>
                    <Text type="secondary">
                        {seats.used} / {seats.purchased} seats
                    </Text>
                </div>
                <Progress percent={pct} showInfo={false} />
                <div className="text-sm text-gray-600">{pct}% used · {remaining} seats remaining</div>

                <div className="mt-3">
                    <Space>
                        <Button onClick={() => console.log("UI console +1 seat")}>+1 seat</Button>
                        <Button onClick={() => console.log("UI console +3 seat")}>+3 seats</Button>
                        <Button onClick={() => console.log("UI console +5 seat")}>+5 seats</Button>
                        <Tag>$25 / user / month</Tag>
                    </Space>
                </div>
            </div>
        </Card>
    );
}
import React from "react";
import { Typography } from "antd";
const { Title } = Typography;

export default function SectionTitle({ icon, title }) {
    return (
        <div className="flex items-center gap-2 mb-1">
            <div className="text-xl">{icon}</div>
            <Title level={4} className="!mb-0">{title}</Title>
        </div>
    );
}




import React, { useMemo, useState, useEffect } from "react";
import { Card, Progress, Tag, Tooltip, Row, Col, Button } from "antd";
import StripeCheckoutButton from "../../../components/common/StripeCheckoutButton";

export default function InventoryModule({ data, company }) {
    const title = "Inventory System"
    const description = "Manage your own stock. Share privately or to trade pool."
    const priceLabel = "£50 / month"

    const [inTrial, setInTrial] = useState(false);
    // if (data.createdAt === data.endsAt) setIsStarted(false)

    
    useEffect(() => {
        const sevenDays = 7 * 24 * 3600 * 1000;
        const createdAt = new Date(data.createdAt).getTime();
        if (createdAt + sevenDays > Date.now()) {
            setInTrial(true);
        }
        console.log("UI console Data",data)
    }, [data])

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
        const start = new Date(inTrial ? data.createdAt : data.paidAt);
        const end = new Date(data.endsAt);

        const totalMs = Math.max(end - start, 0);
        const elapsedRaw = now - start;
        const elapsedMs = Math.min(Math.max(elapsedRaw, 0), totalMs);
        const remainingMs = Math.max(end - now, 0);

        const percent = totalMs === 0 ? 0 : Math.round((elapsedMs / totalMs) * 100);
        const daysLeft = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
        const isExpired = now >= end;

        return { now, totalMs, elapsedMs, remainingMs, percent, daysLeft, isExpired };
    }, [data, inTrial]);

    const formatDate = (d) =>
        new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

    const barColor = (() => {
        if (isExpired) return "#ff4d4f";                     // red
        if (daysLeft <= 1) return "#ff4d4f";                 // red
        if (daysLeft <= 3) return "#faad14";                 // orange
        return "#52c41a";                                    // green
    })();

    return (
        <Card
            className="w-full"
            title={
                <div className="flex items-center gap-2">
                    <span className="text-base font-medium">{title}</span>
                    {isExpired ? (
                        <Tag color="red">Expired</Tag>
                    ) : (
                        <Tag color="green">Active</Tag>
                    )}
                </div>
            }
            extra={
                <StripeCheckoutButton priceId= "price_3" text={`Pay for next 30 dyas. $50`} />
            }
        >
            <p className="text-gray-500 mb-4">{description}</p>

            <Row gutter={[16, 8]} align="middle">
                <Col xs={24} md={18}>
                    <Tooltip
                        title={
                            isExpired
                                ? `Ended on ${formatDate(data.endsAt)}`
                                : `From ${formatDate(data.paidAt)} to ${formatDate(data.endsAt)}`
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
                <Col xs={24} md={6} className="flex justify-end gap-2">
                    {isExpired ? (
                        <Tag color="red" className="text-sm">Ended {formatDate(data.endsAt)}</Tag>
                    ) : (
                        <>
                            <Tag color="blue" className="text-sm">Trial ends {formatDate(data.endsAt)}</Tag>
                            <Tag color={daysLeft <= 3 ? "orange" : "green"} className="text-sm">
                                {daysLeft} day{daysLeft === 1 ? "" : "s"} left
                            </Tag>
                        </>
                    )}
                </Col>
            </Row>

            <div className="mt-2 text-xs text-gray-400">
                <span>Started: {inTrial ? formatDate(data.createdAt) : formatDate(data.paidAt)}</span>
                <span className="mx-2">•</span>
                <span>
                    {isExpired
                        ? "Period complete"
                        : `Progress: ${percent}% (${Math.floor(
                            (elapsedMs / (1000 * 60 * 60 * 24)) * 10
                        ) / 10} / ${Math.floor((totalMs / (1000 * 60 * 60 * 24)) * 10) / 10} days)`}
                </span>
            </div>
        </Card>
    );
}

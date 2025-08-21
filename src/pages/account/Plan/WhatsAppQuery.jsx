import React, { useEffect, useMemo, useRef, useState } from "react";
import SectionTitle from "./SectionTitle";
import { Card, Progress, Button, Tag, Divider, Space, Typography } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import StripeCheckoutButton from "../../../components/common/StripeCheckoutButton";

const { Text } = Typography;

const currency = (v, ccy = "GBP") =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: ccy }).format(v);


export default function WhatsAppQueries({ data, company }) {


    const [isPurchasedThisMonth, setIsPurchasedThisMonth] = useState(false);

    useEffect(() => {
        let lastPaid = company.purchaseHistory.findLast((history) => history.amountPaid == 95);
        let lastPaidAt = new Date(lastPaid.paidAt).getTime()
        const thirtyDays = 24 * 30 * 3600 * 1000;

        if (lastPaidAt + thirtyDays >= Date.now()) {
            setIsPurchasedThisMonth(true);
        }
    }, [company])



    // const ent = featureFrom(snapshot, "whatsapp_search");
    const pct = Math.min(100, Math.round((data.usage / data.limits) * 100));
    const remaining = Math.max(0, data.limits - data.usage);

    if (!company) return;

    return (
        <Card
            id="whatsapp"
            className="shadow-sm"
            title={
                <SectionTitle icon={<ShoppingCartOutlined />} title="WhatsApp Queries" />
            }
            extra={
                isPurchasedThisMonth ? (
                    <StripeCheckoutButton
                        priceId="price_2"
                        icon={<ShoppingCartOutlined />}
                        text={`+100 queries · ${currency(20)}`}
                    />
                ) : (
                    <StripeCheckoutButton
                        priceId="whatsapp"
                        icon={<ShoppingCartOutlined />}
                        text={`500 queries /  ${currency(95)}`}
                    />
                )
            }
        >
            <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                    <Text strong>Queries</Text>
                    <Text type="secondary">
                        {
                            !data.limits ? (
                                <>Buy WhatsApp Query</>
                            ) : (
                                <>{data.usage} / {data.limits} queries </>
                            )
                        }
                    </Text>
                </div>
                <Progress percent={pct} showInfo={false} />
                <div className="flex mt-2 justify-between">
                    {
                        !data.limits ? (
                            <></>
                        ) : (
                            <div className="text-sm text-gray-600">{pct} % used · {remaining} queries remaining</div>
                        )

                    }
                    {
                        data.limits && (
                            <div style={{ background: '#c2f8e0ff', padding: '4px 8px', borderRadius: '4px' }}>
                                Last Pay {new Date(data.updatedAt).toLocaleDateString()}
                            </div>
                        )
                    }
                </div>
                {/* <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                    <ExclamationCircleTwoTone twoToneColor="#999" /> Usage resets monthly
                </div> */}
            </div>
        </Card>
    );
}
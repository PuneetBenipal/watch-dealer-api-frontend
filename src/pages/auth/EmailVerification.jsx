import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Typography, Form, Input, Button, Space, Alert, Result, message, Spin } from "antd";
import { CustomToast } from "../../components/Alerts/CustomToast";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph, Link } = Typography;

function useCountdown(initialSeconds) {
    const [seconds, setSeconds] = useState(initialSeconds);
    const timerRef = useRef(null);

    useEffect(() => {
        if (seconds <= 0) return;
        timerRef.current = setInterval(() => setSeconds((s) => s - 1), 1000);
        return () => clearInterval(timerRef.current);
    }, [seconds]);

    const start = (s) => setSeconds(s);
    const reset = () => setSeconds(0);

    return { seconds, start, reset };
}

export default function EmailVerificationPage({ setVerifyCode, verifyCode, sendVerifyEmail, dealer }) {
    const navigate = useNavigate();
    const { registerDealer } = useAuth()
    const [form] = Form.useForm();
    const [code, setCode] = useState("");
    const { seconds, start: startCooldown, reset: resetCooldown } = useCountdown(0);

    const handleVerifyCode = async () => {
        try {
            if (code !== verifyCode) throw new Error("Email verify code is invalid");

            let nextPage = await registerDealer(dealer)
            navigate(nextPage);
        } catch (error) {
            console.log('UI console handleVerifyCode', error.message)
            CustomToast("error", error.message);
        }
    };

    const handleResend = async () => {
        try {
            sendVerifyEmail()
        } catch (error) {
            console.log('UI console handleResend', error)
            CustomToast("error", error.message);
        }
    };

    return (
        <div className="email-verify-box min-h-screen flex items-center justify-center p-4 bg-[#f5f5f5]">
            <Card className="w-full max-w-md" bordered>
                <>
                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                        <Title level={3} style={{ marginBottom: 0 }}>Verify your email</Title>
                        <Text type="secondary">We sent a 6‑digit code to your email. Enter it below to verify.</Text>
                    </Space>

                    <Form
                        form={form}
                        layout="vertical"
                        style={{ marginTop: 16 }}
                        onFinish={handleVerifyCode}
                    >
                        <Form.Item
                            label="6‑digit code"
                            name="code"
                            rules={[{ required: true, message: "Enter the 6‑digit code" }, { len: 6, message: "Code must be 6 digits" }]}
                        >
                            <Input size="large" maxLength={6} placeholder="••••••" onChange={(e) => setCode(e.target.value)} inputMode="numeric" />
                        </Form.Item>

                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                            <Button type="default" onClick={handleResend} disabled={seconds > 0}>
                                {seconds > 0 ? `Resend code in ${seconds}s` : "Resend code"}
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Verify
                            </Button>
                        </Space>

                        <div style={{ marginTop: 16 }}>
                            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                Didn’t receive the email? Check your spam folder or <Link onClick={handleResend}>send it again</Link>.
                            </Paragraph>
                        </div>
                    </Form>
                </>
            </Card>
        </div>
    );
}

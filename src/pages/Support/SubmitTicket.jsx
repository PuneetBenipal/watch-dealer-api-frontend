import React, { useState } from "react";
import { Form, Input, Select, Button, Typography } from "antd";
import { createTicket } from "../../api/support";
import { Toast } from "../../components/Alerts/CustomToast";

const { Title } = Typography;

export default function SubmitTicket() {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        const res = await createTicket(values);
        setLoading(false);
        if (res.ok) {
            Toast.success("Ticket submitted. We'll get back to you shortly.");
            window.location.href = "/support";
        } else {
            Toast.error(res.error || "Failed to submit ticket");
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Title level={2}>Submit Support Ticket</Title>
            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item name="subject" label="Subject" rules={[{ required: true, message: "Please enter a subject" }]}>
                    <Input placeholder="Short summary of your issue" />
                </Form.Item>

                <Form.Item name="category" label="Category">
                    <Select
                        options={[
                            { value: "bug", label: "Bug" },
                            { value: "billing", label: "Billing" },
                            { value: "feature", label: "Feature Request" },
                            { value: "account", label: "Account" },
                            { value: "other", label: "Other" },
                        ]}
                    />
                </Form.Item>

                <Form.Item name="priority" label="Priority">
                    <Select
                        options={[
                            { value: "low", label: "Low" },
                            { value: "normal", label: "Normal" },
                            { value: "high", label: "High" },
                            { value: "urgent", label: "Urgent" },
                        ]}
                        defaultValue="normal"
                    />
                </Form.Item>

                <Form.Item name="body" label="Describe the issue" rules={[{ required: true, message: "Please describe the issue" }]}>
                    <Input.TextArea rows={6} placeholder="Steps to reproduce, screenshots, expected behavior, etc." />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>Submit Ticket</Button>
                </Form.Item>
            </Form>
        </div>
    );
}
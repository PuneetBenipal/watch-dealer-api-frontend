import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, Typography, Radio } from "antd";
import { useParams } from "react-router-dom";
import { createDoc, updateDoc, fetchDoc } from "../../api/support";
import { Toast } from "../../components/Alerts/CustomToast";

const { Title } = Typography;

export default function DocAdminEditor() {
    const { slug } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [scope, setScope] = useState("company"); // "platform" | "company"

    useEffect(() => {
        if (!slug) return;
        fetchDoc(slug).then((r) => {
            if (r?.data) {
                form.setFieldsValue(r.data);
                setScope(r.data.companyId ? "company" : "platform");
            }
        });
    }, [slug]);

    const onFinish = async (values) => {
        setLoading(true);
        const payload = { ...values, scope };
        const res = slug ? await updateDoc(slug, payload) : await createDoc(payload);
        setLoading(false);
        if (res.ok) Toast.success("Saved");
        else Toast.error(res.error || "Failed");
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <Title level={3}>{slug ? "Edit Doc" : "New Doc"}</Title>

            <Radio.Group
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                style={{ marginBottom: 12 }}
            >
                <Radio.Button value="platform">Platform</Radio.Button>
                <Radio.Button value="company">Your Company</Radio.Button>
            </Radio.Group>

            <Form layout="vertical" form={form} onFinish={onFinish} initialValues={{ isPublished: true }}>
                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item name="category" label="Category">
                    <Select
                        options={[
                            { value: "whatsapp", label: "WhatsApp Engine" },
                            { value: "inventory", label: "Inventory" },
                            { value: "invoices", label: "Invoicing" },
                            { value: "account", label: "Account & Billing" },
                            { value: "other", label: "Other" },
                        ]}
                    />
                </Form.Item>

                <Form.Item name="tags" label="Tags">
                    <Select mode="tags" placeholder="Add tags" />
                </Form.Item>

                <Form.Item name="summary" label="Summary">
                    <Input.TextArea rows={2} />
                </Form.Item>

                <Form.Item name="content" label="Content (Markdown)" rules={[{ required: true }]}>
                    <Input.TextArea rows={12} placeholder="# Heading\nStep-by-step..." />
                </Form.Item>

                <Form.Item name="isPublished" valuePropName="checked" label="Published">
                    <Input type="checkbox" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Save
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

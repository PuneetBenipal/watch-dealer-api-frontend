import React, { useMemo } from "react";
import { Card, Form, Input, Button, Typography } from "antd";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import API from "../../api";
import { CustomToast, Toast } from "../../components/Alerts/CustomToast";

const { Title, Paragraph } = Typography;

const ResetPassword = () => {
    const [form] = Form.useForm();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    const linkValid = useMemo(() => Boolean(uid && token), [uid, token]);

    const onFinish = async (values) => {
        if (!linkValid) {
            Toast.error("Reset link is invalid. Please request a new one.");
            return;
        }
        try {
            const { password } = values;
            await API.post("/api/auth/reset-password", { uid, token, password });
            CustomToast("success", "Password reset successfully! Please log in.");
            navigate("/login");
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                err?.Toast ||
                "Failed to reset password. Try again.";
            Toast.error(msg);
        }
    };

    return (
        <div className="fixed w-full flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-100px-important" style={{backgroundImage: "url('/background.svg')"}}>
            <Card
                style={{
                    maxWidth: 420,
                    width: "100%",
                    borderRadius: "12px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                }}
                bordered={false}
            >
                <div className="text-center mb-6">
                    {/* <img
            src="/logo.svg"
            alt="Logo"
            className="w-16 h-16 mx-auto mb-4"
          /> */}
                    <Title
                        level={3}
                        className="login-title"
                    >
                        Reset your password
                    </Title>
                    <Paragraph type="secondary" style={{ marginBottom: 24 }}>
                        {linkValid
                            ? "Enter a new password for your account."
                            : "This reset link is invalid or incomplete."}
                    </Paragraph>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    disabled={!linkValid}
                >
                    <Form.Item
                        name="password"
                        label="New password"
                        rules={[
                            { required: true, Toast: "Please enter a new password" },
                            { min: 6, Toast: "Must be at least 6 characters" },
                        ]}
                        hasFeedback
                        className="ui-form-item"
                    >
                        <Input.Password
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            size="large"
                            style={{ borderRadius: "8px" }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        label="Confirm password"
                        dependencies={["password"]}
                        hasFeedback
                        rules={[
                            { required: true, Toast: "Please confirm your password" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Passwords do not match"));
                                },
                            }),
                        ]}
                        className="ui-form-item"
                    >
                        <Input.Password
                            placeholder="Re-enter new password"
                            autoComplete="new-password"
                            size="large"
                            style={{ borderRadius: "8px" }}
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                        className="ui-reset-button"
                    >
                        Reset Password
                    </Button>


                    <Link to="/login" style={{ color: '#c9a063', fontSize: '12px', display: "flex", justifyContent: 'center' }}>
                        Back to Login
                    </Link><br />
                </Form>
            </Card>
        </div>
    );
};

export default ResetPassword;

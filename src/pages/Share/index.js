import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Row, Col, Typography, Image, Tag, Button, Descriptions, Spin, message, Space, Form, Input, Divider } from "antd";
import {
    ClockCircleOutlined,
    DollarOutlined,
    TrophyOutlined,
    CalendarOutlined,
    ArrowLeftOutlined,
    ShareAltOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
    MessageOutlined,
    WhatsAppOutlined
} from "@ant-design/icons";
import "./index.css"
import { BACKEND_URL } from "../../config";

const { Title, Text, Paragraph } = Typography;

const Share = () => {
    const { token } = useParams(); // This will now be the item ID
    const navigate = useNavigate();
    const [watch, setWatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contactForm] = Form.useForm();
    const [contacting, setContacting] = useState(false);

    // Debug effect to log watch state changes
    useEffect(() => {
        console.log("UI console Watch state changed:", watch);
        if (watch) {
            console.log("UI console Watch details:", {
                brand: watch.brand,
                model: watch.model,
                status: watch.status,
                images: watch.images,
                priceListed: watch.priceListed,
                currency: watch.currency
            });
        }
    }, [watch]);

    useEffect(() => {
        if (token) {
            fetchSharedWatch();
        } else {
            setError("No item ID provided");
            setLoading(false);
        }
    }, [token]);

    const fetchSharedWatch = async () => {
        try {
            setLoading(true);
            console.log("UI console Fetching inventory by ID:", token);

            // Fetch inventory by ID using the public endpoint
            const response = await axios.post(`${BACKEND_URL}/api/share/${token}`);
            console.log("UI console Fetching inventory by ID:", token);
            console.log("UI console Response data:", response.data);

            if (response.data && response.data.success) {
                if (response.data.data) {
                    console.log("UI console Setting watch from response.data.data:", response.data.data);
                    setWatch(response.data.data);
                } else {
                    console.log("UI console Setting watch from response.data:", response.data);
                    setWatch(response.data);
                }
            } else {
                console.log("UI console Error in response:", response.data?.error);
                setError(response.data?.error || "Watch not found or no longer available");
            }
        } catch (error) {
            console.error("Error fetching shared watch:", error);
            console.error("Error details:", error.response?.data);
            setError("Failed to load shared watch. The link may be invalid or expired.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "available":
                return "green";
            case "sold":
                return "red";
            case "reserved":
                return "orange";
            case "pending":
                return "blue";
            default:
                return "default";
        }
    };

    const getConditionColor = (condition) => {
        switch (condition?.toLowerCase()) {
            case "excellent":
                return "green";
            case "very good":
                return "blue";
            case "good":
                return "orange";
            case "fair":
                return "red";
            default:
                return "default";
        }
    };

    const formatPrice = (price, currency = "USD") => {
        if (!price) return "Price on request";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD"
        }).format(price);
    };

    const formatImageUrl = (imagePath) => {
        if (!imagePath) return null;

        // If it's already a full URL, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        // If it starts with /uploads, construct the full backend URL
        if (imagePath.startsWith('/uploads')) {
            return `${BACKEND_URL}/${imagePath}`;
        }

        // If it's just a filename, construct the full path
        return `${BACKEND_URL}/uploads/${imagePath}`;
    };

    const handleContactDealer = async (values) => {
        setContacting(true);
        try {
            // Here you would typically send the contact form to your backend
            // For now, we'll just show a success message
            message.success('Your message has been sent to the dealer! They will get back to you soon.');
            contactForm.resetFields();
        } catch (error) {
            message.error('Failed to send message. Please try again.');
        } finally {
            setContacting(false);
        }
    };

    if (loading) {
        console.log("UI console Share component: Loading state");
        return (
            <>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "60vh",
                    padding: "24px"
                }}>
                    <Spin size="large" />
                </div>
            </>
        );
    }

    if (error || !watch) {
        console.log("UI console Share component: Error or no watch state", { error, watch });
        return (
            <>
                <div className="share_page" style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    maxWidth: "600px",
                    margin: "0 auto",
                }}>
                    <Title level={2} style={{ color: "#ff4d4f" }}>
                        {error || "Watch Not Found"}
                    </Title>
                    <Paragraph style={{ fontSize: "16px", color: "#666", marginBottom: "24px" }}>
                        This watch may have been removed or the link is no longer valid.
                    </Paragraph>
                    <Space>
                        <Button
                            type="primary"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/")}
                        >
                            Go to Home
                        </Button>
                        <Button
                            icon={<ShareAltOutlined />}
                            onClick={() => window.history.back()}
                        >
                            Go Back
                        </Button>
                    </Space>
                </div >
            </>
        );
    }

    console.log("UI console Share component: Rendering watch data", { watch });

    return (
        <>
            <div className="share-container" style={{
                padding: "24px",
                maxWidth: "1200px",
                margin: "0 auto",
                width: "100%",
                minHeight: "100vh"
            }}>
                <Row gutter={[24, 24]}>
                    {/* Left Column - Images - Sticky */}
                    <Col xs={24} lg={12}>
                        <div className="sticky-image-section">
                            <Card>
                                {watch.images && watch.images.length > 0 ? (
                                    <Image
                                        src={formatImageUrl(watch.images[0])}
                                        alt={`${watch.brand} ${watch.model}`}
                                        style={{ width: "100%", height: "auto" }}
                                        preview={{
                                            mask: <div style={{ color: 'white', fontSize: '16px' }}>Click to view</div>
                                        }}
                                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                    />
                                ) : (
                                    <div style={{
                                        width: "100%",
                                        height: "300px",
                                        backgroundColor: "#f5f5f5",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "8px"
                                    }}>
                                        <Text type="secondary">No image available</Text>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </Col>

                    {/* Right Column - Details - Sticky */}
                    <Col xs={24} lg={12}>
                        <div className="sticky-details-section">
                            <Card>
                                <Title level={2} style={{ marginBottom: "16px" }}>
                                    {watch.brand} {watch.model}
                                </Title>

                                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                    {/* Status and Condition */}
                                    <div>
                                        <Space size="middle">
                                            <Tag color={getStatusColor(watch.status)} size="large">
                                                {watch.status || "Unknown"}
                                            </Tag>
                                            <Tag color={getConditionColor(watch.condition)} size="large">
                                                {watch.condition || "Unknown"}
                                            </Tag>
                                        </Space>
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                                            {formatPrice(watch.priceListed, watch.currency)}
                                        </Title>
                                    </div>

                                    {/* Key Details */}
                                    <Descriptions column={1} size="small">
                                        {watch.year && (
                                            <Descriptions.Item
                                                label={<><CalendarOutlined /> Year</>}
                                            >
                                                {watch.year}
                                            </Descriptions.Item>
                                        )}
                                        {watch.refNo && (
                                            <Descriptions.Item
                                                label={<><TrophyOutlined /> Reference</>}
                                            >
                                                {watch.refNo}
                                            </Descriptions.Item>
                                        )}
                                        {watch.brand && (
                                            <Descriptions.Item
                                                label={<><TrophyOutlined /> Brand</>}
                                            >
                                                {watch.brand}
                                            </Descriptions.Item>
                                        )}
                                        {watch.model && (
                                            <Descriptions.Item
                                                label={<><TrophyOutlined /> Model</>}
                                            >
                                                {watch.model}
                                            </Descriptions.Item>
                                        )}
                                    </Descriptions>

                                    {/* Description */}
                                    {watch.description && (
                                        <div>
                                            <Title level={4}>Description</Title>
                                            <Paragraph style={{ color: "#666" }}>
                                                {watch.description}
                                            </Paragraph>
                                        </div>
                                    )}

                                    {/* Additional Images */}
                                    {watch.images && watch.images.length > 1 && (
                                        <div>
                                            <Title level={4}>More Images</Title>
                                            <Row gutter={[8, 8]}>
                                                {watch.images.slice(1).map((image, index) => (
                                                    <Col key={index} span={8}>
                                                        <Image
                                                            src={formatImageUrl(image)}
                                                            alt={`${watch.brand} ${watch.model} - Image ${index + 2}`}
                                                            style={{ width: "100%", height: "auto" }}
                                                            preview={{
                                                                mask: <div style={{ color: 'white', fontSize: '14px' }}>View</div>
                                                            }}
                                                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                                        />
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    )}

                                    {/* WhatsApp Contact Section */}
                                    <Divider />
                                    <div>
                                        <Title level={4}>
                                            <WhatsAppOutlined style={{ marginRight: 8, color: '#25D366' }} />
                                            Contact via WhatsApp
                                        </Title>
                                        <Paragraph style={{ color: '#666', marginBottom: 16 }}>
                                            Prefer to chat on WhatsApp? Click below to start a conversation with the dealer directly.
                                        </Paragraph>

                                        {watch.dealer?.whatsapp ? (
                                            <Button
                                                type="primary"
                                                size="large"
                                                icon={<WhatsAppOutlined />}
                                                className="whatsapp-button"
                                                style={{
                                                    width: '100%',
                                                    height: '48px',
                                                    borderRadius: '6px',
                                                    fontWeight: '600'
                                                }}
                                                onClick={() => {
                                                    const phoneNumber = watch.dealer.whatsapp.replace(/\s+/g, '');
                                                    const message = `Hi! I'm interested in the ${watch.brand} ${watch.model} (${watch.refNo || 'N/A'}) that you have listed. Can you tell me more about it?`;
                                                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                                                    window.open(whatsappUrl, '_blank');
                                                }}
                                            >
                                                Chat on WhatsApp
                                            </Button>
                                        ) : (
                                            <div className="whatsapp-unavailable">
                                                <WhatsAppOutlined style={{ fontSize: '24px', marginBottom: '8px', color: '#25D366' }} />
                                                <div>WhatsApp contact not available</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contact Dealer Section */}
                                    <Divider />
                                    <div>
                                        <Title level={4}>
                                            <MessageOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                            Contact Dealer
                                        </Title>
                                        <Paragraph style={{ color: '#666', marginBottom: 16 }}>
                                            Interested in this watch? Send a message to the dealer to inquire about availability, pricing, or to arrange a viewing.
                                        </Paragraph>

                                        <Form
                                            form={contactForm}
                                            layout="vertical"
                                            onFinish={handleContactDealer}
                                            className="contact-form"
                                        >
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        name="name"
                                                        label="Your Name"
                                                        rules={[{ required: true, message: 'Please enter your name' }]}
                                                    >
                                                        <Input
                                                            prefix={<UserOutlined />}
                                                            placeholder="Enter your full name"
                                                            size="large"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        name="email"
                                                        label="Email Address"
                                                        rules={[
                                                            { required: true, message: 'Please enter your email' },
                                                            { type: 'email', message: 'Please enter a valid email' }
                                                        ]}
                                                    >
                                                        <Input
                                                            prefix={<MailOutlined />}
                                                            placeholder="Enter your email address"
                                                            size="large"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        name="phone"
                                                        label="Phone Number (Optional)"
                                                    >
                                                        <Input
                                                            prefix={<PhoneOutlined />}
                                                            placeholder="Enter your phone number"
                                                            size="large"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        name="subject"
                                                        label="Subject"
                                                        rules={[{ required: true, message: 'Please enter a subject' }]}
                                                    >
                                                        <Input
                                                            placeholder="e.g., Inquiry about Seiko model_3"
                                                            size="large"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24}>
                                                    <Form.Item
                                                        name="message"
                                                        label="Message"
                                                        rules={[{ required: true, message: 'Please enter your message' }]}
                                                    >
                                                        <Input.TextArea
                                                            rows={4}
                                                            placeholder="Tell the dealer about your interest in this watch. Include any specific questions about condition, authenticity, shipping, or viewing arrangements."
                                                            showCount
                                                            maxLength={500}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Form.Item>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    loading={contacting}
                                                    size="large"
                                                    icon={<MessageOutlined />}
                                                    style={{ width: '100%' }}
                                                >
                                                    {contacting ? 'Sending Message...' : 'Send Message to Dealer'}
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </div>


                                </Space>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default Share;

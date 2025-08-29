import React, { useState } from 'react';
import { Steps, Card, Form, Input, Select, Button, Upload, Row, Col, Typography, Divider, Checkbox, Alert, Progress, Space } from 'antd';
import { 
    UserOutlined, 
    ShopOutlined, 
    SettingOutlined, 
    CheckCircleOutlined,
    UploadOutlined,
    PlusOutlined,
    InfoCircleOutlined,
    RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DealerOnboarding = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const [onboardingData, setOnboardingData] = useState({
        // Personal Info
        fullName: '',
        email: '',
        phone: '',
        
        // Business Info
        companyName: '',
        businessType: '',
        yearsInBusiness: '',
        specialization: [],
        businessAddress: '',
        website: '',
        
        // Preferences
        preferredCurrency: 'USD',
        timeZone: '',
        notifications: {
            email: true,
            whatsapp: true,
            sms: false
        },
        
        // Features
        enabledFeatures: [],
        
        // Documents
        businessLicense: null,
        taxId: '',
        
        // Goals
        monthlyVolume: '',
        primaryGoals: []
    });

    const steps = [
        {
            title: 'Personal Info',
            icon: <UserOutlined />,
            description: 'Tell us about yourself'
        },
        {
            title: 'Business Details',
            icon: <ShopOutlined />,
            description: 'Your company information'
        },
        {
            title: 'Preferences',
            icon: <SettingOutlined />,
            description: 'Customize your experience'
        },
        {
            title: 'Complete Setup',
            icon: <CheckCircleOutlined />,
            description: 'Finalize your account'
        }
    ];

    const businessTypes = [
        'Authorized Dealer',
        'Independent Retailer',
        'Online Marketplace',
        'Auction House',
        'Collector/Enthusiast',
        'Repair & Service',
        'Wholesale Distributor'
    ];

    const specializations = [
        'Luxury Watches',
        'Vintage Timepieces',
        'Sports Watches',
        'Smart Watches',
        'Pocket Watches',
        'Limited Editions',
        'Investment Grade',
        'Restoration Services'
    ];

    const availableFeatures = [
        { key: 'whatsapp', label: 'WhatsApp Engine', description: 'Search and monitor WhatsApp groups' },
        { key: 'inventory', label: 'Inventory Management', description: 'Manage your watch listings' },
        { key: 'invoicing', label: 'Invoicing & Billing', description: 'Create and track invoices' },
        { key: 'escrow', label: 'Escrow Services', description: 'Secure transaction handling' },
        { key: 'crm', label: 'Customer Management', description: 'Track customers and dealers' },
        { key: 'reports', label: 'Analytics & Reports', description: 'Business insights and reporting' }
    ];

    const primaryGoals = [
        'Increase Sales Volume',
        'Expand Customer Base',
        'Improve Inventory Turnover',
        'Enhance Customer Service',
        'Streamline Operations',
        'Market Research',
        'Network with Dealers',
        'Brand Building'
    ];

    const handleNext = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();
            setOnboardingData(prev => ({ ...prev, ...values }));
            setCurrentStep(prev => prev + 1);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            const finalData = {
                ...onboardingData,
                ...form.getFieldsValue(),
                completedAt: new Date().toISOString()
            };
            
            console.log('Onboarding completed:', finalData);
            
            // Here you would typically send the data to your API
            // await API.post('/api/onboarding/complete', finalData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            navigate('/dashboard');
        } catch (error) {
            console.error('Onboarding failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <Card title="Personal Information" className="onboarding-card">
                        <Form form={form} layout="vertical">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="fullName"
                                        label="Full Name"
                                        rules={[{ required: true, message: 'Please enter your full name' }]}
                                    >
                                        <Input placeholder="John Smith" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="email"
                                        label="Email Address"
                                        rules={[
                                            { required: true, message: 'Please enter your email' },
                                            { type: 'email', message: 'Please enter a valid email' }
                                        ]}
                                    >
                                        <Input placeholder="john@example.com" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="phone"
                                        label="Phone Number"
                                        rules={[{ required: true, message: 'Please enter your phone number' }]}
                                    >
                                        <Input placeholder="+1 (555) 123-4567" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="timeZone"
                                        label="Time Zone"
                                        rules={[{ required: true, message: 'Please select your time zone' }]}
                                    >
                                        <Select placeholder="Select time zone">
                                            <Option value="America/New_York">Eastern Time (ET)</Option>
                                            <Option value="America/Chicago">Central Time (CT)</Option>
                                            <Option value="America/Denver">Mountain Time (MT)</Option>
                                            <Option value="America/Los_Angeles">Pacific Time (PT)</Option>
                                            <Option value="Europe/London">GMT</Option>
                                            <Option value="Europe/Zurich">CET</Option>
                                            <Option value="Asia/Dubai">GST</Option>
                                            <Option value="Asia/Hong_Kong">HKT</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                );

            case 1:
                return (
                    <Card title="Business Information" className="onboarding-card">
                        <Form form={form} layout="vertical">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="companyName"
                                        label="Company Name"
                                        rules={[{ required: true, message: 'Please enter your company name' }]}
                                    >
                                        <Input placeholder="Premium Watches Ltd" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="businessType"
                                        label="Business Type"
                                        rules={[{ required: true, message: 'Please select your business type' }]}
                                    >
                                        <Select placeholder="Select business type">
                                            {businessTypes.map(type => (
                                                <Option key={type} value={type}>{type}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="yearsInBusiness"
                                        label="Years in Business"
                                    >
                                        <Select placeholder="Select experience level">
                                            <Option value="0-1">Less than 1 year</Option>
                                            <Option value="1-3">1-3 years</Option>
                                            <Option value="3-5">3-5 years</Option>
                                            <Option value="5-10">5-10 years</Option>
                                            <Option value="10+">10+ years</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="monthlyVolume"
                                        label="Expected Monthly Volume"
                                    >
                                        <Select placeholder="Select volume range">
                                            <Option value="1-10">1-10 watches</Option>
                                            <Option value="10-50">10-50 watches</Option>
                                            <Option value="50-100">50-100 watches</Option>
                                            <Option value="100+">100+ watches</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item
                                name="specialization"
                                label="Specialization Areas"
                            >
                                <Checkbox.Group>
                                    <Row>
                                        {specializations.map(spec => (
                                            <Col span={8} key={spec}>
                                                <Checkbox value={spec}>{spec}</Checkbox>
                                            </Col>
                                        ))}
                                    </Row>
                                </Checkbox.Group>
                            </Form.Item>
                            <Form.Item
                                name="businessAddress"
                                label="Business Address"
                            >
                                <TextArea rows={3} placeholder="Enter your business address" />
                            </Form.Item>
                            <Form.Item
                                name="website"
                                label="Website (Optional)"
                            >
                                <Input placeholder="https://www.yourwebsite.com" />
                            </Form.Item>
                        </Form>
                    </Card>
                );

            case 2:
                return (
                    <Card title="Preferences & Features" className="onboarding-card">
                        <Form form={form} layout="vertical">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="preferredCurrency"
                                        label="Preferred Currency"
                                        initialValue="USD"
                                    >
                                        <Select>
                                            <Option value="USD">USD - US Dollar</Option>
                                            <Option value="EUR">EUR - Euro</Option>
                                            <Option value="GBP">GBP - British Pound</Option>
                                            <Option value="CHF">CHF - Swiss Franc</Option>
                                            <Option value="JPY">JPY - Japanese Yen</Option>
                                            <Option value="AED">AED - UAE Dirham</Option>
                                            <Option value="HKD">HKD - Hong Kong Dollar</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="primaryGoals"
                                        label="Primary Goals"
                                    >
                                        <Select mode="multiple" placeholder="Select your main goals">
                                            {primaryGoals.map(goal => (
                                                <Option key={goal} value={goal}>{goal}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider>Features to Enable</Divider>
                            <Form.Item name="enabledFeatures">
                                <Checkbox.Group style={{ width: '100%' }}>
                                    <Row gutter={[16, 16]}>
                                        {availableFeatures.map(feature => (
                                            <Col span={12} key={feature.key}>
                                                <Card size="small" className="feature-card">
                                                    <Checkbox value={feature.key}>
                                                        <div>
                                                            <Text strong>{feature.label}</Text>
                                                            <br />
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                {feature.description}
                                                            </Text>
                                                        </div>
                                                    </Checkbox>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </Checkbox.Group>
                            </Form.Item>

                            <Divider>Notification Preferences</Divider>
                            <Form.Item name={['notifications', 'email']} valuePropName="checked" initialValue={true}>
                                <Checkbox>Email notifications for important updates</Checkbox>
                            </Form.Item>
                            <Form.Item name={['notifications', 'whatsapp']} valuePropName="checked" initialValue={true}>
                                <Checkbox>WhatsApp alerts for new matches</Checkbox>
                            </Form.Item>
                            <Form.Item name={['notifications', 'sms']} valuePropName="checked" initialValue={false}>
                                <Checkbox>SMS notifications for urgent matters</Checkbox>
                            </Form.Item>
                        </Form>
                    </Card>
                );

            case 3:
                return (
                    <Card title="Complete Your Setup" className="onboarding-card">
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
                            <Title level={2}>You're Almost Ready!</Title>
                            <Paragraph>
                                Review your information and complete the setup to start using WatchDealerHub.
                            </Paragraph>
                            
                            <Alert
                                message="Setup Summary"
                                description={
                                    <div style={{ textAlign: 'left' }}>
                                        <p><strong>Company:</strong> {onboardingData.companyName || 'Not specified'}</p>
                                        <p><strong>Business Type:</strong> {onboardingData.businessType || 'Not specified'}</p>
                                        <p><strong>Features:</strong> {onboardingData.enabledFeatures?.length || 0} selected</p>
                                        <p><strong>Currency:</strong> {onboardingData.preferredCurrency || 'USD'}</p>
                                    </div>
                                }
                                type="info"
                                style={{ marginBottom: '24px', textAlign: 'left' }}
                            />

                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <div>
                                    <Title level={4}>What happens next?</Title>
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Card size="small">
                                                <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                                                <p>Account Activation</p>
                                                <Text type="secondary">Your account will be activated immediately</Text>
                                            </Card>
                                        </Col>
                                        <Col span={8}>
                                            <Card size="small">
                                                <SettingOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                                                <p>Feature Setup</p>
                                                <Text type="secondary">Selected features will be configured</Text>
                                            </Card>
                                        </Col>
                                        <Col span={8}>
                                            <Card size="small">
                                                <InfoCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                                                <p>Getting Started</p>
                                                <Text type="secondary">Access tutorials and documentation</Text>
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>
                            </Space>
                        </div>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 20px'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <Title level={1} style={{ color: 'white', marginBottom: '8px' }}>
                        Welcome to WatchDealerHub
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
                        Let's set up your account in just a few steps
                    </Text>
                </div>

                <Card style={{ marginBottom: '24px' }}>
                    <Steps current={currentStep} style={{ marginBottom: '40px' }}>
                        {steps.map((step, index) => (
                            <Step 
                                key={index}
                                title={step.title}
                                description={step.description}
                                icon={step.icon}
                            />
                        ))}
                    </Steps>

                    <Progress 
                        percent={((currentStep + 1) / steps.length) * 100} 
                        showInfo={false}
                        style={{ marginBottom: '24px' }}
                    />
                </Card>

                {renderStepContent()}

                <Card style={{ marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button 
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                        >
                            Previous
                        </Button>
                        
                        {currentStep < steps.length - 1 ? (
                            <Button 
                                type="primary" 
                                onClick={handleNext}
                                icon={<RightOutlined />}
                            >
                                Next Step
                            </Button>
                        ) : (
                            <Button 
                                type="primary" 
                                onClick={handleFinish}
                                loading={loading}
                                size="large"
                                icon={<CheckCircleOutlined />}
                            >
                                Complete Setup
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DealerOnboarding;

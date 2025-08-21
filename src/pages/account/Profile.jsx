import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CircleLoading from '../../components/common/Loading';
import {
    Card,
    Avatar,
    Button,
    Input,
    Form,
    Tag,
    Row,
    Col,
    Divider,
    Space,
    Typography,
    Descriptions,
    Statistic,
    Modal
} from 'antd';
import {
    UserOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    MailOutlined,
    PhoneOutlined,
    BankOutlined,
    HomeOutlined,
    FileTextOutlined,
    CalendarOutlined,
    CrownOutlined,
    LockOutlined,
    EyeOutlined,
    EyeInvisibleOutlined
} from '@ant-design/icons';
import API from "../../api";
import useAuth from '../../hooks/useAuth';
import { Toast } from '../../components/Alerts/CustomToast';

const { TextArea } = Input;
const { Title, Text } = Typography;

const Profile = () => {

    const { user, setAuth, update } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [passwordForm] = Form.useForm();
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [profileLoaded, setProfileLoaded] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        bio: ''
    });

    // Initialize form data from localStorage if available
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && !profileLoaded) {
            try {
                const userData = JSON.parse(storedUser);
                const initialData = {
                    fullName: userData.fullName || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    company: userData.company || '',
                    bio: userData.bio || ''
                };
                setFormData(initialData);
                form.setFieldsValue(initialData);
                setProfileLoaded(true);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
            }
        }
    }, [profileLoaded, form]);

    // Fetch user profile from backend
    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // Try to get user data from localStorage as fallback
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    const profileData = {
                        fullName: userData.fullName || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        address: userData.address || '',
                        company: userData.company || '',
                        bio: userData.bio || ''
                    };
                    setFormData(profileData);
                    form.setFieldsValue(profileData);
                    setProfileLoaded(true);
                }
                return;
            }

            const response = await API.get('/api/users/profile');

            if (response.status === 200) {
                const data = response.data;
                const userData = data.user;

                const profileData = {
                    fullName: userData.fullName || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    company: userData.company || '',
                    bio: userData.bio || ''
                };

                setFormData(profileData);
                form.setFieldsValue(profileData);
                setProfileLoaded(true);
            } else {
                // Fallback to localStorage if API fails
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    const profileData = {
                        fullName: userData.fullName || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        address: userData.address || '',
                        company: userData.company || '',
                        bio: userData.bio || ''
                    };
                    setFormData(profileData);
                    form.setFieldsValue(profileData);
                    setProfileLoaded(true);
                }
                console.warn('API call failed, using fallback data');
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
            // Fallback to localStorage if API call fails
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                const profileData = {
                    fullName: userData.fullName || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    company: userData.company || '',
                    bio: userData.bio || ''
                };
                setFormData(profileData);
                form.setFieldsValue(profileData);
                setProfileLoaded(true);
            }
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);

            const values = await form.validateFields();
            console.log('UI console Saving profile with values:', values);

            const token = localStorage.getItem('token');

            if (!token) {
                Toast.error('Authentication required');
                return;
            }

            const response = await API.put('/api/users/profile', values);

            if (response.status === 200) {
                const data = response.data;

                console.log('UI console Profile update success:', data);
                Toast.success('Profile updated successfully!');

                // Update local form data
                setFormData(values);

                // Update local context and storage
                const updatedUser = { ...(user || {}), ...values };

                localStorage.setItem('user', JSON.stringify(updatedUser));

                setEditMode(false);
            } else {
                let errorData;
                try {
                    errorData = response.data;
                    console.error('Profile update error:', errorData);
                    Toast.error(errorData.msg || errorData.error || 'Failed to update profile');
                } catch (parseError) {
                    console.error('Failed to parse error response:', parseError);
                    Toast.error(`HTTP ${response.status}: Failed to update profile`);
                }
            }
        } catch (err) {
            console.error('Profile update exception:', err);
            if (err.errorFields) {
                Toast.error('Please fill in all required fields correctly.');
            } else {
                Toast.error('Failed to update profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        try {
            setPasswordLoading(true);

            const values = await passwordForm.validateFields();
            const token = localStorage.getItem('token');

            if (!token) {
                Toast.error('Authentication required');
                return;
            }

            const response = await API.put('/api/users/change-password', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });

            if (response.status === 200) {
                Toast.success('Password changed successfully!');
                setPasswordModalVisible(false);
                passwordForm.resetFields();
            } else {
                const errorData = response.data;
                Toast.error(errorData.msg || 'Failed to change password');
            }
        } catch (err) {
            if (err.errorFields) {
                Toast.error('Please fill in all required fields correctly.');
            } else {
                Toast.error('Failed to change password. Please try again.');
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'superadmin':
                return 'Super Administrator';
            case 'admin':
                return 'Company Administrator';
            case 'user':
                return 'Customer';
            case 'dealer':
                return 'Dealer';
            default:
                return role;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'superadmin':
                return 'red';
            case 'admin':
                return 'blue';
            case 'user':
                return 'green';
            case 'dealer':
                return 'orange';
            default:
                return 'default';
        }
    };

    // Show loading only if we have no user data at all and profile is not loaded
    if (!user && !localStorage.getItem('user') && !profileLoaded) {
        return (
            <>
                <div style={{ padding: '24px', textAlign: 'center' }}>
                    <CircleLoading />
                    <p style={{ marginTop: '16px', color: '#666' }}>Loading profile...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div style={{ padding: '24px', margin: '0 auto', backgroundColor: '#f5f5f5', backgroundImage: "url('/background.svg')", backgroundAttachment: 'fixed' }}>
                <div style={{ maxWidth: '1200px', margin: 'auto' }}>
                    {!profileLoaded && (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <CircleLoading />
                            <p style={{ marginTop: '16px', color: '#666' }}>Loading profile...</p>
                        </div>
                    )}

                    {(profileLoaded || formData.fullName || formData.email) ? (
                        <Row gutter={[24, 24]}>
                            {/* Left Column */}
                            <Col xs={24} lg={8}>
                                {/* User Summary Card */}
                                <Card
                                    style={{ marginBottom: 24 }}
                                    bodyStyle={{ textAlign: 'center' }}
                                >
                                    <Avatar
                                        size={80}
                                        icon={<UserOutlined />}
                                        style={{
                                            backgroundColor: '#1890ff',
                                            marginBottom: 16,
                                            fontSize: '32px'
                                        }}
                                    >
                                        {(user && user.fullName) ? user.fullName.charAt(0).toUpperCase() : (formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U')}
                                    </Avatar>

                                    <Title level={3} style={{ margin: '8px 0' }}>
                                        {(user && user.fullName) || formData.fullName || 'User'}
                                    </Title>

                                    <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: 16 }}>
                                        {(user && user.email) || formData.email || 'No email'}
                                    </Text>

                                    <Tag
                                        color={getRoleColor((user && user.role) || 'user')}
                                        icon={<CrownOutlined />}
                                        style={{ fontSize: '14px', padding: '4px 12px', marginBottom: 24 }}
                                    >
                                        {getRoleDisplayName((user && user.role) || 'user')}
                                    </Tag>

                                    <Button
                                        type={editMode ? "default" : "primary"}
                                        icon={editMode ? <CloseOutlined /> : <EditOutlined />}
                                        size="large"
                                        block
                                        onClick={() => setEditMode(!editMode)}
                                        className='googgogogogogogogogogogo'
                                    >
                                        {editMode ? 'Cancel Edit' : 'Edit Profile'}
                                    </Button>
                                </Card>

                                {/* Account Information Card */}
                                <Card
                                    title="Account Information"
                                    size="small"
                                >
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item
                                            label={<><CalendarOutlined /> Member Since</>}
                                        >
                                            {new Date((user && user.date) || Date.now()).toLocaleDateString()}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={<><CrownOutlined /> Role</>}
                                        >
                                            {getRoleDisplayName((user && user.role) || 'user')}
                                        </Descriptions.Item>
                                        {/* {(user && user.companyId) && (
                                        <Descriptions.Item
                                            label={<><BankOutlined /> Company ID</>}
                                        >
                                            {user.companyId}
                                        </Descriptions.Item>
                                    )} */}
                                    </Descriptions>
                                </Card>

                                {/* Security Card */}
                                <Card
                                    title="Security"
                                    size="small"
                                    style={{ marginTop: 24 }}
                                >
                                    <Button
                                        type="default"
                                        icon={<LockOutlined />}
                                        block
                                        onClick={() => setPasswordModalVisible(true)}
                                    >
                                        Change Password
                                    </Button>
                                </Card>
                            </Col>

                            {/* Right Column */}
                            <Col xs={24} lg={16}>
                                <Card
                                    title="Personal Information"
                                    size="default"
                                >
                                    <Form
                                        form={form}
                                        layout="vertical"
                                        onValuesChange={(changedValues, allValues) => {
                                            console.log('Form values changed:', allValues);
                                            setFormData(allValues);
                                            Toast.success("Form valuse changed")
                                        }}
                                    >
                                        <Row gutter={16}>
                                            <Col xs={24} md={12}>
                                                <Form.Item
                                                    name="fullName"
                                                    label="Full Name"
                                                    rules={[{ required: true, Toast: 'Please enter your full name!' }]}
                                                >
                                                    <Input
                                                        prefix={<UserOutlined />}
                                                        placeholder="Enter your full name"
                                                        disabled={!editMode}
                                                        size="large"
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={12}>
                                                <Form.Item
                                                    name="email"
                                                    label="Email"
                                                    rules={[
                                                        { required: true, Toast: 'Please enter your email!' },
                                                        { type: 'email', Toast: 'Please enter a valid email!' }
                                                    ]}
                                                >
                                                    <Input
                                                        prefix={<MailOutlined />}
                                                        placeholder="Enter your email"
                                                        disabled={!editMode}
                                                        size="large"
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col xs={24} md={12}>
                                                <Form.Item
                                                    name="phone"
                                                    label="Phone Number"
                                                >
                                                    <Input
                                                        prefix={<PhoneOutlined />}
                                                        placeholder="Enter your phone number"
                                                        disabled={!editMode}
                                                        size="large"
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={12}>
                                                <Form.Item
                                                    name="company"
                                                    label="Company"
                                                >
                                                    <Input
                                                        prefix={<BankOutlined />}
                                                        placeholder="Enter your company name"
                                                        disabled={!editMode}
                                                        size="large"
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Form.Item
                                            name="address"
                                            label="Address"
                                        >
                                            <TextArea
                                                placeholder="Enter your address"
                                                disabled={!editMode}
                                                rows={3}
                                                size="large"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="bio"
                                            label="Bio"
                                        >
                                            <TextArea
                                                placeholder="Tell us about yourself..."
                                                disabled={!editMode}
                                                rows={4}
                                                size="large"
                                            />
                                        </Form.Item>

                                        {editMode && (
                                            <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                                                <Space size="middle">
                                                    <Button
                                                        type="primary"
                                                        icon={<SaveOutlined />}
                                                        size="large"
                                                        onClick={handleSaveProfile}
                                                        loading={loading}
                                                    >
                                                        Save Changes
                                                    </Button>
                                                    <Button
                                                        size="large"
                                                        onClick={() => setEditMode(false)}
                                                        disabled={loading}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Space>
                                            </Form.Item>
                                        )}

                                        {/* Debug Section - Remove in production */}
                                        {/* <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
                                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                <Button
                                                    type="dashed"
                                                    size="small"
                                                    onClick={() => {
                                                        console.log('Current form data:', formData);
                                                        console.log('Current user context:', user);
                                                        console.log('LocalStorage user:', localStorage.getItem('user'));
                                                    }}
                                                >
                                                    Debug: Log Current Data
                                                </Button>
                                                <Button
                                                    type="dashed"
                                                    size="small"
                                                    onClick={async () => {
                                                        try {
                                                            const token = localStorage.getItem('token');
                                                            console.log('Testing backend connectivity...');
                                                            const response = await fetch('/api/users/profile', {
                                                                method: 'GET',
                                                                headers: {
                                                                    'Authorization': `Bearer ${token}`,
                                                                    'Content-Type': 'application/json'
                                                                }
                                                            });
                                                            console.log('Backend test response:', response.status, response.statusText);
                                                            if (response.ok) {
                                                                const data = await response.json();
                                                                console.log('Backend test data:', data);
                                                            }
                                                        } catch (error) {
                                                            console.error('Backend test failed:', error);
                                                        }
                                                    }}
                                                >
                                                    Test Backend Connection
                                                </Button>
                                            </Space>
                                        </Form.Item> */}
                                    </Form>
                                </Card>

                                {/* Quick Stats Card */}
                                <Card
                                    title="Quick Stats"
                                    size="small"
                                    style={{ marginTop: 24 }}
                                >
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Statistic
                                                title="Member Since"
                                                value={new Date((user && user.date) || Date.now()).getFullYear()}
                                                suffix="year"
                                            />
                                        </Col>
                                        <Col span={8}>
                                            <Statistic
                                                title="Role Level"
                                                value={(user && user.role) === 'superadmin' ? 3 : (user && user.role) === 'admin' ? 2 : 1}
                                                suffix="/ 3"
                                            />
                                        </Col>
                                        <Col span={8}>
                                            <Statistic
                                                title="Status"
                                                value="Active"
                                                valueStyle={{ color: '#3f8600' }}
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <p style={{ color: '#666', fontSize: '16px' }}>No profile data available</p>
                            <Button type="primary" onClick={() => fetchProfile()}>
                                Retry Loading Profile
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Password Change Modal */}
            <Modal
                title="Change Password"
                open={passwordModalVisible}
                onCancel={() => setPasswordModalVisible(false)}
                footer={null}
                width={400}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                >
                    <Form.Item
                        name="currentPassword"
                        label="Current Password"
                        rules={[{ required: true, Toast: 'Please enter your current password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Enter current password"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label="New Password"
                        rules={[
                            { required: true, Toast: 'Please enter your new password!' },
                            { min: 6, Toast: 'Password must be at least 6 characters!' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Enter new password"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Confirm New Password"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, Toast: 'Please confirm your new password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Confirm new password"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setPasswordModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                icon={<LockOutlined />}
                                onClick={handleChangePassword}
                                loading={passwordLoading}
                            >
                                Change Password
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default Profile;

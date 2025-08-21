import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Modal, Form, Input, Button, message } from "antd";
import { mailer } from '../../utils/mailer';
import API from '../../api';
import emailjs from "@emailjs/browser";
import { CustomToast } from '../../components/Alerts/CustomToast';

const Login = () => {
    const { login } = useAuth()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState("");

    const navigate = useNavigate();

    const getFieldError = (field) => {
        if (!touched[field]) return '';
        switch (field) {
            case 'email':
                if (!email.trim()) return 'Email is required.';
                if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Please enter a valid email address.';
                break;
            case 'password':
                if (!password) return 'Password is required.';
                break;
            default:
                return '';
        }
        return '';
    };

    const validate = () => {
        if (!email.trim()) return 'Email is required.';
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Please enter a valid email address.';
        if (!password) return 'Password is required.';
        return '';
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ email: true, password: true });
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            CustomToast('error', validationError);
            return;
        }
        setError('');
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    const handleOk = async () => {
        let res = await API.post(`/api/auth/forgot-password`, { email: recoveryEmail });

        emailjs.send("service_p6jpasq", "template_0s2cyd5", {
            email: recoveryEmail,
            link: res.data.data,
        }, 'qKkoQa6xr1VmUkeLa');
        CustomToast("success", res.data.msg);
    };

    return (
        <>
            <div className="login-bg" style={{ backgroundImage: "url('/background.svg')" }}>
                <form className="login-card" onSubmit={handleSubmit} autoComplete="off">
                    <div className="login-title">Sign In to Your Account</div>
                    {error && <div className="login-error">{error}</div>}
                    <div className='ui-login-margin'>
                        <label className="login-label">Email</label>
                        <div className="login-input-group">
                            <span className="login-input-icon"><i className="bi bi-envelope"></i></span>
                            <input
                                type="email"
                                className="login-input"
                                placeholder="name@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onBlur={() => handleBlur('email')}
                                required
                                autoComplete="email"
                            />
                        </div>
                        {getFieldError('email') && <div className="login-error-text">{getFieldError('email')}</div>}
                    </div>
                    <div className='ui-login-margin'>
                        <label className="login-label">Password</label>
                        <p className="login-forgot" onClick={() => setIsModalVisible(true)}>Forgot password?</p>
                        <div className="login-input-group">
                            <span className="login-input-icon" style={{ transform: "translateY(-41%)" }}><i className="bi bi-lock"></i></span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="login-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onBlur={() => handleBlur('password')}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="login-password-toggle"
                                tabIndex={-1}
                                onClick={() => setShowPassword(v => !v)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                        {getFieldError('password') && <div className="login-error-text">{getFieldError('password')}</div>}
                    </div>
                    <button className="login-btn" type="submit">
                        <i className="bi bi-key me-2"></i> Sign in
                    </button>
                    <hr className="login-divider" />
                    <div className="text-center mb-2" style={{ color: '#6b7280', fontWeight: 500, fontSize: '12px' }}>
                        OR CONTINUE WITH
                    </div>
                    <div className="text-center mt-2" style={{ fontSize: '13px' }}>
                        Don't have an account? <Link to="/dealer-register" className="login-link" style={{ fontSize: '15px' }}>Sign up</Link>
                    </div>
                </form>
            </div>
            <Modal
                title="Forgot Password"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={loading}
                okText="Send Reset Link"
            >
                <Input placeholder="Enter your email address" onChange={(e) => setRecoveryEmail(e.target.value)} onBlur={() => handleBlur('email')} />
            </Modal>
        </>
    );
};

export default Login; 
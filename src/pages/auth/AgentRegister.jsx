import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import emailjs from "@emailjs/browser";
import useAuth from '../../hooks/useAuth';
import { mailer } from '../../utils/mailer';
import { Toast } from '../../components/Alerts/CustomToast';

const AgentRegister = () => {
    const { registerAgent } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [touched, setTouched] = useState({});

    const [verifyEmail, setVerifyEmail] = useState(false);
    const [confirmCode, setConfirmCode] = useState("");
    const [verifyCode, setVerifyCode] = useState("");
    const navigate = useNavigate();

    const getFieldError = (field) => {  
        if (!touched[field]) return '';
        switch (field) {
            case 'fullName':
                if (!fullName.trim()) return 'Full name is required.';
                break;
            case 'email':
                if (!email.trim()) return 'Email is required.';
                if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Please enter a valid email address.';
                break;
            case 'password':
                if (!password) return 'Password is required.';
                if (password.length < 6) return 'Password must be at least 6 characters.';
                break;
            case 'confirmPassword':
                if (!confirmPassword) return 'Please confirm your password.';
                if (password !== confirmPassword) return 'Passwords do not match.';
                break;
            default:
                return '';
        }
        return '';
    };

    const validate = () => {
        if (!fullName.trim()) return 'Full name is required.';
        if (!email.trim()) return 'Email is required.';
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Please enter a valid email address.';
        if (!password) return 'Password is required.';
        if (password.length < 6) return 'Password must be at least 6 characters.';
        if (!confirmPassword) return 'Please confirm your password.';
        if (password !== confirmPassword) return 'Passwords do not match.';
        return '';
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    useEffect(() => {
        setVerifyCode(Math.floor(100000 + Math.random() * 900000).toString());
    }, [])

    const handleSubmit = async (e) => {

        if (verifyCode != confirmCode.trim()) return alert("code error");

        e.preventDefault();

        setError('');
        try {
            const result = await registerAgent(email, password, fullName);

            setTimeout(() => {
                // Redirect based on user role
                if (result.user.role === 'superadmin') {
                    navigate('/admin');
                } else if (result.user.role === 'admin') {
                    navigate('/inventory');
                } else {
                    navigate('/agent');
                }
            }, 2000);
        } catch (err) {
            setError('Registration failed');
            Toast.error(`Registration failed: ${err}`);
        }
    };

    const verifyemail = () => {
        setTouched({ fullName: true, email: true, password: true, confirmPassword: true });

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            Toast.error(validationError);
            return;
        }

        setVerifyEmail(true);

        const emailVerificationMessage = `
            Hello ${email.split("@")[0]},

            Thank you for signing up with us! To complete your registration, please verify your email address by input below code:

            ${verifyCode}

            If you did not create an account with us, please ignore this email.

            Best regards,  
            The [Watch Dealer] Team
        `;

        mailer({email: email, message: emailVerificationMessage})
    }

    return (
        <>
            <div className="register-bg" style={{backgroundImage: "url('/background.svg')"}}>
                <form className="register-card" onSubmit={handleSubmit}>
                    {
                        !verifyEmail ? (
                            <div className='register-form'>
                                <div className="register-title">Create Your Account</div>
                                {error && <div className="register-error">{error}</div>}
                                <div className="mb-2">
                                    <label className="register-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="register-input"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        onBlur={() => handleBlur('fullName')}
                                        autoComplete="name"
                                        required
                                    />
                                    {getFieldError('fullName') && <div className="register-error-text">{getFieldError('fullName')}</div>}
                                </div>
                                <div className="mb-2">
                                    <label className="register-label">Email</label>
                                    <input
                                        type="email"
                                        className="register-input"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        onBlur={() => handleBlur('email')}
                                        required
                                        autoComplete="email"
                                    />
                                    {getFieldError('email') && <div className="register-error-text">{getFieldError('email')}</div>}
                                </div>
                                <div className="mb-2 register-password-group">
                                    <label className="register-label">Password</label>
                                    <div className="register-input-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="register-input"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            onBlur={() => handleBlur('password')}
                                            required
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="register-password-toggle"
                                            tabIndex={-1}
                                            onClick={() => setShowPassword(v => !v)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                    {getFieldError('password') && <div className="register-error-text">{getFieldError('password')}</div>}
                                </div>
                                <div className="mb-2 register-password-group">
                                    <label className="register-label">Confirm Password</label>
                                    <div className="register-input-wrapper">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            className="register-input"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            onBlur={() => handleBlur('confirmPassword')}
                                            required
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="register-password-toggle"
                                            tabIndex={-1}
                                            onClick={() => setShowConfirmPassword(v => !v)}
                                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                        >
                                            <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                    {getFieldError('confirmPassword') && <div className="register-error-text">{getFieldError('confirmPassword')}</div>}
                                </div>
                                <button className="register-btn" onClick={() => verifyemail()}>
                                    <i className="bi bi-stars me-2"></i> Create account
                                </button>
                            </div>
                        ) : (
                            <div className='register-form'>
                                <div className="register-title">Verify Your Email</div>
                                {error && <div className="register-error">{error}</div>}
                                <div className="mb-2">
                                    <label className="register-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="register-input"
                                        placeholder="Write the code xxxxxx"
                                        value={confirmCode}
                                        onChange={e => setConfirmCode(e.target.value)}
                                        required
                                    />
                                </div>
                                <button className="register-btn" type="submit">
                                    <i className="bi bi-stars me-2"></i> Verify Email
                                </button>
                            </div>
                        )
                    }
                    <hr className="register-divider" />
                    <div className="text-center mb-2" style={{ color: '#666', fontWeight: 500, fontSize: '12px' }}>
                        OR CONTINUE WITH
                    </div>
                    <div className="text-center mt-2" style={{ fontSize: '13px' }}>
                        <span style={{ color: '#796f61' }}>Already have an account? </span>
                        <Link to="/login" className="register-link" style={{ fontSize: '15px' }}>Sign in</Link>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AgentRegister; 
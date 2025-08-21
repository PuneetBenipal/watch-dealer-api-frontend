import React, { useState, useContext, use } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { CustomToast, Toast } from '../../components/Alerts/CustomToast';
import { mailer } from '../../utils/mailer';
import EmailVerificationPage from './EmailVerification';

const DealerRegister = () => {
  const { registerDealer } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [isVerifyStep, setIsVerifyStep] = useState(false);
  const [dealer, setDealer] = useState(null);

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
      case 'companyName':
        if (!companyName.trim()) return 'Company name is required.';
        break;
      case 'companyLogo':
        // Logo is optional, so no validation needed
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
    if (!companyName.trim()) return 'Company name is required.';
    return '';
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        Toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        Toast.error('Please select an image file');
        return;
      }

      setLogoFile(file);
      setCompanyLogo(''); // Clear URL input

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        Toast.error('Please select an image file');
        return;
      }

      setLogoFile(file);
      setCompanyLogo(''); // Clear URL input

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setCompanyLogo('');
  };


  const sendVerifyEmail = () => {
    if (!isVerifyStep) {
      setTouched({ fullName: true, email: true, password: true, confirmPassword: true, companyName: true });
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        CustomToast("error", validationError)
        return;
      }
      setError('');

      const companyAdminData = {
        fullName,
        email,
        password,
        companyName,
        companyLogo: logoFile ? logoPreview : companyLogo // Use file preview or URL
      };

      setDealer(companyAdminData)
    }

    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
    setVerifyCode(verifyCode);
    const emailVerificationMessage = `
        Hello ${email.split("@")[0]},

        Thank you for signing up with us! To complete your registration, please verify your email address by input below code:

        ${verifyCode}

        If you did not create an account with us, please ignore this email.

        Best regards,  
        The [Watch Dealer] Team
    `;

    mailer({ email: email, message: emailVerificationMessage })

    setIsVerifyStep(true)
  }

  return (
    <>
      {
        !isVerifyStep ? (
          <div className="dealer-register-bg" style={{ backgroundImage: "url('/background.svg')", backgroundAttachment: 'fixed' }}>
            <form className="dealer-register-card" onSubmit={sendVerifyEmail} autoComplete="off">
              <div className="dealer-register-title">Company Admin Registration</div>
              {error && <div className="register-error">{error}</div>}

              <div className='ui-register-margin'>
                <label className="register-label">Full Name</label>
                <input
                  type="text"
                  className="register-input"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  required
                  autoComplete="name"
                />
                {getFieldError('fullName') && <div className="register-error-text">{getFieldError('fullName')}</div>}
              </div>

              <div className='ui-register-margin'>
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

              <div className='ui-register-margin'>
                <label className="register-label">Company Name</label>
                <input
                  type="text"
                  className="register-input"
                  placeholder="Enter your company name"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  onBlur={() => handleBlur('companyName')}
                  required
                  autoComplete="organization"
                />
                {getFieldError('companyName') && <div className="register-error-text">{getFieldError('companyName')}</div>}
              </div>

              <div className='ui-register-margin'>
                <label className="register-label">Company Logo</label>
                <div
                  className={`logo-upload-container ${isDragOver ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('logo-file-input').click()}
                >
                  <input
                    id="logo-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {!logoPreview ? (
                    <>
                      <div className="logo-upload-icon">📁</div>
                      <div className="logo-upload-text">Click to upload or drag and drop</div>
                      <div className="logo-upload-hint">PNG, JPG, GIF up to 5MB</div>
                    </>
                  ) : (
                    <div className="logo-preview">
                      <img src={logoPreview} alt="Logo preview" />
                      <br />
                      <button type="button" className="logo-remove-btn" onClick={removeLogo}>
                        Remove Logo
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label className="register-label" style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    Or enter logo URL:
                  </label>
                  <input
                    type="url"
                    className="register-input"
                    placeholder="https://example.com/logo.png"
                    value={companyLogo}
                    onChange={e => setCompanyLogo(e.target.value)}
                    onBlur={() => handleBlur('companyLogo')}
                    autoComplete="url"
                    disabled={logoFile !== null}
                  />
                </div>
                {getFieldError('companyLogo') && <div className="register-error-text">{getFieldError('companyLogo')}</div>}
              </div>

              <div className='ui-register-margin'>
                <label className="register-label">Password</label>
                <div className="register-password-group">
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

              <div className='ui-register-margin'>
                <label className="register-label">Confirm Password</label>
                <div className="register-password-group">
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

              <button className="register-btn" type="submit">
                <i className="bi bi-building me-2"></i> Register as Company Admin
              </button>

              <hr className="register-divider" />
              <div className="text-center mt-2" style={{ fontSize: '13px' }}>
                Already have an account? <Link to="/login" className="register-link" style={{ fontSize: '15px' }}>Sign in</Link>
              </div>
            </form>
          </div>
        ) : (
          <EmailVerificationPage
            setVerifyCode={setVerifyCode}
            verifyCode={verifyCode}
            sendVerifyEmail={() => sendVerifyEmail()}
            dealer={dealer}
          />
        )
      }

    </>
  );
};

export default DealerRegister; 
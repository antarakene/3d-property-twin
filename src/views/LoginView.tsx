import React, { useState } from 'react';
import '../styles/stitchScreens.css';

interface LoginViewProps {
  onNavigate: (tab: 'workspace' | 'request-access' | 'reset-password' | 'dashboard') => void;
  onLoginSuccess?: (email: string) => void;
}

type UXState = 'idle' | 'loading' | 'success' | 'error' | 'unauthorized' | 'pending' | 'sso' | 'forgot';

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('officer.verif@nagardrishti.gov.in');
  const [password, setPassword] = useState('SpatialVerified#2025');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [uxState, setUxState] = useState<UXState>('idle');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBannerDismissed(false);
    setUxState('loading');
    setTimeout(() => {
      setUxState('success');
      if (onLoginSuccess) {
        onLoginSuccess(email);
      }
      setTimeout(() => {
        onNavigate('workspace');
      }, 1000);
    }, 1200);
  };

  const handleTriggerUXState = (state: UXState) => {
    setBannerDismissed(false);
    if (state === 'sso') {
      setUxState('loading');
      setTimeout(() => {
        setUxState('sso');
      }, 600);
    } else {
      setUxState(state);
    }
  };

  const renderBannerContent = () => {
    if (bannerDismissed || uxState === 'idle') return null;

    let bannerClass = 'stitch-status-banner';
    let icon = 'info';
    let title = '';
    let msg = '';
    let spin = false;

    switch (uxState) {
      case 'loading':
        bannerClass += ' loading';
        icon = 'sync';
        spin = true;
        title = 'AUTHENTICATING';
        msg = 'Verifying cadastral credentials against Gov-Directory...';
        break;
      case 'success':
        bannerClass += ' success';
        icon = 'verified_user';
        title = 'SUCCESS: Authentication Verified';
        msg = '✓ Welcome back. Redirecting to your vertical GIS workspace...';
        break;
      case 'error':
        bannerClass += ' error';
        icon = 'error';
        title = 'ERROR: Unable to Sign In';
        msg = 'Invalid credentials. Please verify your municipal email and cryptographic key password.';
        break;
      case 'unauthorized':
        bannerClass += ' unauthorized';
        icon = 'gpp_bad';
        title = 'UNAUTHORIZED: Clearance Insufficient';
        msg = 'You do not have permission to access this vertical workspace. Please contact your District Cadastral Administrator.';
        break;
      case 'pending':
        bannerClass += ' pending';
        icon = 'hourglass_top';
        title = 'ACCOUNT PENDING REVIEW';
        msg = 'Your spatial operator access request has been logged and is awaiting municipal clearance (Token #ND-8491).';
        break;
      case 'sso':
        bannerClass += ' sso';
        icon = 'account_balance';
        title = 'JAN PARICHAY / NIC SSO HANDSHAKE';
        msg = 'Redirecting to National Informatics Centre Identity Gateway...';
        break;
      case 'forgot':
        bannerClass += ' unauthorized';
        icon = 'key';
        title = 'CREDENTIAL RESET PROTOCOL';
        msg = 'Password reset instructions have been forwarded to your designated nodal officer.';
        break;
    }

    return (
      <div className={bannerClass}>
        <span className={`material-symbols-outlined ${spin ? 'stitch-spin' : ''}`} style={{ fontSize: '20px' }}>
          {icon}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{title}</div>
          <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>{msg}</div>
        </div>
        <button
          type="button"
          onClick={() => setBannerDismissed(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
        </button>
      </div>
    );
  };

  return (
    <div className="stitch-screen-wrapper">
      <div className="stitch-container">
        {/* Brand Header */}
        <div className="stitch-brand-header">
          <div className="stitch-brand-title-row">
            <img
              src="/logo.svg"
              alt="NagarDrishti 3D Brand Logo"
              className="stitch-brand-logo"
            />
            <span className="stitch-brand-title">NAGARDRISHTI 3D</span>
          </div>
          <p className="stitch-brand-subtitle">
            AI-Assisted Vertical Property Mapping &amp; Verification Platform
          </p>
        </div>

        {/* Value Transformation Visual Banner */}
        <div className="stitch-transform-ribbon">
          <div className="stitch-pipeline-steps">
            <span className="stitch-pipeline-chip">
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--stitch-secondary)' }}>
                grid_4x4
              </span>
              2D Parcel
            </span>
            <span className="stitch-pipeline-arrow">→</span>
            <span className="stitch-pipeline-chip">
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--stitch-secondary)' }}>
                domain
              </span>
              3D Extrusion
            </span>
            <span className="stitch-pipeline-arrow">→</span>
            <span className="stitch-pipeline-chip">
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--stitch-secondary)' }}>
                layers
              </span>
              Floor Stack
            </span>
            <span className="stitch-pipeline-arrow">→</span>
            <span className="stitch-pipeline-chip">
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--stitch-secondary)' }}>
                crop_free
              </span>
              Unit Boundary
            </span>
            <span className="stitch-pipeline-arrow">→</span>
            <span className="stitch-pipeline-chip verified">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                verified
              </span>
              Verified
            </span>
          </div>
          <div className="stitch-ribbon-footer">
            <p style={{ fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)' }}>
              Transforming spatial data into structured, evidence-backed property records.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'var(--stitch-surface-container-high)',
                color: 'var(--stitch-on-surface-variant)',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                alignSelf: 'flex-start',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '12px', color: 'var(--stitch-secondary)' }}>
                gite
              </span>
              Secure • Role-Based • Evidence
            </div>
          </div>
        </div>

        {/* Dynamic Status Feedback Banner */}
        {renderBannerContent()}

        {/* Main Login Card */}
        <div className="stitch-card">
          <div className="stitch-card-header">
            <h2>LOGIN TO YOUR ACCOUNT</h2>
            <p>Welcome back. Access your NagarDrishti workspace.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Email Field */}
            <div className="stitch-field">
              <label className="stitch-label" htmlFor="emailInput">
                Email Address
              </label>
              <div className="stitch-input-wrap">
                <span className="material-symbols-outlined stitch-input-icon">alternate_email</span>
                <input
                  id="emailInput"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer.verif@nagardrishti.gov.in"
                  className="stitch-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="stitch-field">
              <label className="stitch-label" htmlFor="passwordInput">
                Password
              </label>
              <div className="stitch-input-wrap">
                <span className="material-symbols-outlined stitch-input-icon">lock</span>
                <input
                  id="passwordInput"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="stitch-input mono"
                />
                <button
                  type="button"
                  className="stitch-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title="Toggle password visibility"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--stitch-secondary)' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)' }}>
                  Remember Me
                </span>
              </label>
              <button
                type="button"
                onClick={() => onNavigate('reset-password')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: 'var(--stitch-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Primary Action CTA */}
            <button id="signInSubmitBtn" type="submit" className="stitch-btn-primary" disabled={uxState === 'loading'}>
              {uxState === 'loading' ? (
                <>
                  <span className="material-symbols-outlined stitch-spin" style={{ fontSize: '18px' }}>
                    progress_activity
                  </span>
                  <span>Signing you in...</span>
                </>
              ) : (
                <span>SIGN IN</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.25rem 0' }}>
            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--stitch-surface-container-high)' }} />
            <span
              style={{
                position: 'absolute',
                backgroundColor: 'var(--stitch-surface-container-lowest)',
                padding: '0 0.5rem',
                fontFamily: 'var(--stitch-font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--stitch-outline)',
                letterSpacing: '0.04em',
              }}
            >
              OR
            </span>
          </div>

          {/* Institutional SSO */}
          <button
            type="button"
            className="stitch-btn-secondary"
            onClick={() => handleTriggerUXState('sso')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--stitch-secondary)' }}>
              assured_workload
            </span>
            <span>Continue with Google / Gov-SSO</span>
            <span
              style={{
                backgroundColor: 'var(--stitch-surface-container-high)',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                color: 'var(--stitch-on-surface-variant)',
                fontFamily: 'var(--stitch-font-mono)',
                textTransform: 'uppercase',
              }}
            >
              NIC / JanParichay
            </span>
          </button>

          {/* Request Access Link */}
          <div style={{ textAlign: 'center', paddingTop: '0.25rem' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--stitch-on-surface-variant)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('request-access')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--stitch-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginLeft: '4px',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                REQUEST ACCESS
              </button>
            </p>
          </div>
        </div>

        {/* Interactive UX States Showcase Panel */}
        <div className="stitch-ux-showcase">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--stitch-secondary)', fontSize: '18px' }}>
                science
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                UX State Reviewer Preview
              </span>
            </div>
            <span style={{ fontFamily: 'var(--stitch-font-mono)', fontSize: '0.6875rem', color: 'var(--stitch-on-surface-variant)' }}>
              Click pills below to trigger
            </span>
          </div>

          <div className="stitch-ux-pills">
            <button
              type="button"
              className="stitch-ux-pill"
              onClick={() => handleTriggerUXState('loading')}
            >
              <span className="stitch-ux-dot" style={{ backgroundColor: 'var(--stitch-on-primary-container)' }} />
              LOADING
            </button>
            <button
              type="button"
              className="stitch-ux-pill"
              style={{ color: 'var(--stitch-secondary)' }}
              onClick={() => handleTriggerUXState('success')}
            >
              <span className="stitch-ux-dot" style={{ backgroundColor: 'var(--stitch-secondary)' }} />
              SUCCESS
            </button>
            <button
              type="button"
              className="stitch-ux-pill"
              style={{ color: 'var(--stitch-error)' }}
              onClick={() => handleTriggerUXState('error')}
            >
              <span className="stitch-ux-dot" style={{ backgroundColor: 'var(--stitch-error)' }} />
              ERROR
            </button>
            <button
              type="button"
              className="stitch-ux-pill"
              onClick={() => handleTriggerUXState('unauthorized')}
            >
              <span className="stitch-ux-dot" style={{ backgroundColor: 'var(--stitch-outline)' }} />
              UNAUTHORIZED
            </button>
            <button
              type="button"
              className="stitch-ux-pill"
              onClick={() => handleTriggerUXState('pending')}
            >
              <span className="stitch-ux-dot" style={{ backgroundColor: 'var(--stitch-secondary-fixed-dim)' }} />
              ACCOUNT PENDING
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

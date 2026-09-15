import React, { useState, useEffect } from 'react';
import '../styles/stitchScreens.css';

interface ResetPasswordViewProps {
  onNavigate: (tab: 'login' | 'workspace' | 'dashboard') => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('officer@spatial.gov.in');
  const [submitted, setSubmitted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(48);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, secondsRemaining]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSecondsRemaining(48);
    setTimerActive(true);
  };

  const handleResend = () => {
    setSecondsRemaining(48);
    setTimerActive(true);
  };

  return (
    <div className="stitch-screen-wrapper">
      <div className="stitch-container">
        {/* Municipal Geospatial Crest Header Accent */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--stitch-secondary)', fontSize: '22px' }}>
              apartment
            </span>
            <span style={{ fontFamily: 'var(--stitch-font-headline)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--stitch-primary)', letterSpacing: '-0.01em' }}>
              NAGARDRISHTI 3D
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              backgroundColor: 'var(--stitch-surface-container-high)',
              borderRadius: '9999px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--stitch-secondary)' }} />
            <span style={{ fontFamily: 'var(--stitch-font-mono)', fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)', textTransform: 'uppercase' }}>
              Auth v4.2
            </span>
          </div>
        </div>

        {/* Screen Identity Header */}
        <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--stitch-secondary)', marginBottom: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock_reset</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Authentication Recovery
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--stitch-font-headline)',
              fontSize: '1.5rem',
              lineHeight: '2rem',
              color: 'var(--stitch-primary)',
              fontWeight: 700,
            }}
          >
            Reset Your Password
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--stitch-on-surface-variant)', marginTop: '4px', lineHeight: '1.4' }}>
            Enter your registered email address and we will send you instructions to reset your password.
          </p>
        </div>

        {/* Interactive Form Container */}
        <div
          style={{
            backgroundColor: 'var(--stitch-surface-container-lowest)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            marginBottom: '1.5rem',
          }}
        >
          {/* Visual Security Glyph & Cadastral Badge */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '0.75rem',
                backgroundColor: 'var(--stitch-surface-container)',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--stitch-primary)', fontSize: '32px' }}>
                shield_person
              </span>
              <div
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  backgroundColor: 'var(--stitch-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                <span className="material-symbols-outlined" style={{ color: '#ffffff', fontSize: '14px' }}>
                  key
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontFamily: 'var(--stitch-font-mono)', fontSize: '0.6875rem', color: 'var(--stitch-on-surface-variant)' }}>
                NODE: SEC-CADASTRE-7
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--stitch-secondary)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px', fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>verified_user</span>
                SHA-256 Vault
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Input Field */}
            <div className="stitch-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="stitch-label" htmlFor="recovery-email">
                  Registered Official Email
                </label>
                <span style={{ fontSize: '0.6875rem', color: 'var(--stitch-on-surface-variant)', fontFamily: 'var(--stitch-font-mono)' }}>
                  NIC / Spatial Domain
                </span>
              </div>
              <div className="stitch-input-wrap">
                <span className="material-symbols-outlined stitch-input-icon">badge</span>
                <input
                  id="recovery-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@spatial.gov.in"
                  className="stitch-input mono"
                />
                <div style={{ position: 'absolute', right: '0.75rem', display: 'flex', alignItems: 'center', color: 'var(--stitch-secondary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)' }}>
                Institutional ID authorized under State Urban Cadastral System.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
              <button type="submit" className="stitch-btn-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>outgoing_mail</span>
                <span>SEND RESET LINK</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="stitch-btn-secondary"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                <span>BACK TO LOGIN</span>
              </button>
            </div>
          </form>
        </div>

        {/* Active Success State Banner */}
        {submitted && (
          <div
            style={{
              borderRadius: '0.75rem',
              padding: '1rem',
              backgroundColor: 'var(--stitch-secondary-container)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: 'var(--stitch-secondary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--stitch-on-secondary-container)' }}>
                    Reset Link Sent
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--stitch-font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--stitch-on-secondary-container)',
                      padding: '2px 8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: '9999px',
                      fontWeight: 600,
                    }}
                  >
                    ACTIVE
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--stitch-on-secondary-container)', marginTop: '4px', lineHeight: '1.4' }}>
                  Check your email (<strong style={{ fontFamily: 'var(--stitch-font-mono)' }}>{email}</strong>) for password reset instructions. The link is valid for 15 minutes.
                </p>

                {/* Dynamic Resend Timer Row */}
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--stitch-on-secondary-container)', opacity: 0.9 }}>
                    Didn&apos;t receive the email?
                  </span>
                  <button
                    type="button"
                    disabled={timerActive && secondsRemaining > 0}
                    onClick={handleResend}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--stitch-secondary)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: timerActive && secondsRemaining > 0 ? 'not-allowed' : 'pointer',
                      opacity: timerActive && secondsRemaining > 0 ? 0.75 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                    <span>
                      {timerActive && secondsRemaining > 0 ? `Resend in ${secondsRemaining}s` : 'Resend Now'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Visual Stamp / Image Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--stitch-surface-container-lowest)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.375rem',
                backgroundColor: 'rgba(0, 106, 99, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--stitch-secondary)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                polyline
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--stitch-on-surface-variant)', textTransform: 'uppercase' }}>
                Clearance
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--stitch-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                GIS Level III
              </span>
              <span style={{ fontFamily: 'var(--stitch-font-mono)', fontSize: '0.6875rem', color: 'var(--stitch-secondary)' }}>
                Active Cert
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--stitch-surface-container-lowest)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.375rem',
                backgroundColor: 'rgba(11, 31, 58, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--stitch-primary)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                token
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--stitch-on-surface-variant)', textTransform: 'uppercase' }}>
                Audit Ledger
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--stitch-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Encrypted Key
              </span>
              <span style={{ fontFamily: 'var(--stitch-font-mono)', fontSize: '0.6875rem', color: 'var(--stitch-secondary)' }}>
                Token Gen: OK
              </span>
            </div>
          </div>
        </div>

        {/* Trust Notice & Institutional Legal Grounding */}
        <div
          style={{
            borderRadius: '0.75rem',
            padding: '1rem',
            backgroundColor: 'var(--stitch-surface-container-low)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--stitch-on-surface)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--stitch-secondary)', fontSize: '18px' }}>
              verified
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Official Cadastral Security Notice</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)', lineHeight: '1.4' }}>
            For security reasons, password reset links expire after 15 minutes and can only be used once. If your account is locked by an administrator, please contact the State Geospatial Helpdesk at{' '}
            <a
              href="mailto:support@nagardrishti.gov.in"
              style={{
                fontFamily: 'var(--stitch-font-mono)',
                color: 'var(--stitch-secondary)',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              support@nagardrishti.gov.in
            </a>.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.25rem',
              marginTop: '0.25rem',
              fontFamily: 'var(--stitch-font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--stitch-on-surface-variant)',
            }}
          >
            <span>REF: SEC-PWD-REV-2024</span>
            <span>GEO-ENC-PKI-2048</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import '../styles/stitchScreens.css';

interface RequestAccessViewProps {
  onNavigate: (tab: 'login' | 'workspace' | 'dashboard') => void;
}

type RoleType = 'surveyor' | 'architect' | 'ulb' | 'citizen';

export const RequestAccessView: React.FC<RequestAccessViewProps> = ({ onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType>('surveyor');
  const [employeeId, setEmployeeId] = useState('');
  const [legalAck, setLegalAck] = useState(false);
  const [showPendingBanner, setShowPendingBanner] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPendingBanner(true);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="stitch-screen-wrapper">
      <div className="stitch-container">
        {/* Account Pending State Alert Preview */}
        {showPendingBanner && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: 'var(--stitch-secondary-container)',
              color: 'var(--stitch-on-secondary-container)',
              borderRadius: '0.75rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              transition: 'all 0.3s ease',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                color: 'var(--stitch-secondary)',
                fontSize: '1.5rem',
                fontVariationSettings: "'FILL' 1",
                marginTop: '2px',
              }}
            >
              hourglass_top
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.01em' }}>
                  ACCOUNT PENDING
                </p>
                <span
                  style={{
                    fontFamily: 'var(--stitch-font-mono)',
                    fontSize: '0.75rem',
                    backgroundColor: 'var(--stitch-surface-container-lowest)',
                    color: 'var(--stitch-secondary)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  APP-REF #ND3D-8821
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', marginTop: '4px', lineHeight: '1.4' }}>
                Your access request has been securely recorded and is currently under review by regional cadastral administrators. Spatial credentials will be dispatched via verified municipal channel.
              </p>
              {submitted && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="stitch-btn-secondary"
                    style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    Return to Sign In
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowPendingBanner(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                padding: '4px',
                borderRadius: '50%',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
        )}

        {/* Header Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: 'var(--stitch-surface-container-high)',
              color: 'var(--stitch-on-surface-variant)',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '16px', color: 'var(--stitch-secondary)', fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
            <span>National Spatial Infrastructure Node</span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--stitch-font-headline)',
              fontSize: '1.5rem',
              lineHeight: '2rem',
              color: 'var(--stitch-on-surface)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
            }}
          >
            Request Access to NagarDrishti 3D
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--stitch-on-surface-variant)', marginTop: '4px' }}>
            Create an account request to access the appropriate vertical property workspace.
          </p>
        </div>

        {/* Main Technical Registration Card */}
        <div
          style={{
            backgroundColor: 'var(--stitch-surface-container-lowest)',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            marginBottom: '1rem',
          }}
        >
          {/* Cadastral Trust Header */}
          <div
            style={{
              backgroundColor: 'var(--stitch-primary-container)',
              color: 'var(--stitch-on-primary)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--stitch-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--stitch-secondary-fixed)',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>
                  domain_verification
                </span>
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Authorized Spatial Personnel Registration
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--stitch-font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--stitch-on-primary-container)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Vertical Urban Registry • Tier 1
                </p>
              </div>
            </div>
            <span
              className="material-symbols-outlined"
              style={{ color: 'var(--stitch-secondary-fixed)', fontSize: '1.5rem', flexShrink: 0 }}
              title="Cryptographically Audited Registry"
            >
              security
            </span>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full Name */}
            <div className="stitch-field">
              <label className="stitch-label" htmlFor="fullName">
                Full Name
              </label>
              <div className="stitch-input-wrap">
                <span className="material-symbols-outlined stitch-input-icon">person</span>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Er. Priya Natarajan"
                  className="stitch-input"
                />
              </div>
            </div>

            {/* Official Email */}
            <div className="stitch-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="stitch-label" htmlFor="email">
                  Official Email Address
                </label>
                <span style={{ fontSize: '0.6875rem', color: 'var(--stitch-secondary)', fontWeight: 600 }}>
                  Govt / Institutional
                </span>
              </div>
              <div className="stitch-input-wrap">
                <span className="material-symbols-outlined stitch-input-icon">mail</span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@department.gov.in / agency.org"
                  className="stitch-input"
                />
              </div>
              <p style={{ fontFamily: 'var(--stitch-font-mono)', fontSize: '0.6875rem', color: 'var(--stitch-outline)' }}>
                Preferred domains: .gov.in, .nic.in, .org, or official municipal portals
              </p>
            </div>

            {/* Organization / Department */}
            <div className="stitch-field">
              <label className="stitch-label" htmlFor="organization">
                Organization / Department
              </label>
              <div className="stitch-input-wrap">
                <span className="material-symbols-outlined stitch-input-icon">corporate_fare</span>
                <input
                  id="organization"
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g., Bengaluru Urban Development Authority (BDA)"
                  className="stitch-input"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="stitch-field">
              <label className="stitch-label">
                Select Role &amp; Access Scope
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                {/* Role A: Surveyor */}
                <label
                  onClick={() => setSelectedRole('surveyor')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: selectedRole === 'surveyor' ? 'rgba(153, 239, 229, 0.2)' : 'var(--stitch-surface-container-low)',
                    border: selectedRole === 'surveyor' ? '1px solid var(--stitch-secondary)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: selectedRole === 'surveyor' ? 'var(--stitch-secondary)' : 'var(--stitch-surface-container-highest)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '0.75rem',
                      flexShrink: 0,
                    }}
                  >
                    {selectedRole === 'surveyor' && (
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        Surveyor / Verification Officer
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--stitch-font-mono)',
                          fontSize: '0.6875rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--stitch-surface-container-high)',
                          color: 'var(--stitch-on-surface-variant)',
                        }}
                      >
                        L2 Audit
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)', marginTop: '2px' }}>
                      Cadastral verification, field GIS audit, volumetric tags
                    </p>
                  </div>
                </label>

                {/* Role B: Architect */}
                <label
                  onClick={() => setSelectedRole('architect')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: selectedRole === 'architect' ? 'rgba(153, 239, 229, 0.2)' : 'var(--stitch-surface-container-low)',
                    border: selectedRole === 'architect' ? '1px solid var(--stitch-secondary)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: selectedRole === 'architect' ? 'var(--stitch-secondary)' : 'var(--stitch-surface-container-highest)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '0.75rem',
                      flexShrink: 0,
                    }}
                  >
                    {selectedRole === 'architect' && (
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        Architect / Planner
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--stitch-font-mono)',
                          fontSize: '0.6875rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--stitch-surface-container-high)',
                          color: 'var(--stitch-on-surface-variant)',
                        }}
                      >
                        BIM Import
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)', marginTop: '2px' }}>
                      3D envelope simulation, FAR envelope, spatial overlay
                    </p>
                  </div>
                </label>

                {/* Role C: ULB / Admin */}
                <label
                  onClick={() => setSelectedRole('ulb')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: selectedRole === 'ulb' ? 'rgba(153, 239, 229, 0.2)' : 'var(--stitch-surface-container-low)',
                    border: selectedRole === 'ulb' ? '1px solid var(--stitch-secondary)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: selectedRole === 'ulb' ? 'var(--stitch-secondary)' : 'var(--stitch-surface-container-highest)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '0.75rem',
                      flexShrink: 0,
                    }}
                  >
                    {selectedRole === 'ulb' && (
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        ULB / Administrator
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--stitch-font-mono)',
                          fontSize: '0.6875rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--stitch-surface-container-high)',
                          color: 'var(--stitch-on-surface-variant)',
                        }}
                      >
                        Auth Admin
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)', marginTop: '2px' }}>
                      Municipal sanction, zoning master-control, nodal sign-off
                    </p>
                  </div>
                </label>

                {/* Role D: Citizen */}
                <label
                  onClick={() => setSelectedRole('citizen')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: selectedRole === 'citizen' ? 'rgba(153, 239, 229, 0.2)' : 'var(--stitch-surface-container-low)',
                    border: selectedRole === 'citizen' ? '1px solid var(--stitch-secondary)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: selectedRole === 'citizen' ? 'var(--stitch-secondary)' : 'var(--stitch-surface-container-highest)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '0.75rem',
                      flexShrink: 0,
                    }}
                  >
                    {selectedRole === 'citizen' && (
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        Citizen / Property Buyer
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--stitch-font-mono)',
                          fontSize: '0.6875rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--stitch-surface-container-high)',
                          color: 'var(--stitch-on-surface-variant)',
                        }}
                      >
                        Public Tier
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)', marginTop: '2px' }}>
                      Public volumetric index, title transparency check
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Organization ID / Employee Reference */}
            <div className="stitch-field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="stitch-label" htmlFor="employeeId">
                  Organization ID / Employee Reference <span style={{ color: 'var(--stitch-outline)', fontWeight: 'normal' }}>(Optional)</span>
                </label>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--stitch-secondary-fixed)',
                    color: 'var(--stitch-on-secondary-fixed)',
                    fontWeight: 600,
                  }}
                >
                  Recommended for Govt Officers
                </span>
              </div>
              <div className="stitch-input-wrap">
                <span className="material-symbols-outlined stitch-input-icon">badge</span>
                <input
                  id="employeeId"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g., KA-BDA-SURV-2024-098"
                  className="stitch-input mono"
                />
              </div>
            </div>

            {/* Authorization Acknowledgment Checkbox */}
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--stitch-surface-container-low)',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  id="legalAck"
                  type="checkbox"
                  required
                  checked={legalAck}
                  onChange={(e) => setLegalAck(e.target.checked)}
                  style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: 'var(--stitch-secondary)', flexShrink: 0 }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--stitch-on-surface)', lineHeight: '1.4' }}>
                  I understand that NagarDrishti provides preliminary spatial intelligence and access may require authorization from the designated Urban Local Body nodal officer.
                </span>
              </label>
            </div>

            {/* Primary Action CTA */}
            <div style={{ paddingTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button type="submit" className="stitch-btn-primary">
                <span>REQUEST ACCESS</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  arrow_forward
                </span>
              </button>

              {/* Sign In Navigation Link */}
              <div style={{ textAlign: 'center', paddingTop: '0.25rem' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--stitch-on-surface-variant)' }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
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
                    SIGN IN
                  </button>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Bottom Regulatory Review Badge & Interactive Preview Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--stitch-surface-container-high)',
              borderRadius: '0.5rem',
              color: 'var(--stitch-on-surface-variant)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--stitch-secondary)', fontSize: '1.5rem', flexShrink: 0 }}>
                schedule
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--stitch-on-surface)' }}>
                  Account Review Timeline
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)' }}>
                  Applications verified by regional cadastral administrators within 1-2 business days.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setShowPendingBanner(!showPendingBanner);
                if (!showPendingBanner) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '4px',
                backgroundColor: 'var(--stitch-surface-container)',
                color: 'var(--stitch-on-surface-variant)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
              <span>Preview &ldquo;Account Pending&rdquo; Notification</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import type { UserRole } from '../types/cadastre';
import '../styles/stitchScreens.css';

interface SelectWorkspaceViewProps {
  currentRole: UserRole;
  onSelectRoleAndNavigate: (role: UserRole, targetTab: 'dashboard' | 'city3d' | 'registry' | 'verification' | 'discrepancies') => void;
  onNavigate: (tab: 'login' | 'dashboard') => void;
  userEmail?: string;
  pendingTasksCount?: number;
}

type SelectedRoleKey = 'surveyor' | 'architect' | 'admin' | 'citizen';

export const SelectWorkspaceView: React.FC<SelectWorkspaceViewProps> = ({
  currentRole,
  onSelectRoleAndNavigate,
  onNavigate,
  userEmail = 'arun.sharma@spatial.gov.in',
  pendingTasksCount = 14,
}) => {
  // Map initial role to key
  const initialKey: SelectedRoleKey =
    currentRole === 'surveyor'
      ? 'surveyor'
      : currentRole === 'municipal_officer'
      ? 'admin'
      : currentRole === 'admin'
      ? 'admin'
      : 'citizen';

  const [selectedKey, setSelectedKey] = useState<SelectedRoleKey>(initialKey);

  const handleEnterWorkspace = (key: SelectedRoleKey) => {
    switch (key) {
      case 'surveyor':
        onSelectRoleAndNavigate('surveyor', 'verification');
        break;
      case 'architect':
        onSelectRoleAndNavigate('municipal_officer', 'dashboard');
        break;
      case 'admin':
        onSelectRoleAndNavigate('admin', 'dashboard');
        break;
      case 'citizen':
        onSelectRoleAndNavigate('public_demo', 'registry');
        break;
    }
  };

  return (
    <div className="stitch-screen-wrapper">
      <div className="stitch-container">
        {/* Header Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              alignSelf: 'flex-start',
              padding: '2px 10px',
              borderRadius: '9999px',
              backgroundColor: 'var(--stitch-secondary-container)',
              color: 'var(--stitch-on-secondary-container)',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span style={{ fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
              National Land Record Modernization
            </span>
          </div>

          <div>
            <h1
              style={{
                fontFamily: 'var(--stitch-font-headline)',
                fontSize: '1.5rem',
                lineHeight: '2rem',
                color: 'var(--stitch-on-surface)',
                letterSpacing: '-0.015em',
                fontWeight: 700,
              }}
            >
              Welcome to NagarDrishti 3D
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--stitch-on-surface-variant)', marginTop: '2px' }}>
              Select your operational workspace to continue
            </p>
          </div>

          {/* Verified User Context Ribbon */}
          <div
            style={{
              marginTop: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              backgroundColor: 'var(--stitch-surface-container-low)',
              borderRadius: '0.75rem',
              padding: '0.5rem 0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <span
                className="material-symbols-outlined"
                style={{ color: 'var(--stitch-secondary)', fontSize: '18px', flexShrink: 0, fontVariationSettings: "'FILL' 1" }}
              >
                shield_person
              </span>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '4px 8px',
                  color: 'var(--stitch-on-surface-variant)',
                  fontFamily: 'var(--stitch-font-mono)',
                  fontSize: '0.75rem',
                }}
              >
                <span style={{ color: 'var(--stitch-on-surface)', fontWeight: 600 }}>{userEmail}</span>
                <span style={{ color: 'var(--stitch-outline-variant)' }}>•</span>
                <span style={{ color: 'var(--stitch-secondary)', fontWeight: 600 }}>Verified Session</span>
                <span style={{ color: 'var(--stitch-outline-variant)' }}>•</span>
                <span>Node: Central Cadastre</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('login')}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                color: 'var(--stitch-on-surface-variant)',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--stitch-surface-container)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Role Selection Matrix */}
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* 1. SURVEYOR / VERIFICATION OFFICER */}
          <div
            className={`stitch-role-card ${selectedKey === 'surveyor' ? 'active' : ''}`}
            onClick={() => setSelectedKey('surveyor')}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  className="stitch-role-icon"
                  style={{ backgroundColor: 'var(--stitch-secondary)', color: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>my_location</span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontFamily: 'var(--stitch-font-headline)', fontSize: '1rem', fontWeight: 700, color: 'var(--stitch-on-surface)' }}>
                      SURVEYOR
                    </span>
                    <span style={{ color: 'var(--stitch-outline)', fontSize: '0.875rem' }}>/</span>
                    <span style={{ fontFamily: 'var(--stitch-font-headline)', fontSize: '1rem', fontWeight: 700, color: 'var(--stitch-on-surface)' }}>
                      OFFICER
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(0, 106, 99, 0.1)',
                        color: 'var(--stitch-secondary)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>
                        security
                      </span>
                      Field &amp; Cadastre Authorized
                    </span>
                  </div>
                </div>
              </div>

              {selectedKey === 'surveyor' && (
                <div className="stitch-selection-check">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--stitch-on-surface-variant)', marginBottom: '1rem', lineHeight: '1.4' }}>
              Review property records, evidence packages, drone LIDAR scans, and vertical 3D verification requests in real-time.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--stitch-font-mono)', fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--stitch-secondary)' }}>layers</span>
                <span>{pendingTasksCount} Pending Tasks Assigned</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnterWorkspace('surveyor');
                }}
                className={selectedKey === 'surveyor' ? 'stitch-btn-primary' : 'stitch-btn-secondary'}
                style={{
                  backgroundColor: selectedKey === 'surveyor' ? 'var(--stitch-secondary)' : undefined,
                  color: selectedKey === 'surveyor' ? '#ffffff' : undefined,
                }}
              >
                <span>ENTER VERIFICATION WORKSPACE</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {/* 2. ARCHITECT / PLANNER */}
          <div
            className={`stitch-role-card ${selectedKey === 'architect' ? 'active' : ''}`}
            onClick={() => setSelectedKey('architect')}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  className="stitch-role-icon"
                  style={{ backgroundColor: 'var(--stitch-primary-container)', color: '#ffffff' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>view_in_ar</span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontFamily: 'var(--stitch-font-headline)', fontSize: '1rem', fontWeight: 700, color: 'var(--stitch-on-surface)' }}>
                      MUNICIPAL OFFICER
                    </span>
                    <span style={{ color: 'var(--stitch-outline)', fontSize: '0.875rem' }}>/</span>
                    <span style={{ fontFamily: 'var(--stitch-font-headline)', fontSize: '1rem', fontWeight: 700, color: 'var(--stitch-on-surface)' }}>
                      PLANNER
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--stitch-surface-container-high)',
                        color: 'var(--stitch-on-surface-variant)',
                        fontSize: '0.6875rem',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>account_balance</span>
                      Town Planning &amp; Adjudication
                    </span>
                  </div>
                </div>
              </div>

              {selectedKey === 'architect' && (
                <div className="stitch-selection-check">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--stitch-on-surface-variant)', marginBottom: '1rem', lineHeight: '1.4' }}>
              Inspect building violations, title adjudication, satellite discrepancy signals, and statutory cadastre approvals.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--stitch-font-mono)', fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>gavel</span>
                <span>Statutory Authority Tier Active</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnterWorkspace('architect');
                }}
                className={selectedKey === 'architect' ? 'stitch-btn-primary' : 'stitch-btn-secondary'}
                style={{
                  backgroundColor: selectedKey === 'architect' ? 'var(--stitch-secondary)' : undefined,
                  color: selectedKey === 'architect' ? '#ffffff' : undefined,
                }}
              >
                <span>ENTER ADJUDICATION WORKSPACE</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {selectedKey === 'architect' ? 'arrow_forward' : 'east'}
                </span>
              </button>
            </div>
          </div>

          {/* 3. ULB / ADMINISTRATOR */}
          <div
            className={`stitch-role-card ${selectedKey === 'admin' ? 'active' : ''}`}
            onClick={() => setSelectedKey('admin')}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  className="stitch-role-icon"
                  style={{ backgroundColor: 'var(--stitch-surface-container-high)', color: 'var(--stitch-on-surface)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>admin_panel_settings</span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontFamily: 'var(--stitch-font-headline)', fontSize: '1rem', fontWeight: 700, color: 'var(--stitch-on-surface)' }}>
                      SYSTEM
                    </span>
                    <span style={{ color: 'var(--stitch-outline)', fontSize: '0.875rem' }}>/</span>
                    <span style={{ fontFamily: 'var(--stitch-font-headline)', fontSize: '1rem', fontWeight: 700, color: 'var(--stitch-on-surface)' }}>
                      ADMINISTRATOR
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--stitch-surface-container-high)',
                        color: 'var(--stitch-on-surface-variant)',
                        fontSize: '0.6875rem',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>database</span>
                      Spatial DB &amp; Master Governance
                    </span>
                  </div>
                </div>
              </div>

              {selectedKey === 'admin' && (
                <div className="stitch-selection-check">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--stitch-on-surface-variant)', marginBottom: '1rem', lineHeight: '1.4' }}>
              Full platform control, PostGIS database health monitoring, spatial schema exports, and cryptographically signed audit logs.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--stitch-font-mono)', fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>analytics</span>
                <span>PostgreSQL / PostGIS Cockpit</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnterWorkspace('admin');
                }}
                className={selectedKey === 'admin' ? 'stitch-btn-primary' : 'stitch-btn-secondary'}
                style={{
                  backgroundColor: selectedKey === 'admin' ? 'var(--stitch-secondary)' : undefined,
                  color: selectedKey === 'admin' ? '#ffffff' : undefined,
                }}
              >
                <span>ENTER SYSTEM ADMIN WORKSPACE</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {selectedKey === 'admin' ? 'arrow_forward' : 'east'}
                </span>
              </button>
            </div>
          </div>

          {/* 4. CITIZEN PORTAL */}
          <div
            className={`stitch-role-card ${selectedKey === 'citizen' ? 'active' : ''}`}
            onClick={() => setSelectedKey('citizen')}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  className="stitch-role-icon"
                  style={{ backgroundColor: 'var(--stitch-surface-container-high)', color: 'var(--stitch-on-surface)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>real_estate_agent</span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontFamily: 'var(--stitch-font-headline)', fontSize: '1rem', fontWeight: 700, color: 'var(--stitch-on-surface)' }}>
                      CITIZEN PORTAL
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--stitch-surface-container-high)',
                        color: 'var(--stitch-on-surface-variant)',
                        fontSize: '0.6875rem',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>public</span>
                      Public Registry
                    </span>
                  </div>
                </div>
              </div>

              {selectedKey === 'citizen' && (
                <div className="stitch-selection-check">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--stitch-on-surface-variant)', marginBottom: '1rem', lineHeight: '1.4' }}>
              View available public property blueprints, title validation state, floor spatial extent, and vertical ownership e-Certificates.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--stitch-font-mono)', fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock_open</span>
                <span>Public Access Tier</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnterWorkspace('citizen');
                }}
                className={selectedKey === 'citizen' ? 'stitch-btn-primary' : 'stitch-btn-secondary'}
                style={{
                  backgroundColor: selectedKey === 'citizen' ? 'var(--stitch-secondary)' : undefined,
                  color: selectedKey === 'citizen' ? '#ffffff' : undefined,
                }}
              >
                <span>VIEW PROPERTY INFORMATION</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {selectedKey === 'citizen' ? 'arrow_forward' : 'east'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimers & Security Footnote */}
        <div style={{ marginTop: '2rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--stitch-on-surface-variant)', fontSize: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--stitch-secondary)' }}>
              verified_user
            </span>
            <span>State Urban Geospatial Security Policy • ISO 19152 LADM Compliant</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--stitch-on-surface-variant)', maxWidth: '32rem', lineHeight: '1.4' }}>
            Workspace access levels are cryptographically signed and tracked by Central Land Records Governance. All transactions, LIDAR overlays, and edits are strictly audited.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem', fontSize: '0.75rem' }}>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--stitch-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'underline',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>switch_account</span>
              <span>Switch Account</span>
            </button>
            <span style={{ color: 'var(--stitch-outline-variant)' }}>•</span>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--stitch-on-surface-variant)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock_reset</span>
              <span>Revoke Session</span>
            </button>
            <span style={{ color: 'var(--stitch-outline-variant)' }}>•</span>
            <a
              href="mailto:support@nagardrishti.gov.in"
              style={{ color: 'var(--stitch-on-surface-variant)', textDecoration: 'underline' }}
            >
              Support Desk
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

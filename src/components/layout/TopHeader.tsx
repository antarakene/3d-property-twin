import React from 'react';
import type { UserRole } from '../../types/cadastre';

interface TopHeaderProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  activeAlertsCount?: number;
  onOpenAlerts?: () => void;
  userEmail?: string;
  onLogout?: () => void;
}

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; badge: string; icon: string; color: string; bg: string; border: string; desc: string }
> = {
  public_demo: {
    label: 'Public / Demo Explorer',
    badge: 'Citizen Portal',
    icon: 'public',
    color: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.1)',
    border: 'rgba(2, 132, 199, 0.3)',
    desc: 'Public Discovery & 3D Cadastral Search (Read-Only)',
  },
  surveyor: {
    label: 'Authorized Surveyor',
    badge: 'Field Surveyor Mode',
    icon: 'straighten',
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.1)',
    border: 'rgba(217, 119, 6, 0.3)',
    desc: 'Field LiDAR Entry, Elevation Surveys & Candidate VSU Creation',
  },
  municipal_officer: {
    label: 'Municipal Revenue Officer',
    badge: 'Revenue Authority Mode',
    icon: 'account_balance',
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.1)',
    border: 'rgba(124, 58, 237, 0.3)',
    desc: 'Statutory Verification, Title Adjudication & Bylaw Enforcement',
  },
  admin: {
    label: 'System Administrator',
    badge: 'System Admin Console',
    icon: 'admin_panel_settings',
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.1)',
    border: 'rgba(5, 150, 105, 0.3)',
    desc: 'Master Infrastructure, PostGIS Database Health & Audit Trail Control',
  },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentRole,
  activeAlertsCount = 0,
  onOpenAlerts,
  userEmail,
  onLogout,
}) => {
  const roleMeta = ROLE_CONFIG[currentRole] || ROLE_CONFIG.public_demo;

  return (
    <header className="top-header">
      <div className="header-brand">
        <div className="brand-emblem">ND</div>
        <div className="brand-text">
          <div className="brand-title-row">
            <span className="brand-title">NAGARDRISHTI 3D</span>
            <span
              className="brand-tag"
              style={{
                background: 'rgba(2, 132, 199, 0.18)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                fontWeight: 700,
                fontSize: '9px',
                letterSpacing: '0.4px',
              }}
            >
              SIH26011 • Space Tech
            </span>
          </div>
          <span className="brand-subtitle">
            3D ULPIN & Vertical Cadastre • Maharashtra Urban Demonstration Zone (Zone 4)
          </span>
        </div>
      </div>

      <div className="header-actions">
        {/* Dynamic Role Capability Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: roleMeta.bg,
            border: `1px solid ${roleMeta.border}`,
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
          }}
          title={roleMeta.desc}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: roleMeta.color }}>
            {roleMeta.icon}
          </span>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: roleMeta.color, fontFamily: 'var(--font-display)' }}>
              {roleMeta.badge}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>
              {roleMeta.desc}
            </div>
          </div>
        </div>

        {activeAlertsCount > 0 && (
          <button
            onClick={onOpenAlerts}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--color-error-container)',
              color: 'var(--color-error)',
              border: '1px solid rgba(186, 26, 26, 0.3)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
              warning
            </span>
            <span>{activeAlertsCount} Discrepancy Signals</span>
          </button>
        )}

        {/* Authenticated Active Role Display (Role change disabled after login) */}
        <div
          className="role-authenticated-badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            border: `1px solid ${roleMeta.border}`,
            background: 'var(--color-surface-container-low)',
            padding: '5px 11px',
            borderRadius: 'var(--radius-sm)',
          }}
          title={`Authenticated: ${userEmail || 'User'} (${roleMeta.label}) - Role changes locked during active session`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: roleMeta.color }}>
            {roleMeta.icon}
          </span>
          <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--color-on-surface)' }}>
            {roleMeta.label}
          </span>
          {userEmail && (
            <span
              style={{
                fontSize: '10px',
                color: 'var(--color-outline)',
                fontFamily: 'var(--font-mono)',
                maxWidth: '140px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {userEmail}
            </span>
          )}
          <span
            style={{
              fontSize: '8px',
              padding: '1px 5px',
              borderRadius: '3px',
              background: 'rgba(5, 150, 105, 0.15)',
              color: '#059669',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              border: '1px solid rgba(5, 150, 105, 0.3)',
            }}
          >
            Session Active
          </span>
        </div>

        {/* Sign Out Action */}
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--color-surface-container-low)',
              color: 'var(--color-on-surface-variant)',
              border: '1px solid var(--color-border)',
              padding: '5px 9px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Sign out and return to Login"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
              logout
            </span>
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};

import React from 'react';
import type { UserRole } from '../../types/cadastre';

interface TopHeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeAlertsCount?: number;
  onOpenAlerts?: () => void;
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
  onRoleChange,
  activeAlertsCount = 0,
  onOpenAlerts,
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

        {/* Role Switcher Dropdown */}
        <div
          className="role-switcher"
          style={{
            border: `1px solid ${roleMeta.border}`,
            background: 'var(--color-surface-container-low)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: roleMeta.color }}>
            badge
          </span>
          <select
            className="role-select"
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}
          >
            <option value="public_demo">Public / Demo Explorer</option>
            <option value="surveyor">Authorized Surveyor</option>
            <option value="municipal_officer">Municipal Revenue Officer</option>
            <option value="admin">System Administrator</option>
          </select>
        </div>
      </div>
    </header>
  );
};

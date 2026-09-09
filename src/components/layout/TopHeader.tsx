import React from 'react';
import type { UserRole } from '../../types/cadastre';

interface TopHeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeAlertsCount?: number;
  onOpenAlerts?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentRole,
  onRoleChange,
  activeAlertsCount = 0,
  onOpenAlerts,
}) => {
  return (
    <header className="top-header">
      <div className="header-brand">
        <div className="brand-emblem">ND</div>
        <div className="brand-text">
          <div className="brand-title-row">
            <span className="brand-title">NAGARDRISHTI 3D</span>
            <span className="brand-tag">3D GIS Twin</span>
          </div>
          <span className="brand-subtitle">
            Maharashtra Urban Demonstration Zone (Zone 4)
          </span>
        </div>
      </div>

      <div className="header-actions">
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
              padding: '4px 10px',
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

        <div className="role-switcher">
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-secondary)' }}>
            badge
          </span>
          <select
            className="role-select"
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
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

import React from 'react';
import type { UserRole } from '../../types/cadastre';

export type ActiveTab =
  | 'dashboard'
  | 'city3d'
  | 'registry'
  | 'register'
  | 'discrepancies'
  | 'verification'
  | 'sos';

interface SidebarNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeRole: UserRole;
  alertsCount?: number;
  pendingTasksCount?: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  activeRole,
  alertsCount = 0,
  pendingTasksCount = 0,
}) => {
  return (
    <>
      <aside className="sidebar-nav">
        <div>
          <div className="nav-section-label">Spatial Intelligence</div>
          <nav className="nav-list">
            <div
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onTabChange('dashboard')}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>Overview & KPIs</span>
            </div>

            <div
              className={`nav-item ${activeTab === 'city3d' ? 'active' : ''}`}
              onClick={() => onTabChange('city3d')}
            >
              <span className="material-symbols-outlined">location_city</span>
              <span>3D City & Exploded View</span>
            </div>

            <div
              className={`nav-item ${activeTab === 'registry' ? 'active' : ''}`}
              onClick={() => onTabChange('registry')}
            >
              <span className="material-symbols-outlined">table_view</span>
              <span>Vertical Registry (VSUs)</span>
            </div>
          </nav>

          <div className="nav-section-label" style={{ marginTop: '14px' }}>
            Workflows & Verification
          </div>
          <nav className="nav-list">
            <div
              className={`nav-item ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => onTabChange('register')}
            >
              <span className="material-symbols-outlined">add_box</span>
              <span>Register Candidate VSU</span>
            </div>

            <div
              className={`nav-item ${activeTab === 'discrepancies' ? 'active' : ''}`}
              onClick={() => onTabChange('discrepancies')}
            >
              <span className="material-symbols-outlined">satellite_alt</span>
              <span>Satellite & Survey Diffs</span>
              {alertsCount > 0 && <span className="nav-badge alert">{alertsCount}</span>}
            </div>

            <div
              className={`nav-item ${activeTab === 'verification' ? 'active' : ''}`}
              onClick={() => onTabChange('verification')}
            >
              <span className="material-symbols-outlined">fact_check</span>
              <span>Verification Queue</span>
              {pendingTasksCount > 0 && <span className="nav-badge pending">{pendingTasksCount}</span>}
            </div>
          </nav>

          <div className="nav-section-label" style={{ marginTop: '14px' }}>
            Emergency Helper
          </div>
          <nav className="nav-list">
            <div
              className={`nav-item ${activeTab === 'sos' ? 'active' : ''}`}
              onClick={() => onTabChange('sos')}
            >
              <span className="material-symbols-outlined">emergency</span>
              <span>SOS Location Resolver</span>
            </div>
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div
          style={{
            padding: '10px 12px',
            background: 'var(--color-surface-container-low)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            fontSize: '11px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--color-secondary)',
                display: 'inline-block',
              }}
            />
            <strong style={{ color: 'var(--color-primary)' }}>Live Data Synced</strong>
          </div>
          <div style={{ color: 'var(--color-outline)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            EPSG:7760 • WGS84
          </div>
          <div style={{ marginTop: '4px', fontSize: '10px', color: 'var(--color-on-surface-variant)' }}>
            Role: <strong>{activeRole.replace('_', ' ')}</strong>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <div
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
          style={{ border: 'none', flexDirection: 'column', padding: '4px', gap: '2px', fontSize: '9px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>dashboard</span>
          <span>Dash</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'city3d' ? 'active' : ''}`}
          onClick={() => onTabChange('city3d')}
          style={{ border: 'none', flexDirection: 'column', padding: '4px', gap: '2px', fontSize: '9px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>location_city</span>
          <span>3D City</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'discrepancies' ? 'active' : ''}`}
          onClick={() => onTabChange('discrepancies')}
          style={{ border: 'none', flexDirection: 'column', padding: '4px', gap: '2px', fontSize: '9px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>satellite_alt</span>
          <span>Diffs</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'verification' ? 'active' : ''}`}
          onClick={() => onTabChange('verification')}
          style={{ border: 'none', flexDirection: 'column', padding: '4px', gap: '2px', fontSize: '9px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>fact_check</span>
          <span>Verify</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'sos' ? 'active' : ''}`}
          onClick={() => onTabChange('sos')}
          style={{ border: 'none', flexDirection: 'column', padding: '4px', gap: '2px', fontSize: '9px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>emergency</span>
          <span>SOS</span>
        </div>
      </nav>
    </>
  );
};

import React from 'react';
import type { UserRole } from '../../types/cadastre';

export type ActiveTab =
  | 'dashboard'
  | 'city3d'
  | 'registry'
  | 'register'
  | 'discrepancies'
  | 'verification'
  | 'sos'
  | 'workspace'
  | 'login'
  | 'request-access'
  | 'reset-password';

interface SidebarNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeRole: UserRole;
  alertsCount?: number;
  pendingTasksCount?: number;
  userEmail?: string;
  onLogout?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  activeRole,
  alertsCount = 0,
  pendingTasksCount = 0,
  userEmail,
  onLogout,
}) => {
  const isPublic = activeRole === 'public_demo';
  const isSurveyor = activeRole === 'surveyor';
  const isOfficer = activeRole === 'municipal_officer';
  const isAdmin = activeRole === 'admin';

  // Role-based window access permissions:
  // - public_demo: dashboard, city3d, registry, sos
  // - surveyor: dashboard, city3d, registry, register, discrepancies, verification, sos
  // - municipal_officer: dashboard, city3d, registry, discrepancies, verification, sos
  // - admin: all windows
  const canAccessWorkflows = !isPublic;
  const canRegister = isSurveyor || isAdmin;
  const canAccessDiffs = isSurveyor || isOfficer || isAdmin;
  const canAccessQueue = isSurveyor || isOfficer || isAdmin;

  return (
    <>
      <aside className="sidebar-nav">
        <div>
          {/* Dynamic Section 1 Header: Core Spatial Explorer */}
          <div className="nav-section-label">
            {isPublic
              ? 'Citizen Services'
              : isSurveyor
              ? 'Field Surveyor Tools'
              : isOfficer
              ? 'Revenue & Enforcement'
              : isAdmin
              ? 'Master Spatial Admin'
              : 'Spatial Intelligence'}
          </div>

          <nav className="nav-list">
            <div
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onTabChange('dashboard')}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>
                {isPublic
                  ? 'Overview & Search'
                  : isSurveyor
                  ? 'Surveyor Dashboard'
                  : isOfficer
                  ? 'Adjudication Dashboard'
                  : 'Master Overview'}
              </span>
            </div>

            <div
              className={`nav-item ${activeTab === 'city3d' ? 'active' : ''}`}
              onClick={() => onTabChange('city3d')}
            >
              <span className="material-symbols-outlined">location_city</span>
              <span>
                {isPublic
                  ? '3D City Explorer'
                  : isSurveyor
                  ? '3D As-Built Twin'
                  : isOfficer
                  ? '3D Violation Audit'
                  : '3D City & Exploded Twin'}
              </span>
            </div>

            <div
              className={`nav-item ${activeTab === 'registry' ? 'active' : ''}`}
              onClick={() => onTabChange('registry')}
            >
              <span className="material-symbols-outlined">table_view</span>
              <span>
                {isPublic
                  ? 'Public Registry (VSUs)'
                  : isOfficer
                  ? 'Statutory Cadastre'
                  : 'Vertical Registry (VSUs)'}
              </span>
            </div>
          </nav>

          {/* Dynamic Section 2 Header: Authority Workflows (Only displayed if role has access) */}
          {canAccessWorkflows && (
            <>
              <div className="nav-section-label" style={{ marginTop: '14px' }}>
                {isSurveyor
                  ? 'Field Data Collection'
                  : isOfficer
                  ? 'Statutory Approvals'
                  : 'Workflows & Verification'}
              </div>

              <nav className="nav-list">
                {/* Register VSU - Field Surveyors and Admins only */}
                {canRegister && (
                  <div
                    className={`nav-item ${activeTab === 'register' ? 'active' : ''}`}
                    onClick={() => onTabChange('register')}
                  >
                    <span className="material-symbols-outlined">add_box</span>
                    <span>Register Candidate VSU</span>
                    {isSurveyor && <span className="nav-badge" style={{ background: '#d97706', color: '#fff' }}>+ Field</span>}
                  </div>
                )}

                {/* Satellite & Survey Diffs - Surveyors, Officers, Admins */}
                {canAccessDiffs && (
                  <div
                    className={`nav-item ${activeTab === 'discrepancies' ? 'active' : ''}`}
                    onClick={() => onTabChange('discrepancies')}
                  >
                    <span className="material-symbols-outlined">satellite_alt</span>
                    <span>Satellite & Survey Diffs</span>
                    {alertsCount > 0 && <span className="nav-badge alert">{alertsCount}</span>}
                  </div>
                )}

                {/* Verification Queue - Surveyors, Officers, Admins */}
                {canAccessQueue && (
                  <div
                    className={`nav-item ${activeTab === 'verification' ? 'active' : ''}`}
                    onClick={() => onTabChange('verification')}
                  >
                    <span className="material-symbols-outlined">fact_check</span>
                    <span>Verification Queue</span>
                    {pendingTasksCount > 0 && (
                      <span className="nav-badge pending" style={isOfficer ? { background: '#7c3aed', color: '#ffffff', fontWeight: 700 } : undefined}>
                        {pendingTasksCount}
                      </span>
                    )}
                  </div>
                )}
              </nav>
            </>
          )}

          {/* Emergency Section - Accessible to all roles */}
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
            marginTop: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isPublic ? '#0284c7' : isSurveyor ? '#d97706' : isOfficer ? '#7c3aed' : '#059669',
                display: 'inline-block',
              }}
            />
            <strong style={{ color: 'var(--color-primary)' }}>Live Data Synced</strong>
          </div>
          <div style={{ color: 'var(--color-outline)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            EPSG:7760 • WGS84
          </div>
          <div style={{ marginTop: '4px', fontSize: '10px', color: 'var(--color-on-surface-variant)' }}>
            Active: <strong style={{ color: isPublic ? '#0284c7' : isSurveyor ? '#d97706' : isOfficer ? '#7c3aed' : '#059669' }}>
              {isPublic ? 'Public Explorer' : isSurveyor ? 'Authorized Surveyor' : isOfficer ? 'Municipal Officer' : isAdmin ? 'System Admin' : 'User'}
            </strong>
          </div>
          {userEmail && (
            <div style={{ marginTop: '2px', fontSize: '10px', color: 'var(--color-outline)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail}
            </div>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                marginTop: '8px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-on-surface-variant)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '10px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>logout</span>
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Only displays accessible windows) */}
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
          className={`nav-item ${activeTab === 'registry' ? 'active' : ''}`}
          onClick={() => onTabChange('registry')}
          style={{ border: 'none', flexDirection: 'column', padding: '4px', gap: '2px', fontSize: '9px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>table_view</span>
          <span>Registry</span>
        </div>
        {canAccessDiffs && (
          <div
            className={`nav-item ${activeTab === 'discrepancies' ? 'active' : ''}`}
            onClick={() => onTabChange('discrepancies')}
            style={{ border: 'none', flexDirection: 'column', padding: '4px', gap: '2px', fontSize: '9px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>satellite_alt</span>
            <span>Diffs</span>
          </div>
        )}
        {canAccessQueue && (
          <div
            className={`nav-item ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => onTabChange('verification')}
            style={{ border: 'none', flexDirection: 'column', padding: '4px', gap: '2px', fontSize: '9px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>fact_check</span>
            <span>Verify</span>
          </div>
        )}
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

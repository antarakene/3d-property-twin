import React, { useState, useEffect } from 'react';
import { cadastreService } from '../services/cadastreService';
import type { Building, DiscrepancyAlert, ParentParcel, CandidateVsu, UserRole } from '../types/cadastre';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricChip } from '../components/common/MetricChip';

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  onSelectBuilding: (buildingId: string) => void;
  onSelectVsu: (vsu: CandidateVsu) => void;
  currentRole?: UserRole;
  pendingTasksCount?: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onSelectBuilding,
  onSelectVsu,
  currentRole = 'public_demo',
  pendingTasksCount = 1,
}) => {
  const [parcels, setParcels] = useState<ParentParcel[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [alerts, setAlerts] = useState<DiscrepancyAlert[]>([]);
  const [vsus, setVsus] = useState<CandidateVsu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [pData, bData, aData, vData] = await Promise.all([
          cadastreService.getParentParcels(),
          cadastreService.getBuildings(),
          cadastreService.getDiscrepancyAlerts(),
          cadastreService.getVsus(),
        ]);
        setParcels(pData);
        setBuildings(bData);
        setAlerts(aData);
        setVsus(vData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const verifiedVsusCount = vsus.filter((v) => v.verificationStatus === 'Verified').length;
  const underReviewVsusCount = vsus.filter((v) => v.verificationStatus === 'Under Review').length;

  const isPublic = currentRole === 'public_demo';
  const isSurveyor = currentRole === 'surveyor';
  const isOfficer = currentRole === 'municipal_officer';
  const isAdmin = currentRole === 'admin';

  return (
    <div style={{ padding: '20px 24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Zone Title & Banner - Role Adaptive */}
      <div
        style={{
          background: 'var(--color-surface-container-lowest)',
          border: `1px solid ${isPublic ? '#38bdf844' : isSurveyor ? '#f59e0b44' : isOfficer ? '#818cf844' : '#34d39944'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(11, 31, 58, 0.04)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: isPublic ? 'rgba(2, 132, 199, 0.15)' : isSurveyor ? 'rgba(217, 119, 6, 0.15)' : isOfficer ? 'rgba(124, 58, 237, 0.15)' : 'rgba(5, 150, 105, 0.15)',
                  color: isPublic ? '#0284c7' : isSurveyor ? '#d97706' : isOfficer ? '#7c3aed' : '#059669',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {isPublic
                  ? '🌐 Citizen Discovery Portal'
                  : isSurveyor
                  ? '📐 Field Cadastral Surveyor Console'
                  : isOfficer
                  ? '🏛️ Municipal Revenue & Enforcement Console'
                  : '🛡️ System Administrator Master Console'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-outline)' }}>
                EPSG:7760 • WGS84 UTM 43N
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '6px' }}>
              {isPublic
                ? 'Maharashtra Citizen 3D Land & Flat Registry Portal'
                : isSurveyor
                ? 'Field Cadastral Surveyor Workspace'
                : isOfficer
                ? 'Municipal Town Planning & Title Adjudication Console'
                : 'System Administrator & Spatial DB Cockpit'}
            </h1>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginTop: '2px' }}>
              {isPublic
                ? 'Verify your apartment 3D vertical spatial boundaries, check sanctioned vs actual building heights, and explore digital twins.'
                : isSurveyor
                ? 'MMS vehicle LiDAR ingestion, GPS boundary verification, and candidate VSU registration.'
                : isOfficer
                ? 'Enforce building bylaws, adjudicate satellite & LiDAR height discrepancies, and verify title deeds.'
                : 'Master infrastructure control, PostGIS spatial database health, audit event trail, and role configuration.'}
            </p>
          </div>

          {/* Role-Specific Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {isPublic && (
              <>
                <button className="btn-primary" onClick={() => onNavigateTab('city3d')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_city</span>
                  <span>Launch 3D Explorer</span>
                </button>
                <button className="btn-secondary" onClick={() => onNavigateTab('registry')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>table_view</span>
                  <span>Public Property Registry</span>
                </button>
                <button className="btn-secondary" onClick={() => onNavigateTab('sos')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>emergency</span>
                  <span>SOS Emergency</span>
                </button>
              </>
            )}

            {isSurveyor && (
              <>
                <button className="btn-teal" onClick={() => onNavigateTab('register')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_box</span>
                  <span>+ Register Field VSU</span>
                </button>
                <button className="btn-primary" onClick={() => onNavigateTab('city3d')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>straighten</span>
                  <span>3D Field As-Built</span>
                </button>
                <button className="btn-secondary" onClick={() => onNavigateTab('discrepancies')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>satellite_alt</span>
                  <span>LiDAR Diffs ({alerts.length})</span>
                </button>
              </>
            )}

            {isOfficer && (
              <>
                <button
                  className="btn-primary"
                  style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
                  onClick={() => onNavigateTab('verification')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>fact_check</span>
                  <span>Verification Queue ({pendingTasksCount} Pending)</span>
                </button>
                <button className="btn-secondary" onClick={() => onNavigateTab('city3d')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>find_in_page</span>
                  <span>3D Violation Audit</span>
                </button>
                <button className="btn-secondary" onClick={() => onNavigateTab('discrepancies')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                  <span>Signals ({alerts.length})</span>
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <button className="btn-primary" onClick={() => onNavigateTab('city3d')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_city</span>
                  <span>3D Engine</span>
                </button>
                <button className="btn-teal" onClick={() => onNavigateTab('register')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_box</span>
                  <span>Register VSU</span>
                </button>
                <button className="btn-secondary" onClick={() => onNavigateTab('verification')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>admin_panel_settings</span>
                  <span>Queue ({pendingTasksCount})</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Admin Infrastructure Health Strip */}
        {isAdmin && (
          <div
            style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: 'rgba(5, 150, 105, 0.08)',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <strong>PostgreSQL 15 / PostGIS 3.4:</strong> <span style={{ color: '#059669' }}>Connected & Healthy</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-outline)' }}>
              Cesium Ion: Token Active • Spatial Datum: EPSG:7760 • Audit Trail: Immutable Append-Only
            </div>
          </div>
        )}

        {/* Citizen How-To Guidance Strip */}
        {isPublic && (
          <div
            style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid rgba(2, 132, 199, 0.2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-on-surface)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#0284c7' }}>info</span>
            <span>
              <strong>Citizen Tip:</strong> Search for your building below or enter your flat number (e.g. <code>901</code>) to inspect verified 3D vertical boundaries and sanctioned building heights.
            </span>
          </div>
        )}

        {/* SIH26011 National Problem Statement Alignment Strip */}
        <div
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: 'rgba(2, 132, 199, 0.05)',
            border: '1px solid rgba(2, 132, 199, 0.2)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>SIH26011:</span>
            <span style={{ color: 'var(--color-on-surface)' }}>
              <strong>3D ULPIN Generation & Vertical Property Mapping System</strong> • Ministry of Rural Development (Space Technology)
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-outline)' }}>
            DILRMP • Bhu-Aadhaar 3D Specification
          </span>
        </div>

        {/* Quick Search Bar */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)', fontSize: '18px' }}>
              search
            </span>
            <input
              type="text"
              placeholder="Search by Demo ULPIN Reference (e.g. DEMO-MH-MUM-0001), building name, or candidate VSU ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--color-outline)', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>
          <button
            className="btn-secondary"
            onClick={() => setSearchQuery('DEMO-MH-MUM-0001')}
            style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
          >
            Fill Demo Parcel
          </button>
        </div>

        {/* Search Results Preview for Candidate VSUs */}
        {searchQuery && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-outline)', marginBottom: '6px' }}>
              Found {vsus.filter(v => v.prototypeVsuIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) || (v.canonical3dUlpin && v.canonical3dUlpin.toLowerCase().includes(searchQuery.toLowerCase())) || v.unitNumber.toLowerCase().includes(searchQuery.toLowerCase())).length} candidate units matching &ldquo;{searchQuery}&rdquo;:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {vsus
                .filter(v => v.prototypeVsuIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) || (v.canonical3dUlpin && v.canonical3dUlpin.toLowerCase().includes(searchQuery.toLowerCase())) || v.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 5)
                .map(v => (
                  <button
                    key={v.id}
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                    onClick={() => onSelectVsu(v)}
                  >
                    🏢 Unit {v.unitNumber} ({v.useType}) • Inspect in 3D
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <MetricChip
          label="Total Candidate VSUs"
          value={loading ? '...' : vsus.length}
          unit="units"
          subtext={`${verifiedVsusCount} verified • ${underReviewVsusCount} in review`}
          highlight
        />
        <MetricChip
          label="Mapped Demo Buildings"
          value={loading ? '...' : buildings.length}
          unit="structures"
          subtext="1 Verified • 1 Under Review • 3 Draft"
        />
        <MetricChip
          label="Potential Discrepancies"
          value={loading ? '...' : alerts.length}
          unit="signals"
          subtext="Height deviations & setback flags"
        />
        <MetricChip
          label="Cadastral Parcels"
          value={loading ? '...' : parcels.length}
          unit="plots"
          subtext="Zone 4 (East) Demonstration Area"
        />
      </div>

      {/* Buildings & 3D Twin Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left: Buildings Table */}
        <div className="instrument-card">
          <div className="card-header">
            <span className="card-title">Mapped Vertical Structures</span>
            <button className="btn-secondary" style={{ fontSize: '11px' }} onClick={() => onNavigateTab('city3d')}>
              Inspect in 3D View
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {buildings
              .filter((b) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (
                  b.buildingName.toLowerCase().includes(q) ||
                  b.buildingCode.toLowerCase().includes(q) ||
                  (b.status && b.status.toLowerCase().includes(q))
                );
              })
              .map((bld) => (
              <div
                key={bld.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'var(--color-surface-container-low)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onClick={() => {
                  onSelectBuilding(bld.id);
                  onNavigateTab('city3d');
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: 'var(--color-primary)', fontSize: '14px' }}>{bld.buildingName}</strong>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-outline)' }}>
                      {bld.buildingCode}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '3px' }}>
                    {bld.totalFloors} Vertical Floors • Height: {bld.heightM}m • Confidence: {bld.confidenceTier}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StatusBadge status={bld.status} size="sm" />
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-outline)' }}>
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Discrepancy Alerts Teaser */}
        <div className="instrument-card">
          <div className="card-header">
            <span className="card-title" style={{ color: 'var(--color-error)' }}>
              Active Discrepancy Signals
            </span>
            <button className="btn-secondary" style={{ fontSize: '11px' }} onClick={() => onNavigateTab('discrepancies')}>
              Full Studio
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: '10px',
                  background: 'var(--color-error-container)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--color-error)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--color-error)', fontSize: '12px' }}>{alert.alertType}</strong>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--color-error)' }}>
                    {alert.alertCode}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-on-error-container)', marginTop: '4px', lineHeight: '1.3' }}>
                  {alert.description}
                </p>
                {alert.heightDeltaM ? (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-error)', fontWeight: 700, marginTop: '4px', display: 'inline-block' }}>
                    Delta: +{alert.heightDeltaM}m elevation
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

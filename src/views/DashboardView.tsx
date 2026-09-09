import React, { useState, useEffect } from 'react';
import { cadastreService } from '../services/cadastreService';
import type { Building, DiscrepancyAlert, ParentParcel, CandidateVsu } from '../types/cadastre';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricChip } from '../components/common/MetricChip';

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  onSelectBuilding: (buildingId: string) => void;
  onSelectVsu: (vsu: CandidateVsu) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onSelectBuilding,
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

  return (
    <div style={{ padding: '20px 24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Zone Title & Banner */}
      <div
        style={{
          background: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(11, 31, 58, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-badge verified">Demo Zone Active</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-outline)' }}>
                EPSG:7760 • WGS84 UTM 43N
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '6px' }}>
              Maharashtra Urban Demonstration Zone
            </h1>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginTop: '2px' }}>
              3D Vertical Cadastral Mapping, Candidate VSU Registration & Satellite Discrepancy Auditing
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-primary" onClick={() => onNavigateTab('city3d')}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_city</span>
              <span>Launch 3D Explorer</span>
            </button>
            <button className="btn-teal" onClick={() => onNavigateTab('register')}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_box</span>
              <span>Register Candidate VSU</span>
            </button>
          </div>
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
              placeholder="Search by Demo ULPIN Reference (e.g. DEMO-MH-MUM-0001) or Candidate VSU ID..."
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
          </div>
          <button
            className="btn-secondary"
            onClick={() => setSearchQuery('DEMO-MH-MUM-0001')}
            style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
          >
            Fill Demo Parcel
          </button>
        </div>
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
            {buildings.map((bld) => (
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

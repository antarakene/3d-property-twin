import React, { useState, useEffect } from 'react';
import { cadastreService } from '../services/cadastreService';
import type { CandidateVsu, Building, EvidenceSource, UserRole } from '../types/cadastre';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricChip } from '../components/common/MetricChip';

interface RegistryViewProps {
  onNavigateTo3D: (vsu: CandidateVsu) => void;
  onNavigateToVerify?: (vsu: CandidateVsu) => void;
  currentRole?: UserRole;
}

export const RegistryView: React.FC<RegistryViewProps> = ({
  onNavigateTo3D,
  onNavigateToVerify,
  currentRole = 'public_demo',
}) => {
  const [vsus, setVsus] = useState<CandidateVsu[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceSource[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected VSU for right inspection drawer
  const [inspectedVsu, setInspectedVsu] = useState<CandidateVsu | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [vData, bData, eData] = await Promise.all([
          cadastreService.getVsus(),
          cadastreService.getBuildings(),
          cadastreService.getEvidenceSources(),
        ]);
        setVsus(vData);
        setBuildings(bData);
        setEvidenceList(eData);

        // Default inspect Unit 702
        const unit702 = vData.find((v) => v.unitNumber === '702' || v.unitNumber === '701');
        if (unit702) setInspectedVsu(unit702);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredVsus = vsus.filter((v) => {
    if (selectedBuildingId !== 'all' && v.buildingId !== selectedBuildingId) return false;
    if (selectedStatus !== 'all' && v.verificationStatus !== selectedStatus) return false;
    if (selectedFloor !== 'all' && v.floorNumber?.toString() !== selectedFloor) return false;
    if (
      searchQuery &&
      !v.prototypeVsuIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !v.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(v.mockOccupantName || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const isPublic = currentRole === 'public_demo';
  const isSurveyor = currentRole === 'surveyor';
  const isOfficer = currentRole === 'municipal_officer';
  const isAdmin = currentRole === 'admin';

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Main Table Workspace */}
      <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)' }}>
                {isPublic
                  ? 'Public Vertical Property Registry'
                  : isSurveyor
                  ? 'Field Candidate VSU Registry'
                  : isOfficer
                  ? 'Statutory Vertical Land Registry'
                  : 'Master 3D-ULPIN Spatial Database'}
              </h1>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: isPublic ? 'rgba(2, 132, 199, 0.15)' : isSurveyor ? 'rgba(217, 119, 6, 0.15)' : isOfficer ? 'rgba(124, 58, 237, 0.15)' : 'rgba(5, 150, 105, 0.15)',
                  color: isPublic ? '#0284c7' : isSurveyor ? '#d97706' : isOfficer ? '#7c3aed' : '#059669',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {isPublic ? 'Citizen Inquiry' : isSurveyor ? 'Surveyor Entry' : isOfficer ? 'Officer Adjudication' : isAdmin ? 'Master Admin' : 'Cadastre Database'}
              </span>
            </div>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '12px', marginTop: '2px' }}>
              {isPublic
                ? 'Public roster of verified apartments, ground elevations, and floor plans in Zone 4'
                : isSurveyor
                ? 'Field measurements, floor boundaries, and candidate unit submissions awaiting verification'
                : isOfficer
                ? 'Official legal register for adjudicating ownership, building bylaws, and title deeds'
                : isAdmin
                ? 'Master spatial records across all 5 demo buildings (82 candidate units)'
                : 'Vertical Property Registry'}
            </p>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-outline)' }}>
            Showing {filteredVsus.length} of {vsus.length} Candidate Units
          </span>
        </div>

        {/* Filter Toolbar */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            background: 'var(--color-surface-container-lowest)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            placeholder="Search by ID, unit or occupant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              minWidth: '220px',
            }}
          />

          <select
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
            }}
          >
            <option value="all">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.buildingName}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Under Review">Under Review</option>
            <option value="Draft">Draft</option>
            <option value="Conflict">Conflict</option>
          </select>

          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
            }}
          >
            <option value="all">All Floors</option>
            {Array.from(
              {
                length:
                  selectedBuildingId !== 'all'
                    ? buildings.find((b) => b.id === selectedBuildingId)?.totalFloors || 10
                    : 10,
              },
              (_, i) => i + 1
            ).map((f) => (
              <option key={f} value={f}>
                Floor {f}
              </option>
            ))}
          </select>

          {(selectedBuildingId !== 'all' || selectedStatus !== 'all' || selectedFloor !== 'all' || searchQuery) && (
            <button
              className="btn-secondary"
              onClick={() => {
                setSelectedBuildingId('all');
                setSelectedStatus('all');
                setSelectedFloor('all');
                setSearchQuery('');
              }}
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Registry Table */}
        <div
          style={{
            background: 'var(--color-surface-container-lowest)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--color-surface-container-low)',
                  borderBottom: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--color-outline)',
                  textTransform: 'uppercase',
                }}
              >
                <th style={{ padding: '10px 14px' }}>Prototype VSU Identifier</th>
                <th style={{ padding: '10px 12px' }}>Unit</th>
                <th style={{ padding: '10px 12px' }}>Type</th>
                <th style={{ padding: '10px 12px' }}>Carpet / Built-up</th>
                <th style={{ padding: '10px 12px' }}>Z-Elevation</th>
                <th style={{ padding: '10px 12px' }}>Confidence</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: 'var(--color-outline)' }}>
                    Loading candidate vertical units...
                  </td>
                </tr>
              ) : filteredVsus.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: 'var(--color-outline)' }}>
                    No vertical sub-units match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredVsus.map((vsu) => {
                  const isInspected = inspectedVsu?.id === vsu.id;
                  return (
                    <tr
                      key={vsu.id}
                      onClick={() => setInspectedVsu(vsu)}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        background: isInspected ? 'var(--color-surface-container)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.1s ease',
                      }}
                    >
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)', fontSize: '12px' }}>
                          {vsu.prototypeVsuIdentifier}
                        </div>
                        {vsu.mockOccupantName && (
                          <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
                            Occupant: {vsu.mockOccupantName}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          U-{vsu.unitNumber}
                        </strong>
                        <div style={{ fontSize: '10px', color: 'var(--color-outline)' }}>
                          Fl {vsu.floorNumber || 1}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '11px' }}>
                        {vsu.useType}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {vsu.carpetAreaSqm} m² / {vsu.builtupAreaSqm} m²
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-secondary)' }}>
                        {vsu.zBottomM.toFixed(1)}m – {vsu.zTopM.toFixed(1)}m
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600 }}>
                          {vsu.confidenceTier}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <StatusBadge status={vsu.verificationStatus} size="sm" />
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '10px', marginRight: '6px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateTo3D(vsu);
                          }}
                        >
                          3D Focus
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Slide-Out Inspection Drawer */}
      {inspectedVsu && (
        <aside
          style={{
            width: 'var(--drawer-width)',
            background: 'var(--color-surface-container-lowest)',
            borderLeft: '1px solid var(--color-border)',
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="metric-label">Candidate Spatial Unit</span>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', wordBreak: 'break-all', marginTop: '2px' }}>
                {inspectedVsu.prototypeVsuIdentifier}
              </h2>
            </div>
            <StatusBadge status={inspectedVsu.verificationStatus} size="md" />
          </div>

          {/* Metric Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <MetricChip label="Carpet Area" value={inspectedVsu.carpetAreaSqm} unit="m²" />
            <MetricChip label="Built-up Area" value={inspectedVsu.builtupAreaSqm} unit="m²" />
            <MetricChip label="3D Volume" value={inspectedVsu.volumeCum} unit="m³" />
            <MetricChip label="Z-Range (AGL)" value={`${inspectedVsu.zBottomM.toFixed(1)}m – ${inspectedVsu.zTopM.toFixed(1)}m`} />
          </div>

          {/* Legal / Mock Document Details */}
          <div
            style={{
              padding: '12px',
              background: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span className="metric-label">Mock Document Reference</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>
              {inspectedVsu.mockDocumentReference || 'MOCK-DEED-PENDING'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
              Mock Titleholder: <strong>{inspectedVsu.mockOccupantName || 'Demonstration Owner'}</strong>
            </div>
          </div>

          {/* Attached Evidence Provenance */}
          <div>
            <div className="card-header" style={{ marginBottom: '8px' }}>
              <span className="card-title" style={{ fontSize: '12px' }}>Evidence Package Attached</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-secondary)' }}>
                {evidenceList.length} Sources
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {evidenceList.slice(0, 3).map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: 'var(--color-surface-container-low)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--color-secondary)' }}>
                      verified
                    </span>
                    <div>
                      <strong>{ev.title}</strong>
                      <div style={{ fontSize: '9px', color: 'var(--color-outline)' }}>{ev.sensorGsd}</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--color-secondary)' }}>
                    {ev.concurrenceScore}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Drawer Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <button className="btn-primary" onClick={() => onNavigateTo3D(inspectedVsu)}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>3d_rotation</span>
              <span>Inspect in 3D Exploded View</span>
            </button>
            {onNavigateToVerify && (
              <button className="btn-secondary" onClick={() => onNavigateToVerify(inspectedVsu)}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>fact_check</span>
                <span>Open Verification Console</span>
              </button>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};

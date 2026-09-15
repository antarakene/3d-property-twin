import React, { useState, useEffect } from 'react';
import { cadastreService } from '../services/cadastreService';
import type { CandidateVsu, Building, EvidenceSource, UserRole } from '../types/cadastre';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricChip } from '../components/common/MetricChip';

interface RegistryViewProps {
  onNavigateTo3D: (vsu: CandidateVsu) => void;
  onNavigateToVerify?: (vsu: CandidateVsu) => void;
  currentRole?: UserRole;
  initialSelectedVsuId?: string | null;
  onClearInitialSelection?: () => void;
}

export const RegistryView: React.FC<RegistryViewProps> = ({
  onNavigateTo3D,
  onNavigateToVerify,
  currentRole = 'public_demo',
  initialSelectedVsuId,
  onClearInitialSelection,
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
  // Banner for newly registered VSU feedback
  const [registrationBanner, setRegistrationBanner] = useState<CandidateVsu | null>(null);

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

        if (initialSelectedVsuId) {
          const target = vData.find(
            (v) => v.id === initialSelectedVsuId || v.prototypeVsuIdentifier === initialSelectedVsuId
          );
          if (target) {
            setInspectedVsu(target);
            setRegistrationBanner(target);
            if (target.buildingId) setSelectedBuildingId(target.buildingId);
            setSelectedFloor('all');
            setSelectedStatus('all');
            setSearchQuery('');
            return;
          }
        }

        // Default inspect Unit 702
        const unit702 = vData.find((v) => v.unitNumber === '702' || v.unitNumber === '701');
        if (unit702) setInspectedVsu(unit702);
        else if (vData.length > 0) setInspectedVsu(vData[0]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialSelectedVsuId]);

  const filteredVsus = vsus.filter((v) => {
    if (selectedBuildingId !== 'all' && v.buildingId !== selectedBuildingId) return false;
    if (selectedStatus !== 'all' && v.verificationStatus !== selectedStatus) return false;
    if (selectedFloor !== 'all' && v.floorNumber?.toString() !== selectedFloor) return false;
    if (
      searchQuery &&
      !v.prototypeVsuIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(v.canonical3dUlpin || '').toLowerCase().includes(searchQuery.toLowerCase()) &&
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
      <div style={{ flex: 1, minWidth: 0, padding: '20px 24px', overflowY: 'auto' }}>
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

        {/* Dynamic Candidate Registration Success Banner */}
        {registrationBanner && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.12) 0%, rgba(2, 132, 199, 0.12) 100%)',
              border: '1px solid #10b981',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#059669', marginTop: '2px' }}>
                verified
              </span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#047857' }}>
                    Candidate Unit Successfully Registered & Queued for Verification!
                  </span>
                  <span className="status-badge review" style={{ fontSize: '10px' }}>
                    Under Review
                  </span>
                </div>
                <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                    Prototype: {registrationBanner.prototypeVsuIdentifier}
                  </span>
                  <span style={{ color: '#0284c7', background: 'rgba(2, 132, 199, 0.1)', padding: '1px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    3D-ULPIN: {registrationBanner.canonical3dUlpin}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px', margin: 0 }}>
                  Automated geometric validation passed. Initial verification task allocated in Surveyor Queue.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                onClick={() => onNavigateTo3D(registrationBanner)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>view_in_ar</span>
                Inspect 3D Twin
              </button>
              {onNavigateToVerify && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  onClick={() => onNavigateToVerify(registrationBanner)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>fact_check</span>
                  Verification Queue
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setRegistrationBanner(null);
                  if (onClearInitialSelection) onClearInitialSelection();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-outline)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Dismiss banner"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>
          </div>
        )}

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
            <option value="Returned for Correction">Returned for Correction</option>
            <option value="Rejected">Rejected</option>
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
            overflowX: 'auto',
            overflowY: 'hidden',
          }}
        >
          <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Prototype VSU Identifier</th>
                <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Unit</th>
                <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Type</th>
                <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Carpet / Built-up</th>
                <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Z-Elevation</th>
                <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Confidence</th>
                <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
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
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                          {vsu.prototypeVsuIdentifier}
                        </div>
                        {vsu.canonical3dUlpin && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#0284c7', marginTop: '3px', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: 700, padding: '1px 5px', background: 'rgba(2, 132, 199, 0.12)', borderRadius: '3px', border: '1px solid rgba(2, 132, 199, 0.25)', flexShrink: 0 }}>
                              3D-ULPIN
                            </span>
                            <span style={{ whiteSpace: 'nowrap' }}>{vsu.canonical3dUlpin}</span>
                          </div>
                        )}
                        {vsu.mockOccupantName && (
                          <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '2px', whiteSpace: 'nowrap' }}>
                            Occupant: {vsu.mockOccupantName}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          U-{vsu.unitNumber}
                        </strong>
                        <div style={{ fontSize: '10px', color: 'var(--color-outline)' }}>
                          Fl {vsu.floorNumber || 1}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {vsu.useType}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {vsu.carpetAreaSqm} m² / {vsu.builtupAreaSqm} m²
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-secondary)', whiteSpace: 'nowrap' }}>
                        {vsu.zBottomM.toFixed(1)}m – {vsu.zTopM.toFixed(1)}m
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600 }}>
                          {vsu.confidenceTier}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <StatusBadge status={vsu.verificationStatus} size="sm" />
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
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
            width: '350px',
            maxWidth: '380px',
            flexShrink: 0,
            background: 'var(--color-surface-container-lowest)',
            borderLeft: '1px solid var(--color-border)',
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="metric-label">Candidate Spatial Unit</span>
                <button
                  type="button"
                  onClick={() => setInspectedVsu(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-outline)',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px',
                  }}
                  title="Close Drawer"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              </div>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', wordBreak: 'break-word', overflowWrap: 'anywhere', marginTop: '2px' }}>
                {inspectedVsu.prototypeVsuIdentifier}
              </h2>
              {inspectedVsu.canonical3dUlpin && (
                <div style={{ marginTop: '6px', padding: '6px 8px', background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#0284c7', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    Canonical 3D-ULPIN (Bhu-Aadhaar)
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#0284c7', wordBreak: 'break-word', overflowWrap: 'anywhere', marginTop: '2px' }}>
                    {inspectedVsu.canonical3dUlpin}
                  </div>
                </div>
              )}
            </div>
            <StatusBadge status={inspectedVsu.verificationStatus} size="md" />
          </div>

          {/* Statutory Adjudication Feedback Banner */}
          {inspectedVsu.verificationStatus === 'Verified' ? (
            <div style={{ padding: '10px 12px', background: 'rgba(5, 150, 105, 0.1)', border: '1px solid #10b981', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', fontWeight: 700, fontSize: '11px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                <span>Statutory 3D Title Record Verified & Active</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px', margin: 0 }}>
                {inspectedVsu.officerRemarks || 'Validated against sanctioned architectural floor plans and mobile sensor surveys.'}
              </p>
            </div>
          ) : inspectedVsu.verificationStatus === 'Returned for Correction' ? (
            <div style={{ padding: '10px 12px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid #f59e0b', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: 700, fontSize: '11px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>assignment_return</span>
                <span>Official Notice: {inspectedVsu.noticePeriodDays || 15}-Day Rectification Period</span>
              </div>
              {inspectedVsu.noticeDeadline && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#b45309', marginTop: '3px', fontWeight: 700 }}>
                  Statutory Deadline: {inspectedVsu.noticeDeadline}
                </div>
              )}
              <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px', margin: 0 }}>
                <strong>Officer Requirement:</strong> {inspectedVsu.officerRemarks || 'Submit rectified documentation to municipal revenue desk.'}
              </p>
            </div>
          ) : inspectedVsu.verificationStatus === 'Rejected' ? (
            <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 700, fontSize: '11px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                <span>Candidate Registration Rejected</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px', margin: 0 }}>
                <strong>Non-compliance Grounds:</strong> {inspectedVsu.officerRemarks || 'Unit geometry or documents fail statutory bylaws.'}
              </p>
            </div>
          ) : (
            <div style={{ padding: '10px 12px', background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 700, fontSize: '11px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
                <span>Candidate Unit Under Verification</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px', margin: 0 }}>
                Automated geometric checks passed. Allocated in Surveyor & Officer Verification Queue for final statutory determination.
              </p>
            </div>
          )}

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

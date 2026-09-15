import React, { useState, useEffect, useMemo } from 'react';
import { cadastreService, VSU_ULPIN_REGISTRY } from '../services/cadastreService';
import { SEED_VSUS } from '../data/seedData';
import type { VerificationTask, CandidateVsu, UserRole, AuditEvent } from '../types/cadastre';
import { StatusBadge } from '../components/common/StatusBadge';

interface VerificationQueueViewProps {
  currentRole: UserRole;
  onNavigateTo3D: (vsu: CandidateVsu) => void;
  initialSelectedVsuId?: string | null;
  initialSelectedIdentifier?: string | null;
  onClearInitialSelection?: () => void;
}

export const VerificationQueueView: React.FC<VerificationQueueViewProps> = ({
  currentRole,
  onNavigateTo3D,
  initialSelectedVsuId,
  initialSelectedIdentifier,
  onClearInitialSelection,
}) => {
  const [tasks, setTasks] = useState<VerificationTask[]>([]);
  const [vsus, setVsus] = useState<CandidateVsu[]>([]);
  const [selectedTask, setSelectedTask] = useState<VerificationTask | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [officerNotes, setOfficerNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isOfficerOrAdmin = currentRole === 'municipal_officer' || currentRole === 'admin';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [tData, vData] = await Promise.all([
          cadastreService.getVerificationTasks(),
          cadastreService.getVsus(),
        ]);
        setTasks(tData);
        setVsus(vData);

        if (tData.length > 0) {
          // Check if initial selection prop requested a specific task/VSU
          let targetTask = initialSelectedVsuId || initialSelectedIdentifier
            ? tData.find(
                (t) =>
                  t.vsuId === initialSelectedVsuId ||
                  t.vsuIdentifier === initialSelectedIdentifier ||
                  (initialSelectedIdentifier && t.vsuIdentifier?.toLowerCase() === initialSelectedIdentifier.toLowerCase()) ||
                  (initialSelectedVsuId && t.id === initialSelectedVsuId)
              )
            : null;

          if (!targetTask) {
            // Prioritize the newest 'Under Review' task so candidate units appear immediately
            targetTask = tData.find((t) => t.verificationStatus === 'Under Review') || tData[0];
          }

          setSelectedTask(targetTask);
          setOfficerNotes(targetTask.officerNotes || '');
          const audits = await cadastreService.getAuditTrail(targetTask.vsuId);
          setAuditEvents(audits);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [initialSelectedVsuId, initialSelectedIdentifier]);

  const [activeActionTab, setActiveActionTab] = useState<'approve' | 'correction' | 'reject'>('approve');
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(15);
  const [correctionRequirement, setCorrectionRequirement] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSelectTask = useCallback(async (task: VerificationTask) => {
    setSelectedTask(task);
    setOfficerNotes(task.officerNotes || '');
    setCorrectionRequirement(task.verificationStatus === 'Returned for Correction' ? task.officerNotes || '' : '');
    setRejectionReason(task.verificationStatus === 'Rejected' ? task.officerNotes || '' : '');
    if (task.noticePeriodDays) setNoticePeriodDays(task.noticePeriodDays);
    const audits = await cadastreService.getAuditTrail(task.vsuId);
    setAuditEvents(audits);
    setActionSuccess(null);
  }, []);

  // Reactive listener if initial selection changes dynamically
  useEffect(() => {
    if (!initialSelectedVsuId && !initialSelectedIdentifier) return;
    if (tasks.length === 0) return;

    const matched = tasks.find(
      (t) =>
        t.vsuId === initialSelectedVsuId ||
        t.vsuIdentifier === initialSelectedIdentifier ||
        (initialSelectedIdentifier && t.vsuIdentifier?.toLowerCase() === initialSelectedIdentifier.toLowerCase()) ||
        (initialSelectedVsuId && t.id === initialSelectedVsuId)
    );

    if (matched && matched.id !== selectedTask?.id) {
      handleSelectTask(matched);
      if (onClearInitialSelection) onClearInitialSelection();
    }
  }, [initialSelectedVsuId, initialSelectedIdentifier, tasks, selectedTask?.id, handleSelectTask, onClearInitialSelection]);

  const handleAction = async (
    status: 'Approved' | 'Rejected' | 'Returned for Correction' | 'Under Review',
    noticeDaysParam?: number
  ) => {
    if (!selectedTask) return;
    const daysToUse = noticeDaysParam !== undefined ? noticeDaysParam : noticePeriodDays;
    const notesToUse =
      status === 'Returned for Correction'
        ? correctionRequirement || officerNotes || 'Please submit revised floor plans and corrected carpet area measurements within the statutory notice period.'
        : status === 'Rejected'
        ? rejectionReason || officerNotes || 'Candidate application fails municipal building bylaws and spatial boundary standards.'
        : officerNotes || 'Sanctioned floor plans and spatial survey evidence verified. Cadastral title approved.';

    const ok = await cadastreService.updateVerificationTask(
      selectedTask.id,
      selectedTask.vsuId,
      status,
      notesToUse,
      daysToUse
    );

    if (ok) {
      const successMessage =
        status === 'Approved'
          ? 'Candidate Record officially Approved! Public Vertical Registry updated to Verified.'
          : status === 'Returned for Correction'
          ? `Correction Notice issued with ${daysToUse}-Day statutory notice period.`
          : `Candidate Record Rejected. Non-compliance status logged.`;

      setActionSuccess(successMessage);
      setSelectedTask((prev) =>
        prev
          ? {
              ...prev,
              verificationStatus: status,
              officerNotes: notesToUse,
              noticePeriodDays: status === 'Returned for Correction' ? daysToUse : undefined,
            }
          : null
      );
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id
            ? {
                ...t,
                verificationStatus: status,
                officerNotes: notesToUse,
                noticePeriodDays: status === 'Returned for Correction' ? daysToUse : undefined,
              }
            : t
        )
      );
      setVsus((prev) =>
        prev.map((v) =>
          v.id === selectedTask.vsuId || v.prototypeVsuIdentifier === selectedTask.vsuIdentifier
            ? {
                ...v,
                verificationStatus: status === 'Approved' ? 'Verified' : status,
                noticePeriodDays: status === 'Returned for Correction' ? daysToUse : undefined,
                officerRemarks: notesToUse,
              }
            : v
        )
      );
      const updatedAudits = await cadastreService.getAuditTrail(selectedTask.vsuId);
      setAuditEvents(updatedAudits);
    }
  };

  // Ultra-resilient multi-tiered VSU resolver: guaranteed to NEVER be undefined when a task is selected
  const activeVsu: CandidateVsu = useMemo(() => {
    if (!selectedTask) {
      const default702 = vsus.find((v) => v.unitNumber === '702') || SEED_VSUS.find((v) => v.unitNumber === '702');
      if (default702) return default702;
      return SEED_VSUS[0];
    }

    // 1. Direct ID match in loaded vsus
    let match = vsus.find((v) => v.id === selectedTask.vsuId);

    // 2. Direct prototype identifier match in loaded vsus
    if (!match && selectedTask.vsuIdentifier) {
      match = vsus.find((v) => v.prototypeVsuIdentifier === selectedTask.vsuIdentifier);
    }

    // 3. Case-insensitive / whitespace-trimmed prototype match in loaded vsus
    if (!match && selectedTask.vsuIdentifier) {
      const cleanTarget = selectedTask.vsuIdentifier.trim().toLowerCase();
      match = vsus.find((v) => v.prototypeVsuIdentifier?.trim().toLowerCase() === cleanTarget);
    }

    // 4. Match in SEED_VSUS directly by ID or prototype
    if (!match) {
      match = SEED_VSUS.find(
        (v) =>
          v.id === selectedTask.vsuId ||
          v.prototypeVsuIdentifier === selectedTask.vsuIdentifier ||
          (selectedTask.vsuIdentifier && v.prototypeVsuIdentifier?.trim().toLowerCase() === selectedTask.vsuIdentifier.trim().toLowerCase())
      );
    }

    // 5. Match by unit number and building code
    if (!match && selectedTask.vsuIdentifier) {
      const unitMatch = selectedTask.vsuIdentifier.match(/-(\d{3,4})$/);
      const unitNum = unitMatch ? unitMatch[1] : null;
      const isTowerA = selectedTask.vsuIdentifier.includes('-A-') || selectedTask.vsuIdentifier.includes('TOWERA');
      const isTowerB = selectedTask.vsuIdentifier.includes('-B-') || selectedTask.vsuIdentifier.includes('TOWERB');
      const isGrn = selectedTask.vsuIdentifier.includes('GRN') || selectedTask.vsuIdentifier.includes('GREEN');

      if (unitNum) {
        const pool = isTowerA
          ? SEED_VSUS.filter((v) => v.buildingId === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
          : isTowerB
          ? SEED_VSUS.filter((v) => v.buildingId === 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
          : isGrn
          ? SEED_VSUS.filter((v) => v.buildingId === 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee')
          : vsus;
        match = pool.find((v) => v.unitNumber === unitNum) || vsus.find((v) => v.unitNumber === unitNum);
      }
    }

    // 6. Resilient Fallback Synthesis from selectedTask
    if (!match) {
      const unitMatch = selectedTask.vsuIdentifier?.match(/-(\d{3,4})$/);
      const parsedUnit = unitMatch ? unitMatch[1] : '702';
      const isB = selectedTask.vsuIdentifier?.includes('-B-') || selectedTask.vsuIdentifier?.includes('TOWERB');
      const isGrn = selectedTask.vsuIdentifier?.includes('GRN') || selectedTask.vsuIdentifier?.includes('GREEN');

      const bldId = isGrn
        ? 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
        : isB
        ? 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
        : 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

      const floorNum = parseInt(parsedUnit.slice(0, -2) || '7', 10);
      const zBottom = 1.2 + (floorNum - 1) * 3.4;
      const zTop = zBottom + 3.4;

      match = {
        id: selectedTask.vsuId || `vsu-synth-${selectedTask.id}`,
        buildingId: bldId,
        floorId: `floor-${floorNum}`,
        floorNumber: floorNum,
        prototypeVsuIdentifier: selectedTask.vsuIdentifier || 'DEMO-MH-MUM-0001-VSU-A-07-702',
        canonical3dUlpin:
          (selectedTask.vsuIdentifier ? VSU_ULPIN_REGISTRY.get(selectedTask.vsuIdentifier) : undefined) ||
          `ULPIN3D-MH-CTS98122A-A-F07-U${parsedUnit}-Z${zBottom.toFixed(1)}_${zTop.toFixed(1)}`,
        unitNumber: parsedUnit,
        unitName: `Corner Apartment B ${parsedUnit}`,
        useType: 'Residential 2BHK',
        carpetAreaSqm: 88.0,
        builtupAreaSqm: 106.0,
        volumeCum: 360.4,
        zBottomM: zBottom,
        zTopM: zTop,
        confidenceTier: 'Tier A',
        verificationStatus: selectedTask.verificationStatus,
        mockDocumentReference: 'MOCK-REG-2023-4122B',
        mockOccupantName: 'Meera S. Kulkarni',
        hasViolation: isGrn || isB,
        officerRemarks: selectedTask.officerNotes,
      };
    }

    return match;
  }, [selectedTask, vsus]);

  // Compute notice deadline preview
  const [calculatedDeadline, setCalculatedDeadline] = useState<string>('');
  useEffect(() => {
    const formatted = new Date(Date.now() + noticePeriodDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    setCalculatedDeadline(formatted);
  }, [noticePeriodDays]);

  // Check for known architectural discrepancies on this building/unit
  const isUnit702 = (activeVsu?.unitNumber === '702') || (activeVsu?.prototypeVsuIdentifier || '').includes('-07-702');
  const isFloor6Overhang = (activeVsu?.unitNumber === '602') || (activeVsu?.prototypeVsuIdentifier || '').includes('-06-602');
  const isGreenResidency = activeVsu?.buildingId === 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' || (activeVsu?.prototypeVsuIdentifier || '').includes('GRN');
  const isTowerB = activeVsu?.buildingId === 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' || (activeVsu?.prototypeVsuIdentifier || '').includes('TOWERB') || (activeVsu?.prototypeVsuIdentifier || '').includes('-B-');
  const hasDiscrepancy = isGreenResidency || isTowerB || isFloor6Overhang || activeVsu?.hasViolation;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left List of Tasks */}
      <div style={{ width: '380px', borderRight: '1px solid var(--color-border)', padding: '16px', overflowY: 'auto', background: 'var(--color-surface-container-lowest)' }}>
        <div style={{ marginBottom: '14px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>
            Surveyor Verification Queue
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
            Multi-stage adjudication: Under Review → Approved / Returned / Rejected
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading ? (
            <p style={{ fontSize: '12px', color: 'var(--color-outline)', textAlign: 'center', padding: '20px' }}>Loading tasks...</p>
          ) : (
            tasks.map((t) => {
              const isSelected = selectedTask?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTask(t)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: isSelected ? 'var(--color-surface-container)' : 'var(--color-surface-container-low)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px', color: 'var(--color-primary)' }}>
                      {t.vsuIdentifier || `Task ${t.id.slice(0, 8)}`}
                    </span>
                    <StatusBadge status={t.verificationStatus} size="sm" />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                    Assigned: {t.assignedOfficer || 'General Queue'}
                  </div>
                  {t.noticePeriodDays && t.verificationStatus === 'Returned for Correction' && (
                    <div style={{ fontSize: '10px', color: '#b45309', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '3px', marginTop: '4px', fontWeight: 600 }}>
                      ⚠️ Notice: {t.noticePeriodDays} Days Active
                    </div>
                  )}
                  {t.officerNotes && (
                    <p style={{ fontSize: '10px', color: 'var(--color-outline)', marginTop: '4px', fontStyle: 'italic' }}>
                      "{t.officerNotes}"
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Task Adjudication Console */}
      <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
        {selectedTask ? (
          <div style={{ maxWidth: '840px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="metric-label">Active Verification Session</span>
                  <StatusBadge status={selectedTask.verificationStatus} size="sm" />
                </div>
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                  {activeVsu.prototypeVsuIdentifier}
                </h2>
                {activeVsu.canonical3dUlpin && (
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                      Statutory 3D-ULPIN
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>
                      {activeVsu.canonical3dUlpin}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" onClick={() => onNavigateTo3D(activeVsu)}>
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>3d_rotation</span>
                  <span>Inspect 3D Geometry</span>
                </button>
              </div>
            </div>

            {actionSuccess && (
              <div
                style={{
                  background: 'var(--color-verified-bg)',
                  color: 'var(--color-verified)',
                  border: '1px solid var(--color-verified)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                <span style={{ fontWeight: 600 }}>{actionSuccess}</span>
              </div>
            )}

            {/* Current Active Status Callout */}
            {selectedTask.verificationStatus === 'Returned for Correction' && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid #f59e0b',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: 700, fontSize: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>assignment_return</span>
                  <span>Active Statutory Notice: {selectedTask.noticePeriodDays || 15}-Day Rectification Period</span>
                </div>
                {selectedTask.noticeDeadline && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#b45309', marginTop: '4px', fontWeight: 600 }}>
                    Notice Deadline: {selectedTask.noticeDeadline}
                  </div>
                )}
                <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px', margin: 0 }}>
                  <strong>Officer Required Rectification:</strong> "{selectedTask.officerNotes || 'Submit revised vector plans to municipal revenue office.'}"
                </p>
              </div>
            )}

            {selectedTask.verificationStatus === 'Approved' && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(5, 150, 105, 0.12)',
                  border: '1px solid #10b981',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', fontWeight: 700, fontSize: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>
                  <span>Statutory Record Approved: Public Vertical Registry is Updated to Verified</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px', margin: 0 }}>
                  Endorsement: "{selectedTask.officerNotes || 'Documents and spatial survey verified.'}"
                </p>
              </div>
            )}

            {selectedTask.verificationStatus === 'Rejected' && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid #ef4444',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 700, fontSize: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                  <span>Candidate Application Rejected</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px', margin: 0 }}>
                  <strong>Rejection Grounds:</strong> "{selectedTask.officerNotes || 'Fails statutory requirements.'}"
                </p>
              </div>
            )}

            {/* Property Discrepancy & Issue Diagnostic Inspector */}
            <div className="instrument-card" style={{ marginBottom: '16px' }}>
              <div className="card-header">
                <span className="card-title" style={{ fontSize: '13px' }}>Property Discrepancy & Anomaly Diagnostics</span>
                <span className={`status-badge ${hasDiscrepancy ? 'conflict' : 'verified'}`} style={{ fontSize: '10px' }}>
                  {hasDiscrepancy ? 'Anomaly Flagged' : 'All Checks Clear'}
                </span>
              </div>

              {isUnit702 && (
                <div style={{ padding: '10px 12px', background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: 'var(--radius-sm)', marginBottom: '8px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 700 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>checklist</span>
                    <span>Unit 702 Parapet & Deed Boundary Tolerance Check</span>
                  </div>
                  <p style={{ color: 'var(--color-on-surface-variant)', marginTop: '3px', margin: 0 }}>
                    Deed area ({activeVsu.carpetAreaSqm} m² carpet / {activeVsu.builtupAreaSqm} m² built-up) matches 3D point cloud within 1.2% tolerance (Complies with ±3.0% statutory variance rule). Mobile LiDAR parapet clearance audit ready for final sign-off.
                  </p>
                </div>
              )}

              {isFloor6Overhang && (
                <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-sm)', marginBottom: '8px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 700 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                    <span>Setback Balcony Overhang (+1.65m horizontal cantilever deviation)</span>
                  </div>
                  <p style={{ color: 'var(--color-on-surface-variant)', marginTop: '3px', margin: 0 }}>
                    Unsanctioned cantilever projection encroaches into mandatory 5.0m side marginal space. Requires notice or penalty regularization.
                  </p>
                </div>
              )}

              {isGreenResidency && (
                <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-sm)', marginBottom: '8px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 700 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                    <span>Setback Encroachment Anomaly: Cantilever Overhang (+1.8m beyond plot line)</span>
                  </div>
                  <p style={{ color: 'var(--color-on-surface-variant)', marginTop: '3px', margin: 0 }}>
                    Sensor Concurrence: 94.8% from Terrestrial Mobile LiDAR Parapet Scan. Requires officer determination or correction notice.
                  </p>
                </div>
              )}

              {isTowerB && (
                <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-sm)', marginBottom: '8px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 700 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                    <span>Rooftop Extension Anomaly: Unsanctioned 9th Level (+4.3m above approved height)</span>
                  </div>
                  <p style={{ color: 'var(--color-on-surface-variant)', marginTop: '3px', margin: 0 }}>
                    Earth Observation Difference detected: +485.9 m³ volume delta relative to baseline T1 sanction envelope.
                  </p>
                </div>
              )}

              {!isGreenResidency && !isTowerB && !isFloor6Overhang && !isUnit702 && (
                <div style={{ padding: '10px 12px', background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.25)', borderRadius: 'var(--radius-sm)', marginBottom: '8px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', fontWeight: 700 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                    <span>Structural Envelope Concurrence: 98.4% (Within Sanctioned Bylaws)</span>
                  </div>
                  <p style={{ color: 'var(--color-on-surface-variant)', marginTop: '3px', margin: 0 }}>
                    Z-Elevation and volumetric boundaries align with approved architectural drawings.
                  </p>
                </div>
              )}

              {/* 5-Point Geometry Matrix */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', marginTop: '6px' }}>
                <div style={{ padding: '8px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-secondary)' }}>check_circle</span>
                  <span>3D Solid 2-Manifold Mesh Topology</span>
                </div>
                <div style={{ padding: '8px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: isGreenResidency ? '#dc2626' : 'var(--color-secondary)' }}>
                    {isGreenResidency ? 'error' : 'check_circle'}
                  </span>
                  <span>Building Boundary Perimeter Check</span>
                </div>
                <div style={{ padding: '8px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-secondary)' }}>check_circle</span>
                  <span>Vertical Z-Span Clearance ({Number(activeVsu.zBottomM || 0).toFixed(1)}m – {Number(activeVsu.zTopM || 3.4).toFixed(1)}m)</span>
                </div>
                <div style={{ padding: '8px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-secondary)' }}>check_circle</span>
                  <span>No Sub-Unit Boundary Overlap</span>
                </div>
              </div>
            </div>

            {/* Valid Documents & Survey Evidence Review */}
            <div className="instrument-card" style={{ marginBottom: '16px' }}>
              <div className="card-header">
                <span className="card-title" style={{ fontSize: '13px' }}>Valid Documents & Survey Evidence Attached</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-secondary)' }}>
                  3 Independent Sources
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div style={{ padding: '10px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)' }}>
                  <span className="metric-label">Title Deed Reference</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                    {activeVsu.mockDocumentReference || 'MOCK-REG-2026-9921E'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '3px' }}>
                    Titleholder: <strong>{activeVsu.mockOccupantName || 'Candidate Applicant'}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
                    Declared Area: <strong>{activeVsu.carpetAreaSqm} m²</strong> (Built-up: {activeVsu.builtupAreaSqm} m²)
                  </div>
                </div>

                <div style={{ padding: '10px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)' }}>
                  <span className="metric-label">Survey Evidence Package</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>• Drone DSM Orthophoto:</span>
                      <strong style={{ color: 'var(--color-secondary)' }}>99.1% Concurrence</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>• Sanctioned CAD Plan Rev 4:</span>
                      <strong style={{ color: 'var(--color-secondary)' }}>96.4% Concurrence</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>• Mobile LiDAR Parapet Scan:</span>
                      <strong style={{ color: isGreenResidency ? '#dc2626' : 'var(--color-secondary)' }}>
                        {isGreenResidency ? 'Overhang Flagged' : '94.8% Match'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Officer Decision & Notes Console with Notice Period */}
            <div className="instrument-card" style={{ marginBottom: '16px' }}>
              <div className="card-header">
                <span className="card-title" style={{ fontSize: '13px' }}>Municipal Officer Adjudication Console</span>
                <span style={{ fontSize: '10px', color: 'var(--color-outline)' }}>
                  Current Role: <strong>{currentRole}</strong>
                </span>
              </div>

              {!isOfficerOrAdmin && (
                <div style={{ background: 'var(--color-review-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '11px', color: '#b45309', marginBottom: '12px' }}>
                  ℹ️ Viewing in preview mode. Executing statutory approvals, rejection, or issuing correction notices requires <strong>Municipal Revenue Officer</strong> or <strong>Admin</strong> role (switch in top right).
                </div>
              )}

              {/* Action Mode Switcher */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => setActiveActionTab('approve')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: activeActionTab === 'approve' ? '2px solid var(--color-verified)' : '1px solid var(--color-border)',
                    background: activeActionTab === 'approve' ? 'var(--color-verified-bg)' : 'var(--color-surface-container-low)',
                    color: activeActionTab === 'approve' ? 'var(--color-verified)' : 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                  Approve Title
                </button>

                <button
                  type="button"
                  onClick={() => setActiveActionTab('correction')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: activeActionTab === 'correction' ? '2px solid #f59e0b' : '1px solid var(--color-border)',
                    background: activeActionTab === 'correction' ? 'rgba(245, 158, 11, 0.12)' : 'var(--color-surface-container-low)',
                    color: activeActionTab === 'correction' ? '#b45309' : 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>assignment_return</span>
                  Ask for Correction (Notice)
                </button>

                <button
                  type="button"
                  onClick={() => setActiveActionTab('reject')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: activeActionTab === 'reject' ? '2px solid var(--color-error)' : '1px solid var(--color-border)',
                    background: activeActionTab === 'reject' ? 'rgba(239, 68, 68, 0.12)' : 'var(--color-surface-container-low)',
                    color: activeActionTab === 'reject' ? 'var(--color-error)' : 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                  Reject Record
                </button>
              </div>

              {/* Approve Form */}
              {activeActionTab === 'approve' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label className="metric-label">Officer Verification Endorsement Notes</label>
                    <textarea
                      rows={2}
                      value={officerNotes}
                      onChange={(e) => setOfficerNotes(e.target.value)}
                      placeholder="Title deed reference, sanctioned CAD floor plans, and spatial survey verified. Approved for statutory 3D cadastre."
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        marginTop: '4px',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', margin: 0 }}>
                    💡 <strong>Effect:</strong> Approving this candidate unit finalizes the statutory 3D-ULPIN, transitions status to <strong>VERIFIED</strong>, and updates the Public Vertical Registry record.
                  </p>
                  <button
                    className="btn-primary"
                    style={{ background: 'var(--color-verified)', alignSelf: 'flex-start' }}
                    onClick={() => handleAction('Approved')}
                    disabled={!isOfficerOrAdmin}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                    <span>Endorse & Approve Statutory Title</span>
                  </button>
                </div>
              )}

              {/* Ask for Correction with Notice Period */}
              {activeActionTab === 'correction' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="metric-label">Statutory Notice Period</label>
                      <select
                        value={noticePeriodDays}
                        onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          marginTop: '4px',
                        }}
                      >
                        <option value={7}>7 Days (Expedited Clarification)</option>
                        <option value={15}>15 Days (Standard Statutory Notice)</option>
                        <option value={30}>30 Days (Architectural Plan Resubmission)</option>
                      </select>
                    </div>

                    <div>
                      <label className="metric-label">Notice Rectification Deadline</label>
                      <div
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid #f59e0b',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#b45309',
                          marginTop: '4px',
                        }}
                      >
                        📅 {calculatedDeadline} ({noticePeriodDays} Days Active)
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="metric-label">Specific Correction Requirement / Field Discrepancy</label>
                    <textarea
                      rows={2}
                      value={correctionRequirement}
                      onChange={(e) => setCorrectionRequirement(e.target.value)}
                      placeholder="e.g. Applicant must submit sanctioned architectural floor plan resolving the +1.8m setback overhang or rectify carpet area delta within the statutory notice period."
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        marginTop: '4px',
                      }}
                    />
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', margin: 0 }}>
                    💡 <strong>Effect:</strong> Sets status to <strong>Returned for Correction</strong> with an active notice period. The Public Vertical Registry will reflect the active notice and officer requirements.
                  </p>

                  <button
                    className="btn-primary"
                    style={{ background: '#d97706', alignSelf: 'flex-start' }}
                    onClick={() => handleAction('Returned for Correction', noticePeriodDays)}
                    disabled={!isOfficerOrAdmin}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>assignment_return</span>
                    <span>Issue Statutory Notice & Return for Correction</span>
                  </button>
                </div>
              )}

              {/* Reject Form */}
              {activeActionTab === 'reject' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label className="metric-label">Formal Grounds for Non-Compliance Rejection</label>
                    <textarea
                      rows={2}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Application rejected due to unsanctioned rooftop vertical extension exceeding sanctioned building height bylaws."
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        marginTop: '4px',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', margin: 0 }}>
                    💡 <strong>Effect:</strong> Sets status to <strong>Rejected</strong> and records a formal non-conformance finding in the immutable audit log.
                  </p>
                  <button
                    className="btn-secondary"
                    style={{ color: 'var(--color-error)', border: '1px solid var(--color-error)', alignSelf: 'flex-start' }}
                    onClick={() => handleAction('Rejected')}
                    disabled={!isOfficerOrAdmin}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                    <span>Confirm Non-Compliance Rejection</span>
                  </button>
                </div>
              )}
            </div>

            {/* Audit History Timeline */}
            <div className="instrument-card">
              <div className="card-header">
                <span className="card-title" style={{ fontSize: '13px' }}>Chronological Audit Trail & Versioning</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-outline)' }}>
                  Non-Repudiable Log
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                {auditEvents.map((evt) => (
                  <div key={evt.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--color-secondary)',
                        marginTop: '5px',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, background: 'var(--color-surface-container-low)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '12px', color: 'var(--color-primary)' }}>{evt.eventTitle}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--color-outline)' }}>{evt.createdAt}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
                        {evt.description}
                      </p>
                      <div style={{ fontSize: '10px', color: 'var(--color-outline)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        By: {evt.performedBy} ({evt.userRole})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-outline)' }}>
            Select a verification task from the left queue to conduct review.
          </div>
        )}
      </div>
    </div>
  );
};

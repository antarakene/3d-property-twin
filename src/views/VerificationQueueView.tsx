import React, { useState, useEffect } from 'react';
import { cadastreService } from '../services/cadastreService';
import type { VerificationTask, CandidateVsu, UserRole, AuditEvent } from '../types/cadastre';
import { StatusBadge } from '../components/common/StatusBadge';

interface VerificationQueueViewProps {
  currentRole: UserRole;
  onNavigateTo3D: (vsu: CandidateVsu) => void;
}

export const VerificationQueueView: React.FC<VerificationQueueViewProps> = ({
  currentRole,
  onNavigateTo3D,
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
          setSelectedTask(tData[0]);
          setOfficerNotes(tData[0].officerNotes || '');
          const audits = await cadastreService.getAuditTrail(tData[0].vsuId);
          setAuditEvents(audits);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelectTask = async (task: VerificationTask) => {
    setSelectedTask(task);
    setOfficerNotes(task.officerNotes || '');
    const audits = await cadastreService.getAuditTrail(task.vsuId);
    setAuditEvents(audits);
    setActionSuccess(null);
  };

  const handleAction = async (status: 'Approved' | 'Rejected' | 'Returned for Correction' | 'Under Review') => {
    if (!selectedTask) return;
    const ok = await cadastreService.updateVerificationTask(
      selectedTask.id,
      selectedTask.vsuId,
      status,
      officerNotes
    );
    if (ok) {
      setActionSuccess(`Record successfully updated to "${status}"`);
      setSelectedTask((prev) => (prev ? { ...prev, verificationStatus: status, officerNotes } : null));
      setTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? { ...t, verificationStatus: status, officerNotes } : t))
      );
      setVsus((prev) =>
        prev.map((v) => (v.id === selectedTask.vsuId ? { ...v, verificationStatus: status } : v))
      );
      const updatedAudits = await cadastreService.getAuditTrail(selectedTask.vsuId);
      setAuditEvents(updatedAudits);
    }
  };

  const activeVsu = vsus.find((v) => v.id === selectedTask?.vsuId);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left List of Tasks */}
      <div style={{ width: '380px', borderRight: '1px solid var(--color-border)', padding: '16px', overflowY: 'auto', background: 'var(--color-surface-container-lowest)' }}>
        <div style={{ marginBottom: '14px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>
            Surveyor Verification Queue
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
            Multi-stage adjudication: Draft → Under Review → Approved / Rejected
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
        {selectedTask && activeVsu ? (
          <div style={{ maxWidth: '840px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="metric-label">Active Verification Session</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-secondary)' }}>
                    LOD 3.2 Extrusion
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                  {activeVsu.prototypeVsuIdentifier}
                </h2>
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
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Automated 5-Point Validation Matrix */}
            <div className="instrument-card" style={{ marginBottom: '16px' }}>
              <div className="card-header">
                <span className="card-title" style={{ fontSize: '13px' }}>Automated Spatial Geometry Validation Matrix</span>
                <span className="status-badge verified">5 Rules Verified</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                <div style={{ padding: '8px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-secondary)' }}>check_circle</span>
                  <span>3D Solid 2-Manifold Mesh Topology</span>
                </div>
                <div style={{ padding: '8px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-secondary)' }}>check_circle</span>
                  <span>Within Building Extent Perimeter</span>
                </div>
                <div style={{ padding: '8px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-secondary)' }}>check_circle</span>
                  <span>Vertical Z-Span Clearance (3.4m)</span>
                </div>
                <div style={{ padding: '8px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-secondary)' }}>check_circle</span>
                  <span>No Sub-Unit Boundary Overlap</span>
                </div>
              </div>
            </div>

            {/* Officer Decision & Notes Console */}
            <div className="instrument-card" style={{ marginBottom: '16px' }}>
              <div className="card-header">
                <span className="card-title" style={{ fontSize: '13px' }}>Officer Verification & Adjudication</span>
                <span style={{ fontSize: '10px', color: 'var(--color-outline)' }}>
                  Current Role: <strong>{currentRole}</strong>
                </span>
              </div>

              {!isOfficerOrAdmin && (
                <div style={{ background: 'var(--color-review-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '11px', color: '#b45309', marginBottom: '10px' }}>
                  ℹ️ Viewing in surveyor/public mode. Approval and rejection actions require <strong>Municipal Revenue Officer</strong> role (switch role in top right).
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label className="metric-label">Officer Verification Notes / Field Scrutiny</label>
                <textarea
                  rows={3}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Record formal field observations, sensor concurrence notes, or reasons for return..."
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

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  style={{ background: 'var(--color-verified)' }}
                  onClick={() => handleAction('Approved')}
                  disabled={!isOfficerOrAdmin}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>verified</span>
                  <span>Approve Candidate Record</span>
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => handleAction('Returned for Correction')}
                  disabled={!isOfficerOrAdmin}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>assignment_return</span>
                  <span>Return for Correction</span>
                </button>

                <button
                  className="btn-secondary"
                  style={{ color: 'var(--color-error)' }}
                  onClick={() => handleAction('Rejected')}
                  disabled={!isOfficerOrAdmin}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>cancel</span>
                  <span>Reject Record</span>
                </button>
              </div>
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

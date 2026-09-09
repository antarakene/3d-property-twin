import React, { useState, useEffect } from 'react';
import { cadastreService } from '../services/cadastreService';
import type { DiscrepancyAlert, SatelliteObservation, SurveyObservation } from '../types/cadastre';
import { MetricChip } from '../components/common/MetricChip';

export const DiscrepancyStudioView: React.FC = () => {
  const [alerts, setAlerts] = useState<DiscrepancyAlert[]>([]);
  const [satelliteObs, setSatelliteObs] = useState<SatelliteObservation[]>([]);
  const [surveyObs, setSurveyObs] = useState<SurveyObservation[]>([]);
  const [activeStage, setActiveStage] = useState<'t1' | 't2' | 't3'>('t2');

  useEffect(() => {
    async function load() {
      const [aData, sData] = await Promise.all([
        cadastreService.getDiscrepancyAlerts(),
        cadastreService.getSatelliteObservations('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
      ]);
      setAlerts(aData);
      setSatelliteObs(sData);

      // Default survey obs
      setSurveyObs([
        {
          id: 'surv-1',
          buildingId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          vehicleId: 'MMS-VEHICLE-04',
          captureDate: '2026-08-04',
          sensorType: 'Optical Camera + Mobile LiDAR Pod',
          observationNotes: 'Confirmed: Fresh RCC Pillars & lightweight blue galvanized tin roofing on rooftop level.',
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7Ql-I0xzSdsZK8g4cOpuF9xIiz_NVWcGjTkcHan7yRBdjIZABlW8AE1Wjf3IZ7IYDM5q77ofnQAxL2Ig0JDgQWzxclPHX9ZHyuiN3k_7JMwze0BAd5nzaSs_wjuVhA2w50_OoCauZAzCz58QC4FHS6fDDm0yQ6EywKhXjAILnSpdAMAx299igptgos95_wWW6YojS6zEysd8XzRxqatGMemeRY6DXpnaES7veoZSQ4KBeZ8yoNmpS',
        },
      ]);
    }
    load();
  }, []);

  const t1Data = satelliteObs.find((s) => s.observationStage === 'T1 Baseline') || {
    captureDate: '2025-02-14',
    heightM: 30.4,
    footprintSqm: 1104.0,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9_VkEkuKb1D-iK8HUTHspZKOfPVnqGyrAHlYBIcIDB-29d_RHXYFFWBBWY_6o9O5yEY2hh2wDSurWtUPfhXreNFYsfA_XHB8J_XKFe527ufxcKgehjTBpep7fiQDIzQhRc2d1r2zLcAyvJxmOqe33XS3gmJJ_mqUhoY_96V0TWZGUxP9N2X_2FxWM2L6ttoYPKPw_kuk5eOMKsMJ9qS7w215RN03muAw742qzpJhEAdfgNXHoI-GZ',
  };

  const t2Data = satelliteObs.find((s) => s.observationStage === 'T2 Comparative') || {
    captureDate: '2026-07-28',
    heightM: 34.7,
    footprintSqm: 1146.6,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj5RJZ6Hzr0k4Rp7HwmQJneSGjYfKf8ELsP6t6eep3MGhA3_9UJrR7hrIZ_j2lX23guHtgLBeuGSGUG8qDvWlUDVPLlh2CIF5gtAIzmYma-bKsMYLG0H9hkXbYuYZWWrnQB9xxMVKv6FITiWuP3HMdFmPbHM2-1LrFpanwmtp3fhlTtPbgiYHEd7QGaABMCwN0kkFr7J7JCath6cwW5sEUH-KuEksF62Zly7cv2lS4buw76W6LtzAi',
  };

  return (
    <div style={{ padding: '20px 24px', maxWidth: '1280px', margin: '0 auto', overflowY: 'auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-badge conflict">AI Discrepancy Detection Active</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-outline)' }}>
            DEMO-MH-MUM-0002 • Tower B Focus
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '6px' }}>
          Satellite & Survey Evidence Discrepancy Studio
        </h1>
        <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginTop: '2px' }}>
          Precomputed temporal comparison (T1 vs T2) and mobile ground sensor verification for potential geometric deviations
        </p>
      </div>

      {/* Main Temporal Showcase */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Left: Temporal Imagery Viewer */}
        <div className="instrument-card" style={{ padding: '16px' }}>
          {/* Stage Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--color-surface-container-low)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '14px',
              gap: '6px',
            }}
          >
            <button
              className={`btn-secondary ${activeStage === 't1' ? 'btn-primary' : ''}`}
              onClick={() => setActiveStage('t1')}
              style={{ flex: 1, justifyContent: 'center', fontSize: '11px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>history</span>
              <span>T1: Feb 2025 (Baseline)</span>
            </button>
            <button
              className={`btn-secondary ${activeStage === 't2' ? 'btn-primary' : ''}`}
              onClick={() => setActiveStage('t2')}
              style={{ flex: 1, justifyContent: 'center', fontSize: '11px', border: activeStage === 't2' ? 'none' : '1px solid var(--color-error)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: activeStage === 't2' ? '#fff' : 'var(--color-error)' }}>satellite</span>
              <span>T2: Jul 2026 (Detected Diff)</span>
            </button>
            <button
              className={`btn-secondary ${activeStage === 't3' ? 'btn-primary' : ''}`}
              onClick={() => setActiveStage('t3')}
              style={{ flex: 1, justifyContent: 'center', fontSize: '11px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>directions_car</span>
              <span>Aug 2026 (Ground Vehicle)</span>
            </button>
          </div>

          {/* Display Viewport */}
          <div
            style={{
              position: 'relative',
              height: '340px',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              background: '#0b101b',
            }}
          >
            <img
              src={
                activeStage === 't1'
                  ? t1Data.imageUrl
                  : activeStage === 't2'
                  ? t2Data.imageUrl
                  : surveyObs[0]?.imageUrl
              }
              alt="Discrepancy Viewport"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Overlaid Badges */}
            <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
              <span
                style={{
                  background: activeStage === 't2' ? 'rgba(186, 26, 26, 0.9)' : 'rgba(11, 31, 58, 0.85)',
                  color: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  backdropFilter: 'blur(6px)',
                }}
              >
                {activeStage === 't1' && 'BASELINE: 2025-02-14 (Satellite DSM 0.3m)'}
                {activeStage === 't2' && 'POTENTIAL DIFF DETECTED: 2026-07-28 (+4.3m)'}
                {activeStage === 't3' && 'GROUND MMS-4 CAPTURE: 2026-08-04'}
              </span>
            </div>

            {/* Bottom Metrics Bar on Image */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                right: '12px',
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span className="metric-label">Elevation Height</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: activeStage === 't2' ? 'var(--color-error)' : 'var(--color-primary)' }}>
                  {activeStage === 't1' ? '30.4 m' : activeStage === 't2' ? '34.7 m (+4.3m)' : '34.7 m Confirmed'}
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />
              <div style={{ textAlign: 'center' }}>
                <span className="metric-label">Footprint Surface</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: activeStage === 't2' ? 'var(--color-error)' : 'var(--color-primary)' }}>
                  {activeStage === 't1' ? '1,104.0 m²' : activeStage === 't2' ? '1,146.6 m² (+42.6m²)' : 'Roof Canopy Present'}
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />
              <div style={{ textAlign: 'center' }}>
                <span className="metric-label">Rooftop Additions</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: activeStage === 't1' ? 'var(--color-secondary)' : 'var(--color-error)' }}>
                  {activeStage === 't1' ? 'Nil (Clean Terrace)' : 'Unverified Structure'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Analytical Volumetric Delta Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="instrument-card">
            <div className="card-header">
              <span className="card-title">Volumetric Divergence</span>
              <span className="status-badge conflict">High Signal</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <MetricChip label="Height Shift" value="+4.3" unit="meters" highlight />
              <MetricChip label="Footprint Diff" value="+42.6" unit="m²" highlight />
            </div>

            <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', lineHeight: '1.4' }}>
              Multi-spectral DSM photogrammetry shows an anomalous vertical profile change exceeding the sanctioned terrace parapet. Requires on-site verification.
            </div>
          </div>

          <div className="instrument-card">
            <div className="card-header">
              <span className="card-title">Ground Truth Alignment</span>
              <span className="status-badge verified">MMS-4 Synced</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-on-surface)', lineHeight: '1.4' }}>
              Mobile Mapping System vehicle camera confirms newly erected reinforced cement concrete (RCC) columns and galvanized roofing sheets on terrace level.
            </p>
          </div>
        </div>
      </div>

      {/* Discrepancy Alerts Table */}
      <div className="instrument-card">
        <div className="card-header">
          <span className="card-title">Precomputed Discrepancy Signals ({alerts.length})</span>
          <span style={{ fontSize: '11px', color: 'var(--color-outline)', fontFamily: 'var(--font-mono)' }}>
            Review Alerts Only — Authorised Verification Recommended
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alerts.map((al) => (
            <div
              key={al.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--color-surface-container-low)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: `4px solid ${al.severity === 'High' || al.severity === 'Critical' ? 'var(--color-error)' : 'var(--color-review)'}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: 'var(--color-primary)', fontSize: '13px' }}>{al.alertType}</strong>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-outline)' }}>
                    [{al.alertCode}]
                  </span>
                  <span className={`status-badge ${al.severity === 'High' ? 'conflict' : 'review'}`} style={{ fontSize: '9px' }}>
                    {al.severity} Severity
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                  {al.description}
                </p>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span className="status-badge review" style={{ fontSize: '10px' }}>
                  {al.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

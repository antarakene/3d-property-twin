import React, { useState, useEffect } from 'react';
import { cadastreService } from '../services/cadastreService';
import type { DiscrepancyAlert, SatelliteObservation, SurveyObservation } from '../types/cadastre';
import { MetricChip } from '../components/common/MetricChip';

interface DiscrepancyStudioViewProps {
  onNavigateTab?: (tab: any) => void;
  onSelectBuilding?: (buildingId: string) => void;
}

export const DiscrepancyStudioView: React.FC<DiscrepancyStudioViewProps> = ({
  onNavigateTab,
  onSelectBuilding,
}) => {
  const [alerts, setAlerts] = useState<DiscrepancyAlert[]>([]);
  const [satelliteObs, setSatelliteObs] = useState<SatelliteObservation[]>([]);
  const [, setSurveyObs] = useState<SurveyObservation[]>([]);
  const [activeStage, setActiveStage] = useState<'t1' | 't2' | 't3'>('t2');
  const [displayMode, setDisplayMode] = useState<'composite' | 'lidar' | 'cadastre'>('composite');
  const [selectedAlertIndex, setSelectedAlertIndex] = useState<number>(0);

  useEffect(() => {
    async function load() {
      const [aData, sData] = await Promise.all([
        cadastreService.getDiscrepancyAlerts(),
        cadastreService.getSatelliteObservations('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
      ]);
      setAlerts(aData);
      setSatelliteObs(sData);
      setSurveyObs([
        {
          id: 'surv-1',
          buildingId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          vehicleId: 'MMS-VEHICLE-04',
          captureDate: '2026-08-04',
          sensorType: 'Optical Camera + Mobile LiDAR Pod',
          observationNotes: 'Confirmed: Fresh RCC Pillars & lightweight blue galvanized tin roofing on rooftop level.',
        },
      ]);
    }
    load();
  }, []);

  const t1Data = satelliteObs.find((s) => s.observationStage === 'T1 Baseline') || {
    captureDate: '2025-02-14',
    heightM: 30.4,
    footprintSqm: 1104.0,
  };

  const t2Data = satelliteObs.find((s) => s.observationStage === 'T2 Comparative') || {
    captureDate: '2026-07-28',
    heightM: 34.7,
    footprintSqm: 1146.6,
  };

  const heightDelta = Number((t2Data.heightM - t1Data.heightM).toFixed(1));
  const footprintDelta = Number((t2Data.footprintSqm - t1Data.footprintSqm).toFixed(1));
  const canopyAreaSqm = 113.0;
  const volumeDelta = Number((canopyAreaSqm * heightDelta).toFixed(1));

  const activeAlert = alerts[selectedAlertIndex] || {
    alertCode: 'ALT-2026-0042',
    alertType: 'Rooftop Extension (Tower B)',
    severity: 'High',
    description: 'Comparative multi-temporal satellite DSM detected unauthorized rooftop canopy (+4.3m vertical height delta, 485.9 m³ volume).',
    buildingId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  };

  const handleOpenIn3D = () => {
    if (onSelectBuilding) {
      onSelectBuilding(activeAlert.buildingId || 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    }
    if (onNavigateTab) {
      onNavigateTab('city3d');
    }
  };

  const handleOpenQueue = () => {
    if (onNavigateTab) {
      onNavigateTab('verification');
    }
  };

  return (
    <div style={{ padding: '20px 24px', maxWidth: '1280px', margin: '0 auto', overflowY: 'auto' }}>
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-badge conflict">AI Discrepancy Detection Active</span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(2, 132, 199, 0.15)',
                color: '#0284c7',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              SIH26011 • Space Technology Sub-System
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-outline)' }}>
              DEMO-MH-MUM-0002 • Tower B Focus
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '6px' }}>
            Satellite & Survey Evidence Discrepancy Studio
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginTop: '2px' }}>
            Multi-temporal Earth Observation (EO) satellite analysis, mobile LiDAR telemetry, and precomputed geometric deviation auditing
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-primary" onClick={handleOpenIn3D}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_city</span>
            <span>Inspect in 3D Cadastre Twin</span>
          </button>
          <button className="btn-secondary" onClick={handleOpenQueue}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>fact_check</span>
            <span>Adjudicate in Queue</span>
          </button>
        </div>
      </div>

      {/* Main Temporal Showcase Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Left: Temporal Imagery & LiDAR Viewport */}
        <div className="instrument-card" style={{ padding: '16px' }}>
          {/* Stage Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--color-surface-container-low)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '12px',
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
              style={{
                flex: 1,
                justifyContent: 'center',
                fontSize: '11px',
                background: activeStage === 't2' ? 'var(--color-error)' : undefined,
                color: activeStage === 't2' ? '#fff' : 'var(--color-error)',
                borderColor: 'var(--color-error)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>satellite</span>
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

          {/* Viewport Visualization Canvas (Self-Contained Vector CAD / Satellite Graphics Engine) */}
          <div
            style={{
              position: 'relative',
              height: '360px',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              background: '#070f1e',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.7)',
            }}
          >
            {/* Native High-Tech SVG Geospatial CAD / Satellite Simulation */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 800 360"
              style={{ display: 'block', width: '100%', height: '100%' }}
            >
              <defs>
                {/* Background Grid Pattern */}
                <pattern id="utmGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
                </pattern>
                {/* Warning Diagonal Stripe for Unauthorized Construction */}
                <pattern id="warningStripe" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="16" stroke="rgba(239, 68, 68, 0.85)" strokeWidth="8" />
                  <line x1="8" y1="0" x2="8" y2="16" stroke="rgba(185, 28, 28, 0.5)" strokeWidth="8" />
                </pattern>
                {/* Elevation Heatmap Gradient */}
                <radialGradient id="lidarHeat" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                </radialGradient>
                {/* Clean Terrace Baseline Gradient */}
                <linearGradient id="cleanRoofGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Grid Background */}
              <rect width="800" height="360" fill="#070f1e" />
              <rect width="800" height="360" fill="url(#utmGrid)" />

              {/* Surrounding Urban Fabric (Muted Context) */}
              <g opacity="0.45">
                {/* Plot Boundaries */}
                <path d="M 40,40 L 760,40 L 760,320 L 40,320 Z" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 4" />
                <text x="50" y="55" fill="#38bdf8" fontSize="9" fontFamily="monospace">CTS PLOT 402/2 • ZONE 4 CADASTRE</text>

                {/* Context Structure 1: Commercial Plaza */}
                <polygon points="80,80 200,80 200,200 80,200" fill="#132038" stroke="#334155" strokeWidth="1" />
                <text x="90" y="145" fill="#64748b" fontSize="10" fontFamily="sans-serif">COMM-PLAZA (4F)</text>

                {/* Context Structure 2: Tower A */}
                <polygon points="560,80 720,80 720,240 560,240" fill="#132038" stroke="#334155" strokeWidth="1" />
                <text x="590" y="165" fill="#64748b" fontSize="10" fontFamily="sans-serif">TOWER A (10F)</text>

                {/* Road Network */}
                <path d="M 230,0 L 230,360" stroke="#1e293b" strokeWidth="24" />
                <path d="M 520,0 L 520,360" stroke="#1e293b" strokeWidth="24" />
                <line x1="230" y1="0" x2="230" y2="360" stroke="#334155" strokeWidth="1" strokeDasharray="6 6" />
                <line x1="520" y1="0" x2="520" y2="360" stroke="#334155" strokeWidth="1" strokeDasharray="6 6" />
              </g>

              {/* Primary Focus: Tower B Footprint & Airspace */}
              <g transform="translate(270, 70)">
                {/* Base Tower Boundary Plinth */}
                <rect x="0" y="0" width="220" height="200" rx="4" fill="url(#cleanRoofGrad)" stroke="#38bdf8" strokeWidth="2" />
                
                {/* Parapet Wall Offset */}
                <rect x="12" y="12" width="196" height="176" rx="2" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="3 3" />

                {/* Central Utility Core (Elevator shaft & staircase) */}
                <rect x="80" y="70" width="60" height="60" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                <text x="92" y="105" fill="#94a3b8" fontSize="9" fontFamily="monospace">CORE</text>

                {/* Stage-Specific Visual Elements */}
                {activeStage === 't1' && (
                  /* T1 Baseline: Clean, Compliant Roof */
                  <g>
                    <rect x="16" y="16" width="188" height="168" fill="rgba(16, 185, 129, 0.08)" />
                    <circle cx="110" cy="100" r="85" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
                    
                    {/* Elevation Benchmark Markers */}
                    <circle cx="30" cy="30" r="3" fill="#10b981" />
                    <text x="36" y="34" fill="#34d399" fontSize="9" fontFamily="monospace">30.40m</text>
                    <circle cx="190" cy="30" r="3" fill="#10b981" />
                    <text x="146" y="34" fill="#34d399" fontSize="9" fontFamily="monospace">30.40m</text>
                    <circle cx="30" cy="170" r="3" fill="#10b981" />
                    <text x="36" y="174" fill="#34d399" fontSize="9" fontFamily="monospace">30.40m</text>
                    <circle cx="190" cy="170" r="3" fill="#10b981" />
                    <text x="146" y="174" fill="#34d399" fontSize="9" fontFamily="monospace">30.40m</text>

                    {/* Compliant Stamp */}
                    <g transform="translate(45, 140)">
                      <rect x="0" y="0" width="130" height="20" rx="3" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1" />
                      <text x="10" y="14" fill="#10b981" fontSize="10" fontWeight="700" fontFamily="monospace">✓ COMPLIANT BASELINE</text>
                    </g>
                  </g>
                )}

                {activeStage === 't2' && (
                  /* T2 Comparative: Detected Rooftop Extension Violation */
                  <g>
                    {/* Heatmap Glow on Delta Area */}
                    <ellipse cx="110" cy="65" rx="85" ry="48" fill="url(#lidarHeat)" />

                    {/* Unauthorized 9th Floor Penthouse / Canopy Envelope */}
                    <rect x="25" y="25" width="170" height="85" rx="2" fill="url(#warningStripe)" stroke="#ef4444" strokeWidth="2.5" />
                    
                    {/* Violation Measurement Annotation Box */}
                    <g transform="translate(30, 32)">
                      <rect x="0" y="0" width="160" height="42" rx="3" fill="rgba(15, 23, 42, 0.92)" stroke="#ef4444" strokeWidth="1.5" />
                      <text x="8" y="16" fill="#ef4444" fontSize="11" fontWeight="bold" fontFamily="sans-serif">🚨 UNVERIFIED 9TH FLOOR</text>
                      <text x="8" y="32" fill="#fca5a5" fontSize="10" fontFamily="monospace">ΔZ: +4.30m (34.7m vs 30.4m)</text>
                    </g>

                    {/* Sensor Scanning Rays */}
                    <line x1="0" y1="200" x2="25" y2="25" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                    <line x1="220" y1="200" x2="195" y2="25" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                    <circle cx="25" cy="25" r="4" fill="#ef4444" />
                    <circle cx="195" cy="25" r="4" fill="#ef4444" />
                    <circle cx="195" cy="110" r="4" fill="#ef4444" />
                    <circle cx="25" cy="110" r="4" fill="#ef4444" />

                    {/* Callout Tag: Volume Delta */}
                    <g transform="translate(45, 140)">
                      <rect x="0" y="0" width="130" height="22" rx="3" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1" />
                      <text x="8" y="15" fill="#f87171" fontSize="10" fontWeight="700" fontFamily="monospace">ΔVol: +{volumeDelta} m³ DELTA</text>
                    </g>
                  </g>
                )}

                {activeStage === 't3' && (
                  /* T3 Ground Vehicle MMS-4 Perspective: Vehicle Upward Laser Scan */
                  <g>
                    {/* Simulated High-Density LiDAR Laser Beams */}
                    <polygon points="110,240 18,30 202,30" fill="rgba(56, 189, 248, 0.08)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" strokeDasharray="4 2" />
                    
                    {/* Concrete Column Return Points */}
                    <circle cx="35" cy="35" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                    <circle cx="105" cy="35" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                    <circle cx="185" cy="35" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                    <circle cx="35" cy="95" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                    <circle cx="185" cy="95" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                    
                    {/* Corrugated Blue Tin Roofing Mesh */}
                    <rect x="30" y="30" width="160" height="70" fill="rgba(2, 132, 199, 0.3)" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2" />
                    
                    {/* Annotation */}
                    <g transform="translate(20, 130)">
                      <rect x="0" y="0" width="180" height="34" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#fbbf24" strokeWidth="1" />
                      <text x="8" y="14" fill="#fbbf24" fontSize="9" fontWeight="700" fontFamily="sans-serif">MMS-4 OPTICAL & LIDAR CONCURRENCE</text>
                      <text x="8" y="27" fill="#fde68a" fontSize="9" fontFamily="monospace">Pillars Erected • Tin Roof Verified</text>
                    </g>
                  </g>
                )}
              </g>

              {/* Viewport Crosshairs & HUD Elements */}
              <line x1="400" y1="20" x2="400" y2="40" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
              <line x1="400" y1="320" x2="400" y2="340" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
              <line x1="20" y1="180" x2="40" y2="180" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
              <line x1="760" y1="180" x2="780" y2="180" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />

              {/* Display Mode Indicator (Top-Right HUD) */}
              <g transform="translate(630, 20)">
                <rect x="0" y="0" width="150" height="24" rx="3" fill="rgba(11, 16, 27, 0.85)" stroke="rgba(56, 189, 248, 0.3)" />
                <text x="10" y="16" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                  LAYER: {displayMode.toUpperCase()}
                </text>
              </g>
            </svg>

            {/* Overlaid Top-Left Status Badge */}
            <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
              <span
                style={{
                  background: activeStage === 't2' ? 'rgba(186, 26, 26, 0.92)' : 'rgba(11, 31, 58, 0.9)',
                  color: '#ffffff',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  backdropFilter: 'blur(6px)',
                  border: `1px solid ${activeStage === 't2' ? '#ef4444' : 'rgba(56, 189, 248, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  {activeStage === 't1' ? 'verified' : activeStage === 't2' ? 'warning' : 'camera_alt'}
                </span>
                <span>
                  {activeStage === 't1' && 'BASELINE: 2025-02-14 (Satellite DSM 0.3m Compliant)'}
                  {activeStage === 't2' && 'POTENTIAL DIFF DETECTED: 2026-07-28 (+4.3m Vertical Shift)'}
                  {activeStage === 't3' && 'GROUND MMS-4 TRUTH: 2026-08-04 (Pillars Confirmed)'}
                </span>
              </span>
            </div>

            {/* Layer Mode Switcher Buttons inside Viewport (Top-Right) */}
            <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setDisplayMode('composite')}
                style={{
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  background: displayMode === 'composite' ? '#0284c7' : 'rgba(15, 23, 42, 0.8)',
                  color: '#fff',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                Composite
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('lidar')}
                style={{
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  background: displayMode === 'lidar' ? '#d97706' : 'rgba(15, 23, 42, 0.8)',
                  color: '#fff',
                  border: '1px solid rgba(217, 119, 6, 0.4)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                LiDAR DSM
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('cadastre')}
                style={{
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  background: displayMode === 'cadastre' ? '#059669' : 'rgba(15, 23, 42, 0.8)',
                  color: '#fff',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                Cadastre
              </button>
            </div>

            {/* Bottom Metrics Bar on Viewport */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                right: '12px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span className="metric-label">Elevation Height</span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: activeStage === 't2' ? 'var(--color-error)' : 'var(--color-primary)',
                  }}
                >
                  {activeStage === 't1' ? `${t1Data.heightM} m` : activeStage === 't2' ? `${t2Data.heightM} m (+${heightDelta}m)` : `${t2Data.heightM} m Confirmed`}
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />
              <div style={{ textAlign: 'center' }}>
                <span className="metric-label">Footprint Surface</span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: activeStage === 't2' ? 'var(--color-error)' : 'var(--color-primary)',
                  }}
                >
                  {activeStage === 't1' ? `${t1Data.footprintSqm.toLocaleString()} m²` : activeStage === 't2' ? `${t2Data.footprintSqm.toLocaleString()} m² (+${footprintDelta}m²)` : 'Roof Canopy Present'}
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />
              <div style={{ textAlign: 'center' }}>
                <span className="metric-label">Rooftop Structure</span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: activeStage === 't1' ? 'var(--color-secondary)' : 'var(--color-error)',
                  }}
                >
                  {activeStage === 't1' ? 'Nil (Clean Terrace)' : activeStage === 't2' ? 'Unverified Extrusion' : 'RCC Pillars & Tin Roof'}
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />
              <div style={{ textAlign: 'center' }}>
                <span className="metric-label">Concurrence Score</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                  {activeStage === 't1' ? '96.4%' : activeStage === 't2' ? '81.0%' : '92.5%'}
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
              <MetricChip label="Height Shift" value={`+${heightDelta}`} unit="meters" highlight />
              <MetricChip label="Footprint Diff" value={`+${footprintDelta}`} unit="m²" highlight />
            </div>

            <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.25)', marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-error)' }}>
                Unauthorized Volume: +{volumeDelta.toLocaleString()} m³
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-on-surface-variant)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                ΔV = {canopyAreaSqm} m² (Canopy Area) × ({t2Data.heightM} - {t1Data.heightM})m ≈ {volumeDelta} m³
              </div>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', lineHeight: '1.4' }}>
              Multi-spectral DSM stereo photogrammetry flags an anomalous vertical height jump exceeding the sanctioned terrace boundary. Ground survey confirmed non-permitted columns.
            </p>
          </div>

          <div className="instrument-card">
            <div className="card-header">
              <span className="card-title">Ground Truth Alignment</span>
              <span className="status-badge verified">MMS-4 Synced</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-on-surface)', lineHeight: '1.4' }}>
              Mobile Mapping System vehicle camera confirms newly erected reinforced cement concrete (RCC) columns and galvanized roofing sheets on terrace level.
            </p>
            <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
              <button
                className="btn-secondary"
                onClick={handleOpenIn3D}
                style={{ flex: 1, fontSize: '11px', justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>3d_rotation</span>
                <span>View in 3D</span>
              </button>
              <button
                className="btn-primary"
                onClick={handleOpenQueue}
                style={{ flex: 1, fontSize: '11px', justifyContent: 'center', background: '#7c3aed', borderColor: '#7c3aed' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>fact_check</span>
                <span>Review</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discrepancy Alerts Table with Interactive Selection */}
      <div className="instrument-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="card-title">Precomputed Discrepancy Signals ({alerts.length})</span>
            <span className="status-badge review" style={{ fontSize: '10px' }}>
              Statutory Verification Required
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-outline)', fontFamily: 'var(--font-mono)' }}>
            Click an alert to inspect sensor evidence
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alerts.map((al, idx) => (
            <div
              key={al.id}
              onClick={() => setSelectedAlertIndex(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: selectedAlertIndex === idx ? 'rgba(2, 132, 199, 0.08)' : 'var(--color-surface-container-low)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: `4px solid ${al.severity === 'High' || al.severity === 'Critical' ? 'var(--color-error)' : 'var(--color-review)'}`,
                border: selectedAlertIndex === idx ? '1px solid #0284c7' : '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
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
                  {selectedAlertIndex === idx && (
                    <span style={{ fontSize: '10px', color: '#0284c7', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      ● Active Inspection
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                  {al.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span className="status-badge review" style={{ fontSize: '10px' }}>
                  {al.status}
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAlertIndex(idx);
                    handleOpenIn3D();
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>
                  <span>3D Focus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

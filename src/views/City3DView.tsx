import React, { useState } from 'react';
import CesiumViewer from '../components/CesiumViewer';
import type { CandidateVsu } from '../types/cadastre';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricChip } from '../components/common/MetricChip';
import { calculateEvacuationPath, SITE_COORDINATES, ARCHITECTURAL_VIOLATIONS } from '../data/buildingData';
import { Cartesian3, Math as CesiumMath, HeadingPitchRange } from 'cesium';

interface City3DViewProps {
  viewerRef: React.RefObject<any>;
  floors: any[];
  selectedVsu: CandidateVsu | null;
  onSelectVsu: (vsu: CandidateVsu | null) => void;
  onNavigateToVerify?: (vsu: CandidateVsu) => void;
}

export function normalizeCadastralVsu(raw: any): CandidateVsu | null {
  if (!raw) return null;
  const floorNum = raw.floorNumber ?? (raw.unitNumber ? parseInt(String(raw.unitNumber).slice(0, -2) || '1', 10) : 1);
  const zBot = raw.zBottomM ?? raw.relativeZ?.bottom ?? (1.2 + (floorNum - 1) * 3.4);
  const zTop = raw.zTopM ?? raw.relativeZ?.top ?? (zBot + 3.4);

  const carpet = typeof raw.carpetAreaSqm === 'number'
    ? raw.carpetAreaSqm
    : parseFloat(String(raw.carpetArea || raw.carpetAreaSqm || '88.0').replace(/[^\d.]/g, '')) || 88.0;

  const builtup = typeof raw.builtupAreaSqm === 'number'
    ? raw.builtupAreaSqm
    : parseFloat(String(raw.builtUpArea || raw.builtupAreaSqm || '106.0').replace(/[^\d.]/g, '')) || 106.0;

  const vol = typeof raw.volumeCum === 'number'
    ? raw.volumeCum
    : parseFloat(String(raw.volume || raw.volumeCum || (builtup * 3.4).toFixed(1)).replace(/[^\d.]/g, '')) || 360.4;

  let stat = raw.verificationStatus || raw.status || 'Verified';
  if (stat === 'Title Clear & Verified') stat = 'Verified';
  if (stat === 'Deviation Flagged') stat = 'Conflict';

  const identifier = raw.prototypeVsuIdentifier || raw.id || `DEMO-MH-MUM-0001-VSU-A-${String(floorNum).padStart(2, '0')}-${raw.unitNumber || '101'}`;

  return {
    id: raw.id || identifier,
    buildingId: raw.buildingId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    floorId: raw.floorId || `floor-${floorNum}`,
    floorNumber: floorNum,
    prototypeVsuIdentifier: identifier,
    unitNumber: String(raw.unitNumber || '101'),
    unitName: raw.unitName || `Unit ${raw.unitNumber}`,
    useType: raw.useType || raw.use || 'Residential',
    carpetAreaSqm: carpet,
    builtupAreaSqm: builtup,
    volumeCum: vol,
    zBottomM: Number(zBot),
    zTopM: Number(zTop),
    confidenceTier: raw.confidenceTier || 'Tier A',
    verificationStatus: stat as any,
    mockDocumentReference: raw.mockDocumentReference || raw.deedNumber || 'MOCK-REG-2024-DEMO',
    mockOccupantName: raw.mockOccupantName || raw.owner || 'Demonstration Owner',
    quadrantCode: raw.quadrantCode || String(raw.unitNumber || '').slice(-1) || '1',
    hasViolation: raw.hasViolation || false,
    violationDetails: raw.violationDetails,
  };
}

export const City3DView: React.FC<City3DViewProps> = ({
  viewerRef,
  floors,
  selectedVsu,
  onSelectVsu,
  onNavigateToVerify,
}) => {
  const [activeFloorFilter, setActiveFloorFilter] = useState<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<any>(null);
  const [hoveredVsuId, setHoveredVsuId] = useState<string | null>(null);

  // 3D Controls
  const [isExploded, setIsExploded] = useState(false);
  const [transparencyMode, setTransparencyMode] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [viewMode, setViewMode] = useState<'interactive' | 'model'>('interactive');
  const [activeMode, setActiveMode] = useState<'cadastre' | 'audit' | 'sos'>('cadastre');
  const [evacuationPath, setEvacuationPath] = useState<any[] | null>(null);

  const activeVsu = selectedVsu ? normalizeCadastralVsu(selectedVsu) : null;

  const handleSelectVsu = (raw: any) => {
    if (!raw) {
      onSelectVsu(null);
      return;
    }
    const norm = normalizeCadastralVsu(raw);
    onSelectVsu(norm);
    if (norm) {
      const parent = floors.find((f: any) => f.floorNumber === norm.floorNumber);
      setSelectedFloor(parent);
    }
  };

  // Camera Controls
  const handleFlyToTower = () => {
    if (!viewerRef.current?.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
    const { longitude: lon, latitude: lat } = SITE_COORDINATES;

    viewer.camera.lookAt(
      Cartesian3.fromDegrees(lon, lat, 14.0),
      new HeadingPitchRange(CesiumMath.toRadians(35), CesiumMath.toRadians(-20), isExploded ? 85.0 : 65.0)
    );
  };

  const handleTopDownCadastre = () => {
    if (!viewerRef.current?.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
    const { longitude: lon, latitude: lat } = SITE_COORDINATES;

    viewer.camera.lookAt(
      Cartesian3.fromDegrees(lon, lat, 0.0),
      new HeadingPitchRange(CesiumMath.toRadians(0), CesiumMath.toRadians(-89.9), 90.0)
    );
  };

  const handleTriggerSOS = () => {
    if (!activeVsu) return;
    const quad = activeVsu.unitNumber.slice(-1);
    const path = calculateEvacuationPath(activeVsu.floorNumber || 1, quad);
    setEvacuationPath(path);
  };

  const handleModeChange = (mode: 'cadastre' | 'audit' | 'sos') => {
    setActiveMode(mode);
    if (mode === 'sos') {
      setTransparencyMode(true);
    } else {
      setEvacuationPath(null);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* 3D Cesium Viewport */}
      <CesiumViewer
        viewerRef={viewerRef}
        floors={floors}
        isExploded={isExploded}
        explodeScale={1.0}
        activeFloorFilter={activeFloorFilter}
        selectedFloor={selectedFloor}
        selectedVsu={activeVsu}
        hoveredVsuId={hoveredVsuId}
        transparencyMode={transparencyMode}
        isEmergencyMode={activeMode === 'sos'}
        isAuditMode={activeMode === 'audit'}
        evacuationPath={evacuationPath}
        showLabels={showLabels}
        viewMode={viewMode}
        onSelectFloor={(f: any) => {
          setSelectedFloor(f);
          onSelectVsu(null);
        }}
        onSelectVsu={handleSelectVsu}
        onHoverVsu={setHoveredVsuId}
      />

      {/* Floating Floating Stitch CAD Toolbar (Top Left) */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          width: '320px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8)',
          color: '#f8fafc',
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: '#38bdf8' }}>
              3D CADASTRE COCKPIT
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              CTS-9812/2A • Tower A
            </div>
          </div>
          <span className="status-badge verified" style={{ fontSize: '9px' }}>
            3D Assets Available
          </span>
        </div>

        {/* Mode Selector */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '4px',
            background: 'rgba(2, 6, 23, 0.8)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '12px',
          }}
        >
          <button
            style={{
              padding: '6px 4px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeMode === 'cadastre' ? 'var(--color-secondary)' : 'transparent',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            onClick={() => handleModeChange('cadastre')}
          >
            📐 Cadastre
          </button>
          <button
            style={{
              padding: '6px 4px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeMode === 'audit' ? 'var(--color-error)' : 'transparent',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            onClick={() => handleModeChange('audit')}
          >
            🔍 Audit
          </button>
          <button
            style={{
              padding: '6px 4px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeMode === 'sos' ? '#ea580c' : 'transparent',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            onClick={() => handleModeChange('sos')}
          >
            🚨 SOS
          </button>
        </div>

        {/* Floor Filter Slider */}
        <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px', color: '#cbd5e1' }}>
            <span>Floor Isolator</span>
            <strong style={{ color: '#38bdf8' }}>{activeFloorFilter ? `Floor ${activeFloorFilter}` : 'All Floors'}</strong>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={activeFloorFilter ?? 0}
            onChange={(e) => setActiveFloorFilter(e.target.value === '0' ? null : Number(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
        </div>

        {/* Quick CAD Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <button className="btn-secondary" style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }} onClick={handleFlyToTower}>
            🎯 Fly to Tower A
          </button>
          <button
            className="btn-secondary"
            style={{
              fontSize: '11px',
              padding: '6px 8px',
              justifyContent: 'center',
              background: isExploded ? '#f59e0b' : undefined,
              color: isExploded ? '#000000' : undefined,
              fontWeight: isExploded ? 700 : undefined,
            }}
            onClick={() => setIsExploded(!isExploded)}
          >
            {isExploded ? '⤓ Collapse' : '⤒ Explode Floors'}
          </button>
          <button className="btn-secondary" style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }} onClick={handleTopDownCadastre}>
            🗺 Top-Down View
          </button>
          <button
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
            onClick={() => setTransparencyMode(!transparencyMode)}
          >
            👁 {transparencyMode ? 'Solid Mode' : 'X-Ray'}
          </button>
          <button
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
            onClick={() => setShowLabels(!showLabels)}
          >
            🏷 {showLabels ? 'Hide Labels' : 'Show Labels'}
          </button>
          <button
            className={viewMode === 'interactive' ? 'btn-secondary' : 'btn-teal'}
            style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
            onClick={() => setViewMode(viewMode === 'interactive' ? 'model' : 'interactive')}
            title="Toggle between Procedural Cadastre and Photorealistic GLB Model"
          >
            🏢 {viewMode === 'interactive' ? 'Model: Procedural' : 'Model: Photorealistic'}
          </button>
        </div>
      </div>

      {/* Right Collapsible Inspection Panel (Stitch Style) */}
      {(activeVsu || selectedFloor || activeMode === 'audit') && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '380px',
            maxHeight: 'calc(100% - 32px)',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8)',
            color: '#f8fafc',
            overflowY: 'auto',
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: '#38bdf8' }}>
              {activeMode === 'audit' ? 'ARCHITECTURAL AUDIT & DEVIATIONS' : 'SPATIAL PROPERTY INSPECTION'}
            </span>
            <button
              onClick={() => {
                onSelectVsu(null);
                setSelectedFloor(null);
              }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>

          {/* VSU Details */}
          {activeVsu ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  background: 'rgba(2, 132, 199, 0.18)',
                  borderLeft: '3px solid #0284c7',
                  padding: '10px',
                  borderRadius: '0 4px 4px 0',
                }}
              >
                <div style={{ fontSize: '9px', color: '#7dd3fc', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  PROTOTYPE VSU IDENTIFIER
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#ffffff', wordBreak: 'break-all', marginTop: '2px' }}>
                  {activeVsu.prototypeVsuIdentifier}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <MetricChip label="Carpet Area" value={activeVsu.carpetAreaSqm} unit="m²" />
                <MetricChip label="Built-up Area" value={activeVsu.builtupAreaSqm} unit="m²" />
                <MetricChip label="3D Volume" value={activeVsu.volumeCum} unit="m³" />
                <MetricChip
                  label="Z-Range"
                  value={`${(activeVsu.zBottomM ?? 0).toFixed(1)}m – ${(activeVsu.zTopM ?? 0).toFixed(1)}m`}
                />
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '11px' }}>
                <div>Mock Titleholder: <strong>{activeVsu.mockOccupantName || 'Demonstration Owner'}</strong></div>
                <div style={{ marginTop: '3px' }}>Mock Document: <code style={{ color: '#38bdf8' }}>{activeVsu.mockDocumentReference}</code></div>
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Status:</span>
                  <StatusBadge status={activeVsu.verificationStatus} />
                </div>
              </div>

              {activeMode === 'sos' && (
                <button className="btn-teal" onClick={handleTriggerSOS} style={{ width: '100%', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>route</span>
                  <span>Trace 3D Escape Route</span>
                </button>
              )}

              {onNavigateToVerify && (
                <button className="btn-secondary" onClick={() => onNavigateToVerify(activeVsu)} style={{ width: '100%', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>fact_check</span>
                  <span>Open in Verification Queue</span>
                </button>
              )}
            </div>
          ) : selectedFloor ? (
            <div>
              <h3 style={{ color: '#f59e0b', fontSize: '14px' }}>{selectedFloor.floorLabel}</h3>
              <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                Elevation: {selectedFloor.zBottom.toFixed(1)}m – {selectedFloor.zTop.toFixed(1)}m (Height: {selectedFloor.floorHeight}m)
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                {selectedFloor.vsus.map((u: any) => (
                  <button
                    key={u.id}
                    className="btn-secondary"
                    style={{ fontSize: '10px', padding: '4px 8px' }}
                    onClick={() => handleSelectVsu(u)}
                  >
                    Unit {u.unitNumber} ({u.use})
                  </button>
                ))}
              </div>
            </div>
          ) : activeMode === 'audit' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                Detected geometric variations between Sanctioned CAD blueprints and mobile LiDAR / drone scans:
              </div>
              {ARCHITECTURAL_VIOLATIONS.map((v) => (
                <div
                  key={v.id}
                  style={{
                    background: 'rgba(220, 38, 38, 0.14)',
                    borderLeft: '3px solid var(--color-error)',
                    padding: '10px',
                    borderRadius: '0 4px 4px 0',
                  }}
                >
                  <strong style={{ color: '#fca5a5', fontSize: '12px' }}>{v.type}</strong>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#fde047', marginTop: '2px' }}>
                    {v.dimensionalDeviation}
                  </div>
                  <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

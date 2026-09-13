import React, { useState, useMemo, useEffect } from 'react';
import CesiumViewer from '../components/CesiumViewer';
import type { CandidateVsu, UserRole } from '../types/cadastre';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricChip } from '../components/common/MetricChip';
import {
  calculateEvacuationPath,
  SITE_COORDINATES,
  ARCHITECTURAL_VIOLATIONS,
  BUILDINGS_REGISTRY,
  findBuilding,
  generateBuildingFloors,
} from '../data/buildingData';
import { Cartesian3, Math as CesiumMath, HeadingPitchRange } from 'cesium';

interface City3DViewProps {
  viewerRef: React.RefObject<any>;
  floors?: any[];
  selectedBuildingId?: string;
  onSelectBuilding?: (buildingId: string) => void;
  selectedVsu: CandidateVsu | null;
  onSelectVsu: (vsu: CandidateVsu | null) => void;
  onNavigateToVerify?: (vsu: CandidateVsu) => void;
  initialMode?: 'cadastre' | 'audit' | 'sos';
  currentRole?: UserRole;
}

function normalizeCadastralVsu(raw: any): CandidateVsu | null {
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
  selectedBuildingId,
  onSelectBuilding,
  selectedVsu,
  onSelectVsu,
  onNavigateToVerify,
  initialMode,
  currentRole = 'public_demo',
}) => {
  // Resolve active building from registry
  const activeBuilding = useMemo(() => {
    return findBuilding(selectedBuildingId);
  }, [selectedBuildingId]);

  // Generate dynamic vertical floors for the active building
  const activeFloors = useMemo<any[]>(() => {
    if (activeBuilding.code === 'TOWER-A' && floors && floors.length > 0) {
      return floors;
    }
    return generateBuildingFloors(activeBuilding.id);
  }, [activeBuilding.id, activeBuilding.code, floors]);

  const [activeFloorFilter, setActiveFloorFilter] = useState<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<any>(null);
  const [hoveredVsuId, setHoveredVsuId] = useState<string | null>(null);

  // 3D Controls
  const [isExploded, setIsExploded] = useState(false);
  const [transparencyMode, setTransparencyMode] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [viewMode, setViewMode] = useState<'interactive' | 'model'>('interactive');
  const [activeMode, setActiveMode] = useState<'cadastre' | 'audit' | 'sos'>(initialMode || 'cadastre');
  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);
  const [evacuationPath, setEvacuationPath] = useState<any[] | null>(null);

  // Synchronize state when initialMode prop changes (standard React pattern)
  if (initialMode && initialMode !== prevInitialMode) {
    setPrevInitialMode(initialMode);
    setActiveMode(initialMode);
    if (initialMode === 'sos') {
      setTransparencyMode(true);
      const floorToUse = selectedVsu?.floorNumber || Math.min(activeBuilding.totalFloors, 6);
      const quad = selectedVsu?.quadrantCode || '1';
      setEvacuationPath(calculateEvacuationPath(floorToUse, quad, activeBuilding.id));
    }
  }

  // Derive effective floor filter safely clamped to active structure
  const effectiveFloorFilter =
    activeFloorFilter && activeFloorFilter <= activeBuilding.totalFloors ? activeFloorFilter : null;

  const activeVsu = selectedVsu ? normalizeCadastralVsu(selectedVsu) : null;

  const handleFocusFlat = (targetVsu: any) => {
    if (!viewerRef.current?.cesiumElement || !targetVsu) return;
    const viewer = viewerRef.current.cesiumElement;
    const { longitude: lon, latitude: lat } = activeBuilding.coordinates || SITE_COORDINATES;
    const norm = normalizeCadastralVsu(targetVsu);
    if (!norm) return;

    const zCenter = (norm.zBottomM + norm.zTopM) / 2;
    const targetCenter = Cartesian3.fromDegrees(lon, lat, zCenter);

    viewer.camera.lookAt(
      targetCenter,
      new HeadingPitchRange(CesiumMath.toRadians(35), CesiumMath.toRadians(-18), 30.0)
    );
  };

  // Automatically focus on flat and select floor when selectedVsu changes (e.g. from Registry 3D Focus)
  useEffect(() => {
    if (!selectedVsu) return;
    const norm = normalizeCadastralVsu(selectedVsu);
    if (!norm) return;

    const parent = activeFloors.find((f: any) => f.floorNumber === norm.floorNumber);
    if (parent) {
      setSelectedFloor(parent);
    }

    const timer = setTimeout(() => {
      handleFocusFlat(norm);
    }, 90);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVsu, activeBuilding.id, activeFloors]);

  const handleSelectBuildingInternal = (buildingId: string) => {
    if (onSelectBuilding) {
      onSelectBuilding(buildingId);
    }
    setActiveFloorFilter(null);
    setSelectedFloor(null);
    onSelectVsu(null);
    setEvacuationPath(null);

    const b = findBuilding(buildingId);
    if (viewerRef.current?.cesiumElement && b) {
      const viewer = viewerRef.current.cesiumElement;
      const bHeight = b.heightM || 30.0;
      const targetCenter = Cartesian3.fromDegrees(b.coordinates.longitude, b.coordinates.latitude, bHeight * 0.45);
      const cameraRange = Math.max(50.0, bHeight * 1.75);

      viewer.camera.lookAt(
        targetCenter,
        new HeadingPitchRange(CesiumMath.toRadians(35), CesiumMath.toRadians(-22), cameraRange)
      );
    }
  };

  const handleSelectVsu = (raw: any) => {
    if (!raw) {
      onSelectVsu(null);
      return;
    }
    const norm = normalizeCadastralVsu(raw);
    onSelectVsu(norm);
    if (norm) {
      const parent = activeFloors.find((f: any) => f.floorNumber === norm.floorNumber);
      setSelectedFloor(parent);
      handleFocusFlat(norm);
    }
  };

  // Camera Controls
  const handleFlyToActiveBuilding = () => {
    if (!viewerRef.current?.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
    const { longitude: lon, latitude: lat } = activeBuilding.coordinates || SITE_COORDINATES;
    const bHeight = activeBuilding.heightM || 30.0;

    viewer.camera.lookAt(
      Cartesian3.fromDegrees(lon, lat, bHeight * 0.45),
      new HeadingPitchRange(
        CesiumMath.toRadians(35),
        CesiumMath.toRadians(-20),
        isExploded ? bHeight * 2.2 : bHeight * 1.75
      )
    );
  };

  const handleTopDownCadastre = () => {
    if (!viewerRef.current?.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
    const { longitude: lon, latitude: lat } = activeBuilding.coordinates || SITE_COORDINATES;

    viewer.camera.lookAt(
      Cartesian3.fromDegrees(lon, lat, 0.0),
      new HeadingPitchRange(CesiumMath.toRadians(0), CesiumMath.toRadians(-89.9), 95.0)
    );
  };

  const handleTriggerSOS = () => {
    const floorToUse = activeVsu?.floorNumber || selectedFloor?.floorNumber || (activeFloorFilter || Math.min(activeBuilding.totalFloors, 6));
    const quad = activeVsu?.quadrantCode || (activeVsu?.unitNumber ? activeVsu.unitNumber.slice(-1) : '1');
    const path = calculateEvacuationPath(floorToUse, quad, activeBuilding.id);
    setEvacuationPath(path);
  };

  const handleModeChange = (mode: 'cadastre' | 'audit' | 'sos') => {
    setActiveMode(mode);
    if (mode === 'sos') {
      setTransparencyMode(true);
      const floorToUse = activeVsu?.floorNumber || selectedFloor?.floorNumber || (activeFloorFilter || Math.min(activeBuilding.totalFloors, 6));
      const quad = activeVsu?.quadrantCode || (activeVsu?.unitNumber ? activeVsu.unitNumber.slice(-1) : '1');
      setEvacuationPath(calculateEvacuationPath(floorToUse, quad, activeBuilding.id));
    } else {
      setEvacuationPath(null);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* 3D Cesium Viewport */}
      <CesiumViewer
        viewerRef={viewerRef}
        activeBuilding={activeBuilding}
        allBuildings={BUILDINGS_REGISTRY}
        onSelectBuilding={handleSelectBuildingInternal}
        floors={activeFloors}
        isExploded={isExploded}
        explodeScale={1.0}
        activeFloorFilter={effectiveFloorFilter}
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

      {/* Floating CAD Cockpit HUD (Top Left) */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          width: '340px',
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8)',
          color: '#f8fafc',
          zIndex: 30,
        }}
      >
        {/* Structure Selector & Cadastral Header */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: '#38bdf8' }}>
                3D CADASTRE COCKPIT
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '6px',
                  background: currentRole === 'public_demo' ? 'rgba(2, 132, 199, 0.25)' : currentRole === 'surveyor' ? 'rgba(217, 119, 6, 0.25)' : currentRole === 'municipal_officer' ? 'rgba(124, 58, 237, 0.25)' : 'rgba(5, 150, 105, 0.25)',
                  color: currentRole === 'public_demo' ? '#38bdf8' : currentRole === 'surveyor' ? '#fbbf24' : currentRole === 'municipal_officer' ? '#c084fc' : '#34d399',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {currentRole === 'public_demo' ? 'CITIZEN' : currentRole === 'surveyor' ? 'SURVEYOR' : currentRole === 'municipal_officer' ? 'OFFICER' : 'ADMIN'}
              </span>
            </div>
            <StatusBadge status={activeBuilding.status as any} size="sm" />
          </div>

          {/* Building Selector Dropdown */}
          <div style={{ marginTop: '8px' }}>
            <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Vertical Structure:
            </label>
            <select
              value={activeBuilding.id}
              onChange={(e) => handleSelectBuildingInternal(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                background: 'rgba(2, 6, 23, 0.9)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: 'var(--radius-sm)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {BUILDINGS_REGISTRY.map((b) => (
                <option key={b.id} value={b.id} style={{ background: '#0f172a', color: '#f8fafc' }}>
                  {b.name} ({b.code}) • {b.totalFloors}F • {b.status}
                </option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
            Plot: <span style={{ color: '#f8fafc' }}>{activeBuilding.surveyPlotNumber}</span> • Height: <span style={{ color: '#38bdf8' }}>{activeBuilding.heightM}m</span> ({activeBuilding.totalFloors}F)
          </div>
        </div>

        {/* Structure-Specific Violation Callouts */}
        {activeBuilding.code === 'TOWER-B' && (
          <div
            style={{
              background: 'rgba(220, 38, 38, 0.2)',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px',
              marginBottom: '12px',
              fontSize: '11px',
              color: '#fca5a5',
            }}
          >
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>⚠️ Rooftop LiDAR Discrepancy</span>
            </div>
            <div style={{ marginTop: '2px', fontSize: '10px', color: '#cbd5e1' }}>
              +4.3m unauthorized extension (34.7m actual vs 30.4m sanctioned). Vol: 485.9 m³.
            </div>
          </div>
        )}

        {activeBuilding.code === 'GREEN-RES' && (
          <div
            style={{
              background: 'rgba(217, 119, 6, 0.2)',
              border: '1px solid #d97706',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px',
              marginBottom: '12px',
              fontSize: '11px',
              color: '#fde68a',
            }}
          >
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>⚠️ Setback Encroachment</span>
            </div>
            <div style={{ marginTop: '2px', fontSize: '10px', color: '#cbd5e1' }}>
              Balcony cantilever extends +1.8m into statutory road green buffer.
            </div>
          </div>
        )}

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

        {/* Dynamic Floor Filter Slider */}
        <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px', color: '#cbd5e1' }}>
            <span>Floor Isolator</span>
            <strong style={{ color: '#38bdf8' }}>
              {effectiveFloorFilter ? `Floor ${effectiveFloorFilter} of ${activeBuilding.totalFloors}` : `All ${activeBuilding.totalFloors} Floors`}
            </strong>
          </div>
          <input
            type="range"
            min="0"
            max={activeBuilding.totalFloors}
            value={effectiveFloorFilter ?? 0}
            onChange={(e) => setActiveFloorFilter(e.target.value === '0' ? null : Number(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
        </div>

        {/* Quick CAD Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <button
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
            onClick={handleFlyToActiveBuilding}
          >
            🎯 Fly to {activeBuilding.name}
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
            className={
              activeBuilding.code === 'TOWER-A'
                ? (viewMode === 'interactive' ? 'btn-secondary' : 'btn-teal')
                : (viewMode === 'interactive' && !isExploded ? 'btn-teal' : 'btn-secondary')
            }
            style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
            onClick={() => {
              if (activeBuilding.code === 'TOWER-A') {
                setViewMode(viewMode === 'interactive' ? 'model' : 'interactive');
              } else {
                // Ensure standard procedural twin view: active procedural mode, unexploded, all floors
                setViewMode('interactive');
                setIsExploded(false);
                setActiveFloorFilter(null);
                handleFlyToActiveBuilding();
              }
            }}
            title={
              activeBuilding.code === 'TOWER-A'
                ? 'Toggle between Procedural Cadastre and Photorealistic GLB Model'
                : 'Reset to Standard Procedural Twin View (Unexploded, All Floors)'
            }
          >
            🏛️ {activeBuilding.code === 'TOWER-A' ? (viewMode === 'interactive' ? '3D Model' : 'Procedural Twin') : 'Procedural Twin'}
          </button>
        </div>
      </div>

      {/* Right Collapsible Inspection Panel */}
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
                  PROTOTYPE VSU IDENTIFIER ({activeBuilding.name})
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#ffffff', wordBreak: 'break-all', marginTop: '2px' }}>
                  {activeVsu.prototypeVsuIdentifier}
                </div>
              </div>

              {/* 3D Focus & Floor Isolator Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
                  onClick={() => handleFocusFlat(activeVsu)}
                >
                  🎯 Center Camera
                </button>
                <button
                  className={effectiveFloorFilter === activeVsu.floorNumber ? 'btn-teal' : 'btn-secondary'}
                  style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
                  onClick={() => setActiveFloorFilter(effectiveFloorFilter === activeVsu.floorNumber ? null : (activeVsu.floorNumber ?? null))}
                >
                  🏢 {effectiveFloorFilter === activeVsu.floorNumber ? 'All Floors' : `Floor ${activeVsu.floorNumber} Only`}
                </button>
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
                {activeVsu.hasViolation && (
                  <div style={{ marginTop: '8px', padding: '6px 8px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '4px', color: '#fca5a5' }}>
                    <strong>Flagged Deviation:</strong> {activeVsu.violationDetails}
                  </div>
                )}
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
              <h3 style={{ color: '#f59e0b', fontSize: '14px' }}>
                {activeBuilding.name} • {selectedFloor.floorLabel}
              </h3>
              <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                Elevation: {selectedFloor.zBottom.toFixed(1)}m – {selectedFloor.zTop.toFixed(1)}m (Height: {selectedFloor.floorHeight}m)
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                {selectedFloor.vsus &&
                  selectedFloor.vsus.map((u: any) => (
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
                Detected geometric variations for <strong>{activeBuilding.name}</strong> between Sanctioned CAD blueprints and mobile LiDAR / drone scans:
              </div>

              {activeBuilding.hasRooftopViolation && activeBuilding.rooftopViolation && (
                <div
                  style={{
                    background: 'rgba(220, 38, 38, 0.18)',
                    borderLeft: '3px solid var(--color-error)',
                    padding: '10px',
                    borderRadius: '0 4px 4px 0',
                  }}
                >
                  <strong style={{ color: '#fca5a5', fontSize: '12px' }}>{activeBuilding.rooftopViolation.type}</strong>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#fde047', marginTop: '2px' }}>
                    Sanctioned: {activeBuilding.sanctionedHeightM}m | Actual: {activeBuilding.heightM}m (+4.3m Delta, 485.9 m³)
                  </div>
                  <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                    {activeBuilding.rooftopViolation.description}
                  </p>
                </div>
              )}

              {activeBuilding.hasSetbackViolation && activeBuilding.setbackViolation && (
                <div
                  style={{
                    background: 'rgba(217, 119, 6, 0.18)',
                    borderLeft: '3px solid #d97706',
                    padding: '10px',
                    borderRadius: '0 4px 4px 0',
                  }}
                >
                  <strong style={{ color: '#fde68a', fontSize: '12px' }}>{activeBuilding.setbackViolation.type}</strong>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#fde047', marginTop: '2px' }}>
                    +1.8m horizontal cantilever deviation beyond sanctioned plot boundary
                  </div>
                  <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                    {activeBuilding.setbackViolation.description}
                  </p>
                </div>
              )}

              {activeBuilding.code === 'TOWER-A' &&
                ARCHITECTURAL_VIOLATIONS.map((v) => (
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

              {!activeBuilding.hasRooftopViolation && !activeBuilding.hasSetbackViolation && activeBuilding.code !== 'TOWER-A' && (
                <div
                  style={{
                    background: 'rgba(34, 197, 94, 0.12)',
                    borderLeft: '3px solid var(--color-verified)',
                    padding: '10px',
                    borderRadius: '0 4px 4px 0',
                    color: '#86efac',
                    fontSize: '11px',
                  }}
                >
                  ✓ No severe structural or height deviations currently flagged for {activeBuilding.name}.
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { cadastreService } from '../services/cadastreService';
import type { DiscrepancyAlert, CandidateVsu } from '../types/cadastre';
import { MetricChip } from '../components/common/MetricChip';

interface DiscrepancyStudioViewProps {
  onNavigateTab?: (tab: any) => void;
  onSelectBuilding?: (buildingId: string) => void;
  onSelectVsu?: (vsu: CandidateVsu) => void;
}

interface AffectedFlatInfo {
  unitNumber: string;
  unitName: string;
  vsuId: string;
  prototypeId: string;
  canonical3dUlpin: string;
  occupant: string;
  deed: string;
  carpetAreaSqm: number;
  builtupAreaSqm: number;
  quadrant: string;
  floorNumber: number;
  zBottomM: number;
  zTopM: number;
  volumeCum: number;
}

interface DiscrepancyData {
  alertCode: string;
  alertType: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  buildingId: string;
  buildingName: string;
  buildingCode: string;
  surveyPlot: string;
  floorNumber: number;
  floorLabel: string;
  affectedFlats: AffectedFlatInfo[];
  deviationType: string;
  infringementClause: string;
  shortSummary: string;
  detailedAnalysis: string;
  groundTruthNotes: string;
  metrics: {
    primaryShiftLabel: string;
    primaryShiftValue: string;
    secondaryDiffLabel: string;
    secondaryDiffValue: string;
    unauthorizedQuantityLabel: string;
    unauthorizedQuantityValue: string;
    formula: string;
  };
  stages: {
    t1: {
      buttonLabel: string;
      title: string;
      sensor: string;
      elevationOrSetback: string;
      footprintOrMargin: string;
      structureStatus: string;
      concurrence: string;
    };
    t2: {
      buttonLabel: string;
      title: string;
      sensor: string;
      elevationOrSetback: string;
      footprintOrMargin: string;
      structureStatus: string;
      concurrence: string;
    };
    t3: {
      buttonLabel: string;
      title: string;
      sensor: string;
      elevationOrSetback: string;
      footprintOrMargin: string;
      structureStatus: string;
      concurrence: string;
    };
  };
}

const DISCREPANCY_REGISTRY: DiscrepancyData[] = [
  {
    alertCode: 'ALT-2026-0042',
    alertType: 'Unauthorized Rooftop Extension (+4.3m)',
    severity: 'High',
    buildingId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    buildingName: 'Tower B',
    buildingCode: 'TOWER-B',
    surveyPlot: 'CTS-9812/2B (Twin Towers)',
    floorNumber: 9,
    floorLabel: 'Floor 9 (Terrace Level)',
    deviationType: 'Vertical Height & Volume Enclosure Extrusion',
    infringementClause: 'Section 32 MMC Act & DCR Rule 30(2) — Unauthorized FSI vertical construction exceeding sanctioned terrace boundary.',
    shortSummary: 'Satellite T1 vs T2 differential detects +4.3m vertical elevation shift on terrace level exceeding sanctioned master plan baseline.',
    detailedAnalysis: 'Multi-spectral satellite stereo photogrammetry and LiDAR DSM detect an unauthorized enclosed 9th-floor penthouse and rooftop canopy jutting 4.3 meters above the sanctioned 30.40m ceiling datum.',
    groundTruthNotes: 'Mobile Mapping System vehicle camera (MMS-4) and ground inspection confirm newly erected reinforced cement concrete (RCC) columns and galvanized blue corrugated roofing sheets on terrace level.',
    metrics: {
      primaryShiftLabel: 'Height Shift',
      primaryShiftValue: '+4.3 m',
      secondaryDiffLabel: 'Footprint Diff',
      secondaryDiffValue: '+42.6 m²',
      unauthorizedQuantityLabel: 'Unauthorized Volume',
      unauthorizedQuantityValue: '+485.9 m³',
      formula: 'ΔV = 113.0 m² (Canopy Area) × (34.7 - 30.4)m ≈ 485.9 m³',
    },
    stages: {
      t1: {
        buttonLabel: 'T1: Feb 2025 (Baseline)',
        title: 'BASELINE: 2025-02-14 (Sanctioned 8 Floors • Clean Terrace Compliant)',
        sensor: 'Satellite DSM Nadir Pass (0.3m GSD)',
        elevationOrSetback: '30.4 m MSL',
        footprintOrMargin: '1,104.0 m²',
        structureStatus: 'Nil (Clean Open Terrace)',
        concurrence: '96.4%',
      },
      t2: {
        buttonLabel: 'T2: Jul 2026 (Detected Diff)',
        title: 'POTENTIAL DIFF DETECTED: 2026-07-28 (+4.3m Vertical Shift Flagged)',
        sensor: 'Multi-Spectral Satellite Stereo Pair DSM',
        elevationOrSetback: '34.7 m (+4.3m)',
        footprintOrMargin: '1,146.6 m² (+42.6m²)',
        structureStatus: 'Unverified Rooftop Extrusion',
        concurrence: '81.0%',
      },
      t3: {
        buttonLabel: 'Aug 2026 (Ground Vehicle)',
        title: 'GROUND MMS-4 TRUTH: 2026-08-04 (Pillars & Tin Roof Verified)',
        sensor: 'Mobile Mapping System 4K Optical + Mobile LiDAR',
        elevationOrSetback: '34.7 m Confirmed',
        footprintOrMargin: 'Enclosed Canopy Present',
        structureStatus: 'RCC Pillars & Tin Roof',
        concurrence: '92.5%',
      },
    },
    affectedFlats: [
      {
        unitNumber: '901',
        unitName: 'Executive Suite East 901',
        vsuId: 'vsu-b-9-01',
        prototypeId: 'DEMO-MH-MUM-0001-VSU-B-09-901',
        canonical3dUlpin: 'ULPIN3D-MH-CTS98122A-B-F09-U901-Z30.4_34.7',
        occupant: 'Rajesh V. Deshmukh',
        deed: 'MOCK-REG-2024-5011B',
        carpetAreaSqm: 124.0,
        builtupAreaSqm: 152.0,
        quadrant: 'Q1 (East Quadrant)',
        floorNumber: 9,
        zBottomM: 30.4,
        zTopM: 34.7,
        volumeCum: 516.8,
      },
      {
        unitNumber: '902',
        unitName: 'Panorama Residence West 902',
        vsuId: 'vsu-b-9-02',
        prototypeId: 'DEMO-MH-MUM-0001-VSU-B-09-902',
        canonical3dUlpin: 'ULPIN3D-MH-CTS98122A-B-F09-U902-Z30.4_34.7',
        occupant: 'Pooja Anant Joshi',
        deed: 'MOCK-REG-2024-5012B',
        carpetAreaSqm: 119.5,
        builtupAreaSqm: 146.8,
        quadrant: 'Q2 (West Quadrant)',
        floorNumber: 9,
        zBottomM: 30.4,
        zTopM: 34.7,
        volumeCum: 499.1,
      },
    ],
  },
  {
    alertCode: 'ALT-2026-0089',
    alertType: 'Civic Setback Balcony Overhang Encroachment',
    severity: 'Medium',
    buildingId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    buildingName: 'Tower A',
    buildingCode: 'TOWER-A',
    surveyPlot: 'CTS-9812/2A (Twin Towers)',
    floorNumber: 6,
    floorLabel: 'Floor 6 (Mid-Rise Level)',
    deviationType: 'Horizontal Marginal Setback Cantilever Intrusion',
    infringementClause: 'DCR Rule 43(1) & NBC 2016 Sec 4.3 — Prohibited cantilever projection in statutory side marginal setback open space.',
    shortSummary: 'Cantilever living balcony overhang (+1.65m) encroaches toward civic side setback perimeter on Floor 6.',
    detailedAnalysis: 'Sanctioned architectural CAD blueprints show a flush facade with internal recessed balcony. Drone photogrammetry and terrestrial mobile LiDAR point cloud reveal a 1.65m cantilevered extension constructed without approval.',
    groundTruthNotes: 'Terrestrial Mobile LiDAR facade scan (0.012m RMSE) and street-level high-res photography confirm living room cantilever slab jutting into the required 5.0m marginal space, reducing buffer to 3.35m.',
    metrics: {
      primaryShiftLabel: 'Cantilever Overhang',
      primaryShiftValue: '+1.65 m',
      secondaryDiffLabel: 'Setback Margin',
      secondaryDiffValue: '3.35 m (vs 5.0m)',
      unauthorizedQuantityLabel: 'Encroachment Area',
      unauthorizedQuantityValue: '+14.8 m²',
      formula: 'ΔArea = 8.97m (Balcony Width) × 1.65m (Protrusion) ≈ 14.8 m²',
    },
    stages: {
      t1: {
        buttonLabel: 'T1: Nov 2024 (Baseline)',
        title: 'BASELINE: 2024-11-15 (Sanctioned CAD Rev 4 • Balcony Flush)',
        sensor: 'Municipal Sanctioned Vector CAD Blueprint',
        elevationOrSetback: '0.00m (Flush)',
        footprintOrMargin: '5.00 m Marginal Clear',
        structureStatus: 'Compliant Flush Facade',
        concurrence: '99.1%',
      },
      t2: {
        buttonLabel: 'T2: Mar 2026 (Detected Diff)',
        title: 'POTENTIAL DIFF DETECTED: 2026-03-22 (+1.65m Balcony Overhang)',
        sensor: 'UAV Drone DSM Stereo Photogrammetry (2.4cm GSD)',
        elevationOrSetback: '+1.65m Cantilever',
        footprintOrMargin: '3.35 m Marginal Left (-1.65m)',
        structureStatus: 'Overhanging Balcony Slab',
        concurrence: '84.2%',
      },
      t3: {
        buttonLabel: 'Jun 2026 (LiDAR Scan)',
        title: 'GROUND TRUTH: 2026-06-12 (Mobile LiDAR Point Cloud Confirmed)',
        sensor: 'Terrestrial Mobile LiDAR Parapet & Facade Scanner',
        elevationOrSetback: '+1.65m Confirmed',
        footprintOrMargin: '14.8 m² Encroachment',
        structureStatus: 'Cantilever Living Extension',
        concurrence: '94.8%',
      },
    },
    affectedFlats: [
      {
        unitNumber: '602',
        unitName: 'Corner Apartment B 602',
        vsuId: 'vsu-a-6-02',
        prototypeId: 'DEMO-MH-MUM-0001-VSU-A-06-602',
        canonical3dUlpin: 'ULPIN3D-MH-CTS98122A-A-F06-U602-Z18.2_21.6',
        occupant: 'Meera S. Kulkarni',
        deed: 'MOCK-REG-2023-4122B',
        carpetAreaSqm: 88.0,
        builtupAreaSqm: 106.0,
        quadrant: 'Q2 (North-East Facade)',
        floorNumber: 6,
        zBottomM: 18.2,
        zTopM: 21.6,
        volumeCum: 360.4,
      },
    ],
  },
  {
    alertCode: 'ALT-2026-0105',
    alertType: 'Road Buffer Setback & Boundary Conflict',
    severity: 'Medium',
    buildingId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    buildingName: 'Green Residency',
    buildingCode: 'GREEN-RES',
    surveyPlot: 'CTS-9820/4 • CTS-9812/2C (Heritage & Green Enclave)',
    floorNumber: 5,
    floorLabel: 'Floor 5 (Upper Residential Level)',
    deviationType: 'Civic Right-of-Way & Environmental Green Buffer Encroachment',
    infringementClause: 'Section 44 Maharashtra Regional & Town Planning (MRTP) Act — Encroachment upon designated civic right-of-way and green reservation.',
    shortSummary: 'Cantilever terrace balcony encroaches +1.8m beyond statutory green buffer setback line toward adjacent DP road.',
    detailedAnalysis: 'Comparative multi-temporal satellite orthophotos and cadastral GIS layers reveal that the 5th floor terrace of Green Residency protrudes 1.80 meters into the mandatory 6.0m environmental green buffer strip.',
    groundTruthNotes: 'Municipal Total Station field survey and street inspection verify physical cantilever terrace slab projecting over the statutory compound wall line toward the 18m Development Plan (DP) road.',
    metrics: {
      primaryShiftLabel: 'Road Encroachment',
      primaryShiftValue: '+1.80 m',
      secondaryDiffLabel: 'Buffer Margin',
      secondaryDiffValue: '4.20 m (vs 6.0m)',
      unauthorizedQuantityLabel: 'Encroachment Area',
      unauthorizedQuantityValue: '+22.0 m²',
      formula: 'ΔArea = 12.2m (Terrace Span) × 1.80m (Overhang) ≈ 22.0 m²',
    },
    stages: {
      t1: {
        buttonLabel: 'T1: Jan 2025 (Baseline)',
        title: 'BASELINE: 2025-01-10 (Sanctioned Green Buffer • 6.0m Margin)',
        sensor: 'Cadastral GIS Cadastre & Master Plan Baseline',
        elevationOrSetback: '0.00m Overhang',
        footprintOrMargin: '6.00 m Buffer Clear',
        structureStatus: 'Compliant Setback Line',
        concurrence: '97.5%',
      },
      t2: {
        buttonLabel: 'T2: May 2026 (Detected Diff)',
        title: 'POTENTIAL DIFF DETECTED: 2026-05-18 (+1.80m Buffer Overhang)',
        sensor: 'High-Resolution Satellite Orthophoto & Drone DSM',
        elevationOrSetback: '+1.80m Encroachment',
        footprintOrMargin: '4.20 m Buffer Left (-1.80m)',
        structureStatus: 'Terrace Overhang Flagged',
        concurrence: '82.8%',
      },
      t3: {
        buttonLabel: 'Aug 2026 (Ground Survey)',
        title: 'GROUND TRUTH: 2026-08-10 (Municipal Total Station Survey Pegged)',
        sensor: 'Total Station & GNSS Real-Time Kinematic (RTK) Survey',
        elevationOrSetback: '+1.80m Confirmed',
        footprintOrMargin: '22.0 m² Road Buffer Intrusion',
        structureStatus: 'Overhanging Terrace Slab',
        concurrence: '93.4%',
      },
    },
    affectedFlats: [
      {
        unitNumber: '502',
        unitName: 'Executive Park View 502',
        vsuId: 'vsu-grn-5-02',
        prototypeId: 'DEMO-MH-MUM-0003-VSU-GRN-05-502',
        canonical3dUlpin: 'ULPIN3D-MH-CTS98122C-GRN-F05-U502-Z14.0_17.2',
        occupant: 'Anand Mahindra Kulkarni',
        deed: 'MOCK-REG-2024-3311G',
        carpetAreaSqm: 104.0,
        builtupAreaSqm: 128.0,
        quadrant: 'Q2 (Front Road-Facing)',
        floorNumber: 5,
        zBottomM: 14.0,
        zTopM: 17.2,
        volumeCum: 409.6,
      },
    ],
  },
];

export const DiscrepancyStudioView: React.FC<DiscrepancyStudioViewProps> = ({
  onNavigateTab,
  onSelectBuilding,
  onSelectVsu,
}) => {
  const [, setAlerts] = useState<DiscrepancyAlert[]>([]);
  const [activeStage, setActiveStage] = useState<'t1' | 't2' | 't3'>('t2');
  const [displayMode, setDisplayMode] = useState<'composite' | 'lidar' | 'cadastre'>('composite');
  const [selectedDiscrepancyIndex, setSelectedDiscrepancyIndex] = useState<number>(0);
  const [selectedFlatIndex, setSelectedFlatIndex] = useState<number>(0);
  const [copiedUlpin, setCopiedUlpin] = useState(false);

  useEffect(() => {
    async function load() {
      const aData = await cadastreService.getDiscrepancyAlerts();
      setAlerts(aData);
    }
    load();
  }, []);

  const currentDisc = DISCREPANCY_REGISTRY[selectedDiscrepancyIndex] || DISCREPANCY_REGISTRY[0];
  const currentFlat = currentDisc.affectedFlats[selectedFlatIndex] || currentDisc.affectedFlats[0];
  const stageData = currentDisc.stages[activeStage];

  const handleSelectDiscrepancy = (idx: number) => {
    setSelectedDiscrepancyIndex(idx);
    setSelectedFlatIndex(0);
    setActiveStage('t2');
  };

  const handleCopyUlpin = (ulpin: string) => {
    navigator.clipboard.writeText(ulpin);
    setCopiedUlpin(true);
    setTimeout(() => setCopiedUlpin(false), 2000);
  };

  const handleOpenIn3D = () => {
    if (onSelectVsu && currentFlat) {
      const targetVsu: CandidateVsu = {
        id: currentFlat.vsuId,
        buildingId: currentDisc.buildingId,
        floorId: `floor-${currentFlat.floorNumber}`,
        floorNumber: currentFlat.floorNumber,
        prototypeVsuIdentifier: currentFlat.prototypeId,
        canonical3dUlpin: currentFlat.canonical3dUlpin,
        unitNumber: currentFlat.unitNumber,
        unitName: currentFlat.unitName,
        useType: 'Residential',
        carpetAreaSqm: currentFlat.carpetAreaSqm,
        builtupAreaSqm: currentFlat.builtupAreaSqm,
        volumeCum: currentFlat.volumeCum,
        zBottomM: currentFlat.zBottomM,
        zTopM: currentFlat.zTopM,
        confidenceTier: 'Tier C',
        verificationStatus: 'Under Review',
        mockDocumentReference: currentFlat.deed,
        mockOccupantName: currentFlat.occupant,
        hasViolation: true,
        violationDetails: currentDisc.shortSummary,
      };
      onSelectVsu(targetVsu);
      return;
    }

    if (onSelectBuilding) {
      onSelectBuilding(currentDisc.buildingId);
    }
    if (onNavigateTab) {
      onNavigateTab('city3d');
    }
  };

  const handleOpenQueue = () => {
    if (currentFlat && onSelectVsu) {
      const targetVsu: CandidateVsu = {
        id: currentFlat.vsuId,
        buildingId: currentDisc.buildingId,
        floorId: `floor-${currentFlat.floorNumber}`,
        floorNumber: currentFlat.floorNumber,
        prototypeVsuIdentifier: currentFlat.prototypeId,
        canonical3dUlpin: currentFlat.canonical3dUlpin,
        unitNumber: currentFlat.unitNumber,
        unitName: currentFlat.unitName,
        useType: 'Residential',
        carpetAreaSqm: currentFlat.carpetAreaSqm,
        builtupAreaSqm: currentFlat.builtupAreaSqm,
        volumeCum: currentFlat.volumeCum,
        zBottomM: currentFlat.zBottomM,
        zTopM: currentFlat.zTopM,
        confidenceTier: 'Tier A',
        verificationStatus: 'Under Review',
        mockDocumentReference: currentFlat.deed,
        mockOccupantName: currentFlat.occupant,
        hasViolation: true,
      };
      onSelectVsu(targetVsu);
    }
    if (onNavigateTab) {
      onNavigateTab('verification');
    }
  };

  return (
    <div style={{ padding: '20px 24px', maxWidth: '1280px', margin: '0 auto', overflowY: 'auto' }}>
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-outline)', fontWeight: 600 }}>
              📍 {currentDisc.buildingName} • {currentDisc.floorLabel} • Flat {currentFlat?.unitNumber}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '6px' }}>
            Satellite & Survey Evidence Discrepancy Studio
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px', marginTop: '2px' }}>
            Multi-temporal Earth Observation (EO) satellite analysis, mobile LiDAR telemetry, and flat-level architectural deviation auditing
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-primary" onClick={handleOpenIn3D} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_city</span>
            <span>Inspect Flat {currentFlat?.unitNumber} in 3D</span>
          </button>
          <button className="btn-secondary" onClick={handleOpenQueue} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>fact_check</span>
            <span>Adjudicate in Queue</span>
          </button>
        </div>
      </div>

      {/* Discrepancy Signal Quick Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {DISCREPANCY_REGISTRY.map((disc, idx) => {
          const isSelected = selectedDiscrepancyIndex === idx;
          return (
            <button
              key={disc.alertCode}
              type="button"
              onClick={() => handleSelectDiscrepancy(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: isSelected ? '1px solid #0284c7' : '1px solid var(--color-border)',
                background: isSelected ? 'rgba(2, 132, 199, 0.12)' : 'var(--color-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.15)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '18px',
                  color: isSelected ? '#0284c7' : 'var(--color-on-surface-variant)',
                }}
              >
                {idx === 0 ? 'roofing' : idx === 1 ? 'balcony' : 'fence'}
              </span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#0284c7' : 'var(--color-on-surface)' }}>
                    {disc.buildingName} • Flat {disc.affectedFlats.map((f) => f.unitNumber).join(', ')}
                  </span>
                  <span className={`status-badge ${disc.severity === 'Critical' || disc.severity === 'High' ? 'conflict' : 'review'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                    {disc.severity}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>
                  {disc.alertCode} • {disc.floorLabel.split(' ')[0]} {disc.floorLabel.split(' ')[1]}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Temporal Showcase Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px', marginBottom: '24px' }}>
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
              <span>{currentDisc.stages.t1.buttonLabel}</span>
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
              <span>{currentDisc.stages.t2.buttonLabel}</span>
            </button>
            <button
              className={`btn-secondary ${activeStage === 't3' ? 'btn-primary' : ''}`}
              onClick={() => setActiveStage('t3')}
              style={{ flex: 1, justifyContent: 'center', fontSize: '11px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>directions_car</span>
              <span>{currentDisc.stages.t3.buttonLabel}</span>
            </button>
          </div>

          {/* Viewport Visualization Canvas (Self-Contained Vector CAD / Satellite Graphics Engine) */}
          <div
            style={{
              position: 'relative',
              height: '380px',
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
              viewBox="0 0 800 380"
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
              <rect width="800" height="380" fill="#070f1e" />
              <rect width="800" height="380" fill="url(#utmGrid)" />

              {/* Dynamic SVG Scene Renderer Based on Selected Discrepancy */}
              {selectedDiscrepancyIndex === 0 && (
                /* SCENE 1: TOWER B ROOFTOP (FLATS 901 & 902) */
                <g>
                  {/* Surrounding Context */}
                  <g opacity="0.45">
                    <path d="M 40,40 L 760,40 L 760,340 L 40,340 Z" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="50" y="55" fill="#38bdf8" fontSize="9" fontFamily="monospace">CTS PLOT 402/2 • ZONE 4 CADASTRE</text>
                    <polygon points="80,80 200,80 200,200 80,200" fill="#132038" stroke="#334155" strokeWidth="1" />
                    <text x="90" y="145" fill="#64748b" fontSize="10" fontFamily="sans-serif">COMM-PLAZA (4F)</text>
                    <polygon points="560,80 720,80 720,240 560,240" fill="#132038" stroke="#334155" strokeWidth="1" />
                    <text x="590" y="165" fill="#64748b" fontSize="10" fontFamily="sans-serif">TOWER A (10F)</text>
                  </g>

                  {/* Tower B Footprint */}
                  <g transform="translate(270, 70)">
                    <rect x="0" y="0" width="220" height="210" rx="4" fill="url(#cleanRoofGrad)" stroke="#38bdf8" strokeWidth="2" />
                    <rect x="12" y="12" width="196" height="186" rx="2" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
                    <rect x="80" y="75" width="60" height="60" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                    <text x="92" y="110" fill="#94a3b8" fontSize="9" fontFamily="monospace">CORE</text>

                    {/* Flat demarcation lines */}
                    <line x1="110" y1="12" x2="110" y2="75" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="110" y1="135" x2="110" y2="198" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="35" y="50" fill="#38bdf8" fontSize="10" fontWeight="700">FLAT 901 (East)</text>
                    <text x="125" y="50" fill="#38bdf8" fontSize="10" fontWeight="700">FLAT 902 (West)</text>

                    {activeStage === 't1' && (
                      <g>
                        <rect x="16" y="16" width="188" height="178" fill="rgba(16, 185, 129, 0.08)" />
                        <circle cx="30" cy="30" r="3" fill="#10b981" />
                        <text x="36" y="34" fill="#34d399" fontSize="9" fontFamily="monospace">30.40m</text>
                        <circle cx="190" cy="30" r="3" fill="#10b981" />
                        <text x="146" y="34" fill="#34d399" fontSize="9" fontFamily="monospace">30.40m</text>
                        <g transform="translate(45, 150)">
                          <rect x="0" y="0" width="130" height="20" rx="3" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1" />
                          <text x="10" y="14" fill="#10b981" fontSize="10" fontWeight="700" fontFamily="monospace">✓ COMPLIANT BASELINE</text>
                        </g>
                      </g>
                    )}

                    {activeStage === 't2' && (
                      <g>
                        <ellipse cx="110" cy="65" rx="85" ry="48" fill="url(#lidarHeat)" />
                        <rect x="25" y="25" width="170" height="95" rx="2" fill="url(#warningStripe)" stroke="#ef4444" strokeWidth="2.5" />
                        <g transform="translate(25, 32)">
                          <rect x="0" y="0" width="170" height="42" rx="3" fill="rgba(15, 23, 42, 0.94)" stroke="#ef4444" strokeWidth="1.5" />
                          <text x="8" y="16" fill="#ef4444" fontSize="11" fontWeight="bold">🚨 UNVERIFIED 9TH FLOOR</text>
                          <text x="8" y="32" fill="#fca5a5" fontSize="10" fontFamily="monospace">ΔZ: +4.30m (34.7m vs 30.4m)</text>
                        </g>
                        <g transform="translate(45, 155)">
                          <rect x="0" y="0" width="130" height="22" rx="3" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1" />
                          <text x="8" y="15" fill="#f87171" fontSize="10" fontWeight="700" fontFamily="monospace">ΔVol: +485.9 m³ DELTA</text>
                        </g>
                      </g>
                    )}

                    {activeStage === 't3' && (
                      <g>
                        <polygon points="110,240 18,30 202,30" fill="rgba(56, 189, 248, 0.08)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" strokeDasharray="4 2" />
                        <circle cx="35" cy="35" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                        <circle cx="105" cy="35" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                        <circle cx="185" cy="35" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                        <circle cx="35" cy="105" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                        <circle cx="185" cy="105" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                        <rect x="30" y="30" width="160" height="80" fill="rgba(2, 132, 199, 0.3)" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2" />
                        <g transform="translate(15, 145)">
                          <rect x="0" y="0" width="190" height="34" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#fbbf24" strokeWidth="1" />
                          <text x="8" y="14" fill="#fbbf24" fontSize="9" fontWeight="700">MMS-4 OPTICAL & LIDAR CONCURRENCE</text>
                          <text x="8" y="27" fill="#fde68a" fontSize="9" fontFamily="monospace">Pillars Erected • Tin Roof Confirmed</text>
                        </g>
                      </g>
                    )}
                  </g>
                </g>
              )}

              {selectedDiscrepancyIndex === 1 && (
                /* SCENE 2: TOWER A FLOOR 6 (FLAT 602 BALCONY OVERHANG) */
                <g>
                  {/* Floor Plan Layout of Tower A Floor 6 */}
                  <g transform="translate(160, 50)">
                    {/* Plot Boundary & Setback Perimeter */}
                    <rect x="-80" y="-20" width="600" height="280" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="-70" y="-5" fill="#64748b" fontSize="9" fontFamily="monospace">PARCEL SETBACK BOUNDARY (5.0m CIVIC MARGIN)</text>

                    {/* Statutory Setback Line (Red/Cyan Guide) */}
                    <line x1="390" y1="-20" x2="390" y2="260" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5 5" />
                    <text x="400" y="20" fill="#06b6d4" fontSize="10" fontFamily="monospace">STATUTORY SETBACK LINE (5.0m)</text>

                    {/* Tower A Floor 6 Outer Slab Outline */}
                    <rect x="20" y="10" width="360" height="220" rx="3" fill="#132038" stroke="#38bdf8" strokeWidth="2" />

                    {/* Central Core & Corridors */}
                    <rect x="150" y="70" width="100" height="100" fill="#0b1329" stroke="#475569" strokeWidth="1.5" />
                    <text x="180" y="125" fill="#94a3b8" fontSize="11" fontFamily="monospace">LOBBY</text>

                    {/* Quadrant Demarcation Lines */}
                    <line x1="20" y1="120" x2="150" y2="120" stroke="#334155" strokeWidth="1" />
                    <line x1="250" y1="120" x2="380" y2="120" stroke="#334155" strokeWidth="1" />
                    <line x1="200" y1="10" x2="200" y2="70" stroke="#334155" strokeWidth="1" />
                    <line x1="200" y1="170" x2="200" y2="230" stroke="#334155" strokeWidth="1" />

                    {/* Compliant Units */}
                    <g opacity="0.85">
                      <rect x="25" y="15" width="165" height="100" fill="rgba(56, 189, 248, 0.05)" />
                      <text x="40" y="65" fill="#38bdf8" fontSize="12" fontWeight="700">FLAT 601</text>
                      <text x="40" y="80" fill="#94a3b8" fontSize="9">Penthouse Suite A • OK</text>

                      <rect x="25" y="125" width="165" height="100" fill="rgba(56, 189, 248, 0.05)" />
                      <text x="40" y="175" fill="#38bdf8" fontSize="12" fontWeight="700">FLAT 603</text>
                      <text x="40" y="190" fill="#94a3b8" fontSize="9">Studio Suite C • OK</text>

                      <rect x="205" y="125" width="170" height="100" fill="rgba(56, 189, 248, 0.05)" />
                      <text x="220" y="175" fill="#38bdf8" fontSize="12" fontWeight="700">FLAT 604</text>
                      <text x="220" y="190" fill="#94a3b8" fontSize="9">Terrace Flat D • OK</text>
                    </g>

                    {/* TARGET UNIT: FLAT 602 (North-East Quadrant) */}
                    <g>
                      <rect
                        x="205"
                        y="15"
                        width="170"
                        height="100"
                        fill={activeStage === 't1' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.15)'}
                        stroke={activeStage === 't1' ? '#10b981' : '#ef4444'}
                        strokeWidth="1.5"
                      />
                      <text x="220" y="45" fill={activeStage === 't1' ? '#34d399' : '#f87171'} fontSize="13" fontWeight="800">
                        FLAT 602 (Corner Apt B)
                      </text>
                      <text x="220" y="60" fill="#cbd5e1" fontSize="9" fontFamily="monospace">
                        Owner: Meera S. Kulkarni
                      </text>

                      {/* Stage-Specific Balcony Rendering */}
                      {activeStage === 't1' && (
                        /* T1: Sanctioned Flush Balcony */
                        <g>
                          <rect x="340" y="25" width="35" height="80" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="1.5" />
                          <text x="280" y="85" fill="#34d399" fontSize="9" fontWeight="700">INTERNAL BALCONY (FLUSH)</text>
                          <g transform="translate(230, 85)">
                            <rect x="0" y="0" width="140" height="18" rx="2" fill="rgba(16, 185, 129, 0.3)" stroke="#10b981" strokeWidth="1" />
                            <text x="8" y="13" fill="#10b981" fontSize="9" fontWeight="700">✓ SANCTIONED 5.0m SETBACK</text>
                          </g>
                        </g>
                      )}

                      {activeStage === 't2' && (
                        /* T2: Cantilever Balcony Encroachment Detected */
                        <g>
                          {/* Cantilever Slab extending past outer wall (380 to 435) */}
                          <rect x="380" y="25" width="55" height="80" fill="url(#warningStripe)" stroke="#ef4444" strokeWidth="2.5" />
                          <line x1="380" y1="25" x2="435" y2="25" stroke="#ef4444" strokeWidth="2" />
                          <line x1="380" y1="105" x2="435" y2="105" stroke="#ef4444" strokeWidth="2" />

                          {/* Dimension Callout Arrow */}
                          <line x1="380" y1="15" x2="435" y2="15" stroke="#ef4444" strokeWidth="1.5" />
                          <circle cx="380" cy="15" r="2.5" fill="#ef4444" />
                          <circle cx="435" cy="15" r="2.5" fill="#ef4444" />
                          <text x="385" y="10" fill="#fca5a5" fontSize="10" fontWeight="bold" fontFamily="monospace">
                            +1.65m OVERHANG
                          </text>

                          {/* Violation Alert Callout Box */}
                          <g transform="translate(210, 82)">
                            <rect x="0" y="0" width="165" height="30" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444" strokeWidth="1.5" />
                            <text x="6" y="13" fill="#ef4444" fontSize="10" fontWeight="bold">🚨 SETBACK ENCROACHMENT</text>
                            <text x="6" y="24" fill="#fca5a5" fontSize="9" fontFamily="monospace">Marginal space reduced to 3.35m</text>
                          </g>

                          {/* LiDAR Scan Rays */}
                          <line x1="435" y1="25" x2="490" y2="-10" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                          <line x1="435" y1="105" x2="490" y2="140" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                        </g>
                      )}

                      {activeStage === 't3' && (
                        /* T3: Mobile LiDAR Parapet Scan Points */
                        <g>
                          <rect x="380" y="25" width="55" height="80" fill="rgba(217, 119, 6, 0.2)" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                          {/* Point cloud points on cantilever edge */}
                          <circle cx="435" cy="30" r="3" fill="#fbbf24" />
                          <circle cx="435" cy="50" r="3" fill="#fbbf24" />
                          <circle cx="435" cy="70" r="3" fill="#fbbf24" />
                          <circle cx="435" cy="90" r="3" fill="#fbbf24" />
                          <circle cx="435" cy="105" r="3" fill="#fbbf24" />
                          <text x="445" y="65" fill="#fbbf24" fontSize="9" fontFamily="monospace">LiDAR Facade 0.012m RMSE</text>
                          <g transform="translate(210, 82)">
                            <rect x="0" y="0" width="165" height="30" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#fbbf24" strokeWidth="1.5" />
                            <text x="6" y="13" fill="#fbbf24" fontSize="10" fontWeight="bold">LIDAR POINT CLOUD CONFIRMED</text>
                            <text x="6" y="24" fill="#fef08a" fontSize="9" fontFamily="monospace">Living Balcony: +14.8 m² Unauth.</text>
                          </g>
                        </g>
                      )}
                    </g>
                  </g>
                </g>
              )}

              {selectedDiscrepancyIndex === 2 && (
                /* SCENE 3: GREEN RESIDENCY FLOOR 5 (FLAT 502 ROAD BUFFER OVERHANG) */
                <g>
                  {/* Floor Plan Layout of Green Residency Floor 5 */}
                  <g transform="translate(180, 50)">
                    {/* 18m Development Plan (DP) Road */}
                    <rect x="360" y="-20" width="180" height="280" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                    <line x1="450" y1="-20" x2="450" y2="260" stroke="#475569" strokeWidth="1" strokeDasharray="6 6" />
                    <text x="400" y="130" fill="#64748b" fontSize="11" fontFamily="monospace" transform="rotate(90 400 130)">
                      18.0m CIVIC DP ROAD
                    </text>

                    {/* 6.0m Environmental Green Buffer Strip */}
                    <rect x="280" y="-20" width="80" height="280" fill="rgba(16, 185, 129, 0.06)" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="290" y="240" fill="#34d399" fontSize="9" fontFamily="monospace">
                      6.0m GREEN BUFFER
                    </text>

                    {/* Building Compound Wall Boundary */}
                    <line x1="280" y1="-20" x2="280" y2="260" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
                    <text x="200" y="-5" fill="#f59e0b" fontSize="9" fontFamily="monospace">
                      BUILDING SETBACK LINE
                    </text>

                    {/* Green Residency Floor 5 Slab */}
                    <rect x="20" y="10" width="260" height="220" rx="3" fill="#132038" stroke="#10b981" strokeWidth="2" />

                    {/* Central Core & Units */}
                    <rect x="110" y="80" width="80" height="80" fill="#0b1329" stroke="#475569" strokeWidth="1.5" />
                    <text x="135" y="125" fill="#94a3b8" fontSize="11" fontFamily="monospace">CORE</text>

                    <line x1="20" y1="120" x2="110" y2="120" stroke="#334155" strokeWidth="1" />
                    <line x1="190" y1="120" x2="280" y2="120" stroke="#334155" strokeWidth="1" />

                    {/* Flat 501 (Compliant Rear) */}
                    <rect x="25" y="15" width="250" height="100" fill="rgba(56, 189, 248, 0.05)" />
                    <text x="40" y="65" fill="#38bdf8" fontSize="12" fontWeight="700">FLAT 501 (Terrace Flat A)</text>
                    <text x="40" y="80" fill="#94a3b8" fontSize="9">Rear Garden View • Sanctioned OK</text>

                    {/* TARGET UNIT: FLAT 502 (Front Road-Facing) */}
                    <g>
                      <rect
                        x="25"
                        y="125"
                        width="250"
                        height="100"
                        fill={activeStage === 't1' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.15)'}
                        stroke={activeStage === 't1' ? '#10b981' : '#ef4444'}
                        strokeWidth="1.5"
                      />
                      <text x="40" y="155" fill={activeStage === 't1' ? '#34d399' : '#f87171'} fontSize="13" fontWeight="800">
                        FLAT 502 (Executive Park View)
                      </text>
                      <text x="40" y="170" fill="#cbd5e1" fontSize="9" fontFamily="monospace">
                        Owner: Anand Mahindra Kulkarni
                      </text>

                      {/* Stage-Specific Road Buffer Overhang */}
                      {activeStage === 't1' && (
                        <g>
                          <rect x="240" y="135" width="35" height="80" fill="rgba(16, 185, 129, 0.3)" stroke="#10b981" strokeWidth="1.5" />
                          <text x="140" y="195" fill="#34d399" fontSize="9" fontWeight="700">FLUSH WITH GREEN BUFFER</text>
                          <g transform="translate(50, 185)">
                            <rect x="0" y="0" width="160" height="18" rx="2" fill="rgba(16, 185, 129, 0.3)" stroke="#10b981" strokeWidth="1" />
                            <text x="8" y="13" fill="#10b981" fontSize="9" fontWeight="700">✓ 6.0m CIVIC BUFFER CLEAR</text>
                          </g>
                        </g>
                      )}

                      {activeStage === 't2' && (
                        <g>
                          {/* Cantilever terrace encroaching 1.8m into green buffer (280 to 340) */}
                          <rect x="280" y="135" width="60" height="80" fill="url(#warningStripe)" stroke="#ef4444" strokeWidth="2.5" />
                          <line x1="280" y1="135" x2="340" y2="135" stroke="#ef4444" strokeWidth="2" />
                          <line x1="280" y1="215" x2="340" y2="215" stroke="#ef4444" strokeWidth="2" />

                          {/* Dimension Arrow */}
                          <line x1="280" y1="225" x2="340" y2="225" stroke="#ef4444" strokeWidth="1.5" />
                          <circle cx="280" cy="225" r="2.5" fill="#ef4444" />
                          <circle cx="340" cy="225" r="2.5" fill="#ef4444" />
                          <text x="285" y="240" fill="#fca5a5" fontSize="10" fontWeight="bold" fontFamily="monospace">
                            +1.80m INTRUSION
                          </text>

                          <g transform="translate(45, 180)">
                            <rect x="0" y="0" width="180" height="30" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444" strokeWidth="1.5" />
                            <text x="6" y="13" fill="#ef4444" fontSize="10" fontWeight="bold">🚨 ROAD BUFFER VIOLATION</text>
                            <text x="6" y="24" fill="#fca5a5" fontSize="9" fontFamily="monospace">Margin reduced to 4.20m (22 m²)</text>
                          </g>
                        </g>
                      )}

                      {activeStage === 't3' && (
                        <g>
                          <rect x="280" y="135" width="60" height="80" fill="rgba(217, 119, 6, 0.2)" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                          <circle cx="340" cy="140" r="4" fill="#fbbf24" />
                          <circle cx="340" cy="175" r="4" fill="#fbbf24" />
                          <circle cx="340" cy="210" r="4" fill="#fbbf24" />
                          <text x="350" y="180" fill="#fbbf24" fontSize="9" fontFamily="monospace">RTK Survey Pegs</text>
                          <g transform="translate(45, 180)">
                            <rect x="0" y="0" width="180" height="30" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#fbbf24" strokeWidth="1.5" />
                            <text x="6" y="13" fill="#fbbf24" fontSize="10" fontWeight="bold">GROUND RTK TOTAL STATION</text>
                            <text x="6" y="24" fill="#fef08a" fontSize="9" fontFamily="monospace">Encroachment Confirmed (+1.8m)</text>
                          </g>
                        </g>
                      )}
                    </g>
                  </g>
                </g>
              )}

              {/* Viewport Crosshairs & HUD Elements */}
              <line x1="400" y1="20" x2="400" y2="40" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
              <line x1="400" y1="340" x2="400" y2="360" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
              <line x1="20" y1="190" x2="40" y2="190" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
              <line x1="760" y1="190" x2="780" y2="190" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />

              {/* Display Mode Indicator (Top-Right HUD) */}
              <g transform="translate(630, 20)">
                <rect x="0" y="0" width="150" height="24" rx="3" fill="rgba(11, 16, 27, 0.85)" stroke="rgba(56, 189, 248, 0.3)" />
                <text x="10" y="16" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                  LAYER: {displayMode.toUpperCase()}
                </text>
              </g>
            </svg>

            {/* Overlaid Top-Left Status Badge */}
            <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                <span>{stageData.title}</span>
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
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span className="metric-label">{currentDisc.metrics.primaryShiftLabel}</span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: activeStage === 't2' ? 'var(--color-error)' : 'var(--color-primary)',
                  }}
                >
                  {stageData.elevationOrSetback}
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />
              <div style={{ textAlign: 'center' }}>
                <span className="metric-label">{currentDisc.metrics.secondaryDiffLabel}</span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: activeStage === 't2' ? 'var(--color-error)' : 'var(--color-primary)',
                  }}
                >
                  {stageData.footprintOrMargin}
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />
              <div style={{ textAlign: 'center' }}>
                <span className="metric-label">Structure State</span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: activeStage === 't1' ? 'var(--color-secondary)' : 'var(--color-error)',
                  }}
                >
                  {stageData.structureStatus}
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />
              <div style={{ textAlign: 'center' }}>
                <span className="metric-label">Concurrence</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                  {stageData.concurrence}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Analytical Volumetric & Setback Delta Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="instrument-card">
            <div className="card-header">
              <span className="card-title">Volumetric & Spatial Divergence</span>
              <span className={`status-badge ${currentDisc.severity === 'High' || currentDisc.severity === 'Critical' ? 'conflict' : 'review'}`}>
                {currentDisc.severity} Signal
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <MetricChip label={currentDisc.metrics.primaryShiftLabel} value={currentDisc.metrics.primaryShiftValue} highlight />
              <MetricChip label={currentDisc.metrics.secondaryDiffLabel} value={currentDisc.metrics.secondaryDiffValue} highlight />
            </div>

            <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.25)', marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-error)' }}>
                {currentDisc.metrics.unauthorizedQuantityLabel}: {currentDisc.metrics.unauthorizedQuantityValue}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-on-surface-variant)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {currentDisc.metrics.formula}
              </div>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', lineHeight: '1.4' }}>
              {currentDisc.detailedAnalysis}
            </p>
          </div>

          <div className="instrument-card">
            <div className="card-header">
              <span className="card-title">Ground Truth Alignment</span>
              <span className="status-badge verified">Sensor Synced</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-on-surface)', lineHeight: '1.4' }}>
              {currentDisc.groundTruthNotes}
            </p>
            <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
              <button
                className="btn-secondary"
                onClick={handleOpenIn3D}
                style={{ flex: 1, fontSize: '11px', justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>3d_rotation</span>
                <span>View Flat in 3D</span>
              </button>
              <button
                className="btn-primary"
                onClick={handleOpenQueue}
                style={{ flex: 1, fontSize: '11px', justifyContent: 'center', background: '#7c3aed', borderColor: '#7c3aed' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>fact_check</span>
                <span>Review in Queue</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED AFFECTED PROPERTY & FLAT DETAILS INSPECTOR PANEL */}
      <div className="instrument-card" style={{ marginBottom: '24px', border: '1px solid rgba(2, 132, 199, 0.3)', background: 'var(--color-surface)' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#0284c7', fontSize: '20px' }}>
                apartment
              </span>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)' }}>
                Affected Cadastral Property & Flat Details
              </h2>
              <span className="status-badge conflict" style={{ fontSize: '10px' }}>
                Violation Flagged
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
              Statutory cadastral record, ownership identity, deed reference, and volumetric metrics for the flat under deviation
            </p>
          </div>

          {/* If discrepancy has multiple affected flats (e.g. Tower B 901 and 902), show flat switcher */}
          {currentDisc.affectedFlats.length > 1 && (
            <div style={{ display: 'flex', gap: '4px', background: 'var(--color-surface-container-low)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
              {currentDisc.affectedFlats.map((flat, idx) => (
                <button
                  key={flat.unitNumber}
                  type="button"
                  onClick={() => setSelectedFlatIndex(idx)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    borderRadius: '3px',
                    border: selectedFlatIndex === idx ? '1px solid #0284c7' : 'none',
                    background: selectedFlatIndex === idx ? '#0284c7' : 'transparent',
                    color: selectedFlatIndex === idx ? '#fff' : 'var(--color-on-surface-variant)',
                    cursor: 'pointer',
                  }}
                >
                  Flat {flat.unitNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        {currentFlat && (
          <div style={{ padding: '16px 0 0 0' }}>
            {/* Top Identity Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ padding: '10px 12px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <span className="metric-label">Target Property / Unit</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                  Flat {currentFlat.unitNumber} • {currentFlat.unitName}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
                  {currentDisc.buildingName} ({currentDisc.buildingCode}) • {currentDisc.floorLabel}
                </div>
              </div>

              <div style={{ padding: '10px 12px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <span className="metric-label">Occupant & Deed Reference</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                  {currentFlat.occupant}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-on-surface-variant)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  Deed: {currentFlat.deed}
                </div>
              </div>

              <div style={{ padding: '10px 12px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <span className="metric-label">Parent Cadastral Parcel</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                  {currentDisc.surveyPlot}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
                  Maharashtra Urban Demo Zone 4 • EPSG:7760
                </div>
              </div>

              <div style={{ padding: '10px 12px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <span className="metric-label">Sanctioned Area & Volume</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                  {currentFlat.carpetAreaSqm} m² carpet / {currentFlat.builtupAreaSqm} m² built-up
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-on-surface-variant)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  Elevations: Z {currentFlat.zBottomM}m to {currentFlat.zTopM}m MSL
                </div>
              </div>
            </div>

            {/* Statutory 3D-ULPIN String & Copy Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                padding: '10px 14px',
                background: 'rgba(2, 132, 199, 0.08)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0284c7' }}>
                  token
                </span>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>
                    Statutory Canonical 3D ULPIN (Bhu-Aadhaar):
                  </span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: '#0284c7' }}>
                    {currentFlat.canonical3dUlpin}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleCopyUlpin(currentFlat.canonical3dUlpin)}
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    {copiedUlpin ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedUlpin ? 'Copied!' : 'Copy ULPIN'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenIn3D}
                  className="btn-primary"
                  style={{ fontSize: '11px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>3d_rotation</span>
                  <span>Inspect Flat {currentFlat.unitNumber} in 3D</span>
                </button>
              </div>
            </div>

            {/* Legal Infringement & Statutory Notice Notice Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 14px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--color-error)', fontSize: '20px', marginTop: '2px' }}>
                gavel
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-on-surface)', lineHeight: '1.5' }}>
                <strong style={{ color: 'var(--color-error)' }}>Statutory Cadastre Non-Compliance Notice: </strong>
                {currentDisc.infringementClause} This flat cannot receive official <strong>Verified</strong> title status until rectified or officially regularized under municipal building bylaws.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Discrepancy Alerts Table with Interactive Selection */}
      <div className="instrument-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="card-title">All Detected Discrepancy Signals ({DISCREPANCY_REGISTRY.length})</span>
            <span className="status-badge review" style={{ fontSize: '10px' }}>
              Statutory Verification Required
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-outline)', fontFamily: 'var(--font-mono)' }}>
            Select any discrepancy to inspect that flat's sensor evidence
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {DISCREPANCY_REGISTRY.map((disc, idx) => {
            const isSelected = selectedDiscrepancyIndex === idx;
            return (
              <div
                key={disc.alertCode}
                onClick={() => handleSelectDiscrepancy(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: isSelected ? 'rgba(2, 132, 199, 0.08)' : 'var(--color-surface-container-low)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: `4px solid ${disc.severity === 'High' || disc.severity === 'Critical' ? 'var(--color-error)' : 'var(--color-review)'}`,
                  border: isSelected ? '1px solid #0284c7' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ color: 'var(--color-primary)', fontSize: '13px' }}>{disc.alertType}</strong>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-outline)' }}>
                      [{disc.alertCode}]
                    </span>
                    <span
                      style={{
                        padding: '1px 6px',
                        background: 'rgba(2, 132, 199, 0.1)',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: '#0284c7',
                        fontWeight: 700,
                      }}
                    >
                      📍 {disc.buildingName} • {disc.floorLabel.split(' ')[0]} {disc.floorLabel.split(' ')[1]} • Flat {disc.affectedFlats.map((f) => f.unitNumber).join(', ')}
                    </span>
                    <span className={`status-badge ${disc.severity === 'High' || disc.severity === 'Critical' ? 'conflict' : 'review'}`} style={{ fontSize: '9px' }}>
                      {disc.severity} Severity
                    </span>
                    {isSelected && (
                      <span style={{ fontSize: '10px', color: '#0284c7', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        ● Active Inspection
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                    {disc.shortSummary}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDiscrepancy(idx);
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      {isSelected ? 'visibility' : 'touch_app'}
                    </span>
                    <span>{isSelected ? 'Viewing' : 'Inspect Flat'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { cadastreService } from '../services/cadastreService';
import type { Building, ParentParcel } from '../types/cadastre';

interface CandidateRegistrationViewProps {
  onSuccess: (vsuId: string) => void;
  onCancel: () => void;
}

export const CandidateRegistrationView: React.FC<CandidateRegistrationViewProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [parcels, setParcels] = useState<ParentParcel[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  // Form State
  const [selectedParcelId, setSelectedParcelId] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [floorNumber, setFloorNumber] = useState<number>(7);
  const [unitNumber, setUnitNumber] = useState('705');
  const [unitName, setUnitName] = useState('Terrace Suite 705');
  const [useType, setUseType] = useState('Residential 3BHK');
  const [carpetArea, setCarpetArea] = useState<number>(92.4);
  const [builtupArea, setBuiltupArea] = useState<number>(112.8);
  const [mockDeed, setMockDeed] = useState('MOCK-REG-2026-9921E');
  const [mockOccupant, setMockOccupant] = useState('Candidate Applicant');
  const [confidenceTier, setConfidenceTier] = useState('Tier A');
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const p = await cadastreService.getParentParcels();
      const b = await cadastreService.getBuildings();
      setParcels(p);
      setBuildings(b);
      if (p.length > 0) setSelectedParcelId(p[0].id);
      if (b.length > 0) setSelectedBuildingId(b[0].id);
    }
    load();
  }, []);

  const currentBuilding = buildings.find((b) => b.id === selectedBuildingId) || buildings[0];
  const currentParcel = parcels.find((p) => p.id === (currentBuilding?.parcelId || selectedParcelId)) || parcels[0];
  const bldCode = currentBuilding?.buildingCode ? currentBuilding.buildingCode.replace(/[^A-Z0-9]/g, '') : 'A';
  const parcelRef = currentParcel?.demoUlpinReference || 'DEMO-MH-MUM-0001';
  const maxFloor = currentBuilding?.totalFloors || 10;
  const storyHeight = currentBuilding ? (currentBuilding.heightM / currentBuilding.totalFloors) : 3.4;
  const podiumHeight = 1.2;

  const generatedIdentifier = `${parcelRef}-VSU-${bldCode}-${String(floorNumber).padStart(2, '0')}-${unitNumber}`;
  const calculatedVolume = (builtupArea * storyHeight).toFixed(1);
  const zBottom = podiumHeight + (floorNumber - 1) * storyHeight;
  const zTop = zBottom + storyHeight;
  const zRangeStr = `Z${zBottom.toFixed(1)}_${zTop.toFixed(1)}`;
  const canonical3dUlpin = `ULPIN3D-MH-${currentParcel?.surveyNumber ? currentParcel.surveyNumber.replace(/[^A-Z0-9]/g, '') : 'MUM01'}-${bldCode}-F${String(floorNumber).padStart(2, '0')}-U${unitNumber}-${zRangeStr}`;

  const handleCopyUlpin = () => {
    navigator.clipboard.writeText(canonical3dUlpin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newVsu = await cadastreService.createCandidateVsu({
        buildingId: selectedBuildingId,
        floorNumber,
        unitNumber,
        unitName,
        useType,
        carpetAreaSqm: carpetArea,
        builtupAreaSqm: builtupArea,
        mockDocumentReference: mockDeed,
        mockOccupantName: mockOccupant,
        confidenceTier,
      });
      setSubmittedId(newVsu.prototypeVsuIdentifier);
      setTimeout(() => {
        onSuccess(newVsu.id);
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', overflowY: 'auto' }}>
      <div className="instrument-card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="card-title" style={{ fontSize: '18px' }}>
                3D ULPIN Generation & Candidate VSU Registration
              </h1>
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
                SIH26011 • Space Technology
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '3px' }}>
              Ministry of Rural Development • Algorithmic 3D Bhu-Aadhaar synthesis for vertical properties
            </p>
          </div>
          <span className="status-badge draft">Draft Submission</span>
        </div>

        {submittedId ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              background: 'var(--color-verified-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-verified)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-verified)' }}>
              check_circle
            </span>
            <h3 style={{ fontSize: '16px', color: 'var(--color-verified)', marginTop: '8px' }}>
              Candidate VSU & 3D ULPIN Created Successfully!
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)', margin: '8px 0' }}>
              {submittedId}
            </p>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(5, 150, 105, 0.1)',
                border: '1px solid rgba(5, 150, 105, 0.3)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#059669',
                marginBottom: '8px',
              }}
            >
              Statutory Canonical 3D ULPIN: {canonical3dUlpin}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
              Linked to Demo Parent Parcel Reference. Routing to Surveyor Verification Queue...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Live 3D ULPIN Algorithmic Generator Engine Box */}
            <div
              style={{
                background: 'var(--color-surface-container)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0284c7' }}>
                    token
                  </span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Live 3D-ULPIN Algorithmic Synthesis (SIH26011)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUlpin}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    background: copied ? 'var(--color-verified-bg)' : 'var(--color-surface-container-high)',
                    border: `1px solid ${copied ? 'var(--color-verified)' : 'var(--color-border)'}`,
                    color: copied ? 'var(--color-verified)' : 'var(--color-on-surface)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copied 3D ULPIN!' : 'Copy 3D ULPIN'}</span>
                </button>
              </div>

              {/* Canonical 3D ULPIN Code String */}
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#0284c7',
                  background: 'rgba(2, 132, 199, 0.08)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  wordBreak: 'break-all',
                  letterSpacing: '0.3px',
                }}
              >
                {canonical3dUlpin}
              </div>

              {/* Decomposed Syntax Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', background: 'var(--color-surface-container-high)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                  <strong>Scheme:</strong> ULPIN3D-MH
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', background: 'var(--color-surface-container-high)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                  <strong>2D Parcel:</strong> {parcelRef}
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', background: 'var(--color-surface-container-high)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                  <strong>Structure:</strong> {currentBuilding?.buildingName} ({bldCode})
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', background: 'var(--color-surface-container-high)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                  <strong>Floor:</strong> F{String(floorNumber).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', background: 'var(--color-surface-container-high)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                  <strong>Unit:</strong> U{unitNumber}
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', background: 'rgba(217, 119, 6, 0.1)', color: '#d97706', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
                  <strong>Elevation:</strong> {zBottom.toFixed(1)}m – {zTop.toFixed(1)}m MSL
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', background: 'rgba(5, 150, 105, 0.1)', color: '#059669', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(5, 150, 105, 0.3)' }}>
                  <strong>Volume:</strong> {calculatedVolume} m³
                </span>
              </div>

              {/* Prototype VSU Sub-Identifier */}
              <div style={{ fontSize: '11px', color: 'var(--color-outline)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                Prototype VSU Link: <code>{generatedIdentifier}</code> • Story Height: {storyHeight.toFixed(1)}m
              </div>
            </div>

            {/* Parent Parcel & Building Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="metric-label">Demo Parent Parcel Reference</label>
                <select
                  value={selectedParcelId}
                  onChange={(e) => setSelectedParcelId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    marginTop: '4px',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {parcels.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.demoUlpinReference} ({p.parcelName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="metric-label">Target Vertical Building</label>
                <select
                  value={selectedBuildingId}
                  onChange={(e) => {
                    const newBId = e.target.value;
                    setSelectedBuildingId(newBId);
                    const b = buildings.find((x) => x.id === newBId);
                    if (b && floorNumber > b.totalFloors) {
                      setFloorNumber(b.totalFloors);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    marginTop: '4px',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.buildingName} ({b.buildingCode}) • {b.totalFloors} Floors
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Unit Name & Descriptive Label */}
            <div>
              <label className="metric-label">Unit Name / Descriptive Label</label>
              <input
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="e.g. Terrace Suite 705"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  marginTop: '4px',
                }}
              />
            </div>

            {/* Floor & Unit Number */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label className="metric-label">Floor Elevation Number (1 to {maxFloor})</label>
                <input
                  type="number"
                  min="1"
                  max={maxFloor}
                  value={floorNumber}
                  onChange={(e) => setFloorNumber(Math.min(maxFloor, Math.max(1, Number(e.target.value))))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    marginTop: '4px',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              <div>
                <label className="metric-label">Unit Code / Identifier</label>
                <input
                  type="text"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    marginTop: '4px',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              <div>
                <label className="metric-label">Property Use Type</label>
                <input
                  type="text"
                  value={useType}
                  onChange={(e) => setUseType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    marginTop: '4px',
                  }}
                />
              </div>
            </div>

            {/* Area Dimensions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="metric-label">Carpet Area (m²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={carpetArea}
                  onChange={(e) => setCarpetArea(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    marginTop: '4px',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              <div>
                <label className="metric-label">Built-up Area (m²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={builtupArea}
                  onChange={(e) => setBuiltupArea(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    marginTop: '4px',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
            </div>

            {/* Mock Deed & Occupant */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="metric-label">Mock Document Reference</label>
                <input
                  type="text"
                  value={mockDeed}
                  onChange={(e) => setMockDeed(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    marginTop: '4px',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              <div>
                <label className="metric-label">Mock Applicant / Occupant Name</label>
                <input
                  type="text"
                  value={mockOccupant}
                  onChange={(e) => setMockOccupant(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    marginTop: '4px',
                  }}
                />
              </div>
            </div>

            {/* Confidence Tier */}
            <div>
              <label className="metric-label">Initial Evidence Confidence Tier</label>
              <select
                value={confidenceTier}
                onChange={(e) => setConfidenceTier(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  marginTop: '4px',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <option value="Tier A">Tier A (Drone DSM + Approved Municipal Arch CAD)</option>
                <option value="Tier B">Tier B (Mobile LiDAR Parapet Scan + Field Deed)</option>
                <option value="Tier C">Tier C (Satellite Stereo Pair + Street Image)</option>
                <option value="Tier D">Tier D (Historical 2D Extrapolation)</option>
              </select>
            </div>

            {/* Submit Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn-teal" disabled={submitting}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                <span>{submitting ? 'Registering...' : 'Submit for Verification'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

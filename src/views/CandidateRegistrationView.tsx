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

  const generatedIdentifier = `DEMO-MH-MUM-0001-VSU-A-${String(floorNumber).padStart(2, '0')}-${unitNumber}`;
  const calculatedVolume = (builtupArea * 3.4).toFixed(1);
  const zBottom = 1.2 + (floorNumber - 1) * 3.4;
  const zTop = zBottom + 3.4;

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
            <h1 className="card-title" style={{ fontSize: '18px' }}>
              Candidate Vertical Sub-Unit (VSU) Registration
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
              Draft a vertical cadastral unit record and submit for authorized surveyor verification
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
              Candidate VSU Record Created Successfully!
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, margin: '8px 0' }}>
              {submittedId}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
              Linked to Demo Parent Parcel Reference. Routing to Surveyor Verification Queue...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Generated Identifier Box */}
            <div
              style={{
                background: 'var(--color-surface-container)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '4px solid var(--color-secondary)',
              }}
            >
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-on-secondary-container)', fontWeight: 700, textTransform: 'uppercase' }}>
                Generated Prototype VSU Identifier
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                {generatedIdentifier}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-outline)', marginTop: '2px' }}>
                Calculated MSL Extrusion: {zBottom.toFixed(1)}m – {zTop.toFixed(1)}m (Height: 3.4m, Volume: {calculatedVolume} m³)
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
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
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
                      {b.buildingName} ({b.buildingCode})
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
                <label className="metric-label">Floor Elevation Number</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={floorNumber}
                  onChange={(e) => setFloorNumber(Number(e.target.value))}
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

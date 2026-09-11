import React from 'react';
import { CADASTRAL_BASE, ARCHITECTURAL_VIOLATIONS } from '../data/buildingData';

export default function PropertyInfoPanel({
  activeMode,
  selectedVsu,
  selectedFloor,
  onTriggerSOS,
  onClose,
}) {
  return (
    <div className="hud-panel info-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          {activeMode === 'audit'
            ? 'ARCHITECTURAL AUDIT & FRAUD'
            : activeMode === 'sos'
            ? 'EMERGENCY SOS & DISPATCH'
            : '3D CADASTRAL REGISTRY (3D-ULPIN)'}
        </div>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>

      {/* MODE 1: 3D CADASTRAL REGISTRATION */}
      {activeMode === 'cadastre' && (
        <div className="sidebar-content">
          {selectedVsu ? (
            <>
              <div className="ulpin-pill">
                <label>GENERATED 3D-ULPIN (BHU-AADHAAR):</label>
                <div className="ulpin-code">{selectedVsu.id}</div>
              </div>

              <div className="meta-grid">
                <div className="meta-item"><label>Unit Identifier:</label><strong>Unit {selectedVsu.unitNumber}</strong></div>
                <div className="meta-item"><label>Floor Elevation:</label><strong>Floor {selectedVsu.floorNumber}</strong></div>
                <div className="meta-item"><label>Titleholder:</label><strong>{selectedVsu.owner}</strong></div>
                <div className="meta-item"><label>Digital Deed:</label><strong>{selectedVsu.deedNumber}</strong></div>
                <div className="meta-item"><label>Property Type:</label><strong>{selectedVsu.use}</strong></div>
                <div className="meta-item"><label>Carpet Area:</label><strong>{selectedVsu.carpetArea}</strong></div>
                <div className="meta-item"><label>Built-up Area:</label><strong>{selectedVsu.builtUpArea}</strong></div>
                <div className="meta-item"><label>3D Volume:</label><strong>{selectedVsu.volume}</strong></div>
                <div className="meta-item"><label>Z-Elevation (MSL):</label><strong>{selectedVsu.zRange}</strong></div>
                <div className="meta-item"><label>Survey Plot:</label><strong>{CADASTRAL_BASE.surveyPlotNumber}</strong></div>
              </div>

              <div className="verification-badge verified" style={{ fontSize: '11px', textAlign: 'center' }}>
                Candidate VSU Prototype • Requires Authorised Verification
              </div>
            </>
          ) : selectedFloor ? (
            <>
              <div className="floor-summary-card">
                <h3>{selectedFloor.floorLabel}</h3>
                <p>Elevation Range: <strong>{selectedFloor.zBottom.toFixed(1)}m – {selectedFloor.zTop.toFixed(1)}m</strong></p>
                <p>Floor Height: <strong>{selectedFloor.floorHeight}m</strong></p>
                <p>Total Registered Units: <strong>{selectedFloor.vsus.length} Units</strong></p>
              </div>
              <div className="unit-chips">
                {selectedFloor.vsus.map((u) => (
                  <div key={u.id} className="chip">Unit {u.unitNumber} ({u.use})</div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>👉 <strong>Click on any floor slab or apartment unit</strong> inside Tower A to inspect its registered 3D-ULPIN, title deed, and volumetric boundaries.</p>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: AUDIT & FRAUD DETECTION */}
      {activeMode === 'audit' && (
        <div className="sidebar-content">
          <div className="audit-summary-box">
            <div><strong>Sanctioned FSI/FAR:</strong> {CADASTRAL_BASE.sanctionedFSI}</div>
            <div><strong>Actual Consumed FSI:</strong> <span className="text-red">{CADASTRAL_BASE.consumedFSI} (+13.6% Illegal)</span></div>
            <div><strong>Max Allowed Height:</strong> {CADASTRAL_BASE.maxSanctionedHeight}m</div>
          </div>

          <div className="section-heading">DETECTED AS-BUILT DEVIATIONS:</div>
          {ARCHITECTURAL_VIOLATIONS.map((v) => (
            <div key={v.id} className="violation-card">
              <div className="viol-title">⚠ {v.type}</div>
              <div className="viol-dim">{v.dimensionalDeviation}</div>
              <p className="viol-desc">{v.description}</p>
              <span className="badge-critical">{v.severity} Infraction</span>
            </div>
          ))}
        </div>
      )}

      {/* MODE 3: INDOOR SOS ROUTING */}
      {activeMode === 'sos' && (
        <div className="sidebar-content">
          <div className="sos-alert-box">
            <strong>🚨 EMERGENCY RESPONDER CONSOLE</strong>
            <p>Select any occupied unit to calculate the fastest path to safety down the fire stairwell.</p>
          </div>

          {selectedVsu ? (
            <>
              <div className="meta-grid">
                <div className="meta-item"><label>Victim Location:</label><strong>Unit {selectedVsu.unitNumber} (Floor {selectedVsu.floorNumber})</strong></div>
                <div className="meta-item"><label>Occupant:</label><strong>{selectedVsu.owner}</strong></div>
                <div className="meta-item"><label>Vertical Level:</label><strong>{selectedVsu.zRange}</strong></div>
              </div>
              <button className="btn-sos-dispatch" onClick={onTriggerSOS}>
                Calculate 3D Safe Escape Trajectory
              </button>
            </>
          ) : (
            <p className="hint-text">Click any unit on any floor to dispatch route.</p>
          )}
        </div>
      )}
    </div>
  );
}
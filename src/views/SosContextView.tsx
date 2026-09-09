import React, { useState } from 'react';
import { MetricChip } from '../components/common/MetricChip';

interface SosContextViewProps {
  onTrigger3DEscapeRoute: () => void;
}

export const SosContextView: React.FC<SosContextViewProps> = ({
  onTrigger3DEscapeRoute,
}) => {
  const [coords, setCoords] = useState<{ lat: number; lon: number; accuracy: number }>({
    lat: 18.2345,
    lon: 73.9856,
    accuracy: 14.2,
  });
  const [locating, setLocating] = useState(false);
  const [routeTriggered, setRouteTriggered] = useState(false);

  const handleGetBrowserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lon: Number(pos.coords.longitude.toFixed(4)),
          accuracy: Number(pos.coords.accuracy.toFixed(1)),
        });
        setLocating(false);
      },
      () => {
        // Default to demo coordinates if denied
        setLocating(false);
      }
    );
  };

  const handleTriggerTrajectory = () => {
    setRouteTriggered(true);
    onTrigger3DEscapeRoute();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '840px', margin: '0 auto', overflowY: 'auto' }}>
      {/* Mandatory Statutory Directive */}
      <div
        style={{
          background: 'var(--color-error-container)',
          borderLeft: '4px solid var(--color-error)',
          padding: '12px 16px',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--color-error)', fontSize: '20px' }}>
            fmd_bad
          </span>
          <strong style={{ color: 'var(--color-error)', fontSize: '13px' }}>
            Mandatory Statutory Directive: Advisory Spatial Context Only
          </strong>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--color-on-error-container)', marginTop: '4px', lineHeight: '1.4' }}>
          This helper does NOT replace ERSS-112, emergency police/fire dispatch, or civil defense routing. Indoor vertical floor positioning is a computational estimate synthesized from ambient radio signals and digital twin cadastral footprints.
        </p>
      </div>

      <div className="instrument-card">
        <div className="card-header">
          <div>
            <h1 className="card-title" style={{ fontSize: '18px' }}>
              SOS Geospatial Context Resolver
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
              Low-priority helper: Resolve approximate device coordinates to nearest mapped 3D cadastre parcel
            </p>
          </div>
          <span className="status-badge estimated">Advisory Helper</span>
        </div>

        {/* Location Fix Panel */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
          <button className="btn-primary" onClick={handleGetBrowserLocation} disabled={locating}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>my_location</span>
            <span>{locating ? 'Acquiring GPS Fix...' : 'Query Device GPS'}</span>
          </button>
          <button
            className="btn-secondary"
            onClick={() => setCoords({ lat: 18.2345, lon: 73.9856, accuracy: 14.2 })}
          >
            Reset to Demo Zone Datum
          </button>
        </div>

        {/* Real-time Telemetry Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          <MetricChip label="Latitude" value={`${coords.lat}° N`} />
          <MetricChip label="Longitude" value={`${coords.lon}° E`} />
          <MetricChip label="Estimated Accuracy" value={`±${coords.accuracy}m`} subtext="GNSS L1+L5 Lock" />
          <MetricChip label="Nearest Structure" value="Tower A" subtext="98% Geometric Match" highlight />
        </div>

        {/* Resolved Cadastral Context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <div style={{ padding: '12px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
            <span className="metric-label">Resolved Parent Parcel Reference</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
              DEMO-MH-MUM-0001 (CTS-9812/2A)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
              Ward K-East • Maharashtra Urban Demonstration Zone 4
            </div>
          </div>

          <div style={{ padding: '12px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
            <span className="metric-label">Identified Building & Access Gate</span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
              Nagardrishti Tower A — Ground Portico & 18m Civic Access Road
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
              Primary Outdoor Safe Assembly Point: Assembly Zone Alpha (Coordinates: 18.2342° N, 73.9856° E)
            </div>
          </div>
        </div>

        {/* 3D Safe Escape Trajectory Action */}
        <div style={{ background: 'var(--color-surface-container)', padding: '16px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: 700 }}>
            3D Internal Wayfinding & Evacuation Route
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', margin: '6px 0 14px' }}>
            Renders an illuminated 3D path down the protected central fire stairwell to the exterior assembly courtyard.
          </p>
          <button className="btn-teal" onClick={handleTriggerTrajectory} style={{ padding: '10px 20px', fontSize: '13px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>route</span>
            <span>{routeTriggered ? '✓ 3D Evacuation Route Active' : 'Calculate 3D Safe Escape Trajectory'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

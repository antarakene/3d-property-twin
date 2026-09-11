import React from 'react';

export default function BuildingControls({
  activeMode,
  setActiveMode,
  activeFloorFilter,
  setActiveFloorFilter,
  isExploded,
  onToggleExplode,
  onFlyToTower,
  onTopDownView,
  transparencyMode,
  onToggleTransparency,
  showLabels,
  onToggleLabels,
  viewMode,
  onToggleViewMode,
  buildingName = 'Tower A',
  totalFloors = 10,
}) {
  return (
    <div className="hud-panel controls-hub">
      <div className="brand-strip">
        <div className="brand-title">NAGARDRISHTI 3D</div>
        <div className="brand-subtitle">3D ULPIN & Vertical Property Mapping</div>
      </div>

      <div className="mode-toggle-bar">
        <button
          className={`mode-tab ${activeMode === 'cadastre' ? 'mode-tab-active' : ''}`}
          onClick={() => setActiveMode('cadastre')}
        >
          📐 Cadastre
        </button>
        <button
          className={`mode-tab ${activeMode === 'audit' ? 'mode-tab-active audit-active' : ''}`}
          onClick={() => setActiveMode('audit')}
        >
          🔍 Audit
        </button>
        <button
          className={`mode-tab ${activeMode === 'sos' ? 'mode-tab-active sos-active' : ''}`}
          onClick={() => setActiveMode('sos')}
        >
          🚨 SOS
        </button>
      </div>

      <div className="control-section">
        <div className="section-label">
          <span>Floor Filter</span>
          <span>{activeFloorFilter ? `Floor ${activeFloorFilter}` : 'All Floors'}</span>
        </div>
        <input
          type="range"
          min="0"
          max={totalFloors}
          value={activeFloorFilter ?? 0}
          onChange={(e) => setActiveFloorFilter(e.target.value === '0' ? null : Number(e.target.value))}
          className="floor-slider"
        />
        <div className="slider-ticks">
          <span>A</span>
          {Array.from({ length: totalFloors }, (_, i) => i + 1)
            .filter((n) => n > 1)
            .map((n) => (
              <span key={n}>{n}</span>
            ))}
        </div>
      </div>

      <div className="control-section">
        <div className="section-label"><span>Actions</span></div>
        <div className="action-grid">
          <button className="btn-hud" onClick={onFlyToTower}>
            🎯 Fly to {buildingName}
          </button>
          <button
            className={`btn-hud ${isExploded ? 'btn-active' : ''}`}
            onClick={onToggleExplode}
          >
            {isExploded ? '⤓' : '⤒'} {isExploded ? 'Collapse' : 'Explode'}
          </button>
          <button className="btn-hud" onClick={onTopDownView}>
            🗺 Top-Down Cadastre
          </button>
          <button
            className={`btn-hud ${transparencyMode ? 'btn-active' : ''}`}
            onClick={onToggleTransparency}
          >
            👁 {transparencyMode ? 'Solid Mode' : 'X-Ray'}
          </button>
          <button
            className={`btn-hud ${showLabels ? 'btn-active' : ''}`}
            onClick={onToggleLabels}
          >
            🏷 {showLabels ? 'Hide Labels' : 'Show Labels'}
          </button>
          <button
            className={`btn-hud ${viewMode === 'model' ? 'btn-active' : ''}`}
            onClick={onToggleViewMode}
          >
            🏢 {viewMode === 'model' ? 'Photorealistic' : 'Interactive Tower'}
          </button>
        </div>
      </div>
    </div>
  );
}

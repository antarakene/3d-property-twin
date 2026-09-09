import React, { useState } from 'react';

export const StatutoryBanner: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div
        className="statutory-banner"
        style={{ cursor: 'pointer', justifyContent: 'center', opacity: 0.8 }}
        onClick={() => setCollapsed(false)}
      >
        <span>⚠️ Prototype Environment — Click to expand statutory disclaimer</span>
      </div>
    );
  }

  return (
    <div className="statutory-banner">
      <div className="statutory-banner-content">
        <span className="statutory-tag">Prototype Demo</span>
        <p className="truncate">
          “Prototype spatial intelligence and evidence-backed records. Requires authorised verification and does not constitute legal title, official ULPIN issuance, statutory approval, property certification, fraud confirmation or emergency dispatch.”
        </p>
      </div>
      <button
        onClick={() => setCollapsed(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '0 4px',
          fontSize: '12px',
          flexShrink: 0,
        }}
        title="Collapse Banner"
      >
        ✕
      </button>
    </div>
  );
};

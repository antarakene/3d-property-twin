import React from 'react';

interface MetricChipProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  highlight?: boolean;
}

export const MetricChip: React.FC<MetricChipProps> = ({
  label,
  value,
  unit,
  subtext,
  highlight = false,
}) => {
  return (
    <div className="metric-chip" style={highlight ? { borderColor: 'var(--color-active)' } : undefined}>
      <span className="metric-label">{label}</span>
      <div className="metric-value-row">
        <span className="metric-value" style={highlight ? { color: 'var(--color-secondary)' } : undefined}>
          {value}
        </span>
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      {subtext && (
        <span style={{ fontSize: '10px', color: 'var(--color-outline)', marginTop: '2px' }}>
          {subtext}
        </span>
      )}
    </div>
  );
};

import React from 'react';
import type { VerificationStatus } from '../../types/cadastre';

interface StatusBadgeProps {
  status: VerificationStatus | 'Conflict' | 'Estimated' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let badgeClass = 'draft';
  let iconName = 'pending';
  let displayLabel = status;

  switch (status) {
    case 'Verified':
    case 'Approved':
      badgeClass = 'verified';
      iconName = 'verified';
      displayLabel = status === 'Approved' ? 'Approved' : 'Verified';
      break;
    case 'Under Review':
      badgeClass = 'review';
      iconName = 'schedule';
      displayLabel = 'Under Review';
      break;
    case 'Draft':
    case 'Candidate':
      badgeClass = 'draft';
      iconName = 'edit_document';
      displayLabel = 'Draft';
      break;
    case 'Conflict':
    case 'Rejected':
      badgeClass = 'conflict';
      iconName = 'warning';
      displayLabel = status === 'Rejected' ? 'Rejected' : 'Potential Conflict';
      break;
    case 'Estimated':
      badgeClass = 'estimated';
      iconName = 'visibility';
      displayLabel = 'Estimated';
      break;
    default:
      badgeClass = 'draft';
      iconName = 'info';
  }

  return (
    <span className={`status-badge ${badgeClass}`} style={{ fontSize: size === 'sm' ? '9px' : '10px' }}>
      <span className="material-symbols-outlined" style={{ fontSize: size === 'sm' ? '12px' : '13px' }}>
        {iconName}
      </span>
      <span>{displayLabel}</span>
    </span>
  );
};

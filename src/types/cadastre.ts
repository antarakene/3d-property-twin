// ====================================================================
// NagarDrishti 3D - Domain Data Models & Types
// ====================================================================

export type UserRole = 'public_demo' | 'surveyor' | 'municipal_officer' | 'admin';

export type ConfidenceTier = 'Tier A' | 'Tier B' | 'Tier C' | 'Tier D';

export type VerificationStatus =
  | 'Draft'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Returned for Correction'
  | 'Verified';

export interface ParentParcel {
  id: string;
  demoUlpinReference: string;
  parcelName: string;
  surveyNumber: string;
  state: string;
  district: string;
  taluka: string;
  zoneName: string;
  areaSqm: number;
  spatialDatum: string;
  geometry?: any;
}

export interface Building {
  id: string;
  parcelId: string;
  buildingName: string;
  buildingCode: string;
  totalFloors: number;
  heightM: number;
  confidenceTier: ConfidenceTier;
  status: 'Verified' | 'Under Review' | 'Draft' | 'Estimated' | 'Conflict';
  baseCoordinates: {
    longitude: number;
    latitude: number;
    altitude: number;
  };
  geometry?: any;
}

export interface Floor {
  id: string;
  buildingId: string;
  floorNumber: number;
  floorLabel: string;
  zBottomM: number;
  zTopM: number;
  floorHeightM: number;
  vsus?: CandidateVsu[];
}

export interface CandidateVsu {
  id: string; // Internal UUID
  buildingId: string;
  floorId: string;
  floorNumber?: number;
  prototypeVsuIdentifier: string; // e.g. DEMO-MH-MUM-0001-VSU-A-07-702
  canonical3dUlpin?: string; // e.g. ULPIN3D-MH-CTS98122A-TOWERB-F07-U705-Z24.3_28.2
  unitNumber: string; // e.g. 702
  unitName?: string;
  useType: string;
  carpetAreaSqm: number;
  builtupAreaSqm: number;
  volumeCum: number;
  zBottomM: number;
  zTopM: number;
  confidenceTier: ConfidenceTier;
  verificationStatus: VerificationStatus;
  mockDocumentReference?: string;
  mockOccupantName?: string;
  quadrantCode?: string;
  hasViolation?: boolean;
  violationDetails?: string | null;
  noticePeriodDays?: number;
  noticeDeadline?: string;
  officerRemarks?: string;
  discrepancySummary?: string;
  geometry?: any;
}

export interface EvidenceSource {
  id: string;
  buildingId?: string;
  vsuId?: string;
  sourceType: string;
  title: string;
  description?: string;
  fileUrl?: string;
  sensorGsd?: string;
  concurrenceScore?: number;
  captureDate?: string;
  metadata?: any;
}

export interface SatelliteObservation {
  id: string;
  buildingId: string;
  observationStage: 'T1 Baseline' | 'T2 Comparative';
  captureDate: string;
  heightM: number;
  footprintSqm: number;
  diffDetected: boolean;
  imageUrl?: string;
  metadata?: any;
}

export interface SurveyObservation {
  id: string;
  buildingId: string;
  vehicleId: string;
  captureDate: string;
  sensorType: string;
  observationNotes: string;
  imageUrl?: string;
}

export interface DiscrepancyAlert {
  id: string;
  buildingId: string;
  buildingName?: string;
  vsuId?: string;
  alertCode: string;
  alertType: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  heightDeltaM?: number;
  footprintDeltaSqm?: number;
  description: string;
  status: 'Active' | 'Under Review' | 'Resolved' | 'Dismissed';
}

export interface VerificationTask {
  id: string;
  vsuId: string;
  vsuIdentifier?: string;
  verificationStatus: VerificationStatus;
  officerNotes?: string;
  noticePeriodDays?: number;
  noticeDeadline?: string;
  rejectionReason?: string;
  checklistResults?: {
    manifold2d?: boolean;
    boundaryWithinBuilding?: boolean;
    verticalClearanceValid?: boolean;
    noVsuOverlap?: boolean;
    deedTolerancePassed?: boolean;
  };
  assignedOfficer?: string;
  updatedAt?: string;
}

export interface RecordVersion {
  id: string;
  vsuId: string;
  versionNumber: string;
  versionStatus: string;
  snapshotData: any;
  auditRecordReference: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  vsuId?: string;
  eventTitle: string;
  eventType: string;
  performedBy: string;
  userRole: string;
  description: string;
  createdAt: string;
}

export interface SosLocationContext {
  latitude: number;
  longitude: number;
  accuracyM: number;
  nearestParcel: ParentParcel;
  nearestBuilding: Building;
  nearestVsu?: CandidateVsu;
  evacuationPath?: Array<{ lon: number; lat: number; z: number }>;
}

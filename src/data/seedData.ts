import type {
  ParentParcel,
  Building,
  Floor,
  CandidateVsu,
  EvidenceSource,
  SatelliteObservation,
  SurveyObservation,
  DiscrepancyAlert,
  VerificationTask,
  RecordVersion,
  AuditEvent,
} from '../types/cadastre';

export const SEED_PARCELS: ParentParcel[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    demoUlpinReference: 'DEMO-MH-MUM-0001',
    parcelName: 'Plot CTS-9812/2A (Twin Towers)',
    surveyNumber: 'CTS-9812/2A',
    state: 'Maharashtra (27)',
    district: 'Mumbai Suburban (518)',
    taluka: 'Andheri (03)',
    zoneName: 'Maharashtra Urban Demo Zone 4',
    areaSqm: 2436.0,
    spatialDatum: 'EPSG:7760 • WGS84 UTM 43N',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    demoUlpinReference: 'DEMO-MH-MUM-0002',
    parcelName: 'Plot CTS-9812/2B (Commerce Plaza Complex)',
    surveyNumber: 'CTS-9812/2B',
    state: 'Maharashtra (27)',
    district: 'Mumbai Suburban (518)',
    taluka: 'Andheri (03)',
    zoneName: 'Maharashtra Urban Demo Zone 4',
    areaSqm: 1850.0,
    spatialDatum: 'EPSG:7760 • WGS84 UTM 43N',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    demoUlpinReference: 'DEMO-MH-MUM-0003',
    parcelName: 'Plot CTS-9812/2C (Heritage & Green Enclave)',
    surveyNumber: 'CTS-9812/2C',
    state: 'Maharashtra (27)',
    district: 'Mumbai Suburban (518)',
    taluka: 'Andheri (03)',
    zoneName: 'Maharashtra Urban Demo Zone 4',
    areaSqm: 3100.0,
    spatialDatum: 'EPSG:7760 • WGS84 UTM 43N',
  },
];

export const SEED_BUILDINGS: Building[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    parcelId: '11111111-1111-1111-1111-111111111111',
    buildingName: 'Tower A',
    buildingCode: 'TOWER-A',
    totalFloors: 10,
    heightM: 34.2,
    confidenceTier: 'Tier A',
    status: 'Verified',
    baseCoordinates: { longitude: 73.9856, latitude: 18.2345, altitude: 0.0 },
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    parcelId: '11111111-1111-1111-1111-111111111111',
    buildingName: 'Tower B',
    buildingCode: 'TOWER-B',
    totalFloors: 9,
    heightM: 34.7,
    confidenceTier: 'Tier C',
    status: 'Under Review',
    baseCoordinates: { longitude: 73.9862, latitude: 18.2348, altitude: 0.0 },
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    parcelId: '22222222-2222-2222-2222-222222222222',
    buildingName: 'Commerce Plaza',
    buildingCode: 'COMM-PLAZA',
    totalFloors: 4,
    heightM: 16.0,
    confidenceTier: 'Tier C',
    status: 'Draft',
    baseCoordinates: { longitude: 73.9840, latitude: 18.2330, altitude: 0.0 },
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    parcelId: '33333333-3333-3333-3333-333333333333',
    buildingName: 'Heritage Court',
    buildingCode: 'HERITAGE-CT',
    totalFloors: 2,
    heightM: 8.5,
    confidenceTier: 'Tier D',
    status: 'Estimated',
    baseCoordinates: { longitude: 73.9880, latitude: 18.2360, altitude: 0.0 },
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    parcelId: '33333333-3333-3333-3333-333333333333',
    buildingName: 'Green Residency',
    buildingCode: 'GREEN-RES',
    totalFloors: 6,
    heightM: 20.4,
    confidenceTier: 'Tier C',
    status: 'Conflict',
    baseCoordinates: { longitude: 73.9870, latitude: 18.2352, altitude: 0.0 },
  },
];

// Procedural Floors & Candidate VSUs generator for All 5 Demonstration Buildings
export function generateAllSeedFloorsAndVsus(): { floors: Floor[]; vsus: CandidateVsu[] } {
  const allFloors: Floor[] = [];
  const allVsus: CandidateVsu[] = [];

  const buildingConfigs = [
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      code: 'A',
      name: 'Tower A',
      parcelUlpin: 'DEMO-MH-MUM-0001',
      floors: 10,
      storyH: 3.4,
      podiumH: 1.2,
      tier: 'Tier A',
      defaultStatus: 'Verified',
      units: [
        { quad: '1', code: '01', name: 'Penthouse Suite A', use: 'Residential 3BHK', carpet: 118.5, builtup: 142.2, occupant: 'Vikramaditya Rao', deed: 'MOCK-REG-2024-8891A' },
        { quad: '2', code: '02', name: 'Corner Apartment B', use: 'Residential 2BHK', carpet: 88.0, builtup: 106.0, occupant: 'Meera S. Kulkarni', deed: 'MOCK-REG-2023-4122B' },
        { quad: '3', code: '03', name: 'Studio Suite C', use: 'Commercial Studio', carpet: 65.4, builtup: 81.2, occupant: 'Apex Digital Labs', deed: 'MOCK-REG-2024-9043C' },
        { quad: '4', code: '04', name: 'Terrace Flat D', use: 'Residential 2BHK', carpet: 94.2, builtup: 114.8, occupant: 'Farhan A. Qureshi', deed: 'MOCK-REG-2022-7719D' },
      ],
    },
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      code: 'B',
      name: 'Tower B',
      parcelUlpin: 'DEMO-MH-MUM-0001',
      floors: 9,
      storyH: 3.4,
      podiumH: 1.2,
      tier: 'Tier C',
      defaultStatus: 'Under Review',
      units: [
        { quad: '1', code: '01', name: 'Executive Suite East', use: 'Residential 3BHK', carpet: 124.0, builtup: 152.0, occupant: 'Rajesh V. Deshmukh', deed: 'MOCK-REG-2024-5011B' },
        { quad: '2', code: '02', name: 'Panorama Residence West', use: 'Residential 3BHK', carpet: 119.5, builtup: 146.8, occupant: 'Pooja Anant Joshi', deed: 'MOCK-REG-2024-5012B' },
      ],
    },
    {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      code: 'COMM',
      name: 'Commerce Plaza',
      parcelUlpin: 'DEMO-MH-MUM-0002',
      floors: 4,
      storyH: 3.8,
      podiumH: 0.8,
      tier: 'Tier C',
      defaultStatus: 'Draft',
      units: [
        { quad: '1', code: '01', name: 'Retail Anchor Wing', use: 'Commercial Retail', carpet: 180.0, builtup: 215.0, occupant: 'Sahyadri Retail Ventures', deed: 'MOCK-REG-2023-1101C' },
        { quad: '2', code: '02', name: 'Financial & Tech Suite', use: 'Commercial Office', carpet: 165.0, builtup: 198.5, occupant: 'Deccan FinServe Ltd', deed: 'MOCK-REG-2023-1102C' },
      ],
    },
    {
      id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      code: 'HER',
      name: 'Heritage Court',
      parcelUlpin: 'DEMO-MH-MUM-0003',
      floors: 2,
      storyH: 3.8,
      podiumH: 0.9,
      tier: 'Tier D',
      defaultStatus: 'Estimated',
      units: [
        { quad: '1', code: '01', name: 'Courtyard Manor Flat A', use: 'Heritage Residential', carpet: 135.0, builtup: 162.0, occupant: 'Sardar Yashwant Patwardhan', deed: 'MOCK-REG-1988-HER01' },
        { quad: '2', code: '02', name: 'Artisan Colonial Flat B', use: 'Heritage Residential', carpet: 128.0, builtup: 154.0, occupant: 'Ananya Dixit', deed: 'MOCK-REG-1992-HER02' },
      ],
    },
    {
      id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      code: 'GRN',
      name: 'Green Residency',
      parcelUlpin: 'DEMO-MH-MUM-0003',
      floors: 6,
      storyH: 3.2,
      podiumH: 1.2,
      tier: 'Tier C',
      defaultStatus: 'Conflict',
      units: [
        { quad: '1', code: '01', name: 'Eco Green Garden Flat A', use: 'Eco Residential 2BHK', carpet: 92.0, builtup: 110.0, occupant: 'Gaurav S. Shinde', deed: 'MOCK-REG-2024-GR01' },
        { quad: '2', code: '02', name: 'Terrace Balcony Flat B', use: 'Eco Residential 2BHK', carpet: 95.5, builtup: 114.5, occupant: 'Nalini Hemant Patil', deed: 'MOCK-REG-2024-GR02' },
      ],
    },
  ];

  for (const bld of buildingConfigs) {
    for (let f = 1; f <= bld.floors; f++) {
      const zBottom = bld.podiumH + (f - 1) * bld.storyH;
      const zTop = zBottom + bld.storyH;
      const floorId = `floor-${bld.code.toLowerCase()}-${f}`;

      const floorObj: Floor = {
        id: floorId,
        buildingId: bld.id,
        floorNumber: f,
        floorLabel: f === 1 ? '1st Floor (Plinth)' : f === 2 ? '2nd Floor Level' : f === 3 ? '3rd Floor Level' : `${f}th Floor Level`,
        zBottomM: zBottom,
        zTopM: zTop,
        floorHeightM: bld.storyH,
      };

      const floorVsus: CandidateVsu[] = bld.units.map((tpl) => {
        const unitNumber = `${f}${tpl.code}`;
        const vsuIdentifier = `${bld.parcelUlpin}-VSU-${bld.code}-${String(f).padStart(2, '0')}-${unitNumber}`;

        let isViolation = false;
        let violationDetails: string | null = null;
        let vsuStatus = bld.defaultStatus as any;

        if (bld.code === 'A' && f === 6 && tpl.code === '02') {
          isViolation = true;
          violationDetails = 'Potential setback balcony overhang (+1.65m horizontal deviation)';
          vsuStatus = 'Draft';
        } else if (bld.code === 'A' && f === 7 && tpl.code === '02') {
          vsuStatus = 'Under Review';
        } else if (bld.code === 'B' && f === 9) {
          isViolation = true;
          violationDetails = 'Unauthorized 9th floor level (+4.3m vertical height discrepancy over sanctioned 30.4m)';
          vsuStatus = 'Under Review';
        } else if (bld.code === 'GRN' && f === 5 && tpl.code === '02') {
          isViolation = true;
          violationDetails = 'Setback margin encroachment: Cantilever terrace extends +1.8m into green buffer';
          vsuStatus = 'Conflict';
        }

        const vsuObj: CandidateVsu = {
          id: `vsu-${bld.code.toLowerCase()}-${f}-${tpl.code}`,
          buildingId: bld.id,
          floorId,
          floorNumber: f,
          prototypeVsuIdentifier: vsuIdentifier,
          unitNumber,
          unitName: `${tpl.name} ${unitNumber}`,
          useType: tpl.use,
          carpetAreaSqm: tpl.carpet,
          builtupAreaSqm: tpl.builtup,
          volumeCum: Number((tpl.builtup * bld.storyH).toFixed(1)),
          zBottomM: zBottom,
          zTopM: zTop,
          confidenceTier: bld.tier as any,
          verificationStatus: vsuStatus,
          mockDocumentReference: tpl.deed,
          mockOccupantName: tpl.occupant,
          quadrantCode: tpl.quad,
          hasViolation: isViolation,
          violationDetails,
        };

        allVsus.push(vsuObj);
        return vsuObj;
      });

      floorObj.vsus = floorVsus;
      allFloors.push(floorObj);
    }
  }

  return { floors: allFloors, vsus: allVsus };
}

export function generateSeedTowerAFloorsAndVsus(): { floors: Floor[]; vsus: CandidateVsu[] } {
  const { floors, vsus } = generateAllSeedFloorsAndVsus();
  const towerAId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  return {
    floors: floors.filter((f) => f.buildingId === towerAId),
    vsus: vsus.filter((v) => v.buildingId === towerAId),
  };
}

const { floors: ALL_FLOORS, vsus: ALL_VSUS } = generateAllSeedFloorsAndVsus();

export const SEED_FLOORS = ALL_FLOORS;
export const SEED_VSUS = ALL_VSUS;

export const SEED_EVIDENCE: EvidenceSource[] = [
  {
    id: 'ev-1',
    buildingId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    sourceType: 'Drone DSM',
    title: '2024 Drone DSM Orthophoto',
    description: 'UAV-Surv-2024-Nov-22 stereo pair photogrammetry',
    sensorGsd: '2.4cm GSD',
    concurrenceScore: 99.1,
    captureDate: '2024-11-22',
  },
  {
    id: 'ev-2',
    buildingId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    sourceType: 'Architectural Plan',
    title: 'Sanctioned Arch. Floor Plan Rev 4',
    description: 'Municipal approved vector CAD blueprint A-07',
    sensorGsd: 'Vector CAD',
    concurrenceScore: 96.4,
    captureDate: '2024-08-15',
  },
  {
    id: 'ev-3',
    buildingId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    sourceType: 'Mobile LiDAR',
    title: 'Terrestrial Mobile LiDAR Parapet Scan',
    description: 'Exterior facade and cantilever overhang millimeter scan',
    sensorGsd: '0.012m RMSE',
    concurrenceScore: 94.8,
    captureDate: '2024-10-02',
  },
  {
    id: 'ev-4',
    buildingId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    sourceType: 'Satellite DSM',
    title: 'Multi-Spectral Satellite Stereo Pair (T2)',
    description: 'High-resolution nadir pass flagging rooftop elevation shift',
    sensorGsd: '0.3m GSD',
    concurrenceScore: 81.0,
    captureDate: '2026-07-28',
  },
  {
    id: 'ev-5',
    buildingId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    sourceType: 'Survey Vehicle',
    title: 'Vehicle Cam MMS-4 Ground Truth',
    description: 'Mobile Mapping System optical upward scan confirming RCC columns',
    sensorGsd: 'Optical 4K',
    concurrenceScore: 92.5,
    captureDate: '2026-08-04',
  },
];

export const SEED_SATELLITE_OBS: SatelliteObservation[] = [
  {
    id: 'sat-t1',
    buildingId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    observationStage: 'T1 Baseline',
    captureDate: '2025-02-14',
    heightM: 30.4,
    footprintSqm: 1104.0,
    diffDetected: false,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9_VkEkuKb1D-iK8HUTHspZKOfPVnqGyrAHlYBIcIDB-29d_RHXYFFWBBWY_6o9O5yEY2hh2wDSurWtUPfhXreNFYsfA_XHB8J_XKFe527ufxcKgehjTBpep7fiQDIzQhRc2d1r2zLcAyvJxmOqe33XS3gmJJ_mqUhoY_96V0TWZGUxP9N2X_2FxWM2L6ttoYPKPw_kuk5eOMKsMJ9qS7w215RN03muAw742qzpJhEAdfgNXHoI-GZ',
    metadata: { notes: 'Terrace clean and compliant', rooftop_structures: 'Nil' },
  },
  {
    id: 'sat-t2',
    buildingId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    observationStage: 'T2 Comparative',
    captureDate: '2026-07-28',
    heightM: 34.7,
    footprintSqm: 1146.6,
    diffDetected: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj5RJZ6Hzr0k4Rp7HwmQJneSGjYfKf8ELsP6t6eep3MGhA3_9UJrR7hrIZ_j2lX23guHtgLBeuGSGUG8qDvWlUDVPLlh2CIF5gtAIzmYma-bKsMYLG0H9hkXbYuYZWWrnQB9xxMVKv6FITiWuP3HMdFmPbHM2-1LrFpanwmtp3fhlTtPbgiYHEd7QGaABMCwN0kkFr7J7JCath6cwW5sEUH-KuEksF62Zly7cv2lS4buw76W6LtzAi',
    metadata: { height_diff_m: 4.3, footprint_diff_sqm: 42.6, notes: 'Potential rooftop structure detected' },
  },
];

export const SEED_SURVEY_OBS: SurveyObservation[] = [
  {
    id: 'surv-1',
    buildingId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    vehicleId: 'MMS-VEHICLE-04',
    captureDate: '2026-08-04',
    sensorType: 'Optical Camera + Mobile LiDAR Pod',
    observationNotes: 'Confirmed: Fresh RCC Pillars & lightweight blue galvanized tin roofing on rooftop level.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7Ql-I0xzSdsZK8g4cOpuF9xIiz_NVWcGjTkcHan7yRBdjIZABlW8AE1Wjf3IZ7IYDM5q77ofnQAxL2Ig0JDgQWzxclPHX9ZHyuiN3k_7JMwze0BAd5nzaSs_wjuVhA2w50_OoCauZAzCz58QC4FHS6fDDm0yQ6EywKhXjAILnSpdAMAx299igptgos95_wWW6YojS6zEysd8XzRxqatGMemeRY6DXpnaES7veoZSQ4KBeZ8yoNmpS',
  },
];

export const SEED_ALERTS: DiscrepancyAlert[] = [
  {
    id: '99999999-9999-9999-9999-999999999991',
    buildingId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    buildingName: 'Tower B',
    alertCode: 'ALT-2026-0042',
    alertType: 'Potential Rooftop Extension',
    severity: 'High',
    heightDeltaM: 4.3,
    footprintDeltaSqm: 42.6,
    description: 'Satellite T1 vs T2 differential detects +4.3m vertical elevation shift on terrace level exceeding sanctioned baseline.',
    status: 'Active',
  },
  {
    id: '99999999-9999-9999-9999-999999999992',
    buildingId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    buildingName: 'Tower A',
    vsuId: 'vsu-a-6-02',
    alertCode: 'ALT-2026-0089',
    alertType: 'Potential Setback Balcony Overhang',
    severity: 'Medium',
    heightDeltaM: 0.0,
    footprintDeltaSqm: 14.8,
    description: 'Cantilever living balcony overhang (+1.65m) encroaches toward civic setback perimeter on Floor 6.',
    status: 'Active',
  },
  {
    id: '99999999-9999-9999-9999-999999999993',
    buildingId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    buildingName: 'Green Residency',
    alertCode: 'ALT-2026-0105',
    alertType: 'Potential Boundary Conflict',
    severity: 'Low',
    heightDeltaM: 0.0,
    footprintDeltaSqm: 22.0,
    description: 'Adjacent parcel boundary alignment discrepancy between drone orthophoto and registered deed.',
    status: 'Active',
  },
];

export const SEED_TASKS: VerificationTask[] = [
  {
    id: 'task-1',
    vsuId: 'vsu-a-7-02',
    vsuIdentifier: 'DEMO-MH-MUM-0001-VSU-A-07-702',
    verificationStatus: 'Under Review',
    officerNotes: 'Unit 702 deed area matches 3D point cloud within 1.2% tolerance. Cross-checking mobile lidar parapet clearance.',
    checklistResults: {
      manifold2d: true,
      boundaryWithinBuilding: true,
      verticalClearanceValid: true,
      noVsuOverlap: true,
      deedTolerancePassed: true,
    },
    assignedOfficer: 'Officer A. Patil (Zone 4)',
    updatedAt: '10m ago',
  },
  {
    id: 'task-2',
    vsuId: 'vsu-b-9-01',
    vsuIdentifier: 'DEMO-MH-MUM-0001-VSU-B-09-901',
    verificationStatus: 'Under Review',
    officerNotes: 'Rooftop Level 9 Elevation Check: Mobile LiDAR and nadir satellite scan flag +4.3m vertical difference over sanctioned 30.4m ceiling datum.',
    checklistResults: {
      manifold2d: true,
      boundaryWithinBuilding: true,
      verticalClearanceValid: false,
      noVsuOverlap: true,
      deedTolerancePassed: false,
    },
    assignedOfficer: 'Officer S. Kulkarni (Zone 4)',
    updatedAt: '25m ago',
  },
  {
    id: 'task-3',
    vsuId: 'vsu-grn-5-02',
    vsuIdentifier: 'DEMO-MH-MUM-0003-VSU-GRN-05-502',
    verificationStatus: 'Under Review',
    officerNotes: 'Setback Margin Check: Cantilever living terrace extends +1.8m toward boundary road green reserve line.',
    checklistResults: {
      manifold2d: true,
      boundaryWithinBuilding: false,
      verticalClearanceValid: true,
      noVsuOverlap: true,
      deedTolerancePassed: true,
    },
    assignedOfficer: 'Officer R. Deshmukh (Zone 4)',
    updatedAt: '1h ago',
  },
];

export const SEED_VERSIONS: RecordVersion[] = [
  {
    id: 'ver-1',
    vsuId: 'vsu-a-7-02',
    versionNumber: 'v1.0',
    versionStatus: 'Draft',
    snapshotData: { area: 88.0, stage: 'Initial CAD extraction' },
    auditRecordReference: 'AUDIT-REF-2024-GENESIS-01',
    createdAt: '3d ago',
  },
  {
    id: 'ver-2',
    vsuId: 'vsu-a-7-02',
    versionNumber: 'v2.0',
    versionStatus: 'Validated',
    snapshotData: { area: 88.0, stage: '3D mesh 2-manifold validated' },
    auditRecordReference: 'AUDIT-REF-2024-VALID-02',
    createdAt: '1h ago',
  },
  {
    id: 'ver-3',
    vsuId: 'vsu-a-7-02',
    versionNumber: 'v2.1',
    versionStatus: 'Under Review',
    snapshotData: { area: 88.0, stage: 'Assigned to Officer A. Patil' },
    auditRecordReference: 'AUDIT-REF-2026-REVIEW-03',
    createdAt: '10m ago',
  },
];

export const SEED_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-1',
    vsuId: 'vsu-a-7-02',
    eventTitle: 'Candidate Record Instantiated',
    eventType: 'GENESIS',
    performedBy: 'System Pipeline',
    userRole: 'admin',
    description: 'Derived from legacy 2D CAD Cadastral Boundary Overlay Plan CTS-9812.',
    createdAt: '3d ago',
  },
  {
    id: 'aud-2',
    vsuId: 'vsu-a-7-02',
    eventTitle: 'Drone & LiDAR Point Cloud Ingested',
    eventType: 'SENSOR_INGESTION',
    performedBy: 'Surveyor R. Shinde',
    userRole: 'surveyor',
    description: 'Uploaded UAV flight survey package with 1.8cm GSD (Lic. MH-LS-891).',
    createdAt: '1d ago',
  },
  {
    id: 'aud-3',
    vsuId: 'vsu-a-7-02',
    eventTitle: 'Automated Spatial Validation Passed',
    eventType: 'VALIDATION',
    performedBy: 'Spatial Geometry Engine',
    userRole: 'system',
    description: 'Mesh 2-Manifold topology verified; vertical Z-Span bounding conforms to demo zone parameters.',
    createdAt: '1h ago',
  },
  {
    id: 'aud-4',
    vsuId: 'vsu-a-7-02',
    eventTitle: 'Officer Review Session Opened',
    eventType: 'REVIEW_OPENED',
    performedBy: 'Officer A. Patil',
    userRole: 'municipal_officer',
    description: 'Initiated by Officer A. Patil via Municipal Verification Station CAD-04.',
    createdAt: '10m ago',
  },
];

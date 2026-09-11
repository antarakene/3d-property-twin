export const STATUS_CONFIG = {
  "Title Clear & Verified": { hex: [34, 197, 94] },
  "Deviation Flagged": { hex: [239, 68, 68] },
  Verified: { hex: [34, 197, 94] },
  "Under Review": { hex: [245, 158, 11] },
  Draft: { hex: [56, 189, 248] },
  Estimated: { hex: [168, 85, 247] },
  Conflict: { hex: [239, 68, 68] },
};

// Localized Ground Datum (Base MSL = 0.0m Ground Anchor)
export const SITE_COORDINATES = {
  longitude: 73.9856,
  latitude: 18.2345,
  altitude: 0.0, // Anchored firmly to zero ground plane
};

// Complete Registry of all 5 Demonstration Vertical Structures in Maharashtra Demo Zone
export const BUILDINGS_REGISTRY = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    code: "TOWER-A",
    name: "Tower A",
    fullName: "Nagardrishti Heights Tower A",
    surveyPlotNumber: "CTS-9812/2A",
    totalFloors: 10,
    heightM: 34.2,
    storyHeight: 3.4,
    podiumHeight: 1.2,
    footprintWidthM: 28.0,
    footprintLengthM: 28.0,
    coordinates: { longitude: 73.9856, latitude: 18.2345, altitude: 0.0 },
    confidenceTier: "Tier A",
    status: "Verified",
    useCategory: "Mixed Residential & Commercial",
    architecturalStyle: "Modern Glazed Highrise",
    colorTheme: {
      slab: "#334155",
      glazing: "#38bdf8",
      highlight: "#0284c7",
      accent: "#0ea5e9",
    },
    unitsPerFloor: 4,
    hasRooftopViolation: false,
    hasSetbackViolation: true,
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    code: "TOWER-B",
    name: "Tower B",
    fullName: "Nagardrishti Heights Tower B",
    surveyPlotNumber: "CTS-9812/2B",
    totalFloors: 9,
    sanctionedFloors: 8,
    heightM: 34.7,
    sanctionedHeightM: 30.4,
    storyHeight: 3.4,
    podiumHeight: 1.2,
    footprintWidthM: 26.0,
    footprintLengthM: 26.0,
    coordinates: { longitude: 73.9862, latitude: 18.2348, altitude: 0.0 },
    confidenceTier: "Tier C",
    status: "Under Review",
    useCategory: "High-Density Residential",
    architecturalStyle: "Residential Tower with Rooftop Deviation",
    colorTheme: {
      slab: "#475569",
      glazing: "#f59e0b",
      highlight: "#d97706",
      accent: "#ef4444",
    },
    unitsPerFloor: 2,
    hasRooftopViolation: true,
    rooftopViolation: {
      id: "VIOL-TOWER-B-ROOF",
      type: "Unauthorized Rooftop Extension (+4.3m)",
      severity: "Critical",
      description: "Unsanctioned 9th level / enclosed recreational canopy (+4.30m above sanctioned 30.4m ceiling).",
      zBottom: 30.4,
      zTop: 34.7,
      volumeDeltaCum: 485.9,
    },
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    code: "COMM-PLAZA",
    name: "Commerce Plaza",
    fullName: "Deccan Commercial Plaza & Atrium",
    surveyPlotNumber: "CTS-9814/1",
    totalFloors: 4,
    heightM: 16.0,
    storyHeight: 3.8,
    podiumHeight: 0.8,
    footprintWidthM: 34.0,
    footprintLengthM: 22.0,
    coordinates: { longitude: 73.9840, latitude: 18.2330, altitude: 0.0 },
    confidenceTier: "Tier C",
    status: "Draft",
    useCategory: "Commercial Retail & Office Podium",
    architecturalStyle: "Wide-Span Commercial Atrium",
    colorTheme: {
      slab: "#1e293b",
      glazing: "#06b6d4",
      highlight: "#0891b2",
      accent: "#0284c7",
    },
    unitsPerFloor: 2,
    hasRooftopViolation: false,
  },
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    code: "HERITAGE-CT",
    name: "Heritage Court",
    fullName: "Peshwa Heritage Enclave",
    surveyPlotNumber: "CTS-9818/A",
    totalFloors: 2,
    heightM: 8.5,
    storyHeight: 3.8,
    podiumHeight: 0.9,
    footprintWidthM: 24.0,
    footprintLengthM: 20.0,
    coordinates: { longitude: 73.9880, latitude: 18.2360, altitude: 0.0 },
    confidenceTier: "Tier D",
    status: "Estimated",
    useCategory: "Preserved Heritage Enclave",
    architecturalStyle: "Colonial Basalt Stone & Terracotta Tile",
    colorTheme: {
      slab: "#78350f",
      glazing: "#fbbf24",
      highlight: "#b45309",
      accent: "#d97706",
    },
    unitsPerFloor: 2,
    hasRooftopViolation: false,
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    code: "GREEN-RES",
    name: "Green Residency",
    fullName: "Green Park Eco Residency",
    surveyPlotNumber: "CTS-9820/4",
    totalFloors: 6,
    heightM: 20.4,
    storyHeight: 3.2,
    podiumHeight: 1.2,
    footprintWidthM: 24.0,
    footprintLengthM: 24.0,
    coordinates: { longitude: 73.9870, latitude: 18.2352, altitude: 0.0 },
    confidenceTier: "Tier C",
    status: "Conflict",
    useCategory: "Eco Residential Apartments",
    architecturalStyle: "Terraced Apartments with Cantilever Balconies",
    colorTheme: {
      slab: "#14532d",
      glazing: "#22c55e",
      highlight: "#15803d",
      accent: "#ef4444",
    },
    unitsPerFloor: 2,
    hasSetbackViolation: true,
    setbackViolation: {
      id: "VIOL-GREEN-BALC-05",
      type: "Road Setback Encroachment",
      severity: "High",
      description: "Cantilever living terrace protruding +1.8m beyond statutory green buffer setback line.",
      zBottom: 14.0,
      zTop: 17.2,
    },
  },
];

export const SURROUNDING_BUILDINGS = [
  { id: "SB-01", name: "Orchid Heights Block B", offset: [0.0028, 0.0018], width: 32, length: 24, height: 27.2 },
  { id: "SB-02", name: "Green Park Residency", offset: [-0.0032, 0.0012], width: 26, length: 20, height: 20.4 },
  { id: "SB-03", name: "Skyline Corporate Tower", offset: [0.0022, -0.0031], width: 40, length: 28, height: 51.0 },
  { id: "SB-04", name: "Sunrise Commercial Plaza", offset: [-0.0025, -0.0028], width: 30, length: 22, height: 13.6 },
  { id: "SB-05", name: "Residency One Apartments", offset: [0.0041, -0.0006], width: 24, length: 30, height: 17.0 },
];

export const CADASTRAL_BASE = {
  state: "Maharashtra (27)",
  district: "Pune (516)",
  taluka: "Haveli (04)",
  surveyPlotNumber: "CTS-9812/2A",
  landZone: "R-3 High-Density Mixed Residential",
  sanctionedFSI: 2.50,
  consumedFSI: 2.84, // Violation indicator
  maxSanctionedHeight: 32.0,
};

// Standard 3D ULPIN vertical generator
export function generate3DULPIN(plotNumber, block, floorNum, unitId, zMin, zMax) {
  const cleanPlot = (plotNumber || "CTS-9812").replace(/[^a-zA-Z0-9]/g, "");
  const volHash = Math.abs(Math.sin(zMin * 31.17 + zMax * 17.89) * 10000)
    .toString(16)
    .substring(0, 4)
    .toUpperCase();
  const fStr = floorNum < 10 ? `0${floorNum}` : `${floorNum}`;
  return `ULPIN-MH-${cleanPlot}-${block}-F${fStr}-U${unitId}-Z${zMin.toFixed(0)}_${zMax.toFixed(0)}-${volHash}`;
}

export function findBuilding(codeOrId) {
  if (!codeOrId) return BUILDINGS_REGISTRY[0];
  const normalized = String(codeOrId).toLowerCase();
  return (
    BUILDINGS_REGISTRY.find(
      (b) =>
        b.id.toLowerCase() === normalized ||
        b.code.toLowerCase() === normalized ||
        b.name.toLowerCase() === normalized
    ) || BUILDINGS_REGISTRY[0]
  );
}

// Unit templates tailored per building type
const BUILDING_UNIT_TEMPLATES = {
  "TOWER-A": [
    { quad: "1", code: "01", name: "Penthouse Suite A", use: "Residential 3BHK", carpet: 118.5, builtup: 142.2, owner: "Vikramaditya Rao", deed: "REG-2024-8891A" },
    { quad: "2", code: "02", name: "Corner Apartment B", use: "Residential 2BHK", carpet: 88.0, builtup: 106.0, owner: "Meera S. Kulkarni", deed: "REG-2023-4122B" },
    { quad: "3", code: "03", name: "Studio Suite C", use: "Commercial Studio", carpet: 65.4, builtup: 81.2, owner: "Apex Digital Labs", deed: "REG-2024-9043C" },
    { quad: "4", code: "04", name: "Terrace Flat D", use: "Residential 2BHK", carpet: 94.2, builtup: 114.8, owner: "Farhan A. Qureshi", deed: "REG-2022-7719D" },
  ],
  "TOWER-B": [
    { quad: "1", code: "01", name: "Executive Suite East", use: "Residential 3BHK", carpet: 124.0, builtup: 152.0, owner: "Rajesh V. Deshmukh", deed: "REG-2024-5011B" },
    { quad: "2", code: "02", name: "Panorama Residence West", use: "Residential 3BHK", carpet: 119.5, builtup: 146.8, owner: "Pooja Anant Joshi", deed: "REG-2024-5012B" },
  ],
  "COMM-PLAZA": [
    { quad: "1", code: "01", name: "Retail Anchor Wing", use: "Commercial Retail", carpet: 180.0, builtup: 215.0, owner: "Sahyadri Retail Ventures", deed: "REG-2023-1101C" },
    { quad: "2", code: "02", name: "Financial & Tech Suite", use: "Commercial Office", carpet: 165.0, builtup: 198.5, owner: "Deccan FinServe Ltd", deed: "REG-2023-1102C" },
  ],
  "HERITAGE-CT": [
    { quad: "1", code: "01", name: "Courtyard Manor Flat A", use: "Heritage Residential", carpet: 135.0, builtup: 162.0, owner: "Sardar Yashwant Patwardhan", deed: "REG-1988-HER01" },
    { quad: "2", code: "02", name: "Artisan Colonial Flat B", use: "Heritage Residential", carpet: 128.0, builtup: 154.0, owner: "Ananya Dixit", deed: "REG-1992-HER02" },
  ],
  "GREEN-RES": [
    { quad: "1", code: "01", name: "Eco Green Garden Flat A", use: "Eco Residential 2BHK", carpet: 92.0, builtup: 110.0, owner: "Gaurav S. Shinde", deed: "REG-2024-GR01" },
    { quad: "2", code: "02", name: "Terrace Balcony Flat B", use: "Eco Residential 2BHK", carpet: 95.5, builtup: 114.5, owner: "Nalini Hemant Patil", deed: "REG-2024-GR02" },
  ],
};

export function isVsuMatch(a, b) {
  if (!a || !b) return false;
  if (a.id && b.id && a.id === b.id) return true;
  if (a.prototypeVsuIdentifier && b.prototypeVsuIdentifier && a.prototypeVsuIdentifier === b.prototypeVsuIdentifier) return true;
  if (a.id && b.prototypeVsuIdentifier && a.id === b.prototypeVsuIdentifier) return true;
  if (a.prototypeVsuIdentifier && b.id && a.prototypeVsuIdentifier === b.id) return true;
  const aBld = a.buildingId || a.buildingCode;
  const bBld = b.buildingId || b.buildingCode;
  if (aBld && bBld && aBld !== bBld) return false;
  return String(a.unitNumber) === String(b.unitNumber);
}

const BUILDING_PARCEL_MAP = {
  "TOWER-A": { parcel: "DEMO-MH-MUM-0001", code: "A" },
  "TOWER-B": { parcel: "DEMO-MH-MUM-0001", code: "B" },
  "COMM-PLAZA": { parcel: "DEMO-MH-MUM-0002", code: "COMM" },
  "HERITAGE-CT": { parcel: "DEMO-MH-MUM-0003", code: "HER" },
  "GREEN-RES": { parcel: "DEMO-MH-MUM-0003", code: "GRN" },
};

// Universal Floor and VSU generator for any building in the registry
export function generateBuildingFloors(codeOrId) {
  const building = findBuilding(codeOrId);
  const floors = [];
  const floorHeight = building.storyHeight || 3.4;
  const podiumHeight = building.podiumHeight || 1.2;
  const totalFloors = building.totalFloors;
  const templates = BUILDING_UNIT_TEMPLATES[building.code] || BUILDING_UNIT_TEMPLATES["TOWER-A"];
  const parcelInfo = BUILDING_PARCEL_MAP[building.code] || { parcel: "DEMO-MH-MUM-0001", code: "A" };

  for (let f = 1; f <= totalFloors; f++) {
    const zBottom = podiumHeight + (f - 1) * floorHeight;
    const zTop = zBottom + floorHeight;

    const vsus = templates.map((tpl) => {
      const unitNumber = `${f}${tpl.code}`;
      const prototypeVsuIdentifier = `${parcelInfo.parcel}-VSU-${parcelInfo.code}-${String(f).padStart(2, "0")}-${unitNumber}`;
      const ulpin = generate3DULPIN(
        building.surveyPlotNumber,
        building.code.replace(/[^A-Z]/g, ""),
        f,
        unitNumber,
        zBottom,
        zTop
      );

      // Structure-specific simulated violations
      let isViolation = false;
      let violationDetails = null;

      if (building.code === "TOWER-A" && f === 6 && tpl.code === "02") {
        isViolation = true;
        violationDetails = "Unauthorized cantilever balcony extension (+1.65m beyond statutory road setback).";
      } else if (building.code === "TOWER-B" && f === 9) {
        isViolation = true;
        violationDetails = "Unauthorized 9th floor level (+4.3m vertical height discrepancy over sanctioned 30.4m).";
      } else if (building.code === "GREEN-RES" && f === 5 && tpl.code === "02") {
        isViolation = true;
        violationDetails = "Setback margin encroachment: Cantilever terrace extends +1.8m into mandatory green buffer.";
      }

      let status = isViolation
        ? "Deviation Flagged"
        : building.status === "Verified"
        ? "Title Clear & Verified"
        : building.status;

      return {
        id: ulpin,
        prototypeVsuIdentifier,
        buildingId: building.id,
        buildingCode: building.code,
        unitNumber,
        floorNumber: f,
        unitName: `${tpl.name} (${unitNumber})`,
        building: building.fullName,
        owner: tpl.owner,
        deedNumber: tpl.deed,
        use: tpl.use,
        carpetArea: `${tpl.carpet} m²`,
        carpetAreaSqm: tpl.carpet,
        builtUpArea: `${tpl.builtup} m²`,
        builtupAreaSqm: tpl.builtup,
        volume: `${(tpl.builtup * floorHeight).toFixed(1)} m³`,
        volumeCum: Number((tpl.builtup * floorHeight).toFixed(1)),
        zRange: `${zBottom.toFixed(1)}m – ${zTop.toFixed(1)}m Ground Datum`,
        zBottomM: zBottom,
        zTopM: zTop,
        relativeZ: { bottom: zBottom, top: zTop, height: floorHeight },
        status,
        verificationStatus: isViolation ? "Conflict" : building.status,
        confidenceTier: building.confidenceTier,
        hasViolation: isViolation,
        violationDetails,
        quadrantCode: tpl.quad,
      };
    });

    floors.push({
      floorNumber: f,
      floorLabel:
        f === 1
          ? "1st Floor (Plinth)"
          : f === 2
          ? "2nd Floor Level"
          : f === 3
          ? "3rd Floor Level"
          : `${f}th Floor Level`,
      zBottom,
      zTop,
      floorHeight,
      buildingId: building.id,
      vsus,
    });
  }

  return floors;
}

// Backwards-compatible Tower A floor generator (used by test suite)
export const generateTowerFloors = () => {
  return generateBuildingFloors("TOWER-A");
};

// BIM vs. As-built scan deviations for Tower A
export const ARCHITECTURAL_VIOLATIONS = [
  {
    id: "VIOL-ROOF-01",
    type: "Illegal Rooftop Deck & Canopy",
    severity: "Critical",
    description: "Unauthorized +3.4m steel structure on terrace level exceeding sanctioned master plan.",
    dimensionalDeviation: "+3.40m vertical; 132 m² unauthorized FAR",
    zBottom: 28.4,
    zTop: 31.8,
    bbox: [-0.00014, -0.00014, 0.00014, 0.00014],
  },
  {
    id: "VIOL-BALC-06",
    type: "Setback Encroachment (Unit 602)",
    severity: "High",
    description: "Extended cantilevered living balcony overhang into civic marginal distance.",
    dimensionalDeviation: "+1.65m horizontal deviation beyond sanctioned perimeter",
    zBottom: 18.2,
    zTop: 21.6,
    bbox: [0.00014, -0.00014, 0.00020, -0.00001],
  },
];

// 3D Evacuation Path Calculator (supports any building in the zone)
export function calculateEvacuationPath(startFloor, quadCode, buildingCodeOrId = "TOWER-A") {
  const building = findBuilding(buildingCodeOrId);
  const path = [];
  const f = parseInt(startFloor, 10);
  const floorH = building.storyHeight || 3.4;
  const podiumH = building.podiumHeight || 1.2;

  const quadOffsets = {
    "1": { dLon: 0.00007, dLat: 0.00007 },
    "2": { dLon: 0.00007, dLat: -0.00007 },
    "3": { dLon: -0.00007, dLat: -0.00007 },
    "4": { dLon: -0.00007, dLat: 0.00007 },
  };
  const offset = quadOffsets[quadCode] || quadOffsets["1"];
  const startZ = podiumH + (f - 1) * floorH + 1.2;
  const { longitude: bLon, latitude: bLat } = building.coordinates;

  // 1. Inside Unit
  path.push({
    lon: bLon + offset.dLon,
    lat: bLat + offset.dLat,
    z: startZ,
    name: `Unit Origin Floor ${f} (${building.name})`,
  });

  // 2. Central Fire Corridor
  path.push({
    lon: bLon,
    lat: bLat,
    z: startZ,
    name: `Central Fire Corridor F${f}`,
  });

  // 3. Central Stairwell descent
  for (let downF = f - 1; downF >= 0; downF--) {
    const downZ = downF === 0 ? 0.3 : podiumH + (downF - 1) * floorH + 1.2;
    path.push({
      lon: bLon,
      lat: bLat,
      z: downZ,
      name: downF === 0 ? "Ground Lobby" : `Staircase Landing F${downF}`,
    });
  }

  // 4. Outdoor Assembly Point
  path.push({
    lon: bLon,
    lat: bLat - 0.00032,
    z: 0.1,
    name: `Primary Outdoor Assembly Area (${building.name})`,
  });

  return path;
}
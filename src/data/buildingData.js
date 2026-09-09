export const STATUS_CONFIG = {
  "Title Clear & Verified": { hex: [34, 197, 94] },
  "Deviation Flagged": { hex: [239, 68, 68] },
  Verified: { hex: [34, 197, 94] },
};

// Localized Ground Datum (Base MSL = 0.0m Ground Anchor)
export const SITE_COORDINATES = {
  longitude: 73.9856,
  latitude: 18.2345,
  altitude: 0.0, // Anchored firmly to zero ground plane
};

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
  const cleanPlot = plotNumber.replace(/[^a-zA-Z0-9]/g, "");
  const volHash = Math.abs(Math.sin(zMin * 31.17 + zMax * 17.89) * 10000)
    .toString(16)
    .substring(0, 4)
    .toUpperCase();
  const fStr = floorNum < 10 ? `0${floorNum}` : `${floorNum}`;
  return `ULPIN-MH-${cleanPlot}-${block}-F${fStr}-U${unitId}-Z${zMin.toFixed(0)}_${zMax.toFixed(0)}-${volHash}`;
}

// Generate 8 architectural floors with realistic unit configurations
export const generateTowerFloors = () => {
  const floors = [];
  const floorHeight = 3.4;
  const podiumHeight = 1.2;

  const unitTemplates = [
    { quad: "1", code: "01", name: "Penthouse Suite A", use: "Residential 3BHK", carpet: 118.5, builtup: 142.2, owner: "Vikramaditya Rao", deed: "REG-2024-8891A" },
    { quad: "2", code: "02", name: "Corner Apartment B", use: "Residential 2BHK", carpet: 88.0, builtup: 106.0, owner: "Meera S. Kulkarni", deed: "REG-2023-4122B" },
    { quad: "3", code: "03", name: "Studio Suite C", use: "Commercial Studio", carpet: 65.4, builtup: 81.2, owner: "Apex Digital Labs", deed: "REG-2024-9043C" },
    { quad: "4", code: "04", name: "Terrace Flat D", use: "Residential 2BHK", carpet: 94.2, builtup: 114.8, owner: "Farhan A. Qureshi", deed: "REG-2022-7719D" },
  ];

  for (let f = 1; f <= 8; f++) {
    const zBottom = podiumHeight + (f - 1) * floorHeight;
    const zTop = zBottom + floorHeight;

    const vsus = unitTemplates.map((tpl) => {
      const unitNumber = `${f}${tpl.code}`;
      const ulpin = generate3DULPIN(CADASTRAL_BASE.surveyPlotNumber, "A", f, unitNumber, zBottom, zTop);
      const isEncroached = f === 6 && tpl.code === "02"; // Simulated violation

      return {
        id: ulpin,
        unitNumber,
        floorNumber: f,
        unitName: `${tpl.name} (Unit ${unitNumber})`,
        building: "Nagardrishti Heights Tower A",
        owner: tpl.owner,
        deedNumber: tpl.deed,
        use: tpl.use,
        carpetArea: `${tpl.carpet} m²`,
        builtUpArea: `${tpl.builtup} m²`,
        volume: `${(tpl.builtup * floorHeight).toFixed(1)} m³`,
        zRange: `${zBottom.toFixed(1)}m – ${zTop.toFixed(1)}m Ground Datum`,
        relativeZ: { bottom: zBottom, top: zTop, height: floorHeight },
        status: isEncroached ? "Deviation Flagged" : "Title Clear & Verified",
        hasViolation: isEncroached,
        violationDetails: isEncroached
          ? "Unauthorized cantilever balcony extension (+1.65m beyond statutory road setback)."
          : null,
      };
    });

    floors.push({
      floorNumber: f,
      floorLabel: f === 1 ? "1st Floor (Plinth)" : f === 2 ? "2nd Floor Level" : f === 3 ? "3rd Floor Level" : `${f}th Floor Level`,
      zBottom,
      zTop,
      floorHeight,
      vsus,
    });
  }

  return floors;
};

// BIM vs. As-built scan deviations
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

// 3D Evacuation Path Calculator
export function calculateEvacuationPath(startFloor, quadCode) {
  const path = [];
  const f = parseInt(startFloor, 10);
  const quadOffsets = {
    "1": { dLon: 0.00007, dLat: 0.00007 },
    "2": { dLon: 0.00007, dLat: -0.00007 },
    "3": { dLon: -0.00007, dLat: -0.00007 },
    "4": { dLon: -0.00007, dLat: 0.00007 },
  };
  const offset = quadOffsets[quadCode] || quadOffsets["1"];
  const startZ = 1.2 + (f - 1) * 3.4 + 1.2;

  // 1. Inside Unit
  path.push({
    lon: SITE_COORDINATES.longitude + offset.dLon,
    lat: SITE_COORDINATES.latitude + offset.dLat,
    z: startZ,
    name: `Unit Origin Floor ${f}`,
  });

  // 2. Central Fire Corridor
  path.push({
    lon: SITE_COORDINATES.longitude,
    lat: SITE_COORDINATES.latitude,
    z: startZ,
    name: `Central Fire Corridor F${f}`,
  });

  // 3. Central Stairwell descent
  for (let downF = f - 1; downF >= 0; downF--) {
    const downZ = downF === 0 ? 0.3 : 1.2 + (downF - 1) * 3.4 + 1.2;
    path.push({
      lon: SITE_COORDINATES.longitude,
      lat: SITE_COORDINATES.latitude,
      z: downZ,
      name: downF === 0 ? "Ground Lobby" : `Staircase Landing F${downF}`,
    });
  }

  // 4. Outdoor Assembly Point
  path.push({
    lon: SITE_COORDINATES.longitude,
    lat: SITE_COORDINATES.latitude - 0.00032,
    z: 0.1,
    name: "Primary Outdoor Assembly Area",
  });

  return path;
}
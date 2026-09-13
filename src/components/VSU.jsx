import React from 'react';
import { Entity } from 'resium';
import { Cartesian2, Cartesian3, Color, DistanceDisplayCondition, NearFarScalar } from 'cesium';

export default function VSU({
  vsu,
  coordinates,
  explodedOffset = 0,
  isSelected,
  isHovered,
  transparencyMode,
  isEmergencyMode,
  isAuditMode,
  showLabels = true,
  footprintWidthM = 28.0,
  footprintLengthM = 28.0,
  unitsPerFloor = 4,
  onSelect,
  onHover,
}) {
  const { longitude: lon, latitude: lat } = coordinates;

  const cosLat = Math.cos((lat * Math.PI) / 180);
  const halfW = (footprintWidthM / 2) / (111320 * cosLat);
  const halfL = (footprintLengthM / 2) / 110540;

  // Setback from outer slab edge so glass sits neatly inside the concrete floor
  const edgeInsetW = halfW * 0.05;
  const edgeInsetL = halfL * 0.05;
  // Central corridor & core buffer gap (0.8m corridor width or min 6% of building span)
  const corridorGapW = Math.max(halfW * 0.06, 0.8 / (111320 * cosLat));
  const corridorGapL = Math.max(halfL * 0.06, 0.8 / 110540);

  // Dynamic layout calculation for 2-unit and 4-unit floorplans
  let dLonRange = [0, 0];
  let dLatRange = [0, 0];

  const quad = String(vsu.quadrantCode || vsu.unitNumber.slice(-1));

  if (unitsPerFloor === 2) {
    // 2-unit floorplan:
    // Unit 01 (East wing / quadrant 1): covers the East half of the floor
    // Unit 02 (West wing / quadrant 2): covers the West half of the floor
    if (quad === '1' || vsu.unitNumber.endsWith('01') || vsu.unitNumber.endsWith('1')) {
      dLonRange = [corridorGapW, halfW - edgeInsetW];
      dLatRange = [-halfL + edgeInsetL, halfL - edgeInsetL];
    } else {
      dLonRange = [-halfW + edgeInsetW, -corridorGapW];
      dLatRange = [-halfL + edgeInsetL, halfL - edgeInsetL];
    }
  } else {
    // 4-unit floorplan (4 quadrants):
    // 1: NE (East, North), 2: SE (East, South), 3: SW (West, South), 4: NW (West, North)
    const quadOffsets = {
      '1': { dLon: [corridorGapW, halfW - edgeInsetW], dLat: [corridorGapL, halfL - edgeInsetL] },
      '2': { dLon: [corridorGapW, halfW - edgeInsetW], dLat: [-halfL + edgeInsetL, -corridorGapL] },
      '3': { dLon: [-halfW + edgeInsetW, -corridorGapW], dLat: [-halfL + edgeInsetL, -corridorGapL] },
      '4': { dLon: [-halfW + edgeInsetW, -corridorGapW], dLat: [corridorGapL, halfL - edgeInsetL] },
    };
    const q = quadOffsets[quad] || quadOffsets['1'];
    dLonRange = q.dLon;
    dLatRange = q.dLat;
  }

  const hierarchy = Cartesian3.fromDegreesArray([
    lon + dLonRange[0], lat + dLatRange[0],
    lon + dLonRange[1], lat + dLatRange[0],
    lon + dLonRange[1], lat + dLatRange[1],
    lon + dLonRange[0], lat + dLatRange[1],
  ]);

  const baseZ = (vsu.relativeZ?.bottom ?? vsu.zBottomM ?? 1.2) + explodedOffset;
  const topZ = (vsu.relativeZ?.top ?? vsu.zTopM ?? (baseZ + 3.4)) + explodedOffset - 0.2; // Leave ceiling gap

  // Realistic Color Hierarchy
  let unitColor;
  let outlineColor = Color.fromCssColorString('#0284c7');

  if (isAuditMode) {
    if (vsu.hasViolation) {
      unitColor = Color.fromCssColorString('#dc2626').withAlpha(0.9); // Red Violation
      outlineColor = Color.YELLOW;
    } else {
      unitColor = Color.fromCssColorString('#10b981').withAlpha(0.28); // Compliant green
      outlineColor = Color.fromCssColorString('#059669');
    }
  } else if (isEmergencyMode) {
    unitColor = isSelected
      ? Color.fromCssColorString('#ef4444').withAlpha(0.95)
      : Color.fromCssColorString('#1e293b').withAlpha(0.18);
    outlineColor = isSelected ? Color.YELLOW : Color.fromCssColorString('#475569');
  } else if (isSelected) {
    unitColor = Color.fromCssColorString('#38bdf8').withAlpha(0.92); // Vivid Cyan selection
    outlineColor = Color.WHITE;
  } else if (isHovered) {
    unitColor = Color.fromCssColorString('#f59e0b').withAlpha(0.85); // Warm Amber hover
    outlineColor = Color.WHITE;
  } else if (transparencyMode) {
    unitColor = Color.fromCssColorString('#0284c7').withAlpha(0.18);
    outlineColor = Color.fromCssColorString('#38bdf8').withAlpha(0.5);
  } else {
    // Realistic modern apartment tone: Warm interior tint with ocean glass
    const basePalette = [
      '#2563eb', // Unit 01 Blue
      '#0d9488', // Unit 02 Teal
      '#6366f1', // Unit 03 Indigo
      '#0284c7', // Unit 04 Sky
    ];
    const unitIndex = parseInt(vsu.unitNumber.slice(-2), 10) || parseInt(quad, 10) || 1;
    const colorHex = basePalette[(unitIndex - 1) % basePalette.length];
    unitColor = Color.fromCssColorString(colorHex).withAlpha(0.68);
    outlineColor = Color.fromCssColorString('#0f172a');
  }

  const centerLon = lon + (dLonRange[0] + dLonRange[1]) / 2;
  const centerLat = lat + (dLatRange[0] + dLatRange[1]) / 2;
  const labelPos = Cartesian3.fromDegrees(centerLon, centerLat, topZ + 0.3);

  return (
    <>
      <Entity
        name={vsu.unitName}
        position={labelPos}
        onClick={() => onSelect(vsu)}
        onMouseEnter={() => onHover(vsu.id)}
        onMouseLeave={() => onHover(null)}
        polygon={{
          hierarchy,
          height: baseZ,
          extrudedHeight: topZ,
          material: unitColor,
          outline: true,
          outlineColor,
          outlineWidth: isSelected || isHovered ? 3 : 1,
        }}
        label={
          showLabels
            ? {
                text: String(vsu.unitNumber),
                font: 'bold 12px monospace',
                fillColor: Color.WHITE,
                outlineColor: Color.BLACK,
                outlineWidth: 3,
                style: 2,
                distanceDisplayCondition: new DistanceDisplayCondition(0, 250),
                scaleByDistance: new NearFarScalar(20, 1.0, 200, 0.5),
              }
            : undefined
        }
      />

      {/* 3D Popup Card */}
      {(isSelected || isHovered) && (
        <Entity
          name={`${vsu.unitName} 3D Popup Card`}
          position={Cartesian3.fromDegrees(centerLon, centerLat, topZ + 1.2)}
          label={{
            text: `🏢 ${vsu.unitName || vsu.unitNumber}\n📐 Carpet: ${vsu.carpetArea || (vsu.carpetAreaSqm ? vsu.carpetAreaSqm + ' m²' : 'N/A')} • Built-up: ${vsu.builtUpArea || (vsu.builtupAreaSqm ? vsu.builtupAreaSqm + ' m²' : 'N/A')}\n🔒 Status: ${vsu.status || vsu.verificationStatus || 'Verified'}${vsu.hasViolation ? '\n⚠️ ' + (vsu.violationDetails || 'Deviation Flagged') : ''}`,
            font: 'bold 12px sans-serif',
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 3,
            style: 2,
            showBackground: true,
            backgroundColor: Color.fromCssColorString('#0284c7').withAlpha(0.95),
            backgroundPadding: new Cartesian2(10, 6),
            distanceDisplayCondition: new DistanceDisplayCondition(0, 500),
            scaleByDistance: new NearFarScalar(15, 1.1, 280, 0.75),
            verticalOrigin: 1,
            pixelOffset: new Cartesian2(0, -12),
          }}
        />
      )}
    </>
  );
}

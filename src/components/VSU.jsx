import React from 'react';
import { Entity } from 'resium';
import { Cartesian2, Cartesian3, Color, DistanceDisplayCondition, NearFarScalar } from 'cesium';
import { STATUS_CONFIG } from '../data/buildingData';

export default function VSU({
  vsu,
  coordinates,
  explodedOffset = 0,
  isSelected,
  isHovered,
  transparencyMode,
  showLabels,
  onSelect,
  onHover,
  footprintWidthM = 28.0,
  footprintLengthM = 28.0,
  unitsPerFloor = 4,
}) {
  const { longitude: lon, latitude: lat, altitude = 0.0 } = coordinates;
  const statusDef = STATUS_CONFIG[vsu.status] || STATUS_CONFIG[vsu.verificationStatus] || STATUS_CONFIG.Verified;

  const cosLat = Math.cos((lat * Math.PI) / 180);
  const halfW = (footprintWidthM / 2) / (111320 * cosLat);
  const halfL = (footprintLengthM / 2) / 110540;

  const gap = 0.00001; // corridor / elevator gap
  const quad = String(vsu.unitNumber || '').slice(-1);

  let qRange;
  if (unitsPerFloor === 2) {
    // 2 Units per Floor: Split East / West
    if (quad === '1') {
      qRange = {
        dLon: [gap, halfW * 0.92],
        dLat: [-halfL * 0.88, halfL * 0.88],
      };
    } else {
      qRange = {
        dLon: [-halfW * 0.92, -gap],
        dLat: [-halfL * 0.88, halfL * 0.88],
      };
    }
  } else {
    // 4 Units per Floor: NE, SE, SW, NW quadrants
    const quadOffsets = {
      '1': { dLon: [gap, halfW * 0.92], dLat: [gap, halfL * 0.92] }, // NE
      '2': { dLon: [gap, halfW * 0.92], dLat: [-halfL * 0.92, -gap] }, // SE
      '3': { dLon: [-halfW * 0.92, -gap], dLat: [-halfL * 0.92, -gap] }, // SW
      '4': { dLon: [-halfW * 0.92, -gap], dLat: [gap, halfL * 0.92] }, // NW
    };
    qRange = quadOffsets[quad] || quadOffsets['1'];
  }

  const hierarchy = Cartesian3.fromDegreesArray([
    lon + qRange.dLon[0], lat + qRange.dLat[0],
    lon + qRange.dLon[1], lat + qRange.dLat[0],
    lon + qRange.dLon[1], lat + qRange.dLat[1],
    lon + qRange.dLon[0], lat + qRange.dLat[1],
  ]);

  const baseZ = vsu.relativeZ?.bottom ?? vsu.zBottomM ?? 1.2;
  const topZ = vsu.relativeZ?.top ?? vsu.zTopM ?? (baseZ + 3.4);
  const bottomHeight = altitude + baseZ + explodedOffset;
  const topHeight = altitude + topZ + explodedOffset;

  const [r, g, b] = statusDef.hex;
  const alpha = isSelected ? 0.95 : isHovered ? 0.85 : transparencyMode ? 0.25 : 0.72;
  const fillColor = isSelected
    ? Color.CYAN.withAlpha(0.95)
    : isHovered
    ? Color.YELLOW.withAlpha(0.85)
    : Color.fromBytes(r, g, b, Math.floor(alpha * 255));

  const centerLon = lon + (qRange.dLon[0] + qRange.dLon[1]) / 2;
  const centerLat = lat + (qRange.dLat[0] + qRange.dLat[1]) / 2;
  const labelPosition = Cartesian3.fromDegrees(centerLon, centerLat, topHeight + 0.2);
  const popupPosition = Cartesian3.fromDegrees(centerLon, centerLat, topHeight + 1.2);

  const carpetDisplay = vsu.carpetArea || (vsu.carpetAreaSqm ? `${vsu.carpetAreaSqm} m²` : '88.0 m²');
  const volumeDisplay = vsu.volume || (vsu.volumeCum ? `${vsu.volumeCum} m³` : '360.4 m³');
  const occupantDisplay = vsu.owner || vsu.mockOccupantName || 'Demonstration Owner';
  const statusDisplay = vsu.verificationStatus || vsu.status || 'Verified';

  return (
    <>
      <Entity
        name={`VSU ${vsu.unitNumber}`}
        position={labelPosition}
        onClick={() => onSelect && onSelect(vsu)}
        onMouseEnter={() => onHover && onHover(vsu.id)}
        onMouseLeave={() => onHover && onHover(null)}
        polygon={{
          hierarchy,
          height: bottomHeight,
          extrudedHeight: topHeight,
          material: fillColor,
          outline: true,
          outlineColor: isSelected ? Color.WHITE : Color.fromBytes(30, 41, 59, 255),
          outlineWidth: isSelected ? 3 : 1,
        }}
        label={
          showLabels && !isSelected
            ? {
                text: `U-${vsu.unitNumber}`,
                font: 'bold 11px sans-serif',
                fillColor: Color.WHITE,
                outlineColor: Color.BLACK,
                outlineWidth: 3,
                style: 2,
                distanceDisplayCondition: new DistanceDisplayCondition(0, 350),
                scaleByDistance: new NearFarScalar(50, 1.0, 300, 0.4),
                verticalOrigin: 1,
              }
            : undefined
        }
      />

      {/* In-Scene 3D Floating Pop-Up Card when Flat is Focused */}
      {isSelected && (
        <Entity
          name={`3D Popup Card ${vsu.unitNumber}`}
          position={popupPosition}
          onClick={() => onSelect && onSelect(vsu)}
          label={{
            text: `🎯 3D FOCUSED: Unit ${vsu.unitNumber}\n📐 ${carpetDisplay} • Vol: ${volumeDisplay}\n👤 ${occupantDisplay}\n🛡️ ${statusDisplay} • Z: ${baseZ.toFixed(1)}m–${topZ.toFixed(1)}m`,
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
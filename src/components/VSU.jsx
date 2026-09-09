import React from 'react';
import { Entity } from 'resium';
import { Cartesian3, Color, DistanceDisplayCondition, NearFarScalar } from 'cesium';
import { STATUS_CONFIG } from '../data/buildingData';

export default function VSU({
  vsu,
  coordinates,
  explodedOffset,
  isSelected,
  isHovered,
  transparencyMode,
  showLabels,
  onSelect,
  onHover,
}) {
  const { longitude: lon, latitude: lat, altitude } = coordinates;
  const statusDef = STATUS_CONFIG[vsu.status] || STATUS_CONFIG.Verified;

  const quadOffsets = {
    "1": { dLon: [0.00001, 0.00014], dLat: [0.00001, 0.00014] }, // NE
    "2": { dLon: [0.00001, 0.00014], dLat: [-0.00014, -0.00001] }, // SE
    "3": { dLon: [-0.00014, -0.00001], dLat: [-0.00014, -0.00001] }, // SW
    "4": { dLon: [-0.00014, -0.00001], dLat: [0.00001, 0.00014] }, // NW
  };

  const quad = vsu.unitNumber.slice(-1);
  const qRange = quadOffsets[quad] || quadOffsets["1"];

  const hierarchy = Cartesian3.fromDegreesArray([
    lon + qRange.dLon[0], lat + qRange.dLat[0],
    lon + qRange.dLon[1], lat + qRange.dLat[0],
    lon + qRange.dLon[1], lat + qRange.dLat[1],
    lon + qRange.dLon[0], lat + qRange.dLat[1],
  ]);

  const bottomHeight = altitude + vsu.relativeZ.bottom + explodedOffset;
  const topHeight = altitude + vsu.relativeZ.top + explodedOffset;

  const [r, g, b] = statusDef.hex;
  const alpha = isSelected ? 0.95 : isHovered ? 0.85 : transparencyMode ? 0.25 : 0.72;
  const fillColor = isSelected
    ? Color.CYAN.withAlpha(0.9)
    : isHovered
    ? Color.YELLOW.withAlpha(0.85)
    : Color.fromBytes(r, g, b, Math.floor(alpha * 255));

  const centerLon = lon + (qRange.dLon[0] + qRange.dLon[1]) / 2;
  const centerLat = lat + (qRange.dLat[0] + qRange.dLat[1]) / 2;
  const labelPosition = Cartesian3.fromDegrees(centerLon, centerLat, topHeight + 0.2);

  return (
    <Entity
      name={`VSU ${vsu.unitNumber}`}
      position={labelPosition}
      onClick={() => onSelect(vsu)}
      onMouseEnter={() => onHover(vsu.id)}
      onMouseLeave={() => onHover(null)}
      polygon={{
        hierarchy,
        height: bottomHeight,
        extrudedHeight: topHeight,
        material: fillColor,
        outline: true,
        outlineColor: isSelected ? Color.WHITE : Color.fromBytes(30, 41, 59, 255),
      }}
      label={
        showLabels
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
  );
}
import React from 'react';
import { Entity } from 'resium';
import { Cartesian3, Color } from 'cesium';
import VSU from './VSU';
import { isVsuMatch } from '../data/buildingData';

export default function BuildingFloor({
  floor,
  coordinates,
  explodedOffset = 0,
  selectedVsu,
  hoveredVsuId,
  isFloorSelected,
  transparencyMode,
  isEmergencyMode,
  isAuditMode,
  showLabels,
  onSelectVsu,
  onHoverVsu,
  onSelectFloor,
  footprintWidthM = 28.0,
  footprintLengthM = 28.0,
  unitsPerFloor = 4,
  colorTheme = {
    slab: '#334155',
    glazing: '#38bdf8',
    highlight: '#0284c7',
  },
}) {
  const { longitude: lon, latitude: lat, altitude = 0.0 } = coordinates;
  const slabThickness = 0.28;
  const baseSlabElevation = altitude + floor.zBottom + explodedOffset;
  const topCeilingElevation = altitude + floor.zTop + explodedOffset;

  const cosLat = Math.cos((lat * Math.PI) / 180);
  const halfW = (footprintWidthM / 2) / (111320 * cosLat);
  const halfL = (footprintLengthM / 2) / 110540;

  // Structural Floor Slab Footprint
  const slabHierarchy = Cartesian3.fromDegreesArray([
    lon - halfW, lat - halfL,
    lon + halfW, lat - halfL,
    lon + halfW, lat + halfL,
    lon - halfW, lat + halfL,
  ]);

  // Central Core: Protected Fire Stairwell & Elevator Shaft
  const coreHalfW = halfW * 0.22;
  const coreHalfL = halfL * 0.22;
  const coreHierarchy = Cartesian3.fromDegreesArray([
    lon - coreHalfW, lat - coreHalfL,
    lon + coreHalfW, lat - coreHalfL,
    lon + coreHalfW, lat + coreHalfL,
    lon - coreHalfW, lat + coreHalfL,
  ]);

  // Structural Corner Columns
  const colW = halfW * 0.1;
  const colL = halfL * 0.1;
  const columnPositions = [
    [-halfW * 0.95, -halfL * 0.95],
    [halfW * 0.95 - colW, -halfL * 0.95],
    [halfW * 0.95 - colW, halfL * 0.95 - colL],
    [-halfW * 0.95, halfL * 0.95 - colL],
  ];

  const glazingColor = Color.fromCssColorString(colorTheme.glazing || '#38bdf8');
  const slabColor = Color.fromCssColorString(colorTheme.slab || '#334155');

  return (
    <>
      {/* 1. Reinforced Floor Slab (Cast-in-place Concrete Look) */}
      <Entity
        name={`Floor ${floor.floorNumber} Slab`}
        onClick={() => onSelectFloor && onSelectFloor(floor)}
        polygon={{
          hierarchy: slabHierarchy,
          height: baseSlabElevation,
          extrudedHeight: baseSlabElevation + slabThickness,
          material: isFloorSelected
            ? Color.fromCssColorString('#f59e0b') // Highlighted Floor
            : slabColor,
          outline: true,
          outlineColor: Color.fromCssColorString('#0f172a'),
        }}
      />

      {/* 2. Reinforced Concrete Columns */}
      {columnPositions.map(([cLon, cLat], idx) => (
        <Entity
          key={`col-${floor.floorNumber}-${idx}`}
          name={`Structural Column F${floor.floorNumber}-${idx + 1}`}
          polygon={{
            hierarchy: Cartesian3.fromDegreesArray([
              lon + cLon, lat + cLat,
              lon + cLon + colW, lat + cLat,
              lon + cLon + colW, lat + cLat + colL,
              lon + cLon, lat + cLat + colL,
            ]),
            height: baseSlabElevation + slabThickness,
            extrudedHeight: topCeilingElevation,
            material: Color.fromCssColorString('#475569'),
            outline: true,
            outlineColor: Color.fromCssColorString('#1e293b'),
          }}
        />
      ))}

      {/* 3. Central Elevator & Fire Core */}
      <Entity
        name={`Emergency Stair Core - F${floor.floorNumber}`}
        polygon={{
          hierarchy: coreHierarchy,
          height: baseSlabElevation + slabThickness,
          extrudedHeight: topCeilingElevation,
          material: isEmergencyMode
            ? Color.fromCssColorString('#ea580c').withAlpha(0.8)
            : Color.fromCssColorString('#1e293b'),
          outline: true,
          outlineColor: isEmergencyMode ? Color.YELLOW : Color.fromCssColorString('#64748b'),
        }}
      />

      {/* 4. Ceiling Architectural Band (Sleek edge beam, non-blocking) */}
      <Entity
        name={`Floor ${floor.floorNumber} Ceiling Band`}
        polygon={{
          hierarchy: slabHierarchy,
          height: topCeilingElevation - 0.12,
          extrudedHeight: topCeilingElevation,
          material: slabColor.withAlpha(0.6),
          outline: true,
          outlineColor: glazingColor.withAlpha(0.4),
        }}
      />

      {/* 5. Individual Volumetric Units (Directly interactive) */}
      {floor.vsus &&
        floor.vsus.map((vsu) => (
          <VSU
            key={vsu.id}
            vsu={vsu}
            coordinates={coordinates}
            explodedOffset={explodedOffset}
            isSelected={isVsuMatch(selectedVsu, vsu)}
            isHovered={hoveredVsuId === vsu.id}
            transparencyMode={transparencyMode}
            isEmergencyMode={isEmergencyMode}
            isAuditMode={isAuditMode}
            showLabels={showLabels}
            footprintWidthM={footprintWidthM}
            footprintLengthM={footprintLengthM}
            unitsPerFloor={unitsPerFloor}
            onSelect={onSelectVsu}
            onHover={onHoverVsu}
          />
        ))}
    </>
  );
}
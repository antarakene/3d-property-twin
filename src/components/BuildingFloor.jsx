import React from 'react';
import { Entity } from 'resium';
import { Cartesian3, Color } from 'cesium';
import VSU from './VSU';

export default function BuildingFloor({
  floor,
  coordinates,
  explodedOffset,
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
}) {
  const { longitude: lon, latitude: lat } = coordinates;
  const slabThickness = 0.28;
  const baseSlabElevation = floor.zBottom + explodedOffset;
  const topCeilingElevation = floor.zTop + explodedOffset;

  // Structural Floor Slab Footprint (28m x 28m)
  const slabHierarchy = Cartesian3.fromDegreesArray([
    lon - 0.00017, lat - 0.00017,
    lon + 0.00017, lat - 0.00017,
    lon + 0.00017, lat + 0.00017,
    lon - 0.00017, lat + 0.00017,
  ]);

  // Central Core: Protected Fire Stairwell & Elevator Shaft
  const coreHierarchy = Cartesian3.fromDegreesArray([
    lon - 0.000035, lat - 0.000035,
    lon + 0.000035, lat - 0.000035,
    lon + 0.000035, lat + 0.000035,
    lon - 0.000035, lat + 0.000035,
  ]);

  // Structural Corner Columns
  const columnPositions = [
    [-0.00016, -0.00016],
    [0.00014, -0.00016],
    [0.00014, 0.00014],
    [-0.00016, 0.00014],
  ];

  return (
    <>
      {/* 1. Reinforced Floor Slab (Cast-in-place Concrete Look) */}
      <Entity
        name={`Floor ${floor.floorNumber} Slab`}
        onClick={() => onSelectFloor(floor)}
        polygon={{
          hierarchy: slabHierarchy,
          height: baseSlabElevation,
          extrudedHeight: baseSlabElevation + slabThickness,
          material: isFloorSelected
            ? Color.fromCssColorString('#f59e0b') // Highlighted Floor
            : Color.fromCssColorString('#334155'), // Architectural Charcoal Slab
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
              lon + cLon + 0.000018, lat + cLat,
              lon + cLon + 0.000018, lat + cLat + 0.000018,
              lon + cLon, lat + cLat + 0.000018,
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

      {/* 4. Exterior Architectural Glass Facade */}
      <Entity
        name={`Floor ${floor.floorNumber} Facade Glazing`}
        polygon={{
          hierarchy: slabHierarchy,
          height: baseSlabElevation + slabThickness,
          extrudedHeight: topCeilingElevation,
          material: isEmergencyMode
            ? Color.fromCssColorString('#ef4444').withAlpha(0.06)
            : transparencyMode
            ? Color.fromCssColorString('#38bdf8').withAlpha(0.04)
            : Color.fromCssColorString('#38bdf8').withAlpha(0.12),
          outline: true,
          outlineColor: Color.fromCssColorString('#38bdf8').withAlpha(0.35),
        }}
      />

      {/* 5. 4 Individual Volumetric Units */}
      {floor.vsus.map((vsu) => (
        <VSU
          key={vsu.id}
          vsu={vsu}
          coordinates={coordinates}
          explodedOffset={explodedOffset}
          isSelected={selectedVsu?.id === vsu.id}
          isHovered={hoveredVsuId === vsu.id}
          transparencyMode={transparencyMode}
          isEmergencyMode={isEmergencyMode}
          isAuditMode={isAuditMode}
          showLabels={showLabels}
          onSelect={onSelectVsu}
          onHover={onHoverVsu}
        />
      ))}
    </>
  );
}
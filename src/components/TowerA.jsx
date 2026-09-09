import React from 'react';
import { Entity } from 'resium';
import { Cartesian3, Color } from 'cesium';
import BuildingFloor from './BuildingFloor';
import { ARCHITECTURAL_VIOLATIONS } from '../data/buildingData';

export default function TowerA({
  coordinates,
  floors,
  isExploded,
  explodeScale = 1.0,
  activeFloorFilter,
  selectedFloor,
  selectedVsu,
  hoveredVsuId,
  transparencyMode,
  isEmergencyMode,
  isAuditMode,
  showLabels,
  onSelectFloor,
  onSelectVsu,
  onHoverVsu,
}) {
  const { longitude: lon, latitude: lat } = coordinates;

  // Solid Ground Podium
  const podiumHierarchy = Cartesian3.fromDegreesArray([
    lon - 0.00021, lat - 0.00021,
    lon + 0.00021, lat - 0.00021,
    lon + 0.00021, lat + 0.00021,
    lon - 0.00021, lat + 0.00021,
  ]);

  const topOffset = isExploded ? 8 * 4.0 * explodeScale : 0;
  const roofElevation = 1.2 + 8 * 3.4 + topOffset;

  return (
    <>
      {/* Heavy Masonry Entrance Podium (Grounded at Z = 0) */}
      {(!activeFloorFilter || activeFloorFilter === 1) && (
        <Entity
          name="Tower A Ground Entrance Podium"
          polygon={{
            hierarchy: podiumHierarchy,
            height: 0.0,
            extrudedHeight: 1.2,
            material: Color.fromCssColorString('#0f172a'),
            outline: true,
            outlineColor: Color.fromCssColorString('#38bdf8').withAlpha(0.7),
            outlineWidth: 2,
          }}
        />
      )}

      {/* 8 Distinct Vertical Floors */}
      {floors
        .filter((f) => !activeFloorFilter || f.floorNumber === activeFloorFilter)
        .map((floor) => {
          const offset = isExploded && !activeFloorFilter ? floor.floorNumber * 4.0 * explodeScale : 0;

          return (
            <BuildingFloor
              key={floor.floorNumber}
              floor={floor}
              coordinates={coordinates}
              explodedOffset={offset}
              selectedVsu={selectedVsu}
              hoveredVsuId={hoveredVsuId}
              isFloorSelected={selectedFloor?.floorNumber === floor.floorNumber}
              transparencyMode={transparencyMode}
              isEmergencyMode={isEmergencyMode}
              isAuditMode={isAuditMode}
              showLabels={showLabels}
              onSelectVsu={onSelectVsu}
              onHoverVsu={onHoverVsu}
              onSelectFloor={onSelectFloor}
            />
          );
        })}

      {/* Sanctioned Rooftop Parapet */}
      {(!activeFloorFilter || activeFloorFilter === 8) && (
        <Entity
          name="Sanctioned Terrace Boundary"
          polygon={{
            hierarchy: Cartesian3.fromDegreesArray([
              lon - 0.00017, lat - 0.00017,
              lon + 0.00017, lat - 0.00017,
              lon + 0.00017, lat + 0.00017,
              lon - 0.00017, lat + 0.00017,
            ]),
            height: roofElevation,
            extrudedHeight: roofElevation + 0.6,
            material: Color.fromCssColorString('#1e293b'),
            outline: true,
            outlineColor: Color.fromCssColorString('#38bdf8'),
          }}
        />
      )}

      {/* BIM vs Drone Violation Overlays (Visible in Audit Mode) */}
      {isAuditMode &&
        ARCHITECTURAL_VIOLATIONS.map((viol) => {
          const [minX, minY, maxX, maxY] = viol.bbox;
          const violHierarchy = Cartesian3.fromDegreesArray([
            lon + minX, lat + minY,
            lon + maxX, lat + minY,
            lon + maxX, lat + maxY,
            lon + minX, lat + maxY,
          ]);

          return (
            <Entity
              key={viol.id}
              name={viol.type}
              polygon={{
                hierarchy: violHierarchy,
                height: viol.zBottom + (isExploded ? 30.0 : 0),
                extrudedHeight: viol.zTop + (isExploded ? 30.0 : 0),
                material: Color.RED.withAlpha(0.8),
                outline: true,
                outlineColor: Color.YELLOW,
                outlineWidth: 3,
              }}
            />
          );
        })}
    </>
  );
}
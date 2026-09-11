import React from 'react';
import { Entity } from 'resium';
import { Cartesian2, Cartesian3, Color, DistanceDisplayCondition, NearFarScalar } from 'cesium';
import BuildingFloor from './BuildingFloor';
import { ARCHITECTURAL_VIOLATIONS } from '../data/buildingData';

export default function BuildingTwin({
  building,
  floors = [],
  isFocusBuilding = true,
  isExploded = false,
  explodeScale = 1.0,
  activeFloorFilter = null,
  selectedFloor = null,
  selectedVsu = null,
  hoveredVsuId = null,
  transparencyMode = false,
  isEmergencyMode = false,
  isAuditMode = false,
  showLabels = true,
  onSelectFloor,
  onSelectVsu,
  onHoverVsu,
  onFocusBuilding,
}) {
  if (!building) return null;

  const { coordinates, footprintWidthM = 28.0, footprintLengthM = 28.0 } = building;
  const { longitude: lon, latitude: lat, altitude = 0.0 } = coordinates;

  const cosLat = Math.cos((lat * Math.PI) / 180);
  const halfW = (footprintWidthM / 2) / (111320 * cosLat);
  const halfL = (footprintLengthM / 2) / 110540;

  const podiumH = building.podiumHeight || 1.2;
  const storyH = building.storyHeight || 3.4;
  const totalHeight = building.heightM || (podiumH + building.totalFloors * storyH);

  // -------------------------------------------------------------
  // 1. CONTEXTUAL VIEW (When this building is NOT the active focus)
  // -------------------------------------------------------------
  if (!isFocusBuilding) {
    const mainHierarchy = Cartesian3.fromDegreesArray([
      lon - halfW, lat - halfL,
      lon + halfW, lat - halfL,
      lon + halfW, lat + halfL,
      lon - halfW, lat + halfL,
    ]);

    const sanctionedH = building.sanctionedHeightM || totalHeight;
    const baseColor = Color.fromCssColorString(building.colorTheme?.slab || '#334155');
    const outlineColor = Color.fromCssColorString(building.colorTheme?.highlight || '#38bdf8');
    const pinPosition = Cartesian3.fromDegrees(lon, lat, totalHeight + 4.0);

    return (
      <>
        {/* Ground Plinth */}
        <Entity
          name={`${building.name} Base`}
          onClick={() => onFocusBuilding && onFocusBuilding(building.id)}
          polygon={{
            hierarchy: Cartesian3.fromDegreesArray([
              lon - halfW * 1.1, lat - halfL * 1.1,
              lon + halfW * 1.1, lat - halfL * 1.1,
              lon + halfW * 1.1, lat + halfL * 1.1,
              lon - halfW * 1.1, lat + halfL * 1.1,
            ]),
            height: altitude,
            extrudedHeight: altitude + podiumH,
            material: Color.fromCssColorString('#0f172a'),
            outline: true,
            outlineColor: outlineColor.withAlpha(0.4),
          }}
        />

        {/* Main Architectural Massing */}
        <Entity
          name={`${building.name} Main Massing`}
          onClick={() => onFocusBuilding && onFocusBuilding(building.id)}
          polygon={{
            hierarchy: mainHierarchy,
            height: altitude + podiumH,
            extrudedHeight: altitude + sanctionedH,
            material: baseColor.withAlpha(0.85),
            outline: true,
            outlineColor: outlineColor,
            outlineWidth: 2,
          }}
        />

        {/* Highlight Rooftop Violation even in context mode if applicable */}
        {building.hasRooftopViolation && (
          <Entity
            name={`${building.name} Rooftop Violation`}
            onClick={() => onFocusBuilding && onFocusBuilding(building.id)}
            polygon={{
              hierarchy: mainHierarchy,
              height: altitude + sanctionedH,
              extrudedHeight: altitude + totalHeight,
              material: Color.RED.withAlpha(0.75),
              outline: true,
              outlineColor: Color.YELLOW,
              outlineWidth: 2,
            }}
          />
        )}

        {/* Floating Interactive 3D Label */}
        <Entity
          name={`${building.name} Focus Pin`}
          position={pinPosition}
          onClick={() => onFocusBuilding && onFocusBuilding(building.id)}
          label={{
            text: `🏢 [Focus] ${building.name}\n${building.totalFloors}F • ${building.status}`,
            font: 'bold 12px sans-serif',
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 3,
            style: 2,
            showBackground: true,
            backgroundColor: Color.fromCssColorString('#0f172a').withAlpha(0.85),
            backgroundPadding: new Cartesian2(8, 4),
            distanceDisplayCondition: new DistanceDisplayCondition(0, 800),
            scaleByDistance: new NearFarScalar(100, 1.0, 600, 0.6),
            verticalOrigin: 1,
          }}
        />
      </>
    );
  }

  // -------------------------------------------------------------
  // 2. ACTIVE INTERACTIVE TWIN (Full floor breakdown, VSU inspection)
  // -------------------------------------------------------------
  const podiumHierarchy = Cartesian3.fromDegreesArray([
    lon - halfW * 1.15, lat - halfL * 1.15,
    lon + halfW * 1.15, lat - halfL * 1.15,
    lon + halfW * 1.15, lat + halfL * 1.15,
    lon - halfW * 1.15, lat + halfL * 1.15,
  ]);

  const topOffset = isExploded ? building.totalFloors * 4.0 * explodeScale : 0;
  const sanctionedElevation = (building.sanctionedHeightM || totalHeight) + topOffset;

  return (
    <>
      {/* Heavy Masonry Entrance Podium */}
      {(!activeFloorFilter || activeFloorFilter === 1) && (
        <Entity
          name={`${building.name} Ground Entrance Podium`}
          polygon={{
            hierarchy: podiumHierarchy,
            height: altitude,
            extrudedHeight: altitude + podiumH,
            material: Color.fromCssColorString('#0f172a'),
            outline: true,
            outlineColor: Color.fromCssColorString(building.colorTheme?.highlight || '#38bdf8').withAlpha(0.7),
            outlineWidth: 2,
          }}
        />
      )}

      {/* Individual Vertical Floors */}
      {floors
        .filter((f) => !activeFloorFilter || f.floorNumber === activeFloorFilter)
        .map((floor) => {
          const offset = isExploded && !activeFloorFilter ? floor.floorNumber * 4.0 * explodeScale : 0;

          return (
            <BuildingFloor
              key={`${building.code}-floor-${floor.floorNumber}`}
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
              footprintWidthM={footprintWidthM}
              footprintLengthM={footprintLengthM}
              unitsPerFloor={building.unitsPerFloor || 4}
              colorTheme={building.colorTheme}
              onSelectVsu={onSelectVsu}
              onHoverVsu={onHoverVsu}
              onSelectFloor={onSelectFloor}
            />
          );
        })}

      {/* Sanctioned Rooftop Parapet */}
      {(!activeFloorFilter || activeFloorFilter === building.totalFloors) && (
        <Entity
          name={`${building.name} Sanctioned Terrace Boundary`}
          polygon={{
            hierarchy: Cartesian3.fromDegreesArray([
              lon - halfW * 0.96, lat - halfL * 0.96,
              lon + halfW * 0.96, lat - halfL * 0.96,
              lon + halfW * 0.96, lat + halfL * 0.96,
              lon - halfW * 0.96, lat + halfL * 0.96,
            ]),
            height: sanctionedElevation,
            extrudedHeight: sanctionedElevation + 0.6,
            material: Color.fromCssColorString('#1e293b'),
            outline: true,
            outlineColor: Color.fromCssColorString(building.colorTheme?.highlight || '#38bdf8'),
          }}
        />
      )}

      {/* TOWER B SPECIFIC: Unauthorized Rooftop Extension Overlay */}
      {building.hasRooftopViolation && building.rooftopViolation && (
        <>
          <Entity
            name="Unauthorized Rooftop Level (+4.3m)"
            polygon={{
              hierarchy: Cartesian3.fromDegreesArray([
                lon - halfW * 0.92, lat - halfL * 0.92,
                lon + halfW * 0.92, lat - halfL * 0.92,
                lon + halfW * 0.92, lat + halfL * 0.92,
                lon - halfW * 0.92, lat + halfL * 0.92,
              ]),
              height: building.rooftopViolation.zBottom + topOffset,
              extrudedHeight: building.rooftopViolation.zTop + topOffset,
              material: Color.RED.withAlpha(0.65),
              outline: true,
              outlineColor: Color.YELLOW,
              outlineWidth: 3,
            }}
          />
          <Entity
            name="Rooftop Violation Pin"
            position={Cartesian3.fromDegrees(lon, lat, building.rooftopViolation.zTop + topOffset + 1.2)}
            label={{
              text: `⚠️ Unauthorized Rooftop Level\n+4.3m Extension • Vol: ${building.rooftopViolation.volumeDeltaCum || 485.9} m³`,
              font: 'bold 11px sans-serif',
              fillColor: Color.YELLOW,
              outlineColor: Color.BLACK,
              outlineWidth: 3,
              style: 2,
              showBackground: true,
              backgroundColor: Color.fromCssColorString('rgba(220, 38, 38, 0.85)'),
              backgroundPadding: new Cartesian2(8, 4),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 450),
              verticalOrigin: 1,
            }}
          />
        </>
      )}

      {/* GREEN RESIDENCY SPECIFIC: Balcony Setback Encroachment */}
      {building.hasSetbackViolation && building.setbackViolation && (
        <>
          <Entity
            name="Setback Balcony Overhang"
            polygon={{
              hierarchy: Cartesian3.fromDegreesArray([
                lon - halfW * 1.25, lat - halfL * 0.4,
                lon - halfW * 0.95, lat - halfL * 0.4,
                lon - halfW * 0.95, lat + halfL * 0.4,
                lon - halfW * 1.25, lat + halfL * 0.4,
              ]),
              height: building.setbackViolation.zBottom + (isExploded ? 18.0 : 0),
              extrudedHeight: building.setbackViolation.zTop + (isExploded ? 18.0 : 0),
              material: Color.ORANGE.withAlpha(0.75),
              outline: true,
              outlineColor: Color.YELLOW,
              outlineWidth: 3,
            }}
          />
          <Entity
            name="Setback Violation Pin"
            position={Cartesian3.fromDegrees(
              lon - halfW * 1.1,
              lat,
              building.setbackViolation.zTop + (isExploded ? 18.0 : 0) + 1.0
            )}
            label={{
              text: `⚠️ Setback Encroachment\n+1.8m into Green Buffer`,
              font: 'bold 11px sans-serif',
              fillColor: Color.YELLOW,
              outlineColor: Color.BLACK,
              outlineWidth: 3,
              style: 2,
              showBackground: true,
              backgroundColor: Color.fromCssColorString('rgba(180, 83, 9, 0.85)'),
              backgroundPadding: new Cartesian2(6, 3),
              distanceDisplayCondition: new DistanceDisplayCondition(0, 350),
              verticalOrigin: 1,
            }}
          />
        </>
      )}

      {/* TOWER A SPECIFIC: BIM vs Drone Violations in Audit Mode */}
      {building.code === 'TOWER-A' && isAuditMode &&
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

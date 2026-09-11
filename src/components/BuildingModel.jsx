import React, { useState, useEffect } from 'react';
import { Entity } from 'resium';
import { Cartesian3, Color, DistanceDisplayCondition, NearFarScalar } from 'cesium';
import { SITE_COORDINATES, ARCHITECTURAL_VIOLATIONS, STATUS_CONFIG, isVsuMatch } from '../data/buildingData';

const MODEL_URL = '/models/building.glb';

// Site-based placement: model origin sits at parcel center, ground level.
// The bundled sample (Kenney City Kit Commercial skyscraper, CC0) is authored
// in meters: ~1.3m x 1.4m footprint, ~5.5m tall. A scale of 5 gives a ~27m
// tower, close to the procedural tower's 28.4m roof. When you drop in your own
// Rhino-exported .glb, tune MODEL_SCALE so its footprint matches the site.
const MODEL_SCALE = 5.0;

export default function BuildingModel({
  floors,
  selectedVsu,
  hoveredVsuId,
  transparencyMode,
  isEmergencyMode,
  isAuditMode,
  showLabels,
  onSelectVsu,
  onHoverVsu,
}) {
  const { longitude: lon, latitude: lat, altitude } = SITE_COORDINATES;

  const [modelReady, setModelReady] = useState(true);

  // Tolerate the case where no model file has been added yet.
  useEffect(() => {
    fetch(MODEL_URL, { method: 'HEAD' })
      .then((res) => setModelReady(res.ok))
      .catch(() => setModelReady(false));
  }, []);

  const position = Cartesian3.fromDegrees(lon, lat, altitude);

  // Quadrant offsets for translucent VSU overlay shells (mirrors VSU.jsx)
  const quadOffsets = {
    "1": { dLon: [0.00001, 0.00014], dLat: [0.00001, 0.00014] },
    "2": { dLon: [0.00001, 0.00014], dLat: [-0.00014, -0.00001] },
    "3": { dLon: [-0.00014, -0.00001], dLat: [-0.00014, -0.00001] },
    "4": { dLon: [-0.00014, -0.00001], dLat: [0.00001, 0.00014] },
  };

  return (
    <>
      {/* Photorealistic imported model (from Rhino export) */}
      {modelReady && (
        <Entity
          name="Tower A - Photorealistic Model"
          position={position}
          model={{
            uri: MODEL_URL,
            scale: MODEL_SCALE,
            heightReference: 0, // NONE - keep authored absolute height
            silhouetteColor: Color.fromCssColorString('#38bdf8').withAlpha(0.5),
            silhouetteSize: 1.0,
            minimumPixelSize: 32,
            maximumScale: 20000,
            color: (isEmergencyMode ? Color.RED.withAlpha(0.6) : Color.WHITE.withAlpha(1.0)),
          }}
        />
      )}

      {/* ===== Interactive 3D-ULPIN DATA OVERLAYS (kept on top) ===== */}

      {/* Translucent VSU volume shells + labels for unit selection */}
      {(floors || []).map((floor) => {
        const baseOffset = floor.zBottom || 1.2;

        return (floor.vsus || []).map((vsu) => {
          const quad = vsu.unitNumber.slice(-1);
          const q = quadOffsets[quad] || quadOffsets["1"];
          const statusDef = STATUS_CONFIG[vsu.status] || STATUS_CONFIG.Verified;
          const [r, g, b] = statusDef.hex;

          const hierarchy = Cartesian3.fromDegreesArray([
            lon + q.dLon[0], lat + q.dLat[0],
            lon + q.dLon[1], lat + q.dLat[0],
            lon + q.dLon[1], lat + q.dLat[1],
            lon + q.dLon[0], lat + q.dLat[1],
          ]);

          const isSelected = isVsuMatch(selectedVsu, vsu);
          const isHovered = hoveredVsuId === vsu.id;

          const alpha = isSelected ? 0.85 : isHovered ? 0.75 : transparencyMode ? 0.3 : 0.35;
          const fillColor = isSelected
            ? Color.CYAN.withAlpha(0.8)
            : isHovered
            ? Color.YELLOW.withAlpha(0.75)
            : Color.fromBytes(r, g, b, Math.floor(alpha * 255));

          const centerLon = lon + (q.dLon[0] + q.dLon[1]) / 2;
          const centerLat = lat + (q.dLat[0] + q.dLat[1]) / 2;
          const labelPosition = Cartesian3.fromDegrees(centerLon, centerLat, baseOffset + 3.4 + 0.2);

          return (
            <Entity
              key={vsu.id}
              name={`VSU ${vsu.unitNumber}`}
              position={labelPosition}
              onClick={() => onSelectVsu(vsu)}
              onMouseEnter={() => onHoverVsu(vsu.id)}
              onMouseLeave={() => onHoverVsu(null)}
              polygon={{
                hierarchy,
                height: baseOffset,
                extrudedHeight: baseOffset + 3.4,
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
        });
      })}

      {/* Audit violation overlay boxes (visible in Audit mode) */}
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
                height: viol.zBottom,
                extrudedHeight: viol.zTop,
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

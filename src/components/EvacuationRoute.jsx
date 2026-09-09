import React from 'react';
import { Entity } from 'resium';
import { Cartesian3, Color, PolylineGlowMaterialProperty } from 'cesium';

export default function EvacuationRoute({ pathWaypoints, isActive }) {
  if (!isActive || !pathWaypoints || pathWaypoints.length < 2) return null;

  const positions = pathWaypoints.map((p) => Cartesian3.fromDegrees(p.lon, p.lat, p.z));
  const startPoint = positions[0];
  const endPoint = positions[positions.length - 1];

  return (
    <>
      <Entity
        name="Emergency Evacuation Path"
        polyline={{
          positions,
          width: 8.0,
          material: new PolylineGlowMaterialProperty({
            glowPower: 0.35,
            taperPower: 0.6,
            color: Color.CHARTREUSE,
          }),
          clampToGround: false,
        }}
      />

      <Entity
        name="SOS Beacon Ping"
        position={startPoint}
        point={{
          pixelSize: 16,
          color: Color.RED,
          outlineColor: Color.WHITE,
          outlineWidth: 3,
        }}
        label={{
          text: "🚨 ACTIVE SOS LOCATION",
          font: "bold 12px sans-serif",
          fillColor: Color.RED,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
          verticalOrigin: 1,
          pixelOffset: new Cartesian3(0, -20, 0),
        }}
      />

      <Entity
        name="Safe Evacuation Assembly"
        position={endPoint}
        point={{
          pixelSize: 18,
          color: Color.LIMEGREEN,
          outlineColor: Color.WHITE,
          outlineWidth: 3,
        }}
        label={{
          text: "🏁 SAFE ASSEMBLY ZONE",
          font: "bold 12px sans-serif",
          fillColor: Color.LIMEGREEN,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          verticalOrigin: 1,
          pixelOffset: new Cartesian3(0, -20, 0),
        }}
      />
    </>
  );
}
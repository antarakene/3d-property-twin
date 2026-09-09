import React from 'react';
import { Entity } from 'resium';
import { Cartesian3, Color } from 'cesium';
import { SURROUNDING_BUILDINGS, SITE_COORDINATES } from '../data/buildingData';

export default function SurroundingBuildings() {
  const { longitude: cLon, latitude: cLat, altitude: baseAlt } = SITE_COORDINATES;

  return (
    <>
      {SURROUNDING_BUILDINGS.map((bld) => {
        const lon = cLon + bld.offset[0];
        const lat = cLat + bld.offset[1];

        // Convert dimensions to approximate geographic degrees
        const dLon = (bld.width / 111320) / Math.cos((cLat * Math.PI) / 180);
        const dLat = bld.length / 110540;

        const hierarchy = Cartesian3.fromDegreesArray([
          lon - dLon / 2, lat - dLat / 2,
          lon + dLon / 2, lat - dLat / 2,
          lon + dLon / 2, lat + dLat / 2,
          lon - dLon / 2, lat + dLat / 2,
        ]);

        return (
          <Entity
            key={bld.id}
            name={bld.name}
            polygon={{
              hierarchy,
              height: baseAlt,
              extrudedHeight: baseAlt + bld.height,
              material: Color.LIGHTSLATEGRAY.withAlpha(0.75),
              outline: true,
              outlineColor: Color.DARKSLATEGRAY,
            }}
          />
        );
      })}
    </>
  );
}
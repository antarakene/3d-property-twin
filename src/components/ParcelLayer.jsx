import React from 'react';
import { Entity } from 'resium';
import { Cartesian3, Color } from 'cesium';
import { BUILDINGS_REGISTRY } from '../data/buildingData';

export default function ParcelLayer() {
  // Demonstration Zone Master Boundary: ~600m x 600m
  const masterPlotHierarchy = Cartesian3.fromDegreesArray([
    73.9825, 18.2315,
    73.9895, 18.2315,
    73.9895, 18.2375,
    73.9825, 18.2375,
  ]);

  // Main Central Demonstration Avenue (East-West connecting all plots)
  const mainRoadHierarchy = Cartesian3.fromDegreesArray([
    73.9825, 18.2338,
    73.9895, 18.2338,
    73.9895, 18.2342,
    73.9825, 18.2342,
  ]);

  // Cross Link Road (North-South connecting Heritage & Green Residency)
  const crossRoadHierarchy = Cartesian3.fromDegreesArray([
    73.9866, 18.2315,
    73.9870, 18.2315,
    73.9870, 18.2375,
    73.9866, 18.2375,
  ]);

  // Individual Cadastral Sub-Parcels
  const subParcels = [
    {
      id: 'PARCEL-9812',
      name: 'Cadastral Plot CTS-9812/2 (Tower A & B)',
      poly: [73.9850, 18.2340, 73.9868, 18.2340, 73.9868, 18.2355, 73.9850, 18.2355],
      color: '#0284c7',
    },
    {
      id: 'PARCEL-9814',
      name: 'Cadastral Plot CTS-9814/1 (Commerce Plaza)',
      poly: [73.9832, 18.2322, 73.9848, 18.2322, 73.9848, 18.2338, 73.9832, 18.2338],
      color: '#0891b2',
    },
    {
      id: 'PARCEL-9818',
      name: 'Cadastral Plot CTS-9818/A (Heritage Court)',
      poly: [73.9872, 18.2354, 73.9888, 18.2354, 73.9888, 18.2368, 73.9872, 18.2368],
      color: '#b45309',
    },
    {
      id: 'PARCEL-9820',
      name: 'Cadastral Plot CTS-9820/4 (Green Residency)',
      poly: [73.9864, 18.2344, 73.9878, 18.2344, 73.9878, 18.2358, 73.9864, 18.2358],
      color: '#15803d',
    },
  ];

  return (
    <>
      {/* 1. Master Demonstration Cadastral Base (Zone 4) */}
      <Entity
        name="Maharashtra Demo Cadastre Base"
        polygon={{
          hierarchy: masterPlotHierarchy,
          height: 0.0,
          extrudedHeight: 0.1,
          material: Color.fromCssColorString('#0b1329'),
          outline: true,
          outlineColor: Color.fromCssColorString('#1e3a8a').withAlpha(0.6),
          outlineWidth: 2,
        }}
      />

      {/* 2. Sub-Parcel Cadastral Plot Outlines */}
      {subParcels.map((p) => (
        <Entity
          key={p.id}
          name={p.name}
          polygon={{
            hierarchy: Cartesian3.fromDegreesArray(p.poly),
            height: 0.1,
            extrudedHeight: 0.2,
            material: Color.fromCssColorString('#1e293b'),
            outline: true,
            outlineColor: Color.fromCssColorString(p.color).withAlpha(0.85),
            outlineWidth: 3,
          }}
        />
      ))}

      {/* 3. Arterial Civic Roads */}
      <Entity
        name="18m Civic Demonstration Avenue"
        polygon={{
          hierarchy: mainRoadHierarchy,
          height: 0.2,
          extrudedHeight: 0.25,
          material: Color.fromCssColorString('#0f172a'),
          outline: true,
          outlineColor: Color.fromCssColorString('#38bdf8').withAlpha(0.5),
        }}
      />
      <Entity
        name="12m Connecting Arterial Road"
        polygon={{
          hierarchy: crossRoadHierarchy,
          height: 0.2,
          extrudedHeight: 0.25,
          material: Color.fromCssColorString('#0f172a'),
          outline: true,
          outlineColor: Color.fromCssColorString('#38bdf8').withAlpha(0.5),
        }}
      />

      {/* 4. Concrete Apron Pedestals Beneath Each Structure */}
      {BUILDINGS_REGISTRY.map((bld) => {
        const { longitude: bLon, latitude: bLat } = bld.coordinates;
        const cosLat = Math.cos((bLat * Math.PI) / 180);
        const padW = ((bld.footprintWidthM + 6.0) / 2) / (111320 * cosLat);
        const padL = ((bld.footprintLengthM + 6.0) / 2) / 110540;

        return (
          <Entity
            key={`apron-${bld.id}`}
            name={`${bld.name} Paved Pedestrian Apron`}
            polygon={{
              hierarchy: Cartesian3.fromDegreesArray([
                bLon - padW, bLat - padL,
                bLon + padW, bLat - padL,
                bLon + padW, bLat + padL,
                bLon - padW, bLat + padL,
              ]),
              height: 0.0,
              extrudedHeight: 0.15,
              material: Color.fromCssColorString('#334155'),
              outline: true,
              outlineColor: Color.fromCssColorString('#64748b'),
            }}
          />
        );
      })}
    </>
  );
}
import React from 'react';
import { Entity } from 'resium';
import { Cartesian3, Color } from 'cesium';
import { SITE_COORDINATES } from '../data/buildingData';

export default function ParcelLayer() {
  const { longitude: lon, latitude: lat } = SITE_COORDINATES;

  // Site Parcel Boundary: 120m x 120m plot
  const plotHierarchy = Cartesian3.fromDegreesArray([
    lon - 0.0006, lat - 0.0006,
    lon + 0.0006, lat - 0.0006,
    lon + 0.0006, lat + 0.0006,
    lon - 0.0006, lat + 0.0006,
  ]);

  // Main Access Road in front of the building
  const roadHierarchy = Cartesian3.fromDegreesArray([
    lon - 0.0006, lat - 0.00045,
    lon + 0.0006, lat - 0.00045,
    lon + 0.0006, lat - 0.00030,
    lon - 0.0006, lat - 0.00030,
  ]);

  // Paved Building Apron / Courtyard directly beneath the tower
  const apronHierarchy = Cartesian3.fromDegreesArray([
    lon - 0.00025, lat - 0.00025,
    lon + 0.00025, lat - 0.00025,
    lon + 0.00025, lat + 0.00025,
    lon - 0.00025, lat + 0.00025,
  ]);

  return (
    <>
      {/* 1. Cadastral Survey Base Bed (Plot CTS-9812/2A) */}
      <Entity
        name="Cadastral Parcel CTS-9812/2A"
        polygon={{
          hierarchy: plotHierarchy,
          height: -0.2,
          extrudedHeight: 0.0,
          material: Color.fromCssColorString('#1e293b'),
          outline: true,
          outlineColor: Color.fromCssColorString('#0284c7').withAlpha(0.8),
          outlineWidth: 3,
        }}
      />

      {/* 2. Concrete Apron / Building Base Pedestal */}
      <Entity
        name="Paved Pedestrian Plaza"
        polygon={{
          hierarchy: apronHierarchy,
          height: 0.0,
          extrudedHeight: 0.15,
          material: Color.fromCssColorString('#334155'),
          outline: true,
          outlineColor: Color.fromCssColorString('#64748b'),
        }}
      />

      {/* 3. Front Access Road */}
      <Entity
        name="18m Civic Access Road"
        polygon={{
          hierarchy: roadHierarchy,
          height: 0.01,
          extrudedHeight: 0.03,
          material: Color.fromCssColorString('#0f172a'),
          outline: true,
          outlineColor: Color.fromCssColorString('#e2e8f0').withAlpha(0.3),
        }}
      />
    </>
  );
}
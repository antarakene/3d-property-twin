import React, { useEffect } from 'react';
import { Viewer } from 'resium';
import {
  Ion,
  Cartesian3,
  Color,
  Math as CesiumMath,
  CameraEventType,
  HeadingPitchRange,
} from 'cesium';
import TowerA from './TowerA';
import BuildingModel from './BuildingModel';
import ParcelLayer from './ParcelLayer';
import EvacuationRoute from './EvacuationRoute';
import SurroundingBuildings from './SurroundingBuildings';
import { SITE_COORDINATES } from '../data/buildingData';

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

export default function CesiumViewer({
  floors,
  isExploded,
  explodeScale,
  activeFloorFilter,
  selectedFloor,
  selectedVsu,
  hoveredVsuId,
  transparencyMode,
  isEmergencyMode,
  isAuditMode,
  evacuationPath,
  showLabels,
  viewMode,
  onSelectFloor,
  onSelectVsu,
  onHoverVsu,
  viewerRef,
}) {
  const { longitude: lon, latitude: lat } = SITE_COORDINATES;

  useEffect(() => {
    if (!viewerRef.current?.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
    const scene = viewer.scene;

    // 1. COMPLETELY CANCEL THE EARTH & PLANETARY VISUALS
    scene.globe.show = false; // Completely removes the globe
    if (scene.skyBox) scene.skyBox.show = false;
    if (scene.sun) scene.sun.show = false;
    if (scene.moon) scene.moon.show = false;
    if (scene.skyAtmosphere) scene.skyAtmosphere.show = false;

    // Architectural Studio Background
    scene.backgroundColor = Color.fromCssColorString('#0b101b');

    // 2. CAD-STYLE ORBIT CONTROLS
    const controller = scene.screenSpaceCameraController;
    controller.minimumZoomDistance = 8.0;
    controller.maximumZoomDistance = 120.0; // Restrict zoom to building site
    controller.enableCollisionDetection = false;
    controller.tiltEventTypes = [CameraEventType.RIGHT_DRAG, CameraEventType.PINCH];
    controller.rotateEventTypes = [CameraEventType.LEFT_DRAG];

    // 3. AUTO-FOCUS DIRECTLY ON TOWER A AT EYE-LEVEL
    const targetBuildingCenter = Cartesian3.fromDegrees(lon, lat, 14.0);
    viewer.camera.lookAt(
      targetBuildingCenter,
      new HeadingPitchRange(CesiumMath.toRadians(35), CesiumMath.toRadians(-20), 65.0)
    );
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0b101b' }}>
      <Viewer
        ref={viewerRef}
        full
        animation={false}
        timeline={false}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        navigationHelpButton={false}
        sceneModePicker={false}
        selectionIndicator={false}
        infoBox={false}
      >
        {/* Cadastral Base & Access Roads */}
        <ParcelLayer />

        {/* Urban Context Around the Plot */}
        <SurroundingBuildings />

        {/* 3D SOS Evacuation Route */}
        <EvacuationRoute pathWaypoints={evacuationPath} isActive={isEmergencyMode} />

        {/* Building visual: imported photorealistic model OR interactive procedural tower */}
        {viewMode === 'model' ? (
          <BuildingModel
            floors={floors}
            selectedVsu={selectedVsu}
            hoveredVsuId={hoveredVsuId}
            transparencyMode={transparencyMode}
            isEmergencyMode={isEmergencyMode}
            isAuditMode={isAuditMode}
            showLabels={showLabels}
            onSelectVsu={onSelectVsu}
            onHoverVsu={onHoverVsu}
          />
        ) : (
          <TowerA
            coordinates={SITE_COORDINATES}
            floors={floors}
            isExploded={isExploded}
            explodeScale={explodeScale}
            activeFloorFilter={activeFloorFilter}
            selectedFloor={selectedFloor}
            selectedVsu={selectedVsu}
            hoveredVsuId={hoveredVsuId}
            transparencyMode={transparencyMode}
            isEmergencyMode={isEmergencyMode}
            isAuditMode={isAuditMode}
            showLabels={showLabels}
            onSelectFloor={onSelectFloor}
            onSelectVsu={onSelectVsu}
            onHoverVsu={onHoverVsu}
          />
        )}
      </Viewer>
    </div>
  );
}
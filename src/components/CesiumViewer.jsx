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
import BuildingTwin from './BuildingTwin';
import BuildingModel from './BuildingModel';
import ParcelLayer from './ParcelLayer';
import EvacuationRoute from './EvacuationRoute';
import SurroundingBuildings from './SurroundingBuildings';
import { BUILDINGS_REGISTRY, SITE_COORDINATES } from '../data/buildingData';

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

export default function CesiumViewer({
  activeBuilding = BUILDINGS_REGISTRY[0],
  allBuildings = BUILDINGS_REGISTRY,
  onSelectBuilding,
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
  const currentBuilding = activeBuilding || BUILDINGS_REGISTRY[0];
  const { longitude: lon, latitude: lat } = currentBuilding.coordinates || SITE_COORDINATES;

  // Initialize scene and camera orbit controls
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!viewerRef.current?.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
    const scene = viewer.scene;

    // 1. Cancel default earth visuals for architectural studio mode
    scene.globe.show = false;
    if (scene.skyBox) scene.skyBox.show = false;
    if (scene.sun) scene.sun.show = false;
    if (scene.moon) scene.moon.show = false;
    if (scene.skyAtmosphere) scene.skyAtmosphere.show = false;

    scene.backgroundColor = Color.fromCssColorString('#0b101b');

    // 2. CAD-style Orbit Controls
    const controller = scene.screenSpaceCameraController;
    controller.minimumZoomDistance = 8.0;
    controller.maximumZoomDistance = 180.0;
    controller.enableCollisionDetection = false;
    controller.tiltEventTypes = [CameraEventType.RIGHT_DRAG, CameraEventType.PINCH];
    controller.rotateEventTypes = [CameraEventType.LEFT_DRAG];
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smoothly center camera when active building or exploded state changes
  useEffect(() => {
    if (!viewerRef.current?.cesiumElement) return;
    const viewer = viewerRef.current.cesiumElement;
    const bHeight = currentBuilding.heightM || 30.0;
    const targetCenter = Cartesian3.fromDegrees(lon, lat, bHeight * 0.45);
    const cameraRange = Math.max(50.0, bHeight * 1.75 + (isExploded ? 20.0 : 0));

    viewer.camera.lookAt(
      targetCenter,
      new HeadingPitchRange(CesiumMath.toRadians(35), CesiumMath.toRadians(-22), cameraRange)
    );
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBuilding.id, lon, lat, currentBuilding.heightM, isExploded]);

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
        {/* Cadastral Base, Boundaries & Access Roads for all plots */}
        <ParcelLayer />

        {/* Distant Urban Skyline Context */}
        <SurroundingBuildings />

        {/* 3D SOS Evacuation Route */}
        <EvacuationRoute pathWaypoints={evacuationPath} isActive={isEmergencyMode} />

        {/* ACTIVE 3D TWIN */}
        {viewMode === 'model' && currentBuilding.code === 'TOWER-A' ? (
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
          <BuildingTwin
            building={currentBuilding}
            floors={floors}
            isFocusBuilding={true}
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

        {/* CONTEXTUAL TWINS (The other 4 structures in the demonstration zone) */}
        {allBuildings
          .filter((b) => b.id !== currentBuilding.id)
          .map((b) => (
            <BuildingTwin
              key={`context-${b.id}`}
              building={b}
              isFocusBuilding={false}
              onFocusBuilding={onSelectBuilding}
            />
          ))}
      </Viewer>
    </div>
  );
}
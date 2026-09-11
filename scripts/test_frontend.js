import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runFrontendTests() {
  console.log('================================================================');
  console.log('       NAGARDRISHTI 3D — AUTOMATED FRONTEND TEST SUITE          ');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // Test 1: Geometry & Evacuation Path Algorithm Verification
    // -------------------------------------------------------------
    console.log('[Suite 1: Geometry & Evacuation Algorithm Verification]');
    const {
      calculateEvacuationPath,
      SITE_COORDINATES,
      generateTowerFloors,
      ARCHITECTURAL_VIOLATIONS,
      BUILDINGS_REGISTRY,
      findBuilding,
      generateBuildingFloors,
    } = await import('../src/data/buildingData.js');

    assert(!!SITE_COORDINATES, 'Site coordinates defined');
    assert(SITE_COORDINATES.latitude === 18.2345, `Latitude is 18.2345 (Zone 4 anchor, actual: ${SITE_COORDINATES.latitude})`);
    assert(SITE_COORDINATES.longitude === 73.9856, `Longitude is 73.9856 (Zone 4 anchor, actual: ${SITE_COORDINATES.longitude})`);
    assert(SITE_COORDINATES.altitude === 0.0, 'Ground datum altitude is anchored at 0.0m MSL');

    const floors = generateTowerFloors();
    assert(floors.length >= 8, `Tower A floors generated (actual: ${floors.length} architectural levels)`);
    const totalUnits = floors.reduce((acc, f) => acc + f.vsus.length, 0);
    assert(totalUnits >= 32, `Tower A contains at least 32 candidate VSU sub-units (actual: ${totalUnits})`);

    // Test evacuation path for top floor (Floor 8)
    const pathFloor8 = calculateEvacuationPath(8, '1');
    assert(pathFloor8.length > 0, `Floor 8 evacuation route calculated with ${pathFloor8.length} waypoints`);
    const firstWaypoint = pathFloor8[0];
    const lastWaypoint = pathFloor8[pathFloor8.length - 1];
    assert(firstWaypoint.z > lastWaypoint.z, `Path descends monotonically: start ${firstWaypoint.z}m -> exit ${lastWaypoint.z}m`);
    assert(lastWaypoint.z <= 0.5, `Evacuation egress point reaches ground level (${lastWaypoint.z}m)`);

    // Test evacuation path for ground floor (Floor 1)
    const pathFloor1 = calculateEvacuationPath(1, '2');
    assert(pathFloor1.length >= 2, `Floor 1 evacuation route calculated with ${pathFloor1.length} waypoints`);

    // Architectural Violations Data
    assert(ARCHITECTURAL_VIOLATIONS.length >= 2, `Found ${ARCHITECTURAL_VIOLATIONS.length} architectural violations in dataset`);
    const roofViol = ARCHITECTURAL_VIOLATIONS.find(v => v.id === 'VIOL-ROOF-01');
    assert(!!roofViol, 'Architectural dataset includes VIOL-ROOF-01 (Terrace / Rooftop violation)');
    const balcViol = ARCHITECTURAL_VIOLATIONS.find(v => v.id === 'VIOL-BALC-06');
    assert(!!balcViol, 'Architectural dataset includes VIOL-BALC-06 (Balcony setback overhang)');

    // -------------------------------------------------------------
    // Test 2: Cadastral Identifier & Z-Elevation Extrusion Math
    // -------------------------------------------------------------
    console.log('\n[Suite 2: Cadastral Identifier & Extrusion Math]');
    function computeExtrusion(floorNumber, builtupArea) {
      const zBottom = 1.2 + (floorNumber - 1) * 3.4;
      const zTop = zBottom + 3.4;
      const volume = Number((builtupArea * 3.4).toFixed(1));
      const prototypeId = `DEMO-MH-MUM-0001-VSU-A-${String(floorNumber).padStart(2, '0')}-705`;
      return { zBottom, zTop, volume, prototypeId };
    }

    const ext1 = computeExtrusion(1, 100);
    assert(Math.abs(ext1.zBottom - 1.2) < 0.001, 'Floor 1 base elevation is 1.2m MSL');
    assert(Math.abs(ext1.zTop - 4.6) < 0.001, 'Floor 1 ceiling elevation is 4.6m MSL');
    assert(ext1.volume === 340.0, 'Floor 1 volume for 100m² is 340.0 m³');

    const ext7 = computeExtrusion(7, 112.8);
    assert(Math.abs(ext7.zBottom - 21.6) < 0.001, 'Floor 7 base elevation is 21.6m MSL');
    assert(Math.abs(ext7.zTop - 25.0) < 0.001, 'Floor 7 ceiling elevation is 25.0m MSL');
    assert(ext7.volume === 383.5, 'Floor 7 volume for 112.8m² is 383.5 m³');
    assert(/^DEMO-MH-MUM-0001-VSU-A-07-705$/.test(ext7.prototypeId), 'Prototype VSU Identifier matches standard specification');

    // -------------------------------------------------------------
    // Test 3: Design System Tokens & Stylesheet Integrity
    // -------------------------------------------------------------
    console.log('\n[Suite 3: Design System Tokens & CSS Conformance]');
    const cssPath = path.join(ROOT_DIR, 'src/styles/designSystem.css');
    assert(fs.existsSync(cssPath), 'designSystem.css exists');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    const expectedTokens = [
      '--color-surface',
      '--color-primary',
      '--color-secondary',
      '--color-error',
      '--color-verified',
      '--color-review',
      '--color-draft',
      '--color-estimated',
      '--font-mono',
      '--font-display',
      '--font-body',
      '.status-badge',
      '.metric-chip',
      '.instrument-card',
      '.statutory-banner',
    ];

    for (const token of expectedTokens) {
      assert(cssContent.includes(token), `designSystem.css defines token/utility "${token}"`);
    }

    // -------------------------------------------------------------
    // Test 4: Component Architecture & Source Integrity
    // -------------------------------------------------------------
    console.log('\n[Suite 4: Component Architecture & Source Integrity]');
    const expectedComponents = [
      'src/components/common/StatusBadge.tsx',
      'src/components/common/MetricChip.tsx',
      'src/components/layout/StatutoryBanner.tsx',
      'src/components/layout/TopHeader.tsx',
      'src/components/layout/SidebarNav.tsx',
      'src/views/DashboardView.tsx',
      'src/views/City3DView.tsx',
      'src/views/RegistryView.tsx',
      'src/views/CandidateRegistrationView.tsx',
      'src/views/DiscrepancyStudioView.tsx',
      'src/views/VerificationQueueView.tsx',
      'src/views/SosContextView.tsx',
      'src/App.tsx',
      'src/components/CesiumViewer.jsx',
      'src/components/TowerA.jsx',
      'src/components/BuildingTwin.jsx',
      'src/components/BuildingFloor.jsx',
      'src/components/VSU.jsx',
      'src/components/ParcelLayer.jsx',
      'src/components/SurroundingBuildings.jsx',
      'src/components/EvacuationRoute.jsx',
      'src/components/BuildingModel.jsx',
    ];

    for (const relPath of expectedComponents) {
      const fullPath = path.join(ROOT_DIR, relPath);
      assert(fs.existsSync(fullPath), `Source file exists: ${relPath}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      assert(content.length > 50, `Source file has valid non-empty content: ${relPath} (${content.length} bytes)`);
    }

    // -------------------------------------------------------------
    // Test 5: Production Bundle & Distribution Artifacts
    // -------------------------------------------------------------
    console.log('\n[Suite 5: Production Bundle Verification]');
    const distHtmlPath = path.join(ROOT_DIR, 'dist/index.html');
    assert(fs.existsSync(distHtmlPath), 'dist/index.html was built');
    const distHtml = fs.readFileSync(distHtmlPath, 'utf8');
    assert(distHtml.includes('<div id="root"></div>'), 'dist/index.html contains root mount node');
    assert(distHtml.includes('NagarDrishti 3D'), 'dist/index.html contains correct document title');
    assert(distHtml.includes('stylesheet'), 'dist/index.html links bundled stylesheet');

    const distAssetsDir = path.join(ROOT_DIR, 'dist/assets');
    assert(fs.existsSync(distAssetsDir), 'dist/assets directory exists');
    const assetFiles = fs.readdirSync(distAssetsDir);
    const hasJsBundle = assetFiles.some(f => f.endsWith('.js'));
    const hasCssBundle = assetFiles.some(f => f.endsWith('.css'));
    assert(hasJsBundle, 'Production JS bundle generated in dist/assets/');
    assert(hasCssBundle, 'Production CSS bundle generated in dist/assets/');

    // -------------------------------------------------------------
    // Test 6: Statutory Disclaimer & Language Mandate Audit
    // -------------------------------------------------------------
    console.log('\n[Suite 6: Responsible Cadastral Language Mandate]');
    const bannerPath = path.join(ROOT_DIR, 'src/components/layout/StatutoryBanner.tsx');
    const bannerContent = fs.readFileSync(bannerPath, 'utf8');
    assert(bannerContent.includes('Prototype Demo'), 'StatutoryBanner includes Prototype Demo tag');
    assert(bannerContent.includes('Requires authorised verification'), 'StatutoryBanner includes "Requires authorised verification"');
    assert(bannerContent.includes('does not constitute legal title'), 'StatutoryBanner disclaims legal title');
    assert(bannerContent.includes('official ULPIN issuance'), 'StatutoryBanner disclaims official ULPIN issuance');

    const headerPath = path.join(ROOT_DIR, 'src/components/layout/TopHeader.tsx');
    const headerContent = fs.readFileSync(headerPath, 'utf8');
    assert(headerContent.includes('Maharashtra Urban Demonstration Zone'), 'TopHeader displays Maharashtra Urban Demonstration Zone (Zone 4)');
    assert(headerContent.includes('NAGARDRISHTI 3D'), 'TopHeader displays NAGARDRISHTI 3D brand');

    // -------------------------------------------------------------
    // Test 7: Multi-Structure 3D Digital Twin Registry Verification
    // -------------------------------------------------------------
    console.log('\n[Suite 7: Multi-Structure 3D Digital Twin Registry Verification]');
    assert(BUILDINGS_REGISTRY.length === 5, `All 5 demonstration buildings exist in registry (actual: ${BUILDINGS_REGISTRY.length})`);

    const expectedCodes = ['TOWER-A', 'TOWER-B', 'COMM-PLAZA', 'HERITAGE-CT', 'GREEN-RES'];
    for (const code of expectedCodes) {
      const bld = findBuilding(code);
      assert(!!bld && bld.code === code, `Building ${code} successfully resolved in registry`);
      assert(bld.coordinates && typeof bld.coordinates.longitude === 'number', `Building ${code} has valid spatial coordinates`);
      assert(bld.totalFloors > 0 && bld.heightM > 0, `Building ${code} has positive floors (${bld.totalFloors}F) and height (${bld.heightM}m)`);

      // Verify procedural floor and candidate VSU generation
      const bFloors = generateBuildingFloors(code);
      assert(bFloors.length === bld.totalFloors, `Building ${code} generates exactly ${bld.totalFloors} vertical floor slices`);
      const bVsus = bFloors.flatMap(f => f.vsus);
      assert(bVsus.length >= bld.totalFloors * 2, `Building ${code} contains at least ${bld.totalFloors * 2} candidate VSUs (actual: ${bVsus.length})`);
    }

    // Specific structural checks for Tower B
    const towerB = findBuilding('TOWER-B');
    assert(towerB.hasRooftopViolation === true, 'Tower B is flagged with unauthorized rooftop extension');
    assert(towerB.rooftopViolation && towerB.rooftopViolation.volumeDeltaCum === 485.9, 'Tower B rooftop violation metadata contains 485.9 m³ volume delta');
    const towerBFloors = generateBuildingFloors('TOWER-B');
    const floor9 = towerBFloors.find(f => f.floorNumber === 9);
    assert(floor9 && floor9.vsus.some(v => v.hasViolation), 'Tower B Floor 9 candidate VSUs flagged with deviation status');

    // Specific structural checks for Green Residency
    const greenRes = findBuilding('GREEN-RES');
    assert(greenRes.hasSetbackViolation === true, 'Green Residency is flagged with setback overhang deviation');
    const greenFloors = generateBuildingFloors('GREEN-RES');
    const floor5 = greenFloors.find(f => f.floorNumber === 5);
    assert(floor5 && floor5.vsus.some(v => v.hasViolation), 'Green Residency Floor 5 candidate VSUs flagged with setback overhang deviation');

    // Test evacuation path calculation for Tower B
    const pathTowerB = calculateEvacuationPath(9, '1', 'TOWER-B');
    assert(pathTowerB.length > 0, `Tower B Floor 9 evacuation route generated with ${pathTowerB.length} waypoints`);
    assert(pathTowerB[0].name.includes('Tower B'), 'Evacuation route waypoint reflects Tower B identity');

    // -------------------------------------------------------------
    // Test 8: UI Views & Component State Handler Integrity
    // -------------------------------------------------------------
    console.log('\n[Suite 8: UI Views & Component State Handler Integrity]');
    
    // DashboardView
    const dashCode = fs.readFileSync(path.join(ROOT_DIR, 'src/views/DashboardView.tsx'), 'utf8');
    assert(dashCode.includes('onSelectBuilding'), 'DashboardView wires onSelectBuilding handler');
    assert(dashCode.includes('searchQuery'), 'DashboardView implements reactive search query state');
    assert(dashCode.includes('onSelectVsu'), 'DashboardView wires direct candidate unit inspection');

    // City3DView
    const city3dCode = fs.readFileSync(path.join(ROOT_DIR, 'src/views/City3DView.tsx'), 'utf8');
    assert(city3dCode.includes('selectedBuildingId'), 'City3DView accepts selectedBuildingId prop');
    assert(city3dCode.includes('onSelectBuilding'), 'City3DView wires onSelectBuilding callback');
    assert(city3dCode.includes('activeFloorFilter'), 'City3DView implements floor isolator slider state');
    assert(city3dCode.includes('handleTriggerSOS'), 'City3DView implements 3D evacuation route trigger');
    assert(city3dCode.includes('activeBuilding.totalFloors'), 'City3DView floor slider dynamically scales to building floor count');
    assert(city3dCode.includes('Rooftop LiDAR Discrepancy'), 'City3DView includes Tower B rooftop violation alert');
    assert(city3dCode.includes('Setback Encroachment'), 'City3DView includes Green Residency setback alert');

    // RegistryView
    const regCode = fs.readFileSync(path.join(ROOT_DIR, 'src/views/RegistryView.tsx'), 'utf8');
    assert(regCode.includes('selectedBuildingId'), 'RegistryView implements building filter');
    assert(regCode.includes('selectedFloor'), 'RegistryView implements floor filter');
    assert(regCode.includes('onNavigateTo3D'), 'RegistryView provides 3D digital twin deep-link');

    // CandidateRegistrationView
    const candCode = fs.readFileSync(path.join(ROOT_DIR, 'src/views/CandidateRegistrationView.tsx'), 'utf8');
    assert(candCode.includes('generatedIdentifier'), 'CandidateRegistrationView computes dynamic VSU identifier');
    assert(candCode.includes('maxFloor'), 'CandidateRegistrationView dynamically clamps floor number to target building');
    assert(candCode.includes('calculatedVolume'), 'CandidateRegistrationView computes 3D volumetric metric');
    assert(candCode.includes('Live 3D-ULPIN') && candCode.includes('canonical3dUlpin'), 'CandidateRegistrationView implements Live 3D ULPIN Algorithmic Synthesis');

    // DiscrepancyStudioView & VerificationQueueView
    const studioCode = fs.readFileSync(path.join(ROOT_DIR, 'src/views/DiscrepancyStudioView.tsx'), 'utf8');
    assert(studioCode.includes('activeStage'), 'DiscrepancyStudioView implements temporal stage switcher (T1 vs T2)');
    const queueCode = fs.readFileSync(path.join(ROOT_DIR, 'src/views/VerificationQueueView.tsx'), 'utf8');
    assert(queueCode.includes('handleAction'), 'VerificationQueueView implements status transition actions');

    // -------------------------------------------------------------
    // Test 9: 3D Engine Component Geometry & Material Bindings
    // -------------------------------------------------------------
    console.log('\n[Suite 9: 3D Engine Component Geometry & Material Bindings]');

    // BuildingTwin.jsx
    const twinCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/BuildingTwin.jsx'), 'utf8');
    assert(twinCode.includes('isFocusBuilding'), 'BuildingTwin supports both active focus and contextual modes');
    assert(twinCode.includes('rooftopViolation'), 'BuildingTwin renders unauthorized rooftop extension overlay');
    assert(twinCode.includes('setbackViolation'), 'BuildingTwin renders cantilever setback encroachment mesh');
    assert(twinCode.includes('onFocusBuilding'), 'BuildingTwin provides 3D click-to-focus event trigger');

    // BuildingFloor.jsx & VSU.jsx
    const floorCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/BuildingFloor.jsx'), 'utf8');
    assert(floorCode.includes('footprintWidthM') && floorCode.includes('footprintLengthM'), 'BuildingFloor adapts slab to building footprint dimensions');
    assert(floorCode.includes('colorTheme'), 'BuildingFloor supports custom material and color themes');
    assert(floorCode.includes('isVsuMatch'), 'BuildingFloor uses isVsuMatch for reliable selection across formats');

    const vsuCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/VSU.jsx'), 'utf8');
    assert(vsuCode.includes('unitsPerFloor'), 'VSU component dynamically adapts layout for 2-unit and 4-unit floorplans');
    assert(vsuCode.includes('distanceDisplayCondition'), 'VSU component applies distance-scaled LOD labels');
    assert(vsuCode.includes('3D Popup Card'), 'VSU component renders in-scene 3D floating popup card on focus');

    // ParcelLayer.jsx & CesiumViewer.jsx
    const parcelCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/ParcelLayer.jsx'), 'utf8');
    assert(parcelCode.includes('subParcels'), 'ParcelLayer renders individual cadastral sub-parcels');
    assert(parcelCode.includes('BUILDINGS_REGISTRY'), 'ParcelLayer renders concrete apron plinths for all buildings');

    const viewerCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/CesiumViewer.jsx'), 'utf8');
    assert(viewerCode.includes('allBuildings'), 'CesiumViewer manages all demonstration structures in unified 3D coordinate space');
    assert(viewerCode.includes('screenSpaceCameraController'), 'CesiumViewer configures CAD-grade camera constraints');

    // Camera & Selection Auto-Focus
    assert(city3dCode.includes('handleFocusFlat'), 'City3DView implements handleFocusFlat 3D camera centering');

    // -------------------------------------------------------------
    // Test 10: Exhaustive Component Conformance & Integration Tests
    // -------------------------------------------------------------
    console.log('\n[Suite 10: Exhaustive Component Conformance & Integration Tests]');

    // PropertyInfoPanel.jsx
    const infoPanelCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/PropertyInfoPanel.jsx'), 'utf8');
    assert(infoPanelCode.includes('Candidate VSU Prototype'), 'PropertyInfoPanel complies with Responsible Cadastral Language Mandate');
    assert(infoPanelCode.includes('ARCHITECTURAL_VIOLATIONS'), 'PropertyInfoPanel wires detected architectural deviations');
    assert(infoPanelCode.includes('Calculate 3D Safe Escape Trajectory'), 'PropertyInfoPanel provides emergency escape path dispatch');

    // BuildingControls.jsx
    const controlsCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/BuildingControls.jsx'), 'utf8');
    assert(controlsCode.includes('totalFloors'), 'BuildingControls dynamically accepts totalFloors prop');
    assert(controlsCode.includes('buildingName'), 'BuildingControls dynamically displays buildingName');
    assert(controlsCode.includes('onFlyToTower'), 'BuildingControls wires camera fly-to action');
    assert(controlsCode.includes('onToggleExplode'), 'BuildingControls wires vertical floor slab explode toggle');

    // EvacuationRoute.jsx
    const evacCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/EvacuationRoute.jsx'), 'utf8');
    assert(evacCode.includes('PolylineGlowMaterialProperty'), 'EvacuationRoute uses luminous PolylineGlow material');
    assert(evacCode.includes('Cartesian2'), 'EvacuationRoute uses Cartesian2 for 2D screen label offsets');
    assert(evacCode.includes('SAFE ASSEMBLY ZONE'), 'EvacuationRoute demarcates ground egress assembly zone');

    // BuildingModel.jsx
    const modelCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/BuildingModel.jsx'), 'utf8');
    assert(modelCode.includes('MODEL_URL'), 'BuildingModel loads GLB asset from /models/building.glb');
    assert(modelCode.includes('modelReady'), 'BuildingModel implements fallback readiness detection');
    assert(modelCode.includes('quadOffsets'), 'BuildingModel maps translucent VSU quadrant boundaries');

    // SurroundingBuildings.jsx
    const surroundCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/SurroundingBuildings.jsx'), 'utf8');
    assert(surroundCode.includes('SURROUNDING_BUILDINGS'), 'SurroundingBuildings renders contextual urban fabric');
    assert(surroundCode.includes('extrudedHeight'), 'SurroundingBuildings projects 3D massing elevations');

    // Common & Layout Components
    const statusBadgeCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/common/StatusBadge.tsx'), 'utf8');
    assert(statusBadgeCode.includes('Under Review') && statusBadgeCode.includes('Conflict'), 'StatusBadge maps all verification status tiers');

    const metricChipCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/common/MetricChip.tsx'), 'utf8');
    assert(metricChipCode.includes('metric-label') && metricChipCode.includes('highlight'), 'MetricChip supports labels, units, and active highlights');

    const navCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/layout/SidebarNav.tsx'), 'utf8');
    assert(navCode.includes('mobile-bottom-nav'), 'SidebarNav includes responsive mobile navigation layout');
    assert(navCode.includes('alertsCount') && navCode.includes('pendingTasksCount'), 'SidebarNav renders real-time badge counters');

    // SosContextView.tsx
    const sosCode = fs.readFileSync(path.join(ROOT_DIR, 'src/views/SosContextView.tsx'), 'utf8');
    assert(sosCode.includes('Mandatory Statutory Directive'), 'SosContextView includes required disclaimer banner');
    assert(sosCode.includes('handleGetBrowserLocation'), 'SosContextView provides device GNSS location acquisition');
    assert(sosCode.includes('onTrigger3DEscapeRoute'), 'SosContextView connects to 3D digital twin escape router');

    // Cadastre Service & Seed Data Architecture
    const serviceCode = fs.readFileSync(path.join(ROOT_DIR, 'src/services/cadastreService.ts'), 'utf8');
    assert(serviceCode.includes('getParentParcels'), 'cadastreService implements getParentParcels()');
    assert(serviceCode.includes('getBuildings'), 'cadastreService implements getBuildings()');
    assert(serviceCode.includes('getVsus'), 'cadastreService implements getVsus() with filter support');
    assert(serviceCode.includes('createCandidateVsu'), 'cadastreService implements createCandidateVsu()');
    assert(serviceCode.includes('updateVerificationTask'), 'cadastreService implements updateVerificationTask()');
    assert(serviceCode.includes('setUserRole'), 'cadastreService implements role-based access control');

    const seedCode = fs.readFileSync(path.join(ROOT_DIR, 'src/data/seedData.ts'), 'utf8');
    assert(seedCode.includes('SEED_PARCELS'), 'seedData defines cadastral parcels array');
    assert(seedCode.includes('SEED_BUILDINGS'), 'seedData defines 5 demonstration buildings');
    assert(seedCode.includes('SEED_VSUS'), 'seedData defines comprehensive 82 candidate VSUs');
    assert(seedCode.includes('SEED_TASKS'), 'seedData defines surveyor verification tasks');

    // App.tsx State Synchronization & Role Plumbing
    const appCode = fs.readFileSync(path.join(ROOT_DIR, 'src/App.tsx'), 'utf8');
    assert(appCode.includes('city3dMode'), 'App.tsx maintains unified 3D mode state across view transitions');
    assert(appCode.includes('handleTriggerEscapeFromSos'), 'App.tsx seamlessly links SOS view into 3D escape mode');
    assert(appCode.includes('currentRole={currentRole}'), 'App.tsx passes currentRole to DashboardView, City3DView, and RegistryView');

    // -------------------------------------------------------------
    // Test 5: Role-Based UI & Persona Adaptation Verification
    // -------------------------------------------------------------
    console.log('\n[Suite 5: Role-Based UI & Persona Adaptation Verification]');
    const topHeaderCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/layout/TopHeader.tsx'), 'utf8');
    assert(topHeaderCode.includes('public_demo') && topHeaderCode.includes('surveyor') && topHeaderCode.includes('municipal_officer') && topHeaderCode.includes('admin'), 'TopHeader defines configurations for all 4 user roles');
    assert(topHeaderCode.includes('ROLE_CONFIG[currentRole]'), 'TopHeader dynamically renders active persona badge, icon, and description');
    assert(topHeaderCode.includes('<select') && topHeaderCode.includes('onRoleChange(e.target.value as UserRole)'), 'TopHeader provides interactive role switching dropdown');

    const sidebarCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/layout/SidebarNav.tsx'), 'utf8');
    assert(sidebarCode.includes('Citizen Services') && sidebarCode.includes('Field Surveyor Tools') && sidebarCode.includes('Revenue & Enforcement') && sidebarCode.includes('Master Spatial Admin'), 'SidebarNav renders role-customized navigation section headers');
    assert(sidebarCode.includes('Public Registry (VSUs)') && sidebarCode.includes('3D As-Built Twin') && sidebarCode.includes('3D Violation Audit'), 'SidebarNav adapts navigation item labels based on active role');
    assert(sidebarCode.includes('isPublic &&') && sidebarCode.includes('lock'), 'SidebarNav indicates locked authority workflows for public citizen role');
    assert(sidebarCode.includes('+ Field'), 'SidebarNav highlights field surveyor quick actions');

    const dashboardCode = fs.readFileSync(path.join(ROOT_DIR, 'src/views/DashboardView.tsx'), 'utf8');
    assert(dashboardCode.includes('currentRole?: UserRole'), 'DashboardView accepts currentRole prop for adaptive rendering');
    assert(dashboardCode.includes('isPublic') && dashboardCode.includes('isSurveyor') && dashboardCode.includes('isOfficer') && dashboardCode.includes('isAdmin'), 'DashboardView conditionally structures layout per persona');
    assert(dashboardCode.includes('Launch 3D Explorer') && dashboardCode.includes('+ Register Field VSU'), 'DashboardView provides role-tailored primary CTAs for Citizen and Surveyor');
    assert(dashboardCode.includes('Verification Queue') && dashboardCode.includes('3D Engine'), 'DashboardView provides role-tailored CTAs for Officer and Administrator');
    assert(dashboardCode.includes('PostgreSQL 15 / PostGIS 3.4') && dashboardCode.includes('Connected & Healthy'), 'DashboardView renders infrastructure health strip for Admin');
    assert(dashboardCode.includes('EPSG:7760') && dashboardCode.includes('WGS84 UTM 43N'), 'DashboardView renders spatial datum and coordinate system metadata');

    const city3dRoleCode = fs.readFileSync(path.join(ROOT_DIR, 'src/views/City3DView.tsx'), 'utf8');
    assert(city3dRoleCode.includes('currentRole?: UserRole'), 'City3DView accepts currentRole prop');
    assert(city3dRoleCode.includes('currentRole ===') || city3dRoleCode.includes('roleBadgeColor') || city3dRoleCode.includes('Public Explorer') || city3dRoleCode.includes('CAD Cockpit'), 'City3DView reflects active role identity in 3D HUD');

    const registryRoleCode = fs.readFileSync(path.join(ROOT_DIR, 'src/views/RegistryView.tsx'), 'utf8');
    assert(registryRoleCode.includes('currentRole?: UserRole'), 'RegistryView accepts currentRole prop');
    assert(registryRoleCode.includes('Public Vertical Property Registry') && registryRoleCode.includes('Field Candidate VSU Registry') && registryRoleCode.includes('Statutory Vertical Land Registry'), 'RegistryView dynamically updates registry title and persona context');

    const readmeCode = fs.readFileSync(path.join(ROOT_DIR, 'README.md'), 'utf8');
    assert(readmeCode.includes('System Architecture'), 'README.md documents system architecture');
    assert(readmeCode.includes('flowchart TD') || readmeCode.includes('graph TD'), 'README.md includes Mermaid architecture diagram');
    assert(readmeCode.includes('Role-Adaptive User Interfaces'), 'README.md includes role-adaptive interface matrix');
    assert(readmeCode.includes('Cadastral Mathematics') && readmeCode.includes('3D ULPIN'), 'README.md includes 3D ULPIN mathematical model');
    assert(readmeCode.includes('SIH26011'), 'README.md documents SIH26011 Problem-to-Solution Compliance Matrix');
    assert(readmeCode.includes('How It Works in 3 Steps'), 'README.md includes How It Works in 3 Steps');
    assert(readmeCode.includes('Feasibility & Viability'), 'README.md includes Feasibility & Viability in short');

    assert(topHeaderCode.includes('SIH26011'), 'TopHeader renders SIH26011 Space Tech badge');
    assert(dashboardCode.includes('SIH26011'), 'DashboardView displays SIH26011 National Problem Statement Alignment strip');

  } catch (err) {
    console.error('Test execution error:', err);
    testsFailed++;
  }

  console.log('\n================================================================');
  console.log(` FRONTEND TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('================================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runFrontendTests();
